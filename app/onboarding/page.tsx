"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";

type Step = 1 | 2 | 3 | 4;

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="white" strokeWidth={1.8}/>
    </svg>
  );
}

function CheckCircle() {
  return (
    <div className="w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-6">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#0E9E92" strokeWidth={2}/>
        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#0E9E92" strokeWidth={2.2}
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default function OnboardingPage() {
  const router   = useRouter();
  const supabase = createClient();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [step,      setStep]      = useState<Step>(1);
  const [userId,    setUserId]    = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");

  // Step 2 — photo
  const [avatarUrl,    setAvatarUrl]    = useState<string | null>(null);
  const [previewUrl,   setPreviewUrl]   = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState<string | null>(null);

  // Step 3 — profile fields
  const [idNumber,  setIdNumber]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [suburb,    setSuburb]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load current user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/auth/login"); return; }
      setUserId(user.id);
      const name = user.user_metadata?.full_name as string | undefined;
      setFirstName(name?.split(" ")[0] ?? "there");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Photo upload ──────────────────────────────────────────────

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadError(null);
    setUploading(true);

    // Local preview
    setPreviewUrl(URL.createObjectURL(file));

    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type, upsert: true });

    if (upErr) { setUploadError(upErr.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (dbErr) { setUploadError(dbErr.message); setUploading(false); return; }

    setAvatarUrl(publicUrl);
    setUploading(false);
  }

  // ── Save profile fields ───────────────────────────────────────

  async function handleSaveProfile() {
    setSaving(true);
    setSaveError(null);

    const updates: Record<string, string> = {};
    if (idNumber.trim())  updates.id_number = idNumber.trim();
    if (phone.trim())     updates.phone     = phone.trim();
    if (suburb.trim())    updates.suburb    = suburb.trim();

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
      if (error) { setSaveError(error.message); setSaving(false); return; }
    }

    setSaving(false);
    await markDone();
  }

  // ── Mark onboarding complete ──────────────────────────────────

  async function markDone() {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);
    setStep(4);
  }

  // ── Step renderers ────────────────────────────────────────────

  if (step === 1) return (
    <div className="screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center bg-petrol-400">
        <Logo size={56} showTagline={false} />
        <h1 className="font-heading font-bold text-2xl text-white mt-8 mb-3">
          Welcome to RentalRep, {firstName}!
        </h1>
        <p className="text-sm text-mint-300 font-body leading-relaxed mb-12 max-w-xs">
          Let&apos;s set up your profile so landlords and agencies can trust you.
        </p>
        <button
          onClick={() => setStep(2)}
          className="w-full max-w-xs py-4 rounded-xl font-heading font-bold text-base bg-teal-400 text-white"
        >
          Get Started
        </button>
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="screen flex flex-col">
      {/* Header */}
      <div className="bg-petrol-400 px-5 pt-14 pb-6 text-center">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setStep(1)}
            className="text-mint-400 text-xl" aria-label="Back"
          >←</button>
          <div className="flex-1 flex justify-center gap-1.5">
            {([1,2,3] as const).map((n) => (
              <div key={n} className={`h-1.5 rounded-full transition-all ${
                n === 1 ? "w-6 bg-teal-400" : "w-4 bg-white/20"
              }`} />
            ))}
          </div>
          <div className="w-6" />
        </div>
        <h1 className="font-heading font-bold text-xl text-white mb-1">Add a profile photo</h1>
        <p className="text-sm text-mint-300 font-body">Help others recognise and trust you</p>
      </div>

      <div className="flex-1 flex flex-col items-center px-8 pt-10 pb-10">
        {/* Avatar */}
        <button
          onClick={() => fileRef.current?.click()}
          className="relative mb-8"
          aria-label="Upload photo"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Your photo"
              className="w-32 h-32 rounded-full object-cover border-4 border-teal-400"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-petrol-400 border-4 border-teal-400/30 flex items-center justify-center">
              <Avatar name={firstName} size="lg" />
            </div>
          )}
          <div className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-teal-400 flex items-center justify-center shadow-md">
            <CameraIcon />
          </div>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handlePhotoSelect}
        />

        {uploadError && (
          <p className="text-red-500 text-xs mb-4 text-center">{uploadError}</p>
        )}

        <div className="w-full max-w-xs flex flex-col gap-3 mt-auto">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-3.5 rounded-xl font-heading font-bold text-sm bg-teal-400 text-white disabled:opacity-60"
          >
            {uploading ? "Uploading…" : avatarUrl ? "Change Photo" : "Upload Photo"}
          </button>
          <button
            onClick={() => setStep(3)}
            className="text-sm text-sage-400 font-body py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 3) return (
    <div className="screen flex flex-col">
      {/* Header */}
      <div className="bg-petrol-400 px-5 pt-14 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setStep(2)}
            className="text-mint-400 text-xl" aria-label="Back"
          >←</button>
          <div className="flex-1 flex justify-center gap-1.5">
            {([1,2,3] as const).map((n) => (
              <div key={n} className={`h-1.5 rounded-full transition-all ${
                n <= 2 ? "w-6 bg-teal-400" : "w-4 bg-white/20"
              }`} />
            ))}
          </div>
          <div className="w-6" />
        </div>
        <h1 className="font-heading font-bold text-xl text-white mb-1">Complete your profile</h1>
        <p className="text-sm text-mint-300 font-body">All fields are optional — fill in what you can</p>
      </div>

      <div className="flex-1 px-5 pt-6 pb-10">
        <div className="card mb-4 flex flex-col gap-4">

          <div>
            <label className="field-label">SA ID Number</label>
            <input
              className="input"
              placeholder="13-digit ID number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 13))}
              inputMode="numeric"
              maxLength={13}
            />
            <p className="text-[11px] text-sage-400 mt-1 font-body">Used to verify your identity</p>
          </div>

          <div>
            <label className="field-label">Phone Number</label>
            <input
              className="input"
              placeholder="e.g. 071 234 5678 or +27711234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="tel"
            />
            <p className="text-[11px] text-sage-400 mt-1 font-body">SA format — starting with 0 or +27</p>
          </div>

          <div>
            <label className="field-label">Current Suburb</label>
            <input
              className="input"
              placeholder="e.g. Sandton, Observatory, Bellville"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
            />
          </div>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {saveError}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-heading font-bold text-sm bg-teal-400 text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
          <button
            onClick={markDone}
            disabled={saving}
            className="text-sm text-sage-400 font-body py-2 text-center"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );

  // Step 4 — Done
  return (
    <div className="screen flex flex-col items-center justify-center px-8 text-center pb-10">
      <CheckCircle />
      <h1 className="font-heading font-bold text-2xl text-petrol-400 mb-3">
        You&apos;re all set, {firstName}!
      </h1>
      <p className="text-sm text-sage-400 font-body leading-relaxed mb-10 max-w-xs">
        Your RentalRep profile is live. Start building your rental reputation today.
      </p>
      <button
        onClick={() => router.push("/home")}
        className="w-full max-w-xs py-4 rounded-xl font-heading font-bold text-base bg-teal-400 text-white"
      >
        Go to my dashboard
      </button>
    </div>
  );
}
