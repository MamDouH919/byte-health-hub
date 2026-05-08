import { cn } from "@/lib/utils";

interface Props {
  value: number;
  min: number;       // optimal low
  max: number;       // optimal high
  scaleMin: number;
  scaleMax: number;
  unit?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Inline diagnostic range bar — three zones (low / optimal / high) with a
 * marker showing where the patient's value sits.
 */
export const RangeBar = ({ value, min, max, scaleMin, scaleMax, unit, size = "md", className }: Props) => {
  const span = scaleMax - scaleMin;
  const pct = (n: number) => Math.max(0, Math.min(100, ((n - scaleMin) / span) * 100));

  const lowEnd = pct(min);
  const highStart = pct(max);
  const markerPct = pct(value);

  const inOptimal = value >= min && value <= max;
  const markerColor = inOptimal
    ? "bg-[hsl(var(--trend-up))]"
    : "bg-[hsl(var(--destructive))]";

  const h = size === "sm" ? "h-1" : "h-1.5";
  const markerSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  return (
    <div className={cn("w-full max-w-[260px]", className)}>
      <div className={cn("relative w-full rounded-full overflow-hidden bg-surface", h)}>
        {/* low zone */}
        <div
          className="absolute inset-y-0 left-0 bg-[hsl(var(--status-attention-bg)/0.45)]"
          style={{ width: `${lowEnd}%` }}
        />
        {/* optimal zone */}
        <div
          className="absolute inset-y-0 bg-[hsl(var(--status-optimal-bg)/0.55)]"
          style={{ left: `${lowEnd}%`, width: `${Math.max(0, highStart - lowEnd)}%` }}
        />
        {/* high zone */}
        <div
          className="absolute inset-y-0 right-0 bg-[hsl(var(--status-attention-bg)/0.45)]"
          style={{ width: `${100 - highStart}%` }}
        />
        {/* marker */}
        <div
          className={cn("absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full ring-2 ring-background transition-all duration-500", markerSize, markerColor)}
          style={{ left: `${markerPct}%` }}
          aria-label={`Value ${value}${unit ?? ""}`}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground/70 mt-1 tabular-nums">
        <span>{scaleMin}{unit ? ` ${unit}` : ""}</span>
        <span>{min}–{max}</span>
        <span>{scaleMax}{unit ? ` ${unit}` : ""}</span>
      </div>
    </div>
  );
};
