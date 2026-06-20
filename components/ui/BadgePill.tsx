import type { Badge } from "@/lib/badges";

// ── Colour palettes ───────────────────────────────────────────────────────────

// Light backgrounds (profile page)
const LIGHT = {
  standard: { bg: "#A8F0E0", text: "#0D2B2A", border: "#7ADEC8" },
  gold:     { bg: "#F5C842", text: "#0D2B2A", border: "#D4A500" },
};

// Dark (petrol-400) backgrounds (home dashboard card)
const DARK = {
  standard: { bg: "rgba(168,240,224,0.18)", text: "#A8F0E0", border: "rgba(168,240,224,0.35)" },
  gold:     { bg: "rgba(245,200,66,0.18)",  text: "#F5C842", border: "rgba(245,200,66,0.40)" },
};

interface Props {
  badge: Badge;
  dark?: boolean;
}

export function BadgePill({ badge, dark = false }: Props) {
  const c = (dark ? DARK : LIGHT)[badge.tier];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold font-body whitespace-nowrap border flex-shrink-0"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: badge.icon }}
      />
      {badge.name}
    </span>
  );
}
