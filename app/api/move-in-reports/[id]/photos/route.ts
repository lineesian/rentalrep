import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // Verify the report belongs to this tenant
  const { data: report } = await (supabase as any)
    .from("move_in_reports")
    .select("id")
    .eq("id", params.id)
    .eq("tenant_id", user.id)
    .single();

  if (!report) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let body: { room_label: string; photo_url: string; caption?: string; taken_at?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.room_label || !body.photo_url) {
    return NextResponse.json({ error: "room_label and photo_url required" }, { status: 400 });
  }

  const { data, error } = await (supabase as any)
    .from("move_in_report_photos")
    .insert({
      move_in_report_id: params.id,
      room_label:        body.room_label,
      photo_url:         body.photo_url,
      caption:           body.caption ?? null,
      taken_at:          body.taken_at ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
