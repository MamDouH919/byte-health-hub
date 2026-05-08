import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrendIndicator } from "./TrendIndicator";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Props {
  patientId: string;
  patientName: string;
  trendPct: number;
  currentAvg: number;
}

// Months across an ~8-month program window, ending at the current month.
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const buildMonths = (count: number) => {
  const now = new Date();
  const labels: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(MONTH_NAMES[d.getMonth()]);
  }
  return labels;
};

// Deterministic pseudo-random series so each patient has a stable trend.
const buildSeries = (seedStr: string, endValue: number, trendPct: number) => {
  const months = buildMonths(8);
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const startValue = Math.max(5, Math.round(endValue / (1 + trendPct / 100)));
  const data = months.map((month, i) => {
    const t = i / (months.length - 1);
    const base = startValue + (endValue - startValue) * t;
    const noise = (rand() - 0.5) * 12;
    const value = Math.max(0, Math.min(100, Math.round(base + noise)));
    return { month, value };
  });
  data[data.length - 1].value = endValue;
  return data;
};

export const EngagementTrendPopover = ({ patientId, patientName, trendPct, currentAvg }: Props) => {
  const data = useMemo(
    () => buildSeries(patientId, currentAvg, trendPct),
    [patientId, currentAvg, trendPct],
  );
  const up = trendPct >= 0;
  const stroke = up ? "hsl(var(--trend-up))" : "hsl(var(--trend-down))";
  const startMonth = data[0].month;
  const endMonth = data[data.length - 1].month;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`View engagement trend for ${patientName}`}
          className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 cursor-pointer transition-all hover:border-foreground/40 hover:bg-background hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <TrendIndicator pct={trendPct} />
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-y-0.5 group-data-[state=open]:rotate-180" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-sm font-semibold">{patientName}</div>
            <div className="text-xs text-muted-foreground">Engagement · {startMonth} – {endMonth}</div>
          </div>
          <TrendIndicator pct={trendPct} />
        </div>
        <div className="h-36 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${patientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval={0}
                tickMargin={6}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v} pts`, "Avg"]}
                labelFormatter={(l) => `${l}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={stroke}
                strokeWidth={2}
                fill={`url(#grad-${patientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Program start · {startMonth}</span>
          <span>Now · {currentAvg} pts</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};
