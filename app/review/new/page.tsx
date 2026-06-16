"use client";

import { useState, useRef, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { StarRow } from "@/components/ui/StarRow";
import type { Profile, ProfileWithScore } from "@/lib/types";

type Step = 1 | 2 | 3 | 4;

// ── Category definitions ───────────────────────────────────────

type Cat = { key: string; label: string; placeholder: string };

const LANDLORD_CATS: Cat[] = [
  { key: "communication",      label: "Communication",        placeholder: "e.g. Did they respond quickly?" },
  { key: "maintenance",        label: "Property Condition",   placeholder: "e.g. Was the property well maintained?" },
  { key: "deposit_handling",   label: "Deposit Handling",     placeholder: "e.g. Was your deposit returned in full?" },
  { key: "fairness",           label: "Responsiveness",       placeholder: "e.g. How quickly did they address issues?" },
  { key: "professionalism",    label: "Professionalism",      placeholder: "e.g. Were they respectful and professional?" },
  { key: "privacy_boundaries", label: "Privacy & Boundaries", placeholder: "e.g. Did they respect your privacy?" },
];

const AGENCY_CATS: Cat[] = [
  { key: "communication",     label: "Communication",     placeholder: "e.g. Were they easy to reach?" },
  { key: "fairness",          label: "Responsiveness",    placeholder: "e.g. How quickly did they respond?" },
  { key: "professionalism",   label: "Professionalism",   placeholder: "e.g. Were they professional throughout?" },
  { key: "transparency",      label: "Transparency",      placeholder: "e.g. Were all fees disclosed upfront?" },
  { key: "value_for_money",   label: "Value for Money",   placeholder: "e.g. Were their fees reasonable?" },
  { key: "paperwork_quality", label: "Paperwork Quality", placeholder: "e.g. Were documents accurate and on time?" },
];

const MIN_BODY = 100;
const MAX_BODY = 1000;

// ── Helpers ────────────────────────────────────────────────────

function avgRating(r: Record<string, number>) {
  const v = Object.values(r).filter(Boolean);
  if (!v.length) return 0;
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}

function roleLabel(role: string) {
  if (role === "agency") return "Agency";
  if (role === "tenant") return "Tenant";
  return "Landlord";
}

function article(role: string) { return role === "agency" ? "an" : "a"; }

// ── Shared UI ──────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const labels = ["Lease", "Who", "Rate", "Review"];
  return (
    <div className="flex items-center gap-2 mt-4">
      {([1, 2, 3, 4] as Step[]).map((n, i) => {
        const done    = step > n;
        const current = step === n;
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-heading border-2 transition-colors ${
              done    ? "bg-teal-400 text-white border-teal-400" :
              current ? "bg-transparent text-gold-400 border-gold-400" :
                        "bg-transparent text-white/40 border-teal-400/30"
            }`}>
              {done ? "✓" : n}
            </div>
            {i < 3 && <div className={`w-5 h-0.5 rounded ${done ? "bg-teal-400" : "bg-white/10"}`} />}
          </div>
        );
      })}
      <span className="text-xs text-mint-300 ml-1">{labels[(step as number) - 1]}</span>
    </div>
  );
}

function PrimaryBtn({ children, onClick, loading }: { children: React.ReactNode; onClick: () => void; loading?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full py-3.5 rounded-xl font-semibold text-sm bg-teal-400 text-white transition-opacity disabled:opacity-60">
      {loading ? "Please wait…" : children}
    </button>
  );
}

function GhostBtn({ children }: { children: React.ReactNode }) {
  return (
    <button disabled className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-teal-400/30 text-teal-400/40 bg-transparent">
      {children}
    </button>
  );
}

// ── Main flow ──────────────────────────────────────────────────

function ReviewFlow() {
  const params   = useSearchParams();
  const router   = useRouter();
  const role     = params.get("role") ?? params.get("type") ?? "landlord";
  const cats     = role === "agency" ? AGENCY_CATS : LANDLORD_CATS;
  const supabase = createClient();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);

  // Step 1 — lease details (stored in state; not yet written to DB)
  const [address,    setAddress]    = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd,   setLeaseEnd]   = useState("");
  const [leaseFile,  setLeaseFile]  = useState<File | null>(null);

  // Step 2 — who are you rating
  const [searchMode,   setSearchMode]   = useState<"search" | "manual">("search");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchResults,setSearchResults]= useState<ProfileWithScore[]>([]);
  const [searching,    startSearch]     = useTransition();
  const [reviewee,     setReviewee]     = useState<Profile | null>(null);   // on-platform
  const [guestName,    setGuestName]    = useState("");                      // off-platform
  const [guestEmail,   setGuestEmail]   = useState("");

  // Step 3 — ratings
  const [ratings,   setRatings]   = useState<Record<string, number>>({});
  const [catNotes,  setCatNotes]  = useState<Record<string, string>>({});
  const [recommend, setRecommend] = useState<"yes" | "no" | "maybe" | null>(null);

  // Step 4 — review text & submit
  const [body,       setBody]       = useState("");
  const [anonymous,  setAnonymous]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [done,       setDone]       = useState(false);

  // derived
  const step1Ready  = !!address && !!leaseStart && !!leaseEnd && !!leaseFile;
  const step2Ready  = searchMode === "search" ? !!reviewee : (guestName.trim().length > 1 && guestEmail.includes("@"));
  const allRated    = cats.every((c) => ratings[c.key] >= 1);
  const avgStars    = avgRating(ratings);
  const bodyOk      = body.length >= MIN_BODY && body.length <= MAX_BODY;

  const revieweeName = reviewee?.full_name ?? guestName;

  // ── Step 2 search ──────────────────────────────────────────

  function handleSearch(q: string) {
    setSearchQuery(q);
    setReviewee(null);
    if (!q.trim()) { setSearchResults([]); return; }
    startSearch(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, reputation_scores(*)")
        .eq("role", role)
        .ilike("full_name", `%${q}%`)
        .limit(15);
      setSearchResults((data ?? []) as ProfileWithScore[]);
    });
  }

  // ── Final submit (step 4) — all DB writes happen here ─────

  async function handleSubmit() {
    if (!bodyOk) return;
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    // 1. Upload lease file to storage
    const ext      = leaseFile!.name.split(".").pop() ?? "pdf";
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("leases")
      .upload(filePath, leaseFile!, { contentType: leaseFile!.type, upsert: false });

    if (uploadErr) { setError(uploadErr.message); setSubmitting(false); return; }

    // 2. Always create a lease row.
    // landlord_id is nullable (migration 008) so guest reviewees are handled with null.
    const isLandlordRole = role === "landlord";
    const { data: leaseRow, error: leaseErr } = await supabase
      .from("leases")
      .insert({
        landlord_id:      isLandlordRole ? (reviewee?.id ?? null) : user.id,
        tenant_id:        isLandlordRole ? user.id : (reviewee?.id ?? user.id),
        property_address: address,
        start_date:       leaseStart,
        end_date:         leaseEnd,
        document_url:     filePath,
      } as never)
      .select("id")
      .single();
    if (leaseErr) { setError(leaseErr.message); setSubmitting(false); return; }
    const leaseId = (leaseRow as { id: string }).id;

    // 3. Build structured body (category notes + free text)
    const noteLines = cats
      .filter((c) => catNotes[c.key]?.trim())
      .map((c) => `${c.label}: ${catNotes[c.key].trim()}`)
      .join("\n");
    const fullBody = noteLines ? `${noteLines}\n\n${body}` : body;
    const overall  = Math.max(1, Math.min(5, avgStars || 1));

    const payload: Record<string, unknown> = {
      reviewer_id:     user.id,
      reviewee_id:     reviewee?.id ?? null,   // null for guests — allowed after migration 007
      lease_id:        leaseId,                // always set — lease row created above
      overall,
      body:            fullBody,
      anonymous,
      would_recommend: recommend,
      guest_name:      reviewee ? null : guestName,
      guest_email:     reviewee ? null : guestEmail,
    };
    cats.forEach(({ key }) => { if (ratings[key]) payload[key] = ratings[key]; });
    if (!payload.communication) payload.communication = overall;
    if (!payload.fairness)      payload.fairness      = overall;

    const { error: reviewErr } = await supabase.from("reviews").insert(payload as never);
    if (reviewErr) { setError(reviewErr.message); setSubmitting(false); return; }

    setDone(true);
  }

  // ── Success ────────────────────────────────────────────────

  if (done) return (
    <div className="screen flex flex-col items-center justify-center px-6 text-center pb-10">
      <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-5">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="#0E9E92" strokeWidth={2}/>
          <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#0E9E92" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="font-heading font-bold text-2xl text-petrol-400 mb-2">Review Submitted!</h2>
      <p className="text-sm text-sage-400 mb-3 leading-relaxed">
        Your review has been submitted and is pending verification.
      </p>
      {revieweeName && (
        <p className="text-xs text-sage-400 mb-8">
          {`Once verified it will appear on ${revieweeName}'s profile.`}
        </p>
      )}
      <button className="btn-primary w-full" onClick={() => router.push("/home")}>
        Back to Home
      </button>
    </div>
  );

  // ── Shared header ──────────────────────────────────────────

  const header = (
    <div className="bg-petrol-400 px-5 pt-12 pb-5">
      <button onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.back()}
        className="text-mint-400 text-xl block mb-3" aria-label="Back">←</button>
      <h1 className="font-heading font-bold text-xl text-white mb-0.5">Write a Review</h1>
      <p className="text-sm text-mint-300">
        {revieweeName ? `Reviewing: ${revieweeName}` : `Reviewing: ${roleLabel(role)}`}
      </p>
      <StepIndicator step={step} />
    </div>
  );

  // ── Step 1 — Upload lease ──────────────────────────────────

  if (step === 1) return (
    <div className="screen">
      {header}
      <div className="px-4 pt-5 pb-24">
        <div className="card mb-4">
          <p className="font-heading font-semibold text-sm text-petrol-400 mb-4">Lease details</p>

          <label className="field-label">Property Address *</label>
          <input className="input mb-4" placeholder="e.g. 12 Oak Avenue, Melville"
            value={address} onChange={(e) => setAddress(e.target.value)} />

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="field-label">Start Date *</label>
              <input type="date" className="input" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} />
            </div>
            <div>
              <label className="field-label">End Date *</label>
              <input type="date" className="input" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} />
            </div>
          </div>

          <label className="field-label">Lease Document *</label>
          {leaseFile ? (
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-400 rounded-xl px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="#0E9E92" strokeWidth={2}/>
                <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-teal-400 truncate">{leaseFile.name}</p>
                <p className="text-xs text-sage-400">{(leaseFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => setLeaseFile(null)} className="text-sage-400 text-xl leading-none">×</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-3.5 rounded-xl border-2 border-dashed border-teal-400 bg-teal-50 text-teal-400 font-semibold text-sm flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round"/>
              </svg>
              Upload Lease Agreement (PDF)
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,image/*" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setLeaseFile(f); }} />
          <p className="text-xs text-sage-400 mt-2">Stored securely · used only for verification</p>
        </div>

        {step1Ready
          ? <PrimaryBtn onClick={() => setStep(2)}>Continue →</PrimaryBtn>
          : <GhostBtn>Fill in all fields to continue</GhostBtn>
        }
      </div>
    </div>
  );

  // ── Step 2 — Who are you rating ────────────────────────────

  if (step === 2) return (
    <div className="screen">
      {header}
      <div className="px-4 pt-5 pb-24">

        {/* Toggle: Search ↔ Manual */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {(["search", "manual"] as const).map((m) => (
            <button key={m} onClick={() => { setSearchMode(m); setReviewee(null); setSearchQuery(""); setSearchResults([]); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                searchMode === m ? "bg-white text-petrol-400 shadow-sm" : "text-sage-400"
              }`}>
              {m === "search" ? "Search RentalRep" : "Not on RentalRep yet"}
            </button>
          ))}
        </div>

        {/* Search mode */}
        {searchMode === "search" && (
          <>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="#5E7470" strokeWidth={1.8}/>
                <path d="M15.5 15.5L21 21" stroke="#5E7470" strokeWidth={1.8} strokeLinecap="round"/>
              </svg>
              <input
                className="flex-1 bg-transparent text-petrol-400 placeholder:text-sage-400 text-sm outline-none font-body"
                placeholder={`Search for ${article(role)} ${roleLabel(role).toLowerCase()} by name…`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
                autoComplete="off"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); setReviewee(null); }}
                  className="text-sage-400 text-lg leading-none">×</button>
              )}
            </div>

            {searching && <p className="text-center text-sm text-sage-400 py-6">Searching…</p>}

            {!searching && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-sage-400 mb-1">No {roleLabel(role).toLowerCase()}s found for &ldquo;{searchQuery}&rdquo;</p>
                <button onClick={() => setSearchMode("manual")} className="text-xs text-teal-400 font-semibold underline">
                  Add them manually instead
                </button>
              </div>
            )}

            {!searching && !searchQuery && (
              <div className="text-center py-10">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3" aria-hidden="true">
                  <circle cx="10.5" cy="10.5" r="6.5" stroke="#0E9E92" strokeWidth={1.8}/>
                  <path d="M15.5 15.5L21 21" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
                </svg>
                <p className="font-heading font-semibold text-petrol-400 mb-1">Find {article(role)} {roleLabel(role)}</p>
                <p className="text-xs text-sage-400">Search by name to find who you&apos;d like to review</p>
              </div>
            )}

            {searchResults.map((p) => {
              const score       = p.reputation_scores?.overall;
              const reviewCount = p.reputation_scores?.review_count ?? 0;
              const selected    = reviewee?.id === p.id;
              return (
                <button key={p.id} onClick={() => setReviewee(selected ? null : p)}
                  className={`card w-full flex items-center gap-3 mb-3 text-left transition-all ${
                    selected ? "border-2 border-teal-400" : "active:scale-[0.98]"
                  }`}>
                  <Avatar name={p.full_name} avatarUrl={p.avatar_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-[15px] text-petrol-400 truncate">{p.full_name}</p>
                    <p className="text-xs text-sage-400 capitalize mt-0.5">
                      {p.role} · {p.suburb ?? p.city ?? "South Africa"}
                    </p>
                    <p className="text-xs text-sage-400 mt-0.5">
                      {reviewCount > 0 ? `${reviewCount} review${reviewCount !== 1 ? "s" : ""}` : "No reviews yet"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="score-badge">{score != null ? score.toFixed(1) : "–"}</div>
                    <p className="text-[10px] text-sage-400 mt-1">/ 10</p>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* Manual mode — off-platform */}
        {searchMode === "manual" && (
          <div className="card">
            <div className="flex items-start gap-3 bg-gold-50 border border-gold-300 rounded-xl px-3 py-3 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="#F4B53F" strokeWidth={1.8}/>
                <path d="M12 8v4M12 16h.01" stroke="#F4B53F" strokeWidth={2} strokeLinecap="round"/>
              </svg>
              <p className="text-xs text-gold-700 font-body leading-relaxed">
                This person isn&apos;t on RentalRep yet. We&apos;ll send them an invite so they can claim and respond to your review.
              </p>
            </div>

            <label className="field-label">Full Name *</label>
            <input className="input mb-4" placeholder="e.g. Thabo Nkosi"
              value={guestName} onChange={(e) => setGuestName(e.target.value)} />

            <label className="field-label">Email Address *</label>
            <input className="input" type="email" placeholder="e.g. thabo@example.com"
              value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
          </div>
        )}

        <div className="mt-4">
          {step2Ready
            ? <PrimaryBtn onClick={() => setStep(3)}>Continue →</PrimaryBtn>
            : <GhostBtn>
                {searchMode === "search" ? "Select someone to continue" : "Enter name and email to continue"}
              </GhostBtn>
          }
        </div>
      </div>
    </div>
  );

  // ── Step 3 — Rate experience ───────────────────────────────

  if (step === 3) return (
    <div className="screen">
      {header}
      <div className="px-4 pt-5 pb-24">
        <div className="card mb-4">
          <h2 className="font-heading font-semibold text-[15px] text-petrol-400 mb-1">Rate your experience</h2>
          <p className="text-xs text-sage-400 mb-4">All categories required · tap a star to rate</p>

          {cats.map(({ key, label, placeholder }) => (
            <div key={key} className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-semibold text-petrol-400">{label}</p>
                {ratings[key] > 0 && (
                  <span className="text-xs font-bold text-teal-400">{ratings[key]}/5</span>
                )}
              </div>
              <StarRow value={ratings[key] ?? 0} onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))} />
              <input
                className="mt-2 w-full text-xs font-body text-petrol-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none focus:border-teal-400 transition-colors"
                placeholder={placeholder}
                value={catNotes[key] ?? ""}
                onChange={(e) => setCatNotes((n) => ({ ...n, [key]: e.target.value }))}
                maxLength={120}
              />
            </div>
          ))}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-petrol-400 mb-3">
              Would you {role === "agency" ? "use this agency" : "rent from this landlord"} again?
            </p>
            <div className="flex gap-2">
              {(["yes", "no", "maybe"] as const).map((v) => (
                <button key={v} onClick={() => setRecommend((r) => r === v ? null : v)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors capitalize ${
                    recommend === v
                      ? "bg-teal-400 text-white border-teal-400"
                      : "bg-white text-teal-400 border-teal-400"
                  }`}>
                  {v === "yes" ? "Yes" : v === "no" ? "No" : "Maybe"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {allRated
          ? <PrimaryBtn onClick={() => setStep(4)}>Continue →</PrimaryBtn>
          : <GhostBtn>Rate all categories to continue</GhostBtn>
        }
      </div>
    </div>
  );

  // ── Step 4 — Write review & submit ─────────────────────────

  return (
    <div className="screen">
      {header}
      <div className="px-4 pt-5 pb-24">

        {/* Summary card */}
        <div className="card mb-4 flex items-center gap-4">
          {reviewee
            ? <Avatar name={reviewee.full_name} avatarUrl={reviewee.avatar_url} size="sm" />
            : <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-400 font-heading font-bold text-sm flex-shrink-0">
                {guestName.charAt(0).toUpperCase()}
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-sm text-petrol-400 truncate">{revieweeName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} style={{ color: avgStars >= s ? "#F4B53F" : "#E0EBEA", fontSize: 14 }}>★</span>
                ))}
              </div>
              <span className="text-xs text-sage-400">{avgStars}/5 avg</span>
            </div>
          </div>
          {recommend && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
              recommend === "yes"  ? "bg-teal-50 text-teal-400" :
              recommend === "no"   ? "bg-red-50 text-red-400" :
                                     "bg-gold-50 text-gold-600"
            }`}>
              {recommend === "yes" ? "Would rent again" : recommend === "no" ? "Would not rent again" : "Maybe"}
            </span>
          )}
        </div>

        <div className="card mb-4">
          <h2 className="font-heading font-semibold text-[15px] text-petrol-400 mb-1">Tell us about your experience</h2>
          <p className="text-xs text-sage-400 mb-3">Minimum {MIN_BODY} characters · Be honest and constructive</p>
          <textarea rows={8}
            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-body text-petrol-400 outline-none focus:border-teal-400 transition-colors resize-none"
            placeholder="Describe your overall experience. What made it positive or negative? How did they handle issues? Would you recommend them?"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${body.length >= MIN_BODY ? "text-teal-400" : "text-sage-400"}`}>
              {body.length < MIN_BODY ? `${MIN_BODY - body.length} more characters needed` : "✓ Minimum reached"}
            </span>
            <span className={`text-xs ${body.length > MAX_BODY * 0.9 ? "text-gold-500" : "text-sage-400"}`}>
              {body.length}/{MAX_BODY}
            </span>
          </div>
        </div>

        {/* Anonymous toggle */}
        <button onClick={() => setAnonymous((a) => !a)}
          className="card w-full flex items-center justify-between mb-4 text-left">
          <div>
            <p className="font-heading font-semibold text-sm text-petrol-400">Post anonymously</p>
            <p className="text-xs text-sage-400 mt-0.5">Your name will be hidden from the review</p>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-1 ${anonymous ? "bg-teal-400" : "bg-gray-200"}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${anonymous ? "translate-x-5" : "translate-x-0"}`} />
          </div>
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {bodyOk
          ? <PrimaryBtn onClick={handleSubmit} loading={submitting}>Submit Review</PrimaryBtn>
          : <GhostBtn>Write your review to submit</GhostBtn>
        }
      </div>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense>
      <ReviewFlow />
    </Suspense>
  );
}
