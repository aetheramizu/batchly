-- Explicit table privileges for the Supabase API roles.
--
-- This project does not auto-grant DML privileges on new public tables, so
-- without these grants the app cannot read or write data at all.
-- Privileges decide which operations a role may attempt; RLS policies
-- (see 20260914000002_rls.sql) still decide which rows it can touch.
--
-- anon:          no access (all personal data requires authentication)
-- authenticated: CRUD, restricted to own rows by RLS
-- service_role:  full access, server-side only (never exposed to the browser)

revoke all on table
  public.sources,
  public.batches,
  public.purchases,
  public.additional_costs
from anon, authenticated;

grant select, insert, update, delete on table
  public.sources,
  public.batches,
  public.purchases,
  public.additional_costs
to authenticated;

grant all on table
  public.sources,
  public.batches,
  public.purchases,
  public.additional_costs
to service_role;
