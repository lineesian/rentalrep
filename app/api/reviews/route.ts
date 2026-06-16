import { NextRequest, NextResponse } from "next/server";
import { getReviewWindowStatus, formatDateZA } from "@/lib/reviewWindow";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/reviews
 * Server-side gate: validates the review window before any DB writes.
 * The client calls this first; actual DB writes still happen client-side
 * via the Supabase JS SDK (so storage, leases, and reviews keep their
 * existing RLS-based auth flow).
 *
 * Body: { lease_end: string }   (ISO date string, e.g. "2026-04-30")
 * Returns 200 { ok: true }      — window is open, proceed
 * Returns 403 { error, message } — window closed or not yet open
 * Returns 401                   — not authenticated
 */
export async function POST(req: NextRequest) {
  // Auth check — must be a logged-in user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { lease_end?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { lease_end } = body;
  if (!lease_end || typeof lease_end !== "string") {
    return NextResponse.json({ error: "missing_lease_end" }, { status: 400 });
  }

  const window = getReviewWindowStatus(lease_end);

  if (window.status === "too_early") {
    return NextResponse.json(
      {
        error: "review_window_closed",
        message: `Reviews can only be submitted from ${formatDateZA(window.opensOn)}, which is 14 days before the lease end date.`,
      },
      { status: 403 },
    );
  }

  if (window.status === "expired") {
    return NextResponse.json(
      {
        error: "review_window_closed",
        message: `The review window closed on ${formatDateZA(window.closedOn)}. Reviews must be submitted within 90 days of the lease end date.`,
      },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true });
}
