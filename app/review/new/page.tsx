"use client";

import { useState, useRef, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { StarRow } from "@/components/ui/StarRow";
import type { Profile, ProfileWithScore } from "@/lib/types";

type Step = 1 | 2 | 3 | 4;

// ── Category definitions ────────────────────────────────────────

type Cat = { key: string; label: string; placeholder: string };

const LANDLORD_CATS: Cat[] = [
  { key: "communication",     label: "Communication",       placeholder: "e.g. Did they respond quickly?" },
  { key: "maintenance",       label: "Property Condition",  placeholder: "e.g. Was the property well maintained?" },
  { key: "deposit_handling",  label: "Deposit Handling",    placeholder: "e.g. Was your deposit returned in full?" },
  { key: "fairness",          label: "Responsiveness",      placeholder: "e.g. How quickly did they address issues?" },
  { key: "professionalism",   label: "Professionalism",     placeholder: "e.g. Were they respectful and professional?" },
  { key: "privacy_boundaries",label: "Privacy & Boundaries",placeholder: "e.g. Did they respect your privacy?" },
];

const AGENCY_CATS: Cat[] = [
  { key: "communication",    label: "Communication",     placeholder: "e.g. Were they easy to reach?" },
  { key: "fairness",         label: "Responsiveness",    placeholder: "e.g. How quickly did they respond?" },
  { key: "professionalism",  label: "Professionalism",   placeholder: "e.g. Were they professional throughout?" },
  { key: "transparency",     label: "Transparency",      placeholder: "e.g. Were all fees disclosed upfront?" },
  { key: "value_for_money",  label: "Value for Money",   placeholder: "e.g. Were their fees reasonable?" },
  { key: "paperwork_quality",label: "Paperwork Quality", placeholder: "e.g. Were documents accurate and on time?" },
];

const MIN_BODY = 100;
const MAX_BODY = 1000;

// ── Helpers ────────────────────────────────────────────────────

function avgRating(ratings: Record<string, number>): number {
  const vals = Object.values(ratings).filter(Boolean);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function roleLabel(role: string) {
  if (role === "agency")   return "Agency";
  if (role === "tenant")   return "Tenant";
  return "Landlord";
}

// ── Sub-components ─────────────────────────────────────────────

function StepIndicator({ step, total = 4 }: { step: Step; total?: number }) {
  const labels = ["Find", "Lease", "Rate", "Review"];
  return (
    <div className="flex items-center gap-2 mt-4">
      {Array.from({ length: total }).map((_, i) => {
        const n = (i + 1) as Step;
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
            {i < total - 1 && (
              <div className={`w-5 h-0.5 rounded ${done ? "bg-teal-400" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
      <span className="text-xs text-mint-300 ml-1">{labels[(step as number) - 1]}</span>
    </div>
  );
}

function DisabledBtn({ children }: { children: React.ReactNode }) {
  return (
    <button disabled className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-teal-400/30 text-teal-400/40 bg-transparent">
      {children}
    </button>
  );
}

function PrimaryBtn({ children, onClick, loading }: { children: React.ReactNode; onClick: () => void; loading?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-sm bg-teal-400 text-white transition-opacity disabled:opacity-60">
      {loading ? "Please wait…" : children}
    </button>
  );
}

// ── Main flow ──────────────────────────────────────────────────

function ReviewFlow() {
  const params  = useSearchParams();
  const router  = useRouter();
  const role    = params.get("role") ?? params.get("type") ?? "landlord";
  const cats    = role === "agency" ? AGENCY_CATS : LANDLORD_CATS;

  const supabase = createClient();
  const fileRef  = useRef<HTMLInputElement>(null);

  // Step state
  const [step, setStep]           = useState<Step>(1);

  // Step 1
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchResults, setSearchResults]   = useState<ProfileWithScore[]>([]);
  const [searching, startSearch]            = useTransition();
  const [reviewee, setReviewee]             = useState<Profile | null>(null);

  // Step 2
  const [address, setAddress]       = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd]     = useState("");
  const [leaseFile, setLeaseFile]   = useState<File | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [leaseId, setLeaseId]       = useState<string | null>(null);

  // Step 3
  const [ratings, setRatings]       = useState<Record<string, number>>({});
  const [catNotes, setCatNotes]     = useState<Record<string, string>>({});
  const [recommend, setRecommend]   = useState<"yes" | "no" | "maybe" | null>(null);

  // Step 4
  const [body, setBody]             = useState("");
  const [anonymous, setAnonymous]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [done, setDone]             = useState(false);

  // ── Step 1: search ──────────────────────────────────────────

  function handleSearch(q: string) {
    setSearchQuery(q);
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

  function selectReviewee(p: Profile) {
    setReviewee(p);
    setStep(2);
  }

  // ── Step 2: upload lease ────────────────────────────────────

  async function handleLeaseConfirm() {
    if (!reviewee || !address || !leaseStart || !leaseEnd || !leaseFile) return;
    setUploading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    // Upload PDF to Storage
    const ext      = leaseFile.name.split(".").pop() ?? "pdf";
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("leases")
      .upload(filePath, leaseFile, { contentType: leaseFile.type, upsert: false });

    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }

    // Insert lease row
    const isLandlord = role === "landlord";
    const { data: lease, error: leaseErr } = await supabase
      .from("leases")
      .insert({
        landlord_id:      isLandlord ? reviewee.id : user.id,
        tenant_id:        isLandlord ? user.id : reviewee.id,
        property_address: address,
        start_date:       leaseStart,
        end_date:         leaseEnd,
        document_url:     filePath,
      } as never)
      .select("id")
      .single();

    if (leaseErr) { setError(leaseErr.message); setUploading(false); return; }

    setLeaseId((lease as { id: string }).id);
    setUploading(false);
    setStep(3);
  }

  const step2Ready = !!reviewee && !!address && !!leaseStart && !!leaseEnd && !!leaseFile;

  // ── Step 3: ratings ─────────────────────────────────────────

  const allRated   = cats.every((c) => ratings[c.key] >= 1);
  const avgStars   = avgRating(ratings);

  // ── Step 4: submit ──────────────────────────────────────────

  async function handleSubmit() {
    if (!leaseId || !reviewee || body.length < MIN_BODY) return;
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    // Build structured body: step-3 notes prepended to step-4 text
    const noteLines = cats
      .filter((c) => catNotes[c.key]?.trim())
      .map((c) => `${c.label}: ${catNotes[c.key].trim()}`)
      .join("\n");
    const fullBody = noteLines ? `${noteLines}\n\n${body}` : body;

    const overall = Math.max(1, Math.min(5, avgStars || 1));

    const payload: Record<string, unknown> = {
      reviewer_id:  user.id,
      reviewee_id:  reviewee.id,
      lease_id:     leaseId,
      overall,
      body:         fullBody,
      anonymous,
      would_recommend: recommend,
    };
    cats.forEach(({ key }) => { if (ratings[key]) payload[key] = ratings[key]; });

    // fairness and communication are NOT NULL in DB — ensure they're set
    if (!payload.communication) payload.communication = overall;
    if (!payload.fairness)      payload.fairness      = overall;

    const { error: reviewErr } = await supabase.from("reviews").insert(payload as never);
    if (reviewErr) { setError(reviewErr.message); setSubmitting(false); return; }

    setDone(true);
  }

  const bodyOk = body.length >= MIN_BODY && body.length <= MAX_BODY;

  // ── Success screen ──────────────────────────────────────────

  if (done) {
    return (
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
        <p className="text-xs text-sage-400 mb-8">
          Once verified it will appear on {reviewee?.full_name}&apos;s profile.
        </p>
        <span className="badge-verified text-sm px-4 py-2 mb-8">
          <span style={{ color: "#F4B53F" }}>✓</span> Verified Tenancy Review
        </span>
        <button className="btn-primary w-full" onClick={() => router.push("/home")}>
          Back to Home
        </button>
      </div>
    );
  }

  // ── Header (shared) ─────────────────────────────────────────

  const header = (
    <div className="bg-petrol-400 px-5 pt-12 pb-5">
      <button
        onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.back()}
        className="text-mint-400 text-xl block mb-3"
        aria-label="Back"
      >←</button>
      <h1 className="font-heading font-bold text-xl text-white mb-0.5">Write a Review</h1>
      <p className="text-sm text-mint-300">
        {reviewee ? `Reviewing: ${reviewee.full_name}` : `Reviewing: ${roleLabel(role)}`}
      </p>
      <StepIndicator step={step} />
    </div>
  );

  // ── Step 1 — Find who to rate ───────────────────────────────

  if (step === 1) return (
    <div className="screen">
      {header}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-shrink-0">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="#5E7470" strokeWidth={1.8}/>
            <path d="M15.5 15.5L21 21" stroke="#5E7470" strokeWidth={1.8} strokeLinecap="round"/>
          </svg>
          <input
            className="flex-1 bg-transparent text-petrol-400 placeholder:text-sage-400 text-sm outline-none font-body"
            placeholder={`Search for ${role === "agency" ? "an" : "a"} ${roleLabel(role).toLowerCase()} by name…`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="text-sage-400 text-lg leading-none">×</button>
          )}
        </div>

        {searching && (
          <p className="text-center text-sm text-sage-400 py-6">Searching…</p>
        )}

        {!searching && searchResults.length === 0 && searchQuery && (
          <div className="text-center py-10">
            <p className="text-sm text-sage-400">No {roleLabel(role).toLowerCase()}s found for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}

        {!searching && searchResults.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="#0E9E92" strokeWidth={1.8}/>
              <path d="M15.5 15.5L21 21" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
            </svg>
            <p className="font-heading font-semibold text-petrol-400 mb-1">Find {role === "agency" ? "an" : "a"} {roleLabel(role)}</p>
            <p className="text-xs text-sage-400">Search by name to find who you&apos;d like to review</p>
          </div>
        )}

        {searchResults.map((p) => {
          const score      = p.reputation_scores?.overall;
          const reviewCount = p.reputation_scores?.review_count ?? 0;
          return (
            <button
              key={p.id}
              onClick={() => selectReviewee(p)}
              className="card w-full flex items-center gap-3 mb-3 text-left active:scale-[0.98] transition-transform"
            >
              <Avatar name={p.full_name} avatarUrl={p.avatar_url} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-[15px] text-petrol-400 truncate">{p.full_name}</p>
                <p className="text-xs text-sage-400 capitalize mt-0.5">
                  {p.role} · {p.suburb ?? p.city ?? "South Africa"}
                </p>
                <p className="text-xs text-sage-400 mt-0.5">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="score-badge">
                  {score != null ? score.toFixed(1) : "–"}
                </div>
                <p className="text-[10px] text-sage-400 mt-1">/ 10</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 2 — Verify lease ────────────────────────────────────

  if (step === 2) return (
    <div className="screen">
      {header}
      <div className="px-4 pt-5 pb-24">
        <div className="card mb-4">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            <Avatar name={reviewee!.full_name} avatarUrl={reviewee!.avatar_url} size="md" />
            <div>
              <p className="font-heading font-semibold text-petrol-400">{reviewee!.full_name}</p>
              <p className="text-xs text-sage-400 capitalize">{reviewee!.role} · {reviewee!.suburb ?? reviewee!.city}</p>
            </div>
          </div>

          <label className="field-label">Property Address *</label>
          <input
            className="input mb-4"
            placeholder="e.g. 12 Oak Avenue, Melville"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="field-label">Lease Start *</label>
              <input type="date" className="input" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Lease End *</label>
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
              <button onClick={() => setLeaseFile(null)} className="text-sage-400 text-lg leading-none">×</button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3.5 rounded-xl border-2 border-dashed border-teal-400 bg-teal-50 text-teal-400 font-semibold text-sm flex items-center justify-center gap-2"
            >
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

          <p className="text-xs text-sage-400 mt-2">Your document is stored securely and only used for verification.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        {step2Ready
          ? <PrimaryBtn onClick={handleLeaseConfirm} loading={uploading}>Continue →</PrimaryBtn>
          : <DisabledBtn>Fill in all fields to continue</DisabledBtn>
        }
      </div>
    </div>
  );

  // ── Step 3 — Rate experience ─────────────────────────────────

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
              <StarRow
                value={ratings[key] ?? 0}
                onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))}
              />
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
                <button
                  key={v}
                  onClick={() => setRecommend((r) => r === v ? null : v)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors capitalize ${
                    recommend === v
                      ? v === "yes"   ? "bg-teal-400 text-white border-teal-400"
                      : v === "no"    ? "bg-red-400 text-white border-red-400"
                      :                 "bg-gold-400 text-petrol-400 border-gold-400"
                      : "bg-white text-sage-400 border-gray-100"
                  }`}
                >
                  {v === "yes" ? "👍 Yes" : v === "no" ? "👎 No" : "🤔 Maybe"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {allRated
          ? <PrimaryBtn onClick={() => setStep(4)}>Continue →</PrimaryBtn>
          : <DisabledBtn>Rate all categories to continue</DisabledBtn>
        }
      </div>
    </div>
  );

  // ── Step 4 — Write review ────────────────────────────────────

  return (
    <div className="screen">
      {header}
      <div className="px-4 pt-5 pb-24">

        {/* Rating summary */}
        <div className="card mb-4 flex items-center gap-4">
          <Avatar name={reviewee!.full_name} avatarUrl={reviewee!.avatar_url} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-sm text-petrol-400 truncate">{reviewee!.full_name}</p>
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
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              recommend === "yes"   ? "bg-teal-50 text-teal-400" :
              recommend === "no"    ? "bg-red-50 text-red-400" :
                                      "bg-gold-50 text-gold-600"
            }`}>
              {recommend === "yes" ? "Would rent again" : recommend === "no" ? "Would not rent again" : "Maybe"}
            </span>
          )}
        </div>

        <div className="card mb-4">
          <h2 className="font-heading font-semibold text-[15px] text-petrol-400 mb-1">Tell us about your experience</h2>
          <p className="text-xs text-sage-400 mb-3">Minimum {MIN_BODY} characters · Be honest and constructive</p>
          <textarea
            rows={8}
            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-body text-petrol-400 outline-none focus:border-teal-400 transition-colors resize-none"
            placeholder="Describe your overall experience. What made it positive or negative? How did they handle issues? Would you recommend them?"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${body.length >= MIN_BODY ? "text-teal-400" : "text-sage-400"}`}>
              {body.length < MIN_BODY
                ? `${MIN_BODY - body.length} more characters needed`
                : `✓ Minimum reached`}
            </span>
            <span className={`text-xs ${body.length > MAX_BODY * 0.9 ? "text-gold-500" : "text-sage-400"}`}>
              {body.length}/{MAX_BODY}
            </span>
          </div>
        </div>

        {/* Anonymous toggle */}
        <button
          onClick={() => setAnonymous((a) => !a)}
          className="card w-full flex items-center justify-between mb-4 text-left"
        >
          <div>
            <p className="font-heading font-semibold text-sm text-petrol-400">Post anonymously</p>
            <p className="text-xs text-sage-400 mt-0.5">Your name will be hidden from the review</p>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-1 ${
            anonymous ? "bg-teal-400" : "bg-gray-200"
          }`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
              anonymous ? "translate-x-5" : "translate-x-0"
            }`} />
          </div>
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {bodyOk
          ? <PrimaryBtn onClick={handleSubmit} loading={submitting}>Submit Review</PrimaryBtn>
          : <DisabledBtn>Write your review to submit</DisabledBtn>
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
