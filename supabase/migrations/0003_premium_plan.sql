-- Adds plan (monthly/yearly) and promo code tracking to premium requests,
-- so the admin reviewing a request knows which plan/discount the member
-- expects and can verify the transferred amount matches.
--
-- Run once in the Supabase dashboard: Project -> SQL Editor -> paste -> Run.

alter table public.premium_status
  add column if not exists plan text not null default 'monthly' check (plan in ('monthly', 'yearly'));

alter table public.premium_status
  add column if not exists promo_code text;
