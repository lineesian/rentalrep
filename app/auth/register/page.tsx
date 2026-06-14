"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";

const ROLES: { value: UserRole; label: string; desc: string; icon: string }[] = [
  { value: "tenant",   label: "Tenant",   desc: "I rent property",       icon: "🏠" },
  { value: "landlord", label: "Landlord", desc: "I own & let property",  icon: "🔑" },
  { value: "agency",   label: "Agency",   desc: "I'm an estate agent",   icon: "🏢" },
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

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="screen flex flex-col">
      <div className="bg-petrol-400 px-5 pt-14 pb-8 flex flex-col items-center text-center">
        <Logo size={44} />
        <h1 className="font-heading font-bold text-2xl text-white mt-4 mb-1">Create account</h1>
        <p className="text-sm text-teal-300">Join South Africa&apos;s rental trust network</p>
      </div>

      <div className="px-5 pt-6">
        <p className="section-label mb-3">I am a…</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-center transition-all ${
                role === r.value
                  ? "border-teal-400 bg-teal-50 text-petrol-400"
                  : "border-gray-100 bg-white text-gray-400"
              }`}
            >
              <span className="text-2xl">{r.icon}</span>
              <span className="font-heading font-semibold text-xs">{r.label}</span>
              <span className="text-[10px] leading-tight text-gray-400">{r.desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Full name</label>
            <input className="input" placeholder="Thabo Khumalo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email address</label>
            <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Password</label>
            <input type="password" className="input" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Suburb</label>
            <input className="input" placeholder="e.g. Sandton, Rosebank…" value={suburb} onChange={(e) => setSuburb(e.target.value)} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4 mb-6">
          By signing up you agree to our{" "}
          <span className="text-teal-400 font-semibold">Terms of Service</span> and{" "}
          <span className="text-teal-400 font-semibold">Privacy Policy</span>.
        </p>

        <p className="text-center text-sm text-gray-400 mb-8">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-teal-400 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
