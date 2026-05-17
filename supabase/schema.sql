create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  username text unique,
  display_name text,
  avatar_url text,
  bee_points integer not null default 0,
  streak_days integer not null default 0,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  author_name text not null,
  cover_url text,
  description text,
  genre text not null,
  is_premium boolean not null default false,
  bee_score integer not null default 0,
  listener_count integer not null default 0,
  rating numeric(3, 2) not null default 0,
  featured boolean not null default false,
  featured_rank integer,
  is_hot boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  title text not null,
  audio_url text,
  summary text,
  duration_seconds integer not null default 0,
  order_index integer not null,
  is_free boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (book_id, order_index)
);

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  status text not null check (status in ('currently-reading', 'finished', 'want-to-listen')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, book_id)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, book_id)
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  position_seconds integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, chapter_id)
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  host_profile_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  chapter_id uuid references public.chapters (id) on delete cascade,
  name text not null,
  position_seconds integer not null default 0,
  is_live boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (room_id, profile_id)
);

create table if not exists public.reward_claims (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  action_type text not null,
  points_earned integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists books_featured_rank_idx on public.books (featured, featured_rank);
create index if not exists books_search_idx on public.books (genre, title, author_name);
create index if not exists chapters_book_id_order_index_idx on public.chapters (book_id, order_index);
create index if not exists library_items_profile_id_status_idx on public.library_items (profile_id, status);
create index if not exists votes_book_id_idx on public.votes (book_id);
create index if not exists progress_profile_id_idx on public.progress (profile_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1), 'reader'), '[^a-zA-Z0-9_]+', '', 'g'));

  insert into public.profiles (id, email, display_name, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Reader'),
    left(coalesce(base_username, 'reader') || '_' || substr(new.id::text, 1, 6), 30),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.refresh_book_score(book_uuid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.books
  set bee_score = coalesce((
    select sum(value)::integer
    from public.votes
    where book_id = book_uuid
  ), 0),
  updated_at = timezone('utc', now())
  where id = book_uuid;
$$;

create or replace function public.handle_vote_score_refresh()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_book_score(coalesce(new.book_id, old.book_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists votes_refresh_book_score on public.votes;
create trigger votes_refresh_book_score
after insert or update or delete on public.votes
for each row execute procedure public.handle_vote_score_refresh();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.library_items enable row level security;
alter table public.votes enable row level security;
alter table public.progress enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.reward_claims enable row level security;

drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone"
on public.profiles for select
using (true);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "admins can manage profiles" on public.profiles;
create policy "admins can manage profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "books are public" on public.books;
create policy "books are public"
on public.books for select
using (true);

drop policy if exists "admins can manage books" on public.books;
create policy "admins can manage books"
on public.books for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "chapters are public" on public.chapters;
create policy "chapters are public"
on public.chapters for select
using (true);

drop policy if exists "admins can manage chapters" on public.chapters;
create policy "admins can manage chapters"
on public.chapters for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users manage own library" on public.library_items;
create policy "users manage own library"
on public.library_items for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

drop policy if exists "users manage own votes" on public.votes;
create policy "users manage own votes"
on public.votes for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

drop policy if exists "users manage own progress" on public.progress;
create policy "users manage own progress"
on public.progress for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

drop policy if exists "rooms are public" on public.rooms;
create policy "rooms are public"
on public.rooms for select
using (true);

drop policy if exists "users can manage hosted rooms" on public.rooms;
create policy "users can manage hosted rooms"
on public.rooms for all
using (auth.uid() = host_profile_id)
with check (auth.uid() = host_profile_id);

drop policy if exists "room members are public" on public.room_members;
create policy "room members are public"
on public.room_members for select
using (true);

drop policy if exists "users manage own room memberships" on public.room_members;
create policy "users manage own room memberships"
on public.room_members for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

drop policy if exists "users manage own rewards" on public.reward_claims;
create policy "users manage own rewards"
on public.reward_claims for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_books_updated_at on public.books;
create trigger set_books_updated_at
before update on public.books
for each row execute procedure public.set_updated_at();

drop trigger if exists set_chapters_updated_at on public.chapters;
create trigger set_chapters_updated_at
before update on public.chapters
for each row execute procedure public.set_updated_at();

drop trigger if exists set_library_items_updated_at on public.library_items;
create trigger set_library_items_updated_at
before update on public.library_items
for each row execute procedure public.set_updated_at();

drop trigger if exists set_votes_updated_at on public.votes;
create trigger set_votes_updated_at
before update on public.votes
for each row execute procedure public.set_updated_at();

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar images are public" on storage.objects;
create policy "avatar images are public"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "authenticated users can upload avatar images" on storage.objects;
create policy "authenticated users can upload avatar images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "authenticated users can update avatar images" on storage.objects;
create policy "authenticated users can update avatar images"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "authenticated users can delete avatar images" on storage.objects;
create policy "authenticated users can delete avatar images"
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
