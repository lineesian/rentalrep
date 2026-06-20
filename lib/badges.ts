import type { Review } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BadgeTier = "standard" | "gold";

export type Badge = {
  id:   string;
  name: string;
  tier: BadgeTier;
  /** Inner SVG content (paths/shapes) for a 16×16 viewBox — no <svg> wrapper. */
  icon: string;
};

// ── SVG icon library ──────────────────────────────────────────────────────────

const ICONS = {
  coin:      `<circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M8 5v6M6.5 7h2.5a1.5 1.5 0 010 3H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>`,
  house:     `<path d="M2 7.5L8 2l6 5.5M5 6.5V14h6V6.5M6.5 14v-3.5h3V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>`,
  bubble:    `<path d="M2.5 3A1.5 1.5 0 014 1.5h8A1.5 1.5 0 0113.5 3v6A1.5 1.5 0 0112 10.5H5.5L2.5 13.5V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>`,
  docCheck:  `<rect x="3.5" y="1.5" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M5.5 8.5l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>`,
  sparkle:   `<path d="M8 1v3.5M8 11.5V15M1 8h3.5M11.5 8H15M3.5 3.5l2 2M10.5 10.5l2 2M12.5 3.5l-2 2M5.5 10.5l-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>`,
  people:    `<circle cx="5.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M1 14.5a4.5 4.5 0 019 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/><circle cx="10.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M6.5 14.5a4.5 4.5 0 019 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>`,
  wrench:    `<path d="M10.5 1.5a4 4 0 00-3.6 5.7L1.8 12.3a1.5 1.5 0 002 2.2l5.1-5.1A4 4 0 0010.5 1.5z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/><path d="M13.5 2.5L12 4l1.5 1.5L15 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>`,
  eye:       `<path d="M1 8s2.5-5.5 7-5.5S15 8 15 8s-2.5 5.5-7 5.5S1 8 1 8z" stroke="currentColor" strokeWidth="1.4" fill="none"/><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>`,
  scale:     `<path d="M8 2.5v11M5 13.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/><path d="M4 5.5l-2 4a2 2 0 004 0l-2-4M12 5.5l-2 4a2 2 0 004 0l-2-4M4 5.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>`,
  key:       `<circle cx="6" cy="6.5" r="3.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M9 9l5 5.5M11.5 11.5l1.5 1.5M13 10l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>`,
  star:      `<path d="M8 1.5l1.9 4.8h5.1L11 9.3l1.6 4.9L8 11.5 3.4 14.2 5 9.3.9 6.3H6L8 1.5z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>`,
  lightning: `<path d="M9.5 1.5L5 9h4.5l-2.5 5.5L14.5 6H10l2.5-4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>`,
  clipboard: `<rect x="4" y="3" width="8" height="11.5" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M6 3V1.5h4V3M5.5 7h5M5.5 9.5h5M5.5 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>`,
  shield:    `<path d="M8 1.5L3 4v5c0 3.5 2.5 5.5 5 6 2.5-.5 5-2.5 5-6V4L8 1.5z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/><path d="M5.5 7.5c0-1 .8-2 2.5-2s2.5 1 2.5 2c0 1.5-2.5 3-2.5 3s-2.5-1.5-2.5-3z" stroke="currentColor" strokeWidth="1.3" fill="none"/>`,
  trophy:    `<path d="M5.5 2h5v5.5a2.5 2.5 0 01-5 0V2z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/><path d="M3 2.5H2a1 1 0 000 2l1.5 1M13 2.5h1a1 1 0 010 2l-1.5 1M8 10v3M5.5 13h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>`,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function scoreCheck(reviews: Review[], key: string, minCount: number, threshold: number): boolean {
  const vals = reviews
    .map((r) => (r as Record<string, unknown>)[key])
    .filter((v): v is number => typeof v === "number");
  return vals.length >= minCount && mean(vals) >= threshold;
}

function overallCheck(reviews: Review[], minCount: number, threshold: number): boolean {
  if (reviews.length < minCount) return false;
  return mean(reviews.map((r) => r.overall)) >= threshold;
}

function recommendCheck(reviews: Review[], minCount: number, minPct: number): boolean {
  const withRec = reviews.filter((r) => r.would_recommend != null);
  if (withRec.length < minCount) return false;
  const yes = withRec.filter((r) => r.would_recommend === "yes").length;
  return yes / withRec.length >= minPct;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Calculate badges earned by a profile.
 * @param reviews  Published reviews RECEIVED by this profile (status published/expired).
 * @param role     The profile's role.
 */
export function calculateBadges(reviews: Review[], role: string): Badge[] {
  const earned: Badge[] = [];

  // ── Tenant badges ─────────────────────────────────────────────────────────
  if (role === "tenant") {
    if (scoreCheck(reviews, "payment_history", 2, 4.5))
      earned.push({ id: "consistent_payer", name: "Consistent Payer", tier: "standard", icon: ICONS.coin });

    if (scoreCheck(reviews, "property_care", 2, 4.5))
      earned.push({ id: "property_guardian", name: "Property Guardian", tier: "standard", icon: ICONS.house });

    if (scoreCheck(reviews, "communication", 2, 4.5))
      earned.push({ id: "great_communicator", name: "Great Communicator", tier: "standard", icon: ICONS.bubble });

    if (scoreCheck(reviews, "compliance_with_lease", 2, 4.5))
      earned.push({ id: "lease_compliant", name: "Lease Compliant", tier: "standard", icon: ICONS.docCheck });

    if (scoreCheck(reviews, "vacating_conduct", 2, 4.5))
      earned.push({ id: "spotless_exit", name: "Spotless Exit", tier: "standard", icon: ICONS.sparkle });

    if (scoreCheck(reviews, "neighbour_relations", 2, 4.5))
      earned.push({ id: "good_neighbour", name: "Good Neighbour", tier: "standard", icon: ICONS.people });
  }

  // ── Landlord badges ───────────────────────────────────────────────────────
  if (role === "landlord") {
    if (scoreCheck(reviews, "maintenance", 2, 4.5))
      earned.push({ id: "prompt_repairs", name: "Prompt Repairs", tier: "standard", icon: ICONS.wrench });

    if (scoreCheck(reviews, "communication", 2, 4.5))
      earned.push({ id: "great_communicator", name: "Great Communicator", tier: "standard", icon: ICONS.bubble });

    if (scoreCheck(reviews, "transparency", 2, 4.5))
      earned.push({ id: "transparent", name: "Transparent", tier: "standard", icon: ICONS.eye });

    if (scoreCheck(reviews, "value_for_money", 2, 4.5))
      earned.push({ id: "fair_pricing", name: "Fair Pricing", tier: "standard", icon: ICONS.scale });

    if (scoreCheck(reviews, "condition_on_movein", 2, 4.5))
      earned.push({ id: "smooth_movein", name: "Smooth Move-in", tier: "standard", icon: ICONS.key });

    if (recommendCheck(reviews, 3, 0.8))
      earned.push({ id: "highly_recommended", name: "Highly Recommended", tier: "gold", icon: ICONS.star });
  }

  // ── Agency badges ─────────────────────────────────────────────────────────
  if (role === "agency") {
    // Agency reviews store responsiveness under the "fairness" column (labelled "Responsiveness")
    if (scoreCheck(reviews, "fairness", 2, 4.5))
      earned.push({ id: "responsive_agency", name: "Responsive Agency", tier: "standard", icon: ICONS.lightning });

    if (scoreCheck(reviews, "paperwork_quality", 2, 4.5))
      earned.push({ id: "admin_excellence", name: "Admin Excellence", tier: "standard", icon: ICONS.clipboard });

    if (overallCheck(reviews, 3, 4.5))
      earned.push({ id: "tenant_friendly", name: "Tenant Friendly", tier: "standard", icon: ICONS.shield });

    if (overallCheck(reviews, 5, 4.8))
      earned.push({ id: "top_rated_agency", name: "Top Rated Agency", tier: "gold", icon: ICONS.trophy });
  }

  return earned;
}
