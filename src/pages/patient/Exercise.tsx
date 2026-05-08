import { ChevronDown, ChevronUp, Copy, Edit3, FileText, Grid3x3, MoreHorizontal, RefreshCw, Send, Sparkles, Trash2, Dumbbell, Activity, Zap, Target, Footprints, Moon, HeartPulse, ShieldAlert, Heart, Clock, Award, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { weekPlan, type DayPlan, getPatientProfile, patients } from "@/lib/data";
import { toast } from "@/hooks/use-toast";
import { CountUp } from "@/components/brand/CountUp";
import { WorkoutDashboard } from "@/components/workout-dashboard";
import { ExerciseGifPopover } from "@/components/patient/ExerciseGifPopover";
import { PlanContextCards, type PlanContextItem } from "@/components/patient/PlanContextCards";
import { PhysioAssessment } from "@/components/patient/PhysioAssessment";
import { NotifyUserDialog } from "@/components/patient/NotifyUserDialog";
import { buildExercisePdf } from "@/lib/plan-pdf";
import { PdfPreviewDialog } from "@/components/patient/PdfPreviewDialog";
import { ExerciseGoalCard, type ExerciseGoals, defaultExerciseGoals } from "@/components/patient/ExerciseGoalCard";

// Monochrome tag tone — all source tags share the neutral surface treatment.
const tagTone: Record<string, string> = {
  inbody:   "bg-surface text-foreground border border-border",
  blood:    "bg-surface text-foreground border border-border",
  wearable: "bg-surface text-foreground border border-border",
  ortho:    "bg-surface text-foreground border border-border",
  athlete:  "bg-surface text-foreground border border-border",
};

// Monochrome day pill — all days share the same b/w styling; rest is dimmed.
const dayTone: Record<string, string> = {
  chest:    "bg-surface text-foreground border border-border",
  back:     "bg-surface text-foreground border border-border",
  shoulder: "bg-surface text-foreground border border-border",
  arms:     "bg-surface text-foreground border border-border",
  leg:      "bg-surface text-foreground border border-border",
  rest:     "bg-surface text-muted-foreground border border-border opacity-70",
};

// Mini icon per day type (replaces color-coding).
const dayIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  chest:    Dumbbell,
  back:     Activity,
  shoulder: Zap,
  arms:     Target,
  leg:      Footprints,
  rest:     Moon,
};

const altPlan: DayPlan[] = weekPlan.map((d) => {
  if (d.tone === "rest") return d;
  const swaps: Record<string, DayPlan["exercises"]> = {
    chest:    [{ name: "Flat Barbell Bench", sets: "4 × 6–8" }, { name: "Incline DB Fly", sets: "3 × 12" }, { name: "Dip (assisted)", sets: "3 × 10" }],
    back:     [{ name: "Chest-Supported Row", sets: "4 × 10" }, { name: "Single-Arm Pulldown", sets: "3 × 12" }, { name: "Reverse Fly", sets: "3 × 15" }],
    shoulder: [{ name: "Arnold Press", sets: "4 × 10" }, { name: "Cable Lateral", sets: "3 × 15" }, { name: "Upright Row", sets: "3 × 12" }],
    arms:     [{ name: "Preacher Curl", sets: "4 × 10" }, { name: "Overhead Tricep Ext", sets: "4 × 12" }, { name: "Cable Curl", sets: "3 × 15" }],
    leg:      [{ name: "Hack Squat (partial)", sets: "4 × 8" }, { name: "Hip Thrust", sets: "3 × 10" }, { name: "Calf Raise", sets: "3 × 15" }],
  };
  return { ...d, exercises: swaps[d.tone] ?? d.exercises };
});

type DiffMap = Record<string, "added" | "removed" | "swapped" | undefined>;

// ─── Plan-context cards (editable): Heart Rate Strategy, Injuries & Constraints, Exercise ───
const initialHeartRate: PlanContextItem[] = [
  { title: "Resting Heart Rate",   body: "50 bpm (athletic baseline) — wearable confirms strong aerobic conditioning." },
  { title: "Max HR (estimated)",   body: "~189 bpm (220 − 31). Use for zone calculations below." },
  { title: "Zone 2 — Aerobic Base", body: "113–132 bpm (60–70%). Target for football conditioning and recovery sessions." },
  { title: "Zone 4 — Threshold",   body: "151–170 bpm (80–90%). Cap weekly time-in-zone at 45 min to manage cardiac load." },
  { title: "Recovery Rule",        body: "HR must drop ≥25 bpm within 60 s post-set; if not, extend rest to 2:30 between heavy sets." },
];

