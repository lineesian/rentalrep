import { NextRequest, NextResponse } from "next/server";
import Stripe                        from "stripe";
import { stripe }                    from "@/lib/stripe";
import { createServiceClient }       from "@/lib/supabase/service";
import { PRICE_TO_TIER }             from "@/lib/plans";

/**
 * POST /api/stripe/webhook
 * Receives Stripe events and keeps the profiles table in sync.
 *
 * Register this URL in Stripe Dashboard → Developers → Webhooks:
 *   https://<your-domain>/api/stripe/webhook
 *
 * Events handled:
 *   checkout.session.completed     → activate subscription
 *   customer.subscription.updated  → sync status (active / past_due)
 *   customer.subscription.deleted  → cancel, revert to free
 */

// Next.js edge/Node config: disable body parsing so we can verify raw body
export const config = { api: { bodyParser: false } };

async function updateProfile(
  svc: ReturnType<typeof createServiceClient>,
  userId: string,
  patch: Record<string, unknown>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (svc as any).from("profiles").update(patch).eq("id", userId);
  if (error) console.error("[webhook] profile update error:", error.message, "userId:", userId);
}

async function userIdFromCustomer(
  svc: ReturnType<typeof createServiceClient>,
  customerId: string,
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (svc as any)
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig     = req.headers.get("stripe-signature") ?? "";
  const secret  = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const svc = createServiceClient();

  // ── checkout.session.completed ────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId  = session.metadata?.supabase_user_id;
    if (!userId) {
      console.warn("[webhook] checkout.session.completed: no supabase_user_id in metadata");
      return NextResponse.json({ received: true });
    }

    // Retrieve full subscription to get the price ID
    const subscriptionId = session.subscription as string;
    const subscription   = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId        = subscription.items.data[0]?.price?.id ?? "";
    const tier           = PRICE_TO_TIER[priceId] ?? "free";

    await updateProfile(svc, userId, {
      stripe_customer_id:     session.customer as string,
      stripe_subscription_id: subscriptionId,
      subscription_tier:      tier,
      subscription_status:    "active",
    });

    console.log("[webhook] checkout completed — userId:", userId, "tier:", tier);
  }

  // ── customer.subscription.updated ────────────────────────────────────────
  else if (event.type === "customer.subscription.updated") {
    const sub      = event.data.object as Stripe.Subscription;
    const userId   = sub.metadata?.supabase_user_id
      ?? await userIdFromCustomer(svc, sub.customer as string);

    if (!userId) {
      console.warn("[webhook] subscription.updated: could not resolve user");
      return NextResponse.json({ received: true });
    }

    const priceId = sub.items.data[0]?.price?.id ?? "";
    const tier    = PRICE_TO_TIER[priceId] ?? "free";

    // Map Stripe statuses to our enum
    const statusMap: Record<string, string> = {
      active:             "active",
      past_due:           "past_due",
      canceled:           "cancelled",
      unpaid:             "past_due",
      trialing:           "active",
      incomplete:         "inactive",
      incomplete_expired: "inactive",
      paused:             "inactive",
    };
    const status = statusMap[sub.status] ?? "inactive";

    await updateProfile(svc, userId, {
      subscription_tier:   tier,
      subscription_status: status,
    });

    console.log("[webhook] subscription updated — userId:", userId, "status:", status, "tier:", tier);
  }

  // ── customer.subscription.deleted ────────────────────────────────────────
  else if (event.type === "customer.subscription.deleted") {
    const sub    = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.supabase_user_id
      ?? await userIdFromCustomer(svc, sub.customer as string);

    if (!userId) {
      console.warn("[webhook] subscription.deleted: could not resolve user");
      return NextResponse.json({ received: true });
    }

    await updateProfile(svc, userId, {
      subscription_tier:      "free",
      subscription_status:    "cancelled",
      stripe_subscription_id: null,
    });

    console.log("[webhook] subscription deleted — userId:", userId);
  }

  return NextResponse.json({ received: true });
}
