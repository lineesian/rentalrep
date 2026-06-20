"use client";

import { useState } from "react";

interface Props {
  priceId:     string;
  label:       string;
  recommended: boolean;
}

export function UpgradeCard({ priceId, label, recommended }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-heading font-bold text-sm transition-opacity disabled:opacity-60"
        style={
          recommended
            ? { backgroundColor: "#F5C842", color: "#0D2B2A" }
            : { backgroundColor: "#0E9E92", color: "#ffffff" }
        }
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && (
        <p className="text-xs text-red-400 font-body mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
