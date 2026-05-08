import { useMemo, useState, createContext, useContext } from "react";
import {
  Heart, Activity, Moon, Footprints, Gauge, Thermometer, Dumbbell, Droplets,
  TrendingUp, ChevronDown, Filter,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, ReferenceLine,
  ComposedChart, Cell,
} from "recharts";
import type { WearableMetric } from "@/lib/data";

/** Filter context — lets every Card register its tone and self-hide when filtered out. */
type Tone = "good" | "warn" | "bad" | "info";
type StatusFilter = "all" | "Optimal" | "Normal" | "Needs attention";
type CatFilter = "all" | "Cardiac" | "Sleep" | "Activity" | "Fitness & Vitals";
const FilterCtx = createContext<StatusFilter>("all");
const CatCtx = createContext<CatFilter>("all");

/* ──────────────────────────────────────────────────────────────────────────
 * Deterministic synthetic generators — daily series for the last N days
 * Builds on patient-seeded values so each patient gets stable, distinct data.
 * ────────────────────────────────────────────────────────────────────────── */
const seedFrom = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h || 1;
};
const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};
const dayLabels = (n: number) => {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push(`${d.getDate()}/${d.getMonth() + 1}`);
  }
  return out;
};
const buildDaily = (
  seed: string, target: number, jitter: number, days = 30, drift = 0,
) => {
  const r = rng(seedFrom(seed));
  const labels = dayLabels(days);
  return labels.map((day, i) => {
    const t = i / Math.max(1, labels.length - 1);
    const base = target * (1 - drift / 2 + drift * t);
    const v = base + (r() - 0.5) * 2 * jitter;
    return { day, value: +v.toFixed(1) };
  });
};

/* ──────────────────────────────────────────────────────────────────────────
 * Shared shell — collapsible card
 * ────────────────────────────────────────────────────────────────────────── */
