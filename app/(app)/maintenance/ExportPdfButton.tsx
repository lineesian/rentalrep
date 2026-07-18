"use client";

import { useState } from "react";

export function ExportPdfButton() {
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    const res = await fetch("/api/maintenance/export");
    if (res.ok) {
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "maintenance-log.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
    setBusy(false);
  }

  return (
    <button
      onClick={handle}
      disabled={busy}
      className="text-xs font-semibold text-[#07312C] bg-white border border-[#D1DDD9] hover:border-[#0E9E92] px-3 py-2 rounded-xl disabled:opacity-50 transition-colors"
    >
      {busy ? "Exporting..." : "Export PDF"}
    </button>
  );
}
