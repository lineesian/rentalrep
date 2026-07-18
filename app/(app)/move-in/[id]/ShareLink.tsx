"use client";

import { useState } from "react";

export function ShareLink({ reportId, landlordEmail }: { reportId: string; landlordEmail?: string | null }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/move-in/${reportId}`
    : `/move-in/${reportId}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl p-4 space-y-2">
      <p className="text-xs font-semibold text-[#07312C] uppercase tracking-wide">Share with landlord</p>
      <p className="text-xs text-[#5E7470]">
        Send this link to your landlord so they can view and digitally acknowledge the report.
        {landlordEmail && ` You can email it to ${landlordEmail}.`}
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 text-xs border border-[#D1DDD9] rounded-xl px-3 py-2 text-[#5E7470] bg-[#F5F8F7]"
        />
        <button
          onClick={copy}
          className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
            copied ? "bg-[#EAFAF4] text-[#065F46]" : "bg-[#0E9E92] text-white"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
