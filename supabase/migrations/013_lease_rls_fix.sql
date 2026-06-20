-- ════════════════════════════════════════════════════════════════
-- RentalRep — Fix lease RLS so landlords can insert leases
-- ════════════════════════════════════════════════════════════════
--
-- Root cause: migration 001 created:
--   "Tenants can insert leases"  with check (auth.uid() = tenant_id)
--
-- This blocks landlord-initiated reviews: the landlord is auth.uid()
-- but tenant_id = reviewee.id (the tenant being reviewed), so the
-- policy check always fails and the lease insert is rejected.
--
-- Fix: replace with a policy that allows either party to insert.
-- Also lower the body minimum-length constraint from 500 → 100 chars
-- to match the client-side MIN_BODY = 100.

-- ── 1. Fix lease INSERT policy ─────────────────────────────────

drop policy if exists "Tenants can insert leases" on public.leases;

create policy "Lease parties can insert leases"
  on public.leases for insert
  with check (
    auth.uid() = tenant_id
    or (landlord_id is not null and auth.uid() = landlord_id)
  );

-- ── 2. Fix body minimum-length constraint ──────────────────────
-- Migration 001 has an inline (unnamed) constraint that Postgres names
-- "reviews_body_check". Migration 012 attempted this but may not have
-- been applied yet — use IF EXISTS to be safe either way.

alter table public.reviews
  drop constraint if exists reviews_body_check;

alter table public.reviews
  add  constraint reviews_body_check
  check (char_length(body) >= 100);

-- ── 3. Ensure reviewee_id and lease_id are nullable ────────────
-- Required for guest-tenant and property reviews.
-- Migration 012 also does this; these are idempotent.

alter table public.reviews alter column reviewee_id drop not null;
alter table public.reviews alter column lease_id    drop not null;

-- ── 4. Ensure landlord_id is nullable on leases ────────────────
-- Migration 008 does this; idempotent guard.

alter table public.leases alter column landlord_id drop not null;
