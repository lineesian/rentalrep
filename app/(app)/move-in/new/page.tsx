"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COMMON_ROOMS = [
  "Living room", "Kitchen", "Main bedroom", "Bedroom 2", "Bedroom 3",
  "Main bathroom", "En-suite", "Garage", "Garden / yard", "Entrance / hallway",
];

type Photo = { room_label: string; photo_url: string; caption: string };

export default function NewMoveInReportPage() {
  const router  = useRouter();
  const [step,  setStep]    = useState<"details" | "photos" | "submitting">("details");
  const [error, setError]   = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  // Details step
  const [details, setDetails] = useState({
    property_address:     "",
    guest_landlord_name:  "",
    guest_landlord_email: "",
  });

  // Photos step
  const [photos, setPhotos]   = useState<Photo[]>([]);
  const [newPhoto, setNewPhoto] = useState<Photo>({ room_label: "", photo_url: "", caption: "" });
  const [addingPhoto, setAddingPhoto] = useState(false);

  function setDetail(k: string, v: string) {
    setDetails((d) => ({ ...d, [k]: v }));
  }

  function addPhoto() {
    if (!newPhoto.room_label || !newPhoto.photo_url) return;
    setPhotos((ps) => [...ps, { ...newPhoto }]);
    setNewPhoto({ room_label: "", photo_url: "", caption: "" });
    setAddingPhoto(false);
  }

  function removePhoto(i: number) {
    setPhotos((ps) => ps.filter((_, idx) => idx !== i));
  }

  async function createReport() {
    if (!details.property_address || !details.guest_landlord_name) {
      setError("Property address and landlord name are required.");
      return;
    }
    setStep("submitting");
    setError(null);

    const res = await fetch("/api/move-in-reports", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_address:     details.property_address,
        guest_landlord_name:  details.guest_landlord_name,
        guest_landlord_email: details.guest_landlord_email || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create report");
      setStep("details");
      return;
    }

    const { id } = await res.json();
    setReportId(id);

    // Upload all photos
    for (const photo of photos) {
      await fetch(`/api/move-in-reports/${id}/photos`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photo),
      });
    }

    router.push(`/move-in/${id}`);
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-20">
      <div className="bg-white border-b border-[#E6EFED] px-4 py-4 flex items-center gap-3">
        <Link href="/move-in" className="text-[#0E9E92] text-sm font-medium">← Back</Link>
        <h1 className="font-heading font-bold text-[#07312C] text-lg">Move-in report</h1>
      </div>

      {/* progress */}
      <div className="flex gap-0 px-4 pt-4">
        {["Details", "Photos", "Submit"].map((label, i) => {
          const active = (step === "details" && i === 0) || (step === "photos" && i === 1) || (step === "submitting" && i === 2);
          const done   = (step === "photos" && i === 0) || (step === "submitting" && i < 2);
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-1 rounded-full ${done ? "bg-[#0E9E92]" : active ? "bg-[#2FD4C0]" : "bg-[#E6EFED]"}`} />
              <span className={`text-xs ${active ? "text-[#0E9E92] font-semibold" : "text-[#A0B4AE]"}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── DETAILS STEP ── */}
        {step === "details" && (
          <>
            <div className="bg-white rounded-2xl p-4 space-y-4">
              <h2 className="font-heading font-semibold text-[#07312C] text-sm uppercase tracking-wide">Property</h2>

              <div>
                <label className="block text-xs font-medium text-[#5E7470] mb-1">Property address *</label>
                <input
                  required
                  value={details.property_address}
                  onChange={(e) => setDetail("property_address", e.target.value)}
                  placeholder="e.g. 12 Main Road, Sandton, 2196"
                  className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5E7470] mb-1">Landlord name *</label>
                <input
                  required
                  value={details.guest_landlord_name}
                  onChange={(e) => setDetail("guest_landlord_name", e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5E7470] mb-1">Landlord email (optional — for sharing)</label>
                <input
                  type="email"
                  value={details.guest_landlord_email}
                  onChange={(e) => setDetail("guest_landlord_email", e.target.value)}
                  placeholder="landlord@example.com"
                  className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={() => {
                if (!details.property_address || !details.guest_landlord_name) {
                  setError("Property address and landlord name are required.");
                  return;
                }
                setError(null);
                setStep("photos");
              }}
              className="w-full bg-[#0E9E92] text-white font-heading font-semibold rounded-2xl py-3.5 text-sm"
            >
              Next: add photos
            </button>
          </>
        )}

        {/* ── PHOTOS STEP ── */}
        {step === "photos" && (
          <>
            <div className="bg-white rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-[#07312C] text-sm uppercase tracking-wide">
                  Photos ({photos.length})
                </h2>
                <button
                  onClick={() => setAddingPhoto(true)}
                  className="text-xs font-semibold text-[#0E9E92]"
                >
                  + Add photo
                </button>
              </div>

              {photos.length === 0 && (
                <p className="text-xs text-[#A0B4AE] text-center py-4">
                  No photos yet. Add at least one room to document the condition at move-in.
                </p>
              )}

              {photos.map((p, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#F5F8F7] rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#07312C]">{p.room_label}</p>
                    <p className="text-xs text-[#A0B4AE] truncate">{p.photo_url}</p>
                    {p.caption && <p className="text-xs text-[#5E7470] mt-0.5 italic">{p.caption}</p>}
                  </div>
                  <button onClick={() => removePhoto(i)} className="text-xs text-red-400 font-semibold shrink-0">Remove</button>
                </div>
              ))}

              {addingPhoto && (
                <div className="border border-[#D1DDD9] rounded-xl p-3 space-y-2 bg-white">
                  <div>
                    <label className="block text-xs font-medium text-[#5E7470] mb-1">Room *</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {COMMON_ROOMS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setNewPhoto((p) => ({ ...p, room_label: r }))}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${newPhoto.room_label === r ? "bg-[#0E9E92] text-white border-[#0E9E92]" : "border-[#D1DDD9] text-[#5E7470]"}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <input
                      value={newPhoto.room_label}
                      onChange={(e) => setNewPhoto((p) => ({ ...p, room_label: e.target.value }))}
                      placeholder="Or type a custom room name"
                      className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2 text-xs text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5E7470] mb-1">Photo URL *</label>
                    <input
                      type="url"
                      value={newPhoto.photo_url}
                      onChange={(e) => setNewPhoto((p) => ({ ...p, photo_url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2 text-xs text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5E7470] mb-1">Caption (optional)</label>
                    <input
                      value={newPhoto.caption}
                      onChange={(e) => setNewPhoto((p) => ({ ...p, caption: e.target.value }))}
                      placeholder="e.g. Crack in wall above window"
                      className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2 text-xs text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addPhoto}
                      disabled={!newPhoto.room_label || !newPhoto.photo_url}
                      className="flex-1 bg-[#0E9E92] text-white text-xs font-semibold rounded-xl py-2 disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingPhoto(false)}
                      className="flex-1 border border-[#D1DDD9] text-[#5E7470] text-xs font-semibold rounded-xl py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setStep("details")}
                className="flex-1 border border-[#D1DDD9] text-[#5E7470] font-heading font-semibold rounded-2xl py-3.5 text-sm"
              >
                Back
              </button>
              <button
                onClick={createReport}
                disabled={photos.length === 0}
                className="flex-1 bg-[#07312C] text-white font-heading font-semibold rounded-2xl py-3.5 text-sm disabled:opacity-50"
              >
                Save report
              </button>
            </div>
            <p className="text-xs text-center text-[#A0B4AE]">
              Add at least one photo to continue.
            </p>
          </>
        )}

        {/* ── SUBMITTING ── */}
        {step === "submitting" && (
          <div className="bg-white rounded-2xl p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#0E9E92] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#07312C] font-heading font-semibold">Saving your report...</p>
          </div>
        )}
      </div>
    </div>
  );
}
