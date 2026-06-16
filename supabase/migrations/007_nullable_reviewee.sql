-- Make reviewee_id and lease_id nullable to support guest (off-platform) reviews.
-- Run this if migrations 005/006 were not applied or partially applied.

alter table public.reviews alter column reviewee_id drop not null;
alter table public.reviews alter column lease_id    drop not null;

alter table public.reviews add column if not exists guest_name  text;
alter table public.reviews add column if not exists guest_email text;

-- Ensure at least one of reviewee_id or guest_name is present
alter table public.reviews drop constraint if exists reviews_reviewee_check;
alter table public.reviews add  constraint reviews_reviewee_check
  check (reviewee_id is not null or guest_name is not null);
