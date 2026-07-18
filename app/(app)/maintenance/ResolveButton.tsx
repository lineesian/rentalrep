"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResolveButton({ id }: { id: string }) {
  const router  = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    await fetch(`/api/maintenance/${id}/resolve`, { method: "PATCH" });
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={handle}
      disabled={busy}
      className="text-xs font-semibold text-[#0E9E92] bg-[#E6F9F8] hover:bg-[#CCF3F0] px-3 py-1.5 rounded-xl disabled:opacity-50 transition-colors"
    >
      {busy ? "Saving..." : "Mark resolved"}
    </button>
  );
}
