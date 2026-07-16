-- Global (cross-device) state for BookBee.
--
-- Run this once in the Supabase dashboard: Project -> SQL Editor -> paste -> Run.
-- Everything else (library, ratings, plays, certificates, discussions) stays
-- in per-browser localStorage for now; only admin-authored catalog content,
-- gamification points, and the profile avatar/bio move here.

-- ---------------------------------------------------------------------------
-- catalog_store: admin-authored catalog/collection overrides, keyed exactly
-- like the old localStorage keys (bookbee_book_edits, bookbee_custom_books,
-- bookbee_collection_edits, bookbee_custom_collections,
-- bookbee_deleted_collections). One JSON blob per key. Readable by everyone;
-- writable only through the service-role-backed /api/admin/catalog route.
-- ---------------------------------------------------------------------------
create table if not exists public.catalog_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.catalog_store enable row level security;

drop policy if exists "catalog_store is publicly readable" on public.catalog_store;
create policy "catalog_store is publicly readable"
  on public.catalog_store for select
  using (true);

-- No insert/update/delete policy for anon/authenticated: writes only happen
-- server-side via the service-role key, which bypasses RLS entirely.

-- ---------------------------------------------------------------------------
-- user_stats: global BookBee Points per account, so the leaderboard reflects
-- every signed-up listener instead of just whoever's browser has the number.
-- ---------------------------------------------------------------------------
create table if not exists public.user_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  points integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;

drop policy if exists "user_stats are publicly readable" on public.user_stats;
create policy "user_stats are publicly readable"
  on public.user_stats for select
  using (true);

drop policy if exists "users insert their own stats" on public.user_stats;
create policy "users insert their own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update their own stats" on public.user_stats;
create policy "users update their own stats"
  on public.user_stats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- profiles: avatar (data URL) + bio, keyed by account so every browser and
-- the admin panel show the same picture for a given user.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  avatar text not null default '',
  bio text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "users insert their own profile" on public.profiles;
create policy "users insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
