"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav } from "@/components/layout/BottomNav";
import type { ProfileWithScore, UserRole } from "@/lib/types";

const FILTERS: { label: string; value: UserRole | "all" }[] = [
  { label: "All",       value: "all" },
  { label: "Landlords", value: "landlord" },
  { label: "Tenants",   value: "tenant" },
  { label: "Agencies",  value: "agency" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UserRole | "all">("all");
  const [results, setResults] = useState<ProfileWithScore[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  async function runSearch(q: string, f: typeof filter) {
    if (!q.trim()) { setResults([]); setSearched(false); return; }

    startTransition(async () => {
      let query2 = supabase
        .from("profiles")
        .select("*, reputation_scores(*)")
        .ilike("full_name", `%${q}%`)
        .limit(20);

      if (f !== "all") query2 = query2.eq("role", f);

      const { data } = await query2;
      setResults((data ?? []) as ProfileWithScore[]);
      setSearched(true);
    });
  }

  function handleQuery(val: string) {
    setQuery(val);
    runSearch(val, filter);
  }

  function handleFilter(f: typeof filter) {
    setFilter(f);
    runSearch(query, f);
  }

  return (
    <div className="screen">
      {/* Header */}
      <div className="bg-petrol-400 px-5 pt-12 pb-5">
        <h1 className="font-heading font-bold text-2xl text-white mb-4">Explore</h1>
        <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-shrink-0">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth={1.8} strokeOpacity="0.6"/>
            <path d="M15.5 15.5L21 21" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeOpacity="0.6"/>
          </svg>
          <input
            className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none font-body"
            placeholder="Search landlords, tenants or properties"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button onClick={() => handleQuery("")} className="text-white/50 text-lg leading-none">×</button>
          )}
        </div>
      </div>

      <div className="pt-4">
        {/* Filter chips — negative margin so scroll reaches screen edge */}
        <div
          className="flex gap-2 pb-1 mb-4"
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
              className={`px-4 py-1.5 rounded-full text-sm font-semibold font-body transition-all border ${
                filter === value
                  ? "bg-teal-400 text-white border-teal-400"
                  : "bg-white text-petrol-400 border-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

      <div className="px-4">

        {/* State: idle */}
        {!searched && !query && (
          <div className="text-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="#0E9E92" strokeWidth={1.8}/>
              <path d="M15.5 15.5L21 21" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
            </svg>
            <p className="font-heading font-semibold text-petrol-400 mb-1">Search RentalRep</p>
            <p className="text-xs text-sage-400">Find landlords, tenants and agencies across South Africa</p>
          </div>
        )}

        {/* State: loading */}
        {isPending && (
          <div className="text-center py-10 text-sage-400 text-sm">Searching…</div>
        )}

        {/* State: results */}
        {searched && !isPending && (
          <>
            <p className="section-label">{results.length} result{results.length !== 1 ? "s" : ""}</p>
            {results.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">😕</p>
                <p className="text-sm text-sage-400">No results found for &ldquo;{query}&rdquo;</p>
              </div>
            ) : (
              results.map((p) => {
                const score       = p.reputation_scores?.overall;
                const reviewCount = p.reputation_scores?.review_count ?? 0;
                return (
                  <Link
                    key={p.id}
                    href={`/profile/${p.id}`}
                    className="card flex items-center gap-3 mb-3 active:scale-[0.98] transition-transform"
                  >
                    <Avatar name={p.full_name} avatarUrl={p.avatar_url} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-heading font-semibold text-[15px] text-petrol-400 truncate">{p.full_name}</p>
                        {p.verified && <span style={{ color: "#F4B53F" }} className="text-sm font-bold">✓</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          p.role === "landlord" ? "bg-teal-50 text-teal-400" :
                          p.role === "agency"   ? "bg-petrol-400/10 text-petrol-400" :
                                                  "bg-gold-50 text-gold-600"
                        }`}>{p.role}</span>
                        <span className="text-xs text-sage-400">{p.suburb ?? p.city ?? "South Africa"}</span>
                      </div>
                      <p className="text-xs text-sage-400 mt-0.5">
                        {reviewCount > 0 ? `${reviewCount} review${reviewCount !== 1 ? "s" : ""}` : "No reviews yet"}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="score-badge">{score != null ? score.toFixed(1) : "–"}</div>
                      <p className="text-[10px] text-sage-400 mt-1">/ 10</p>
                    </div>
                  </Link>
                );
              })
            )}
          </>
        )}
      </div>
      </div>

      <BottomNav />
    </div>
  );
}
