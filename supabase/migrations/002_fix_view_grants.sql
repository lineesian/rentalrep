-- ============================================================
-- RentalRep — Migration 002: Fix view grants & lease RLS
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Grant SELECT on reputation_scores view to both roles.
--    Supabase auto-grants on RLS tables but NOT on views —
--    without this, anon/authenticated get a permission error.
grant select on public.reputation_scores to anon, authenticated;

-- 2. Grant SELECT on profiles to anon so unauthenticated visitors
--    can read public profiles (RLS policy already allows this, but
--    the role-level grant must also exist).
grant select on public.profiles to anon, authenticated;

-- 3. Allow any authenticated user to read lease rows when they are
--    viewing a review that references it. The previous policy was
--    too restrictive (only lease parties could read), causing the
--    joined lease data to be stripped from review results for other
--    viewers. We widen it to: authenticated users can read any lease.
drop policy if exists "Lease parties and agencies can view leases" on public.leases;

create policy "Authenticated users can view leases"
  on public.leases for select
  using (auth.role() = 'authenticated');
