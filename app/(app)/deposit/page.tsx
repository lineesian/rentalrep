import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { computeDepositHealth } from "@/lib/depositHealth";
import type { Deposit } from "@/lib/depositHealth";
import { BottomNav } from "@/components/layout/BottomNav";

const STATUS_LABEL: Record<string, string> = {
  held:             "Held",
  returned_full:    "Returned in full",
  returned_partial: "Partially returned",
  withheld:         "Withheld",
  disputed:         "Disputed",
};

const STATUS_COLOR: Record<string, string> = {
  held:             "bg-[#FEF9EC] text-[#92600D]",
  returned_full:    "bg-[#EAFAF4] text-[#065F46]",
  returned_partial: "bg-[#FEF3C7] text-[#92400E]",
  withheld:         "bg-[#FEE2E2] text-[#991B1B]",
  disputed:         "bg-[#FEE2E2] text-[#991B1B]",
};

function fmt(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export default async function DepositPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: deposits }, { data: moveInReports }] = await Promise.all([
    (supabase as any)
      .from("deposits")
      .select("*")
      .eq("tenant_id", user.id)
      .order("created_at", { ascending: false }),
    (supabase as any)
      .from("move_in_reports")
      .select("id, property_address, created_at")
      .eq("tenant_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const health = computeDepositHealth((deposits ?? []) as Deposit[]);

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-24">
      {/* header */}
      <div className="bg-white border-b border-[#E6EFED] px-4 py-4 flex items-center justify-between">
        <h1 className="font-heading font-bold text-[#07312C] text-xl">Deposits</h1>
        <Link
          href="/deposit/new"
          className="bg-[#0E9E92] text-white text-sm font-semibold font-heading rounded-xl px-4 py-2"
        >
          + Log deposit
        </Link>
      </div>

      {/* health score card */}
      <div className="mx-4 mt-4 bg-[#07312C] rounded-2xl p-5 flex items-center gap-5">
        <ScoreRing score={health.score} size={80} strokeWidth={7} />
        <div>
          <p className="text-[#2FD4C0] text-xs font-semibold uppercase tracking-wide mb-0.5">
            Deposit Health Score
          </p>
          <p className="text-white font-heading font-bold text-2xl leading-none">
            {health.score > 0 ? `${health.score}/10` : "No data yet"}
          </p>
          {health.score > 0 && (
            <p className="text-[#A0C4BF] text-sm mt-0.5">{health.label}</p>
          )}
          {health.deposits > 0 && (
            <p className="text-[#5E9992] text-xs mt-1.5">
              {health.deposits} deposit{health.deposits !== 1 ? "s" : ""}
              {" · "}{health.pctReturnedFull}% returned in full
              {health.pctInterestBearing > 0 ? ` · ${health.pctInterestBearing}% interest-bearing` : ""}
            </p>
          )}
        </div>
      </div>

      {/* deposit list */}
      <div className="px-4 mt-4 space-y-3">
        {(!deposits || deposits.length === 0) && (
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-[#5E7470] text-sm">No deposits logged yet.</p>
            <Link href="/deposit/new" className="text-[#0E9E92] text-sm font-semibold mt-1 inline-block">
              Log your first deposit
            </Link>
          </div>
        )}

        {(deposits ?? []).map((d: any) => (
          <div key={d.id} className="bg-white rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-[#07312C] text-sm truncate">
                  {d.property_address}
                </p>
                <p className="text-xs text-[#5E7470] mt-0.5">
                  {d.guest_landlord_name ?? "Landlord on RentalRep"}
                  {d.bank_name ? ` · ${d.bank_name}` : ""}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLOR[d.status] ?? STATUS_COLOR.held}`}>
                {STATUS_LABEL[d.status] ?? d.status}
              </span>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-2xl font-heading font-bold text-[#07312C]">
                  R{Number(d.amount).toLocaleString("en-ZA")}
                </p>
                {d.amount_returned != null && d.status !== "returned_full" && (
                  <p className="text-xs text-[#5E7470]">
                    R{Number(d.amount_returned).toLocaleString("en-ZA")} returned
                    {d.amount_withheld ? ` · R${Number(d.amount_withheld).toLocaleString("en-ZA")} withheld` : ""}
                  </p>
                )}
              </div>
              <div className="text-right">
                {d.is_interest_bearing && (
                  <span className="text-xs text-[#0E9E92] font-semibold">Interest-bearing</span>
                )}
                {d.created_at && (
                  <p className="text-xs text-[#A0B4AE] mt-0.5">Logged {fmt(d.created_at)}</p>
                )}
              </div>
            </div>

            {d.status === "held" && (
              <div className="mt-3 pt-3 border-t border-[#F0F4F3] flex gap-2">
                <UpdateDepositButton id={d.id} action="returned_full" label="Mark returned" />
                <DisputeDepositButton id={d.id} moveInReports={moveInReports ?? []} />
              </div>
            )}

            {d.deduction_reason && (
              <p className="mt-2 text-xs text-[#5E7470] italic">
                Deduction reason: {d.deduction_reason}
              </p>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

import { UpdateDepositButton } from "./UpdateDepositButton";
import { DisputeDepositButton } from "./DisputeDepositButton";
