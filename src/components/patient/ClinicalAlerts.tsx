import { useParams } from "react-router-dom";
import { AlertTriangle, ShieldAlert, Activity, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Severity = "critical" | "warning" | "info";

interface Alert {
  severity: Severity;
  title: string;
  detail: string;
}

const alertsByPatient: Record<string, Alert[]> = {
  "ali-02": [
    { severity: "critical", title: "NSAID caution", detail: "Ibuprofen PRN — limit to ≤3×/week due to lumbar strain history & elevated creatinine." },
    { severity: "warning",  title: "Statin co-supplementation", detail: "On Rosuvastatin — ensure CoQ10 200 mg/day is taken with morning meal." },
    { severity: "info",     title: "Refill due", detail: "Rosuvastatin script renews in 8 days." },
  ],
  "yassin-05": [
    { severity: "critical", title: "Hypoglycemia risk", detail: "Metformin + fasted morning training — fuel 30 min pre-session, monitor glucose post." },
    { severity: "warning",  title: "Bicarb GI tolerance", detail: "Sodium bicarb only on tested race-pace days; skip on long Z2." },
  ],
  "motasim-04": [
    { severity: "warning",  title: "Caffeine ceiling", detail: "Max 300 mg/day combined (pre-workout + coffee) — sleep latency flagged 4×/wk." },
    { severity: "info",     title: "Iron timing", detail: "Take iron away from coffee/tea by ≥2 hours." },
  ],
  "yassin-06": [
    { severity: "critical", title: "Drug-drug interaction", detail: "Avoid grapefruit while on Atorvastatin." },
    { severity: "warning",  title: "Sleep aid weaning", detail: "Melatonin only for travel — not nightly. Reassess in 14 days." },
  ],
};

const fallback: Alert[] = [
  { severity: "info", title: "No flags on record", detail: "Last reviewed during most recent intake. Add a clinical alert as needed." },
];

const styles: Record<Severity, { bg: string; ring: string; fg: string; icon: typeof AlertTriangle; label: string }> = {
  critical: { bg: "bg-[hsl(var(--status-attention-bg))]", ring: "ring-[hsl(var(--status-attention-fg))]/20", fg: "text-[hsl(var(--status-attention-fg))]", icon: AlertTriangle, label: "Critical" },
  warning:  { bg: "bg-[hsl(var(--status-neutral-bg))]",   ring: "ring-[hsl(var(--status-neutral-fg))]/20",   fg: "text-[hsl(var(--status-neutral-fg))]",   icon: ShieldAlert,    label: "Watch" },
  info:     { bg: "bg-surface",                            ring: "ring-border",                              fg: "text-muted-foreground",                  icon: Info,           label: "Note" },
};

export const ClinicalAlerts = () => {
  const { id } = useParams();
  const items = alertsByPatient[id ?? ""] ?? fallback;

  return (
    <section className="surface-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Clinical context</h2>
        </div>
        <span className="text-[11px] text-muted-foreground">Critical alerts & interactions</span>
      </div>
      <ul className="space-y-2">
        {items.map((a, i) => {
          const s = styles[a.severity];
          const Icon = s.icon;
          return (
            <li key={i} className={cn("flex items-start gap-3 rounded-md p-3 ring-1", s.bg, s.ring)}>
              <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", s.fg)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{a.title}</span>
                  <span className={cn("text-[10px] uppercase tracking-wider font-semibold", s.fg)}>{s.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
