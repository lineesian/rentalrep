import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// Revalidate once an hour — public cached page
export const revalidate = 3600;

// ── Types ─────────────────────────────────────────────────────────────────────

type Summary = {
  total_users:              number;
  total_reviews:            number;
  total_deposits:           number;
  total_maintenance_requests: number;
  suburbs_covered:          number;
};

type SuburbLandlordScore = {
  suburb:              string;
  city:                string | null;
  review_count:        number;
  avg_overall:         number;
  avg_maintenance:     number | null;
  avg_deposit_handling: number | null;
  avg_communication:   number | null;
};

type SuburbDepositStat = {
  suburb:               string;
  city:                 string | null;
  deposit_count:        number;
  pct_returned_full:    number;
  pct_interest_bearing: number;
  avg_deposit_amount:   number;
};

type SuburbActivity = {
  suburb:          string;
  city:            string;
  review_count:    number;
  reviewer_count:  number;
  reviewee_count:  number;
  last_review_at:  string;
};

type SuburbMaintenance = {
  suburb:              string;
  city:                string | null;
  request_count:       number;
  resolved_count:      number;
  avg_hours_to_resolve: number | null;
  pct_resolved:        number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function ScoreBar({ value, max = 5 }: { value: number | null; max?: number }) {
  if (value == null) return <span className="text-xs text-sage-400">n/a</span>;
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-teal-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-petrol-400 w-6 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function DepositBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#0E9E92" : pct >= 60 ? "#F4B53F" : "#e05252";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-xs text-sage-400 font-body">
        Not enough data yet in {label}.<br/>Data builds as verified tenancies accumulate.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InsightsPage() {
  const supabase = await createClient();

  const [
    { data: summary },
    { data: landlordScores },
    { data: depositStats },
    { data: activity },
    { data: maintenanceStats },
  ] = await Promise.all([
    (supabase as any).from("v_platform_summary").select("*").maybeSingle(),
    (supabase as any).from("v_suburb_landlord_scores").select("*").limit(10),
    (supabase as any).from("v_suburb_deposit_stats").select("*").limit(10),
    (supabase as any).from("v_suburb_activity").select("*").limit(10),
    (supabase as any).from("v_suburb_maintenance_stats").select("*").limit(10),
  ]);

  const s = (summary ?? {}) as Partial<Summary>;
  const ls = (landlordScores ?? []) as SuburbLandlordScore[];
  const ds = (depositStats   ?? []) as SuburbDepositStat[];
  const ac = (activity       ?? []) as SuburbActivity[];
  const ms = (maintenanceStats ?? []) as SuburbMaintenance[];

  const hasAnyData = ls.length > 0 || ds.length > 0 || ac.length > 0 || ms.length > 0;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#07312C", lineHeight: 1.6, overflowX: "hidden", background: "#F5F8F7", minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <nav style={{ background: "rgba(7,49,44,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 5%", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: "white" }}>
            Rental<span style={{ color: "#2FD4C0" }}>Rep</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>Back to home</Link>
          <Link href="/auth/login" style={{ textDecoration: "none", background: "#0E9E92", color: "white", padding: "8px 18px", borderRadius: 8, fontWeight: 600, fontSize: 13 }}>Sign in</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: "#07312C", padding: "72px 5% 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 80% 30%, rgba(14,158,146,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(14,158,146,0.15)", border: "1px solid rgba(14,158,146,0.3)", color: "#0E9E92", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, marginBottom: 24 }}>
            SA Rental Transparency Report
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: "-1px", maxWidth: 760, marginBottom: 20 }}>
            What is actually happening<br />in South Africa&apos;s rental market.
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 560, lineHeight: 1.7, marginBottom: 40 }}>
            Aggregated, anonymised data from verified tenancies across South Africa. No speculation. No hearsay. Just what landlords, tenants and properties actually scored.
          </p>

          {/* Platform counters */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { val: s.total_reviews     ?? 0, label: "Verified reviews" },
              { val: s.total_users       ?? 0, label: "Verified users" },
              { val: s.total_deposits    ?? 0, label: "Deposits tracked" },
              { val: s.suburbs_covered   ?? 0, label: "Suburbs with data" },
            ].map(({ val, label }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "18px 24px", minWidth: 130 }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700, color: "#F4B53F", lineHeight: 1 }}>
                  {val.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Early-stage notice ── */}
      {!hasAnyData && (
        <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 5%" }}>
          <div style={{ background: "white", borderRadius: 20, border: "2px solid #0E9E92", padding: "32px 36px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#E6F9F8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E9E92" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, color: "#07312C", marginBottom: 10 }}>The data is being built.</h2>
            <p style={{ fontSize: 15, color: "#4a6b67", maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.65 }}>
              This dashboard populates automatically as verified tenancies are completed on RentalRep. Each metric requires a minimum of three verified data points per suburb before it appears here.
            </p>
            <Link
              href="/#waitlist"
              style={{ background: "#07312C", color: "white", fontWeight: 600, fontSize: 14, padding: "12px 28px", borderRadius: 10, textDecoration: "none", display: "inline-block" }}
            >
              Join the waitlist to contribute data
            </Link>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 5% 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 24 }}>

          {/* ── Panel 1: Landlord scores by suburb ── */}
          <div style={{ background: "white", borderRadius: 20, padding: "28px 32px", border: "1px solid #d4e6e4" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0E9E92", marginBottom: 8 }}>Landlord reputation</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: "#07312C", marginBottom: 4 }}>Average landlord scores by suburb</h2>
              <p style={{ fontSize: 13, color: "#8aa5a2" }}>Based on verified tenant reviews. Minimum 3 reviews required.</p>
            </div>

            {ls.length === 0 ? <EmptyState label="any suburb" /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {ls.map((row, i) => (
                  <div key={row.suburb + (row.city ?? "")} style={{ paddingBottom: 16, borderBottom: i < ls.length - 1 ? "1px solid #f0f6f5" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#07312C" }}>{row.suburb}</span>
                        {row.city && <span style={{ fontSize: 12, color: "#8aa5a2", marginLeft: 6 }}>{row.city}</span>}
                      </div>
                      <span style={{ fontSize: 12, color: "#8aa5a2" }}>{row.review_count} reviews</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "#8aa5a2", width: 100, flexShrink: 0 }}>Overall</span>
                        <ScoreBar value={row.avg_overall} max={10} />
                      </div>
                      {row.avg_maintenance != null && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "#8aa5a2", width: 100, flexShrink: 0 }}>Maintenance</span>
                          <ScoreBar value={row.avg_maintenance} />
                        </div>
                      )}
                      {row.avg_deposit_handling != null && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "#8aa5a2", width: 100, flexShrink: 0 }}>Deposits</span>
                          <ScoreBar value={row.avg_deposit_handling} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Panel 2: Deposit return rates ── */}
          <div style={{ background: "white", borderRadius: 20, padding: "28px 32px", border: "1px solid #d4e6e4" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F4B53F", marginBottom: 8 }}>Deposit health</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: "#07312C", marginBottom: 4 }}>Deposit return rates by area</h2>
              <p style={{ fontSize: 13, color: "#8aa5a2" }}>What percentage of tenants received their deposit back in full.</p>
            </div>

            {ds.length === 0 ? <EmptyState label="any suburb" /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {ds.map((row, i) => (
                  <div key={row.suburb + (row.city ?? "")} style={{ paddingBottom: 16, borderBottom: i < ds.length - 1 ? "1px solid #f0f6f5" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#07312C" }}>{row.suburb}</span>
                        {row.city && <span style={{ fontSize: 12, color: "#8aa5a2", marginLeft: 6 }}>{row.city}</span>}
                      </div>
                      <span style={{ fontSize: 12, color: "#8aa5a2" }}>{row.deposit_count} deposits</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "#8aa5a2", width: 120, flexShrink: 0 }}>Returned in full</span>
                        <DepositBar pct={row.pct_returned_full} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "#8aa5a2", width: 120, flexShrink: 0 }}>Interest-bearing</span>
                        <DepositBar pct={row.pct_interest_bearing} />
                      </div>
                    </div>
                    {row.avg_deposit_amount > 0 && (
                      <p style={{ fontSize: 11, color: "#8aa5a2", marginTop: 6 }}>
                        Avg deposit: R{Number(row.avg_deposit_amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Panel 3: Most active areas ── */}
          <div style={{ background: "white", borderRadius: 20, padding: "28px 32px", border: "1px solid #d4e6e4" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0E9E92", marginBottom: 8 }}>Platform activity</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: "#07312C", marginBottom: 4 }}>Most reviewed areas</h2>
              <p style={{ fontSize: 13, color: "#8aa5a2" }}>Where RentalRep is most active across South Africa.</p>
            </div>

            {ac.length === 0 ? <EmptyState label="any suburb" /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ac.map((row, i) => {
                  const maxCount = ac[0]?.review_count ?? 1;
                  const pct = (row.review_count / maxCount) * 100;
                  return (
                    <div key={row.suburb + row.city} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#8aa5a2", width: 20, flexShrink: 0, textAlign: "center" }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#07312C" }}>{row.suburb}</span>
                            {row.city && <span style={{ fontSize: 11, color: "#8aa5a2", marginLeft: 5 }}>{row.city}</span>}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#0E9E92" }}>{row.review_count}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 4, background: "#f0f6f5", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 4, background: "#0E9E92", width: `${pct}%` }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#8aa5a2", marginTop: 3 }}>
                          {row.reviewer_count} reviewers · {row.reviewee_count} profiles reviewed
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Panel 4: Maintenance resolution ── */}
          <div style={{ background: "white", borderRadius: 20, padding: "28px 32px", border: "1px solid #d4e6e4" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0E9E92", marginBottom: 8 }}>Maintenance responsiveness</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: "#07312C", marginBottom: 4 }}>Repair response times by suburb</h2>
              <p style={{ fontSize: 13, color: "#8aa5a2" }}>Average hours from maintenance request to resolution.</p>
            </div>

            {ms.length === 0 ? <EmptyState label="any suburb" /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {ms.map((row, i) => {
                  const hrs = row.avg_hours_to_resolve;
                  const color = hrs == null ? "#8aa5a2" : hrs <= 48 ? "#0E9E92" : hrs <= 120 ? "#F4B53F" : "#e05252";
                  const label = hrs == null ? "No resolved data" : hrs <= 24 ? "Same day" : hrs <= 48 ? "Within 2 days" : hrs <= 120 ? `${Math.round(hrs / 24)} days avg` : `${Math.round(hrs / 24)} days avg`;
                  return (
                    <div key={row.suburb + (row.city ?? "")} style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 14, borderBottom: i < ms.length - 1 ? "1px solid #f0f6f5" : "none" }}>
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: color + "18",
                          border: `1.5px solid ${color}40`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 700, color,
                          textAlign: "center", lineHeight: 1.2, padding: 4,
                        }}
                      >
                        {hrs != null ? `${Math.round(hrs)}h` : "—"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#07312C" }}>{row.suburb}</span>
                          {row.city && <span style={{ fontSize: 11, color: "#8aa5a2" }}>{row.city}</span>}
                        </div>
                        <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
                        <span style={{ fontSize: 11, color: "#8aa5a2", marginLeft: 8 }}>
                          {row.pct_resolved}% resolved · {row.request_count} requests
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── Methodology note ── */}
        <div style={{ marginTop: 40, background: "white", borderRadius: 16, padding: "24px 32px", border: "1px solid #d4e6e4" }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: "#07312C", marginBottom: 10 }}>About this data</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { title: "Verified only",     body: "Every data point comes from a review anchored to a verified lease. No anonymous opinions, no unverified submissions." },
              { title: "Fully anonymised",  body: "All insights are aggregated at suburb level. No individual is identifiable. POPIA compliant." },
              { title: "Minimum threshold", body: "A suburb only appears when it has 3 or more verified data points, preventing a single outlier from skewing results." },
              { title: "Updated hourly",    body: "The dashboard updates every hour as new reviews, deposits, and maintenance records are verified on the platform." },
            ].map(({ title, body }) => (
              <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0E9E92", marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#07312C", marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "#4a6b67", lineHeight: 1.55 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ marginTop: 40, background: "#07312C", borderRadius: 20, padding: "36px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, color: "white", marginBottom: 8 }}>Want your suburb to appear here?</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 480 }}>
              Every verified tenancy you complete on RentalRep contributes to this dataset. Join to help build the most comprehensive picture of SA&apos;s rental market.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            <Link
              href="/#waitlist"
              style={{ background: "#0E9E92", color: "white", fontWeight: 600, fontSize: 14, padding: "13px 24px", borderRadius: 10, textDecoration: "none" }}
            >
              Join the waitlist
            </Link>
            <Link
              href="/auth/login"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontWeight: 600, fontSize: 14, padding: "13px 24px", borderRadius: 10, textDecoration: "none" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#07312C", padding: "32px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: "white" }}>
            Rental<span style={{ color: "#2FD4C0" }}>Rep</span>
          </span>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            &copy; 2026 RentalRep. Johannesburg, South Africa. Data is aggregated and anonymised.
          </p>
        </div>
      </footer>

    </div>
  );
}
