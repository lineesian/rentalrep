"use client";

interface StarRowProps {
  value: number;
  max?: number;
  onChange?: (val: number) => void;
  size?: "sm" | "md";
}

export function StarRow({ value, max = 5, onChange, size = "md" }: StarRowProps) {
  const sz = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          className={`${sz} leading-none transition-transform active:scale-125 ${
            onChange ? "cursor-pointer" : "cursor-default"
          }`}
          style={{ color: value > i ? "#F4B53F" : "#E0EBEA" }}
          aria-label={`${i + 1} star${i !== 0 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
