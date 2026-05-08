import { Fragment, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, ChevronRight, Sparkles, FileText, Eye, CheckCircle2, Loader2, Bell, BellRing } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ContextSwitchers } from "@/components/brand/ContextSwitchers";
import { TrendIndicator } from "@/components/brand/TrendIndicator";
import { EngagementTrendPopover } from "@/components/brand/EngagementTrendPopover";
import { StatusPill } from "@/components/brand/StatusPill";
import { patients, patientProfiles, type PatientRow } from "@/lib/data";
import { NudgeDialog } from "@/components/admin/NudgeDialog";
import { NudgeButton } from "@/components/admin/NudgeButton";
import { NUDGE_CATEGORIES, type NudgeCategoryId } from "@/lib/nudge-templates";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

type Slug = "incomplete-plans" | "low-engagement" | "high-risk";
type SimpleStatus = "Complete" | "Incomplete" | "Missing";

const titleMap: Record<Slug, { title: string; stat: number; trend: number }> = {
  "incomplete-plans": { title: "Plans",          stat: 12, trend: -8 },
  "low-engagement":   { title: "Low activity", stat: 43, trend: 15 },
  "high-risk":        { title: "High risk",      stat: 78, trend: -8 },
};

// Normalize: "Requires adjustment" → "Incomplete"
const normalize = (s: string): SimpleStatus =>
  s === "Complete" ? "Complete" : s === "Missing" ? "Missing" : "Incomplete";

// Plan score derived from meal status + recent engagement (deterministic)
const computeScore = (p: PatientRow, status: SimpleStatus): number => {
  const base = status === "Complete" ? 82 : status === "Incomplete" ? 48 : 18;
  const adj = Math.round((p.last14 - 50) * 0.2);
  return Math.max(5, Math.min(100, base + adj));
};

// ─── Risk scoring (0–100, higher = more risk) ──────────────────────────────
// Physiological: derived from clinical conditions on the patient profile.
// Behavioral: derived from recent engagement/adherence (last14 + trend).
const physiologicalRisk = (p: PatientRow): number => {
  const profile = patientProfiles[p.id];
  const conds = profile?.meta.conditions ?? [];
  const heavy = /diabet|hyperten|insulin|cardio|ldl|copd/i;
  const moderate = /pcos|asthma|tendin|impinge|back|achilles|recovery|sedentary|postpartum/i;
  let score = 20;
  conds.forEach((c) => {
    if (heavy.test(c)) score += 28;
    else if (moderate.test(c)) score += 14;
    else score += 8;
  });
  if (profile?.meta.bioAge && profile.meta.age && profile.meta.bioAge > profile.meta.age) {
    score += (profile.meta.bioAge - profile.meta.age) * 3;
  }
  return Math.max(5, Math.min(100, score));
};

const behavioralRisk = (p: PatientRow): number => {
  // Lower engagement → higher risk. Negative trend amplifies.
  let score = 100 - p.last14;
  score -= p.trendPct * 0.6; // up trend reduces risk
  return Math.max(5, Math.min(100, Math.round(score)));
};

// Risk category: low (<40), mid (40–66), high (≥67)
type RiskCat = "low" | "mid" | "high";
const riskCat = (n: number): RiskCat => (n >= 67 ? "high" : n >= 40 ? "mid" : "low");
const riskCatLabel: Record<RiskCat, string> = { low: "Low", mid: "Mid", high: "High" };

const riskTone = (n: number) =>
  n >= 67 ? "text-[hsl(var(--status-critical-fg))]"
  : n >= 40 ? "text-[hsl(var(--status-attention-fg))]"
  : "text-[hsl(var(--status-optimal-fg))]";

const riskPillClass = (n: number) =>
  n >= 67 ? "bg-[hsl(var(--status-critical-fg)/0.12)] text-[hsl(var(--status-critical-fg))]"
  : n >= 40 ? "bg-[hsl(var(--status-attention-fg)/0.12)] text-[hsl(var(--status-attention-fg))]"
  : "bg-[hsl(var(--status-optimal-fg)/0.12)] text-[hsl(var(--status-optimal-fg))]";