const initialInjuries: PlanContextItem[] = [
  { title: "Right Knee — ACL (post-rehab)", body: "Avoid deep loaded knee flexion past 90°. Prefer hack squat partials, leg press, hip thrust over back squat." },
  { title: "Lower Back Sensitivity",        body: "No conventional deadlift from floor. Use trap bar or rack pulls from mid-shin; brace cues every set." },
  { title: "Right Shoulder Impingement",    body: "Replace barbell overhead press with neutral-grip DB press. Lateral raises to 80° max ROM." },
  { title: "Smoking Status",                body: "Active smoker — cap continuous Zone 4 work to 8 min blocks; insert 2 min Zone 2 floats between." },
];

const initialExercise: PlanContextItem[] = [
  { title: "Weekly Volume",      body: "5 sessions/week — 3 strength (push / pull / legs) + 2 football (Tue/Sat). Mandatory full rest on Sunday." },
  { title: "Strength Anchors",   body: "Bench Press, Chest-Supported Row, Hip Thrust — progress 2.5 kg/week or +1 rep when RPE ≤7." },
  { title: "Conditioning",       body: "1× Zone 2 (40 min easy bike or run) + football match Saturday. Skip if HRV down >15% from 7-day avg." },
  { title: "Mobility & Prehab",  body: "10 min daily: 90/90 hip CARs, banded shoulder dislocates, single-leg balance — supports knee + shoulder." },
  { title: "Progression Logic",  body: "Deload week every 5th week (volume −40%). Re-test 5RM bench & hip thrust at start of each block." },
];

