import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildMaintenancePdf } from "@/lib/maintenancePdf";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const [{ data: requests, error }, { data: profile }] = await Promise.all([
    (supabase as any)
      .from("maintenance_requests")
      .select("*")
      .eq("tenant_id", user.id)
      .order("logged_at", { ascending: true }),
    (supabase as any)
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tenantName     = profile?.full_name ?? "Tenant";
  const propertyAddress = requests?.[0]?.guest_landlord_name
    ? `via ${requests[0].guest_landlord_name}`
    : "Various properties";

  const buffer = await buildMaintenancePdf(requests ?? [], tenantName, propertyAddress);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="maintenance-log.pdf"`,
    },
  });
}
