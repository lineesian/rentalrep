import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// This route is called by Vercel Cron (configured in vercel.json).
// It runs as the service_role so it can bypass RLS and call the
// check_and_publish_reviews() function which handles:
//   1. Matched pairs where both parties have submitted
//   2. Solo reviews older than 90 days (status → 'expired')

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (or an internal call)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase.rpc("check_and_publish_reviews");

  if (error) {
    console.error("[cron/publish-reviews] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[cron/publish-reviews] published ${data} reviews`);
  return NextResponse.json({ published: data, timestamp: new Date().toISOString() });
}
