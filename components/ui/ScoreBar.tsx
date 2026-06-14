interface ScoreBarProps {
  label: string;
  score: number;
  max?: number;
}

export function ScoreBar({ label, score, max = 10 }: ScoreBarProps) {
  const pct = (score / max) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <span className="font-heading font-bold text-xs text-teal-400">{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-teal-50 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
