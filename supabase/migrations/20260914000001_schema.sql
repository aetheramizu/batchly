-- Batchly foundation schema.
-- Source of truth: docs/DATA_MODEL.md
--
-- Tables: sources, batches, purchases, additional_costs.
-- The optional `profiles` table is intentionally omitted (DATA_MODEL §4):
-- the MVP needs nothing beyond Supabase Auth identities.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.source_type as enum ('GROUP_ORDER', 'DIRECT_SELLER');

create type public.country as enum (
  'CHINA',
  'KOREA',
  'JAPAN',
  'THAILAND',
  'SINGAPORE',
  'INDONESIA'
);

create type public.tracking_status as enum (
  'PURCHASED',
  'WAREHOUSE',
  'IN_TRANSIT',
  'INDONESIA',
  'ADMIN_RECEIVED',
  'DELIVERED'
);

create type public.purchase_origin as enum ('NEW', 'TAKEN_OS');

create type public.ownership_status as enum ('ACTIVE', 'GIVEN_OS');

create type public.additional_cost_type as enum (
  'TAX',
  'PACKING',
  'DOMESTIC_SHIPPING',
  'OTHER'
);

-- ---------------------------------------------------------------------------
-- Shared trigger: updated_at
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- sources
-- ---------------------------------------------------------------------------

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  type public.source_type not null,
  platform text not null check (length(trim(platform)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Target for composite foreign keys that prevent cross-user references.
  unique (id, user_id)
);

create index sources_user_id_idx on public.sources (user_id);

create trigger sources_set_updated_at
  before update on public.sources
  for each row execute function public.set_updated_at();

-- A source's type must not change once batches or purchases depend on it,
-- otherwise existing rows would silently violate the GO / Direct Seller rules.
create function public.prevent_used_source_type_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.type is distinct from old.type
     and (
       exists (select 1 from public.batches b where b.source_id = old.id)
       or exists (select 1 from public.purchases p where p.source_id = old.id)
     )
  then
    raise exception 'Source type cannot be changed while it has batches or purchases'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- batches (Group Order only)
-- ---------------------------------------------------------------------------

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source_id uuid not null,
  country public.country not null,
  batch_number text not null check (length(trim(batch_number)) > 0),
  batch_date date not null,
  status public.tracking_status not null default 'PURCHASED',
  last_updated_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Batch number is only unique within the same user/source/country context.
  unique (user_id, source_id, country, batch_number),

  -- Target for the purchases composite foreign key.
  unique (id, source_id, user_id),

  -- Batch must reference a source owned by the same user.
  foreign key (source_id, user_id) references public.sources (id, user_id)
);

create index batches_user_id_idx on public.batches (user_id);
create index batches_source_id_idx on public.batches (source_id);
create index batches_status_idx on public.batches (status);
create index batches_last_updated_at_idx on public.batches (last_updated_at);

create trigger batches_set_updated_at
  before update on public.batches
  for each row execute function public.set_updated_at();

-- A batch may only belong to a GROUP_ORDER source (DATA_MODEL §7, §41).
create function public.enforce_batch_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_source_type public.source_type;
begin
  select s.type into v_source_type
  from public.sources s
  where s.id = new.source_id and s.user_id = new.user_id;

  if v_source_type is null then
    raise exception 'Batch source not found'
      using errcode = 'foreign_key_violation';
  end if;

  if v_source_type <> 'GROUP_ORDER' then
    raise exception 'Batches can only belong to Group Order sources'
      using errcode = 'check_violation';
  end if;

  -- last_updated_at tracks tracking-status changes only (DATA_MODEL §13).
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    new.last_updated_at = now();
  end if;

  return new;
end;
$$;

create trigger batches_enforce_rules
  before insert or update on public.batches
  for each row execute function public.enforce_batch_rules();

