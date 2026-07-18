"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MoveInReport {
  id:               string;
  property_address: string;
  created_at:       string;
}

interface Props {
  id:            string;
  moveInReports: MoveInReport[];
}

export function DisputeDepositButton({ id, moveInReports }: Props) {
  const router  = useRouter();
  const [open,  setOpen]  = useState(false);
  const [busy,  setBusy]  = useState(false);
  const [evidenceUrl,    setEvidenceUrl]    = useState("");
  const [moveInReportId, setMoveInReportId] = useState("");
  const [deductionReason, setDeductionReason] = useState("");

  async function submit() {
    setBusy(true);
    await fetch(`/api/deposits/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status:            "disputed",
        evidence_url:      evidenceUrl || undefined,
        move_in_report_id: moveInReportId || undefined,
        deduction_reason:  deductionReason || undefined,
      }),
    });
    setOpen(false);
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 text-xs font-semibold py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
      >
        Flag dispute
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-2xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-[#07312C] text-base">Flag a deposit dispute</h3>
              <button onClick={() => setOpen(false)} className="text-[#A0B4AE] text-xl leading-none">&times;</button>
            </div>

            <p className="text-xs text-[#5E7470]">
              Attach evidence to strengthen your case. A move-in report with photos is the most powerful evidence.
            </p>

            {/* Move-in report selector */}
            {moveInReports.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-[#5E7470] mb-1">
                  Attach move-in report
                </label>
                <select
                  value={moveInReportId}
                  onChange={(e) => setMoveInReportId(e.target.value)}
                  className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
                >
                  <option value="">No move-in report</option>
                  {moveInReports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.property_address} ({new Date(r.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {moveInReports.length === 0 && (
              <div className="bg-[#FEF3C7] rounded-xl px-3 py-2.5">
                <p className="text-xs text-[#92400E]">
                  You have no move-in reports yet. Documenting the property at move-in makes deposit disputes much easier to win.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#5E7470] mb-1">
                Deduction reason given by landlord
              </label>
              <input
                value={deductionReason}
                onChange={(e) => setDeductionReason(e.target.value)}
                placeholder="e.g. Damage to bathroom tiles"
                className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5E7470] mb-1">
                Additional evidence URL (optional)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-[#D1DDD9] text-[#5E7470] text-sm font-semibold rounded-xl py-3"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className="flex-1 bg-red-600 text-white text-sm font-semibold rounded-xl py-3 disabled:opacity-50"
              >
                {busy ? "Saving..." : "Flag dispute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
