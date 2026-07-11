"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { createClient } from "@/lib/supabase/client";
import type { ProfileWithScore } from "@/lib/types";

export default function AgencyPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ProfileWithScore | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lease upload form
  const [isAgency, setIsAgency]       = useState(false);
  const [agencyId, setAgencyId]       = useState<string | null>(null);
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [tenantName, setTenantName]   = useState("");
  const [landlordName, setLandlordName] = useState("");
  const [leaseAddr, setLeaseAddr]     = useState("");
  const [leaseStart, setLeaseStart]   = useState("");
  const [leaseEnd, setLeaseEnd]       = useState("");
  const [uploading, setUploading]     = useState(false);
  const [uploadMsg, setUploadMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.role === "agency") {
            setIsAgency(true);
            setAgencyId(user.id);
          }
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLeaseUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!agencyId) return;
    setUploading(true);
    setUploadMsg(null);

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 3);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("private_lease_records").insert({
      uploaded_by_agency_id: agencyId,
      tenant_full_name:      tenantName.trim(),
      landlord_full_name:    landlordName.trim(),
      property_address:      leaseAddr.trim(),
      lease_start_date:      leaseStart,
      lease_end_date:        leaseEnd,
      expires_at:            expiresAt.toISOString(),
    });

    if (error) {
      setUploadMsg({ ok: false, text: "Upload failed. Please try again." });
    } else {
      setUploadMsg({ ok: true, text: "Lease record uploaded successfully." });
      setTenantName(""); setLandlordName(""); setLeaseAddr("");
      setLeaseStart(""); setLeaseEnd("");
    }
    setUploading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);

    const { data } = await supabase
      .from("profiles")
      .select("*, reputation_scores(*)")
      .or(`full_name.ilike.%${query}%,id_number.ilike.%${query}%`)
      .eq("role", "tenant")
      .limit(1)
      .single();

    setResult(data as ProfileWithScore | null);
    setSearched(true);
    setLoading(false);
  }

  const TENANT_CATS = [
    { key: "communication",  label: "Communication" },
    { key: "payment_history", label: "Payment History" },
    { key: "property_care",  label: "Property Care" },
    { key: "fairness",       label: "Fairness" },
  ];

  const ACTIVITY = [
    { icon: "✓", text: "New lease uploaded: Thabo S. · Melville",  time: "2h ago",     color: "#0E9E92" },
    { icon: "★", text: "Review received from Kefilwe N. — 8.5/10", time: "Yesterday",  color: "#F4B53F" },
    { icon: "🔍", text: "Tenant screened: Sipho M. · Score: 9.1",  time: "2 days ago", color: "#2FD4C0" },
    { icon: "⚠️", text: "Review flagged for moderation",            time: "3 days ago", color: "#F4B53F" },
  ];

  return (
    <div className="screen">
      <div className="bg-petrol-400 px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name="Parkhurst Realty" size="md" />
          <div className="flex-1">
            <h1 className="font-heading font-bold text-lg text-white">Parkhurst Realty</h1>
            <span className="badge-verified text-[10px]">✓ Verified Agency</span>
          </div>
          <ScoreRing score={7.8} size={60} strokeWidth={5} />
        </div>
        <div className="flex gap-5 pt-4 border-t border-white/10">
          {[["48", "Leases"], ["4.1y", "Avg Tenancy"], ["94%", "On-Time Pay"]].map(([v, l]) => (
            <div key={l}>
              <p className="font-heading font-bold text-sm text-gold-400">{v}</p>
              <p className="text-[10px] text-mint-300">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <p className="section-label">Screen a Tenant</p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            className="input flex-1"
            placeholder="Search by name or ID number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="px-4 py-3 bg-teal-400 text-white rounded-xl font-semibold text-sm">
            {loading ? "…" : "Search"}
          </button>
        </form>

        {searched && (
          result ? (
            <div className="card mb-4 border-teal-400 border">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <Avatar name={result.full_name} avatarUrl={result.avatar_url} size="md" />
                <div className="flex-1">
                  <p className="font-heading font-semibold text-[15px] text-petrol-400">{result.full_name}</p>
                  {result.suburb && <p className="text-xs text-sage-400">{result.suburb}</p>}
                  {result.verified && <span className="badge-verified text-[10px] mt-1">✓ Verified</span>}
                </div>
                <div className="score-badge text-base">
                  {result.reputation_scores?.overall?.toFixed(1) ?? "–"}
                </div>
              </div>

              <p className="section-label mb-3">Full Breakdown</p>
              {TENANT_CATS.map(({ key, label }) => {
                const val = result.reputation_scores?.[key as keyof typeof result.reputation_scores];
                if (typeof val !== "number") return null;
                return <ScoreBar key={key} label={label} score={val} />;
              })}
            </div>
          ) : (
            <div className="card text-center py-6 mb-4">
              <p className="text-2xl mb-2">😕</p>
              <p className="text-sm text-sage-400">No tenant found for &ldquo;{query}&rdquo;</p>
            </div>
          )
        )}

        {isAgency && (
          <div className="mb-6">
            <button
              onClick={() => { setUploadOpen((o) => !o); setUploadMsg(null); }}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-teal-400 bg-teal-50 text-teal-400 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round"/>
              </svg>
              Upload Lease Record
            </button>

            {uploadOpen && (
              <form onSubmit={handleLeaseUpload} className="mt-3 card space-y-3">
                <p className="text-xs text-sage-400 font-body leading-relaxed">
                  Lease records are stored privately and used only to verify tenancies. No data is shown publicly.
                </p>
                <input
                  className="input w-full"
                  placeholder="Tenant full name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                />
                <input
                  className="input w-full"
                  placeholder="Landlord full name"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  required
                />
                <input
                  className="input w-full"
                  placeholder="Property address"
                  value={leaseAddr}
                  onChange={(e) => setLeaseAddr(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] text-sage-400 font-body mb-1 block">Lease start</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={leaseStart}
                      onChange={(e) => setLeaseStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-sage-400 font-body mb-1 block">Lease end</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={leaseEnd}
                      onChange={(e) => setLeaseEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {uploadMsg && (
                  <p className={`text-xs font-body ${uploadMsg.ok ? "text-teal-400" : "text-red-400"}`}>
                    {uploadMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-xl bg-teal-400 text-white font-semibold text-sm disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Save Lease Record"}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="section-label">Recent Activity</p>
        {ACTIVITY.map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: a.color + "22" }}
            >
              {a.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-petrol-400 font-medium leading-snug">{a.text}</p>
              <p className="text-xs text-sage-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
