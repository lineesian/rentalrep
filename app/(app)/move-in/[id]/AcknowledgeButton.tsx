"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcknowledgeButton({ reportId }: { reportId: string }) {
  const router  = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    await fetch(`/api/move-in-reports/${reportId}/acknowledge`, { method: "PATCH" });
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={handle}
      disabled={busy}
      className="text-xs font-semibold bg-[#0E9E92] text-white px-4 py-2 rounded-xl disabled:opacity-50"
    >
      {busy ? "Saving..." : "Acknowledge report"}
    </button>
  );
}
