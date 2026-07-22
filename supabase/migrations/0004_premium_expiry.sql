-- Premium memberships now expire: 30 days for monthly, 365 for yearly.
-- The admin approval route sets expires_at when it activates a request;
-- the client treats an "active" row past its expires_at as if it were
-- "none" (no separate cron job needed to demote it).
--
-- Run once in the Supabase dashboard: Project -> SQL Editor -> paste -> Run.

alter table public.premium_status
  add column if not exists expires_at timestamptz;
