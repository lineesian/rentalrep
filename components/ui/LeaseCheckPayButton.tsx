"use client";

import { useState } from "react";

export function LeaseCheckPayButton({ fee }: { fee: string }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/payfast/lease-check-checkout", { method: "POST" });
      const data = await res.json() as { url?: string; params?: Record<string, string>; error?: string };

      if (!res.ok || !data.url || !data.params) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.url;

      Object.entries(data.params).forEach(([key, value]) => {
        const input   = document.createElement("input");
        input.type    = "hidden";
        input.name    = key;
        input.value   = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-heading font-bold text-sm transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "#0E9E92", color: "#ffffff" }}
      >
        {loading ? "Redirecting to PayFast…" : `Pay R${fee} for another Lease Check`}
      </button>
      {error && (
        <p className="text-xs text-red-400 font-body mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
