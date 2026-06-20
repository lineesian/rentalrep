import { NextRequest, NextResponse } from "next/server";
import { createClient }        from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * POST /api/notifications
 * Called client-side immediately after a successful review insert.
 * Creates the appropriate in-app notifications for the involved parties.
 *
 * Body: { review_id: string }
 *
 * This endpoint:
 *   - Authenticates the caller (must be the reviewer)
 *   - Fetches review details with service-role (bypasses RLS)
 *   - Creates notifications with service-role (bypasses RLS insert block)
 */
export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { review_id?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { review_id } = body;
  if (!review_id || typeof review_id !== "string") {
    return NextResponse.json({ error: "missing_review_id" }, { status: 400 });
  }

  // ── Fetch review details ──────────────────────────────────────────────────
  const svc = createServiceClient();

  const { data: review, error: reviewErr } = await svc
    .from("reviews")
    .select(`
      id,
      reviewer_id,
      reviewee_id,
      status,
      reviewer_role,
      reviewee_role,
      reviewer:profiles!reviewer_id(full_name),
      reviewee:profiles!reviewee_id(full_name)
    `)
    .eq("id", review_id)
    .single();

  if (reviewErr || !review) {
    return NextResponse.json({ error: "review_not_found" }, { status: 404 });
  }

  // Only the reviewer can trigger notifications for their own review
  if (review.reviewer_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const reviewerRecord = review.reviewer as unknown as { full_name: string } | null;
  const reviewerName  = reviewerRecord?.full_name ?? "Someone";
  const notifications: {
    user_id: string;
    type: string;
    title: string;
    body: string;
    related_review_id: string;
  }[] = [];

  const isProperty = review.reviewee_role === "property";

  if (review.status === "pending_reveal" && review.reviewee_id) {
    // Reviewer submitted — notify reviewee to submit their own
    notifications.push({
      user_id:           review.reviewee_id,
      type:              "pending_nudge",
      title:             "Someone reviewed you",
      body:              `${reviewerName} has submitted a review about you. Submit your review to reveal both simultaneously.`,
      related_review_id: review_id,
    });
  } else if (review.status === "published") {
    // Mutual reveal triggered — notify both parties
    if (review.reviewee_id) {
      notifications.push({
        user_id:           review.reviewee_id,
        type:              "review_published",
        title:             "Your review is now live",
        body:              `Both you and ${reviewerName} have submitted reviews. They are now published on your profiles.`,
        related_review_id: review_id,
      });
    }
    notifications.push({
      user_id:           review.reviewer_id,
      type:              "review_published",
      title:             "Your review is now live",
      body:              isProperty
        ? "Your property review has been published."
        : "Both parties submitted — your reviews are now published.",
      related_review_id: review_id,
    });
  }

  if (notifications.length === 0) {
    return NextResponse.json({ ok: true, created: 0 });
  }

  const { error: insertErr } = await svc.from("notifications").insert(notifications);

  if (insertErr) {
    console.error("[api/notifications] insert error:", insertErr.message);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, created: notifications.length });
}

/**
 * PATCH /api/notifications
 * Mark one or all notifications as read.
 *
 * Body: { id?: string }  — omit id to mark all as read
 */
export async function PATCH(req: NextRequest) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { id?: string };
  try { body = await req.json(); } catch { body = {}; }

  // Use anon client (RLS update policy covers this).
  // Cast through any because "notifications" isn't in generated types until migration runs.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = userClient as any;
  let query = db.from("notifications").update({ read: true }).eq("user_id", user.id);
  if (body.id) query = query.eq("id", body.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (query as any);
  if (error) {
    return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