const Card = ({
  icon: Icon, title, eyebrow, value, unit, status, children, defaultOpen = false,
}: {
  icon: any; title: string; eyebrow?: string;
  value?: string; unit?: string;
  status?: { label: string; tone: Tone };
  children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const filter = useContext(FilterCtx);
  // Map tone → status label for filter matching
  const toneToStatus: Record<Tone, StatusFilter> = {
    good: "Optimal",
    info: "Normal",
    warn: "Needs attention",
    bad: "Needs attention",
  };
  if (filter !== "all" && status && toneToStatus[status.tone] !== filter) {
    return null;
  }
  const toneCls = {
    good: "bg-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))]",
    warn: "bg-[hsl(var(--status-attention-bg))] text-[hsl(var(--status-attention-fg))]",
    bad:  "bg-[hsl(var(--status-critical-bg))] text-[hsl(var(--status-critical-fg))]",
    info: "bg-[hsl(var(--status-neutral-bg))] text-[hsl(var(--status-neutral-fg))]",
  } as const;
  return (
    <article className="surface-card bg-background overflow-hidden transition-shadow hover:shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full p-4 text-left flex items-start gap-3"
      >
        <div className="h-9 w-9 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {eyebrow}
            </div>
          )}
          <div className="text-sm font-semibold leading-tight mt-0.5">{title}</div>
          {value && (
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums tracking-tight">{value}</span>
              {unit && <span className="text-[11px] text-muted-foreground">{unit}</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {status && (
            <span className={`pill ${toneCls[status.tone]} px-2 py-0.5 text-[11px] font-semibold`}>
              {status.label}
            </span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-4 bg-background animate-fade-in">
          {children}
        </div>
      )}
    </article>
  );
};

const axisProps = {
  tick: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
  tickLine: false,
  axisLine: false,
} as const;
const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
} as const;

/* ──────────────────────────────────────────────────────────────────────────
 * 1. Resting heart rate — line + target band
 * ────────────────────────────────────────────────────────────────────────── */
const RhrChart = ({ seed, current }: { seed: string; current: number }) => {
  const data = useMemo(() => buildDaily(seed + "rhr-d", current, 4, 30, -0.05), [seed, current]);
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" {...axisProps} interval={4} />
          <YAxis {...axisProps} width={28} domain={[40, 80]} />
          <ReferenceArea y1={50} y2={65} fill="hsl(var(--status-optimal-fg))" fillOpacity={0.06} />
          <ReferenceLine y={60} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: "target 60", fontSize: 9, fill: "hsl(var(--muted-foreground))", position: "right" }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} bpm`, "RHR"]} />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--foreground))" strokeWidth={1.75} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 2. Exercise heart rate — single workout zones + zone summary bar
 * ────────────────────────────────────────────────────────────────────────── */
const ExerciseHrChart = ({ seed }: { seed: string }) => {
  const r = rng(seedFrom(seed + "ex-hr"));
  const data = useMemo(() => {
    const out: { t: number; hr: number }[] = [];
    let hr = 95;
    for (let t = 0; t <= 60; t++) {
      // Warmup → climb → intervals → cool down
      const target =
        t < 8 ? 95 + t * 4 :
        t < 25 ? 130 + (r() - 0.5) * 10 :
        t < 45 ? (t % 4 < 2 ? 165 + (r() - 0.5) * 6 : 145 + (r() - 0.5) * 6) :
        160 - (t - 45) * 4;
      hr = +(hr * 0.55 + target * 0.45).toFixed(0);
      out.push({ t, hr });
    }
    return out;
  }, [seed]);

  // Time spent in each zone (from data)
  const zones = useMemo(() => {
    const z = [
      { name: "Z1", lo: 0,   hi: 114, color: "hsl(var(--muted-foreground))" },
      { name: "Z2", lo: 114, hi: 133, color: "hsl(var(--brand-blue))" },
      { name: "Z3", lo: 133, hi: 152, color: "hsl(var(--status-optimal-fg))" },
      { name: "Z4", lo: 152, hi: 171, color: "hsl(var(--status-attention-fg))" },
      { name: "Z5", lo: 171, hi: 999, color: "hsl(var(--status-critical-fg))" },
    ];
    return z.map(zone => ({
      ...zone,
      mins: data.filter(d => d.hr >= zone.lo && d.hr < zone.hi).length,
    }));
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="h-36 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="t" {...axisProps} label={{ value: "min", fontSize: 9, fill: "hsl(var(--muted-foreground))", position: "insideBottomRight", offset: -2 }} />
            <YAxis {...axisProps} width={28} domain={[80, 190]} />
            {zones.map(z => (
              <ReferenceArea key={z.name} y1={z.lo} y2={Math.min(z.hi, 190)} fill={z.color} fillOpacity={0.06} />
            ))}
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} bpm`, "HR"]} labelFormatter={(t) => `t=${t} min`} />
            <Line type="monotone" dataKey="hr" stroke="hsl(var(--foreground))" strokeWidth={1.75} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
          Time in zones
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer>
            <BarChart data={zones} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" {...axisProps} />
              <YAxis type="category" dataKey="name" {...axisProps} width={28} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} min`, "in zone"]} />
              <Bar dataKey="mins" radius={[0, 4, 4, 0]}>
                {zones.map((z, i) => <Cell key={i} fill={z.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 3. HRV — line with rolling avg + baseline band
 * ────────────────────────────────────────────────────────────────────────── */
const HrvChart = ({ seed, current }: { seed: string; current: number }) => {
  const data = useMemo(() => {
    const raw = buildDaily(seed + "hrv-d", current, 8, 30, 0.1);
    return raw.map((d, i, arr) => {
      const lo = Math.max(0, i - 6);
      const win = arr.slice(lo, i + 1);
      const avg = win.reduce((s, x) => s + x.value, 0) / win.length;
      return { ...d, avg: +avg.toFixed(1) };
    });
  }, [seed, current]);
  const baseLo = Math.round(current * 0.85);
  const baseHi = Math.round(current * 1.15);
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" {...axisProps} interval={4} />
          <YAxis {...axisProps} width={28} />
          <ReferenceArea y1={baseLo} y2={baseHi} fill="hsl(var(--brand-blue))" fillOpacity={0.06} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v} ms`, n === "avg" ? "7-day avg" : "HRV"]} />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--brand-blue))" strokeWidth={1.25} dot={false} strokeOpacity={0.6} />
          <Line type="monotone" dataKey="avg" stroke="hsl(var(--foreground))" strokeWidth={1.75} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 4. Total sleep — bar chart with target line
 * ────────────────────────────────────────────────────────────────────────── */
