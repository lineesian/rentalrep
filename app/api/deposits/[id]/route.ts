import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: {
    status?:           string;
    amount_returned?:  number;
    amount_withheld?:  number;
    deduction_reason?: string;
    evidence_url?:     string;
  };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const validStatuses = ["held", "returned_full", "returned_partial", "withheld", "disputed"];
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined)           updates.status           = body.status;
  if (body.amount_returned !== undefined)  updates.amount_returned  = body.amount_returned;
  if (body.amount_withheld !== undefined)  updates.amount_withheld  = body.amount_withheld;
  if (body.deduction_reason !== undefined) updates.deduction_reason = body.deduction_reason;
  if (body.evidence_url !== undefined)     updates.evidence_url     = body.evidence_url;

  const resolved = body.status && body.status !== "held";
  if (resolved) updates.resolved_at = new Date().toISOString();

  const { data, error } = await (supabase as any)
    .from("deposits")
    .update(updates)
    .eq("id", params.id)
    .eq("tenant_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(data);
}
