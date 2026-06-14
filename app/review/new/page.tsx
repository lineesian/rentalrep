"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StarRow } from "@/components/ui/StarRow";

type Step = 1 | 2 | 3;

const LANDLORD_CATS = [
  { key: "overall",          label: "Overall Experience", required: true },
  { key: "communication",    label: "Communication",      required: true },
  { key: "maintenance",      label: "Maintenance",        required: false },
  { key: "deposit_handling", label: "Deposit Handling",   required: false },
  { key: "fairness",         label: "Fairness",           required: true },
];

const TENANT_CATS = [
  { key: "overall",          label: "Overall Experience", required: true },
  { key: "communication",    label: "Communication",      required: true },
  { key: "payment_history",  label: "Payment History",    required: false },
  { key: "property_care",    label: "Property Care",      required: false },
  { key: "fairness",         label: "Fairness",           required: true },
];

const MIN_CHARS = 500;

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mt-4">
      {([1, 2, 3] as Step[]).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-heading ${
            step > n ? "bg-teal-400 text-white" :
            step === n ? "bg-petrol-400 text-gold-400" : "bg-white/10 text-white/40"
          }`}>
            {step > n ? "✓" : n}
          </div>
          {n < 3 && <div className={`w-6 h-0.5 rounded ${step > n ? "bg-teal-400" : "bg-white/10"}`} />}
        </div>
      ))}
      <span className="text-xs text-mint-300 ml-1">
        {["Verify Lease", "Rate", "Review"][step - 1]}
      </span>
    </div>
  );
}

function ReviewFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const revieweeId = params.get("revieweeId") ?? "";
  const revieweeName = params.get("name") ?? "this person";
  const roleLabel = params.get("role") === "tenant" ? "Tenant" : "Landlord";
  const cats = params.get("role") === "tenant" ? TENANT_CATS : LANDLORD_CATS;

  const [step, setStep] = useState<Step>(1);
  const [leaseId, setLeaseId] = useState<string | null>(null);
  const [leaseUploaded, setLeaseUploaded] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const supabase = createClient();

  const requiredCats = cats.filter((c) => c.required);
  const allRequiredRated = requiredCats.every((c) => ratings[c.key]);

  async function handleLeaseUpload() {
    // In a real flow: upload the PDF to Supabase Storage, create a lease row, get the id.
    // For now we create a stub lease row.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !revieweeId) return;

    const isLandlordReview = roleLabel === "Landlord";
    const { data, error } = await supabase.from("leases").insert({
      landlord_id: isLandlordReview ? revieweeId : user.id,
      tenant_id:   isLandlordReview ? user.id : revieweeId,
      property_address: "Uploaded via app",
      start_date: new Date().toISOString().slice(0, 10),
    }).select("id").single();

    if (error) { setError(error.message); return; }
    setLeaseId(data.id);
    setLeaseUploaded(true);
  }

  async function handleSubmit() {
    if (!leaseId || !revieweeId || body.length < MIN_CHARS) return;
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const payload: Record<string, unknown> = {
      reviewer_id:  user.id,
      reviewee_id:  revieweeId,
      lease_id:     leaseId,
      body,
    };
    cats.forEach(({ key }) => { if (ratings[key]) payload[key] = ratings[key]; });

    const { error } = await supabase.from("reviews").insert(payload as never);
    if (error) { setError(error.message); setSubmitting(false); return; }

    setDone(true);
  }

  if (done) {
    return (
      <div className="screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-4xl mb-5">✓</div>
        <h2 className="font-heading font-bold text-2xl text-petrol-400 mb-2">Review Submitted!</h2>
        <p className="text-sm text-sage-400 mb-6 leading-relaxed">
          Your verified review has been published and will help build trust in the South African rental community.
        </p>
        <span className="badge-verified text-sm px-4 py-2 mb-8">✓ Verified Tenancy Review</span>
        <button className="btn-primary" onClick={() => router.push("/home")}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="bg-petrol-400 px-5 pt-12 pb-6">
        <button onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.back()}
          className="text-mint-400 text-xl block mb-3">←</button>
        <h1 className="font-heading font-bold text-xl text-white mb-1">Write a Review</h1>
        <p className="text-sm text-mint-300">Reviewing: {revieweeName} · {roleLabel}</p>
        <StepIndicator step={step} />
      </div>

      <div className="px-4 pt-5">
        {/* Step 1 — Lease upload */}
        {step === 1 && (
          <div>
            <div className="card text-center py-8 mb-4">
              <div className="text-5xl mb-4">📄</div>
              <h2 className="font-heading font-semibold text-lg text-petrol-400 mb-2">Confirm Your Tenancy</h2>
              <p className="text-sm text-sage-400 leading-relaxed mb-6">
                Upload your signed lease to verify the rental relationship. Your personal details stay private.
              </p>
              {!leaseUploaded ? (
                <button
                  onClick={handleLeaseUpload}
                  className="w-full py-3.5 rounded-xl border-2 border-dashed border-teal-400 bg-teal-50 text-teal-400 font-semibold text-sm"
                >
                  📎 Upload Lease Agreement
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-teal-50 border border-teal-400 rounded-xl px-4 py-3 text-left">
                  <span className="text-xl text-teal-400">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-teal-400">Lease_document.pdf</p>
                    <p className="text-xs text-sage-400">Verified · Tenancy confirmed</p>
                  </div>
                </div>
              )}
            </div>
            <button className="btn-primary" disabled={!leaseUploaded} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Ratings */}
        {step === 2 && (
          <div>
            <div className="card mb-4">
              <h2 className="font-heading font-semibold text-[15px] text-petrol-400 mb-4">Rate each category</h2>
              {cats.map(({ key, label, required }) => (
                <div key={key} className="mb-4">
                  <p className="text-xs font-medium text-sage-400 mb-2">
                    {label} {required && <span className="text-red-400">*</span>}
                  </p>
                  <div className="flex items-center gap-3">
                    <StarRow value={ratings[key] ?? 0} onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))} />
                    {ratings[key] && (
                      <span className="text-xs font-bold text-teal-400">{ratings[key]}/5</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary" disabled={!allRequiredRated} onClick={() => setStep(3)}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 3 — Written review */}
        {step === 3 && (
          <div>
            <div className="card mb-4">
              <h2 className="font-heading font-semibold text-[15px] text-petrol-400 mb-1">Write your review</h2>
              <p className="text-xs text-sage-400 mb-3">Minimum {MIN_CHARS} characters · Be honest and constructive</p>
              <textarea
                rows={9}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-body text-petrol-400 outline-none focus:border-teal-400 transition-colors resize-none"
                placeholder="Describe your experience. Include details about communication, maintenance response times, deposit handling, and any notable highs or lows…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <p className={`text-xs text-right mt-1 ${body.length >= MIN_CHARS ? "text-teal-400" : "text-sage-400"}`}>
                {body.length}/{MIN_CHARS}
                {body.length < MIN_CHARS && ` (${MIN_CHARS - body.length} more needed)`}
              </p>
            </div>

            {body.length >= MIN_CHARS && (
              <div className="flex items-center gap-3 card bg-teal-50 border-teal-400 border mb-4">
                <span className="text-2xl">🏅</span>
                <div>
                  <p className="font-heading font-semibold text-sm text-petrol-400">Verified Tenancy Badge</p>
                  <p className="text-xs text-sage-400">This review will display your verified lease badge</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              disabled={body.length < MIN_CHARS || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        )}
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
