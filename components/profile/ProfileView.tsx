"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { StarRow } from "@/components/ui/StarRow";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ReputationScore, ReviewWithReviewer } from "@/lib/types";
import type { Badge } from "@/lib/badges";
import { BadgePill } from "@/components/ui/BadgePill";
import { FLAG_LABELS } from "@/lib/leaseCheck";

type ClauseWarning = {
  id:          string;
  flag_type:   string;
  note:        string | null;
  reviewee_id: string | null;
  created_at:  string;
};

interface Props {
  profile: Profile | null;
  score: ReputationScore | null;
  reviews: ReviewWithReviewer[];
  badges?: Badge[];
  isOwner: boolean;
  fetchError?: string | null;
  clauseWarnings?: ClauseWarning[];
}

const LANDLORD_CATS = [
  { key: "communication",    label: "Communication" },
  { key: "maintenance",      label: "Maintenance" },
  { key: "deposit_handling", label: "Deposit Return" },
  { key: "fairness",         label: "Fairness" },
] as const;

const TENANT_CATS = [
  { key: "communication",   label: "Communication" },
  { key: "payment_history", label: "Payment History" },
  { key: "property_care",   label: "Property Care" },
  { key: "fairness",        label: "Fairness" },
] as const;

function SignOutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  );
}

export function ProfileView({ profile, score, reviews, badges = [], isOwner, fetchError, clauseWarnings = [] }: Props) {
  const router    = useRouter();
  const supabase  = createClient();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-3xl mb-3">😕</p>
        <p className="font-heading font-semibold text-petrol-400 mb-1">Profile not found</p>
        <p className="text-xs text-sage-400 font-body">
          This profile may have been removed or doesn&apos;t exist.
        </p>
        {fetchError && (
          <p className="text-[10px] text-red-400 font-mono mt-4 max-w-xs break-all">
            {fetchError}
          </p>
        )}
      </div>
    );
  }

  const cats = profile.role === "tenant" ? TENANT_CATS : LANDLORD_CATS;
  const roleLabel = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);

  return (
    <div>
      {/* ── Header — Petrol Ink ── */}
      <div className="bg-petrol-400 px-5 pt-10 pb-4">
        <Link href="/home" className="text-mint-400 text-xl block mb-3" aria-label="Back to home">←</Link>

        <div className="flex gap-3 items-center">
          {isOwner ? (
            <AvatarUpload
              userId={profile.id}
              name={profile.full_name}
              avatarUrl={profile.avatar_url}
              variant="profile"
            />
          ) : (
            <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size="lg" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-lg text-white mb-1 truncate">{profile.full_name}</h1>
            <span className="inline-flex items-center gap-1 bg-teal-400/20 text-mint-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              <span style={{ color: "#F4B53F" }}>✓</span> Verified {roleLabel}
            </span>
            <p className="text-xs text-mint-300 font-body mt-1">
              📍 {[profile.suburb, profile.city].filter(Boolean).join(", ") || "South Africa"}
            </p>
          </div>
          <ScoreRing score={score?.overall ?? 0} size={64} strokeWidth={5} />
        </div>

        <div className="flex gap-6 mt-3 pt-3 border-t border-white/10">
          <div>
            <p className="font-heading font-bold text-base text-gold-400">{score?.review_count ?? 0}</p>
            <p className="text-[11px] text-mint-300 font-body">Reviews</p>
          </div>
          <div>
            {score && score.overall > 0 ? (
              <>
                <p className="font-heading font-bold text-base text-gold-400">{score.overall.toFixed(1)}</p>
                <p className="text-[11px] text-mint-300 font-body">Overall score</p>
              </>
            ) : (
              <>
                <span className="inline-flex items-center bg-teal-400/20 text-mint-400 text-[10px] font-semibold px-2 py-0.5 rounded-full font-body">
                  New
                </span>
                <p className="text-[11px] text-mint-300 font-body mt-0.5">Overall score</p>
              </>
            )}
          </div>
          <div>
            <p className="font-heading font-bold text-base text-gold-400">{badges.length}</p>
            <p className="text-[11px] text-mint-300 font-body">Badges</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* ── Badges ── */}
        {badges.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
            {badges.map((b) => (
              <BadgePill key={b.id} badge={b} />
            ))}
          </div>
        )}

        {/* ── Score breakdown ── */}
        {score && (
          <div className="card mb-4">
            <p className="section-label mb-4">Score Breakdown</p>
            {cats.map(({ key, label }) => {
              const val = score[key as keyof ReputationScore];
              if (typeof val !== "number") return null;
              return <ScoreBar key={key} label={label} score={val} />;
            })}
          </div>
        )}

        {/* ── Clause warnings ── */}
        {clauseWarnings.length > 0 && (
          <div className="card mb-4 border-2 border-[#F4B53F]">
            <p className="section-label mb-2">Lease clause warnings from past tenants</p>
            {clauseWarnings.map((w) => (
              <div key={w.id} className="mb-2 pb-2 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <span className="inline-block text-xs font-semibold text-[#92400E] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full">
                  {FLAG_LABELS[w.flag_type as keyof typeof FLAG_LABELS] ?? w.flag_type}
                </span>
                {w.note && (
                  <p className="text-xs text-sage-400 font-body mt-1 leading-relaxed">{w.note}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Reviews ── */}
        <p className="section-label">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </p>

        {reviews.length === 0 ? (
          <div className="card text-center py-8 mb-4">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-3" aria-hidden="true">
              <rect x="4" y="10" width="32" height="22" rx="2.5" stroke="#0E9E92" strokeWidth={2}/>
              <path d="M4 13l16 11 16-11" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-heading font-semibold text-petrol-400 mb-1">No reviews yet</p>
            <p className="text-xs text-sage-400 font-body">Be the first to leave a verified review.</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card mb-3">
              <div className="flex items-center gap-3 mb-2">
                <Avatar
                  name={r.reviewer?.full_name ?? "?"}
                  avatarUrl={r.reviewer?.avatar_url}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-petrol-400 truncate">{r.reviewer?.full_name ?? "Anonymous"}</p>
                  <p className="text-xs text-sage-400 font-body">
                    {r.reviewer?.suburb} · {new Date(r.created_at).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}
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
              <p className="text-xs text-sage-400 font-body leading-relaxed">{r.body}</p>

              {r.reply && (
                <div className="mt-3">
                  <span className="inline-block bg-gold-50 border border-gold-300 text-gold-600 text-[11px] font-semibold px-2 py-0.5 rounded-lg mb-2">
                    💬 {roleLabel} Reply
                  </span>
                  <div className="bg-gold-50 border-l-2 border-gold-400 rounded-r-xl pl-3 pr-3 py-2.5">
                    <p className="text-xs text-gold-800 font-body leading-relaxed">"{r.reply}"</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {!isOwner && (
          <Link
            href={`/review/new?revieweeId=${profile.id}&role=${profile.role}`}
            className="btn-primary flex items-center justify-center gap-2 mt-2 mb-4"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Write a Review
          </Link>
        )}

        {isOwner && (
          <div className="mt-6 mb-8">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-teal-400 text-teal-400 bg-white font-heading font-semibold text-sm transition-opacity disabled:opacity-60 active:bg-teal-50"
            >
              <SignOutIcon />
              {signingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
