import {
  ChevronDown, ChevronUp, Edit3, FileText, RefreshCw, Send, Sparkles,
  Moon, Sunrise, Bed, Wind, Coffee, Thermometer, Smartphone, Activity, Clock, Heart,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { toast } from "@/hooks/use-toast";
import { CountUp } from "@/components/brand/CountUp";

// ---- Types ----
interface SleepProtocolItem {
  name: string;
  detail?: string;
  icon: keyof typeof protocolIcons;
}

const protocolIcons = {
  windDown: Wind,
  noScreens: Smartphone,
  caffeine: Coffee,
  cool: Thermometer,
  magnesium: Bed,
  light: Sunrise,
  sleep: Moon,
};

// ---- Sleep-specific plan context ----
interface SleepContext {
  tag: string;
  text: string;
}
const sleepContext: SleepContext[] = [
  { tag: "Sleep latency", text: "Average 38 min to fall asleep over the last 14 nights — target ≤ 20 min." },
  { tag: "Wake variance", text: "Wake time drifts ±55 min between weekdays and weekends — aim for ±30 min." },
  { tag: "HRV trend", text: "Overnight HRV down 12% over 4 weeks — suggests insufficient parasympathetic recovery." },
  { tag: "Caffeine", text: "Self-reports 2–3 espressos, often after 15:00. Half-life impacts sleep onset." },
  { tag: "Environment", text: "Bedroom temperature reported at 22°C with ambient light from street." },
];

// ---- Single daily protocol ----
const defaultProtocol: SleepProtocolItem[] = [
  { name: "Caffeine cutoff", detail: "No caffeine after 13:00", icon: "caffeine" },
  { name: "Wind-down ritual", detail: "Dim lights & 4-7-8 breathwork from 21:30", icon: "windDown" },
  { name: "Screens off", detail: "Phone out of bedroom by 22:00", icon: "noScreens" },
  { name: "Cool, dark room", detail: "Bedroom 18°C, blackout blinds", icon: "cool" },
  { name: "Magnesium glycinate", detail: "300 mg, 60 min before bed", icon: "magnesium" },
  { name: "Morning light", detail: "10 min outdoor light within 30 min of waking", icon: "light" },
];

const altProtocol: SleepProtocolItem[] = [
  { name: "Caffeine cutoff", detail: "No caffeine after 12:00 — tighter window", icon: "caffeine" },
  { name: "Wind-down ritual", detail: "Dim lights & 4-7-8 breathwork from 21:15", icon: "windDown" },
  { name: "Screens off", detail: "Phone out of bedroom by 21:45", icon: "noScreens" },
  { name: "Cool, dark room", detail: "Bedroom 18°C, blackout blinds, white noise", icon: "cool" },
  { name: "Magnesium glycinate", detail: "300 mg, 60 min before bed", icon: "magnesium" },
  { name: "Tart cherry juice", detail: "30 mL post-dinner — supports sleep depth", icon: "magnesium" },
  { name: "Morning sun walk", detail: "15 min outdoor light within 30 min of waking", icon: "light" },
];

const targetSchedule = { bedtime: "22:30", wake: "06:30", duration: "8h 00m" };

type DiffMap = Record<string, "added" | "removed" | undefined>;

// ---- Patient sleep stats (mock) ----
// `history` powers the expandable bar-chart-with-trend-line view.
// `value` field on each point is what's shown on the bars; `display` is the
// human-readable axis label (e.g. "23:18" for bedtime).
type SleepStatPoint = { week: string; value: number; display: string };
interface SleepStat {
  key: string;
  label: string;
  value: string;
  icon: typeof Moon;
  benchmark: string;
  unit?: string;
  history: SleepStatPoint[];
}

const sleepStats: SleepStat[] = [
  {
    key: "bedtime",
    label: "Average bedtime",
    value: "23:18",
    icon: Moon,
    benchmark: "Target 22:30 · within ±20 min for consistency",
    unit: "h",
    // Minutes after 22:00 (so 78 = 23:18). Lower is better.
    history: [
      { week: "W1",  value: 95, display: "23:35" },
      { week: "W2",  value: 88, display: "23:28" },
      { week: "W3",  value: 92, display: "23:32" },
      { week: "W4",  value: 84, display: "23:24" },
      { week: "W5",  value: 80, display: "23:20" },
      { week: "W6",  value: 82, display: "23:22" },
      { week: "W7",  value: 76, display: "23:16" },
      { week: "W8",  value: 78, display: "23:18" },
    ],
  },
  {
    key: "duration",
    label: "Average sleep",
    value: "6h 42m",
    icon: Clock,
    benchmark: "Adults 18–64: 7–9h (National Sleep Foundation)",
    unit: "h",
    history: [
      { week: "W1", value: 6.1, display: "6h 06m" },
      { week: "W2", value: 6.3, display: "6h 18m" },
      { week: "W3", value: 6.0, display: "6h 00m" },
      { week: "W4", value: 6.4, display: "6h 24m" },
      { week: "W5", value: 6.5, display: "6h 30m" },
      { week: "W6", value: 6.6, display: "6h 36m" },
      { week: "W7", value: 6.5, display: "6h 30m" },
      { week: "W8", value: 6.7, display: "6h 42m" },
    ],
  },
  {
    key: "restorative",
    label: "Restorative sleep",
    value: "1h 28m",
    icon: Heart,
    benchmark: "Healthy: 1.5–2h deep + REM combined per night",
    unit: "h",
    history: [
      { week: "W1", value: 1.05, display: "1h 03m" },
      { week: "W2", value: 1.15, display: "1h 09m" },
      { week: "W3", value: 1.10, display: "1h 06m" },
      { week: "W4", value: 1.25, display: "1h 15m" },
      { week: "W5", value: 1.30, display: "1h 18m" },
      { week: "W6", value: 1.35, display: "1h 21m" },
      { week: "W7", value: 1.40, display: "1h 24m" },
      { week: "W8", value: 1.47, display: "1h 28m" },
    ],
  },
];

// ---- Expandable stat card with bar chart + linear trend line ----
const linearTrend = (points: SleepStatPoint[]): number[] => {
  const n = points.length;
  const xs = points.map((_, i) => i);
  const ys = points.map((p) => p.value);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0);
  const den = xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0) || 1;
  const slope = num / den;
  const intercept = meanY - slope * meanX;
  return xs.map((x) => +(intercept + slope * x).toFixed(3));
};

