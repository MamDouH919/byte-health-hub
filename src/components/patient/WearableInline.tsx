import { useState } from "react";
import {
  Moon, Heart, Activity, Dumbbell, ChevronDown, TrendingUp, TrendingDown, Filter,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid,
} from "recharts";
import { StatusPill } from "@/components/brand/StatusPill";
import type { WearableMetric, WearableCategory } from "@/lib/data";

const categoryMeta: Record<WearableCategory, { icon: typeof Moon; tone: string }> = {
  "Sleep":         { icon: Moon,     tone: "text-[hsl(var(--brand-violet,260_70%_60%))]" },
  "Heart Health":  { icon: Heart,    tone: "text-[hsl(var(--status-bad-fg))]" },
  "Activity":      { icon: Activity, tone: "text-[hsl(var(--status-info-fg))]" },
  "Exercise":      { icon: Dumbbell, tone: "text-[hsl(var(--status-good-fg))]" },
};

const MetricCard = ({ m }: { m: WearableMetric }) => {
  const [open, setOpen] = useState(false);
  const first = m.history[0]?.value ?? 0;
  const last  = m.history[m.history.length - 1]?.value ?? 0;
  const deltaPct = first ? ((last - first) / Math.abs(first)) * 100 : 0;
  const up = deltaPct >= 0;
  const stroke = up ? "hsl(var(--trend-up))" : "hsl(var(--trend-down))";
  const startMonth = m.history[0]?.month;
  const endMonth   = m.history[m.history.length - 1]?.month;

  const renderChart = () => {
    if (m.chart === "bar") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={m.history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`${v}${m.unit ? ` ${m.unit}` : ""}`, m.label]}
            />
            <Bar dataKey="value" fill={stroke} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={m.history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`${v}${m.unit ? ` ${m.unit}` : ""}`, m.label]}
          />
          <Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} fill={`url(#grad-${m.key})`} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <article className="surface-card bg-background overflow-hidden hover:shadow-[var(--shadow-card)] transition-shadow">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full p-3.5 text-left"
      >
        <header className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium truncate">{m.label}</div>
          <div className="flex items-center gap-1.5 shrink-0">
            {m.status && <StatusPill status={m.status} />}
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </header>
        <div className="mt-2 flex items-baseline gap-1.5">
          <div className="text-2xl font-bold tracking-tight tabular-nums">{m.display}</div>
          {m.unit && <div className="text-[11px] text-muted-foreground">{m.unit}</div>}
          {m.history.length > 1 && (
            <span className={`ml-auto inline-flex items-center gap-0.5 text-[10px] font-medium ${up ? "text-[hsl(var(--trend-up))]" : "text-[hsl(var(--trend-down))]"}`}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(deltaPct).toFixed(1)}%
            </span>
          )}
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {startMonth} – {endMonth}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Trend over time
            </div>
            <div className="text-[10px] text-muted-foreground">
              {m.history.length} months
            </div>
          </div>
          <div className="h-44 w-full">{renderChart()}</div>
        </div>
      )}
    </article>
  );
};

export const WearableInline = ({ metrics }: { metrics: WearableMetric[] }) => {
  const order: WearableCategory[] = ["Sleep", "Heart Health", "Activity", "Exercise"];
  const [filter, setFilter] = useState<"all" | "Optimal" | "Normal" | "Needs attention">("all");
  const [catFilter, setCatFilter] = useState<"all" | WearableCategory>("all");

  const apply = (list: WearableMetric[]) =>
    filter === "all" ? list : list.filter(m => m.status === filter);

  // Per-category counts (respect the status filter so the numbers match what's shown)
  const catCount = (cat: WearableCategory) =>
    apply(metrics.filter(m => m.category === cat)).length;
  const totalCount = apply(metrics).length;

  const visibleCats = catFilter === "all" ? order : [catFilter];

  return (
    <div className="space-y-6">
      {/* Toolbar — segment filters on the left, status filters on the right */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface border border-border text-xs">
          <Filter className="h-3 w-3 text-muted-foreground ml-2" />
          <button
            onClick={() => setCatFilter("all")}
            className={`px-3 py-1 rounded-full font-medium transition-colors inline-flex items-center gap-1.5 ${
              catFilter === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
            <span className={`tabular-nums text-[10px] ${catFilter === "all" ? "opacity-70" : "opacity-60"}`}>
              {totalCount}
            </span>
          </button>
          {order.map((cat) => {
            const cfg = categoryMeta[cat];
            const Icon = cfg.icon;
            const active = catFilter === cat;
            const n = catCount(cat);
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                disabled={n === 0}
                className={`px-3 py-1 rounded-full font-medium transition-colors inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-3 w-3 ${active ? "" : cfg.tone}`} />
                {cat}
                <span className={`tabular-nums text-[10px] ${active ? "opacity-70" : "opacity-60"}`}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface border border-border text-xs">
          <Filter className="h-3 w-3 text-muted-foreground ml-2" />
          {(["all", "Optimal", "Normal", "Needs attention"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {visibleCats.map(cat => {
        const list = apply(metrics.filter(m => m.category === cat));
        if (list.length === 0) return null;
        const cfg = categoryMeta[cat];
        const Icon = cfg.icon;
        return (
          <section key={cat} className="space-y-3">
            <header className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${cfg.tone}`} />
              <h4 className="text-sm font-semibold">{cat}</h4>
              <span className="text-[11px] text-muted-foreground">
                {list.length} {list.length === 1 ? "metric" : "metrics"}
              </span>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {list.map(m => <MetricCard key={m.key} m={m} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
};
