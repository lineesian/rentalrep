import type { Profile, Review } from "./types";

export type BadgeColour = "teal" | "gold" | "petrol";

export type Badge = {
  id: string;
  label: string;
  icon: string;
  colour: BadgeColour;
};

// ── helpers ──────────────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function scoreCheck(
  reviews: Review[],
  key: keyof Review,
  minCount: number,
  threshold: number
): boolean {
  const vals = reviews
    .map((r) => r[key] as number | null)
    .filter((v): v is number => v !== null && v !== undefined);
  return vals.length >= minCount && mean(vals) >= threshold;
}

function recommendCheck(reviews: Review[], minCount: number, minPct: number): boolean {
  const withRec = reviews.filter((r) => r.would_recommend !== null);
  if (withRec.length < minCount) return false;
  const yesCount = withRec.filter((r) => r.would_recommend === "yes").length;
  return yesCount / withRec.length >= minPct;
}

const EARLY_ADOPTER_CUTOFF = new Date("2026-12-16");

// ── main export ──────────────────────────────────────────────────────────────

/**
 * Calculate which badges a profile has earned.
 * @param profile   The profile record.
 * @param reviews   Published reviews received by this profile (reviewee_id = profile.id).
 * @param givenCount Number of published reviews this profile has written (used for "Verified").
 */
export function calculateBadges(
  profile: Profile,
  reviews: Review[],
  givenCount = 0
): Badge[] {
  const earned: Badge[] = [];
  const role = profile.role;

  // ── TENANT BADGES ──────────────────────────────────────────────────────────
  if (role === "tenant") {
    if (scoreCheck(reviews, "payment_history", 2, 4.5))
      earned.push({ id: "consistent_payer", label: "Consistent Payer", icon: "💳", colour: "teal" });

    if (scoreCheck(reviews, "property_care", 2, 4.5))
      earned.push({ id: "property_guardian", label: "Property Guardian", icon: "🏠", colour: "teal" });

    if (scoreCheck(reviews, "communication", 2, 4.5))
      earned.push({ id: "great_communicator", label: "Great Communicator", icon: "💬", colour: "teal" });

    if (scoreCheck(reviews, "compliance_with_lease", 2, 4.5))
      earned.push({ id: "lease_abiding", label: "Lease Abiding", icon: "📋", colour: "teal" });

    if (scoreCheck(reviews, "vacating_conduct", 2, 4.5))
      earned.push({ id: "left_it_spotless", label: "Left It Spotless", icon: "✨", colour: "teal" });

    if (scoreCheck(reviews, "neighbour_relations", 2, 4.5))
      earned.push({ id: "model_neighbour", label: "Model Neighbour", icon: "🤝", colour: "teal" });

    if (recommendCheck(reviews, 3, 0.8))
      earned.push({ id: "highly_recommended", label: "Highly Recommended", icon: "⭐", colour: "gold" });

    if (reviews.length >= 3 && mean(reviews.map((r) => r.overall)) >= 4.5)
      earned.push({ id: "five_star_tenant", label: "5-Star Tenant", icon: "🏆", colour: "gold" });
  }

  // ── LANDLORD BADGES ────────────────────────────────────────────────────────
  if (role === "landlord") {
    if (scoreCheck(reviews, "maintenance", 2, 4.5))
      earned.push({ id: "prompt_repairs", label: "Prompt Repairs", icon: "🔧", colour: "teal" });

    if (scoreCheck(reviews, "deposit_handling", 2, 4.5))
      earned.push({ id: "deposit_returned", label: "Deposit Returned", icon: "💰", colour: "teal" });

    if (scoreCheck(reviews, "communication", 2, 4.5))
      earned.push({ id: "always_available", label: "Always Available", icon: "📞", colour: "teal" });

    if (scoreCheck(reviews, "fairness", 2, 4.5))
      earned.push({ id: "fair_honest", label: "Fair & Honest", icon: "⚖️", colour: "teal" });

    if (scoreCheck(reviews, "privacy_boundaries", 2, 4.5))
      earned.push({ id: "respected_boundaries", label: "Respected Boundaries", icon: "🚪", colour: "teal" });

    if (recommendCheck(reviews, 3, 0.8))
      earned.push({ id: "highly_recommended", label: "Highly Recommended", icon: "⭐", colour: "gold" });

    if (reviews.length >= 3 && mean(reviews.map((r) => r.overall)) >= 4.5)
      earned.push({ id: "five_star_landlord", label: "5-Star Landlord", icon: "🏆", colour: "gold" });
  }

  // ── AGENCY BADGES ──────────────────────────────────────────────────────────
  if (role === "agency") {
    if (scoreCheck(reviews, "transparency", 2, 4.5))
      earned.push({ id: "transparent_agency", label: "Transparent Agency", icon: "🔍", colour: "teal" });

    if (scoreCheck(reviews, "value_for_money", 2, 4.5))
      earned.push({ id: "great_value", label: "Great Value", icon: "💎", colour: "teal" });

    if (scoreCheck(reviews, "paperwork_quality", 2, 4.5))
      earned.push({ id: "paperwork_pros", label: "Paperwork Pros", icon: "📄", colour: "teal" });

    if (recommendCheck(reviews, 3, 0.8))
      earned.push({ id: "highly_recommended", label: "Highly Recommended", icon: "⭐", colour: "gold" });
  }

  // ── MILESTONE BADGES ───────────────────────────────────────────────────────
  if (new Date(profile.created_at) < EARLY_ADOPTER_CUTOFF)
    earned.push({ id: "early_adopter", label: "Early Adopter", icon: "🚀", colour: "petrol" });

  if (reviews.length >= 1 || givenCount >= 1)
    earned.push({ id: "verified_member", label: "Verified", icon: "✓", colour: "petrol" });

  if (reviews.length >= 3)
    earned.push({ id: "trusted_member", label: "Trusted Member", icon: "🛡️", colour: "petrol" });

  return earned;
}
