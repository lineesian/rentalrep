export type SubscriptionTier =
  | "free"
  | "tenant_pro"
  | "landlord_pro"
  | "agency_starter"
  | "agency_growth";

export type Plan = {
  id:       SubscriptionTier;
  name:     string;
  price:    string;
  priceId:  string;           // replace with live Stripe price ID after dashboard setup
  features: string[];
  forRoles: string[];         // which profile roles see this plan
};

export const PLANS: Plan[] = [
  {
    id:      "free",
    name:    "Free",
    price:   "R0/month",
    priceId: "",
    features: [
      "1 active review per year",
      "Basic reputation score",
      "Public profile page",
    ],
    forRoles: ["tenant", "landlord"],
  },
  {
    id:      "tenant_pro",
    name:    "Tenant Pro",
    price:   "R49/month",
    priceId: "price_tenant_pro",
    features: [
      "Anonymous review option",
      "Score history & trends",
      "Priority dispute resolution",
      "Shareable verified profile",
      "Document vault",
      "Access to 'Looking to Rent' board",
    ],
    forRoles: ["tenant"],
  },
  {
    id:      "landlord_pro",
    name:    "Landlord Pro",
    price:   "R79/month",
    priceId: "price_landlord_pro",
    features: [
      "Unlimited tenant searches",
      "Full tenant score breakdown",
      "Portfolio management dashboard",
      "Bulk review requests",
      "Premium background check add-on",
    ],
    forRoles: ["landlord"],
  },
  {
    id:      "agency_starter",
    name:    "Agency Starter",
    price:   "R999/month",
    priceId: "price_agency_starter",
    features: [
      "Up to 3 agent seats",
      "50 tenant screens per month",
      "Agency profile + RentalRep Certified badge",
      "Review request automation",
    ],
    forRoles: ["agency"],
  },
  {
    id:      "agency_growth",
    name:    "Agency Growth",
    price:   "R2,499/month",
    priceId: "price_agency_growth",
    features: [
      "Up to 10 agent seats",
      "Unlimited tenant screens",
      "Landlord vetting access",
      "Complex intelligence dashboard",
      "Bulk lease upload",
      "Premium background check bundle",
    ],
    forRoles: ["agency"],
  },
];

/** Price ID → subscription tier lookup (used in webhook handler). */
export const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  price_tenant_pro:     "tenant_pro",
  price_landlord_pro:   "landlord_pro",
  price_agency_starter: "agency_starter",
  price_agency_growth:  "agency_growth",
};

export function plansForRole(role: string): Plan[] {
  return PLANS.filter((p) => p.forRoles.includes(role));
}

export function tierName(tier: SubscriptionTier): string {
  return PLANS.find((p) => p.id === tier)?.name ?? "Free";
}
