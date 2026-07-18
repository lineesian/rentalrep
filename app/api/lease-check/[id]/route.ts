import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: check, error } = await (supabase as any)
    .from("lease_checks")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !check) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (check.status !== "completed") {
    return NextResponse.json({ id: check.id, status: check.status });
  }

  const { data: flags } = await (supabase as any)
    .from("lease_check_flags")
    .select("*")
    .eq("lease_check_id", params.id)
    .order("risk_level", { ascending: false });

  return NextResponse.json({ ...check, flags: flags ?? [] });
}
