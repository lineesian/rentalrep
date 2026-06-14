"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, size = 90, strokeWidth = 8 }: ScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
      aria-label={`Score: ${score.toFixed(1)} out of 10`}
      role="img"
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8F5F4" strokeWidth={strokeWidth} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="#0E9E92" strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#F4B53F" strokeWidth={2} />
      <text
        x={cx} y={cy + 1}
        textAnchor="middle" dominantBaseline="middle"
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: `${cx}px ${cy}px`,
          fontFamily: "Outfit",
          fontWeight: 700,
          fontSize: size > 80 ? "18px" : "13px",
          fill: "#07312C",
        }}
      >
        {score.toFixed(1)}
      </text>
      <text
        x={cx} y={cy + 14}
        textAnchor="middle" dominantBaseline="middle"
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: `${cx}px ${cy}px`,
          fontFamily: "Plus Jakarta Sans",
          fontSize: "9px",
          fill: "#8aa5a2",
        }}
      >
        /10
      </text>
    </svg>
  );
}
