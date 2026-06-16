-- Record the role of both parties at the time of writing, so review
-- direction is queryable even if a user later changes their profile role.

alter table public.reviews
  add column if not exists reviewer_role text
    check (reviewer_role in ('tenant', 'landlord', 'agency', 'agent'));

-- reviewee_role also covers 'property' for property-level reviews
alter table public.reviews
  add column if not exists reviewee_role text
    check (reviewee_role in ('tenant', 'landlord', 'agency', 'agent', 'property'));
