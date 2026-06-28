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
  RateAgentIcon,
  RatePropertyIcon,
  ScreenTenantIcon,
  MyProfileIcon,
} from "@/components/ui/ActionIcons";
import type { UserRole } from "@/lib/types";
import type { Review } from "@/lib/types";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { calculateBadges } from "@/lib/badges";
import { BadgePill } from "@/components/ui/BadgePill";

// Role-aware secondary stat label
function secondaryStat(role: UserRole) {
  if (role === "landlord") return "Properties";
  if (role === "agency")   return "Clients";
  return "Leases";
}

// Role-aware action cards
function actionCards(role: UserRole, userId: string) {
  const myProfile = { label: "My Profile", Icon: MyProfileIcon, href: `/profile/${userId}` };

  if (role === "landlord") {
    return [
      { label: "Rate a Tenant",  Icon: RateTenantIcon,   href: "/review/new?type=tenant&from=landlord" },
      { label: "Rate an Agency", Icon: RateAgencyIcon,   href: "/review/new?type=agency&from=landlord" },
      myProfile,
    ];
  }
  if (role === "agency") {
    return [
      { label: "Screen a Tenant", Icon: ScreenTenantIcon, href: "/agency" },
      { label: "Rate a Landlord", Icon: RateLandlordIcon, href: "/review/new?type=landlord&from=agency" },
      myProfile,
    ];
  }
  // tenant — 4 quick-action cards (profile is always in bottom nav)
  return [
    { label: "Rate a Landlord", Icon: RateLandlordIcon, href: "/review/new?type=landlord&from=tenant" },
    { label: "Rate an Agent",   Icon: RateAgentIcon,    href: "/review/new?type=agent&from=tenant" },
    { label: "Rate an Agency",  Icon: RateAgencyIcon,   href: "/review/new?type=agency&from=tenant" },
    { label: "Rate a Property", Icon: RatePropertyIcon, href: "/review/new?type=property&from=tenant" },
  ];
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Guard: send new users through onboarding before they reach the dashboard
  const { data: onboardCheck } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();
  if (onboardCheck && !onboardCheck.onboarding_completed) redirect("/onboarding");

  const [
    { data: profile },
    { data: scoreRow },
    { data: recentReviews },
    { count: reviewCount },
    { count: leaseCount },
    { data: pendingReviews },
    { data: receivedReviews },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("reputation_scores").select("*").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("reviews")
      .select("*, reviewee:profiles!reviewee_id(full_name, avatar_url)")
      .eq("reviewer_id", user.id)
      .in("status", ["published", "expired"])
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("reviewer_id", user.id).in("status", ["published", "expired"]),
    supabase.from("leases").select("*", { count: "exact", head: true }).eq("tenant_id", user.id),
    supabase.rpc("get_pending_review_info", { p_user_id: user.id }),
    supabase.from("reviews").select("*").eq("reviewee_id", user.id).in("status", ["published", "expired"]),
  ]);

  const score     = scoreRow?.overall ?? 0;
  const name      = profile?.full_name ?? "Welcome";
  const role      = (profile?.role ?? "tenant") as UserRole;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const cards     = actionCards(role, user.id);
  const statLabel = secondaryStat(role);
  const badges    = profile
    ? calculateBadges((receivedReviews ?? []) as Review[], profile.role)
    : [];

  return (
    <div className="screen">
      {/* ── Top header — slim app bar ── */}
      <div
        className="bg-petrol-400 px-4 flex items-center justify-between"
        style={{ paddingTop: "max(10px, env(safe-area-inset-top))", paddingBottom: 10 }}
      >
        <Logo size={28} />
        <div className="flex items-center gap-1">
          <NotificationBell userId={user.id} />
          {/* Tappable avatar with white border + shadow — uploads photo */}
          <AvatarUpload
            userId={user.id}
            name={name}
            avatarUrl={profile?.avatar_url}
            variant="header"
          />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* ── Reputation card ── */}
        <div className="bg-petrol-400 rounded-3xl p-5 mb-4 border border-teal-400/20">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-mint-300 text-xs font-medium font-body">Your Reputation</p>
                {/* Show upgrade nudge only for free users */}
                {(!profile || (profile as unknown as { subscription_tier?: string }).subscription_tier === "free" || !(profile as unknown as { subscription_tier?: string }).subscription_tier) && (
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center gap-1 text-[10px] font-bold font-heading px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#F5C842", color: "#0D2B2A" }}
                  >
                    <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M8 1.5l1.9 4.8h5.1L11 9.3l1.6 4.9L8 11.5 3.4 14.2 5 9.3.9 6.3H6L8 1.5z" stroke="#0D2B2A" strokeWidth="1.5" fill="#0D2B2A" strokeLinejoin="round"/>
                    </svg>
                    Upgrade
                  </Link>
                )}
              </div>
              <h2 className="font-heading font-bold text-xl text-white mb-2">{name}</h2>
              <span className="inline-flex items-center gap-1 bg-teal-400/20 text-mint-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                <span style={{ color: "#F4B53F" }}>✓</span> Verified {roleLabel}
              </span>
            </div>
            <ScoreRing score={score} size={88} />
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex gap-6">
            {/* Reviews written by the user */}
            <div>
              <p className="font-heading font-bold text-base text-gold-400">
                {reviewCount ?? 0}
              </p>
              <p className="text-[11px] text-mint-300 font-body">Reviews</p>
            </div>
            {/* Role-specific second stat (leases for tenants) */}
            <div>
              <p className="font-heading font-bold text-base text-gold-400">
                {leaseCount ?? 0}
              </p>
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
            {/* Badge count */}
            <div>
              <p className="font-heading font-bold text-base text-gold-400">{badges.length}</p>
              <p className="text-[11px] text-mint-300 font-body">Badges</p>
            </div>
          </div>

          {/* ── Badge pills ── */}
          {badges.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pt-3 mt-1 no-scrollbar">
              {badges.map((b) => (
                <BadgePill key={b.id} badge={b} dark />
              ))}
            </div>
          )}
        </div>

        {/* ── Role-aware action cards ── */}
        <div className={`grid gap-3 mb-8 ${cards.length === 4 ? "grid-cols-2" : "grid-cols-3"}`}>
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

        {/* ── Pending Reviews nudge ── */}
        {pendingReviews && pendingReviews.length > 0 && (
          <div className="mb-6">
            <p className="font-heading text-xs font-semibold text-petrol-400 tracking-widest mb-3">
              Pending Reviews
            </p>
            {(pendingReviews as Array<{ review_id: string; property_address: string; days_remaining: number; submitted_at: string }>).map((pr) => (
              <div key={pr.review_id} className="rounded-2xl border-2 border-gold-300 bg-gold-50 px-4 py-4 mb-3">
                <div className="flex items-start gap-3">
                  {/* Hourglass icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    <path d="M12 6V12L16 14" stroke="#F4B53F" strokeWidth={2} strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="10" stroke="#F4B53F" strokeWidth={1.8}/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm text-gold-700 mb-0.5">
                      You have a review waiting
                    </p>
                    <p className="text-xs text-gold-700 font-body leading-relaxed mb-3">
                      Someone reviewed you for <span className="font-semibold">{pr.property_address}</span>.
                      Submit your review to reveal both simultaneously.{" "}
                      <span className="font-semibold">{pr.days_remaining} day{pr.days_remaining !== 1 ? "s" : ""} remaining.</span>
                    </p>
                    <Link
                      href="/review/new"
                      className="inline-flex items-center gap-1.5 bg-gold-400 text-white text-xs font-semibold font-heading px-3 py-2 rounded-xl"
                    >
                      Submit your review →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Recent Reviews ── */}
        <p className="font-heading text-xs font-semibold text-petrol-400 tracking-widest mb-3">
          Recent Reviews
        </p>

        {recentReviews && recentReviews.length > 0 ? (
          recentReviews.map((r) => {
            const reviewee = r.reviewee as { full_name: string; avatar_url: string | null } | null;
            const subjectName = reviewee?.full_name ?? r.guest_name ?? "Unknown";
            const snippet = (r.body as string).slice(0, 100) + ((r.body as string).length > 100 ? "…" : "");
            return (
              <div key={r.id} className="card mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar name={subjectName} avatarUrl={reviewee?.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-petrol-400 truncate">{subjectName}</p>
                    <p className="text-xs text-sage-400 font-body">
                      {new Date(r.created_at).toLocaleDateString("en-ZA", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                    {(r as unknown as { verified_tenancy?: boolean }).verified_tenancy && (
                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-400 text-white">
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Verified Tenancy
                      </span>
                    )}
                  </div>
                  <StarRow value={r.overall} size="sm" />
                </div>
                <p className="text-xs text-sage-400 font-body leading-relaxed">{snippet}</p>
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
