"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id:     string;
  action: string;
  label:  string;
  danger?: boolean;
}

export function UpdateDepositButton({ id, action, label, danger }: Props) {
  const router  = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    await fetch(`/api/deposits/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={handle}
      disabled={busy}
      className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-colors ${
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-[#E6F9F8] text-[#0E9E92] hover:bg-[#CCF3F0]"
      } disabled:opacity-50`}
    >
      {busy ? "Saving..." : label}
    </button>
  );
}
