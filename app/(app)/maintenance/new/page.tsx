"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  { value: "plumbing",    label: "Plumbing" },
  { value: "electrical",  label: "Electrical" },
  { value: "structural",  label: "Structural" },
  { value: "appliance",   label: "Appliance" },
  { value: "security",    label: "Security" },
  { value: "other",       label: "Other" },
];

export default function NewMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [form, setForm] = useState({
    category:             "plumbing",
    description:          "",
    photo_url:            "",
    guest_landlord_name:  "",
    guest_landlord_email: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/maintenance", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category:             form.category,
        description:          form.description,
        photo_url:            form.photo_url || undefined,
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

    router.push("/maintenance");
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-20">
      <div className="bg-white border-b border-[#E6EFED] px-4 py-4 flex items-center gap-3">
        <Link href="/maintenance" className="text-[#0E9E92] text-sm font-medium">
          ← Back
        </Link>
        <h1 className="font-heading font-bold text-[#07312C] text-lg">Log a request</h1>
      </div>

      <form onSubmit={submit} className="px-4 pt-6 space-y-4">
        <div className="bg-white rounded-2xl p-4 space-y-4">
          <h2 className="font-heading font-semibold text-[#07312C] text-sm uppercase tracking-wide">
            Request details
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#5E7470] mb-1">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set("category", c.value)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    form.category === c.value
                      ? "bg-[#0E9E92] text-white border-[#0E9E92]"
                      : "bg-white text-[#5E7470] border-[#D1DDD9] hover:border-[#0E9E92]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5E7470] mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the issue clearly, including location in the property..."
              className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5E7470] mb-1">Photo URL (optional)</label>
            <input
              type="url"
              value={form.photo_url}
              onChange={(e) => set("photo_url", e.target.value)}
              placeholder="https://..."
              className="w-full border border-[#D1DDD9] rounded-xl px-3 py-2.5 text-sm text-[#07312C] placeholder-[#A0B4AE] focus:outline-none focus:ring-2 focus:ring-[#0E9E92]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-4">
          <h2 className="font-heading font-semibold text-[#07312C] text-sm uppercase tracking-wide">
            Landlord details
          </h2>
          <p className="text-xs text-[#5E7470]">
            Your landlord does not need a RentalRep account to be tagged.
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
          {loading ? "Saving..." : "Log request"}
        </button>
      </form>
    </div>
  );
}
