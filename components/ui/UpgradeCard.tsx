"use client";

import { useState } from "react";

interface Props {
  planId:      string;
  label:       string;
  recommended: boolean;
}

export function UpgradeCard({ planId, label, recommended }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payfast/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ planId }),
      });
      const data = await res.json() as { url?: string; params?: Record<string, string>; error?: string };

      if (!res.ok || !data.url || !data.params) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      // PayFast requires a form POST — build a hidden form, submit it
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.url;

      Object.entries(data.params).forEach(([key, value]) => {
        const input    = document.createElement("input");
        input.type     = "hidden";
        input.name     = key;
        input.value    = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // Note: loading stays true — the page navigates away
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
        {loading ? "Redirecting to PayFast…" : label}
      </button>
      {error && (
        <p className="text-xs text-red-400 font-body mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