const scoreTone = (n: number) =>
  n >= 75 ? "text-[hsl(var(--status-optimal-fg))]"
  : n >= 50 ? "text-[hsl(var(--status-attention-fg))]"
  : "text-[hsl(var(--status-critical-fg))]";

// AI summary derived from patient profile
const buildAINote = (p: PatientRow, regenerated = false): string => {
  const profile = patientProfiles[p.id];
  if (!profile) {
    return regenerated
      ? `Plan refreshed for ${p.name}. Took into account latest engagement (${p.last14}%) and adherence trend.`
      : `${p.name} requires a baseline assessment before a personalised plan can be generated.`;
  }
  const cond = profile.meta.conditions.join(", ") || "no flagged conditions";
  const top  = profile.insights[0]?.issue ?? "general wellbeing";
  if (regenerated) {
    return `Plan regenerated for ${p.name}. Took into account ${cond.toLowerCase()}, "${top.toLowerCase()}", and recent adherence (${p.last14}%). Macros, training volume and recovery windows have been re-balanced.`;
  }
  return `${p.name}: ${cond}. Primary signal — ${top.toLowerCase()}. Adherence trending ${p.trendPct >= 0 ? "up" : "down"} (${p.last14}% over 14d).`;
};

// ─── Compact meal plan summary for the View plan modal ─────────────────────
type ModalMeal = { name: string; portion: string; kcal: number; p: number; c: number; f: number; notes?: string };
type ModalDay  = { day: string; type: string; meals: ModalMeal[] };

const samplePlanWeek: ModalDay[] = [
  { day: "MON", type: "Fuelling Day", meals: [
    { name: "Greek yogurt + berries + walnuts", portion: "300 g + 100 g + 20 g", kcal: 480, p: 32, c: 38, f: 22, notes: "Protein-first breakfast." },
    { name: "Chicken & quinoa bowl", portion: "180 g + 120 g cooked", kcal: 620, p: 48, c: 70, f: 14, notes: "Pre-training carbs." },
    { name: "Whey + banana", portion: "30 g + 1 medium", kcal: 270, p: 28, c: 32, f: 3,  notes: "Post-lift recovery." },
    { name: "Salmon + roasted veg", portion: "180 g + 250 g", kcal: 580, p: 42, c: 28, f: 30, notes: "Omega-3, low evening starch." },
  ]},
  { day: "TUE", type: "Fuelling Day", meals: [
    { name: "Veggie omelette (3 eggs)", portion: "3 eggs + 100 g spinach", kcal: 420, p: 28, c: 8,  f: 30 },
    { name: "Lentil soup + sourdough",  portion: "350 ml + 60 g", kcal: 540, p: 24, c: 78, f: 10 },
    { name: "Cottage cheese + apple",   portion: "200 g + 1", kcal: 290, p: 26, c: 30, f: 6 },
    { name: "Steak + asparagus + sweet potato", portion: "180 g + 200 g + 150 g", kcal: 700, p: 52, c: 45, f: 28 },
  ]},
  { day: "WED", type: "Rest Day", meals: [
    { name: "Smoked salmon + avocado toast", portion: "100 g + ½ avo + 60 g bread", kcal: 560, p: 28, c: 38, f: 32 },
    { name: "Greens bowl + chicken", portion: "300 g + 150 g", kcal: 520, p: 44, c: 30, f: 22 },
    { name: "Cod + ratatouille", portion: "200 g + 250 g", kcal: 480, p: 42, c: 22, f: 22 },
  ]},
  { day: "THU", type: "Fuelling Day", meals: [
    { name: "Overnight oats + whey + berries", portion: "60 g + 25 g + 100 g", kcal: 520, p: 34, c: 70, f: 10 },
    { name: "Turkey wrap + side salad", portion: "150 g + 1 wrap + 100 g", kcal: 560, p: 42, c: 50, f: 18 },
    { name: "Rice cakes + nut butter", portion: "2 + 20 g", kcal: 220, p: 6, c: 32, f: 8 },
    { name: "Chicken stir-fry + jasmine rice", portion: "180 g + 120 g", kcal: 680, p: 48, c: 78, f: 16 },
  ]},
  { day: "FRI", type: "Fuelling Day", meals: [
    { name: "Eggs + smoked salmon + tomato", portion: "3 eggs + 60 g + 1", kcal: 460, p: 36, c: 8,  f: 30 },
    { name: "Tuna & white-bean salad", portion: "150 g + 120 g", kcal: 520, p: 42, c: 48, f: 14 },
    { name: "Greek yogurt + honey", portion: "200 g + 10 g", kcal: 240, p: 18, c: 28, f: 6 },
    { name: "Lamb kofta + tabbouleh", portion: "180 g + 200 g", kcal: 720, p: 46, c: 50, f: 32 },
  ]},
  { day: "SAT", type: "Active Recovery", meals: [
    { name: "Shakshuka + sourdough", portion: "2 eggs + 60 g", kcal: 620, p: 30, c: 58, f: 28 },
    { name: "Mezze plate", portion: "~500 g", kcal: 720, p: 28, c: 70, f: 36 },
    { name: "Grilled fish + greens", portion: "180 g + 250 g", kcal: 480, p: 42, c: 18, f: 24 },
  ]},
  { day: "SUN", type: "Rest Day", meals: [
    { name: "Berry protein smoothie", portion: "30 g whey + 150 g fruit", kcal: 360, p: 32, c: 42, f: 6 },
    { name: "Roast chicken + cauliflower", portion: "180 g + 250 g", kcal: 620, p: 52, c: 24, f: 32 },
    { name: "Soup + side salad", portion: "350 ml + 100 g", kcal: 380, p: 22, c: 38, f: 14 },
  ]},
];

