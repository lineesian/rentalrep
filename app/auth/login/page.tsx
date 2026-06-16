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
    <div className="screen flex flex-col items-center justify-center px-6" style={{ background: "#F5F8F7" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Logo size={48} showTagline={false} />
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
            Welcome back
          </h1>
          <p className="font-body text-sm" style={{ color: "#5E7470" }}>
            Sign in to your RentalRep account
          </p>
        </div>

        {/* Method toggle */}
        <div
          className="flex rounded-full p-1 mb-7"
          style={{ background: "#E0EBEA" }}
        >
          {(["email", "phone"] as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className="flex-1 py-2 rounded-full text-sm font-semibold font-body transition-all"
              style={
                method === m
                  ? { background: "#0E9E92", color: "white" }
                  : { background: "transparent", color: "#5E7470" }
              }
            >
              {m === "email" ? "Email" : "Phone / OTP"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {method === "email" ? (
            <>
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
              <label className="field-label">South African mobile number</label>
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
              <p className="text-xs text-sage-400 mt-2 font-body">We&apos;ll send a one-time PIN via SMS.</p>
            </div>
          )}

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
            {loading ? "Please wait…" : method === "email" ? "Sign in" : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm font-body mt-8 mb-4" style={{ color: "#5E7470" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold" style={{ color: "#0E9E92" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
