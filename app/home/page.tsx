import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Avatar } from "@/components/ui/Avatar";
import { StarRow } from "@/components/ui/StarRow";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: scoreRow } = await supabase
    .from("reputation_scores")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviewer_id(full_name, avatar_url, suburb)")
    .eq("reviewee_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const score = scoreRow?.overall ?? 0;
  const name = profile?.full_name ?? "Welcome";

  return (
    <div className="screen">
      {/* Header */}
      <div className="bg-petrol-400 px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={30} />
            <div>
              <p className="font-heading font-bold text-[17px] text-white leading-none">RentalRep</p>
              <p className="text-[9px] text-teal-400 font-medium tracking-wide mt-0.5">
                Rate. Trust. Rent with Confidence.
              </p>
            </div>
          </div>
          <Avatar name={name} size="sm" />
        </div>
      </div>

      <div className="px-4 pt-0">
        {/* Reputation card */}
        <div className="bg-petrol-400 rounded-3xl p-5 mt-0 mb-4 border border-teal-400/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-teal-300 text-xs font-medium mb-1">Your Reputation</p>
              <h2 className="font-heading font-bold text-xl text-white mb-2">{name}</h2>
              <span className="badge-verified">✓ Verified {profile?.role ?? "member"}</span>
            </div>
            <ScoreRing score={score > 0 ? score : 0} size={88} />
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-6">
            {[
              { v: scoreRow?.review_count ?? 0, l: "Reviews" },
              { v: "–", l: "Properties" },
              { v: score > 0 ? `${Math.round(score * 10)}%` : "–", l: "Trust Score" },
            ].map(({ v, l }) => (
              <div key={l}>
                <p className="font-heading font-bold text-base text-gold-400">{v}</p>
                <p className="text-[11px] text-teal-300">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Rate a Landlord", icon: "🏠", href: "/review/new?type=landlord" },
            { label: "Rate a Tenant",   icon: "👤", href: "/review/new?type=tenant" },
            { label: "My Profile",      icon: "⭐", href: `/profile/${user.id}` },
          ].map(({ label, icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1.5 bg-white border border-gray-100 rounded-2xl py-4 px-2 transition-transform active:scale-95"
            >
              <span className="text-2xl">{icon}</span>
              <span className="font-body text-[11px] font-semibold text-petrol-400 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>

        {/* Recent reviews */}
        <p className="section-label">Recent Reviews</p>

        {recentReviews && recentReviews.length > 0 ? (
          recentReviews.map((r) => {
            const reviewer = r.reviewer as { full_name: string; avatar_url: string | null; suburb: string | null } | null;
            return (
              <div key={r.id} className="card mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar name={reviewer?.full_name ?? "?"} avatarUrl={reviewer?.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-petrol-400 truncate">{reviewer?.full_name ?? "Anonymous"}</p>
                    <p className="text-xs text-gray-400">{reviewer?.suburb} · {new Date(r.created_at).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}</p>
                  </div>
                  <span className="font-heading font-bold text-sm text-teal-400">{(r.overall * 2).toFixed(1)}/10</span>
                </div>
                <StarRow value={r.overall} size="sm" />
                <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{r.body}</p>
              </div>
            );
          })
        ) : (
          <div className="card text-center py-8">
            <p className="text-2xl mb-2">📭</p>
            <p className="font-heading font-semibold text-petrol-400 mb-1">No reviews yet</p>
            <p className="text-xs text-gray-400">Reviews from landlords and tenants will appear here.</p>
          </div>
        )}
      </div>

      <BottomNav profileId={user.id} />
    </div>
  );
}
