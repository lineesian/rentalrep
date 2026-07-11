"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Profile, ReputationScore, UserRole } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────

type ProfileResult = Profile & { score: ReputationScore | null };

type PropertyResult = {
  id: string;
  address: string;
  normalized_address: string;
  suburb: string | null;
  city: string | null;
  avg_score: number | null;
  review_count: number;
};

type FilterValue = UserRole | "all" | "property";

// ── Constants ────────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All",        value: "all" },
  { label: "Landlords",  value: "landlord" },
  { label: "Tenants",    value: "tenant" },
  { label: "Agencies",   value: "agency" },
  { label: "Properties", value: "property" },
];

const ROLE_BADGE: Record<UserRole, string> = {
  tenant:   "bg-teal-50 text-teal-400",
  landlord: "bg-gold-50 text-gold-600",
  agency:   "bg-petrol-400/10 text-petrol-400",
  agent:    "bg-sage-400/10 text-sage-400",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query,           setQuery]           = useState("");
  const [filter,          setFilter]          = useState<FilterValue>("all");
  const [profileResults,  setProfileResults]  = useState<ProfileResult[]>([]);
  const [propertyResults, setPropertyResults] = useState<PropertyResult[]>([]);
  const [searched,        setSearched]        = useState(false);
  const [isPending, startTransition] = useTransition();

  const supabase        = createClient();
  const isPropertyMode  = filter === "property";

  // ── Search handlers ─────────────────────────────────────────────────────────

  async function runSearch(q: string, f: FilterValue) {
    if (f === "property") {
      await runPropertySearch(q);
    } else {
      await runProfileSearch(q, f as UserRole | "all");
    }
  }

  async function runProfileSearch(q: string, f: UserRole | "all") {
    const hasQuery  = q.trim().length > 0;
    const hasFilter = f !== "all";

    if (!hasQuery && !hasFilter) {
      setProfileResults([]);
      setSearched(false);
      return;
    }

    startTransition(async () => {
      let profileQuery = supabase.from("profiles").select("*").order("full_name").limit(30);
      if (hasQuery)  profileQuery = profileQuery.ilike("full_name", `%${q.trim()}%`);
      if (hasFilter) profileQuery = profileQuery.eq("role", f);

      const { data: profiles, error } = await profileQuery;
      if (error || !profiles?.length) {
        setProfileResults([]);
        setSearched(true);
        return;
      }

      const ids = profiles.map((p) => p.id);
      const { data: scores } = await supabase
        .from("reputation_scores")
        .select("*")
        .in("profile_id", ids);

      const scoreMap = Object.fromEntries(
        (scores ?? []).map((s) => [s.profile_id, s as ReputationScore])
      );

      setProfileResults(
        profiles.map((p) => ({ ...p, score: scoreMap[p.id] ?? null })) as ProfileResult[]
      );
      setSearched(true);
    });
  }

  async function runPropertySearch(q: string) {
    startTransition(async () => {
      // Search properties by address; empty query shows latest 30
      let propQuery = supabase
        .from("properties")
        .select("*")
        .order("address")
        .limit(30);
      if (q.trim()) {
        const safe = q.trim().replace(/[%_]/g, "\\$&");
        propQuery = propQuery.ilike("address", `%${safe}%`);
      }

      const { data: properties, error } = await propQuery;
      if (error || !properties?.length) {
        setPropertyResults([]);
        setSearched(true);
        return;
      }

      // Fetch per-property review stats
      const propIds = properties.map((p) => p.id);
      const { data: reviews } = await supabase
        .from("reviews")
        .select("property_id, overall")
        .in("property_id", propIds)
        .in("status", ["published", "expired"]);

      // Aggregate client-side
      const statsMap: Record<string, { sum: number; count: number }> = {};
      for (const r of reviews ?? []) {
        const pid = r.property_id as string;
        if (!statsMap[pid]) statsMap[pid] = { sum: 0, count: 0 };
        statsMap[pid].sum   += r.overall as number;
        statsMap[pid].count += 1;
      }

      setPropertyResults(
        properties.map((p) => ({
          ...p,
          avg_score:    statsMap[p.id] ? statsMap[p.id].sum / statsMap[p.id].count : null,
          review_count: statsMap[p.id]?.count ?? 0,
        }))
      );
      setSearched(true);
    });
  }

  function handleQuery(val: string) {
    setQuery(val);
    runSearch(val, filter);
  }

  function handleFilter(f: FilterValue) {
    setFilter(f);
    // Reset opposite result set so stale data never shows
    if (f === "property") setProfileResults([]);
    else                  setPropertyResults([]);
    runSearch(query, f);
  }

  // Convenience
  const currentResults  = isPropertyMode ? propertyResults : profileResults;
  const hasResults      = currentResults.length > 0;

  return (
    <div className="screen">
      {/* ── Header ── */}
      <div className="bg-petrol-400 px-5 pt-12 pb-5">
        <h1 className="font-heading font-bold text-2xl text-white mb-4">Explore</h1>
        <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-shrink-0">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth={1.8} strokeOpacity="0.6"/>
            <path d="M15.5 15.5L21 21" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeOpacity="0.6"/>
          </svg>
          <input
            className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none font-body"
            placeholder={
              isPropertyMode
                ? "Search by property address…"
                : "Search landlords, tenants or agencies…"
            }
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button onClick={() => handleQuery("")} className="text-white/50 text-xl leading-none">×</button>
          )}
        </div>
      </div>

      {/* ── Filter pills ── */}
      <div
        className="flex gap-2 py-3"
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleFilter(value)}
            style={{ flexShrink: 0 }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold font-body border transition-colors ${
              filter === value
                ? "bg-teal-400 text-white border-teal-400"
                : "bg-white text-petrol-400 border-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-24">

        {/* ── Idle ── */}
        {!searched && !isPending && (
          <div className="text-center py-14">
            {isPropertyMode ? (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#0E9E92" strokeWidth={1.8}/>
                  <circle cx="12" cy="9" r="2.5" stroke="#0E9E92" strokeWidth={1.5}/>
                </svg>
                <p className="font-heading font-semibold text-petrol-400 mb-1">Search Properties</p>
                <p className="text-xs text-sage-400">Find verified rental properties across South Africa</p>
              </>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3" aria-hidden="true">
                  <circle cx="10.5" cy="10.5" r="6.5" stroke="#0E9E92" strokeWidth={1.8}/>
                  <path d="M15.5 15.5L21 21" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
                </svg>
                <p className="font-heading font-semibold text-petrol-400 mb-1">Search RentalRep</p>
                <p className="text-xs text-sage-400">Find landlords, tenants and agencies across South Africa</p>
              </>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {isPending && (
          <div className="text-center py-10 text-sage-400 text-sm font-body">Searching…</div>
        )}

        {/* ── Results ── */}
        {searched && !isPending && (
          <>
            <p className="section-label mb-3">
              {currentResults.length} result{currentResults.length !== 1 ? "s" : ""}
            </p>

            {!hasResults ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">😕</p>
                <p className="text-sm text-sage-400 font-body">
                  No {isPropertyMode ? "properties" : "people"} found{query ? ` for "${query}"` : ""}
                </p>
              </div>
            ) : isPropertyMode ? (
              /* ── Property cards ── */
              (propertyResults).map((p) => (
                <Link
                  key={p.id}
                  href={`/property/${p.id}`}
                  className="card flex items-center gap-3 mb-3 active:scale-[0.98] transition-transform"
                >
                  {/* House icon */}
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8}/>
                      <circle cx="12" cy="9" r="2.5" stroke="#0E9E92" strokeWidth={1.5}/>
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-[15px] text-petrol-400 leading-tight mb-1 line-clamp-2">
                      {p.address}
                    </p>
                    {(p.suburb || p.city) && (
                      <p className="text-xs text-sage-400 truncate mb-0.5">
                        {[p.suburb, p.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                    <p className="text-xs text-sage-400 font-body">
                      {p.review_count > 0
                        ? `${p.review_count} review${p.review_count !== 1 ? "s" : ""}`
                        : "No reviews yet"}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    {p.avg_score != null ? (
                      <>
                        <div className="score-badge">{p.avg_score.toFixed(1)}</div>
                        <p className="text-[10px] text-sage-400 mt-1">/ 5</p>
                      </>
                    ) : (
                      <span className="inline-flex items-center bg-teal-50 text-teal-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              /* ── Profile cards ── */
              (profileResults).map((p) => {
                const score       = p.score?.overall;
                const reviewCount = p.score?.review_count ?? 0;
                return (
                  <Link
                    key={p.id}
                    href={`/profile/${p.id}`}
                    className="card flex items-center gap-3 mb-3 active:scale-[0.98] transition-transform"
                  >
                    <Avatar name={p.full_name} avatarUrl={p.avatar_url} size="md" />

                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-[15px] text-petrol-400 truncate mb-1">
                        {p.full_name}
                      </p>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[p.role]}`}>
                          {p.role}
                        </span>
                        {p.suburb && (
                          <span className="text-xs text-sage-400 truncate">{p.suburb}</span>
                        )}
                      </div>
                      <p className="text-xs text-sage-400 font-body">
                        {reviewCount > 0
                          ? `${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
                          : "No reviews yet"}
                      </p>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      {score != null ? (
                        <>
                          <div className="score-badge">{score.toFixed(1)}</div>
                          <p className="text-[10px] text-sage-400 mt-1">/ 10</p>
                        </>
                      ) : (
                        <span className="inline-flex items-center bg-teal-50 text-teal-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
