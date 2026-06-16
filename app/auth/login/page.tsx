"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

type Method = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (method === "email") {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Check onboarding status
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", signInData.user.id)
        .maybeSingle();
      router.push(profile?.onboarding_completed ? "/home" : "/onboarding");
      router.refresh();
    } else {
      const formatted = phone.startsWith("+") ? phone : `+27${phone.replace(/^0/, "")}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(formatted)}`);
    }
  }

  return (
    <div className="screen flex flex-col">
      <div className="bg-petrol-400 px-5 pt-14 pb-10 flex flex-col items-center text-center">
        <Logo size={48} />
        <h1 className="font-heading font-bold text-2xl text-white mt-5 mb-1">Welcome back</h1>
        <p className="text-sm text-mint-300 font-body">Sign in to your RentalRep account</p>
      </div>

      <div className="px-5 pt-6 flex-1">
        {/* Method toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {(["email", "phone"] as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold font-body transition-all ${
                method === m
                  ? "bg-white text-petrol-400 shadow-sm"
                  : "text-sage-400"
              }`}
            >
              {m === "email" ? "Email" : "Phone / OTP"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {method === "email" ? (
            <>
              <div>
                <label className="text-xs font-semibold text-sage-400 uppercase tracking-wide block mb-1.5">
                  Email address
                </label>
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
                <label className="text-xs font-semibold text-sage-400 uppercase tracking-wide block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-semibold text-sage-400 uppercase tracking-wide block mb-1.5">
                South African mobile number
              </label>
              <div className="flex gap-2">
                <span className="input w-16 text-center text-sage-400 flex-shrink-0">+27</span>
                <input
                  type="tel"
                  className="input flex-1"
                  placeholder="071 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                />
              </div>
              <p className="text-xs text-sage-400 mt-2">We'll send a one-time PIN via SMS.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? "Please wait…" : method === "email" ? "Sign in" : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm text-sage-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-mint-400 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
