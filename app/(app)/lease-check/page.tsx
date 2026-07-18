"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";

export default function LeaseCheckPage() {
  const router  = useRouter();
  const [url,   setUrl]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/lease-check", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_url: url }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/lease-check/${id}`);
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-24">
      {/* header */}
      <div className="bg-white border-b border-[#E6EFED] px-4 py-4">
        <h1 className="font-heading font-bold text-[#07312C] text-xl">Lease Check</h1>
        <p className="text-xs text-[#5E7470] mt-0.5">Flag risky clauses before you sign</p>
      </div>

      <div className="px-4 pt-6 space-y-4">
        {/* explainer card */}
        <div className="bg-[#07312C] rounded-2xl p-5 space-y-3">
          <p className="text-[#2FD4C0] text-xs font-semibold uppercase tracking-wide">How it works</p>
          <ul className="space-y-2 text-sm text-[#C8DDD9]">
            <li className="flex gap-2"><span className="text-[#F4B53F] font-bold">1.</span>Paste the URL of your lease PDF</li>
            <li className="flex gap-2"><span className="text-[#F4B53F] font-bold">2.</span>We extract the text and analyse it for risky clauses</li>
            <li className="flex gap-2"><span className="text-[#F4B53F] font-bold">3.</span>Each flag gets a plain-English explanation and a risk level</li>
          </ul>
        </div>

        {/* disclaimer — prominent, not buried */}
        <div className="bg-[#FEF3C7] border border-[#F4B53F] rounded-2xl p-4">
          <p className="text-xs font-bold text-[#92400E] uppercase tracking-wide mb-1">Not legal advice</p>
          <p className="text-xs text-[#92400E] leading-relaxed">
            This tool flags patterns that may be risky under South African tenancy law.
            It is an automated screening only and does not constitute legal advice.
            Always consult a qualified attorney before signing a lease.
          </p>
        </div>

        {/* form */}
        <form onSubmit={submit} className="bg-white rounded-2xl p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5E7470] mb-1">
              Lease document URL (PDF)
            </label>
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://drive.google.com/... or storage URL"
              className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
            />
            <p className="text-xs text-[#A0B4AE] mt-1.5">
              Upload your PDF to Google Drive, Dropbox, or Supabase storage and paste the public link here.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E9E92] text-white font-heading font-semibold rounded-2xl py-3.5 text-sm disabled:opacity-60"
          >
            {loading ? "Starting analysis..." : "Analyse my lease"}
          </button>
        </form>

        {/* past checks placeholder — could be a list in a future iteration */}
        <p className="text-center text-xs text-[#A0B4AE] pb-4">
          Analysis usually takes 15–30 seconds.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