const dayTotals = (meals: ModalMeal[]) =>
  meals.reduce((a, m) => ({ kcal: a.kcal + m.kcal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }), { kcal: 0, p: 0, c: 0, f: 0 });

// ─── Per-row AI generation indicator ───────────────────────────────────────
// Shown in the Meal Plan Status cell while the batch processes that patient.
// Uses a small spinning ring for the row currently being generated and a
// muted dashed ring for queued rows further down the list.
const PlanGenIndicator = ({ state }: { state: "queued" | "running" }) => {
  if (state === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[hsl(var(--brand-blue))] animate-fade-in">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Generating
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/80">
      <span className="h-3 w-3 rounded-full border border-dashed border-muted-foreground/60" />
      Queued
    </span>
  );
};

const AdminTable = () => {
  const { slug } = useParams<{ slug: Slug }>();
  const key: Slug = (slug && slug in titleMap ? slug : "incomplete-plans") as Slug;
  const meta = titleMap[key];
  const isPlans = key === "incomplete-plans";
  const isRisk  = key === "high-risk";

  // ── Plans-only state ──────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<"all" | SimpleStatus>("all");
  const [scoreFilter,  setScoreFilter]  = useState<"all" | "high" | "med" | "low">("all");
  const [expanded,     setExpanded]     = useState<Record<string, boolean>>({});
  const [selected,     setSelected]     = useState<Record<string, boolean>>({});
  const [regenerated,  setRegenerated]  = useState<Record<string, boolean>>({});
  const [assigned,     setAssigned]     = useState<Record<string, boolean>>({});
  const [viewPlanFor,  setViewPlanFor]  = useState<string | null>(null);
  // Per-row AI generation status used to show a top-to-bottom progress indicator.
  // "queued" = waiting in the batch, "running" = currently being generated, undefined = idle/done.
  const [genStatus, setGenStatus] = useState<Record<string, "queued" | "running">>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Risk-only filters ─────────────────────────────────────────────────────
  const [physFilter,    setPhysFilter]    = useState<"all" | RiskCat>("all");
  const [behFilter,     setBehFilter]     = useState<"all" | RiskCat>("all");
  const [overallFilter, setOverallFilter] = useState<"all" | RiskCat>("all");

  // ── Nudge state (Risk + Low Activity) ─────────────────────────────────────
  const [nudgedAt, setNudgedAt] = useState<Record<string, { ts: number; category: NudgeCategoryId }>>({});
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const [nudgeTargets, setNudgeTargets] = useState<PatientRow[]>([]);
  const [nudgeDefault, setNudgeDefault] = useState<NudgeCategoryId>("movement");

  const openNudgeFor = (targets: PatientRow[], defaultCat: NudgeCategoryId = "movement") => {
    if (targets.length === 0) return;
    setNudgeTargets(targets);
    setNudgeDefault(defaultCat);
    setNudgeOpen(true);
  };

  const handleNudgeSent = (category: NudgeCategoryId, patientIds: string[]) => {
    const ts = Date.now();
    setNudgedAt((prev) => {
      const next = { ...prev };
      patientIds.forEach((id) => (next[id] = { ts, category }));
      return next;
    });
    setSelected({});
  };

  // Smart-default category for the Risk table — the patient's weakest signal.
  const riskDefaultCat = (rows: { phys: number; beh: number }[]): NudgeCategoryId => {
    if (rows.length === 0) return "movement";
    const behHeavy = rows.filter((r) => r.beh >= r.phys).length;
    return behHeavy >= rows.length / 2 ? "movement" : "adherence";
  };

  // Format "nudged Xm ago" — keeps it minimal and only re-renders on state changes.
  const nudgedLabel = (id: string): string | null => {
    const n = nudgedAt[id];
    if (!n) return null;
    const cat = NUDGE_CATEGORIES.find((c) => c.id === n.category)?.label ?? "";
    const mins = Math.max(0, Math.round((Date.now() - n.ts) / 60000));
    const when = mins < 1 ? "just now" : `${mins}m ago`;
    return `nudged ${when} · ${cat}`;
  };

  const riskRows = useMemo(() => {
    return patients.map((p) => {
      const phys = physiologicalRisk(p);
      const beh  = behavioralRisk(p);
      const overall = Math.round((phys + beh) / 2);
      return { patient: p, phys, beh, overall };
    });
  }, []);

  const filteredRiskRows = useMemo(() => {
    return riskRows.filter((r) => {
      if (physFilter    !== "all" && riskCat(r.phys)    !== physFilter)    return false;
      if (behFilter     !== "all" && riskCat(r.beh)     !== behFilter)     return false;
      if (overallFilter !== "all" && riskCat(r.overall) !== overallFilter) return false;
      return true;
    });
  }, [riskRows, physFilter, behFilter, overallFilter]);

  // Build derived plan rows (only meal status retained per requirement)
  const planRows = useMemo(() => {
    return patients.map((p) => {
      const status: SimpleStatus = regenerated[p.id] ? "Complete" : normalize(p.meal);
      const score = regenerated[p.id]
        ? Math.max(78, computeScore(p, status))
        : computeScore(p, status);
      return {
        patient: p,
        status,
        score,
        note: buildAINote(p, !!regenerated[p.id]),
      };
    });
  }, [regenerated]);

  const filteredRows = useMemo(() => {
    return planRows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (scoreFilter === "high" && r.score < 75) return false;
      if (scoreFilter === "med"  && (r.score < 50 || r.score >= 75)) return false;
      if (scoreFilter === "low"  && r.score >= 50) return false;
      return true;
    });
  }, [planRows, statusFilter, scoreFilter]);

  const planBreakdown = isPlans
    ? (["Complete", "Incomplete", "Missing"] as SimpleStatus[]).map((label) => ({
        label,
        value: planRows.filter((r) => r.status === label).length,
      }))
    : [];

  const totalPlans = planRows.length;

  // Visible patient ids for the active table — used by select-all + bulk nudge
  const visibleIds = useMemo(() => {
    if (isPlans) return filteredRows.map((r) => r.patient.id);
    if (isRisk)  return filteredRiskRows.map((r) => r.patient.id);
    return patients.map((p) => p.id);
  }, [isPlans, isRisk, filteredRows, filteredRiskRows]);

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    if (checked) visibleIds.forEach((id) => (next[id] = true));
    setSelected(next);
  };

  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected[id]);
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const selectedPatients = useMemo(
    () => patients.filter((p) => selected[p.id]),
    [selected],
  );

  const bulkGenerate = async () => {
    if (isGenerating) return;
    const ids = selectedCount > 0
      ? Object.keys(selected).filter((id) => selected[id])
      : filteredRows.map((r) => r.patient.id);
    if (ids.length === 0) return;

    setIsGenerating(true);
    // Mark every patient queued so the user sees the full pipeline upfront.
    const initial: Record<string, "queued" | "running"> = {};
    ids.forEach((id) => (initial[id] = "queued"));
    setGenStatus(initial);

    // Process top-to-bottom, one patient at a time, with a small delay so the
    // clinician can see the AI working through each plan.
    for (const id of ids) {
      setGenStatus((prev) => ({ ...prev, [id]: "running" }));
      // Small jittered delay (~700–1100ms) to feel like real AI work per user.
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 400));
      setRegenerated((prev) => ({ ...prev, [id]: true }));
      setGenStatus((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    setIsGenerating(false);
  };

  const expandedCount = Object.values(expanded).filter(Boolean).length;
  const collapseAll = () => setExpanded({});
  const expandAll = () => {
    const e: Record<string, boolean> = {};
    filteredRows.forEach((r) => (e[r.patient.id] = true));
    setExpanded(e);
  };

  const bulkAssign = () => {
    const ids = selectedCount > 0
      ? Object.keys(selected).filter((id) => selected[id])
      : filteredRows.filter((r) => regenerated[r.patient.id]).map((r) => r.patient.id);
    if (ids.length === 0) return;
    const next = { ...assigned };
    ids.forEach((id) => (next[id] = true));
    setAssigned(next);
    setSelected({});
  };

  const generatedCount = filteredRows.filter((r) => regenerated[r.patient.id] && !assigned[r.patient.id]).length;

  return (
    <AppShell user="Sajeda Ayesh">
      <div className="max-w-6xl mx-auto">
        <div className="pt-2">
          <ContextSwitchers />
        </div>

        <div className="mt-10 surface-card p-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-end gap-8 flex-wrap">
              <div>
                <div className="text-5xl font-bold tabular-nums">{isPlans ? totalPlans : meta.stat}</div>
                <div className="text-muted-foreground text-lg mt-2">{meta.title}</div>
              </div>

              {isPlans && (
                <div className="flex items-center gap-5 pb-1.5 animate-fade-in">
                  {planBreakdown.map((b, i) => (
                    <div key={b.label} className="flex items-center gap-5">
                      {i > 0 && <span className="h-8 w-px bg-border" aria-hidden />}
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {b.label}
                        </span>
                        <span className="text-xl font-semibold tabular-nums text-foreground/90 leading-tight mt-0.5">
                          {b.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <TrendIndicator pct={meta.trend} />
          </div>

          {/* Plans toolbar */}
          {isPlans && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Status</span>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Incomplete">Incomplete</SelectItem>
                    <SelectItem value="Missing">Missing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Plan score</span>
                <Select value={scoreFilter} onValueChange={(v) => setScoreFilter(v as typeof scoreFilter)}>
                  <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All scores</SelectItem>
                    <SelectItem value="high">High (75–100)</SelectItem>
                    <SelectItem value="med">Medium (50–74)</SelectItem>
                    <SelectItem value="low">Low (&lt; 50)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-auto inline-flex items-center gap-2">
                <button
                  onClick={expandedCount > 0 ? collapseAll : expandAll}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border border-border bg-background hover:bg-surface transition-colors text-muted-foreground hover:text-foreground"
                  title={expandedCount > 0 ? "Collapse all AI notes" : "Expand all AI notes"}
                >
                  {expandedCount > 0
                    ? <><ChevronDown className="h-3.5 w-3.5" /> Collapse all</>
                    : <><ChevronRight className="h-3.5 w-3.5" /> Expand all</>}
                </button>
                <button
                  onClick={bulkGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border border-border bg-background hover:bg-surface transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Generate plans for selected patients (or all filtered)"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? "animate-pulse" : ""}`} />
                  {isGenerating ? "Generating…" : "Generate"}
                  {!isGenerating && selectedCount > 0 && (
                    <span className="tabular-nums opacity-70">({selectedCount})</span>
                  )}
                  {isGenerating && (
                    <span className="tabular-nums opacity-70">
                      ({Object.keys(genStatus).length} left)
                    </span>
                  )}
                </button>
                <button
                  onClick={bulkAssign}
                  disabled={selectedCount === 0 && generatedCount === 0}
                  className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Assign generated plans to patient profiles"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Assign
                  {selectedCount > 0
                    ? <span className="tabular-nums opacity-80">({selectedCount})</span>
                    : generatedCount > 0 && <span className="tabular-nums opacity-80">({generatedCount})</span>}
                </button>
              </div>
            </div>
          )}

          {/* Risk toolbar */}
          {isRisk && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {([
                ["Physiological", physFilter, setPhysFilter] as const,
                ["Behavioral",    behFilter,  setBehFilter] as const,
                ["Overall",       overallFilter, setOverallFilter] as const,
              ]).map(([label, val, setter]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
                  <Select value={val} onValueChange={(v) => (setter as (v: "all" | RiskCat) => void)(v as "all" | RiskCat)}>
                    <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="low">Low (&lt; 40)</SelectItem>
                      <SelectItem value="mid">Mid (40–66)</SelectItem>
                      <SelectItem value="high">High (≥ 67)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="ml-auto inline-flex items-center gap-2">
                {(physFilter !== "all" || behFilter !== "all" || overallFilter !== "all") && (
                  <button
                    onClick={() => { setPhysFilter("all"); setBehFilter("all"); setOverallFilter("all"); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear filters
                  </button>
                )}
                <button
                  onClick={() => {
                    const targets = selectedCount > 0 ? selectedPatients : filteredRiskRows.map((r) => r.patient);
                    const cat = riskDefaultCat(
                      filteredRiskRows.filter((r) => (selectedCount > 0 ? selected[r.patient.id] : true)),
                    );
                    openNudgeFor(targets, cat);
                  }}
                  disabled={filteredRiskRows.length === 0}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Send a health nudge to selected patients (or all filtered)"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Send nudge
                  {selectedCount > 0 && <span className="tabular-nums opacity-80">({selectedCount})</span>}
                </button>
              </div>
            </div>
          )}

          {/* Low Activity toolbar */}
          {!isPlans && !isRisk && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                {patients.length} patients
              </span>
              <div className="ml-auto inline-flex items-center gap-2">
                <button
                  onClick={() => {
                    const targets = selectedCount > 0 ? selectedPatients : patients;
                    openNudgeFor(targets, "movement");
                  }}
                  disabled={patients.length === 0}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Send a health nudge to selected patients (or all filtered)"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Send nudge
                  {selectedCount > 0 && <span className="tabular-nums opacity-80">({selectedCount})</span>}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-foreground">
                  <th className="font-semibold py-3 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="h-3.5 w-3.5 accent-foreground cursor-pointer"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="font-semibold py-3">Name</th>
                  <th className="font-semibold py-3">Company</th>
                  {isPlans ? (
                    <>
                      <th className="font-semibold py-3 text-center">Meal Plan Status</th>
                      <th className="font-semibold py-3 text-center">Plan Score</th>
                      <th className="font-semibold py-3">AI Notes</th>
                      <th className="font-semibold py-3 text-center">View plan</th>
                    </>
                  ) : isRisk ? (
                    <>
                      <th className="font-semibold py-3 text-center">Physiological risk</th>
                      <th className="font-semibold py-3 text-center">Behavioral risk</th>
                      <th className="font-semibold py-3 text-center">Overall risk</th>
                      <th className="font-semibold py-3 text-center">Nudge</th>
                    </>
                  ) : (
                    <>
                      <th className="font-semibold py-3 text-center">Total Avg. points / day</th>
                      <th className="font-semibold py-3 text-center">Avg. points last 14 days</th>
                      <th className="font-semibold py-3 text-center">Engagement Trend</th>
                      <th className="font-semibold py-3 text-center">Nudge</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="row-sep">
                {isPlans
                  ? filteredRows.map((r) => {
                      const p = r.patient;
                      const isOpen = !!expanded[p.id];
                      return (
                        <Fragment key={p.id}>
                          <tr className="hover:bg-background/60 transition-colors align-top">
                            <td className="py-4">
                              <input
                                type="checkbox"
                                checked={!!selected[p.id]}
                                onChange={(e) =>
                                  setSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))
                                }
                                className="h-3.5 w-3.5 accent-foreground cursor-pointer"
                                aria-label={`Select ${p.name}`}
                              />
                            </td>
                            <td className="py-4">
                              <Link
                                to={`/patient/${p.id}/profile`}
                                className="text-[hsl(var(--brand-blue))] underline-offset-2 hover:underline font-medium"
                              >
                                {p.name}
                              </Link>
                            </td>
                            <td className="py-4">{p.company}</td>
                            <td className="py-4 text-center">
                              {genStatus[p.id] ? (
                                <PlanGenIndicator state={genStatus[p.id]} />
                              ) : (
                                <StatusPill status={r.status} />
                              )}
                            </td>
                            <td className="py-4 text-center">
                              <span className={`font-semibold tabular-nums ${scoreTone(r.score)}`}>{r.score}</span>
                              <span className="text-muted-foreground text-xs ml-0.5">/100</span>
                            </td>
                            <td className="py-4">
                              <button
                                onClick={() => setExpanded((prev) => ({ ...prev, [p.id]: !isOpen }))}
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                <FileText className="h-3.5 w-3.5" />
                                <span>{isOpen ? "Hide summary" : "View summary"}</span>
                                {regenerated[p.id] && (
                                  <span className="ml-1.5 text-[10px] uppercase tracking-wider text-[hsl(var(--status-optimal-fg))] font-semibold">
                                    Updated
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="py-4 text-center">
                              <button
                                onClick={() => setViewPlanFor(p.id)}
                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-surface text-foreground/80 hover:text-foreground transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View plan
                                {assigned[p.id] && (
                                  <span className="ml-1 text-[10px] uppercase tracking-wider text-[hsl(var(--status-optimal-fg))] font-semibold">
                                    Assigned
                                  </span>
                                )}
                              </button>
                            </td>
                          </tr>
                          {isOpen && (
                            <tr className="bg-background/40">
                              <td />
                              <td colSpan={6} className="py-3 pr-4">
                                <div className="text-xs text-foreground/80 leading-relaxed border-l-2 border-border pl-3 max-w-3xl">
                                  {r.note}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  : isRisk
                  ? filteredRiskRows.map(({ patient: p, phys, beh, overall }) => {
                      // Category-only cell (no numeric score) for phys/beh
                      const catCell = (n: number) => (
                        <td className="py-4 text-center">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${riskPillClass(n)}`}>
                            {riskCatLabel[riskCat(n)]}
                          </span>
                        </td>
                      );
                      // Overall: numeric only (no label), color-toned
                      const overallCell = (n: number) => (
                        <td className="py-4 text-center">
                          <span className={`font-semibold tabular-nums ${riskTone(n)}`}>{n}</span>
                          <span className="text-muted-foreground text-xs ml-0.5">/100</span>
                        </td>
                      );
                      const nLabel = nudgedLabel(p.id);
                      return (
                        <tr key={p.id} className="hover:bg-background/60 transition-colors align-top">
                          <td className="py-4">
                            <input
                              type="checkbox"
                              checked={!!selected[p.id]}
                              onChange={(e) =>
                                setSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))
                              }
                              className="h-3.5 w-3.5 accent-foreground cursor-pointer"
                              aria-label={`Select ${p.name}`}
                            />
                          </td>
                          <td className="py-4">
                            <Link
                              to={`/patient/${p.id}/profile`}
                              className="text-[hsl(var(--brand-blue))] underline-offset-2 hover:underline font-medium"
                            >
                              {p.name}
                            </Link>
                            {nLabel && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">{nLabel}</div>
                            )}
                          </td>
                          <td className="py-4">{p.company}</td>
                          {catCell(phys)}
                          {catCell(beh)}
                          {overallCell(overall)}
                          <td className="py-4 text-center">
                            <NudgeButton
                              nudged={!!nudgedAt[p.id]}
                              onClick={() => openNudgeFor([p], beh >= phys ? "movement" : "adherence")}
                            />
                          </td>
                        </tr>
                      );
                    })
                  : patients.map((p) => {
                      const nLabel = nudgedLabel(p.id);
                      return (
                        <tr key={p.id} className="hover:bg-background/60 transition-colors align-top">
                          <td className="py-4">
                            <input
                              type="checkbox"
                              checked={!!selected[p.id]}
                              onChange={(e) =>
                                setSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))
                              }
                              className="h-3.5 w-3.5 accent-foreground cursor-pointer"
                              aria-label={`Select ${p.name}`}
                            />
                          </td>
                          <td className="py-4">
                            <Link
                              to={`/patient/${p.id}/profile`}
                              className="text-[hsl(var(--brand-blue))] underline-offset-2 hover:underline font-medium"
                            >
                              {p.name}
                            </Link>
                            {nLabel && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">{nLabel}</div>
                            )}
                          </td>
                          <td className="py-4">{p.company}</td>
                          <td className="py-4 text-center">{p.totalAvg}</td>
                          <td className="py-4 text-center">{p.last14}</td>
                          <td className="py-4 text-center">
                            <div className="inline-block">
                              <EngagementTrendPopover
                                patientId={p.id}
                                patientName={p.name}
                                trendPct={p.trendPct}
                                currentAvg={p.last14}
                              />
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <NudgeButton
                              nudged={!!nudgedAt[p.id]}
                              onClick={() => openNudgeFor([p], "movement")}
                            />
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">← Back to dashboard</Link>
        </div>
      </div>

      {/* Nudge dialog */}
      <NudgeDialog
        open={nudgeOpen}
        onOpenChange={setNudgeOpen}
        patients={nudgeTargets}
        defaultCategory={nudgeDefault}
        onSent={handleNudgeSent}
      />

      {/* View plan modal */}
      <Dialog open={!!viewPlanFor} onOpenChange={(o) => !o && setViewPlanFor(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          {(() => {
            const row = planRows.find((r) => r.patient.id === viewPlanFor);
            if (!row) return null;
            const p = row.patient;
            const weekTotals = samplePlanWeek.reduce(
              (a, d) => {
                const t = dayTotals(d.meals);
                return { kcal: a.kcal + t.kcal, p: a.p + t.p, c: a.c + t.c, f: a.f + t.f };
              },
              { kcal: 0, p: 0, c: 0, f: 0 },
            );
            const avgKcal = Math.round(weekTotals.kcal / samplePlanWeek.length);
            return (
              <>
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <DialogTitle className="text-base">{p.name} — Meal plan</DialogTitle>
                      <DialogDescription className="text-xs mt-1">
                        {p.company} · 7-day plan · avg {avgKcal.toLocaleString()} kcal/day
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={row.status} />
                      <span className={`text-xs font-semibold tabular-nums ${scoreTone(row.score)}`}>
                        {row.score}<span className="text-muted-foreground font-normal">/100</span>
                      </span>
                    </div>
                  </div>
                </DialogHeader>

                <div className="overflow-y-auto px-6 py-5 space-y-5">
                  {samplePlanWeek.map((d) => {
                    const t = dayTotals(d.meals);
                    return (
                      <div key={d.day}>
                        <div className="flex items-baseline justify-between pb-2 border-b border-border/60">
                          <div className="inline-flex items-baseline gap-2">
                            <span className="text-[11px] tracking-wider font-semibold text-muted-foreground">{d.day}</span>
                            <span className="text-sm font-medium">{d.type}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground tabular-nums font-mono">
                            {t.kcal} kcal · P{t.p} · C{t.c} · F{t.f}
                          </div>
                        </div>
                        <ul className="divide-y divide-border/50">
                          {d.meals.map((m, i) => (
                            <li key={i} className="flex items-start justify-between gap-4 py-2.5">
                              <div className="min-w-0">
                                <div className="text-sm font-medium leading-snug truncate">{m.name}</div>
                                <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">{m.portion}</div>
                                {m.notes && (
                                  <div className="text-[11px] text-muted-foreground/80 leading-snug mt-1">{m.notes}</div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-sm font-semibold tabular-nums">
                                  {m.kcal}
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal ml-1">kcal</span>
                                </div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums font-mono whitespace-nowrap">
                                  P{m.p} · C{m.c} · F{m.f}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                <div className="px-6 py-3 border-t border-border flex items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground leading-snug max-w-md">
                    {row.note}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewPlanFor(null)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-surface"
                    >
                      Close
                    </button>
                    {regenerated[p.id] && !assigned[p.id] && (
                      <button
                        onClick={() => { setAssigned((prev) => ({ ...prev, [p.id]: true })); setViewPlanFor(null); }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-foreground text-background hover:opacity-90"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Assign to patient
                      </button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default AdminTable;
