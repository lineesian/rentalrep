"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav } from "@/components/layout/BottomNav";
import { WatchlistButton } from "@/components/ui/WatchlistButton";

type WatchItem = {
  id:          string;
  created_at:  string;
  profile_id:  string | null;
  property_id: string | null;
  profile?: {
    id:        string;
    full_name: string;
    avatar_url: string | null;
    role:      string;
    suburb:    string | null;
    city:      string | null;
  } | null;
  property?: {
    id:      string;
    address: string;
    suburb:  string | null;
    city:    string | null;
  } | null;
};

const ROLE_BADGE: Record<string, string> = {
  tenant:   "bg-teal-50 text-teal-400",
  landlord: "bg-gold-50 text-gold-600",
  agency:   "bg-petrol-400/10 text-petrol-400",
  agent:    "bg-sage-400/10 text-sage-400",
};

export default function WatchlistPage() {
  const [items,   setItems]   = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Remove an item from the local list after unsaving
  function handleRemove(item: WatchItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  const profiles   = items.filter((i) => i.profile_id);
  const properties = items.filter((i) => i.property_id);

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-24">
      {/* Header */}
      <div className="bg-petrol-400 px-5 pt-12 pb-5">
        <Link href="/search" className="text-mint-400 text-xl block mb-3" aria-label="Back">←</Link>
        <h1 className="font-heading font-bold text-2xl text-white">My Watchlist</h1>
        <p className="text-xs text-mint-300 font-body mt-0.5">Saved profiles and properties</p>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="text-center py-16 text-sage-400 text-sm font-body">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="#F4B53F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-heading font-semibold text-petrol-400 mb-1">Nothing saved yet</p>
            <p className="text-xs text-sage-400 font-body">
              Tap the bookmark on any landlord, tenant or property in search to save them here.
            </p>
            <Link
              href="/search"
              className="inline-block mt-4 bg-teal-400 text-white font-heading font-semibold px-5 py-2.5 rounded-xl text-sm"
            >
              Explore
            </Link>
          </div>
        ) : (
          <>
            {/* People */}
            {profiles.length > 0 && (
              <>
                <p className="section-label mb-3">People ({profiles.length})</p>
                {profiles.map((item) => {
                  const p = item.profile;
                  if (!p) return null;
                  return (
                    <div key={item.id} className="relative">
                      <Link
                        href={`/profile/${p.id}`}
                        className="card flex items-center gap-3 mb-3 active:scale-[0.98] transition-transform pr-12"
                      >
                        <Avatar name={p.full_name} avatarUrl={p.avatar_url} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-[15px] text-petrol-400 truncate mb-1">{p.full_name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[p.role] ?? ""}`}>
                              {p.role}
                            </span>
                            {p.suburb && <span className="text-xs text-sage-400 truncate">{p.suburb}</span>}
                          </div>
                        </div>
                      </Link>
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => handleRemove(item)}
                      >
                        <WatchlistButton profileId={p.id} initialSaved={true} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Properties */}
            {properties.length > 0 && (
              <>
                <p className="section-label mt-2 mb-3">Properties ({properties.length})</p>
                {properties.map((item) => {
                  const prop = item.property;
                  if (!prop) return null;
                  return (
                    <div key={item.id} className="relative">
                      <Link
                        href={`/property/${prop.id}`}
                        className="card flex items-center gap-3 mb-3 active:scale-[0.98] transition-transform pr-12"
                      >
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8}/>
                            <circle cx="12" cy="9" r="2.5" stroke="#0E9E92" strokeWidth={1.5}/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-[15px] text-petrol-400 leading-tight mb-0.5 line-clamp-2">{prop.address}</p>
                          {(prop.suburb || prop.city) && (
                            <p className="text-xs text-sage-400 truncate">{[prop.suburb, prop.city].filter(Boolean).join(", ")}</p>
                          )}
                        </div>
                      </Link>
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => handleRemove(item)}
                      >
                        <WatchlistButton propertyId={prop.id} initialSaved={true} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
