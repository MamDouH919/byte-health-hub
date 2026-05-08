import { TrendingDown, TrendingUp } from "lucide-react";

export const TrendIndicator = ({ pct }: { pct: number }) => {
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const color = up ? "text-[hsl(var(--trend-up))]" : "text-[hsl(var(--trend-down))]";
  return (
    <div className={`inline-flex flex-col items-end ${color}`}>
      <Icon className="h-5 w-5" strokeWidth={2.4} />
      <span className="text-[11px] font-medium mt-0.5">
        {up ? "up" : "down"} {Math.abs(pct)}%
      </span>
    </div>
  );
};
