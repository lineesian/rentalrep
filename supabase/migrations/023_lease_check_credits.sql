-- Lease Check monetisation: the first lease check per account is free.
-- Every additional check requires a once-off PayFast payment, tracked here
-- as a single-use credit.

create table if not exists public.lease_check_credits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id),
  payfast_reference text,
  consumed          boolean not null default false,
  created_at        timestamptz not null default now(),
  consumed_at       timestamptz
);

alter table public.lease_check_credits enable row level security;

create policy "Users can view their own lease check credits"
  on public.lease_check_credits for select using (auth.uid() = user_id);

create policy "Users can mark their own credit as consumed"
  on public.lease_check_credits for update using (auth.uid() = user_id);

-- No insert policy for authenticated users on purpose. Credits are only ever
-- created by the PayFast webhook using the service-role client, after a real
-- payment is confirmed. This stops a user granting themselves a free credit
-- by calling the API directly.
