export type SubscriptionTier =
  | "free"
  | "tenant_pro"
  | "landlord_pro"
  | "agency_starter"
  | "agency_growth";

export type Plan = {
  id:              SubscriptionTier;
  name:            string;
  price:           string;           // display string, e.g. "R49/month"
  amount:          string;           // ZAR decimal for PayFast, e.g. "49.00"
  recurringAmount: string;           // same as amount for monthly subs
  itemName:        string;           // must match the webhook item_name lookup
  features:        string[];
  forRoles:        string[];
};

export const PLANS: Plan[] = [
  {
    id:              "free",
    name:            "Free",
    price:           "R0/month",
    amount:          "0.00",
    recurringAmount: "0.00",
    itemName:        "RentalRep Free",
    features: [
      "1 active review per year",
      "Basic reputation score",
      "Public profile page",
    ],
    forRoles: ["tenant", "landlord"],
  },
  {
    id:              "tenant_pro",
    name:            "Tenant Pro",
    price:           "R49/month",
    amount:          "49.00",
    recurringAmount: "49.00",
    itemName:        "RentalRep Tenant Pro",
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
    id:              "landlord_pro",
    name:            "Landlord Pro",
    price:           "R79/month",
    amount:          "79.00",
    recurringAmount: "79.00",
    itemName:        "RentalRep Landlord Pro",
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
    id:              "agency_starter",
    name:            "Agency Starter",
    price:           "R999/month",
    amount:          "999.00",
    recurringAmount: "999.00",
    itemName:        "RentalRep Agency Starter",
    features: [
      "Up to 3 agent seats",
      "50 tenant screens per month",
      "Agency profile + RentalRep Certified badge",
      "Review request automation",
    ],
    forRoles: ["agency"],
  },
  {
    id:              "agency_growth",
    name:            "Agency Growth",
    price:           "R2,499/month",
    amount:          "2499.00",
    recurringAmount: "2499.00",
    itemName:        "RentalRep Agency Growth",
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

/** item_name → subscription tier lookup (used in webhook handler). */
export const ITEM_NAME_TO_TIER: Record<string, SubscriptionTier> = {
  "RentalRep Tenant Pro":     "tenant_pro",
  "RentalRep Landlord Pro":   "landlord_pro",
  "RentalRep Agency Starter": "agency_starter",
  "RentalRep Agency Growth":  "agency_growth",
};

export function plansForRole(role: string): Plan[] {
  return PLANS.filter((p) => p.forRoles.includes(role));
}

export function tierName(tier: SubscriptionTier): string {
  return PLANS.find((p) => p.id === tier)?.name ?? "Free";
}