const Exercise = () => {
  const [tab, setTab] = useState<"plan" | "create" | "physio">("plan");
  const [heartRate, setHeartRate] = useState<PlanContextItem[]>(initialHeartRate);
  const [injuries, setInjuries] = useState<PlanContextItem[]>(initialInjuries);
  const [exerciseCtx, setExerciseCtx] = useState<PlanContextItem[]>(initialExercise);
  const [plan, setPlan] = useState<DayPlan[]>(weekPlan);
  const [version, setVersion] = useState(1);
  const [score, setScore] = useState(43);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffMap>({});
  const [pending, setPending] = useState<null | { label: string; apply: () => void }>(null);

  const { id } = useParams();
  const patientRow = patients.find((p) => p.id === id) ?? patients[0];
  const patientProfile = getPatientProfile(id);

  // clear diff highlight after 4s
  useEffect(() => {
    if (Object.keys(diff).length === 0) return;
    const t = setTimeout(() => setDiff({}), 4000);
    return () => clearTimeout(t);
  }, [diff]);

  const regenerate = () => {
    setPending({
      label: "Regenerate workout plan with AI",
      apply: () => {
        setGenerating(true);
        setTimeout(() => {
          const next = version % 2 === 1 ? altPlan : weekPlan;
          const d: DiffMap = {};
          next.forEach((day) => {
            const before = plan.find((p) => p.day === day.day);
            if (!before) return;
            const beforeNames = new Set(before.exercises.map((e) => e.name));
            const afterNames  = new Set(day.exercises.map((e) => e.name));
            day.exercises.forEach((ex) => {
              if (!beforeNames.has(ex.name)) d[`${day.day}::${ex.name}`] = "added";
            });
            before.exercises.forEach((ex) => {
              if (!afterNames.has(ex.name)) d[`${day.day}::removed::${ex.name}`] = "removed";
            });
          });
          setDiff(d);
          setPlan(next);
          setVersion((v) => v + 1);
          setScore((s) => Math.min(96, s + 18 + Math.floor(Math.random() * 10)));
          setGenerating(false);
          toast({ title: "Plan regenerated", description: `New v${version + 1} — changes highlighted briefly.` });
        }, 600);
      },
    });
  };

  const reorder = (fromDay: string, toDay: string) => {
    if (fromDay === toDay) return;
    const fromIdx = plan.findIndex((p) => p.day === fromDay);
    const toIdx = plan.findIndex((p) => p.day === toDay);
    if (fromIdx < 0 || toIdx < 0) return;
    setPending({
      label: `Swap workout days · ${fromDay} ↔ ${toDay}`,
      apply: () => {
        const next = [...plan];
        [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
        setPlan(next);
        toast({ title: "Days swapped", description: `${fromDay} ↔ ${toDay}` });
      },
    });
  };

  const duplicate = (day: string) => {
    const src = plan.find((p) => p.day === day);
    if (!src) return;
    const idx = plan.findIndex((p) => p.day === day);
    const targetIdx = (idx + 1) % plan.length;
    setMenuFor(null);
    setPending({
      label: `Duplicate workout · ${src.type} → ${plan[targetIdx].day}`,
      apply: () => {
        const next = [...plan];
        next[targetIdx] = { ...next[targetIdx], type: src.type, tone: src.tone, exercises: [...src.exercises], count: src.count };
        setPlan(next);
        toast({ title: "Day duplicated", description: `${src.type} copied to ${next[targetIdx].day}` });
      },
    });
  };

  const clear = (day: string) => {
    setMenuFor(null);
    setPending({
      label: `Clear workout for ${day}`,
      apply: () => {
        const next = plan.map((p) => p.day === day ? { ...p, type: "Rest Day", tone: "rest" as const, exercises: [], count: 0 } : p);
        setPlan(next);
        toast({ title: "Day cleared", description: day });
      },
    });
  };

  const publishPlan = () => {
    setPending({
      label: `Publish workout plan v${version} to ${patientRow.name}`,
      apply: () => toast({ title: "Plan published", description: `v${version} sent to patient.` }),
    });
  };

  const [pdfOpen, setPdfOpen] = useState(false);
  const [goals, setGoals] = useState<ExerciseGoals>(defaultExerciseGoals);
  const buildPdf = () =>
    buildExercisePdf({
      bio: {
        name: patientRow.name,
        age: patientProfile.meta.age,
        bioAge: patientProfile.meta.bioAge,
        gender: patientProfile.meta.gender,
        company: patientRow.company,
        goal: patientProfile.meta.goal,
        conditions: patientProfile.meta.conditions,
      },
      heartRate,
      injuries,
      exerciseCtx,
      plan,
    });


  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between border-b border-border">
        <div className="inline-flex items-center gap-2">
          {(["plan", "create", "physio"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize ${tab === t ? "bg-foreground text-background rounded-full" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPdfOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-background hover:shadow-[var(--shadow-card)] transition-all text-foreground -translate-y-[3px]"
          title="Preview exercise plan PDF"
        >
          <Download className="h-3.5 w-3.5" /> View / Export PDF
        </button>
      </div>
      <PdfPreviewDialog
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        title={`Exercise Plan — ${patientRow.name}`}
        filename={`${patientRow.name.replace(/\s+/g, "_")}_Exercise_Plan`}
        buildDoc={buildPdf}
      />

      {tab === "create" ? (
        <WorkoutDashboard />
      ) : tab === "physio" ? (
        <PhysioAssessment />
      ) : (
        <>
      {/* Plan Context — three editable cards */}
      <section className="space-y-3">
        <header className="flex items-center justify-between px-1">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            <FileText className="h-3.5 w-3.5" /> Plan Context
          </div>
        </header>
        <PlanContextCards
          cards={[
            {
              key: "heart",
              label: "Heart Rate Strategy",
              icon: HeartPulse,
              tone: "bg-[hsl(var(--status-bad-bg))] text-[hsl(var(--status-bad-fg))]",
              accent: "hsl(var(--status-bad-fg))",
              summary: "Training zones, recovery rules, and cardiac load caps based on wearable data.",
              items: heartRate,
              subtitle: "Heart-rate zone tells you how hard to train.",
              renderHeader: () => (
                <div className="space-y-3">
                  {/* Stat row */}
                  <div className="rounded-xl bg-surface px-4 py-5 grid grid-cols-3 gap-2">
                    {[
                      { icon: Heart,  label: "max. heart rate", value: "190 bpm" },
                      { icon: Target, label: "exercise target", value: "133 bpm" },
                      { icon: Clock,  label: "target duration", value: "25 mins" },
                    ].map(({ icon: I, label, value }) => (
                      <div key={label} className="flex flex-col items-center text-center gap-1.5">
                        <I className="h-7 w-7 text-foreground" strokeWidth={1.5} />
                        <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
                        <div className="text-sm font-bold text-foreground">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Narrative */}
                  <div className="rounded-xl bg-surface px-4 py-4 text-sm text-foreground/85 leading-relaxed space-y-3">
                    <p>
                      Your heart-rate strategy is to train in a specific "zone" that matches your goal.
                      Based on your age (30), your estimated HRmax = 220 − 30 = <span className="font-semibold">190 bpm</span>.
                    </p>
                    <p>
                      For this plan, your target intensity is 70–80% of HRmax, which means keeping your heart rate
                      around <span className="font-semibold">133–152</span> bpm during the main parts of the workout.
                    </p>
                    <p>
                      If your heart rate stays below this range, you can slightly increase pace or effort;
                      if it goes above it, slow down until you're back in the zone.
                    </p>
                  </div>

                  {/* Reward callout */}
                  <div className="rounded-xl bg-[hsl(var(--status-warn-bg))] text-[hsl(var(--status-warn-fg))] px-4 py-3 flex items-center gap-3">
                    <Award className="h-7 w-7 shrink-0" strokeWidth={1.5} />
                    <p className="text-sm leading-snug">
                      You earn exercise points by staying in this target zone (133–150 bpm) for{" "}
                      <span className="font-bold">25 minutes.</span>
                    </p>
                  </div>

                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold pt-1">
                    Clinician notes
                  </div>
                </div>
              ),
            },
            {
              key: "injuries",
              label: "Injuries & Constraints",
              icon: ShieldAlert,
              tone: "bg-[hsl(var(--status-warn-bg))] text-[hsl(var(--status-warn-fg))]",
              accent: "hsl(var(--status-warn-fg))",
              summary: "Movement restrictions and safe substitutions from ortho history and lifestyle.",
              items: injuries,
            },
            {
              key: "exercise",
              label: "Exercise Goals",
              icon: Dumbbell,
              tone: "bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-fg))]",
              accent: "hsl(var(--status-info-fg))",
              summary: "Weekly targets — steps, calories, minutes, heart rate & training zones.",
              items: exerciseCtx,
              subtitle: "AI-generated targets — adjust to match the program.",
              renderHeader: () => (
                <ExerciseGoalCard
                  value={goals}
                  onChange={setGoals}
                  age={patientProfile.meta.age}
                />
              ),
            },
          ]}
          onChange={(key, items) => {
            if (key === "heart") setHeartRate(items);
            else if (key === "injuries") setInjuries(items);
            else if (key === "exercise") setExerciseCtx(items);
          }}
        />
      </section>

      {/* Workout Plan */}
      <section className="surface-card p-5">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 font-medium">
            <Grid3x3 className="h-4 w-4" /> Workout Plan
            <span className="pill bg-[hsl(var(--status-neutral-bg))] text-[hsl(var(--status-neutral-fg))]">
              <Sparkles className="h-3 w-3" /> AI generated · v<CountUp value={version} />
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">drag to swap days</span>
        </header>

        {/* Day pills (draggable) */}
        <div className="mt-5 grid grid-cols-7 gap-2">
          {plan.map((d) => {
            const isOpen = openDay === d.day;
            const disabled = d.tone === "rest";
            const isMenu = menuFor === d.day;
            return (
              <div key={d.day} className="space-y-2 text-center relative">
                <div className="text-[11px] tracking-wider text-muted-foreground font-semibold flex items-center justify-center gap-0.5">
                  {d.day}
                  <button
                    onClick={() => setMenuFor(isMenu ? null : d.day)}
                    className="opacity-50 hover:opacity-100"
                    aria-label="Day menu"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </button>
                </div>
                <button
                  draggable={!disabled}
                  onDragStart={() => setDragFrom(d.day)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragFrom) reorder(dragFrom, d.day); setDragFrom(null); }}
                  disabled={disabled && dragFrom === null}
                  onClick={() => !disabled && setOpenDay(isOpen ? null : d.day)}
                  className={`w-full px-2.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center justify-between gap-1 transition-all ${dayTone[d.tone]} ${!disabled && "hover:shadow-[var(--shadow-card)] cursor-grab active:cursor-grabbing"} ${isOpen ? "ring-2 ring-foreground/20" : ""}`}
                >
                  <span className="inline-flex items-center gap-1 min-w-0">
                    {(() => { const I = dayIcon[d.tone]; return I ? <I className="h-3 w-3 shrink-0 opacity-70" /> : null; })()}
                    <span className="truncate">{d.type.replace(" Day", "")}</span>
                  </span>
                  {!disabled && (
                    <span className="inline-flex items-center gap-0.5">
                      {d.count}
                      {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </span>
                  )}
                </button>

                {isMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 bg-background border border-border rounded-lg shadow-[var(--shadow-pop)] py-1 w-32 text-left animate-scale-in">
                      <button onClick={() => duplicate(d.day)} className="w-full px-3 py-1.5 text-xs hover:bg-surface flex items-center gap-2">
                        <Copy className="h-3 w-3" /> Duplicate
                      </button>
                      <button onClick={() => clear(d.day)} className="w-full px-3 py-1.5 text-xs hover:bg-surface flex items-center gap-2 text-[hsl(var(--destructive))]">
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Expanded day */}
        {openDay && (() => {
          const d = plan.find((x) => x.day === openDay);
          if (!d || d.exercises.length === 0) return null;
          const removedKeys = Object.keys(diff).filter((k) => k.startsWith(`${d.day}::removed::`));
          return (
            <div className="mt-4 surface-card bg-background p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">{d.type} — {d.day}</div>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  {d.exercises.length} exercises
                  <span className="text-[10px] opacity-70">· scroll for more</span>
                  <ChevronDown className="h-3 w-3 animate-bounce opacity-60" />
                </span>
              </div>
              <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1 -mr-1 [scrollbar-width:thin]">
                {d.exercises.map((ex, i) => {
                  const flag = diff[`${d.day}::${ex.name}`];
                  return (
                    <li
                      key={i}
                      className={`flex items-start justify-between gap-3 px-3 py-2 rounded-lg bg-surface ${flag === "added" ? "ring-1 ring-[hsl(var(--trend-up))] animate-diff-flash" : ""}`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <ExerciseGifPopover name={ex.name}>{ex.name}</ExerciseGifPopover>
                          {flag === "added" && <span className="text-[10px] font-semibold text-[hsl(var(--trend-up))] uppercase">new</span>}
                        </div>
                        {ex.notes && (
                          <div className="text-[11px] text-muted-foreground/90 leading-snug mt-0.5">
                            {ex.notes}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground shrink-0 mt-0.5">{ex.sets}</span>
                    </li>
                  );
                })}
                {removedKeys.map((k) => {
                  const name = k.split("::removed::")[1];
                  return (
                    <li key={k} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[hsl(var(--status-critical-bg)/0.4)] line-through opacity-70 animate-diff-flash">
                      <span className="text-sm">{name}</span>
                      <span className="text-[10px] font-semibold text-[hsl(var(--destructive))] uppercase">removed</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

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
              <CountUp value={score} suffix="/100" /> — {score >= 75 ? "looking good" : score >= 55 ? "acceptable" : "needs regeneration"}
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
              <li className="flex gap-2"><span className="text-muted-foreground">•</span> recommend ACL friendly strength</li>
              <li className="flex gap-2"><span className="text-muted-foreground">•</span> plan must consist of 5 days</li>
              <li className="flex gap-2"><span className="text-muted-foreground">•</span> consider high glucose</li>
              <li className="flex gap-2"><span className="text-muted-foreground">•</span> ensure home exercises</li>
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
                onClick={publishPlan}
                className="btn-surface-pill !px-3 !py-1.5 !text-xs"
              >
                <Send className="h-3 w-3" /> Publish
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {score < 55 ? "Score is too low — regenerate with updated notes." : "Plan ready to publish."}
            </p>
          </div>
        </div>
      </section>
        </>
      )}

      <NotifyUserDialog
        open={pending !== null}
        onOpenChange={(o) => { if (!o) setPending(null); }}
        changeLabel={pending?.label ?? ""}
        defaultMessage={pending?.label ?? ""}
        onConfirm={() => { pending?.apply(); setPending(null); }}
      />
    </div>
  );
};

export default Exercise;
