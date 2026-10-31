-- Watchlist: users can save profiles or properties to monitor for new reviews.

create table public.watchlist_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  -- exactly one of these must be set
  profile_id  uuid references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint watchlist_target_check check (
    (profile_id is not null)::int + (property_id is not null)::int = 1
  ),
  constraint watchlist_unique unique (user_id, profile_id, property_id)
);

alter table public.watchlist_items enable row level security;

create policy "Users manage own watchlist"
  on public.watchlist_items
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
