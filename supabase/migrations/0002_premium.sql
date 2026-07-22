-- Premium membership requests (manual card transfer + admin approval).
--
-- Run once in the Supabase dashboard: Project -> SQL Editor -> paste -> Run.
-- There is no payment gateway yet (Click/Payme merchant account pending
-- approval), so this models a manual flow: the user transfers money to a
-- published card number, taps "I've paid" (status -> pending), and an admin
-- reviews and approves/rejects from the admin panel (status -> active /
-- rejected). Users can never set their own status to "active" — only the
-- service-role-backed /api/admin/premium route can, via RLS below.

create table if not exists public.premium_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  status text not null default 'none' check (status in ('none', 'pending', 'active', 'rejected')),
  requested_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.premium_status enable row level security;

drop policy if exists "users can view own premium status" on public.premium_status;
create policy "users can view own premium status"
  on public.premium_status for select
  using (auth.uid() = user_id);

drop policy if exists "users can request premium" on public.premium_status;
create policy "users can request premium"
  on public.premium_status for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "users can re-request premium" on public.premium_status;
create policy "users can re-request premium"
  on public.premium_status for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status = 'pending');

-- No delete policy; no "active"/"rejected" transition available to regular
-- users — only the admin API route (service role, bypasses RLS) sets those.
