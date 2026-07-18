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

  let body: { resolution_photo_url?: string } = {};
  try { body = await req.json(); } catch { /* optional body */ }

  const updates: Record<string, unknown> = {
    resolved_at: new Date().toISOString(),
  };
  if (body.resolution_photo_url) updates.resolution_photo_url = body.resolution_photo_url;

  const { data, error } = await (supabase as any)
    .from("maintenance_requests")
    .update(updates)
    .eq("id", params.id)
    .eq("tenant_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_found_or_forbidden" }, { status: 404 });
  return NextResponse.json(data);
}
