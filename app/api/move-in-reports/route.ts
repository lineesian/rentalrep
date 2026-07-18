import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: {
    property_address:     string;
    landlord_id?:         string;
    guest_landlord_name?: string;
    guest_landlord_email?:string;
    lease_id?:            string;
  };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.property_address) {
    return NextResponse.json({ error: "property_address required" }, { status: 400 });
  }
  if (!body.landlord_id && !body.guest_landlord_name) {
    return NextResponse.json({ error: "landlord_id or guest_landlord_name required" }, { status: 400 });
  }

  const { data, error } = await (supabase as any)
    .from("move_in_reports")
    .insert({
      tenant_id:            user.id,
      property_address:     body.property_address,
      landlord_id:          body.landlord_id ?? null,
      guest_landlord_name:  body.guest_landlord_name ?? null,
      guest_landlord_email: body.guest_landlord_email ?? null,
      lease_id:             body.lease_id ?? null,
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

  const { data, error } = await (supabase as any)
    .from("move_in_reports")
    .select("*, move_in_report_photos(*)")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
