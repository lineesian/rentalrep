"use client";

import { useState, useRef, useEffect, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { StarRow } from "@/components/ui/StarRow";
import { getReviewWindowStatus, formatDateZA } from "@/lib/reviewWindow";
import type { Profile, ProfileWithScore } from "@/lib/types";
import { FLAG_LABELS } from "@/lib/leaseCheck";

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

const TENANT_CATS: Cat[] = [
  { key: "payment_history",       label: "Rent Payment",       placeholder: "e.g. Did they pay on time, every time?" },
  { key: "property_care",         label: "Property Care",      placeholder: "e.g. Did they keep the property clean and in good condition?" },
  { key: "communication",         label: "Communication",      placeholder: "e.g. Were they responsive and easy to reach?" },
  { key: "compliance_with_lease", label: "Lease Compliance",   placeholder: "e.g. Did they follow the lease terms throughout?" },
  { key: "vacating_conduct",      label: "Move-out Condition", placeholder: "e.g. Did they leave the property clean and undamaged?" },
  { key: "neighbour_relations",   label: "Neighbour Relations",placeholder: "e.g. Were they considerate of neighbours?" },
];

const AGENCY_CATS: Cat[] = [
  { key: "communication",     label: "Communication",     placeholder: "e.g. Were they easy to reach?" },
  { key: "fairness",          label: "Responsiveness",    placeholder: "e.g. How quickly did they respond?" },
  { key: "professionalism",   label: "Professionalism",   placeholder: "e.g. Were they professional throughout?" },
  { key: "transparency",      label: "Transparency",      placeholder: "e.g. Were all fees disclosed upfront?" },
  { key: "value_for_money",   label: "Value for Money",   placeholder: "e.g. Were their fees reasonable?" },
  { key: "paperwork_quality", label: "Paperwork Quality", placeholder: "e.g. Were documents accurate and on time?" },
];

const AGENT_CATS: Cat[] = [
  { key: "professionalism",    label: "Professionalism",    placeholder: "e.g. Were they professional throughout?" },
  { key: "communication",      label: "Communication",       placeholder: "e.g. Were they easy to reach?" },
  { key: "transparency",       label: "Transparency",        placeholder: "e.g. Were all terms explained clearly?" },
  { key: "responsiveness",     label: "Responsiveness",      placeholder: "e.g. How quickly did they respond to queries?" },
  { key: "paperwork_quality",  label: "Paperwork Quality",  placeholder: "e.g. Were all documents accurate and timely?" },
  { key: "problem_resolution", label: "Problem Resolution", placeholder: "e.g. How well did they handle issues that arose?" },
];

const PROPERTY_CATS: Cat[] = [
  { key: "condition_on_movein", label: "Condition on Move-in",   placeholder: "e.g. Was the property clean and ready when you arrived?" },
  { key: "maintenance",         label: "Maintenance Quality",    placeholder: "e.g. Were repairs and maintenance handled promptly?" },
  { key: "safety_security",     label: "Safety & Security",      placeholder: "e.g. Did the property feel safe? Were locks and gates secure?" },
  { key: "noise_levels",        label: "Noise Levels",           placeholder: "e.g. How was the noise from neighbours or traffic?" },
  { key: "value_for_money",     label: "Value for Money",        placeholder: "e.g. Was the rent fair for what you got?" },
  { key: "location_amenities",  label: "Location & Amenities",  placeholder: "e.g. Were shops, transport and schools convenient?" },
];

const MIN_BODY = 100;
const MAX_BODY = 1000;

// ── Helpers ────────────────────────────────────────────────────

/**
 * Canonical key linking both sides of the same tenancy.
 * Sort the two user IDs so the key is identical regardless of who writes first.
 * NULL for property reviews — no counterpart exists.
 */
function computeTenancyKey(
  reviewerUid: string,
  revieweeUid: string | null,
  propertyAddress: string,
): string | null {
  if (!revieweeUid) return null;
  const [a, b] = [reviewerUid, revieweeUid].sort();
  return `${a}:${b}:${propertyAddress.trim().toLowerCase()}`;
}

function avgRating(r: Record<string, number>) {
  const v = Object.values(r).filter(Boolean);
  if (!v.length) return 0;
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}

function roleLabel(role: string) {
  if (role === "agency")   return "Agency";
  if (role === "agent")    return "Agent";
  if (role === "tenant")   return "Tenant";
  if (role === "property") return "Property";
  return "Landlord";
}

function article(role: string) { return ["agency", "agent"].includes(role) ? "an" : "a"; }

function wouldRentText(role: string, reviewerRole?: string) {
  if (role === "tenant")                                        return "Would you rent to this tenant again?";
  if (role === "agency")                                        return "Would you use this agency again?";
  if (role === "agent")                                         return "Would you use this agent again?";
  if (role === "property" && reviewerRole === "landlord")       return "Would you relist this property?";
  if (role === "property")                                      return "Would you live here again?";
  return "Would you rent from this landlord again?";
}

const LANDLORD_PROPERTY_CATS: Cat[] = [
  { key: "condition_on_listing", label: "Condition on Listing",  placeholder: "What condition was the property in when you listed it for rent?" },
  { key: "tenant_impact",        label: "Tenant Impact",         placeholder: "How did tenants affect the condition of the property over the tenancy?" },
  { key: "maintenance_required", label: "Maintenance Required",  placeholder: "How much ongoing maintenance did the property require during the tenancy?" },
  { key: "neighbourhood",        label: "Neighbourhood",         placeholder: "How would you rate the surrounding area — safety, noise, and amenities?" },
  { key: "value_for_listing",    label: "Value for Listing",     placeholder: "Was the rental price fair relative to the property condition and location?" },
  { key: "would_relist",         label: "Would Relist",          placeholder: "Would you list this property for rent again under the same terms?" },
];

const LANDLORD_AGENCY_CATS: Cat[] = [
  { key: "transparency",        label: "Transparency",        placeholder: "Was the agency upfront about fees, processes, and lease terms?" },
  { key: "communication",       label: "Communication",       placeholder: "How responsive and clear was the agency throughout?" },
  { key: "professionalism",     label: "Professionalism",     placeholder: "Did all staff conduct themselves professionally?" },
  { key: "fairness",            label: "Fairness",            placeholder: "Did the agency treat you and your tenant fairly when issues arose?" },
  { key: "problem_resolution",  label: "Problem Resolution",  placeholder: "When issues occurred, how effectively did the agency resolve them?" },
  { key: "mandate_performance", label: "Mandate Performance", placeholder: "Did the agency find quality tenants quickly and manage your property to a high standard?" },
];

const LANDLORD_AGENT_CATS: Cat[] = [
  { key: "responsiveness",     label: "Responsiveness",    placeholder: "How quickly did the agent respond to your calls, messages, and queries?" },
  { key: "knowledge",          label: "Knowledge",         placeholder: "Did the agent demonstrate strong knowledge of the property, area, and rental process?" },
  { key: "honesty",            label: "Honesty",           placeholder: "Was the agent truthful and transparent throughout?" },
  { key: "follow_through",     label: "Follow-through",    placeholder: "Did the agent do what they said they would do, and when they said they would?" },
  { key: "empathy_fairness",   label: "Empathy & Fairness",placeholder: "Did the agent treat you respectfully and advocate fairly on your behalf?" },
  { key: "mandate_performance",label: "Mandate Performance",placeholder: "Did the agent find quality tenants and manage the mandate to a high standard?" },
];

function catsForRole(role: string, reviewerRole: string): Cat[] {
  if (role === "property" && reviewerRole === "landlord") return LANDLORD_PROPERTY_CATS;
  if (role === "agency"   && reviewerRole === "landlord") return LANDLORD_AGENCY_CATS;
  if (role === "agent"    && reviewerRole === "landlord") return LANDLORD_AGENT_CATS;
  if (role === "agency")   return AGENCY_CATS;
  if (role === "agent")    return AGENT_CATS;
  if (role === "tenant")   return TENANT_CATS;
  if (role === "property") return PROPERTY_CATS;
  return LANDLORD_CATS;
}

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

function reviewBodyPlaceholder(role: string): string {
  if (role === "tenant")   return "Tell us about your experience with this tenant. How was their communication, payment reliability, and the condition they left the property in?";
  if (role === "property") return "Describe your experience living at this property. What made it stand out — positively or negatively?";
  if (role === "agency" || role === "agent") return "Tell us about your experience with this agency or agent. Were they professional, transparent, and helpful throughout the process?";
  return "Describe your overall experience. What made it positive or negative? How did they handle issues? Would you recommend them?";
}

function ReviewFlow() {
  const params        = useSearchParams();
  const router        = useRouter();
  const role          = params.get("role") ?? params.get("type") ?? "landlord"; // reviewee type
  const reviewerRole  = params.get("from") ?? "tenant";                          // who is writing
  const cats          = catsForRole(role, reviewerRole);
  const supabase = createClient();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);

  // Step 1 — lease details
  const [address,    setAddress]    = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd,   setLeaseEnd]   = useState("");
  const [leaseFile,  setLeaseFile]  = useState<File | null>(null);

  // Step 2 — who are you rating (not used for property reviews)
  const [searchMode,    setSearchMode]    = useState<"search" | "manual">("search");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState<ProfileWithScore[]>([]);
  const [searching,     startSearch]      = useTransition();
  const [reviewee,      setReviewee]      = useState<Profile | null>(null);
  const [guestName,     setGuestName]     = useState("");
  const [guestEmail,    setGuestEmail]    = useState("");

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
  const errorRef = useRef<HTMLDivElement>(null);

  // Clause warnings
  const [clauseFlags,     setClauseFlags]     = useState<{ flag_type: string; note: string; lease_check_flag_id?: string }[]>([]);
  const [importedChecked, setImportedChecked] = useState(false);

  // Auto-scroll to error whenever one is set so it can't be missed
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  // Derived
  const isProperty   = role === "property";
  const windowStatus = leaseEnd ? getReviewWindowStatus(leaseEnd) : null;
  const windowOpen   = windowStatus?.status === "open";
  const step1Ready   = !!address && !!leaseStart && !!leaseEnd && !!leaseFile && windowOpen;
  const step2Ready  = isProperty
    ? true  // address already confirmed from step 1
    : searchMode === "search"
      ? !!reviewee
      : guestName.trim().length > 1 && guestEmail.includes("@");
  const allRated    = cats.every((c) => ratings[c.key] >= 1);
  const avgStars    = avgRating(ratings);
  const bodyOk      = body.length >= MIN_BODY && body.length <= MAX_BODY;

  const revieweeName = isProperty ? address : (reviewee?.full_name ?? guestName);

  // ── Step 2 search ──────────────────────────────────────────

  function handleSearch(q: string) {
    setSearchQuery(q);
    setReviewee(null);
    if (!q.trim()) { setSearchResults([]); return; }
    startSearch(async () => {
      const searchRole = role;
      const safe = q.replace(/[%_]/g, "\\$&"); // escape ILIKE wildcards in user input
      const { data } = await supabase
        .from("profiles")
        .select("*, reputation_scores(*)")
        .eq("role", searchRole)
        .or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`)
        .limit(15);
      setSearchResults((data ?? []) as ProfileWithScore[]);
    });
  }

  // ── Clause flag helpers ────────────────────────────────────

  async function importFromLeaseCheck() {
    const res = await fetch("/api/lease-check/latest-flags");
    if (!res.ok) return;
    const { flags } = await res.json() as { flags: { id: string; flag_type: string; clause_excerpt: string }[] };
    setClauseFlags(flags.map((f) => ({ flag_type: f.flag_type, note: f.clause_excerpt.slice(0, 200), lease_check_flag_id: f.id })));
    setImportedChecked(true);
  }

  function toggleFlag(flag_type: string) {
    setClauseFlags((prev) =>
      prev.some((f) => f.flag_type === flag_type)
        ? prev.filter((f) => f.flag_type !== flag_type)
        : [...prev, { flag_type, note: "" }],
    );
  }

  // ── Final submit (step 4) — all DB writes happen here ─────

  async function handleSubmit() {
    if (!bodyOk) return;
    setSubmitting(true);
    setError(null);

    console.log("[submit] step 0 — starting submission, role:", role);

    // ── Auth check ──────────────────────────────────────────────
    let user: { id: string } | null = null;
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      user = u;
    } catch (e) {
      console.error("[submit] auth.getUser failed:", e);
      setError("Authentication error. Please sign in again.");
      setSubmitting(false);
      return;
    }
    if (!user) { router.push("/auth/login"); return; }
    console.log("[submit] step 0 — user:", user.id);

    // ── 0b. Server-side window validation ───────────────────────
    // Catches anyone who bypassed the UI check (e.g. direct API calls).
    try {
      console.log("[submit] step 0b — validating review window server-side");
      const gateRes = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lease_end: leaseEnd }),
      });
      if (!gateRes.ok) {
        const gateBody = await gateRes.json().catch(() => ({}));
        const msg = (gateBody as { message?: string }).message ?? "Review window is closed for this tenancy.";
        console.warn("[submit] step 0b — window check failed:", msg);
        setError(msg);
        setSubmitting(false);
        return;
      }
      console.log("[submit] step 0b — window check passed");
    } catch (e) {
      // Non-fatal: if the endpoint is unreachable, allow submission to proceed.
      // The client-side check already ran; this is a belt-and-suspenders guard.
      console.warn("[submit] step 0b — window check threw (skipping):", e);
    }

    // ── 1. Upload lease file to storage (non-fatal) ─────────────
    // If the storage bucket is unavailable, we continue without a document_url
    // so the rest of the review still saves.
    let filePath: string | null = null;
    try {
      const ext = leaseFile!.name.split(".").pop() ?? "pdf";
      filePath  = `${user.id}/${Date.now()}.${ext}`;
      console.log("[submit] step 1 — uploading to storage:", filePath);
      const { error: uploadErr } = await supabase.storage
        .from("leases")
        .upload(filePath, leaseFile!, { contentType: leaseFile!.type, upsert: false });
      if (uploadErr) {
        console.warn("[submit] step 1 — storage upload error (non-fatal):", uploadErr.message);
        filePath = null; // continue without document
      } else {
        console.log("[submit] step 1 — upload OK");
      }
    } catch (e) {
      console.warn("[submit] step 1 — storage upload threw (non-fatal):", e);
      filePath = null;
    }

    // ── 2. Property record (property reviews only) ──────────────
    let propertyId: string | null = null;
    if (isProperty) {
      try {
        const normalizedAddress = address.trim().toLowerCase();
        console.log("[submit] step 2 — upserting property:", normalizedAddress);
        const { data: existing } = await supabase
          .from("properties")
          .select("id")
          .eq("normalized_address", normalizedAddress)
          .maybeSingle();

        if (existing) {
          propertyId = (existing as { id: string }).id;
          console.log("[submit] step 2 — existing property:", propertyId);
        } else {
          const { data: newProp, error: propErr } = await supabase
            .from("properties")
            .insert({ address: address.trim(), normalized_address: normalizedAddress })
            .select("id")
            .single();
          if (propErr) {
            console.error("[submit] step 2 — property insert error:", propErr);
            setError(propErr.message);
            setSubmitting(false);
            return;
          }
          propertyId = (newProp as { id: string }).id;
          console.log("[submit] step 2 — new property:", propertyId);
        }
      } catch (e) {
        console.error("[submit] step 2 — property lookup threw:", e);
        setError("Failed to save property. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    // ── 3. Lease row ────────────────────────────────────────────
    console.log("[submit] step 3 — inserting lease");
    const isLandlordRole = role === "landlord";
    const leaseInsert = {
      landlord_id:      isLandlordRole ? (reviewee?.id ?? null) : (isProperty ? null : user.id),
      tenant_id:        isLandlordRole ? user.id : (reviewee?.id ?? user.id),
      property_address: address,
      start_date:       leaseStart,
      end_date:         leaseEnd || null,
      document_url:     filePath,
    };
    console.log("[submit] step 3 — lease payload:", leaseInsert);

    let leaseId: string | null = null;
    try {
      const { data: leaseRow, error: leaseErr } = await supabase
        .from("leases")
        .insert(leaseInsert as never)
        .select("id")
        .single();
      if (leaseErr) {
        console.error("[submit] step 3 — lease insert error:", leaseErr);
        setError(leaseErr.message);
        setSubmitting(false);
        return;
      }
      leaseId = (leaseRow as { id: string }).id;
      console.log("[submit] step 3 — lease OK:", leaseId);
    } catch (e) {
      console.error("[submit] step 3 — lease insert threw:", e);
      setError("Failed to save lease. Please try again.");
      setSubmitting(false);
      return;
    }

    // ── 4. Build and insert review ──────────────────────────────
    console.log("[submit] step 4 — building review payload");
    const noteLines = cats
      .filter((c) => catNotes[c.key]?.trim())
      .map((c) => `${c.label}: ${catNotes[c.key].trim()}`)
      .join("\n");
    const fullBody   = noteLines ? `${noteLines}\n\n${body}` : body;
    const overall    = Math.max(1, Math.min(5, avgStars || 1));
    const revieweeId = isProperty ? null : (reviewee?.id ?? null);
    const tenancyKey = computeTenancyKey(user.id, revieweeId, address);

    const payload: Record<string, unknown> = {
      reviewer_id:   user.id,
      reviewee_id:   revieweeId,
      property_id:   propertyId,
      lease_id:      leaseId,
      tenancy_key:   tenancyKey,
      reviewer_role: reviewerRole,
      reviewee_role: isProperty ? "property" : role,
      overall,
      body:          fullBody,
      anonymous,
      would_recommend: recommend,
      guest_name:    (!isProperty && !reviewee) ? guestName : null,
      guest_email:   (!isProperty && !reviewee) ? guestEmail : null,
    };
    cats.forEach(({ key }) => { if (ratings[key]) payload[key] = ratings[key]; });
    if (!payload.communication) payload.communication = overall;
    if (!payload.fairness)      payload.fairness      = overall;

    console.log("[submit] step 4 — review payload:", payload);

    let insertedId: string | null = null;
    try {
      const { data: insertedReview, error: reviewErr } = await supabase
        .from("reviews")
        .insert(payload as never)
        .select("id")
        .single();
      if (reviewErr) {
        console.error("[submit] step 4 — review insert error:", reviewErr);
        setError(reviewErr.message);
        setSubmitting(false);
        return;
      }
      insertedId = (insertedReview as { id: string }).id;
      console.log("[submit] step 4 — review OK:", insertedId);
    } catch (e) {
      console.error("[submit] step 4 — review insert threw:", e);
      setError("Failed to save review. Please try again.");
      setSubmitting(false);
      return;
    }

    // ── 4b. Tenancy verification (non-fatal) ────────────────────
    // Only meaningful when a registered user (not a guest) is on one side.
    if (insertedId && !isProperty && (reviewee?.full_name || guestName)) {
      try {
        console.log("[submit] step 4b — verifying tenancy");
        const vRes = await fetch("/api/verify-tenancy", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            revieweeName:    reviewee?.full_name ?? guestName,
            reviewerRole,
            propertyAddress: address,
            leaseStart,
            leaseEnd,
          }),
        });
        if (vRes.ok) {
          const { verified } = await vRes.json() as { verified: boolean };
          if (verified) {
            console.log("[submit] step 4b — tenancy verified, setting flag on review");
            await supabase
              .from("reviews")
              .update({ verified_tenancy: true } as never)
              .eq("id", insertedId);
          } else {
            console.log("[submit] step 4b — no matching lease record found");
          }
        }
      } catch (e) {
        console.warn("[submit] step 4b — verification threw (non-fatal):", e);
      }
    }

    // ── 4c. Clause warnings (non-fatal) ─────────────────────────
    if (insertedId && clauseFlags.length > 0) {
      try {
        console.log("[submit] step 4c — inserting clause flags:", clauseFlags.length);
        await supabase.from("review_clause_flags").insert(
          clauseFlags.map((f) => ({
            review_id:           insertedId,
            flag_type:           f.flag_type,
            note:                f.note || null,
            lease_check_flag_id: f.lease_check_flag_id ?? null,
          })) as never,
        );
      } catch (e) {
        console.warn("[submit] step 4c — clause flag insert threw (non-fatal):", e);
      }
    }

    // ── 5. Publish check (non-fatal) ────────────────────────────
    if (insertedId) {
      try {
        console.log("[submit] step 5 — calling check_and_publish_review");
        const { error: rpcErr } = await supabase.rpc("check_and_publish_review", {
          p_review_id: insertedId,
        });
        if (rpcErr) console.warn("[submit] step 5 — rpc error (non-fatal):", rpcErr.message);
        else        console.log("[submit] step 5 — rpc OK");
      } catch (e) {
        console.warn("[submit] step 5 — rpc threw (non-fatal):", e);
      }
    }

    // ── 6. Create notifications (non-fatal) ─────────────────────
    if (insertedId) {
      try {
        console.log("[submit] step 6 — creating notifications");
        const notifRes = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review_id: insertedId }),
        });
        if (!notifRes.ok) {
          const nb = await notifRes.json().catch(() => ({}));
          console.warn("[submit] step 6 — notification error (non-fatal):", nb);
        } else {
          console.log("[submit] step 6 — notifications created");
        }
      } catch (e) {
        console.warn("[submit] step 6 — notifications threw (non-fatal):", e);
      }
    }

    console.log("[submit] done — showing success screen");
    setDone(true);
  }

  // ── Success ────────────────────────────────────────────────

  if (done) {
    const isPerson = !isProperty && !!revieweeName;
    return (
      <div className="screen flex flex-col items-center justify-center px-6 text-center pb-10">
        <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-5">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="#0E9E92" strokeWidth={2}/>
            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#0E9E92" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="font-heading font-bold text-2xl text-petrol-400 mb-2">Review Submitted!</h2>

        {isPerson ? (
          <>
            <div className="bg-gold-50 border border-gold-300 rounded-2xl px-5 py-4 mb-6 text-left">
              <p className="font-heading font-semibold text-sm text-gold-700 mb-1">Waiting for mutual reveal</p>
              <p className="text-xs text-gold-700 font-body leading-relaxed">
                Your review is saved privately. When {revieweeName} submits their review of you, both reviews
                will be published simultaneously. If they don&apos;t submit within 90 days, yours will
                go live automatically.
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-sage-400 mb-6 leading-relaxed">
            {revieweeName
              ? `Your review has been published on the property page for ${revieweeName}.`
              : "Your review has been published."}
          </p>
        )}

        <button className="btn-primary w-full" onClick={() => router.push("/home")}>
          Back to Home
        </button>
      </div>
    );
  }

  // ── Shared header ──────────────────────────────────────────

  const header = (
    <div className="bg-petrol-400 px-5 pt-12 pb-5">
      <button onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.back()}
        className="text-mint-400 text-xl block mb-3" aria-label="Back">←</button>
      <h1 className="font-heading font-bold text-xl text-white mb-0.5">Write a Review</h1>
      <p className="text-sm text-mint-300">
        {revieweeName
          ? (isProperty ? `Property: ${revieweeName.slice(0, 35)}${revieweeName.length > 35 ? "…" : ""}` : `Reviewing: ${revieweeName}`)
          : `Reviewing: ${article(role)} ${roleLabel(role)}`}
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

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="field-label">Start Date *</label>
              <input type="date" className="input" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} />
            </div>
            <div>
              <label className="field-label">End Date *</label>
              <input type="date" className="input" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} />
            </div>
          </div>

          {/* ── Review window status ── */}
          {windowStatus && windowStatus.status === "too_early" && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl px-3 py-3 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="#F4B53F" strokeWidth={1.8}/>
                <path d="M12 8v4M12 16h.01" stroke="#F4B53F" strokeWidth={2} strokeLinecap="round"/>
              </svg>
              <p className="text-xs text-amber-700 font-body leading-relaxed">
                <span className="font-semibold">Review window not open yet.</span>{" "}
                You can submit your review from{" "}
                <span className="font-semibold">{formatDateZA(windowStatus.opensOn)}</span>,
                which is 14 days before the lease end date.
              </p>
            </div>
          )}

          {windowStatus && windowStatus.status === "expired" && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3 py-3 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth={1.8}/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth={1.8} strokeLinecap="round"/>
              </svg>
              <p className="text-xs text-red-700 font-body leading-relaxed">
                <span className="font-semibold">Review window closed.</span>{" "}
                Reviews must be submitted within 90 days of the lease end date.
                This window closed on{" "}
                <span className="font-semibold">{formatDateZA(windowStatus.closedOn)}</span>.
              </p>
            </div>
          )}

          {windowStatus && windowStatus.status === "open" && (
            <div className="inline-flex items-center gap-1.5 mb-4 text-xs font-semibold text-teal-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="#0E9E92" strokeWidth={1.8}/>
                <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Review window open
            </div>
          )}

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

        {step1Ready ? (
          <PrimaryBtn onClick={() => setStep(2)}>Continue →</PrimaryBtn>
        ) : windowStatus?.status === "too_early" ? (
          <GhostBtn>Review window opens {formatDateZA(windowStatus.opensOn)}</GhostBtn>
        ) : windowStatus?.status === "expired" ? (
          <GhostBtn>Review window closed</GhostBtn>
        ) : (
          <GhostBtn>Fill in all fields to continue</GhostBtn>
        )}
      </div>
    </div>
  );

  // ── Step 2 — Property confirmation (property reviews only) ─

  if (step === 2 && isProperty) return (
    <div className="screen">
      {header}
      <div className="px-4 pt-5 pb-24">
        <div className="card mb-4">
          <p className="font-heading font-semibold text-sm text-petrol-400 mb-4">Confirm property</p>
          <div className="flex items-start gap-3 bg-teal-50 border border-teal-400/30 rounded-xl px-4 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8}/>
              <circle cx="12" cy="9" r="2.5" stroke="#0E9E92" strokeWidth={1.5}/>
            </svg>
            <div>
              <p className="font-semibold text-sm text-petrol-400">{address}</p>
              <p className="text-xs text-sage-400 mt-0.5">Taken from your lease details</p>
            </div>
          </div>
          <p className="text-xs text-sage-400 mt-3 font-body leading-relaxed">
            Your review will be linked to this property address. Other tenants who lived here will also see this review.
          </p>
        </div>
        <PrimaryBtn onClick={() => setStep(3)}>Confirm & Continue →</PrimaryBtn>
      </div>
    </div>
  );

  // ── Step 2 — Who are you rating (person reviews) ───────────

  if (step === 2) return (
    <div className="screen">
      {header}
      <div className="px-4 pt-5 pb-24">

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

        {searchMode === "search" && (
          <>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="#5E7470" strokeWidth={1.8}/>
                <path d="M15.5 15.5L21 21" stroke="#5E7470" strokeWidth={1.8} strokeLinecap="round"/>
              </svg>
              <input
                className="flex-1 bg-transparent text-petrol-400 placeholder:text-sage-400 text-sm outline-none font-body"
                placeholder={`Search for ${article(role)} ${roleLabel(role).toLowerCase()} by name or email…`}
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
                <p className="text-xs text-sage-400">Search by name or email to find who you&apos;d like to review</p>
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
            <p className="text-sm font-semibold text-petrol-400 mb-3">{wouldRentText(role, reviewerRole)}</p>
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

        <div className="card mb-4 flex items-center gap-4">
          {isProperty ? (
            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#E6F9F8" stroke="#0E9E92" strokeWidth={1.8}/>
                <circle cx="12" cy="9" r="2.5" stroke="#0E9E92" strokeWidth={1.5}/>
              </svg>
            </div>
          ) : reviewee ? (
            <Avatar name={reviewee.full_name} avatarUrl={reviewee.avatar_url} size="sm" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-400 font-heading font-bold text-sm flex-shrink-0">
              {guestName.charAt(0).toUpperCase()}
            </div>
          )}
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
            placeholder={reviewBodyPlaceholder(role)}
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

        {(isProperty || role === "landlord") && (
          <div className="card mb-4">
            <p className="section-label mb-2">Warn future tenants about lease clauses</p>
            <p className="text-xs text-sage-400 font-body mb-3">
              Flag anything in the lease that surprised you — future tenants researching this{" "}
              {isProperty ? "property" : "landlord"} will see it alongside your review.
            </p>
            <button
              type="button"
              onClick={importFromLeaseCheck}
              className="text-xs font-semibold text-teal-400 mb-3 underline underline-offset-2"
            >
              {importedChecked ? "Re-import from Lease Check" : "Import from your Lease Check"}
            </button>
            <div className="flex flex-wrap gap-2 mb-3">
              {(Object.entries(FLAG_LABELS) as [string, string][]).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleFlag(key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    clauseFlags.some((f) => f.flag_type === key)
                      ? "bg-teal-400 text-white border-teal-400"
                      : "bg-white text-petrol-400 border-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {clauseFlags.map((f, i) => (
              <textarea
                key={f.flag_type}
                value={f.note}
                onChange={(e) => {
                  const next = [...clauseFlags];
                  next[i] = { ...next[i], note: e.target.value };
                  setClauseFlags(next);
                }}
                rows={2}
                placeholder={`What happened with "${FLAG_LABELS[f.flag_type as keyof typeof FLAG_LABELS] ?? f.flag_type}"?`}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-body mb-2 focus:outline-none focus:border-teal-400 transition-colors resize-none"
              />
            ))}
          </div>
        )}

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
          <div ref={errorRef} className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth={1.8}/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth={1.8} strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700 mb-0.5">Submission failed</p>
              <p className="text-xs text-red-600 font-body leading-relaxed">{error}</p>
            </div>
          </div>
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
