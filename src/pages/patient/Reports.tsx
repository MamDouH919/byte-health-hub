import { useParams, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  FileText,
  Scale,
  TestTube,
  ClipboardList,
  Activity as ActivityIcon,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { ReportInline } from "@/components/patient/ReportInline";
import {
  getPatientProfile,
  type ReportCardData,
  type BloodMetric,
} from "@/lib/data";

// Per-report icon mapping — gives each report a distinct visual identity
const REPORT_ICON: Record<string, LucideIcon> = {
  "body-composition": Scale,
  "blood-tests": TestTube,
  "user-survey": ClipboardList,
  "physio-assessment": ActivityIcon,
  "wearable-data": Watch,
};

type StatusKey = "Optimal" | "Normal" | "Needs attention";

const STATUS_STYLES: Record<StatusKey, { label: string; cls: string; dot: string }> = {
  Optimal: {
    label: "Optimal",
    cls: "bg-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))]",
    dot: "hsl(var(--status-optimal-fg))",
  },
  Normal: {
    label: "Normal",
    cls: "bg-[hsl(var(--status-normal-bg))] text-[hsl(var(--status-normal-fg))]",
    dot: "hsl(var(--status-normal-fg))",
  },
  "Needs attention": {
    label: "Needs attention",
    cls: "bg-[hsl(var(--status-attention-bg))] text-[hsl(var(--status-attention-fg))]",
    dot: "hsl(var(--status-attention-fg))",
  },
};

// Compute color-coded counts for each report based on its underlying data
const computeStatusCounts = (
  r: ReportCardData,
  profile: ReturnType<typeof getPatientProfile>,
): Partial<Record<StatusKey, number>> => {
  const tally = (list: { status?: string }[]) => {
    const out: Partial<Record<StatusKey, number>> = {};
    list.forEach((m) => {
      const s = m.status as StatusKey | undefined;
      if (s && s in STATUS_STYLES) out[s] = (out[s] ?? 0) + 1;
    });
    return out;
  };

  if (r.key === "blood-tests") {
    return tally([...profile.bloodTests.cbc.metrics, ...profile.bloodTests.hormones.metrics]);
  }
  if (r.key === "body-composition" && r.bodyComposition) {
    return tally(r.bodyComposition as BloodMetric[]);
  }
  if (r.key === "wearable-data" && r.wearableMetrics) {
    return tally(r.wearableMetrics);
  }
  if (r.key === "physio-assessment" && r.physioFindings) {
    // Map physio severities to the status taxonomy
    const out: Partial<Record<StatusKey, number>> = {};
    r.physioFindings.forEach((f) => {
      const k: StatusKey =
        f.severity === "Critical" ? "Needs attention"
        : f.severity === "Moderate" ? "Normal"
        : "Optimal";
      out[k] = (out[k] ?? 0) + 1;
    });
    return out;
  }
  if (r.key === "user-survey" && r.surveyAnswers) {
    const out: Partial<Record<StatusKey, number>> = {};
    r.surveyAnswers.forEach((a) => {
      const k: StatusKey =
        a.priority === "critical" ? "Needs attention"
        : a.priority === "important" ? "Normal"
        : "Optimal";
      out[k] = (out[k] ?? 0) + 1;
    });
    return out;
  }
  // Fallback: mirror the report's own status
  return { [r.status]: 1 } as Partial<Record<StatusKey, number>>;
};

const StatusCounts = ({ counts }: { counts: Partial<Record<StatusKey, number>> }) => {
  const order: StatusKey[] = ["Needs attention", "Normal", "Optimal"];
  const visible = order.filter((k) => (counts[k] ?? 0) > 0);
  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((k) => {
        const cfg = STATUS_STYLES[k];
        return (
          <span
            key={k}
            title={`${counts[k]} ${cfg.label.toLowerCase()}`}
            className={`pill ${cfg.cls} tabular-nums px-2 py-0.5 text-[11px] font-semibold`}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full mr-1"
              style={{ backgroundColor: cfg.dot }}
            />
            {counts[k]}
          </span>
        );
      })}
    </div>
  );
};

// Break a long sentence into short, scannable horizontal bullet chips.
// Splits on sentence/clause boundaries and trims to keep each fragment punchy.
const splitToBullets = (text: string): string[] => {
  if (!text) return [];
  return text
    .replace(/\s+/g, " ")
    .split(/(?:\.\s+|;\s+|\s+—\s+|\s+–\s+)/g)
    .map((s) => s.trim().replace(/[.;]+$/g, ""))
    .filter((s) => s.length > 0)
    .slice(0, 5);
};

const ContextBullets = ({ text }: { text: string }) => {
  const items = splitToBullets(text);
  if (items.length === 0) return null;
  return (
    <ul className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground leading-snug">
      {items.map((item, i) => (
        <li key={i} className="inline-flex items-center gap-2">
          {i > 0 && <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/40" />}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

const ReportRow = ({
  r,
  open,
  onToggle,
  counts,
  innerRef,
}: {
  r: ReportCardData;
  open: boolean;
  onToggle: () => void;
  counts: Partial<Record<StatusKey, number>>;
  innerRef?: (el: HTMLDivElement | null) => void;
}) => {
  const Icon = REPORT_ICON[r.key] ?? FileText;
  return (
    <div
      ref={innerRef}
      className="surface-card bg-background overflow-hidden transition-shadow hover:shadow-[var(--shadow-card)] scroll-mt-28"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full p-5 flex items-start gap-4 text-left"
      >
        <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            {r.category}
          </div>
          <h3 className="text-base font-semibold mt-0.5 leading-tight">{r.title}</h3>
          <ContextBullets text={r.context ?? r.summary} />
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusCounts counts={counts} />
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {r.date}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-border px-5 py-5 animate-fade-in bg-surface/30">
          <ReportInline r={r} />
        </div>
      )}
    </div>
  );
};

const Reports = () => {
  const { id } = useParams();
  const loc = useLocation();
  const profile = getPatientProfile(id);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleToggle = (key: string) => {
    setOpenKey((current) => {
      const next = current === key ? null : key;
      if (next) {
        window.setTimeout(() => {
          const el = rowRefs.current[key];
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      }
      return next;
    });
  };

  // Auto-open + scroll when navigated via hash (e.g. /reports#wearable-data)
  useEffect(() => {
    const slug = loc.hash.replace(/^#/, "");
    if (!slug) return;
    const match = profile.reports.find((r) => r.key === slug);
    if (!match) return;
    setOpenKey(slug);
    window.setTimeout(() => {
      rowRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, [loc.hash, profile.reports]);

  return (
    <div className="space-y-6">
      <section>
        <header className="mb-4">
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Click any report to open the full view. Click any metric to see its trend over time.
          </p>
        </header>
        <div className="flex flex-col gap-3">
          {profile.reports.map((r) => (
            <ReportRow
              key={r.key}
              r={r}
              open={openKey === r.key}
              onToggle={() => handleToggle(r.key)}
              counts={computeStatusCounts(r, profile)}
              innerRef={(el) => { rowRefs.current[r.key] = el; }}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Reports;
