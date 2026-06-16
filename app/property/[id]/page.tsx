import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { StarRow } from "@/components/ui/StarRow";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Review } from "@/lib/types";

export const dynamic = "force-dynamic";

type PropertyReview = Review & {
  reviewer: { id: string; full_name: string; avatar_url: string | null; suburb: string | null } | null;
};

const PROPERTY_CATS = [
  { key: "condition_on_movein", label: "Condition on Move-in" },
  { key: "maintenance",         label: "Maintenance Quality" },
  { key: "safety_security",     label: "Safety & Security" },
  { key: "noise_levels",        label: "Noise Levels" },
  { key: "value_for_money",     label: "Value for Money" },
  { key: "location_amenities",  label: "Location & Amenities" },
] as const;

function avgOf(reviews: PropertyReview[], key: string): number | null {
  const vals = reviews
    .map((r) => r[key as keyof Review])
    .filter((v): v is number => typeof v === "number");
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: property }, { data: reviews }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", params.id).maybeSingle(),
    supabase
      .from("reviews")
      .select("*, reviewer:profiles!reviewer_id(id, full_name, avatar_url, suburb)")
      .eq("property_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!property) notFound();

  const propertyReviews = (reviews ?? []) as PropertyReview[];
  const overallAvg = propertyReviews.length
    ? propertyReviews.reduce((s, r) => s + r.overall, 0) / propertyReviews.length
    : null;

  return (
    <div className="screen">
      {/* Header */}
      <div className="bg-petrol-400 px-5 pt-10 pb-5">
        <Link href="/home" className="text-mint-400 text-xl block mb-3" aria-label="Back">←</Link>

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#0E9E92" fillOpacity="0.3" stroke="#2FD4C0" strokeWidth={1.8}/>
              <circle cx="12" cy="9" r="2.5" stroke="#2FD4C0" strokeWidth={1.5}/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-lg text-white leading-tight mb-1">{property.address}</h1>
            {(property.suburb || property.city) && (
              <p className="text-xs text-mint-300 font-body">
                {[property.suburb, property.city].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="text-xs text-mint-300 font-body mt-0.5">
              {propertyReviews.length} review{propertyReviews.length !== 1 ? "s" : ""}
            </p>
          </div>
          {overallAvg != null && (
            <div className="flex-shrink-0 text-right">
              <p className="font-heading font-bold text-2xl text-gold-400">{overallAvg.toFixed(1)}</p>
              <p className="text-[10px] text-mint-300">/ 5</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 pb-24">
        {/* Score breakdown */}
        {propertyReviews.length > 0 && (
          <div className="card mb-4">
            <p className="section-label mb-4">Score Breakdown</p>
            {PROPERTY_CATS.map(({ key, label }) => {
              const avg = avgOf(propertyReviews, key);
              if (avg == null) return null;
              return <ScoreBar key={key} label={label} score={avg} />;
            })}
          </div>
        )}

        {/* Reviews */}
        <p className="section-label mb-3">
          Tenant Reviews {propertyReviews.length > 0 && `(${propertyReviews.length})`}
        </p>

        {propertyReviews.length === 0 ? (
          <div className="card text-center py-10">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#0E9E92" strokeWidth={1.8} fill="none"/>
              <circle cx="12" cy="9" r="2.5" stroke="#0E9E92" strokeWidth={1.5}/>
            </svg>
            <p className="font-heading font-semibold text-petrol-400 mb-1">No reviews yet</p>
            <p className="text-xs text-sage-400 font-body">Be the first tenant to review this property.</p>
          </div>
        ) : (
          propertyReviews.map((r) => (
            <div key={r.id} className="card mb-3">
              <div className="flex items-center gap-3 mb-2">
                <Avatar
                  name={r.anonymous ? "?" : (r.reviewer?.full_name ?? "Tenant")}
                  avatarUrl={r.anonymous ? null : r.reviewer?.avatar_url}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-petrol-400 truncate">
                    {r.anonymous ? "Anonymous Tenant" : (r.reviewer?.full_name ?? "Tenant")}
                  </p>
                  <p className="text-xs text-sage-400 font-body">
                    {new Date(r.created_at).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}
                  </p>
                  {r.lease_id && (
                    <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] font-semibold text-teal-400">
                      <span style={{ color: "#0E9E92" }}>✓</span> Verified Tenancy
                    </span>
                  )}
                </div>
                <StarRow value={r.overall} size="sm" />
              </div>
              <p className="text-xs text-sage-400 font-body leading-relaxed">{r.body}</p>
            </div>
          ))
        )}

        {/* CTA if logged in */}
        {user && (
          <Link
            href={`/review/new?type=property`}
            className="btn-primary flex items-center justify-center gap-2 mt-4"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Review this Property
          </Link>
        )}
      </div>

      <BottomNav profileId={user?.id} />
    </div>
  );
}
