-- Restrict public.rls_auto_enable() so it cannot be called through the API.
--
-- This SECURITY DEFINER function is not created by Batchly's migrations; it
-- was provisioned with the Supabase project and backs the `ensure_rls` event
-- trigger (ddl_command_end), which auto-enables RLS on new public tables.
--
-- Its ACL was the default, meaning PUBLIC had EXECUTE and anon/authenticated
-- could call it via /rest/v1/rpc/rls_auto_enable (Supabase advisor lints
-- 0028/0029). Revoking from anon/authenticated alone would not help, because
-- they inherit EXECUTE from PUBLIC, so PUBLIC is revoked as well.
--
-- Internal behaviour is unaffected: event trigger functions are invoked by the
-- server when the trigger fires, without an EXECUTE privilege check. The
-- owner (postgres) and service_role keep EXECUTE explicitly, so only the
-- client-facing roles lose access.

revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon, authenticated;

grant execute on function public.rls_auto_enable() to postgres, service_role;