const SleepDurationChart = ({ seed }: { seed: string }) => {
  const data = useMemo(() => {
    const r = rng(seedFrom(seed + "sd"));
    return dayLabels(14).map(day => ({ day, hours: +(6.5 + r() * 2.4).toFixed(1) }));
  }, [seed]);
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" {...axisProps} />
          <YAxis {...axisProps} width={28} domain={[0, 10]} />
          <ReferenceLine y={7.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: "7.5h", fontSize: 9, fill: "hsl(var(--muted-foreground))", position: "right" }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} h`, "Sleep"]} />
          <Bar dataKey="hours" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.hours >= 7 ? "hsl(var(--foreground))" : d.hours >= 6 ? "hsl(var(--muted-foreground))" : "hsl(var(--status-attention-fg))"} fillOpacity={d.hours >= 7 ? 0.85 : 0.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 5. Sleep stages — stacked bar per night + efficiency gauge
 * ────────────────────────────────────────────────────────────────────────── */
const SleepStagesChart = ({ seed }: { seed: string }) => {
  const data = useMemo(() => {
    const r = rng(seedFrom(seed + "stg"));
    return dayLabels(7).map(day => {
      const deep = +(60 + r() * 30).toFixed(0);
      const rem = +(80 + r() * 35).toFixed(0);
      const light = +(180 + r() * 60).toFixed(0);
      const awake = +(15 + r() * 15).toFixed(0);
      const total = deep + rem + light + awake;
      const eff = Math.round(((total - awake) / total) * 100);
      return { day, deep, rem, light, awake, eff };
    });
  }, [seed]);
  const avgEff = Math.round(data.reduce((s, d) => s + d.eff, 0) / data.length);
  return (
    <div className="space-y-3">
      <div className="h-40 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" {...axisProps} />
            <YAxis {...axisProps} width={28} unit="m" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v} min`, n]} />
            <Bar dataKey="deep" stackId="s" fill="hsl(var(--foreground))" />
            <Bar dataKey="rem" stackId="s" fill="hsl(var(--brand-blue))" />
            <Bar dataKey="light" stackId="s" fill="hsl(var(--muted-foreground))" fillOpacity={0.45} />
            <Bar dataKey="awake" stackId="s" fill="hsl(var(--status-attention-fg))" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[hsl(var(--foreground))]" />Deep</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[hsl(var(--brand-blue))]" />REM</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[hsl(var(--muted-foreground))] opacity-50" />Light</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[hsl(var(--status-attention-fg))]" />Awake</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Efficiency</div>
          <div className="relative w-32 h-2 rounded-full bg-surface border border-border overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[hsl(var(--status-optimal-fg))]"
              style={{ width: `${avgEff}%` }}
            />
          </div>
          <span className="text-sm font-semibold tabular-nums">{avgEff}%</span>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 6. Daily steps — bar with goal line + weekly tile
 * ────────────────────────────────────────────────────────────────────────── */
const StepsChart = ({ seed, current }: { seed: string; current: number }) => {
  const data = useMemo(() => {
    const r = rng(seedFrom(seed + "stp-d"));
    return dayLabels(14).map(day => ({ day, steps: Math.round(current * (0.6 + r() * 0.8)) }));
  }, [seed, current]);
  const weekly = data.slice(-7).reduce((s, d) => s + d.steps, 0);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-border bg-surface px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">7-day total</div>
          <div className="text-lg font-bold tabular-nums">{weekly.toLocaleString()}</div>
        </div>
        <div className="text-[11px] text-muted-foreground">Goal · 8,000 steps/day</div>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" {...axisProps} interval={1} />
            <YAxis {...axisProps} width={36} />
            <ReferenceLine y={8000} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: "8k", fontSize: 9, fill: "hsl(var(--muted-foreground))", position: "right" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toLocaleString(), "steps"]} />
            <Bar dataKey="steps" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.steps >= 8000 ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"} fillOpacity={d.steps >= 8000 ? 0.85 : 0.45} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 7. Exercises per month — bar chart (one bar per day, length = minutes)
 * ────────────────────────────────────────────────────────────────────────── */
