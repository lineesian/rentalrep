"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { LeaseCheckPayButton } from "@/components/ui/LeaseCheckPayButton";

type Eligibility = {
  freeCheckAvailable: boolean;
  hasCredit:          boolean;
  fee:                string;
};

export default function LeaseCheckPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const justPaid     = searchParams.get("paid") === "1";

  const [url,     setUrl]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [eligibility,         setEligibility]         = useState<Eligibility | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  async function loadEligibility() {
    setCheckingEligibility(true);
    try {
      const res = await fetch("/api/lease-check");
      if (res.ok) setEligibility(await res.json());
    } finally {
      setCheckingEligibility(false);
    }
  }

  useEffect(() => {
    loadEligibility();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If PayFast just redirected back, poll briefly while the webhook lands.
  useEffect(() => {
    if (!justPaid) return;
    const interval = setInterval(loadEligibility, 3000);
    const timeout  = setTimeout(() => clearInterval(interval), 30000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justPaid]);

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
      if (res.status === 402) {
        setError("You'll need to pay for another Lease Check first.");
        loadEligibility();
      } else {
        setError(body.error ?? "Something went wrong");
      }
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/lease-check/${id}`);
  }

  const canUpload = eligibility?.freeCheckAvailable || eligibility?.hasCredit;

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

        {checkingEligibility ? (
          <div className="bg-white rounded-2xl p-4 text-center text-sm text-[#5E7470]">
            Checking your account…
          </div>
        ) : canUpload ? (
          <>
            {eligibility?.hasCredit && (
              <div className="bg-[#E6F7F5] border border-[#0E9E92] rounded-2xl p-3 text-xs text-[#07312C]">
                You have a paid Lease Check credit ready to use.
              </div>
            )}
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

            <p className="text-center text-xs text-[#A0B4AE] pb-4">
              Analysis usually takes 15–30 seconds.
            </p>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <p className="text-sm text-[#07312C] font-medium">
              You&apos;ve used your free Lease Check.
            </p>
            <p className="text-xs text-[#5E7470]">
              Every additional check is a small once-off fee, no subscription.
            </p>
            {justPaid && (
              <p className="text-xs text-[#0E9E92]">
                Confirming your payment… this can take a few seconds.
              </p>
            )}
            <LeaseCheckPayButton fee={eligibility?.fee ?? "25.00"} />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
