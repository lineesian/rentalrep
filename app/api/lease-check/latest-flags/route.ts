import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: check } = await (supabase as any)
    .from("lease_checks")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!check) return NextResponse.json({ flags: [] });

  const { data: flags } = await (supabase as any)
    .from("lease_check_flags")
    .select("id, flag_type, clause_excerpt, explanation")
    .eq("lease_check_id", check.id);

  return NextResponse.json({ flags: flags ?? [] });
}
