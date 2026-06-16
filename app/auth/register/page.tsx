"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "tenant",   label: "Tenant",   desc: "I rent property" },
  { value: "landlord", label: "Landlord", desc: "I own & let property" },
  { value: "agency",   label: "Agency",   desc: "I'm an estate agent" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("tenant");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [suburb, setSuburb] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, suburb },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="screen overflow-y-auto flex flex-col items-center px-6 pt-14 pb-10" style={{ background: "#F5F8F7" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Logo size={48} showTagline={false} variant="light" />
          <p className="mt-3 text-[13px] font-body" style={{ color: "#5E7470" }}>
            Rate. Trust. Rent with Confidence.
          </p>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="font-heading font-bold mb-2"
            style={{ color: "#07312C", fontSize: 26, letterSpacing: "0.01em" }}
          >
            Create account
          </h1>
          <p className="font-body text-sm" style={{ color: "#5E7470" }}>
            Join South Africa&apos;s rental trust network
          </p>
        </div>

        {/* Role picker */}
        <p className="field-label mb-3">I am a…</p>
        <div className="grid grid-cols-3 gap-2 mb-7">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-center transition-all"
              style={
                role === r.value
                  ? { borderColor: "#0E9E92", background: "#E6F7F6", color: "#07312C" }
                  : { borderColor: "#E0EBEA", background: "white", color: "#5E7470" }
              }
            >
              <span className="font-heading font-bold text-xs">{r.label}</span>
              <span className="text-[10px] leading-tight" style={{ color: "#5E7470" }}>{r.desc}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="field-label">Full name</label>
            <input
              className="input"
              placeholder="Thabo Khumalo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="field-label">Suburb</label>
            <input
              className="input"
              placeholder="e.g. Sandton, Rosebank…"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-heading font-bold text-sm text-white mt-2 transition-opacity disabled:opacity-60"
            style={{ background: "#07312C" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs font-body mt-5" style={{ color: "#5E7470" }}>
          By signing up you agree to our{" "}
          <span className="font-semibold" style={{ color: "#0E9E92" }}>Terms of Service</span>{" "}
          and{" "}
          <span className="font-semibold" style={{ color: "#0E9E92" }}>Privacy Policy</span>.
        </p>

        <p className="text-center text-sm font-body mt-4 mb-2" style={{ color: "#5E7470" }}>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold" style={{ color: "#0E9E92" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
