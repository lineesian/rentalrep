import { NextRequest, NextResponse }  from "next/server";
import { createClient }               from "@/lib/supabase/server";
import { createServiceClient }        from "@/lib/supabase/service";
import {
  PAYFAST_URL,
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  PAYFAST_PASSPHRASE,
  buildPayFastSignature,
}                                      from "@/lib/payfast";
import {
  LEASE_CHECK_FEE,
  LEASE_CHECK_ITEM_NAME,
}                                      from "@/lib/leaseCheckPricing";

export const dynamic = "force-dynamic";

/**
 * POST /api/payfast/lease-check-checkout
 * Builds a signed once-off PayFast payload for an additional Lease Check.
 * Returns: { url: string; params: Record<string, string> }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const params: Record<string, string> = {
    merchant_id:   PAYFAST_MERCHANT_ID,
    merchant_key:  PAYFAST_MERCHANT_KEY,

    return_url:    `${appUrl}/lease-check?paid=1`,
    cancel_url:    `${appUrl}/lease-check`,
    notify_url:    `${appUrl}/api/payfast/webhook`,

    name_first:    nameFirst,
    name_last:     nameLast,
    email_address: user.email ?? "",

    m_payment_id:  user.id,
    amount:        LEASE_CHECK_FEE,
    item_name:     LEASE_CHECK_ITEM_NAME,
    // No subscription_type/recurring fields — once-off payment.
  };

  params.signature = buildPayFastSignature(params, PAYFAST_PASSPHRASE);

  return NextResponse.json({ url: PAYFAST_URL, params });
}
