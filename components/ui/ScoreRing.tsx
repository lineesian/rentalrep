"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, size = 90, strokeWidth = 8 }: ScoreRingProps) {
  const r     = (size - strokeWidth) / 2;
  const circ  = 2 * Math.PI * r;
  const dash  = (Math.min(score, 10) / 10) * circ;
  const cx    = size / 2;
  const cy    = size / 2;
  const large = size > 80;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
      role="img"
      aria-label={`Score ${score.toFixed(1)} out of 10`}
    >
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E6F9F8" strokeWidth={strokeWidth} />
      {/* Progress — Trust Teal */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#0E9E92"
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
      {/* Inner accent ring — Sun Gold */}
      <circle cx={cx} cy={cy} r={r * 0.54} fill="none" stroke="#F4B53F" strokeWidth={1.5} />
      {/* Score value */}
      <text
        x={cx} y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: `${cx}px ${cy}px`,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 700,
          fontSize: large ? "18px" : "13px",
          fill: "#07312C",
        }}
      >
        {score > 0 ? score.toFixed(1) : "–"}
      </text>
      {score > 0 && (
        <text
          x={cx} y={cy + (large ? 14 : 10)}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: large ? "9px" : "7px",
            fill: "#5E7470",
          }}
        >
          /10
        </text>
      )}
    </svg>
  );
}
