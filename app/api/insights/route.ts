import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const [
    { data: summary },
    { data: landlordScores },
    { data: depositStats },
    { data: activity },
    { data: maintenanceStats },
  ] = await Promise.all([
    (supabase as any).from("v_platform_summary").select("*").maybeSingle(),
    (supabase as any).from("v_suburb_landlord_scores").select("*").limit(10),
    (supabase as any).from("v_suburb_deposit_stats").select("*").limit(10),
    (supabase as any).from("v_suburb_activity").select("*").limit(10),
    (supabase as any).from("v_suburb_maintenance_stats").select("*").limit(10),
  ]);

  return NextResponse.json(
    {
      summary:          summary  ?? {},
      landlordScores:   landlordScores  ?? [],
      depositStats:     depositStats    ?? [],
      activity:         activity        ?? [],
      maintenanceStats: maintenanceStats ?? [],
      generatedAt:      new Date().toISOString(),
    },
    {
      headers: {
        // Allow CDN/browser to cache for 1 hour
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
