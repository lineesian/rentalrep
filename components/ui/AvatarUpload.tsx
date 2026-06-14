"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AvatarUploadProps {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  /** "header" = white border + shadow on dark bg; "profile" = camera overlay on profile page */
  variant?: "header" | "profile";
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function AvatarUpload({ userId, name, avatarUrl, variant = "header" }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const displayUrl = preview ?? avatarUrl;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error("Avatar upload failed:", uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    setUploading(false);
    startTransition(() => router.refresh());
  }

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Upload profile photo"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={name}
            className="w-9 h-9 rounded-full object-cover"
            style={{ border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.35)" }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full bg-teal-50 text-teal-400 flex items-center justify-center font-heading font-semibold text-xs"
            style={{ border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.35)" }}
          >
            {initials(name)}
          </div>
        )}
        {uploading && (
          <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </button>
    );
  }

  // variant === "profile" — large avatar with camera overlay
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full"
      aria-label="Change profile photo"
    >
      {displayUrl ? (
        <img
          src={displayUrl}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-400 flex items-center justify-center font-heading font-semibold text-lg border border-teal-100">
          {initials(name)}
        </div>
      )}

      {/* Camera overlay */}
      <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-teal-400 border-2 border-petrol-400 flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth={2} strokeLinejoin="round"/>
          <circle cx="12" cy="13" r="4" stroke="white" strokeWidth={2}/>
        </svg>
      </span>

      {uploading && (
        <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </button>
  );
}
