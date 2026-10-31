"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav } from "@/components/layout/BottomNav";
import { WatchlistButton } from "@/components/ui/WatchlistButton";
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
  { label: "Agents",     value: "agent" },
  { label: "Properties", value: "property" },
];

const MIN_SCORE_OPTIONS = [
  { label: "Any score", value: 0 },
  { label: "6+",        value: 6 },
  { label: "7+",        value: 7 },
  { label: "8+",        value: 8 },
  { label: "9+",        value: 9 },
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
  const [minScore,        setMinScore]        = useState(0);
  const [profileResults,  setProfileResults]  = useState<ProfileResult[]>([]);
  const [propertyResults, setPropertyResults] = useState<PropertyResult[]>([]);
  const [searched,        setSearched]        = useState(false);
  const [isPending, startTransition] = useTransition();

  const supabase       = createClient();
  const isPropertyMode = filter === "property";

  // ── Search handlers ─────────────────────────────────────────────────────────

  async function runSearch(q: string, f: FilterValue, score: number) {
    if (f === "property") {
      await runPropertySearch(q, score);
    } else {
      await runProfileSearch(q, f as UserRole | "all", score);
    }
  }

  async function runProfileSearch(q: string, f: UserRole | "all", score: number) {
    const hasQuery  = q.trim().length > 0;
    const hasFilter = f !== "all";

    if (!hasQuery && !hasFilter && score === 0) {
      setProfileResults([]);
      setSearched(false);
      return;
    }

    startTransition(async () => {
      let profileQuery = (supabase as any).from("profiles").select("*").order("full_name").limit(50);
      if (hasQuery)  profileQuery = profileQuery.ilike("full_name", `%${q.trim()}%`);
      if (hasFilter) profileQuery = profileQuery.eq("role", f);

      const { data: profiles, error } = await profileQuery;
      if (error || !profiles?.length) {
        setProfileResults([]);
        setSearched(true);
        return;
      }

      const ids = (profiles as Profile[]).map((p) => p.id);
      const { data: scores } = await (supabase as any)
        .from("reputation_scores")
        .select("*")
        .in("profile_id", ids);

      const scoreMap = Object.fromEntries(
        ((scores ?? []) as ReputationScore[]).map((s) => [s.profile_id, s])
      );

      let results = (profiles as Profile[]).map(
        (p) => ({ ...p, score: scoreMap[p.id] ?? null })
      ) as ProfileResult[];

      // Client-side score filter
      if (score > 0) {
        results = results.filter(
          (r) => r.score != null && r.score.overall >= score
        );
      }

      setProfileResults(results);
      setSearched(true);
    });
  }

  async function runPropertySearch(q: string, score: number) {
    startTransition(async () => {
      let propQuery = (supabase as any)
        .from("properties")
        .select("*")
        .order("address")
        .limit(50);
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

      const propIds = (properties as { id: string }[]).map((p) => p.id);
      const { data: reviews } = await (supabase as any)
        .from("reviews")
        .select("property_id, overall")
        .in("property_id", propIds)
        .in("status", ["published", "expired"]);

      const statsMap: Record<string, { sum: number; count: number }> = {};
      for (const r of ((reviews ?? []) as { property_id: string; overall: number }[])) {
        const pid = r.property_id;
        if (!statsMap[pid]) statsMap[pid] = { sum: 0, count: 0 };
        statsMap[pid].sum   += r.overall;
        statsMap[pid].count += 1;
      }

      let results: PropertyResult[] = (properties as PropertyResult[]).map((p) => ({
        ...p,
        avg_score:    statsMap[p.id] ? statsMap[p.id].sum / statsMap[p.id].count : null,
        review_count: statsMap[p.id]?.count ?? 0,
      }));

      // Client-side score filter
      if (score > 0) {
        results = results.filter(
          (r) => r.avg_score != null && r.avg_score >= score
        );
      }

      setPropertyResults(results);
      setSearched(true);
    });
  }

  function handleQuery(val: string) {
    setQuery(val);
    runSearch(val, filter, minScore);
  }

  function handleFilter(f: FilterValue) {
    setFilter(f);
    if (f === "property") setProfileResults([]);
    else                  setPropertyResults([]);
    runSearch(query, f, minScore);
  }

  function handleMinScore(score: number) {
    setMinScore(score);
    runSearch(query, filter, score);
  }

  const currentResults = isPropertyMode ? propertyResults : profileResults;
  const hasResults     = currentResults.length > 0;

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
                : "Search landlords, tenants, agents…"
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
        className="flex gap-2 pt-3 pb-0"
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

      {/* ── Score filter pills ── */}
      <div
        className="flex gap-2 pt-2 pb-3"
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {MIN_SCORE_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleMinScore(value)}
            style={{ flexShrink: 0 }}
            className={`px-3 py-1 rounded-full text-xs font-semibold font-body border transition-colors ${
              minScore === value
                ? "bg-[#07312C] text-white border-[#07312C]"
                : "bg-white text-sage-400 border-gray-200"
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
                <p className="text-xs text-sage-400">Find landlords, tenants, agencies and agents</p>
              </>
            )}

            {/* Quick links */}
            <div className="mt-8 flex flex-col gap-2">
              <Link
                href="/watchlist"
                className="mx-auto flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-petrol-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="#F4B53F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                My Watchlist
              </Link>
              <Link
                href="/looking-to-rent"
                className="mx-auto flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-petrol-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" stroke="#0E9E92" strokeWidth={1.8}/>
                  <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
                </svg>
                Looking to Rent board
              </Link>
            </div>
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
                  {minScore > 0 ? ` with score ${minScore}+` : ""}
                </p>
              </div>
            ) : isPropertyMode ? (
              propertyResults.map((p) => (
                <div key={p.id} className="relative">
                  <Link
                    href={`/property/${p.id}`}
                    className="card flex items-center gap-3 mb-3 active:scale-[0.98] transition-transform pr-12"
                  >
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <WatchlistButton propertyId={p.id} />
                  </div>
                </div>
              ))
            ) : (
              profileResults.map((p) => {
                const score       = p.score?.overall;
                const reviewCount = p.score?.review_count ?? 0;
                return (
                  <div key={p.id} className="relative">
                    <Link
                      href={`/profile/${p.id}`}
                      className="card flex items-center gap-3 mb-3 active:scale-[0.98] transition-transform pr-12"
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
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <WatchlistButton profileId={p.id} />
                    </div>
                  </div>
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
