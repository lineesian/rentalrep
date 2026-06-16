-- Add onboarding_completed flag to profiles.
-- New rows default to false; existing users are backfilled to true
-- so they are not shown the onboarding flow.

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Backfill: all accounts created before this migration are already "onboarded"
update public.profiles set onboarding_completed = true where onboarding_completed = false;
