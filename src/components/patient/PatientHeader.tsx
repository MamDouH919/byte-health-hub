import { useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine,
} from "recharts";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TrendIndicator } from "@/components/brand/TrendIndicator";
import { Activity as ActivityIcon, Moon, Footprints, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react";
import { getPatientProfile, patients } from "@/lib/data";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS  = ["M", "T", "W", "T", "F", "S", "S"];

// Deterministic PRNG keyed by patient id so each patient's metrics are stable.
const seedRand = (seedStr: string) => {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

const buildActivitySeries = (seedStr: string, endValue: number, trendPct: number) => {
  const rand = seedRand(seedStr + "::activity");
  const months: string[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) months.push(MONTH_NAMES[new Date(now.getFullYear(), now.getMonth() - i, 1).getMonth()]);
  const startValue = Math.max(5, Math.round(endValue / (1 + trendPct / 100)));
  const data = months.map((month, i) => {
    const t = i / (months.length - 1);
    const base = startValue + (endValue - startValue) * t;
    const noise = (rand() - 0.5) * 12;
    return { month, value: Math.max(0, Math.min(100, Math.round(base + noise))) };
  });
  data[data.length - 1].value = endValue;
  return data;
};

// Sleep — last 7 nights of hours (target 7.5h)
const buildSleepSeries = (seedStr: string) => {
  const rand = seedRand(seedStr + "::sleep");
  return DAY_LABELS.map((d) => {
    const hrs = +(5.5 + rand() * 3).toFixed(1); // 5.5 – 8.5h
    return { day: d, hours: hrs };
  });
};

// Steps — last 7 days (goal 8000)
const buildStepsSeries = (seedStr: string) => {
  const rand = seedRand(seedStr + "::steps");
  return DAY_LABELS.map((d) => ({
    day: d,
    steps: Math.round(3000 + rand() * 9000),
  }));
};

// Exercise — last 7 days, intensity 0..3 (rest, light, moderate, hard)
const buildExerciseSeries = (seedStr: string) => {
  const rand = seedRand(seedStr + "::ex");
  return DAY_LABELS.map((d) => {
    const r = rand();
    const intensity = r < 0.25 ? 0 : r < 0.55 ? 1 : r < 0.85 ? 2 : 3;
    const minutes = intensity === 0 ? 0 : 15 + Math.round(rand() * 50);
    return { day: d, intensity, minutes };
  });
};

const intensityColor = ["hsl(var(--border))", "hsl(var(--muted-foreground)/0.6)", "hsl(var(--foreground)/0.7)", "hsl(var(--foreground))"];
const intensityLabel = ["Rest", "Light", "Moderate", "Hard"];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 6,
  fontSize: 10.5,
  padding: "3px 6px",
} as const;

/**
 * Compact patient identity chip used inside the sticky tab bar.
 * Hover reveals a 2x2 mini dashboard: activity, sleep, steps, exercise.
 */
export const PatientHeader = () => {
  const { id } = useParams();
  const profile = getPatientProfile(id);
  const row = patients.find((p) => p.id === id) ?? patients[0];
  const { meta } = profile;
  const initials = row.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  const activity = useMemo(() => buildActivitySeries(row.id, row.last14, row.trendPct), [row.id, row.last14, row.trendPct]);
  const sleep    = useMemo(() => buildSleepSeries(row.id), [row.id]);
  const steps    = useMemo(() => buildStepsSeries(row.id), [row.id]);
  const exercise = useMemo(() => buildExerciseSeries(row.id), [row.id]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 332, behavior: "smooth" });
  };

  const up = row.trendPct >= 0;
  const stroke = up ? "hsl(var(--trend-up))" : "hsl(var(--trend-down))";
  const sleepAvg = +(sleep.reduce((s, x) => s + x.hours, 0) / sleep.length).toFixed(1);
  const stepsAvg = Math.round(steps.reduce((s, x) => s + x.steps, 0) / steps.length);
  const exerciseDays = exercise.filter((d) => d.intensity > 0).length;
  const exerciseMin = exercise.reduce((s, x) => s + x.minutes, 0);

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <div
          className="inline-flex items-center gap-3.5 h-12 pl-2 pr-5 rounded-full bg-background/90 backdrop-blur border border-border shadow-sm hover:shadow-[var(--shadow-card)] transition-shadow animate-fade-in cursor-default"
          title={`${row.name} · ${meta.age}y (bio ${meta.bioAge}) · ${meta.gender} · ${row.company}`}
        >
          <div className="h-9 w-9 rounded-full bg-surface text-foreground flex items-center justify-center text-[12.5px] font-semibold border border-border shrink-0">
            {initials}
          </div>
          <div className="flex flex-col leading-tight min-w-0 pr-1">
            <span className="text-[13.5px] font-semibold truncate max-w-[200px]">{row.name}</span>
            <span className="text-[10.5px] text-muted-foreground truncate max-w-[260px] mt-0.5 inline-flex items-center gap-1.5">
              <span>{meta.age}y</span>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-1">
                <span className="opacity-70">bio</span>
                <span
                  className={
                    meta.bioAge < meta.age
                      ? "text-[hsl(var(--trend-up))] font-medium"
                      : meta.bioAge > meta.age
                      ? "text-[hsl(var(--trend-down))] font-medium"
                      : "text-foreground/70 font-medium"
                  }
                >
                  {meta.bioAge}
                </span>
              </span>
              <span className="opacity-40">·</span>
              <span>{meta.gender}</span>
              <span className="opacity-40">·</span>
              <span className="truncate">{row.company}</span>
            </span>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="start"
        className="w-[360px] p-3 animate-fade-in"
      >
        <div className="relative">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); scrollBy(-1); }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/95 border border-border shadow-sm inline-flex items-center justify-center text-foreground hover:bg-surface transition-colors"
            aria-label="Previous chart"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); scrollBy(1); }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/95 border border-border shadow-sm inline-flex items-center justify-center text-foreground hover:bg-surface transition-colors"
            aria-label="Next chart"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        <div
          ref={scrollRef}
          onWheel={(e) => {
            // Convert vertical wheel into horizontal scroll, prevent page scroll leak.
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 px-8 [scrollbar-width:thin] scroll-smooth overscroll-x-contain"
        >
          {/* ─── Activity (area trend) ───────────────────────────────── */}
          <div className="snap-center shrink-0 w-[320px] rounded-md border border-border/70 bg-background p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                <ActivityIcon className="h-3 w-3" /> Activity
              </span>
              <TrendIndicator pct={row.trendPct} />
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`hdr-act-${row.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip cursor={{ stroke: "hsl(var(--border))" }} contentStyle={tooltipStyle} formatter={(v: number) => [`${v} pts`, "Avg"]} labelFormatter={(l) => `${l}`} />
                  <Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={1.75} fill={`url(#hdr-act-${row.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground tabular-nums">{row.last14} pts now · 8-month trend</div>
          </div>

          {/* ─── Sleep (bars vs 7.5h target line) ─────────────────────── */}
          <div className="snap-center shrink-0 w-[320px] rounded-md border border-border/70 bg-background p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                <Moon className="h-3 w-3" /> Sleep
              </span>
              <span className="text-[10px] tabular-nums text-foreground font-medium">{sleepAvg}h avg</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleep} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted)/0.4)" }} contentStyle={tooltipStyle} formatter={(v: number) => [`${v}h`, "Sleep"]} />
                  <ReferenceLine y={7.5} stroke="hsl(var(--trend-up))" strokeDasharray="2 2" strokeWidth={1} />
                  <Bar dataKey="hours" radius={[3, 3, 0, 0]}>
                    {sleep.map((d, i) => (
                      <Cell key={i} fill={d.hours >= 7 ? "hsl(var(--foreground))" : d.hours >= 6 ? "hsl(var(--muted-foreground))" : "hsl(var(--destructive)/0.7)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground tabular-nums">target 7.5h · last 7 nights</div>
          </div>

          {/* ─── Steps (bars vs 8k goal) ──────────────────────────────── */}
          <div className="snap-center shrink-0 w-[320px] rounded-md border border-border/70 bg-background p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                <Footprints className="h-3 w-3" /> Steps
              </span>
              <span className="text-[10px] tabular-nums text-foreground font-medium">{(stepsAvg / 1000).toFixed(1)}k avg</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={steps} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis hide domain={[0, 12000]} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted)/0.4)" }} contentStyle={tooltipStyle} formatter={(v: number) => [v.toLocaleString(), "Steps"]} />
                  <ReferenceLine y={8000} stroke="hsl(var(--trend-up))" strokeDasharray="2 2" strokeWidth={1} />
                  <Bar dataKey="steps" radius={[3, 3, 0, 0]}>
                    {steps.map((d, i) => (
                      <Cell key={i} fill={d.steps >= 8000 ? "hsl(var(--trend-up))" : "hsl(var(--muted-foreground)/0.7)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground tabular-nums">goal 8k · last 7 days</div>
          </div>

          {/* ─── Exercise (dot grid: per-day intensity) ───────────────── */}
          <div className="snap-center shrink-0 w-[320px] rounded-md border border-border/70 bg-background p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                <Dumbbell className="h-3 w-3" /> Exercise
              </span>
              <span className="text-[10px] tabular-nums text-foreground font-medium">{exerciseDays}/7 active</span>
            </div>
            <div className="h-32 flex flex-col justify-center gap-2">
              <div className="flex items-end justify-between gap-1.5 flex-1">
                {exercise.map((e, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end gap-1"
                    title={`${DAY_LABELS[i]} — ${intensityLabel[e.intensity]}${e.minutes ? ` · ${e.minutes} min` : ""}`}
                  >
                    {[3, 2, 1].map((lvl) => (
                      <span
                        key={lvl}
                        className="h-3 w-full rounded-sm"
                        style={{
                          backgroundColor: e.intensity >= lvl ? intensityColor[lvl] : "hsl(var(--muted)/0.4)",
                        }}
                      />
                    ))}
                    <span className="text-[9px] text-muted-foreground tabular-nums mt-0.5">{e.minutes || ""}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground tabular-nums">
                {DAY_LABELS.map((d, i) => <span key={i} className="flex-1 text-center">{d}</span>)}
              </div>
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground tabular-nums">{exerciseMin} min total this week</div>
          </div>
        </div>
        </div>

        {/* Pagination dots */}
        <div className="mt-1 flex items-center justify-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          ))}
        </div>

        <div className="mt-2 px-1 text-[10px] text-muted-foreground flex items-center justify-between">
          <span>Last 7 days · synced from wearable</span>
          <span className="opacity-70">{row.company}</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
