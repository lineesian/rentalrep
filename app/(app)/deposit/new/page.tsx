"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewDepositPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [form, setForm] = useState({
    property_address:     "",
    amount:               "",
    bank_name:            "",
    is_interest_bearing:  false,
    guest_landlord_name:  "",
    guest_landlord_email: "",
  });

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/deposits", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_address:     form.property_address,
        amount:               parseFloat(form.amount),
        bank_name:            form.bank_name || undefined,
        is_interest_bearing:  form.is_interest_bearing,
        guest_landlord_name:  form.guest_landlord_name || undefined,
        guest_landlord_email: form.guest_landlord_email || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/deposit");
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-20">
      {/* header */}
      <div className="bg-white border-b border-[#E6EFED] px-4 py-4 flex items-center gap-3">
        <Link href="/deposit" className="text-[#0E9E92] text-sm font-medium">
          ← Back
        </Link>
        <h1 className="font-heading font-bold text-[#07312C] text-lg">Log a deposit</h1>
      </div>

      <form onSubmit={submit} className="px-4 pt-6 space-y-4">

        <div className="bg-white rounded-2xl p-4 space-y-4">
          <h2 className="font-heading font-semibold text-[#07312C] text-sm uppercase tracking-wide">
            Property
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#5E7470] mb-1">Property address *</label>
            <input
              required
              value={form.property_address}
              onChange={(e) => set("property_address", e.target.value)}
              placeholder="e.g. 12 Main Road, Sandton, 2196"
              className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5E7470] mb-1">Deposit amount (ZAR) *</label>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="e.g. 12000"
              className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5E7470] mb-1">Bank name</label>
            <input
              value={form.bank_name}
              onChange={(e) => set("bank_name", e.target.value)}
              placeholder="e.g. FNB, Absa, Standard Bank"
              className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              role="checkbox"
              aria-checked={form.is_interest_bearing}
              onClick={() => set("is_interest_bearing", !form.is_interest_bearing)}
              className={`w-10 h-6 rounded-full transition-colors ${form.is_interest_bearing ? "bg-[#0E9E92]" : "bg-[#D1DDD9]"} relative`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_interest_bearing ? "translate-x-5" : "translate-x-1"}`}
              />
            </div>
            <span className="text-sm text-[#07312C]">Deposit is interest-bearing</span>
          </label>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-4">
          <h2 className="font-heading font-semibold text-[#07312C] text-sm uppercase tracking-wide">
            Landlord details
          </h2>
          <p className="text-xs text-[#5E7470]">
            Enter your landlord&apos;s details. This does not require them to have a RentalRep account.
          </p>

          <div>
            <label className="block text-xs font-medium text-[#5E7470] mb-1">Landlord name *</label>
            <input
              required
              value={form.guest_landlord_name}
              onChange={(e) => set("guest_landlord_name", e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5E7470] mb-1">Landlord email (optional)</label>
            <input
              type="email"
              value={form.guest_landlord_email}
              onChange={(e) => set("guest_landlord_email", e.target.value)}
              placeholder="landlord@example.com"
              className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0E9E92] text-white font-heading font-semibold rounded-2xl py-3.5 text-sm disabled:opacity-60"
        >
          {loading ? "Saving..." : "Log deposit"}
        </button>
      </form>
    </div>
  );
}
