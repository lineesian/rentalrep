-- 014_notifications.sql
-- In-app notification system for RentalRep
-- Run manually in Supabase SQL Editor.

-- ── Table ─────────────────────────────────────────────────────────────────────

create table if not exists public.notifications (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references public.profiles(id) on delete cascade,
  type              text        not null
    check (type in (
      'new_review',
      'review_published',
      'review_auto_published',
      'pending_nudge',
      'window_open'
    )),
  title             text        not null,
  body              text        not null,
  read              boolean     not null default false,
  related_review_id uuid        references public.reviews(id) on delete set null,
  created_at        timestamptz not null default now()
);

-- Fast lookups by user ordered by time
create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

-- Fast unread-count query
create index if not exists notifications_user_id_read_idx
  on public.notifications (user_id, read)
  where read = false;

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.notifications enable row level security;

-- Users read only their own notifications
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can mark their own notifications as read (update only the read column)
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts are service-role only (no policy = blocked for anon/authenticated)
-- The service_role key bypasses RLS entirely, so no insert policy is needed.
