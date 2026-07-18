import Anthropic from "@anthropic-ai/sdk";

export const FLAG_LABELS: Record<FlagType, string> = {
  reletting_fee:      "Reletting / vacancy fee after notice",
  excessive_notice:   "Excessive notice period",
  deposit_overreach:  "Deposit deductions beyond fair wear and tear",
  maintenance_waiver: "Landlord maintenance obligations waived",
  auto_renewal:       "Automatic renewal / lock-in",
  rent_increase:      "Unilateral rent increase",
  other:              "Other unusual or unfair clause",
};

export type FlagType =
  | "reletting_fee"
  | "excessive_notice"
  | "deposit_overreach"
  | "maintenance_waiver"
  | "auto_renewal"
  | "rent_increase"
  | "other";

export type RiskLevel = "low" | "medium" | "high";

export type LeaseFlag = {
  clause_excerpt: string;
  flag_type:      FlagType;
  risk_level:     RiskLevel;
  explanation:    string;
};

const SYSTEM_PROMPT = `You are a South African tenancy clause analyser. Your job is to read a residential lease agreement and identify clauses that may be unfair, unlawful, or disadvantageous to tenants under South African law, specifically the Rental Housing Act 50 of 1999 and the Consumer Protection Act 68 of 2008.

DISCLAIMER: This analysis is not legal advice. It is an automated screening to help tenants identify clauses worth discussing with an attorney before signing.

Flag clauses that match any of these patterns:

1. reletting_fee — Clauses that charge the tenant a reletting fee, re-advertising fee, or vacancy penalty after they have given proper written notice to vacate as required by the lease.

2. excessive_notice — Notice periods longer than one calendar month for a month-to-month lease, or longer than the lease term for a fixed-term lease. The Rental Housing Act requires only one month notice on a month-to-month arrangement.

3. deposit_overreach — Deposit deduction language that goes beyond "fair wear and tear", for example clauses allowing the landlord to deduct for normal aging, minor scuffs, or repainting costs that are the landlord's responsibility.

4. maintenance_waiver — Clauses that waive the landlord's statutory obligation to maintain the property in a habitable condition, or that place structural or major appliance repair costs on the tenant.

5. auto_renewal — Automatic renewal or lock-in clauses that convert the lease to a new fixed term without clear, prominent notice and the tenant's affirmative consent.

6. rent_increase — Unilateral rent increase clauses where the landlord can raise the rent at their sole discretion without a fixed formula or minimum notice period.

7. other — Any other clause that is materially unfair to the tenant, potentially unlawful, or unusually one-sided.

INSTRUCTIONS:
- Return ONLY valid JSON, no markdown fences, no extra text.
- Return an array of flag objects. If no risky clauses are found, return an empty array [].
- Each flag must include:
  - clause_excerpt: the verbatim text from the lease that triggered the flag (max 400 characters, truncate with "..." if longer)
  - flag_type: one of the seven types above
  - risk_level: "low" | "medium" | "high"
  - explanation: plain-English explanation of the risk, written for a tenant with no legal background (2-4 sentences)
- risk_level guide:
  - high: likely unlawful or would cause significant financial harm
  - medium: potentially unlawful or unfair, worth challenging
  - low: unusual or one-sided but not necessarily unlawful`;

const client = new Anthropic();

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
  const result   = await pdfParse(buffer);
  return result.text;
}

export async function analyseLeaseText(text: string): Promise<LeaseFlag[]> {
  const truncated = text.slice(0, 40000); // ~30k tokens max, well within claude limits

  const message = await client.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system:     SYSTEM_PROMPT,
    messages: [
      {
        role:    "user",
        content: `Here is the lease agreement text:\n\n${truncated}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "[]";

  let flags: LeaseFlag[] = [];
  try {
    flags = JSON.parse(raw);
    if (!Array.isArray(flags)) flags = [];
  } catch {
    flags = [];
  }

  return flags;
}
