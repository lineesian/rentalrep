"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";

type Flag = {
  id:             string;
  clause_excerpt: string;
  flag_type:      string;
  risk_level:     "low" | "medium" | "high";
  explanation:    string;
};

type CheckResult = {
  id:           string;
  status:       "processing" | "completed" | "failed";
  flags?:       Flag[];
  created_at:   string;
  completed_at: string | null;
};

const FLAG_LABEL: Record<string, string> = {
  reletting_fee:     "Reletting / vacancy fee",
  excessive_notice:  "Excessive notice period",
  deposit_overreach: "Unfair deposit deduction",
  maintenance_waiver:"Maintenance waiver",
  auto_renewal:      "Automatic renewal",
  rent_increase:     "Unilateral rent increase",
  other:             "Other concern",
};

const RISK_STYLE: Record<string, { badge: string; border: string; dot: string }> = {
  high:   { badge: "bg-red-100 text-red-700",    border: "border-red-200",   dot: "bg-red-500"   },
  medium: { badge: "bg-amber-100 text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
  low:    { badge: "bg-blue-50 text-blue-700",    border: "border-blue-200",  dot: "bg-blue-400"  },
};

export default function LeaseCheckResultPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`/api/lease-check/${id}`);
        if (!res.ok) { setError("Could not load this check."); return; }
        const data: CheckResult = await res.json();
        setResult(data);
        if (data.status === "processing") {
          timer = setTimeout(poll, 3000);
        }
      } catch {
        setError("Network error, retrying...");
        timer = setTimeout(poll, 5000);
      }
    }

    poll();
    return () => clearTimeout(timer);
  }, [id]);

  const highFlags   = result?.flags?.filter((f) => f.risk_level === "high")   ?? [];
  const mediumFlags = result?.flags?.filter((f) => f.risk_level === "medium") ?? [];
  const lowFlags    = result?.flags?.filter((f) => f.risk_level === "low")    ?? [];

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-24">
      {/* header */}
      <div className="bg-white border-b border-[#E6EFED] px-4 py-4 flex items-center gap-3">
        <Link href="/lease-check" className="text-[#0E9E92] text-sm font-medium">← Back</Link>
        <h1 className="font-heading font-bold text-[#07312C] text-lg">Lease analysis</h1>
      </div>

      {/* prominent disclaimer — always visible */}
      <div className="mx-4 mt-4 bg-[#FEF3C7] border border-[#F4B53F] rounded-2xl p-4">
        <p className="text-xs font-bold text-[#92400E] uppercase tracking-wide mb-1">Not legal advice</p>
        <p className="text-xs text-[#92400E] leading-relaxed">
          This is an automated screening only. It does not constitute legal advice.
          Always consult a qualified attorney before signing a lease.
        </p>
      </div>

      {/* loading state */}
      {(!result || result.status === "processing") && !error && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#0E9E92] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#07312C] font-heading font-semibold">Analysing your lease...</p>
          <p className="text-xs text-[#5E7470]">Extracting text and checking for risky clauses. Usually takes 15–30 seconds.</p>
        </div>
      )}

      {/* error */}
      {(error || result?.status === "failed") && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-6 text-center space-y-2">
          <p className="text-sm font-semibold text-red-600">Analysis failed</p>
          <p className="text-xs text-[#5E7470]">{error ?? "Could not process this document. Check the URL is publicly accessible and the file is a readable PDF."}</p>
          <Link href="/lease-check" className="text-[#0E9E92] text-sm font-semibold mt-2 inline-block">Try again</Link>
        </div>
      )}

      {/* results */}
      {result?.status === "completed" && (
        <div className="px-4 mt-4 space-y-4">
          {/* summary banner */}
          <div className={`rounded-2xl p-5 ${result.flags?.length === 0 ? "bg-[#EAFAF4]" : "bg-[#07312C]"}`}>
            {(result.flags ?? []).length === 0 ? (
              <>
                <p className="font-heading font-bold text-[#065F46] text-lg">No major issues found</p>
                <p className="text-sm text-[#065F46] mt-1 opacity-80">
                  We did not detect any of the known risky clause patterns in this lease. Still worth reading carefully — this tool checks for specific patterns, not everything.
                </p>
              </>
            ) : (
              <>
                <p className="font-heading font-bold text-white text-lg">
                  {(result.flags ?? []).length} clause{(result.flags ?? []).length !== 1 ? "s" : ""} flagged
                </p>
                <div className="flex gap-3 mt-2">
                  {highFlags.length   > 0 && <span className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full font-semibold">{highFlags.length} High</span>}
                  {mediumFlags.length > 0 && <span className="text-xs bg-amber-400 text-white px-2.5 py-1 rounded-full font-semibold">{mediumFlags.length} Medium</span>}
                  {lowFlags.length    > 0 && <span className="text-xs bg-blue-400 text-white px-2.5 py-1 rounded-full font-semibold">{lowFlags.length} Low</span>}
                  {result.flags && result.flags.length === 0 && null}
                </div>
              </>
            )}
          </div>

          {/* flag list — high first, then medium, then low */}
          {[...highFlags, ...mediumFlags, ...lowFlags].map((flag) => {
            const style = RISK_STYLE[flag.risk_level];
            return (
              <div key={flag.id} className={`bg-white rounded-2xl border ${style.border} p-4 space-y-3`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#07312C]">
                    {FLAG_LABEL[flag.flag_type] ?? flag.flag_type}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${style.badge}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dot} mr-1.5 align-middle`} />
                    {flag.risk_level} risk
                  </span>
                </div>

                <blockquote className="text-xs text-[#5E7470] italic bg-[#F5F8F7] rounded-xl px-3 py-2 leading-relaxed border-l-2 border-[#D1DDD9]">
                  &ldquo;{flag.clause_excerpt}&rdquo;
                </blockquote>

                <p className="text-sm text-[#07312C] leading-relaxed">{flag.explanation}</p>
              </div>
            );
          })}

          {/* bottom reminder */}
          <div className="bg-[#FEF3C7] border border-[#F4B53F] rounded-2xl p-4 mt-2">
            <p className="text-xs text-[#92400E] leading-relaxed">
              <span className="font-bold">Reminder:</span> These flags are a starting point for conversation with your landlord or attorney, not a definitive legal assessment. The Rental Housing Tribunal offers free mediation for lease disputes.
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
