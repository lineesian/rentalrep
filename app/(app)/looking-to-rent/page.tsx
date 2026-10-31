"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { BottomNav } from "@/components/layout/BottomNav";

type Listing = {
  id:            string;
  tenant_id:     string;
  areas:         string[];
  budget_min:    number;
  budget_max:    number;
  move_in_from:  string;
  description:   string;
  active:        boolean;
  created_at:    string;
  tenant?: {
    id:         string;
    full_name:  string;
    avatar_url: string | null;
    suburb:     string | null;
    city:       string | null;
  } | null;
  score?: { overall: number; review_count: number } | null;
};

function formatBudget(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 1000 ? `R${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `R${n}`;
  return `${fmt(min)} – ${fmt(max)}/mo`;
}

export default function LookingToRentPage() {
  const [listings,    setListings]    = useState<Listing[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [myListing,   setMyListing]   = useState<Listing | null>(null);
  const [showForm,    setShowForm]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [areaInput,   setAreaInput]   = useState("");

  // Form fields
  const [areas,       setAreas]       = useState<string[]>([]);
  const [budgetMin,   setBudgetMin]   = useState("");
  const [budgetMax,   setBudgetMax]   = useState("");
  const [moveIn,      setMoveIn]      = useState("");
  const [description, setDescription] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/looking-to-rent")
      .then((r) => r.json())
      .then((data: Listing[]) => {
        const list = Array.isArray(data) ? data : [];
        setListings(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function addArea() {
    const trimmed = areaInput.trim();
    if (trimmed && !areas.includes(trimmed)) {
      setAreas((prev) => [...prev, trimmed]);
    }
    setAreaInput("");
  }

  function removeArea(area: string) {
    setAreas((prev) => prev.filter((a) => a !== area));
  }

  async function submitListing(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!areas.length) { setError("Add at least one area of interest."); return; }
    const min = parseInt(budgetMin);
    const max = parseInt(budgetMax);
    if (!min || !max || max < min) { setError("Enter a valid budget range."); return; }
    if (!moveIn) { setError("Select a move-in date."); return; }
    if (description.trim().length < 50) { setError("Description must be at least 50 characters."); return; }

    setSubmitting(true);
    const res = await fetch("/api/looking-to-rent", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        areas,
        budget_min:   min,
        budget_max:   max,
        move_in_from: moveIn,
        description:  description.trim(),
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    setMyListing(body);
    setListings((prev) => {
      const filtered = prev.filter((l) => l.tenant_id !== body.tenant_id);
      return [body, ...filtered];
    });
    setShowForm(false);
    setSubmitting(false);
  }

  async function removeListing() {
    await fetch("/api/looking-to-rent", { method: "DELETE" });
    setMyListing(null);
    setListings((prev) => prev.filter((l) => l.id !== myListing?.id));
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-24">
      {/* Header */}
      <div className="bg-petrol-400 px-5 pt-12 pb-5">
        <Link href="/search" className="text-mint-400 text-xl block mb-3" aria-label="Back">←</Link>
        <h1 className="font-heading font-bold text-2xl text-white">Looking to Rent</h1>
        <p className="text-xs text-mint-300 font-body mt-0.5">Verified tenants actively looking for their next home</p>
      </div>

      {/* Score gate explainer */}
      <div className="mx-4 mt-4 bg-[#07312C] rounded-2xl p-4">
        <p className="text-[#2FD4C0] text-xs font-semibold uppercase tracking-wide mb-1">Score-gated board</p>
        <p className="text-xs text-[#C8DDD9] leading-relaxed">
          Only tenants with a RentalRep score of 7.0 or higher can post here.
          Every listing is backed by verified reviews from past landlords.
        </p>
      </div>

      <div className="px-4 pt-4">

        {/* My listing controls */}
        {myListing ? (
          <div className="card mb-4 border-2 border-teal-400">
            <div className="flex items-start justify-between mb-1">
              <p className="text-xs font-bold text-teal-400 uppercase tracking-wide">Your listing</p>
              <button
                onClick={removeListing}
                className="text-xs text-sage-400 underline"
              >
                Remove
              </button>
            </div>
            <p className="text-sm font-semibold text-petrol-400 mb-0.5">
              {formatBudget(myListing.budget_min, myListing.budget_max)}
            </p>
            <p className="text-xs text-sage-400 mb-1">{myListing.areas.join(", ")}</p>
            <p className="text-xs text-sage-400 leading-relaxed">{myListing.description}</p>
          </div>
        ) : (
          <button
            onClick={() => { setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
            className="w-full bg-teal-400 text-white font-heading font-semibold rounded-2xl py-3.5 text-sm mb-4"
          >
            Post my listing
          </button>
        )}

        {/* Post form */}
        {showForm && (
          <div ref={formRef} className="card mb-4 space-y-4">
            <p className="font-heading font-semibold text-petrol-400 text-base">Your listing</p>

            {/* Areas */}
            <div>
              <label className="block text-xs font-medium text-sage-400 mb-1">Areas of interest</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {areas.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 bg-teal-50 text-teal-400 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  >
                    {a}
                    <button onClick={() => removeArea(a)} className="text-teal-300 text-base leading-none">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArea(); } }}
                  placeholder="e.g. Sandton, Claremont…"
                  className="flex-1 border border-[#D1DDD9] rounded-xl px-3 py-2 text-sm text-petrol-400 placeholder-sage-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="button"
                  onClick={addArea}
                  className="bg-petrol-400 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-sage-400 mb-1">Budget min (R/mo)</label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="8000"
                  className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2 text-sm text-petrol-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sage-400 mb-1">Budget max (R/mo)</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="15000"
                  className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2 text-sm text-petrol-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>

            {/* Move-in */}
            <div>
              <label className="block text-xs font-medium text-sage-400 mb-1">Available from</label>
              <input
                type="date"
                value={moveIn}
                onChange={(e) => setMoveIn(e.target.value)}
                className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2 text-sm text-petrol-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-sage-400 mb-1">
                About you <span className="text-[10px] text-sage-300">(50–500 chars)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="What kind of place you're looking for, your situation, pet-free, work-from-home, etc."
                className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2 text-sm text-petrol-400 placeholder-sage-300 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <p className="text-[10px] text-sage-300 text-right mt-0.5">{description.length}/500</p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-sage-400 font-heading font-semibold rounded-xl py-3 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitListing}
                disabled={submitting}
                className="flex-1 bg-teal-400 text-white font-heading font-semibold rounded-xl py-3 text-sm disabled:opacity-60"
              >
                {submitting ? "Posting…" : "Post listing"}
              </button>
            </div>
          </div>
        )}

        {/* Board */}
        {loading ? (
          <div className="text-center py-12 text-sage-400 text-sm font-body">Loading board…</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-heading font-semibold text-petrol-400 mb-1">Board is empty</p>
            <p className="text-xs text-sage-400">Be the first to post your listing.</p>
          </div>
        ) : (
          <>
            <p className="section-label mb-3">{listings.length} tenant{listings.length !== 1 ? "s" : ""} looking</p>
            {listings.map((l) => {
              const t       = l.tenant;
              const score   = (l.score as { overall?: number } | null)?.overall ?? 0;
              const reviews = (l.score as { review_count?: number } | null)?.review_count ?? 0;
              return (
                <div key={l.id} className="card mb-3">
                  {/* Tenant header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Link href={`/profile/${l.tenant_id}`}>
                      <Avatar
                        name={t?.full_name ?? "Tenant"}
                        avatarUrl={t?.avatar_url ?? null}
                        size="md"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${l.tenant_id}`}>
                        <p className="font-heading font-semibold text-[15px] text-petrol-400 truncate">
                          {t?.full_name ?? "Anonymous Tenant"}
                        </p>
                      </Link>
                      {(t?.suburb || t?.city) && (
                        <p className="text-xs text-sage-400">{[t?.suburb, t?.city].filter(Boolean).join(", ")}</p>
                      )}
                      {reviews > 0 && (
                        <p className="text-xs text-sage-400">{reviews} verified review{reviews !== 1 ? "s" : ""}</p>
                      )}
                    </div>
                    {score > 0 && (
                      <ScoreRing score={score} size={44} strokeWidth={4} />
                    )}
                  </div>

                  {/* Listing details */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-petrol-400 bg-[#EAF4F2] px-2.5 py-0.5 rounded-full">
                      {formatBudget(l.budget_min, l.budget_max)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-petrol-400 bg-[#EAF4F2] px-2.5 py-0.5 rounded-full">
                      From {new Date(l.move_in_from).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {l.areas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {l.areas.map((a) => (
                        <span key={a} className="text-[10px] bg-teal-50 text-teal-400 font-semibold px-2 py-0.5 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-sage-400 font-body leading-relaxed">{l.description}</p>

                  <Link
                    href={`/profile/${l.tenant_id}`}
                    className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-teal-400"
                  >
                    View full profile →
                  </Link>
                </div>
              );
            })}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
