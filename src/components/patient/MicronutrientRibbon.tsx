import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { MICRO_REFERENCES, type WeeklyMacros } from "@/lib/nutrition-plan";

interface Props {
  weekly: WeeklyMacros;
}

const statusFor = (avg: number, optimal: [number, number], upper?: number) => {
  const [lo, hi] = optimal;
  if (upper && avg > upper) return { tone: "bad", label: "above UL" };
  if (avg < lo) return { tone: "low", label: "below target" };
  if (avg > hi) return { tone: "high", label: "above target" };
  return { tone: "ok", label: "in range" };
};

const toneClass: Record<string, string> = {
  ok:   "bg-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))]",
  low:  "bg-[hsl(var(--status-attention-bg))] text-[hsl(var(--status-attention-fg))]",
  high: "bg-[hsl(var(--status-warn-bg))] text-[hsl(var(--status-warn-fg))]",
  bad:  "bg-[hsl(var(--status-critical-bg))] text-[hsl(var(--status-critical-fg))]",
};

export const MicronutrientRibbon = ({ weekly }: Props) => {
  const [open, setOpen] = useState(false);
  const okCount = MICRO_REFERENCES.filter((r) => {
    const v = weekly[r.key].average;
    return statusFor(v, r.optimal, r.upper).tone === "ok";
  }).length;

  return (
    <section className="surface-card p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Weekly micronutrients
          <span className="pill bg-surface text-foreground border border-border ml-1 normal-case tracking-normal">
            {okCount}/{MICRO_REFERENCES.length} in range
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-in">
          {MICRO_REFERENCES.map((r) => {
            const avg = weekly[r.key].average;
            const total = weekly[r.key].total;
            const status = statusFor(avg, r.optimal, r.upper);
            const [lo, hi] = r.optimal;
            const scaleMax = Math.max(hi * 1.4, avg * 1.1);
            const pct = (n: number) => Math.max(0, Math.min(100, (n / scaleMax) * 100));
            return (
              <div key={r.key} className="rounded-lg bg-surface p-3 border border-border">
                <div className="flex items-center justify-between gap-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{r.label}</div>
                  <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${toneClass[status.tone]}`}>
                    {status.label}
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-base font-semibold tabular-nums">{avg.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground">{r.unit} / day</span>
                </div>
                <div className="mt-2 relative h-1.5 rounded-full bg-background overflow-hidden">
                  <div
                    className="absolute inset-y-0 bg-[hsl(var(--status-optimal-bg)/0.55)]"
                    style={{ left: `${pct(lo)}%`, width: `${Math.max(0, pct(hi) - pct(lo))}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-2 w-2 rounded-full ring-2 ring-background bg-foreground"
                    style={{ left: `${pct(avg)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-muted-foreground/80 tabular-nums">
                  <span>0</span>
                  <span>{lo}–{hi}</span>
                  <span>{Math.round(scaleMax)}</span>
                </div>
                <div className="mt-1.5 text-[10px] text-muted-foreground">
                  Weekly total: <span className="tabular-nums text-foreground/80">{total.toLocaleString()} {r.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
