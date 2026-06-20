import { NextRequest, NextResponse }         from "next/server";
import { createClient }                      from "@/lib/supabase/server";
import { createServiceClient }               from "@/lib/supabase/service";
import {
  PAYFAST_URL,
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  PAYFAST_PASSPHRASE,
  buildPayFastSignature,
}                                            from "@/lib/payfast";
import { PLANS }                             from "@/lib/plans";

/**
 * POST /api/payfast/checkout
 * Builds a signed PayFast subscription payload and returns it to the client.
 * The client creates a hidden form, appends it to <body>, and submits it —
 * this is the standard PayFast redirect pattern.
 *
 * Body: { planId: string }
 * Returns: { url: string; params: Record<string, string> }
 */
export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { planId?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { planId } = body;
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan || plan.id === "free") {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  // ── Fetch user profile ───────────────────────────────────────────────────
  const svc = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (svc as any)
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const fullName  = (profile?.full_name as string | null) ?? "";
  const nameParts = fullName.trim().split(/\s+/);
  const nameFirst = nameParts[0] ?? "";
  const nameLast  = nameParts.slice(1).join(" ") || nameFirst;

  // ── Build notify URL ─────────────────────────────────────────────────────
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  // ── Build billing_date (today) ───────────────────────────────────────────
  const billingDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // ── Assemble payload (all values must be strings) ─────────────────────────
  const params: Record<string, string> = {
    // Merchant
    merchant_id:       PAYFAST_MERCHANT_ID,
    merchant_key:      PAYFAST_MERCHANT_KEY,

    // Redirect URLs
    return_url:        `${appUrl}/upgrade/success`,
    cancel_url:        `${appUrl}/upgrade`,
    notify_url:        `${appUrl}/api/payfast/webhook`,

    // Buyer
    name_first:        nameFirst,
    name_last:         nameLast,
    email_address:     user.email ?? "",

    // Transaction
    m_payment_id:      user.id,     // used in webhook to identify the user
    amount:            plan.amount,
    item_name:         plan.itemName,

    // Recurring subscription
    subscription_type: "1",
    billing_date:      billingDate,
    recurring_amount:  plan.recurringAmount,
    frequency:         "3",          // monthly
    cycles:            "0",          // indefinite
  };

  // ── Sign ──────────────────────────────────────────────────────────────────
  params.signature = buildPayFastSignature(params, PAYFAST_PASSPHRASE);

  return NextResponse.json({ url: PAYFAST_URL, params });
}
