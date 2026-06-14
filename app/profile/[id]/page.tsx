import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const [{ data: profile }, { data: scoreRow }, { data: reviews }, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", params.id).single(),
    supabase.from("reputation_scores").select("*").eq("profile_id", params.id).single(),
    supabase
      .from("reviews")
      .select("*, reviewer:profiles!reviewer_id(id, full_name, avatar_url, suburb), lease:leases(property_address, suburb, start_date, end_date)")
      .eq("reviewee_id", params.id)
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  if (!profile) notFound();

  return (
    <div className="screen">
      <ProfileView
        profile={profile}
        score={scoreRow ?? null}
        reviews={reviews ?? []}
        isOwner={user?.id === params.id}
      />
      <BottomNav />
    </div>
  );
}
