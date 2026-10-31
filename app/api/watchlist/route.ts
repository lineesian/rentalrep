import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/watchlist — list user's saved items with resolved names / addresses
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await (supabase as any)
    .from("watchlist_items")
    .select(`
      id,
      created_at,
      profile_id,
      property_id,
      profile:profiles(id, full_name, avatar_url, role, suburb, city),
      property:properties(id, address, suburb, city)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/watchlist — add an item  { profile_id? | property_id? }
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { profile_id, property_id } = body as { profile_id?: string; property_id?: string };

  if (!profile_id && !property_id) {
    return NextResponse.json({ error: "profile_id or property_id required" }, { status: 400 });
  }
  if (profile_id && property_id) {
    return NextResponse.json({ error: "provide only one of profile_id or property_id" }, { status: 400 });
  }

  const { data, error } = await (supabase as any)
    .from("watchlist_items")
    .insert({ user_id: user.id, profile_id: profile_id ?? null, property_id: property_id ?? null })
    .select()
    .single();

  if (error) {
    // unique violation — already saved
    if (error.code === "23505") return NextResponse.json({ error: "Already saved" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/watchlist?profile_id=… or ?property_id=…
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const profile_id  = searchParams.get("profile_id");
  const property_id = searchParams.get("property_id");

  if (!profile_id && !property_id) {
    return NextResponse.json({ error: "profile_id or property_id required" }, { status: 400 });
  }

  let query = (supabase as any)
    .from("watchlist_items")
    .delete()
    .eq("user_id", user.id);

  if (profile_id)  query = query.eq("profile_id",  profile_id);
  if (property_id) query = query.eq("property_id", property_id);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
