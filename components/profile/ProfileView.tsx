"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { StarRow } from "@/components/ui/StarRow";
import type { Profile, ReputationScore, ReviewWithReviewer } from "@/lib/types";

interface Props {
  profile: Profile | null;
  score: ReputationScore | null;
  reviews: ReviewWithReviewer[];
  isOwner: boolean;
  fetchError?: string | null;
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

export function ProfileView({ profile, score, reviews, isOwner, fetchError }: Props) {
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
      <div className="bg-petrol-400 px-5 pt-12 pb-6">
        <Link href="/home" className="text-mint-400 text-xl block mb-4" aria-label="Back to home">←</Link>

        <div className="flex gap-4 items-start">
          <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-xl text-white mb-1.5 truncate">{profile.full_name}</h1>
            <span className="inline-flex items-center gap-1 bg-teal-400/20 text-mint-400 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
              ✓ Verified {roleLabel}
            </span>
            <p className="text-xs text-mint-300 font-body mt-1.5">
              📍 {[profile.suburb, profile.city].filter(Boolean).join(", ") || "South Africa"}
            </p>
          </div>
          <ScoreRing score={score?.overall ?? 0} size={72} strokeWidth={6} />
        </div>

        <div className="flex gap-6 mt-5 pt-4 border-t border-white/10">
          <div>
            <p className="font-heading font-bold text-base text-gold-400">{score?.review_count ?? 0}</p>
            <p className="text-[11px] text-mint-300 font-body">Reviews</p>
          </div>
          <div>
            <p className="font-heading font-bold text-base text-gold-400">{score?.overall?.toFixed(1) ?? "–"}</p>
            <p className="text-[11px] text-mint-300 font-body">Overall score</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
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

        {/* ── Reviews ── */}
        <p className="section-label">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </p>

        {reviews.length === 0 ? (
          <div className="card text-center py-8 mb-4">
            <p className="text-2xl mb-2">📭</p>
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
            className="btn-primary block text-center mt-2 mb-4"
          >
            ✍️ Write a Review
          </Link>
        )}
      </div>
    </div>
  );
}
