-- Follow-up migration: blend landlord_maintenance_score into reputation_scores.
-- Run this after 017 and 018 have been live and have accumulated real data.
-- Docks the maintenance sub-score for every overdue_unresolved request.
-- Each overdue request reduces the maintenance score by 0.5, floored at 1.0.

-- This is intentionally a stub — fill in once the reputation_scores view
-- definition from 010_simultaneous_reveal.sql is confirmed stable.

-- Example: replace the maintenance column in reputation_scores with:
--
--   greatest(
--     1.0,
--     coalesce(existing_review_maintenance, 5.0)
--     - (0.5 * coalesce(lms.overdue_unresolved, 0))
--   ) as maintenance
--
-- from public.landlord_maintenance_score lms on lms.landlord_id = profile_id

-- Placeholder — no-op until blending is scheduled.
select 1;
