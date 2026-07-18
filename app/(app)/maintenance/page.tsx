import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { ExportPdfButton } from "./ExportPdfButton";

const CATEGORY_LABEL: Record<string, string> = {
  plumbing:    "Plumbing",
  electrical:  "Electrical",
  structural:  "Structural",
  appliance:   "Appliance",
  security:    "Security",
  other:       "Other",
};

function fmt(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function StatusPill({ acknowledged, resolved }: { acknowledged: string | null; resolved: string | null }) {
  if (resolved)     return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAFAF4] text-[#065F46]">Resolved</span>;
  if (acknowledged) return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">Acknowledged</span>;
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E]">Open</span>;
}

export default async function MaintenancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: requests } = await (supabase as any)
    .from("maintenance_requests")
    .select("*")
    .eq("tenant_id", user.id)
    .order("logged_at", { ascending: false });

  const open     = (requests ?? []).filter((r: any) => !r.resolved_at).length;
  const resolved = (requests ?? []).filter((r: any) => !!r.resolved_at).length;

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-24">
      {/* header */}
      <div className="bg-white border-b border-[#E6EFED] px-4 py-4 flex items-center justify-between">
        <h1 className="font-heading font-bold text-[#07312C] text-xl">Maintenance</h1>
        <div className="flex items-center gap-2">
          <ExportPdfButton />
          <Link
            href="/maintenance/new"
            className="bg-[#0E9E92] text-white text-sm font-semibold font-heading rounded-xl px-4 py-2"
          >
            + New
          </Link>
        </div>
      </div>

      {/* summary strip */}
      {(requests ?? []).length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 flex gap-6">
          <div>
            <p className="text-2xl font-heading font-bold text-[#07312C]">{open}</p>
            <p className="text-xs text-[#5E7470]">Open</p>
          </div>
          <div className="w-px bg-[#E6EFED]" />
          <div>
            <p className="text-2xl font-heading font-bold text-[#07312C]">{resolved}</p>
            <p className="text-xs text-[#5E7470]">Resolved</p>
          </div>
          <div className="w-px bg-[#E6EFED]" />
          <div>
            <p className="text-2xl font-heading font-bold text-[#07312C]">{(requests ?? []).length}</p>
            <p className="text-xs text-[#5E7470]">Total</p>
          </div>
        </div>
      )}

      {/* request list */}
      <div className="px-4 mt-4 space-y-3">
        {(!requests || requests.length === 0) && (
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-[#5E7470] text-sm">No maintenance requests logged yet.</p>
            <Link href="/maintenance/new" className="text-[#0E9E92] text-sm font-semibold mt-1 inline-block">
              Log your first request
            </Link>
          </div>
        )}

        {(requests ?? []).map((r: any) => (
          <div key={r.id} className="bg-white rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-[#0E9E92] uppercase tracking-wide">
                  {CATEGORY_LABEL[r.category] ?? r.category}
                </span>
                <p className="text-sm text-[#07312C] mt-0.5 leading-snug">{r.description}</p>
                {r.guest_landlord_name && (
                  <p className="text-xs text-[#5E7470] mt-0.5">{r.guest_landlord_name}</p>
                )}
              </div>
              <StatusPill acknowledged={r.acknowledged_at} resolved={r.resolved_at} />
            </div>

            <div className="mt-3 pt-3 border-t border-[#F0F4F3] flex items-center justify-between">
              <div className="text-xs text-[#A0B4AE] space-y-0.5">
                <p>Logged {fmt(r.logged_at)}</p>
                {r.acknowledged_at && <p className="text-[#1D4ED8]">Acknowledged {fmt(r.acknowledged_at)}</p>}
                {r.resolved_at     && <p className="text-[#065F46]">Resolved {fmt(r.resolved_at)}</p>}
              </div>
              {!r.resolved_at && (
                <ResolveButton id={r.id} />
              )}
            </div>

            {r.landlord_notes && (
              <p className="mt-2 text-xs text-[#5E7470] italic bg-[#F5F8F7] rounded-lg px-3 py-2">
                {r.landlord_notes}
              </p>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

import { ResolveButton } from "./ResolveButton";
