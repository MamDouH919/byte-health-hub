import { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";
import { Activity } from "lucide-react";

interface Props {
  patientId?: string;
  scores?: { sleep: number; steps: number; heartRate: number; calories: number; exercise: number };
}

// Deterministic per-patient default scores (out of 20 each → 100 total)
const seedScores = (id: string) => {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const pick = () => 8 + Math.round(rand() * 12); // 8–20
  return {
    sleep: pick(),
    steps: pick(),
    heartRate: pick(),
    calories: pick(),
    exercise: pick(),
  };
};

export const HealthRadar = ({ patientId = "default", scores }: Props) => {
  const s = useMemo(() => scores ?? seedScores(patientId), [patientId, scores]);
  const total = s.sleep + s.steps + s.heartRate + s.calories + s.exercise;

  const data = [
    { axis: "Sleep", value: s.sleep, fullMark: 20 },
    { axis: "Steps", value: s.steps, fullMark: 20 },
    { axis: "Heart", value: s.heartRate, fullMark: 20 },
    { axis: "Calories", value: s.calories, fullMark: 20 },
    { axis: "Exercise", value: s.exercise, fullMark: 20 },
  ];

  return (
    <section className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="text-muted-foreground shrink-0 mt-0.5">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-tight">Wellness profile</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Achievement across 5 pillars · hover any axis for points
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-semibold tabular-nums leading-none">{total}</div>
          <div className="text-[10.5px] text-muted-foreground mt-0.5">/ 100 total</div>
        </div>
      </div>

      <div className="mt-3 h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="78%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              cursor={{ stroke: "hsl(var(--border))" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
                padding: "6px 10px",
              }}
              formatter={(v: number, _n, item) => {
                const label = (item?.payload as { axis: string })?.axis ?? "";
                return [`${v} points`, label];
              }}
              labelFormatter={() => ""}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(var(--brand-blue))"
              fill="hsl(var(--brand-blue))"
              fillOpacity={0.18}
              strokeWidth={2}
              isAnimationActive
            />
          </RadarChart>
        </ResponsiveContainer>
        {/* Center total overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center -mt-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Score</div>
            <div className="text-base font-semibold tabular-nums">{total}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
