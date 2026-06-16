-- Support off-platform reviewees (not yet on RentalRep)
alter table public.reviews alter column reviewee_id drop not null;
alter table public.reviews alter column lease_id    drop not null;

-- Store off-platform person details directly on the review
alter table public.reviews add column if not exists guest_name  text;
alter table public.reviews add column if not exists guest_email text;

-- Store uploaded lease doc URL on the review (for off-platform, where no lease row is created)
alter table public.reviews add column if not exists document_url text;

-- At least one of reviewee_id or guest_name must be present
alter table public.reviews add constraint reviews_reviewee_check
  check (reviewee_id is not null or guest_name is not null);
