"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifyOTPInner() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const supabase = createClient();

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/home");
    router.refresh();
  }

  useEffect(() => { refs.current[0]?.focus(); }, []);

  return (
    <div className="screen flex flex-col px-5 pt-14">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mx-auto mb-6">
        <span className="text-3xl">💬</span>
      </div>
      <h1 className="font-heading font-bold text-2xl text-petrol-400 text-center mb-2">Enter your OTP</h1>
      <p className="text-sm text-sage-400 text-center mb-8">
        We sent a 6-digit code to <strong className="text-petrol-400">{phone}</strong>
      </p>

      <div className="flex gap-3 justify-center mb-8">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-14 text-center text-xl font-heading font-bold text-petrol-400 border-2 border-gray-200 rounded-xl outline-none focus:border-teal-400 transition-colors bg-white"
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <button
        className="btn-primary"
        disabled={otp.join("").length < 6 || loading}
        onClick={handleVerify}
      >
        {loading ? "Verifying…" : "Verify & continue"}
      </button>

      <p className="text-center text-sm text-sage-400 mt-6">
        Didn&apos;t receive it?{" "}
        <button className="text-teal-400 font-semibold">Resend OTP</button>
      </p>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense>
      <VerifyOTPInner />
    </Suspense>
  );
}
