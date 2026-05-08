import { useParams } from "react-router-dom";
import { Filter } from "lucide-react";
import { useState } from "react";
import { MetricTrendCard } from "@/components/patient/MetricTrendCard";
import { WearableClinicalReport } from "@/components/patient/WearableClinicalReport";
import {
  getPatientProfile,
  type BloodMetric,
  type ReportCardData,
  type SurveyAnswer,
  type PhysioFinding,
} from "@/lib/data";
import { StatusPill } from "@/components/brand/StatusPill";

/** Parses a free-form metric value like "13.2 g/dL", "6/10", "125°", "12200" */
const parseMetric = (raw: string): { value?: number; unit?: string; display: string } => {
  const trimmed = raw.trim();
  const ratio = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (ratio) return { value: parseFloat(ratio[1]), unit: `/ ${ratio[2]}`, display: ratio[1] };
  const m = trimmed.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  if (m) {
    const value = parseFloat(m[1]);
    const unit = m[2].trim();
    return { value, unit: unit || undefined, display: m[1] };
  }
  return { display: trimmed };
};

// ── Reusable filterable marker grid (used by Blood Tests + Body Composition) ─────────
const MarkerGrid = ({ groups }: { groups: { title: string; list: BloodMetric[] }[] }) => {
  const [filter, setFilter] = useState<"all" | "Optimal" | "Normal" | "Needs attention">("all");
  const apply = (list: BloodMetric[]) => (filter === "all" ? list : list.filter((m) => m.status === filter));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
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

      {groups.map((group) => {
        const list = apply(group.list);
        return (
          <div key={group.title}>
            {groups.length > 1 && <h4 className="text-sm font-semibold mb-3">{group.title}</h4>}
            {list.length === 0 ? (
              <div className="text-xs text-muted-foreground">No matching markers.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {list.map((m) => (
                  <MetricTrendCard
                    key={m.name}
                    name={m.name}
                    display={m.display}
                    unit={m.unit}
                    status={m.status}
                    value={m.value}
                    prev={m.prev}
                    min={m.min}
                    max={m.max}
                    scaleMin={m.scaleMin}
                    scaleMax={m.scaleMax}
                    range={m.range}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const BloodTestsInline = ({ bloodTests }: { bloodTests: ReturnType<typeof getPatientProfile>["bloodTests"] }) => (
  <MarkerGrid
    groups={[
      { title: "CBC", list: bloodTests.cbc.metrics },
      { title: "Hormone Panel", list: bloodTests.hormones.metrics },
    ]}
  />
);

const BodyCompositionInline = ({ markers }: { markers: BloodMetric[] }) => (
  <MarkerGrid groups={[{ title: "Body Composition", list: markers }]} />
);

// ── Shared filter bar (matches Blood Tests / Body Composition) ──────────────────
type StatusKey = "Optimal" | "Normal" | "Needs attention";
const StatusFilterBar = ({
  value, onChange,
}: { value: "all" | StatusKey; onChange: (v: "all" | StatusKey) => void }) => (
  <div className="flex items-center justify-end">
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface border border-border text-xs">
      <Filter className="h-3 w-3 text-muted-foreground ml-2" />
      {(["all", "Optimal", "Normal", "Needs attention"] as const).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            value === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {f === "all" ? "All" : f}
        </button>
      ))}
    </div>
  </div>
);

const STATUS_STYLES: Record<StatusKey, { cls: string; dot: string }> = {
  Optimal:           { cls: "bg-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))]", dot: "hsl(var(--status-optimal-fg))" },
  Normal:            { cls: "bg-[hsl(var(--status-normal-bg))] text-[hsl(var(--status-normal-fg))]", dot: "hsl(var(--status-normal-fg))" },
  "Needs attention": { cls: "bg-[hsl(var(--status-attention-bg))] text-[hsl(var(--status-attention-fg))]", dot: "hsl(var(--status-attention-fg))" },
};

// ── User Survey: same filter+grid format as Blood Tests ─────────────────────────
const surveyPriorityToStatus = (p: SurveyAnswer["priority"]): StatusKey =>
  p === "critical" ? "Needs attention" : p === "important" ? "Normal" : "Optimal";

const UserSurveyInline = ({ answers }: { answers: SurveyAnswer[] }) => {
  const [filter, setFilter] = useState<"all" | StatusKey>("all");
  const enriched = answers.map((a) => ({ ...a, _status: surveyPriorityToStatus(a.priority) }));
  const list = filter === "all" ? enriched : enriched.filter((a) => a._status === filter);

  return (
    <div className="space-y-5">
      <StatusFilterBar value={filter} onChange={setFilter} />
      {list.length === 0 ? (
        <div className="text-xs text-muted-foreground">No matching answers.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((q, i) => {
            const cfg = STATUS_STYLES[q._status];
            return (
              <article
                key={i}
                className="surface-card bg-background p-4 border-l-4 transition-shadow hover:shadow-[var(--shadow-card)]"
                style={{ borderLeftColor: cfg.dot }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {q.category}
                  </div>
                  <span className={`pill ${cfg.cls} px-2 py-0.5 text-[11px] font-semibold`}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: cfg.dot }} />
                    {q._status}
                  </span>
                </div>
                <div className="text-sm font-semibold mt-1.5 leading-snug">{q.question}</div>
                <p className="text-xs text-foreground/75 leading-relaxed mt-1.5">{q.answer}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Physio Assessment: same filter+grid format as Blood Tests ───────────────────
const physioSeverityToStatus = (s: PhysioFinding["severity"]): StatusKey =>
  s === "Critical" ? "Needs attention" : s === "Moderate" ? "Normal" : "Optimal";

const PhysioInline = ({ findings }: { findings: PhysioFinding[] }) => {
  const [filter, setFilter] = useState<"all" | StatusKey>("all");
  const enriched = findings.map((f) => ({ ...f, _status: physioSeverityToStatus(f.severity) }));
  const list = filter === "all" ? enriched : enriched.filter((f) => f._status === filter);

  return (
    <div className="space-y-5">
      <StatusFilterBar value={filter} onChange={setFilter} />
      {list.length === 0 ? (
        <div className="text-xs text-muted-foreground">No matching findings.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((f, i) => {
            const cfg = STATUS_STYLES[f._status];
            return (
              <article
                key={i}
                className="surface-card bg-background p-4 border-l-4 transition-shadow hover:shadow-[var(--shadow-card)]"
                style={{ borderLeftColor: cfg.dot }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight">{f.region}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">
                      {f.test}
                    </div>
                  </div>
                  <span className={`pill ${cfg.cls} px-2 py-0.5 text-[11px] font-semibold shrink-0`}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: cfg.dot }} />
                    {f._status}
                  </span>
                </div>

                <p className="mt-2 text-xs text-foreground/80 leading-relaxed">{f.finding}</p>

                {f.rom && f.rom.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {f.rom.map((r) => (
                      <div key={r.motion} className="rounded-md bg-surface px-2 py-1.5">
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {r.motion}
                        </div>
                        <div className="text-xs font-semibold tabular-nums mt-0.5">{r.value}</div>
                        <div className="text-[9px] text-muted-foreground">normal {r.normal}</div>
                      </div>
                    ))}
                  </div>
                )}

                {f.recommendation && (
                  <div className="mt-2 rounded-md bg-surface px-2 py-1.5 text-xs">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-1.5">Plan</span>
                    {f.recommendation}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

const GenericReportInline = ({ r }: { r: ReportCardData }) => (
  <div className="space-y-5">
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm text-foreground/80">{r.summary}</p>
      <StatusPill status={r.status} />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {r.metrics.map((m) => {
        const parsed = parseMetric(m.value);
        return (
          <MetricTrendCard
            key={m.label}
            name={m.label}
            display={parsed.display}
            unit={parsed.unit}
            value={parsed.value}
            currentDate={r.date}
          />
        );
      })}
    </div>
  </div>
);

export const ReportInline = ({ r }: { r: ReportCardData }) => {
  const { id } = useParams();
  const profile = getPatientProfile(id);

  const body = (() => {
    if (r.key === "blood-tests") return <BloodTestsInline bloodTests={profile.bloodTests} />;
    if (r.key === "body-composition" && r.bodyComposition) return <BodyCompositionInline markers={r.bodyComposition} />;
    if (r.key === "user-survey" && r.surveyAnswers) return <UserSurveyInline answers={r.surveyAnswers} />;
    if (r.key === "physio-assessment" && r.physioFindings) return <PhysioInline findings={r.physioFindings} />;
    if (r.key === "wearable-data" && r.wearableMetrics) return <WearableClinicalReport metrics={r.wearableMetrics} />;
    return <GenericReportInline r={r} />;
  })();

  return <div className="space-y-5">{body}</div>;
};
