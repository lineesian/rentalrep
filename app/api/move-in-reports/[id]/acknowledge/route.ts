import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data, error } = await (supabase as any)
    .from("move_in_reports")
    .update({ landlord_acknowledged_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("landlord_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_found_or_forbidden" }, { status: 404 });
  return NextResponse.json(data);
}
