import type { Badge } from "@/lib/badges";

// on light backgrounds (profile page white area)
const LIGHT: Record<string, { bg: string; text: string; border: string }> = {
  teal:   { bg: "#E6F7F5", text: "#0E9E92", border: "#0E9E92" },
  gold:   { bg: "#FDF4E3", text: "#B8790A", border: "#F4B53F" },
  petrol: { bg: "#07312C", text: "#2FD4C0", border: "#07312C" },
};

// on dark (petrol-400) backgrounds (home dashboard card)
const DARK: Record<string, { bg: string; text: string; border: string }> = {
  teal:   { bg: "rgba(14,158,146,0.18)", text: "#2FD4C0", border: "#0E9E92" },
  gold:   { bg: "rgba(244,181,63,0.18)",  text: "#F4B53F", border: "#F4B53F" },
  petrol: { bg: "rgba(255,255,255,0.10)", text: "#2FD4C0", border: "rgba(255,255,255,0.20)" },
};

interface Props {
  badge: Badge;
  dark?: boolean;
}

export function BadgePill({ badge, dark = false }: Props) {
  const palette = dark ? DARK : LIGHT;
  const c = palette[badge.colour];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold font-body whitespace-nowrap border flex-shrink-0"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      <span aria-hidden="true">{badge.icon}</span>
      {badge.label}
    </span>
  );
}
