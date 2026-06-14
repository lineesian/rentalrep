import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { BottomNav } from "@/components/layout/BottomNav";

// Always fetch fresh — never serve a cached profile page
export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();

  // Resolve auth FIRST so any token refresh completes before DB queries run.
  // Running getUser() concurrently with DB queries on the same client can cause
  // the DB requests to fire with a stale JWT if a refresh is in flight.
  const { data: { user } } = await supabase.auth.getUser();

  // Now run all three data fetches in parallel with a stable auth context.
  const [
    { data: profile, error: profileError },
    { data: scoreRow },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("reputation_scores")
      .select("*")
      .eq("profile_id", id)
      .maybeSingle(),
    supabase
      .from("reviews")
      .select(
        "*, reviewer:profiles!reviewer_id(id, full_name, avatar_url, suburb), lease:leases(property_address, suburb, start_date, end_date)"
      )
      .eq("reviewee_id", id)
      .order("created_at", { ascending: false }),
  ]);

  // maybeSingle() returns { data: null, error: null } for 0 rows — no error code needed.
  // Only hard-404 when the profile genuinely doesn't exist.
  if (!profile && !profileError) notFound();

  return (
    <div className="screen">
      <ProfileView
        profile={profile}
        score={scoreRow ?? null}
        reviews={reviews ?? []}
        isOwner={user?.id === id}
        fetchError={profileError?.message ?? null}
      />
      <BottomNav profileId={user?.id} />
    </div>
  );
}
