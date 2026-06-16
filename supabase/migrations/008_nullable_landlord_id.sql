-- Allow lease records to be created even when the landlord/reviewee
-- is not yet on the platform (guest flow).
-- landlord_id is nullable so we can record the lease with just the tenant side.

alter table public.leases alter column landlord_id drop not null;
