import { NextRequest, NextResponse } from "next/server";
import { stripe }               from "@/lib/stripe";
import { createClient }         from "@/lib/supabase/server";
import { createServiceClient }  from "@/lib/supabase/service";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for a subscription.
 *
 * Body: { priceId: string }
 * Returns: { url: string }
 */
export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { priceId?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { priceId } = body;
  if (!priceId) {
    return NextResponse.json({ error: "missing_priceId" }, { status: 400 });
  }

  // ── Fetch profile (email + existing Stripe customer ID) ───────────────────
  const svc = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (svc as any)
    .from("profiles")
    .select("full_name, stripe_customer_id")
    .eq("id", user.id)
    .single();

  // ── Resolve or create Stripe customer ─────────────────────────────────────
  let customerId: string = profile?.stripe_customer_id ?? "";

  if (!customerId) {
    const customer = await stripe.customers.create({
      email:    user.email,
      name:     profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    // Persist the new customer ID immediately so future sessions reuse it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (svc as any)
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // ── Build absolute URLs ───────────────────────────────────────────────────
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  // ── Create Checkout session ────────────────────────────────────────────────
  const session = await stripe.checkout.sessions.create({
    mode:       "subscription",
    customer:   customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/upgrade`,
    metadata:    { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "no_session_url" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