const ExercisesPerMonthChart = ({ seed }: { seed: string }) => {
  const data = useMemo(() => {
    const r = rng(seedFrom(seed + "expm"));
    return dayLabels(30).map((day) => {
      // ~55% chance of an exercise on a given day; minutes 15–75
      const did = r() > 0.45;
      const mins = did ? Math.round(15 + r() * 60) : 0;
      return { day, mins };
    });
  }, [seed]);
  const totalSessions = data.filter((d) => d.mins > 0).length;
  const totalMins = data.reduce((s, d) => s + d.mins, 0);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span><span className="font-semibold text-foreground tabular-nums">{totalSessions}</span> sessions · <span className="font-semibold text-foreground tabular-nums">{totalMins}</span> min total</span>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" {...axisProps} interval={3} />
            <YAxis {...axisProps} width={28} unit="m" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} min`, "Exercise"]} />
            <Bar dataKey="mins" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.mins > 0 ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"} fillOpacity={d.mins > 0 ? 0.85 : 0.2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 5b. Restorative sleep — Deep + REM minutes per night
 * ────────────────────────────────────────────────────────────────────────── */
const RestorativeSleepChart = ({ seed }: { seed: string }) => {
  const data = useMemo(() => {
    const r = rng(seedFrom(seed + "rest"));
    return dayLabels(14).map((day) => {
      const deep = +(60 + r() * 30).toFixed(0);
      const rem = +(80 + r() * 35).toFixed(0);
      return { day, deep, rem, total: deep + rem };
    });
  }, [seed]);
  const avg = Math.round(data.reduce((s, d) => s + d.total, 0) / data.length);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>Avg restorative · <span className="font-semibold text-foreground tabular-nums">{avg} min</span></span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[hsl(var(--foreground))]" />Deep</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[hsl(var(--brand-blue))]" />REM</span>
        </span>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" {...axisProps} interval={1} />
            <YAxis {...axisProps} width={28} unit="m" />
            <ReferenceLine y={120} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: "120m", fontSize: 9, fill: "hsl(var(--muted-foreground))", position: "right" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v} min`, n]} />
            <Bar dataKey="deep" stackId="r" fill="hsl(var(--foreground))" />
            <Bar dataKey="rem" stackId="r" fill="hsl(var(--brand-blue))" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


/* ──────────────────────────────────────────────────────────────────────────
 * 8. VO2 max — gauge + monthly line with category bands
 * ────────────────────────────────────────────────────────────────────────── */
