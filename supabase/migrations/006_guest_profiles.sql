-- Allow "guest" profiles not tied to an auth.users row
-- (needed so reviewers can reference off-platform people as a real DB row)

-- 1. Drop the FK that forces profiles.id → auth.users.id
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- 2. Add guest flag and email
alter table public.profiles add column if not exists email    text;
alter table public.profiles add column if not exists is_guest boolean not null default false;

-- 3. Real users still get their profile via the existing trigger (UUID matches auth.users.id).
--    Guest profiles get a random UUID generated client-side.

-- 4. Update the insert RLS so authenticated users can also insert guest profiles
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (
    auth.uid() = id                                          -- own real profile
    or (auth.role() = 'authenticated' and is_guest = true)  -- guest stub created by reviewer
  );
