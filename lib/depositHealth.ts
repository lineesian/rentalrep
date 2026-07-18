export type DepositStatus =
  | "held"
  | "returned_full"
  | "returned_partial"
  | "withheld"
  | "disputed";

export type Deposit = {
  id:                string;
  amount:            number;
  amount_returned:   number | null;
  amount_withheld:   number | null;
  status:            DepositStatus;
  is_interest_bearing: boolean;
  property_address:  string;
  bank_name:         string | null;
  logged_at:         string;
  resolved_at:       string | null;
};

export type DepositHealthScore = {
  score:          number;   // 1–10
  label:          string;
  deposits:       number;
  pctReturnedFull: number;
  pctInterestBearing: number;
};

export function computeDepositHealth(deposits: Deposit[]): DepositHealthScore {
  if (!deposits.length) {
    return { score: 0, label: "No data", deposits: 0, pctReturnedFull: 0, pctInterestBearing: 0 };
  }

  const resolved = deposits.filter((d) => d.status !== "held");
  const returnedFull = deposits.filter((d) => d.status === "returned_full");
  const disputed     = deposits.filter((d) => d.status === "disputed");
  const withheld     = deposits.filter((d) => d.status === "withheld");
  const interestBearing = deposits.filter((d) => d.is_interest_bearing);

  const pctReturnedFull    = deposits.length ? (returnedFull.length / deposits.length) * 100 : 0;
  const pctInterestBearing = deposits.length ? (interestBearing.length / deposits.length) * 100 : 0;

  // base score from return rate (0–7 points)
  let score = (pctReturnedFull / 100) * 7;

  // bonus: interest-bearing deposits (+1 point max)
  score += (pctInterestBearing / 100) * 1;

  // penalty: disputed deposits (-1 per dispute, min floor 1)
  score -= disputed.length * 1;

  // partial penalty
  const partial = deposits.filter((d) => d.status === "returned_partial");
  score -= partial.length * 0.5;

  // bonus: resolved quickly (within 21 days)
  const quickResolved = resolved.filter((d) => {
    if (!d.resolved_at) return false;
    const days = (new Date(d.resolved_at).getTime() - new Date(d.logged_at).getTime()) / 86400000;
    return days <= 21;
  });
  score += (quickResolved.length / Math.max(resolved.length, 1)) * 2;

  score = Math.max(1, Math.min(10, score));
  const rounded = Math.round(score * 10) / 10;

  let label = "Poor";
  if (rounded >= 8) label = "Excellent";
  else if (rounded >= 6) label = "Good";
  else if (rounded >= 4) label = "Fair";

  return {
    score:           rounded,
    label,
    deposits:        deposits.length,
    pctReturnedFull: Math.round(pctReturnedFull),
    pctInterestBearing: Math.round(pctInterestBearing),
  };
}
