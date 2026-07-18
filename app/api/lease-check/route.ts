import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf, analyseLeaseText } from "@/lib/leaseCheck";
import { LEASE_CHECK_FEE } from "@/lib/leaseCheckPricing";

export const dynamic = "force-dynamic";

/**
 * GET /api/lease-check
 * Tells the client whether the user still has a free check, an unconsumed
 * paid credit, or needs to pay before uploading another lease.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { count: priorChecks } = await (supabase as any)
    .from("lease_checks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const freeCheckAvailable = (priorChecks ?? 0) === 0;

  let hasCredit = false;
  if (!freeCheckAvailable) {
    const { data: credit } = await (supabase as any)
      .from("lease_check_credits")
      .select("id")
      .eq("user_id", user.id)
      .eq("consumed", false)
      .limit(1)
      .maybeSingle();
    hasCredit = !!credit;
  }

  return NextResponse.json({ freeCheckAvailable, hasCredit, fee: LEASE_CHECK_FEE });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { document_url: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.document_url) {
    return NextResponse.json({ error: "document_url required" }, { status: 400 });
  }

  // ── Gate: first check free, additional checks need a paid credit ─────────
  const { count: priorChecks } = await (supabase as any)
    .from("lease_checks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  let creditId: string | null = null;

  if ((priorChecks ?? 0) > 0) {
    const { data: credit } = await (supabase as any)
      .from("lease_check_credits")
      .select("id")
      .eq("user_id", user.id)
      .eq("consumed", false)
      .limit(1)
      .maybeSingle();

    if (!credit) {
      return NextResponse.json(
        { error: "payment_required", fee: LEASE_CHECK_FEE },
        { status: 402 },
      );
    }
    creditId = credit.id as string;
  }

  // Create a pending record immediately so the client can poll
  const { data: check, error: insertError } = await (supabase as any)
    .from("lease_checks")
    .insert({ user_id: user.id, document_url: body.document_url, status: "processing" })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  if (creditId) {
    await (supabase as any)
      .from("lease_check_credits")
      .update({ consumed: true, consumed_at: new Date().toISOString() })
      .eq("id", creditId);
  }

  // Kick off extraction + analysis in the background (best-effort in serverless)
  processLeaseCheck(check.id, body.document_url, supabase).catch(async () => {
    await (supabase as any)
      .from("lease_checks")
      .update({ status: "failed" })
      .eq("id", check.id);
  });

  return NextResponse.json({ id: check.id, status: "processing" }, { status: 202 });
}

async function processLeaseCheck(
  checkId:     string,
  documentUrl: string,
  supabase:    Awaited<ReturnType<typeof createClient>>,
) {
  const res = await fetch(documentUrl);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);

  const contentType = res.headers.get("content-type") ?? "";
  const buffer = Buffer.from(await res.arrayBuffer());

  let text: string;
  if (contentType.includes("pdf") || documentUrl.toLowerCase().endsWith(".pdf")) {
    text = await extractTextFromPdf(buffer);
  } else {
    text = buffer.toString("utf-8");
  }

  const flags = await analyseLeaseText(text);

  await (supabase as any)
    .from("lease_checks")
    .update({ extracted_text: text, status: "completed", completed_at: new Date().toISOString() })
    .eq("id", checkId);

  if (flags.length > 0) {
    await (supabase as any)
      .from("lease_check_flags")
      .insert(flags.map((f) => ({ ...f, lease_check_id: checkId })));
  }
}
