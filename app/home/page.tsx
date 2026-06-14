import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { StarRow } from "@/components/ui/StarRow";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  RateLandlordIcon,
  RateTenantIcon,
  RateAgencyIcon,
  ScreenTenantIcon,
  MyProfileIcon,
} from "@/components/ui/ActionIcons";
import type { UserRole } from "@/lib/types";

// Role-aware secondary stat label
function secondaryStat(role: UserRole) {
  if (role === "landlord") return "Properties";
  if (role === "agency")   return "Clients";
  return "Leases";
}

// Role-aware action cards — each role sees 3 relevant actions
function actionCards(role: UserRole, userId: string) {
  const myProfile = { label: "My Profile", Icon: MyProfileIcon, href: `/profile/${userId}` };

  if (role === "landlord") {
    return [
      { label: "Rate a Tenant",  Icon: RateTenantIcon,   href: "/review/new?type=tenant" },
      { label: "Rate an Agency", Icon: RateAgencyIcon,   href: "/review/new?type=agency" },
      myProfile,
    ];
  }
  if (role === "agency") {
    return [
      { label: "Screen a Tenant",  Icon: ScreenTenantIcon, href: "/agency" },
      { label: "Rate a Landlord",  Icon: RateLandlordIcon, href: "/review/new?type=landlord" },
      myProfile,
    ];
  }
  // tenant (default)
  return [
    { label: "Rate a Landlord", Icon: RateLandlordIcon, href: "/review/new?type=landlord" },
    { label: "Rate an Agency",  Icon: RateAgencyIcon,   href: "/review/new?type=agency" },
    myProfile,
  ];
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: scoreRow }, { data: recentReviews }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("reputation_scores").select("*").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("reviews")
      .select("*, reviewer:profiles!reviewer_id(full_name, avatar_url, suburb)")
      .eq("reviewee_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const score     = scoreRow?.overall ?? 0;
  const name      = profile?.full_name ?? "Welcome";
  const role      = (profile?.role ?? "tenant") as UserRole;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const cards     = actionCards(role, user.id);
  const statLabel = secondaryStat(role);

  return (
    <div className="screen">
      {/* ── Top header — slim app bar ── */}
      <div
        className="bg-petrol-400 px-4 flex items-center justify-between"
        style={{ paddingTop: "max(10px, env(safe-area-inset-top))", paddingBottom: 10 }}
      >
        <Logo size={28} />
          {/* Tappable avatar with white border + shadow — uploads photo */}
          <AvatarUpload
            userId={user.id}
            name={name}
            avatarUrl={profile?.avatar_url}
            variant="header"
          />
      </div>

      <div className="px-4 pt-4">
        {/* ── Reputation card ── */}
        <div className="bg-petrol-400 rounded-3xl p-5 mb-4 border border-teal-400/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-mint-300 text-xs font-medium mb-1 font-body">Your Reputation</p>
              <h2 className="font-heading font-bold text-xl text-white mb-2">{name}</h2>
              <span className="inline-flex items-center gap-1 bg-teal-400/20 text-mint-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                ✓ Verified {roleLabel}
              </span>
            </div>
            <ScoreRing score={score} size={88} />
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex gap-6">
            {/* Reviews count */}
            <div>
              <p className="font-heading font-bold text-base text-gold-400">
                {scoreRow?.review_count ?? 0}
              </p>
              <p className="text-[11px] text-mint-300 font-body">Reviews</p>
            </div>
            {/* Role-specific second stat */}
            <div>
              <p className="font-heading font-bold text-base text-gold-400">–</p>
              <p className="text-[11px] text-mint-300 font-body">{statLabel}</p>
            </div>
            {/* Trust score — "New" badge when no reviews yet */}
            <div>
              {score > 0 ? (
                <>
                  <p className="font-heading font-bold text-base text-gold-400">
                    {Math.round(score * 10)}%
                  </p>
                  <p className="text-[11px] text-mint-300 font-body">Trust Score</p>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center bg-teal-400/20 text-mint-400 text-[10px] font-semibold px-2 py-0.5 rounded-full font-body">
                    New
                  </span>
                  <p className="text-[11px] text-mint-300 font-body mt-0.5">Trust Score</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Role-aware action cards with SVG icons ── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {cards.map(({ label, Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-4 px-2 transition-transform active:scale-95"
            >
              <Icon size={28} />
              <span className="font-body text-[11px] font-semibold text-petrol-400 text-center leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* ── Recent Reviews ── */}
        <p className="font-heading text-xs font-semibold text-petrol-400 tracking-widest mb-3">
          Recent Reviews
        </p>

        {recentReviews && recentReviews.length > 0 ? (
          recentReviews.map((r) => {
            const reviewer = r.reviewer as {
              full_name: string;
              avatar_url: string | null;
              suburb: string | null;
            } | null;
            return (
              <div key={r.id} className="card mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar
                    name={reviewer?.full_name ?? "?"}
                    avatarUrl={reviewer?.avatar_url}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-petrol-400 truncate">
                      {reviewer?.full_name ?? "Anonymous"}
                    </p>
                    <p className="text-xs text-sage-400 font-body">
                      {reviewer?.suburb} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("en-ZA", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="font-heading font-bold text-sm text-teal-400">
                    {(r.overall * 2).toFixed(1)}/10
                  </span>
                </div>
                <StarRow value={r.overall} size="sm" />
                <p className="text-xs text-sage-400 font-body mt-2 leading-relaxed line-clamp-3">
                  {r.body}
                </p>
              </div>
            );
          })
        ) : (
          <div className="card text-center py-8">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-3" aria-hidden="true">
              <rect x="4" y="10" width="32" height="22" rx="2.5" stroke="#0E9E92" strokeWidth={2}/>
              <path d="M4 13l16 11 16-11" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-heading font-semibold text-petrol-400 mb-1">No reviews yet</p>
            <p className="text-xs text-sage-400 font-body leading-relaxed">
              Your reputation starts here. Complete a tenancy to get your first review.
            </p>
          </div>
        )}
      </div>

      <BottomNav profileId={user.id} />
    </div>
  );
}