const Vo2MaxChart = ({ seed, current }: { seed: string; current: number }) => {
  const data = useMemo(() => {
    const r = rng(seedFrom(seed + "vo2"));
    const months = ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];
    return months.map((m, i) => ({
      m, v: +(current - 3 + (i / (months.length - 1)) * 3 + (r() - 0.5)).toFixed(1),
    }));
  }, [seed, current]);
  // Gauge fraction within 25–60 ml/kg/min visualisation range
  const lo = 25, hi = 60;
  const pct = Math.max(0, Math.min(1, (current - lo) / (hi - lo)));
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          <span>Low</span><span>Average</span><span>High</span>
        </div>
        <div className="relative mt-2 h-3 rounded-full overflow-hidden bg-background">
          <div className="absolute inset-y-0" style={{ left: 0, width: "33%", background: "hsl(var(--status-critical-fg) / 0.5)" }} />
          <div className="absolute inset-y-0" style={{ left: "33%", width: "34%", background: "hsl(var(--status-attention-fg) / 0.5)" }} />
          <div className="absolute inset-y-0" style={{ left: "67%", width: "33%", background: "hsl(var(--status-optimal-fg) / 0.5)" }} />
          <div
            className="absolute -top-1 h-5 w-1 bg-foreground rounded-full"
            style={{ left: `calc(${pct * 100}% - 2px)` }}
            title={`${current} ml/kg/min`}
          />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums">{current}</span>
          <span className="text-[11px] text-muted-foreground">ml/kg/min</span>
        </div>
      </div>
      <div className="h-32 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="m" {...axisProps} />
            <YAxis {...axisProps} width={28} domain={[lo, hi]} />
            <ReferenceArea y1={lo} y2={37} fill="hsl(var(--status-critical-fg))" fillOpacity={0.04} />
            <ReferenceArea y1={37} y2={48} fill="hsl(var(--status-attention-fg))" fillOpacity={0.04} />
            <ReferenceArea y1={48} y2={hi} fill="hsl(var(--status-optimal-fg))" fillOpacity={0.04} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} ml/kg/min`, "VO₂ max"]} />
            <Line type="monotone" dataKey="v" stroke="hsl(var(--foreground))" strokeWidth={1.75} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 9. SpO2 — distribution histogram + nightly minimum line
 * ────────────────────────────────────────────────────────────────────────── */
const Spo2Chart = ({ seed }: { seed: string }) => {
  const nights = useMemo(() => {
    const r = rng(seedFrom(seed + "spo2"));
    return dayLabels(14).map(day => ({
      day,
      min: +(91 + r() * 5).toFixed(1),
      avg: +(95 + r() * 3).toFixed(1),
    }));
  }, [seed]);
  // Histogram buckets (90–100 by 1)
  const buckets = useMemo(() => {
    const b: Record<number, number> = {};
    for (let i = 90; i < 100; i++) b[i] = 0;
    nights.forEach(n => {
      const k = Math.max(90, Math.min(99, Math.floor(n.avg)));
      b[k] = (b[k] ?? 0) + 1;
    });
    return Object.entries(b).map(([k, c]) => ({ bucket: `${k}–${+k + 1}%`, count: c }));
  }, [nights]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Distribution (avg/night)</div>
        <div className="h-32 w-full">
          <ResponsiveContainer>
            <BarChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="bucket" {...axisProps} interval={0} angle={-30} textAnchor="end" height={36} />
              <YAxis {...axisProps} width={20} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} nights`, "Count"]} />
              <Bar dataKey="count" fill="hsl(var(--brand-blue))" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Nightly minimum SpO₂</div>
        <div className="h-32 w-full">
          <ResponsiveContainer>
            <LineChart data={nights} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" {...axisProps} interval={1} />
              <YAxis {...axisProps} width={28} domain={[88, 100]} />
              <ReferenceLine y={90} stroke="hsl(var(--status-critical-fg))" strokeDasharray="3 3" strokeOpacity={0.7} label={{ value: "<90%", fontSize: 9, fill: "hsl(var(--status-critical-fg))", position: "right" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Min SpO₂"]} />
              <Line type="monotone" dataKey="min" stroke="hsl(var(--foreground))" strokeWidth={1.75} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 10. Respiratory rate — line with baseline band + outlier markers
 * ────────────────────────────────────────────────────────────────────────── */
const RespRateChart = ({ seed }: { seed: string }) => {
  const data = useMemo(() => {
    const r = rng(seedFrom(seed + "rr"));
    return dayLabels(21).map(day => {
      const v = +(14 + (r() - 0.5) * 3 + (r() > 0.92 ? 4 : 0)).toFixed(1);
      return { day, value: v, outlier: v > 17 || v < 11 };
    });
  }, [seed]);
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" {...axisProps} interval={2} />
          <YAxis {...axisProps} width={24} domain={[8, 22]} />
          <ReferenceArea y1={12} y2={16} fill="hsl(var(--status-optimal-fg))" fillOpacity={0.06} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} brpm`, "Respiratory rate"]} />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--brand-blue))" strokeWidth={1.75}
            dot={(props: any) => {
              const isOut = data[props.index]?.outlier;
              return (
                <circle
                  key={props.index}
                  cx={props.cx} cy={props.cy} r={isOut ? 3.5 : 0}
                  fill={isOut ? "hsl(var(--status-attention-fg))" : "transparent"}
                />
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * 11. Skin/body temperature — deviation from baseline, centered at 0
 * ────────────────────────────────────────────────────────────────────────── */
const TempDeviationChart = ({ seed }: { seed: string }) => {
  const data = useMemo(() => {
    const r = rng(seedFrom(seed + "tmp"));
    return dayLabels(21).map(day => ({
      day, dev: +((r() - 0.5) * 1.6 + (r() > 0.9 ? 1.2 : 0)).toFixed(2),
    }));
  }, [seed]);
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tmpPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--status-attention-fg))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--status-attention-fg))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" {...axisProps} interval={2} />
          <YAxis {...axisProps} width={28} domain={[-2.5, 2.5]} unit="°" />
          <ReferenceArea y1={1} y2={2.5} fill="hsl(var(--status-critical-fg))" fillOpacity={0.05} label={{ value: "fever", fontSize: 9, fill: "hsl(var(--status-critical-fg))", position: "insideTopRight" }} />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.6} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v > 0 ? "+" : ""}${v} °C`, "Δ from baseline"]} />
          <Area type="monotone" dataKey="dev" stroke="hsl(var(--foreground))" strokeWidth={1.5} fill="url(#tmpPos)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * Wrapper — assembles the 11 clinician cards
 * Uses the existing wearableMetrics where possible to seed values.
 * ────────────────────────────────────────────────────────────────────────── */
