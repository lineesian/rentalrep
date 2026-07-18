import { NextRequest, NextResponse } from "next/server";
import { createServiceClient }       from "@/lib/supabase/service";
import {
  PAYFAST_PASSPHRASE,
  verifyPayFastSignature,
}                                    from "@/lib/payfast";
import { ITEM_NAME_TO_TIER }         from "@/lib/plans";
import { LEASE_CHECK_ITEM_NAME }     from "@/lib/leaseCheckPricing";

/**
 * POST /api/payfast/webhook  (PayFast ITN — Instant Transaction Notification)
 *
 * PayFast sends a URL-encoded POST body to this endpoint after every
 * payment event. We verify the signature and update the subscriber's profile.
 *
 * PayFast requires a 200 OK response with no content; anything else is
 * treated as a failure and the notification will be retried.
 */

// Disable body parsing — we need the raw URL-encoded body for signature verification
export const runtime = "nodejs";

async function updateProfile(
  svc: ReturnType<typeof createServiceClient>,
  userId: string,
  patch: Record<string, unknown>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (svc as any).from("profiles").update(patch).eq("id", userId);
  if (error) {
    console.error("[payfast/webhook] profile update error:", error.message, "userId:", userId);
  }
}

export async function POST(req: NextRequest) {
  // ── Parse URL-encoded body ────────────────────────────────────────────────
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return new NextResponse("bad_request", { status: 400 });
  }

  const params: Record<string, string> = {};
  new URLSearchParams(rawBody).forEach((value, key) => {
    params[key] = value;
  });

  // ── Verify signature ─────────────────────────────────────────────────────
  if (!verifyPayFastSignature(params, PAYFAST_PASSPHRASE)) {
    console.warn("[payfast/webhook] signature mismatch — ignoring notification");
    // Return 200 anyway so PayFast stops retrying invalid data
    return new NextResponse("ok", { status: 200 });
  }

  const paymentStatus = params.payment_status;
  const userId        = params.m_payment_id;
  const itemName      = params.item_name ?? "";
  const token         = params.token ?? null; // PayFast subscription token

  if (!userId) {
    console.warn("[payfast/webhook] missing m_payment_id");
    return new NextResponse("ok", { status: 200 });
  }

  const svc = createServiceClient();

  // ── Lease Check once-off credit ─────────────────────────────────────────
  if (itemName === LEASE_CHECK_ITEM_NAME) {
    if (paymentStatus === "COMPLETE") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (svc as any).from("lease_check_credits").insert({
        user_id:           userId,
        payfast_reference: params.pf_payment_id ?? null,
        consumed:           false,
      });
      if (error) {
        console.error("[payfast/webhook] lease check credit insert error:", error.message);
      } else {
        console.log("[payfast/webhook] lease check credit granted — userId:", userId);
      }
    }
    return new NextResponse("ok", { status: 200 });
  }

  // ── COMPLETE ─────────────────────────────────────────────────────────────
  if (paymentStatus === "COMPLETE") {
    const tier = ITEM_NAME_TO_TIER[itemName] ?? "free";

    await updateProfile(svc, userId, {
      subscription_tier:        tier,
      subscription_status:      "active",
      payfast_token:            token,
      // store PayFast's internal payment ID as the subscription reference
      payfast_subscription_id:  params.pf_payment_id ?? null,
    });

    console.log("[payfast/webhook] COMPLETE — userId:", userId, "tier:", tier);
  }

  // ── CANCELLED ────────────────────────────────────────────────────────────
  else if (paymentStatus === "CANCELLED") {
    await updateProfile(svc, userId, {
      subscription_tier:       "free",
      subscription_status:     "cancelled",
      payfast_token:           null,
      payfast_subscription_id: null,
    });

    console.log("[payfast/webhook] CANCELLED — userId:", userId);
  }

  else {
    console.log("[payfast/webhook] unhandled payment_status:", paymentStatus, "userId:", userId);
  }

  // PayFast requires a plain 200 OK
  return new NextResponse("ok", { status: 200 });
}
