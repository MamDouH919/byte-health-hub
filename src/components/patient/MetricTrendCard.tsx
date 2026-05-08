import { useMemo, useState } from "react";
import { ChevronDown, Info, TrendingDown, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceArea, ResponsiveContainer, CartesianGrid } from "recharts";
import { StatusPill, type StatusKind } from "@/components/brand/StatusPill";
import { RangeBar } from "@/components/brand/RangeBar";

export interface TrendPoint { date: string; value: number }

interface Props {
  name: string;
  display: string;
  unit?: string;
  status?: StatusKind;
  // Range info (optional — for blood-style markers)
  value?: number;
  min?: number;
  max?: number;
  scaleMin?: number;
  scaleMax?: number;
  range?: string;
  // History (most-recent last). If omitted, synthesised from value/prev.
  history?: TrendPoint[];
  prev?: number;
  currentDate?: string;
}

const monthsAgo = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const MetricTrendCard = ({
  name, display, unit, status, value, min, max, scaleMin, scaleMax, range,
  history, prev, currentDate,
}: Props) => {
  const [open, setOpen] = useState(false);

  const series = useMemo<TrendPoint[]>(() => {
    if (history && history.length) return history;
    if (typeof value !== "number") return [];
    if (typeof prev === "number") {
      // Synthesise a 4-point history with mild jitter between prev → value
      const span = value - prev;
      return [
        { date: monthsAgo(6), value: +(prev - span * 0.25).toFixed(2) },
        { date: monthsAgo(4), value: +prev.toFixed(2) },
        { date: monthsAgo(2), value: +(prev + span * 0.55).toFixed(2) },
        { date: currentDate ?? monthsAgo(0), value: +value.toFixed(2) },
      ];
    }
    return [{ date: currentDate ?? monthsAgo(0), value }];
  }, [history, value, prev, currentDate]);

  const delta = series.length > 1 ? series[series.length - 1].value - series[0].value : 0;
  const deltaPct = series.length > 1 && series[0].value !== 0 ? (delta / Math.abs(series[0].value)) * 100 : 0;
  const up = delta > 0;

  const yMin = useMemo(() => {
    const vals = series.map(s => s.value);
    if (typeof scaleMin === "number") return Math.min(scaleMin, ...vals);
    return Math.min(...vals) * 0.9;
  }, [series, scaleMin]);
  const yMax = useMemo(() => {
    const vals = series.map(s => s.value);
    if (typeof scaleMax === "number") return Math.max(scaleMax, ...vals);
    return Math.max(...vals) * 1.1;
  }, [series, scaleMax]);

  const singlePoint = series.length === 1;

  return (
    <article className="surface-card bg-background overflow-hidden hover:shadow-[var(--shadow-card)] transition-shadow">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full p-5 text-left"
      >
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            {name}
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            {status && <StatusPill status={status} />}
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </header>

        <div className="mt-3 flex items-baseline gap-2">
          <div className="text-3xl font-bold tracking-tight tabular-nums">{display}</div>
          {unit && <div className="text-xs text-muted-foreground">{unit}</div>}
          {series.length > 1 && (
            <span className={`ml-auto inline-flex items-center gap-0.5 text-[11px] font-medium ${up ? "text-[hsl(var(--trend-up))]" : "text-[hsl(var(--trend-down))]"}`}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(deltaPct).toFixed(1)}%
            </span>
          )}
        </div>

        {typeof value === "number" && typeof min === "number" && typeof max === "number" &&
         typeof scaleMin === "number" && typeof scaleMax === "number" && (
          <div className="mt-4">
            <RangeBar value={value} min={min} max={max} scaleMin={scaleMin} scaleMax={scaleMax} />
          </div>
        )}

        {range && (
          <div className="mt-3 text-[11px] text-muted-foreground">
            Optimal: <span className="font-semibold text-foreground">{range}{unit ? ` ${unit}` : ""}</span>
          </div>
        )}
      </button>

      {open && (
        <div className="border-t border-border px-5 py-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Trend over time
            </div>
            <div className="text-[11px] text-muted-foreground">
              {series.length} {series.length === 1 ? "test" : "tests"}
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  domain={[yMin, yMax]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  width={36}
                />
                {typeof min === "number" && typeof max === "number" && (
                  <ReferenceArea y1={min} y2={max} fill="hsl(var(--status-optimal-bg))" fillOpacity={0.6} />
                )}
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}${unit ? ` ${unit}` : ""}`, name]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={{ r: singlePoint ? 5 : 3, fill: "hsl(var(--foreground))" }}
                  activeDot={{ r: 5 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {singlePoint && (
            <div className="mt-2 text-[11px] text-muted-foreground text-center">
              Only one test on record — trend will appear after the next measurement.
            </div>
          )}
        </div>
      )}
    </article>
  );
};
