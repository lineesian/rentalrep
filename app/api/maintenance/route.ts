import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CATEGORIES = ["plumbing","electrical","structural","appliance","security","other"] as const;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: {
    landlord_id?:          string;
    guest_landlord_name?:  string;
    guest_landlord_email?: string;
    lease_id?:             string;
    category:              string;
    description:           string;
    photo_url?:            string;
  };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.category || !body.description) {
    return NextResponse.json({ error: "missing_required_fields" }, { status: 400 });
  }
  if (!CATEGORIES.includes(body.category as typeof CATEGORIES[number])) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  }
  if (!body.landlord_id && !body.guest_landlord_name) {
    return NextResponse.json({ error: "landlord_id or guest_landlord_name required" }, { status: 400 });
  }

  const { data, error } = await (supabase as any)
    .from("maintenance_requests")
    .insert({
      tenant_id:            user.id,
      landlord_id:          body.landlord_id ?? null,
      guest_landlord_name:  body.guest_landlord_name ?? null,
      guest_landlord_email: body.guest_landlord_email ?? null,
      lease_id:             body.lease_id ?? null,
      category:             body.category,
      description:          body.description,
      photo_url:            body.photo_url ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit  = parseInt(searchParams.get("limit")  ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const { data, error } = await (supabase as any)
    .from("maintenance_requests")
    .select("*")
    .eq("tenant_id", user.id)
    .order("logged_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