export const WearableClinicalReport = ({ metrics }: { metrics: WearableMetric[] }) => {
  const findVal = (key: string, fallback: number) => {
    const m = metrics.find(x => x.key === key);
    return m?.value ?? fallback;
  };
  const seed = useMemo(
    () => metrics.map(m => `${m.key}:${m.value}`).join("|") || "default",
    [metrics],
  );
  const rhr = findVal("rhr", 54);
  const hrv = findVal("hrv", 48);
  const steps = findVal("steps", 8200);
  const vo2 = 45;
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [cat, setCat] = useState<CatFilter>("all");

  const filterOptions: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "Optimal", label: "Optimal" },
    { key: "Normal", label: "Normal" },
    { key: "Needs attention", label: "Needs attention" },
  ];
  const catOptions: CatFilter[] = ["all", "Cardiac", "Sleep", "Activity", "Fitness & Vitals"];

  const Section = ({ name, children }: { name: CatFilter; children: React.ReactNode }) => {
    if (cat !== "all" && cat !== name) return null;
    return (
      <section className="space-y-3">
        <h5 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{name}</h5>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</div>
      </section>
    );
  };

  return (
    <FilterCtx.Provider value={filter}>
    <CatCtx.Provider value={cat}>
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h4 className="text-sm font-semibold">Clinician report</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Evidence-based metrics with the visualisation that best fits each clinical question. Click any card to expand.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface border border-border text-xs">
            {catOptions.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  cat === c ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "all" ? "All sections" : c}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface border border-border text-xs">
            <Filter className="h-3 w-3 text-muted-foreground ml-2" />
            {filterOptions.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  filter === f.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <Section name="Cardiac">
        <Card icon={Heart} eyebrow="1 · Resting heart rate" title="RHR — daily trend"
          value={`${rhr}`} unit="bpm"
          status={{ label: rhr > 65 ? "Needs attention" : "Optimal", tone: rhr > 65 ? "warn" : "good" }}
          defaultOpen
        >
          <RhrChart seed={seed} current={rhr} />
        </Card>
        <Card icon={Activity} eyebrow="2 · Exercise heart rate" title="Last workout — zones"
          value="60" unit="min · Z2-dominant"
          status={{ label: "Normal", tone: "info" }}
        >
          <ExerciseHrChart seed={seed} />
        </Card>
        <Card icon={TrendingUp} eyebrow="3 · Heart rate variability" title="HRV — nightly + 7-day avg"
          value={`${hrv}`} unit="ms"
          status={{ label: hrv < 45 ? "Needs attention" : "Optimal", tone: hrv < 45 ? "warn" : "good" }}
        >
          <HrvChart seed={seed} current={hrv} />
        </Card>
      </Section>

      <Section name="Sleep">
        <Card icon={Moon} eyebrow="4 · Total sleep time" title="Nightly duration vs target"
          value="7.4" unit="h avg" status={{ label: "Optimal", tone: "good" }}>
          <SleepDurationChart seed={seed} />
        </Card>
        <Card icon={Moon} eyebrow="5 · Stages & efficiency" title="Composition per night"
          value="89" unit="% efficiency" status={{ label: "Optimal", tone: "good" }}>
          <SleepStagesChart seed={seed} />
        </Card>
        <Card icon={Moon} eyebrow="6 · Restorative sleep" title="Deep + REM per night"
          value="183" unit="min avg" status={{ label: "Optimal", tone: "good" }}>
          <RestorativeSleepChart seed={seed} />
        </Card>
      </Section>

      <Section name="Activity">
        <Card icon={Footprints} eyebrow="7 · Daily steps" title="Steps vs goal"
          value={steps.toLocaleString()} unit="/ day" status={{ label: steps >= 8000 ? "Optimal" : "Needs attention", tone: steps >= 8000 ? "good" : "warn" }}>
          <StepsChart seed={seed} current={steps} />
        </Card>
        <Card icon={Dumbbell} eyebrow="8 · Exercises per month" title="Daily session minutes"
          value="18" unit="sessions / 30d" status={{ label: "Optimal", tone: "good" }}>
          <ExercisesPerMonthChart seed={seed} />
        </Card>
      </Section>

      <Section name="Fitness & Vitals">
        <Card icon={Gauge} eyebrow="9 · VO₂ max" title="Cardiorespiratory fitness"
          value={`${vo2}`} unit="ml/kg/min" status={{ label: "Normal", tone: "info" }}>
          <Vo2MaxChart seed={seed} current={vo2} />
        </Card>
        <Card icon={Droplets} eyebrow="10 · Blood oxygen (SpO₂)" title="Distribution + nightly min"
          value="96" unit="% avg" status={{ label: "Optimal", tone: "good" }}>
          <Spo2Chart seed={seed} />
        </Card>
        <Card icon={Thermometer} eyebrow="11 · Body temperature" title="Δ from personal baseline"
          value="±0.3" unit="°C" status={{ label: "Optimal", tone: "good" }}>
          <TempDeviationChart seed={seed} />
        </Card>
      </Section>
    </div>
    </CatCtx.Provider>
    </FilterCtx.Provider>
  );
};