const SleepStatCard = ({ s }: { s: SleepStat }) => {
  const [open, setOpen] = useState(false);
  const trend = linearTrend(s.history);
  const data = s.history.map((p, i) => ({ ...p, trend: trend[i] }));
  const first = trend[0];
  const last = trend[trend.length - 1];
  // For "bedtime" lower is better; for the others higher is better.
  const lowerIsBetter = s.key === "bedtime";
  const improving = lowerIsBetter ? last < first : last > first;
  const deltaPct = first ? Math.abs(((last - first) / first) * 100) : 0;
  const trendColor = improving ? "hsl(var(--trend-up))" : "hsl(var(--trend-down))";
  const Icon = s.icon;

  return (
    <article className="surface-card overflow-hidden hover:shadow-[var(--shadow-card)] transition-shadow">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            <Icon className="h-3.5 w-3.5" />
            {s.label}
          </div>
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-2xl font-semibold tabular-nums leading-none">{s.value}</div>
          <span
            className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-medium"
            style={{ color: trendColor }}
          >
            {improving ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {deltaPct.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground leading-snug">{s.benchmark}</div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Weekly trend
            </div>
            <div className="text-[10px] text-muted-foreground">{s.history.length} weeks</div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(val: number, name: string, item: { payload?: SleepStatPoint }) => {
                    if (name === "trend") return [val.toFixed(2), "Trend"];
                    return [item?.payload?.display ?? val, s.label];
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--foreground) / 0.18)" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke={trendColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </article>
  );
};

const Sleep = () => {
  const [openCtx, setOpenCtx] = useState(true);
  const [protocol, setProtocol] = useState<SleepProtocolItem[]>(defaultProtocol);
  const [version, setVersion] = useState(1);
  const [score, setScore] = useState(48);
  const [generating, setGenerating] = useState(false);
  const [diff, setDiff] = useState<DiffMap>({});

  useEffect(() => {
    if (Object.keys(diff).length === 0) return;
    const t = setTimeout(() => setDiff({}), 4000);
    return () => clearTimeout(t);
  }, [diff]);

  const regenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const next = version % 2 === 1 ? altProtocol : defaultProtocol;
      const beforeNames = new Set(protocol.map((e) => e.name));
      const afterNames = new Set(next.map((e) => e.name));
      const d: DiffMap = {};
      next.forEach((p) => { if (!beforeNames.has(p.name)) d[`add::${p.name}`] = "added"; });
      protocol.forEach((p) => { if (!afterNames.has(p.name)) d[`rem::${p.name}`] = "removed"; });
      setDiff(d);
      setProtocol(next);
      setVersion((v) => v + 1);
      setScore((s) => Math.min(95, s + 16 + Math.floor(Math.random() * 8)));
      setGenerating(false);
      toast({ title: "Sleep protocol regenerated", description: `New v${version + 1} — changes highlighted briefly.` });
    }, 600);
  };

  const removedItems = Object.keys(diff)
    .filter((k) => k.startsWith("rem::"))
    .map((k) => k.slice(5));

  return (
    <div className="space-y-6">

      {/* Sleep stats — click any card to expand a weekly trend chart */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sleepStats.map((s) => (
          <SleepStatCard key={s.key} s={s} />
        ))}
      </section>

      {/* Sleep Context */}
      <section className="surface-card p-5">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            <FileText className="h-3.5 w-3.5" /> Sleep Context
          </div>
          <button onClick={() => setOpenCtx((o) => !o)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            {sleepContext.length} signals {openCtx ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </header>
        {openCtx && (
          <ul className="mt-4 divide-y divide-border/60">
            {sleepContext.map((c) => (
              <li key={c.tag} className="grid grid-cols-[130px_1fr] gap-4 py-3 items-start">
                <span className="tag justify-center w-fit bg-surface text-foreground border border-border">{c.tag}</span>
                <span className="text-sm text-foreground/80 leading-relaxed">{c.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Daily Sleep Protocol */}
      <section className="surface-card p-5">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 font-medium">
            <Moon className="h-4 w-4" /> Daily Sleep Protocol
            <span className="pill bg-[hsl(var(--status-neutral-bg))] text-[hsl(var(--status-neutral-fg))]">
              <Sparkles className="h-3 w-3" /> AI generated · v<CountUp value={version} />
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">applies every night</span>
        </header>

        {/* Schedule strip */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <div className="rounded-lg bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold inline-flex items-center gap-1">
              <Moon className="h-3 w-3" /> Target bedtime
            </div>
            <div className="text-base font-semibold tabular-nums mt-0.5">{targetSchedule.bedtime}</div>
          </div>
          <div className="rounded-lg bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold inline-flex items-center gap-1">
              <Sunrise className="h-3 w-3" /> Target wake
            </div>
            <div className="text-base font-semibold tabular-nums mt-0.5">{targetSchedule.wake}</div>
          </div>
          <div className="rounded-lg bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold inline-flex items-center gap-1">
              <Bed className="h-3 w-3" /> Target duration
            </div>
            <div className="text-base font-semibold tabular-nums mt-0.5">{targetSchedule.duration}</div>
          </div>
        </div>

        {/* Protocol grid — fills horizontal space instead of long vertical list */}
        <div className="mt-5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Wind-down protocol</div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {protocol.map((p, i) => {
            const flag = diff[`add::${p.name}`];
            const Icon = protocolIcons[p.icon] ?? Bed;
            return (
              <li
                key={i}
                className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-surface h-full ${flag === "added" ? "ring-1 ring-[hsl(var(--trend-up))] animate-diff-flash" : ""}`}
              >
                <div className="h-7 w-7 rounded-md bg-background border border-border flex items-center justify-center shrink-0 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium flex items-center gap-1.5 leading-tight">
                    {p.name}
                    {flag === "added" && <span className="text-[9px] font-semibold text-[hsl(var(--trend-up))] uppercase">new</span>}
                  </div>
                  {p.detail && (
                    <div className="text-[11px] text-muted-foreground/90 leading-snug mt-1">
                      {p.detail}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {removedItems.map((name) => (
            <li key={name} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-[hsl(var(--status-critical-bg)/0.4)] line-through opacity-70 animate-diff-flash">
              <span className="text-[13px]">{name}</span>
              <span className="text-[9px] font-semibold text-[hsl(var(--destructive))] uppercase">removed</span>
            </li>
          ))}
        </ul>

        {/* AI score */}
        <div className="mt-6 flex items-center justify-between text-xs">
          <div className="inline-flex items-center gap-2">
            <span className="uppercase tracking-wider text-muted-foreground font-semibold">AI Recommendation</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium transition-colors ${
                score >= 75
                  ? "bg-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))]"
                  : score >= 55
                  ? "bg-[hsl(var(--status-normal-bg))] text-[hsl(var(--status-normal-fg))]"
                  : "bg-[hsl(var(--status-critical-bg))] text-[hsl(var(--status-critical-fg))]"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${score >= 75 ? "bg-[hsl(var(--trend-up))]" : score >= 55 ? "bg-[hsl(var(--status-normal-fg))]" : "bg-[hsl(var(--destructive))]"}`} />
              <CountUp value={score} suffix="/100" /> — {score >= 75 ? "well-aligned" : score >= 55 ? "acceptable" : "needs regeneration"}
            </span>
          </div>
          <span className="text-muted-foreground">⏱ Last generated just now</span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
          <div className="surface-card bg-background p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <span>Notes for AI</span>
              <button className="inline-flex items-center gap-1 text-foreground"><Edit3 className="h-3 w-3" /> Edit</button>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li className="flex gap-2"><span className="text-muted-foreground">•</span> reduce sleep latency from 38 min toward ≤ 20 min</li>
              <li className="flex gap-2"><span className="text-muted-foreground">•</span> stabilise bedtime within ±20 min nightly</li>
              <li className="flex gap-2"><span className="text-muted-foreground">•</span> increase restorative (deep + REM) sleep above 1.5h</li>
              <li className="flex gap-2"><span className="text-muted-foreground">•</span> support overnight HRV recovery</li>
            </ul>
          </div>

          <div className="surface-card bg-background p-4 space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Actions</div>
            <button
              onClick={regenerate}
              disabled={generating}
              className="btn-primary-pill w-full"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Regenerating..." : "Regenerate"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-surface-pill !px-3 !py-1.5 !text-xs">
                <Edit3 className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={() => toast({ title: "Sleep protocol published", description: `v${version} sent to patient.` })}
                className="btn-surface-pill !px-3 !py-1.5 !text-xs"
              >
                <Send className="h-3 w-3" /> Publish
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {score < 55 ? "Score is too low — regenerate with updated notes." : "Protocol ready to publish."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sleep;
