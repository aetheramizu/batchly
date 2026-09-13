-- Row Level Security for all user-owned tables.
-- Source of truth: docs/DATA_MODEL.md §30–31, CLAUDE.md §20
--
-- Each policy scopes access to rows where user_id = auth.uid().
-- Cross-user references (e.g. my purchase -> another user's batch) are
-- additionally blocked by the composite (id, user_id) foreign keys in the
-- schema migration, because foreign-key checks bypass RLS.
--
-- Purchases intentionally have no DELETE policy: removal is a soft archive
-- via archived_at (DATA_MODEL §27), so purchase history cannot be hard-deleted
-- from the client.

alter table public.sources enable row level security;
alter table public.batches enable row level security;
alter table public.purchases enable row level security;
alter table public.additional_costs enable row level security;

-- ---------------------------------------------------------------------------
-- sources
-- ---------------------------------------------------------------------------

create policy "Users can view their own sources"
  on public.sources for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own sources"
  on public.sources for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own sources"
  on public.sources for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own sources"
  on public.sources for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- batches
-- ---------------------------------------------------------------------------

create policy "Users can view their own batches"
  on public.batches for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own batches"
  on public.batches for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own batches"
  on public.batches for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own batches"
  on public.batches for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- purchases
-- ---------------------------------------------------------------------------

create policy "Users can view their own purchases"
  on public.purchases for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own purchases"
  on public.purchases for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own purchases"
  on public.purchases for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- additional_costs
-- ---------------------------------------------------------------------------

create policy "Users can view their own additional costs"
  on public.additional_costs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own additional costs"
  on public.additional_costs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own additional costs"
  on public.additional_costs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own additional costs"
  on public.additional_costs for delete
  to authenticated
  using ((select auth.uid()) = user_id);