-- ---------------------------------------------------------------------------
-- purchases
-- ---------------------------------------------------------------------------

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source_id uuid not null,
  batch_id uuid,
  country public.country,
  item_name text not null check (length(trim(item_name)) > 0),
  artist_group text,
  price numeric(14, 2) not null,
  paid_amount numeric(14, 2) not null default 0,
  purchase_date date not null,
  purchase_origin public.purchase_origin not null default 'NEW',
  ownership_status public.ownership_status not null default 'ACTIVE',
  tracking_status public.tracking_status,
  last_updated_at timestamptz,
  image_url text,
  notes text,
  os_price numeric(14, 2),
  os_paid_amount numeric(14, 2),
  os_date date,
  os_notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Target for the additional_costs composite foreign key.
  unique (id, user_id),

  -- Source must be owned by the same user.
  foreign key (source_id, user_id) references public.sources (id, user_id),

  -- Batch (when present) must be owned by the same user AND belong to the
  -- purchase's source. MATCH SIMPLE skips the check when batch_id is null.
  foreign key (batch_id, source_id, user_id)
    references public.batches (id, source_id, user_id),

  -- Payment: 0 <= paid_amount <= price (DATA_MODEL §15, §40).
  constraint purchases_price_non_negative check (price >= 0),
  constraint purchases_paid_amount_range check (paid_amount >= 0 and paid_amount <= price),

  -- OS payment: only applies when OS fields are populated (DATA_MODEL §20, §40).
  constraint purchases_os_price_non_negative check (os_price is null or os_price >= 0),
  constraint purchases_os_paid_amount_range check (
    os_paid_amount is null
    or (os_price is not null and os_paid_amount >= 0 and os_paid_amount <= os_price)
  ),

  -- Structure (DATA_MODEL §10, §29):
  --   Group Order:   batch_id set,  country/tracking_status/last_updated_at null
  --   Direct Seller: batch_id null, country/tracking_status/last_updated_at set
  -- The source.type side of this rule is enforced by trigger below.
  constraint purchases_structure check (
    (
      batch_id is not null
      and country is null
      and tracking_status is null
      and last_updated_at is null
    )
    or (
      batch_id is null
      and country is not null
      and tracking_status is not null
      and last_updated_at is not null
    )
  )
);

create index purchases_user_id_idx on public.purchases (user_id);
create index purchases_source_id_idx on public.purchases (source_id);
create index purchases_batch_id_idx on public.purchases (batch_id);
create index purchases_country_idx on public.purchases (country);
create index purchases_purchase_date_idx on public.purchases (purchase_date);
create index purchases_ownership_status_idx on public.purchases (ownership_status);
create index purchases_purchase_origin_idx on public.purchases (purchase_origin);

create trigger purchases_set_updated_at
  before update on public.purchases
  for each row execute function public.set_updated_at();

-- Purchase structure must match the source type (DATA_MODEL §41), and
-- Direct Seller last_updated_at follows tracking-status changes (§13).
create function public.enforce_purchase_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_source_type public.source_type;
begin
  select s.type into v_source_type
  from public.sources s
  where s.id = new.source_id and s.user_id = new.user_id;

  if v_source_type is null then
    raise exception 'Purchase source not found'
      using errcode = 'foreign_key_violation';
  end if;

  if v_source_type = 'GROUP_ORDER' and new.batch_id is null then
    raise exception 'Group Order purchases require a batch'
      using errcode = 'check_violation';
  end if;

  if v_source_type = 'DIRECT_SELLER' and new.batch_id is not null then
    raise exception 'Direct Seller purchases cannot have a batch'
      using errcode = 'check_violation';
  end if;

  if new.tracking_status is not null then
    if tg_op = 'INSERT' and new.last_updated_at is null then
      new.last_updated_at = now();
    elsif tg_op = 'UPDATE' and new.tracking_status is distinct from old.tracking_status then
      new.last_updated_at = now();
    end if;
  end if;

  return new;
end;
$$;

create trigger purchases_enforce_rules
  before insert or update on public.purchases
  for each row execute function public.enforce_purchase_rules();

-- Defined after batches/purchases exist because the function body references them.
create trigger sources_prevent_used_type_change
  before update on public.sources
  for each row execute function public.prevent_used_source_type_change();

-- ---------------------------------------------------------------------------
-- additional_costs
-- ---------------------------------------------------------------------------

create table public.additional_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  purchase_id uuid not null,
  type public.additional_cost_type not null,
  amount numeric(14, 2) not null check (amount >= 0),
  paid boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Purchase must be owned by the same user.
  foreign key (purchase_id, user_id) references public.purchases (id, user_id)
);

create index additional_costs_user_id_idx on public.additional_costs (user_id);
create index additional_costs_purchase_id_idx on public.additional_costs (purchase_id);

create trigger additional_costs_set_updated_at
  before update on public.additional_costs
  for each row execute function public.set_updated_at();
