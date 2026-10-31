import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MIN_SCORE = 7.0;

// GET /api/looking-to-rent — paginated board
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const area   = searchParams.get("area")?.trim() ?? "";
  const minBudget = parseInt(searchParams.get("min_budget") ?? "0") || 0;
  const maxBudget = parseInt(searchParams.get("max_budget") ?? "0") || 0;

  const supabase = await createClient();

  let query = (supabase as any)
    .from("looking_to_rent")
    .select(`
      *,
      tenant:profiles(id, full_name, avatar_url, suburb, city),
      score:reputation_scores(overall, review_count)
    `)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (area)      query = query.contains("areas", [area]);
  if (minBudget) query = query.gte("budget_max", minBudget);
  if (maxBudget) query = query.lte("budget_min", maxBudget);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/looking-to-rent — create or replace listing (score-gated)
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check role
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "tenant") {
    return NextResponse.json({ error: "Only tenants can post on this board" }, { status: 403 });
  }

  // Score gate
  const { data: score } = await (supabase as any)
    .from("reputation_scores")
    .select("overall")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!score || score.overall < MIN_SCORE) {
    return NextResponse.json(
      { error: `A RentalRep score of ${MIN_SCORE} or higher is required to post on this board.` },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { areas, budget_min, budget_max, move_in_from, description } = body as {
    areas:       string[];
    budget_min:  number;
    budget_max:  number;
    move_in_from: string;
    description: string;
  };

  if (!areas?.length || !budget_min || !budget_max || !move_in_from || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Upsert: one listing per tenant
  const { data, error } = await (supabase as any)
    .from("looking_to_rent")
    .upsert(
      { tenant_id: user.id, areas, budget_min, budget_max, move_in_from, description, active: true },
      { onConflict: "tenant_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/looking-to-rent — deactivate own listing
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await (supabase as any)
    .from("looking_to_rent")
    .update({ active: false })
    .eq("tenant_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
