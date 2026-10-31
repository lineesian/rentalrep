"use client";

import { useState } from "react";

interface Props {
  profileId?:  string;
  propertyId?: string;
  initialSaved?: boolean;
}

export function WatchlistButton({ profileId, propertyId, initialSaved = false }: Props) {
  const [saved, setSaved]   = useState(initialSaved);
  const [busy,  setBusy]    = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);

    try {
      if (saved) {
        const param = profileId
          ? `profile_id=${profileId}`
          : `property_id=${propertyId}`;
        await fetch(`/api/watchlist?${param}`, { method: "DELETE" });
        setSaved(false);
      } else {
        const body = profileId ? { profile_id: profileId } : { property_id: propertyId };
        const res  = await fetch("/api/watchlist", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });
        if (res.ok || res.status === 409) setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from watchlist" : "Save to watchlist"}
      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
      style={{ color: saved ? "#F4B53F" : "#A0B4AE" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} aria-hidden="true">
        <path
          d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
