import {
  Activity, Apple, Beef, ChevronDown, ChevronUp, Coffee, Copy, Edit3, FileText,
  Flame, Grid3x3, MoreHorizontal, Plus, RefreshCw, Salad, Search, Send, Sparkles,
  Star, Trash2, Wheat, X, AlertTriangle, Cpu,
  Droplet, Heart, Moon, Wind, Fish, Wheat as WheatIcon, Leaf, Scale, Target, BarChart3, PieChart, Drumstick, Croissant, Info,
  Eye, EyeOff, Download,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { NotifyUserDialog } from "@/components/patient/NotifyUserDialog";
import { buildNutritionPdf } from "@/lib/plan-pdf";
import { PdfPreviewDialog } from "@/components/patient/PdfPreviewDialog";
import { getPatientProfile, patients } from "@/lib/data";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { CountUp } from "@/components/brand/CountUp";
import { PlanContextCards, type PlanContextItem } from "@/components/patient/PlanContextCards";
import { MicronutrientRibbon } from "@/components/patient/MicronutrientRibbon";
import {
  samplePlan, SOURCE_LABELS,
  type MealType, type PlanDay, type Recipe, type ScaledIngredient,
} from "@/lib/nutrition-plan";

// ─── Static mapping for icons / source label ────────────────────────────────
const planContextReport = {
  label: "User 2 — Personalised Training Program",
  href: "/reports/User_2_Workout_Plan.pdf",
};

const mealIcon: Record<MealType, React.ComponentType<{ className?: string }>> = {
  breakfast: Coffee,
  snack_am: Apple,
  lunch: Salad,
  snack_pm: Wheat,
  snack: Apple,
  dinner: Beef,
};

const mealTypeLabel: Record<MealType, string> = {
  breakfast: "Breakfast",
  snack_am: "AM snack",
  lunch: "Lunch",
  snack_pm: "PM snack",
  snack: "Snack",
  dinner: "Dinner",
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

// Map a single value to a 3-state band against an optimal [lo,hi] range.
type BandStatus = "ok" | "warn" | "bad";
const bandFor = (value: number, lo: number, hi: number, hardWarnPct = 0.05): BandStatus => {
  if (value >= lo && value <= hi) return "ok";
  const span = hi - lo || 1;
  const overshoot = value < lo ? (lo - value) / span : (value - hi) / span;
  return overshoot <= hardWarnPct * 4 ? "warn" : "bad";
};
const bandTone: Record<BandStatus, string> = {
  ok:   "text-[hsl(var(--trend-up))]",
  warn: "text-[hsl(var(--status-warn-fg))]",
  bad:  "text-[hsl(var(--destructive))]",
};
const bandFill: Record<BandStatus, string> = {
  ok:   "bg-[hsl(var(--trend-up))]",
  warn: "bg-[hsl(var(--status-warn-fg))]",
  bad:  "bg-[hsl(var(--destructive))]",
};

// Compact horizontal range bar for a single macro value vs target band.
const MacroRangeBar = ({
  value, lo, hi, scaleMax, label, unit, big = false,
}: { value: number; lo: number; hi: number; scaleMax: number; label: string; unit: string; big?: boolean }) => {
  const status = bandFor(value, lo, hi);
  const pct = (n: number) => Math.max(0, Math.min(100, (n / scaleMax) * 100));
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="uppercase tracking-wider text-muted-foreground text-[10px]">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={`tabular-nums font-semibold ${big ? "text-2xl" : "text-sm"} ${bandTone[status]}`}>
            {value.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="mt-1 relative h-1.5 rounded-full bg-surface overflow-hidden">
        <div
          className="absolute inset-y-0 bg-[hsl(var(--status-optimal-bg)/0.55)]"
          style={{ left: `${pct(lo)}%`, width: `${Math.max(0, pct(hi) - pct(lo))}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-2 w-2 rounded-full ring-2 ring-background ${bandFill[status]}`}
          style={{ left: `${pct(value)}%` }}
        />
      </div>
      <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground/80 tabular-nums">
        <span>0</span>
        <span>{lo}–{hi}</span>
        <span>{Math.round(scaleMax)}</span>
      </div>
    </div>
  );
};

// ─── Ingredient drilldown table (expanded inside a recipe row) ──────────────
const IngredientTable = ({ ingredients }: { ingredients: ScaledIngredient[] }) => {
  if (ingredients.length === 0) {
    return <div className="text-[11px] text-muted-foreground italic px-1">No structured ingredients on file.</div>;
  }
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-muted-foreground uppercase tracking-wider text-[9px]">
            <th className="text-left font-semibold py-1.5 px-1">Ingredient</th>
            <th className="text-left font-semibold py-1.5 px-1">Qty</th>
            <th className="text-right font-semibold py-1.5 px-1">kcal</th>
            <th className="text-right font-semibold py-1.5 px-1">P</th>
            <th className="text-right font-semibold py-1.5 px-1">C</th>
            <th className="text-right font-semibold py-1.5 px-1">F</th>
            <th className="text-right font-semibold py-1.5 px-1">Fiber</th>
            <th className="text-left font-semibold py-1.5 px-1">Tags</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => (
            <tr key={ing.ingredient_id} className="border-t border-border/60">
              <td className="py-1.5 px-1">
                <div className="font-medium text-foreground/90">{ing.ingredient_name_en}</div>
                {ing.source && (
                  <div className="text-[9px] text-muted-foreground/80 uppercase tracking-wider">
                    {ing.source.source}{ing.source.source_reference ? ` · ${ing.source.source_reference}` : ""}
                  </div>
                )}
              </td>
              <td className="py-1.5 px-1 tabular-nums text-muted-foreground">
                {ing.quantity} {ing.unit}
                {ing.unit !== "g" && <span className="opacity-60"> · {ing.quantity_g}g</span>}
              </td>
              <td className="py-1.5 px-1 text-right tabular-nums">{Math.round(ing.macros.calories)}</td>
              <td className="py-1.5 px-1 text-right tabular-nums">{ing.macros.protein_g.toFixed(1)}</td>
              <td className="py-1.5 px-1 text-right tabular-nums">{ing.macros.carbs_g.toFixed(1)}</td>
              <td className="py-1.5 px-1 text-right tabular-nums">{ing.macros.fat_g.toFixed(1)}</td>
              <td className="py-1.5 px-1 text-right tabular-nums text-muted-foreground">{(ing.macros.fiber_g ?? 0).toFixed(1)}</td>
              <td className="py-1.5 px-1">
                <div className="flex flex-wrap gap-1">
                  {ing.glycemic_index != null && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface border border-border tabular-nums">GI {ing.glycemic_index}</span>
                  )}
                  {ing.cost_tier && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface border border-border capitalize">{ing.cost_tier}</span>
                  )}
                  {(ing.allergen_flags ?? []).map((a) => (
                    <span key={a} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--status-warn-bg))] text-[hsl(var(--status-warn-fg))] capitalize">{a}</span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Recipe row (one inside a meal) ─────────────────────────────────────────
const RecipeRow = ({ r, flag, minimal = true }: { r: Recipe; flag?: "added"; minimal?: boolean }) => {
  const [open, setOpen] = useState(false);
  const showMeta = open || !minimal;
  return (
    <li className={`py-2.5 px-1 -mx-1 ${flag === "added" ? "rounded-md ring-1 ring-[hsl(var(--trend-up))] animate-diff-flash" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex gap-3 text-left flex-1 group"
          aria-expanded={open}
        >
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-foreground/40" />
          <div className="min-w-0">
            <div className="text-sm font-medium leading-snug flex items-center gap-2 flex-wrap">
              <span className="truncate">{r.recipe_name_en}</span>
              {r.is_novel && (
                <span
                  title={
                    r.validation
                      ? `AI-generated · validated (${r.validation.attempts_count} attempt${r.validation.attempts_count > 1 ? "s" : ""})`
                      : "AI-generated recipe"
                  }
                  className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-fg))]"
                >
                  <Sparkles className="h-2.5 w-2.5" /> Novel
                </span>
              )}
              {flag === "added" && (
                <span className="text-[9px] font-semibold text-[hsl(var(--trend-up))] uppercase tracking-wider shrink-0">new</span>
              )}
              <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform opacity-0 group-hover:opacity-100 ${open ? "rotate-180 opacity-100" : ""}`} />
            </div>
            {showMeta && (
              <>
                <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5 animate-fade-in">
                  {r.serving_weight_g} g · {r.scaled_ingredients.length} ingredients · role: {r.meal_role_tag.replace(/_/g, " ")}
                </div>
                {r.notes && <div className="text-[11px] text-muted-foreground/80 leading-snug mt-1 line-clamp-2 animate-fade-in">{r.notes}</div>}
              </>
            )}
          </div>
        </button>
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold tabular-nums">
            {Math.round(r.recipe_macros.calories)}
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal ml-1">kcal</span>
          </div>
          {showMeta && (
            <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums font-mono whitespace-nowrap animate-fade-in">
              <span>P{Math.round(r.recipe_macros.protein_g)}</span>
              <span className="mx-1.5 opacity-50">·</span>
              <span>C{Math.round(r.recipe_macros.carbs_g)}</span>
              <span className="mx-1.5 opacity-50">·</span>
              <span>F{Math.round(r.recipe_macros.fat_g)}</span>
            </div>
          )}
        </div>
      </div>
      {open && (
        <div className="mt-3 ml-4 pl-3 border-l border-border/60 animate-fade-in">
          <IngredientTable ingredients={r.scaled_ingredients} />
        </div>
      )}
    </li>
  );
};

// ─── Plan-context items derived from samplePlan ─────────────────────────────
// ─── Icon mapping for plan-context items ────────────────────────────────────
const healthNoteIcon = (source: string) => {
  if (source.includes("hba1c")) return Droplet;
  if (source.includes("ldl") || source.includes("cholesterol")) return Heart;
  if (source.includes("wbc")) return Wind;
  if (source.includes("body_fat")) return Scale;
  if (source.includes("sleep")) return Moon;
  return Activity;
};

const superfoodIcon = (id: string) => {
  if (id.includes("OATS")) return WheatIcon;
  if (id.includes("YOGURT")) return Droplet;
  if (id.includes("SALMON") || id.includes("FISH")) return Fish;
  if (id.includes("OLIVE")) return Leaf;
  if (id.includes("LENTILS") || id.includes("BERRIES")) return Apple;
  if (id.includes("CHICKEN") || id.includes("BEEF")) return Drumstick;
  if (id.startsWith("REC-")) return Salad;
  return Star;
};

const initialHealthNotes: PlanContextItem[] = samplePlan.health_notes.map((n) => ({
  title: SOURCE_LABELS[n.source] ?? n.source,
  body: `${n.finding} ${n.directive}`,
  icon: healthNoteIcon(n.source),
}));

const initialSuperfoods: PlanContextItem[] = samplePlan.superfoods.map((s) => ({
  title: `${s.name_en}${s.type === "recipe" ? " (recipe)" : ""}`,
  body: s.explanation,
  icon: superfoodIcon(s.id),
}));

const initialCaloricStrategy: PlanContextItem[] = (() => {
  const s = samplePlan.calorie_strategy;
  return [
    { title: "Direction",     icon: Target,    body: `${s.direction[0].toUpperCase()}${s.direction.slice(1)} of ${Math.abs(s.adjustment)} kcal vs ${s.maintenance_calories.toLocaleString()} maintenance.` },
    { title: "Daily target",  icon: Flame,     body: `${s.target_calories.toLocaleString()} kcal/day. Allowed range ${s.daily_allowed_range.min_calories.toLocaleString()}–${s.daily_allowed_range.max_calories.toLocaleString()} kcal.` },
    { title: "Protein",       icon: Drumstick, body: `${samplePlan.nutrition_targets.protein_g.value} g (~${s.macro_percentages.protein_pct}%) — preserves lean mass during deficit.` },
    { title: "Carbohydrates", icon: Croissant, body: `${samplePlan.nutrition_targets.carbs_g.value} g (~${s.macro_percentages.carbs_pct}%) — concentrated around training windows.` },
    { title: "Fat",           icon: PieChart,  body: `${samplePlan.nutrition_targets.fat_g.value} g (~${s.macro_percentages.fat_pct}%) — emphasis on monounsaturated and omega-3 sources.` },
    { title: "Rationale",     icon: Info,      body: s.explanation },
  ];
})();

type DiffMap = Record<string, "added" | "removed" | undefined>;

const Nutrition = () => {
  const [healthNotes, setHealthNotes] = useState<PlanContextItem[]>(initialHealthNotes);
  const [superfoods, setSuperfoods] = useState<PlanContextItem[]>(initialSuperfoods);
  const [caloricStrategy, setCaloricStrategy] = useState<PlanContextItem[]>(initialCaloricStrategy);
  const [tab, setTab] = useState<"plan" | "create">("plan");
  const [plan, setPlan] = useState<PlanDay[]>(samplePlan.days);
  const [version, setVersion] = useState(1);
  const [score, setScore] = useState(72);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffMap>({});
  const [minimal, setMinimal] = useState(true);

  // Confirm-with-notify gate for clinician-facing changes
  const [pending, setPending] = useState<null | { label: string; apply: () => void }>(null);

  // Patient bio for PDF
  const { id } = useParams();
  const patientRow = patients.find((p) => p.id === id) ?? patients[0];
  const patientProfile = getPatientProfile(id);

  useEffect(() => {
    if (Object.keys(diff).length === 0) return;
    const t = setTimeout(() => setDiff({}), 4000);
    return () => clearTimeout(t);
  }, [diff]);

  // Source-of-truth references for target bands
  const targets = samplePlan.nutrition_targets;
  const range = samplePlan.calorie_strategy.daily_allowed_range;
  const meta = samplePlan.plan_metadata;
  const gen = samplePlan.generation_metadata;

  // Light "regenerate" — shuffle a couple of meals on day 1 to demonstrate diff
  const regenerate = () => {
    setPending({
      label: "Regenerate meal plan with AI",
      apply: () => {
        setGenerating(true);
        setTimeout(() => {
          const next = plan.map((d) => {
            if (d.day_label !== "MON") return d;
            const meals = d.meals.map((m, i) => i === 2 ? {
              ...m,
              recipes: m.recipes.map((r) => ({ ...r, is_novel: true })),
            } : m);
            return { ...d, meals };
          });
          const d: DiffMap = {};
          d[`MON::${next[0].meals[2].recipes[0].recipe_name_en}`] = "added";
          setDiff(d);
          setPlan(next);
          setVersion((v) => v + 1);
          setScore((s) => Math.min(96, s + 8 + Math.floor(Math.random() * 8)));
          setGenerating(false);
          toast({ title: "Meal plan regenerated", description: `New v${version + 1} — changes highlighted briefly.` });
        }, 600);
      },
    });
  };

  const reorder = (fromDay: string, toDay: string) => {
    if (fromDay === toDay) return;
    const fromIdx = plan.findIndex((p) => p.day_label === fromDay);
    const toIdx = plan.findIndex((p) => p.day_label === toDay);
    if (fromIdx < 0 || toIdx < 0) return;
    setPending({
      label: `Swap meal plan days · ${fromDay} ↔ ${toDay}`,
      apply: () => {
        const next = [...plan];
        [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
        setPlan(next);
        toast({ title: "Days swapped", description: `${fromDay} ↔ ${toDay}` });
      },
    });
  };

  const duplicate = (day: string) => {
    const src = plan.find((p) => p.day_label === day);
    if (!src) return;
    const idx = plan.findIndex((p) => p.day_label === day);
    const targetIdx = (idx + 1) % plan.length;
    setMenuFor(null);
    setPending({
      label: `Duplicate meal plan day · ${src.day_label} → ${plan[targetIdx].day_label}`,
      apply: () => {
        const next = [...plan];
        next[targetIdx] = { ...next[targetIdx], meals: src.meals, day_macros: src.day_macros };
        setPlan(next);
        toast({ title: "Day duplicated", description: `${src.day_label} copied to ${next[targetIdx].day_label}` });
      },
    });
  };

  const clear = (day: string) => {
    setMenuFor(null);
    setPending({
      label: `Clear meal plan for ${day}`,
      apply: () => {
        const next = plan.map((p) => p.day_label === day ? { ...p, meals: [], day_macros: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 } } : p);
        setPlan(next);
        toast({ title: "Day cleared", description: day });
      },
    });
  };

  const publishPlan = () => {
    setPending({
      label: `Publish meal plan v${version} to ${patientRow.name}`,
      apply: () => toast({ title: "Plan published", description: `v${version} sent to patient.` }),
    });
  };

  const [pdfOpen, setPdfOpen] = useState(false);
  const buildPdf = () =>
    buildNutritionPdf({
      bio: {
        name: patientRow.name,
        age: patientProfile.meta.age,
        bioAge: patientProfile.meta.bioAge,
        gender: patientProfile.meta.gender,
        company: patientRow.company,
        goal: patientProfile.meta.goal,
        conditions: patientProfile.meta.conditions,
      },
      healthNotes,
      superfoods,
      caloricStrategy,
      plan,
    });


  // Per-day primary meal type (drives chip icon/label)
  const dayPrimaryType = (d: PlanDay): MealType => d.meals[0]?.meal_type ?? "lunch";

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between border-b border-border">
        <div className="inline-flex items-center gap-2">
          {(["plan", "create"] as const).map((t) => (
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
          title="Preview nutrition plan PDF"
        >
          <Download className="h-3.5 w-3.5" /> View / Export PDF
        </button>
      </div>
      <PdfPreviewDialog
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        title={`Nutrition Plan — ${patientRow.name}`}
        filename={`${patientRow.name.replace(/\s+/g, "_")}_Nutrition_Plan`}
        buildDoc={buildPdf}
      />

      {tab === "create" ? (
        <NutritionCreate />
      ) : (
        <>
          {/* Plan Context — three clickable cards */}
          <section className="space-y-3">
            <header className="flex items-center justify-between px-1">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <FileText className="h-3.5 w-3.5" /> Plan Context
              </div>
              <a
                href={planContextReport.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                title={`Open ${planContextReport.label} (PDF)`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="underline-offset-2 hover:underline">Source report</span>
              </a>
            </header>

            <PlanContextCards
              cards={[
                {
                  key: "notes",
                  label: "Health Notes",
                  icon: Activity,
                  tone: "bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-fg))]",
                  accent: "hsl(var(--status-info-fg))",
                  summary: "Personalised dietary guidance derived from labs, body composition, and lifestyle.",
                  items: healthNotes,
                },
                {
                  key: "superfoods",
                  label: "Superfoods",
                  icon: Star,
                  tone: "bg-[hsl(var(--status-warn-bg))] text-[hsl(var(--status-warn-fg))]",
                  accent: "hsl(var(--status-warn-fg))",
                  summary: "Targeted foods to manage cholesterol, support thyroid, and fuel performance.",
                  items: superfoods,
                },
                {
                  key: "calories",
                  label: "Caloric Strategy",
                  icon: Flame,
                  tone: "bg-[hsl(var(--status-bad-bg))] text-[hsl(var(--status-bad-fg))]",
                  accent: "hsl(var(--status-bad-fg))",
                  summary: `${samplePlan.calorie_strategy.target_calories.toLocaleString()} kcal/day · ${samplePlan.calorie_strategy.direction} of ${Math.abs(samplePlan.calorie_strategy.adjustment)} kcal vs maintenance.`,
                  items: caloricStrategy,
                },
              ]}
              onChange={(key, items) => {
                if (key === "notes") setHealthNotes(items);
                else if (key === "superfoods") setSuperfoods(items);
                else if (key === "calories") setCaloricStrategy(items);
              }}
            />
          </section>

          {/* Weekly micronutrients */}
          <MicronutrientRibbon weekly={samplePlan.weekly_macros} />

          {/* Meal Plan */}
          <section className="surface-card p-5">
            <header className="flex items-center justify-between flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 font-medium">
                <Grid3x3 className="h-4 w-4" /> Meal Plan
                <span className="pill bg-[hsl(var(--status-neutral-bg))] text-[hsl(var(--status-neutral-fg))]">
                  <Sparkles className="h-3 w-3" /> AI generated · v<CountUp value={version} />
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">drag to swap days</span>
            </header>

            {/* Plan metadata strip */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              <span>{meta.plan_id}</span>
              <span className="opacity-40">·</span>
              <span>generated {fmtTime(meta.generated_at)}</span>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-1"><Cpu className="h-3 w-3" /> {gen.pipeline_execution.model_name}</span>
              <span className="opacity-40">·</span>
              <span>{(gen.pipeline_execution.total_generation_time_ms / 1000).toFixed(2)}s</span>
              <span className="opacity-40">·</span>
              <span>validation {gen.validation_summary.attempts_used}/{gen.validation_summary.max_attempts} {gen.validation_summary.final_passed ? "✓" : "✗"}</span>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2">
              {plan.map((d) => {
                const isOpen = openDay === d.day_label;
                const isMenu = menuFor === d.day_label;
                const empty = d.meals.length === 0;
                const tone = dayPrimaryType(d);
                const Icon = mealIcon[tone];
                const dayStatus = bandFor(d.day_macros.calories, range.min_calories, range.max_calories);
                return (
                  <div key={d.day_label} className="space-y-2 text-center relative">
                    <div className="text-[11px] tracking-wider text-muted-foreground font-semibold flex items-center justify-center gap-0.5">
                      {d.day_label}
                      <button
                        onClick={() => setMenuFor(isMenu ? null : d.day_label)}
                        className="opacity-50 hover:opacity-100"
                        aria-label="Day menu"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      draggable={!empty}
                      onDragStart={() => setDragFrom(d.day_label)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => { if (dragFrom) reorder(dragFrom, d.day_label); setDragFrom(null); }}
                      onClick={() => !empty && setOpenDay(isOpen ? null : d.day_label)}
                      className={`w-full px-2.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center justify-between gap-1 transition-all bg-surface text-foreground border border-border ${empty ? "opacity-50" : "hover:shadow-[var(--shadow-card)] cursor-grab active:cursor-grabbing"} ${isOpen ? "ring-2 ring-foreground/20" : ""}`}
                    >
                      <span className="inline-flex items-center gap-1 min-w-0">
                        {Icon && <Icon className="h-3 w-3 shrink-0 opacity-70" />}
                        <span className="truncate">Meal Plan</span>
                      </span>
                      {!empty && (
                        <span className="inline-flex items-center gap-0.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${bandFill[dayStatus]}`} />
                          {d.meals.length}
                          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </span>
                      )}
                    </button>

                    {isMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 bg-background border border-border rounded-lg shadow-[var(--shadow-pop)] py-1 w-32 text-left animate-scale-in">
                          <button onClick={() => duplicate(d.day_label)} className="w-full px-3 py-1.5 text-xs hover:bg-surface flex items-center gap-2">
                            <Copy className="h-3 w-3" /> Duplicate
                          </button>
                          <button onClick={() => clear(d.day_label)} className="w-full px-3 py-1.5 text-xs hover:bg-surface flex items-center gap-2 text-[hsl(var(--destructive))]">
                            <Trash2 className="h-3 w-3" /> Clear
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {openDay && (() => {
              const d = plan.find((x) => x.day_label === openDay);
              if (!d || d.meals.length === 0) return null;
              const dayCals = d.day_macros.calories;
              return (
                <div className="mt-4 surface-card bg-background p-5 animate-fade-in">
                  {/* Header with minimal/expanded toggle */}
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <div className="font-semibold text-sm">Meal Plan <span className="text-muted-foreground font-normal">— {d.day_label}</span></div>
                    <div className="flex items-center gap-3">
                      {minimal && (
                        <span className="text-[11px] tabular-nums text-muted-foreground font-mono">
                          {Math.round(dayCals)} kcal
                          <span className="opacity-50 mx-1.5">·</span>
                          P{Math.round(d.day_macros.protein_g)} C{Math.round(d.day_macros.carbs_g)} F{Math.round(d.day_macros.fat_g)}
                          <span className={`ml-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${bandFill[bandFor(dayCals, range.min_calories, range.max_calories)]}`} />
                        </span>
                      )}
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{d.meals.length} meals</span>
                      <button
                        type="button"
                        onClick={() => setMinimal((m) => !m)}
                        className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        title={minimal ? "Show details" : "Hide details"}
                      >
                        {minimal ? <><Eye className="h-3 w-3" /> Details</> : <><EyeOff className="h-3 w-3" /> Minimal</>}
                      </button>
                    </div>
                  </div>

                  {/* Day macro range bands — hidden in minimal mode */}
                  {!minimal && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-border animate-fade-in">
                      <MacroRangeBar value={dayCals} lo={range.min_calories} hi={range.max_calories} scaleMax={range.max_calories * 1.2} label="kcal" unit="kcal" big />
                      <MacroRangeBar
                        value={Math.round(d.day_macros.protein_g)}
                        lo={targets.protein_g.value - targets.protein_g.tolerance}
                        hi={targets.protein_g.value + targets.protein_g.tolerance}
                        scaleMax={targets.protein_g.value * 1.5}
                        label="Protein" unit="g"
                      />
                      <MacroRangeBar
                        value={Math.round(d.day_macros.carbs_g)}
                        lo={targets.carbs_g.value - targets.carbs_g.tolerance}
                        hi={targets.carbs_g.value + targets.carbs_g.tolerance}
                        scaleMax={targets.carbs_g.value * 1.5}
                        label="Carbs" unit="g"
                      />
                      <MacroRangeBar
                        value={Math.round(d.day_macros.fat_g)}
                        lo={targets.fat_g.value - targets.fat_g.tolerance}
                        hi={targets.fat_g.value + targets.fat_g.tolerance}
                        scaleMax={targets.fat_g.value * 1.7}
                        label="Fat" unit="g"
                      />
                    </div>
                  )}

                  {/* Meals */}
                  <div className={`${minimal ? "mt-3" : "mt-2"} max-h-[420px] overflow-y-auto pr-1 -mr-1 [scrollbar-width:thin]`}>
                    {d.meals.map((m, mi) => {
                      const Icon = mealIcon[m.meal_type];
                      return (
                        <div key={mi} className="py-2 border-b border-border/60 last:border-b-0">
                          <div className="flex items-center justify-between gap-2 px-1">
                            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                              {Icon && <Icon className="h-3 w-3" />}
                              {mealTypeLabel[m.meal_type]}
                            </div>
                            <div className="text-[11px] text-muted-foreground tabular-nums font-mono">
                              {Math.round(m.meal_macros.calories)} kcal{!minimal && ` · P${Math.round(m.meal_macros.protein_g)} C${Math.round(m.meal_macros.carbs_g)} F${Math.round(m.meal_macros.fat_g)}`}
                            </div>
                          </div>
                          <ul className="divide-y divide-border/40">
                            {m.recipes.map((r) => {
                              const flag = diff[`${d.day_label}::${r.recipe_name_en}`] === "added" ? "added" as const : undefined;
                              return <RecipeRow key={r.recipe_id} r={r} flag={flag} minimal={minimal} />;
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Deviations */}
            {gen.deviations.length > 0 && (
              <div className="mt-5 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Deviations vs targets
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{gen.deviations.length} flagged</span>
                </div>
                <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
                  {gen.deviations.map((dv, i) => {
                    const tone = Math.abs(dv.delta) <= 30 ? "text-muted-foreground" : Math.abs(dv.delta) <= 100 ? "text-[hsl(var(--status-warn-fg))]" : "text-[hsl(var(--destructive))]";
                    return (
                      <li key={i} className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
                        <span className="capitalize text-muted-foreground tabular-nums">
                          <span className="font-medium text-foreground/80">{dv.identifier}</span>
                          <span className="opacity-60 ml-1.5">({dv.scope})</span>
                        </span>
                        <span className={`tabular-nums font-mono text-[11px] ${tone}`}>
                          {dv.actual.toLocaleString()} / {dv.target.toLocaleString()}
                          <span className="ml-1.5 font-semibold">{dv.delta > 0 ? "+" : ""}{dv.delta}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

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
                  <CountUp value={score} suffix="/100" /> — {score >= 75 ? "macros & timing aligned" : score >= 55 ? "acceptable, minor swaps" : "needs regeneration"}
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
                  <li className="flex gap-2"><span className="text-muted-foreground">•</span> protein floor 1.8 g/kg, split across 4 feedings</li>
                  <li className="flex gap-2"><span className="text-muted-foreground">•</span> low-GI carbs anchored to training windows</li>
                  <li className="flex gap-2"><span className="text-muted-foreground">•</span> cap saturated fat at 20 g/day (LDL)</li>
                  <li className="flex gap-2"><span className="text-muted-foreground">•</span> no carb-dense meals after 7pm (CGM)</li>
                  <li className="flex gap-2"><span className="text-muted-foreground">•</span> include omega-3 rich fish 3×/week</li>
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

export default Nutrition;

// ─── Create tab: Ingredients → Meals → Meal Plans ──────────────────────────
// The Create tab keeps its lightweight composer UI but speaks the same shape
// as the schema-aligned Plan tab: meal types use the schema MealType union,
// allergen/dietary flags carry over from ingredients, and the plan totals are
// validated against `samplePlan.nutrition_targets` & `daily_allowed_range`.

interface Ingredient {
  id: string; name: string; category: string;
  kcal: number; protein: number; carbs: number; fat: number;
  allergens?: string[]; dietary?: string[]; gi?: number;
}
interface BuiltMeal  { id: string; name: string; ingredientIds: string[]; mealType: MealType; }
interface MealPlanDraft { id: string; name: string; mealIds: string[]; }

const segmentLabel: Record<MealType, string> = mealTypeLabel;

const SEED_INGREDIENTS: Ingredient[] = [
  { id: "i1",  name: "Chicken breast",   category: "Protein", kcal: 165, protein: 31, carbs: 0,  fat: 3.6, dietary: ["high_protein","halal"] },
  { id: "i2",  name: "Salmon fillet",    category: "Protein", kcal: 208, protein: 20, carbs: 0,  fat: 13,  allergens: ["fish"], dietary: ["omega3_rich"] },
  { id: "i3",  name: "Greek yogurt 0%",  category: "Dairy",   kcal: 59,  protein: 10, carbs: 3.6,fat: 0.4, allergens: ["milk"], dietary: ["vegetarian","high_protein"] },
  { id: "i4",  name: "Eggs (whole)",     category: "Protein", kcal: 155, protein: 13, carbs: 1.1,fat: 11,  allergens: ["egg"], dietary: ["vegetarian"] },
  { id: "i5",  name: "Quinoa (cooked)",  category: "Carb",    kcal: 120, protein: 4.4,carbs: 21, fat: 1.9, dietary: ["vegan","gluten_free"], gi: 53 },
  { id: "i6",  name: "Sweet potato",     category: "Carb",    kcal: 86,  protein: 1.6,carbs: 20, fat: 0.1, dietary: ["vegan"], gi: 63 },
  { id: "i7",  name: "Brown rice",       category: "Carb",    kcal: 111, protein: 2.6,carbs: 23, fat: 0.9, dietary: ["vegan","gluten_free"], gi: 68 },
  { id: "i8",  name: "Spinach",          category: "Veg",     kcal: 23,  protein: 2.9,carbs: 3.6,fat: 0.4, dietary: ["vegan"] },
  { id: "i9",  name: "Broccoli",         category: "Veg",     kcal: 34,  protein: 2.8,carbs: 7,  fat: 0.4, dietary: ["vegan"] },
  { id: "i10", name: "Avocado",          category: "Fat",     kcal: 160, protein: 2,  carbs: 9,  fat: 15,  dietary: ["vegan"] },
  { id: "i11", name: "Olive oil",        category: "Fat",     kcal: 884, protein: 0,  carbs: 0,  fat: 100, dietary: ["vegan"] },
  { id: "i12", name: "Almonds",          category: "Fat",     kcal: 579, protein: 21, carbs: 22, fat: 50,  allergens: ["tree_nut"], dietary: ["vegan"] },
  { id: "i13", name: "Blueberries",      category: "Fruit",   kcal: 57,  protein: 0.7,carbs: 14, fat: 0.3, dietary: ["vegan"], gi: 53 },
  { id: "i14", name: "Lentils (cooked)", category: "Carb",    kcal: 116, protein: 9,  carbs: 20, fat: 0.4, dietary: ["vegan","high_fiber"], gi: 32 },
  { id: "i15", name: "Whey protein",     category: "Protein", kcal: 400, protein: 80, carbs: 8,  fat: 5,   allergens: ["milk"], dietary: ["high_protein"] },
];

const SEED_MEAL_LIBRARY: BuiltMeal[] = [
  { id: "m-lib-1", name: "Greek yogurt + berries + almonds", ingredientIds: ["i3", "i13", "i12"], mealType: "breakfast" },
  { id: "m-lib-2", name: "Chicken & quinoa bowl",            ingredientIds: ["i1", "i5", "i9"],   mealType: "lunch" },
  { id: "m-lib-3", name: "Salmon + sweet potato + spinach",  ingredientIds: ["i2", "i6", "i8"],   mealType: "dinner" },
  { id: "m-lib-4", name: "Whey + blueberries",                ingredientIds: ["i15", "i13"],      mealType: "snack" },
];

const CATEGORIES = ["All", "Protein", "Carb", "Fat", "Veg", "Fruit", "Dairy"];

function NutritionCreate() {
  const [ingredients] = useState<Ingredient[]>(SEED_INGREDIENTS);
  const [selectedIng, setSelectedIng] = useState<Set<string>>(new Set());
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [mealName, setMealName] = useState("");

  const [mealLibrary, setMealLibrary] = useState<BuiltMeal[]>(SEED_MEAL_LIBRARY);
  const [planDraft, setPlanDraft] = useState<MealPlanDraft>({ id: "draft", name: "Untitled meal plan", mealIds: [] });

  const filteredIng = useMemo(() => {
    return ingredients.filter((i) =>
      (catFilter === "All" || i.category === catFilter) &&
      (search === "" || i.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [ingredients, catFilter, search]);

  const totals = useMemo(() => {
    const sel = ingredients.filter((i) => selectedIng.has(i.id));
    return sel.reduce(
      (acc, i) => ({ kcal: acc.kcal + i.kcal, p: acc.p + i.protein, c: acc.c + i.carbs, f: acc.f + i.fat }),
      { kcal: 0, p: 0, c: 0, f: 0 }
    );
  }, [ingredients, selectedIng]);

  const toggleIng = (id: string) => {
    setSelectedIng((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const saveMeal = () => {
    if (!mealName.trim() || selectedIng.size === 0) {
      toast({ title: "Add a name and at least one ingredient" });
      return;
    }
    const lower = mealName.toLowerCase();
    const mealType: MealType =
      lower.includes("breakfast") ? "breakfast"
      : lower.includes("snack")    ? "snack"
      : lower.includes("dinner")   ? "dinner" : "lunch";
    const newMeal: BuiltMeal = {
      id: `m-${Date.now()}`,
      name: mealName.trim(),
      ingredientIds: [...selectedIng],
      mealType,
    };
    setMealLibrary((prev) => [...prev, newMeal]);
    setMealName("");
    setSelectedIng(new Set());
    toast({ title: "Meal saved", description: newMeal.name });
  };

  const addMealToPlan = (mealId: string) => {
    setPlanDraft((p) => ({ ...p, mealIds: [...p.mealIds, mealId] }));
  };

  const removeMealFromPlan = (idx: number) => {
    setPlanDraft((p) => ({ ...p, mealIds: p.mealIds.filter((_, i) => i !== idx) }));
  };

  const planTotals = useMemo(() => {
    const meals = planDraft.mealIds.map((id) => mealLibrary.find((m) => m.id === id)).filter(Boolean) as BuiltMeal[];
    let kcal = 0, p = 0, c = 0, f = 0;
    meals.forEach((m) => {
      m.ingredientIds.forEach((iid) => {
        const ing = ingredients.find((i) => i.id === iid);
        if (!ing) return;
        kcal += ing.kcal; p += ing.protein; c += ing.carbs; f += ing.fat;
      });
    });
    return { kcal, p, c, f };
  }, [planDraft, mealLibrary, ingredients]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-end text-xs text-muted-foreground">
        <span>
          Building for{" "}
          <span className="font-semibold text-foreground">Yassin Asfour</span>
          <span className="mx-2 opacity-40">·</span>
          <span>Carina</span>
        </span>
      </div>

      {/* SECTION 1 — Ingredient picker */}
      <section className="surface-card p-5">
        <header className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 font-medium">
            <Apple className="h-4 w-4" /> Ingredients
            <span className="text-[11px] text-muted-foreground font-normal">— select foods to assemble a meal</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedIng.size} selected · {Math.round(totals.kcal)} kcal · P {Math.round(totals.p)}g · C {Math.round(totals.c)}g · F {Math.round(totals.f)}g
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ingredients…"
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 text-xs rounded-full border transition ${catFilter === c ? "bg-foreground text-background border-foreground" : "bg-surface border-border text-muted-foreground hover:text-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredIng.map((i) => {
            const sel = selectedIng.has(i.id);
            return (
              <button
                key={i.id}
                onClick={() => toggleIng(i.id)}
                className={`text-left px-3 py-2 rounded-lg border transition ${sel ? "border-foreground bg-foreground/5" : "border-border bg-surface hover:border-foreground/30"}`}
              >
                <div className="text-sm font-medium flex items-center justify-between gap-2">
                  <span className="truncate">{i.name}</span>
                  {sel && <span className="text-[10px] uppercase font-semibold">added</span>}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {i.kcal} kcal · P{i.protein} C{i.carbs} F{i.fat}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="Name this meal (e.g. Post-workout bowl)"
            className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
          <button onClick={saveMeal} className="btn-primary-pill">
            <Plus className="h-3.5 w-3.5" /> Save as meal
          </button>
        </div>
      </section>

      {/* SECTION 2 — Meal library */}
      <section className="surface-card p-5">
        <header className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 font-medium">
            <Salad className="h-4 w-4" /> Meals
            <span className="text-[11px] text-muted-foreground font-normal">— saved meals you can drop into a plan</span>
          </div>
          <span className="text-xs text-muted-foreground">{mealLibrary.length} meals</span>
        </header>

        {mealLibrary.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">No meals yet — build one above.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mealLibrary.map((m) => {
              const ingObjs = m.ingredientIds.map((id) => ingredients.find((i) => i.id === id)).filter(Boolean) as Ingredient[];
              const ings = ingObjs.map((i) => i.name);
              const kcal = ingObjs.reduce((acc, i) => acc + i.kcal, 0);
              const allergens = Array.from(new Set(ingObjs.flatMap((i) => i.allergens ?? [])));
              return (
                <li key={m.id} className="px-3 py-2.5 rounded-lg bg-surface border border-border flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                      {m.name}
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{segmentLabel[m.mealType]}</span>
                      {allergens.map((a) => (
                        <span key={a} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--status-warn-bg))] text-[hsl(var(--status-warn-fg))] capitalize">{a.replace("_", " ")}</span>
                      ))}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {ings.join(" · ")} — ~{Math.round(kcal)} kcal
                    </div>
                  </div>
                  <button
                    onClick={() => addMealToPlan(m.id)}
                    className="btn-surface-pill !px-2.5 !py-1 !text-[11px] shrink-0"
                  >
                    <Plus className="h-3 w-3" /> To plan
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* SECTION 3 — Meal plan composer */}
      <section className="surface-card p-5">
        <header className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 font-medium">
            <Grid3x3 className="h-4 w-4" /> Meal Plan
            <span className="text-[11px] text-muted-foreground font-normal">— combine meals into a daily plan</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {planDraft.mealIds.length} meals · {Math.round(planTotals.kcal)} kcal · P {Math.round(planTotals.p)}g · C {Math.round(planTotals.c)}g · F {Math.round(planTotals.f)}g
            </span>
            {planDraft.mealIds.length > 0 && (() => {
              const calRange = samplePlan.calorie_strategy.daily_allowed_range;
              const tg = samplePlan.nutrition_targets;
              const calOk = planTotals.kcal >= calRange.min_calories && planTotals.kcal <= calRange.max_calories;
              const pOk = Math.abs(planTotals.p - tg.protein_g.value) <= tg.protein_g.tolerance;
              const cOk = Math.abs(planTotals.c - tg.carbs_g.value) <= tg.carbs_g.tolerance;
              const fOk = Math.abs(planTotals.f - tg.fat_g.value) <= tg.fat_g.tolerance;
              const passed = [calOk, pOk, cOk, fOk].filter(Boolean).length;
              const tone = passed === 4 ? "bg-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))]"
                          : passed >= 2 ? "bg-[hsl(var(--status-warn-bg))] text-[hsl(var(--status-warn-fg))]"
                          : "bg-[hsl(var(--status-bad-bg))] text-[hsl(var(--status-bad-fg))]";
              return (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium ${tone}`}
                  title={`Validated vs schema targets — kcal ${calOk ? "✓" : "✗"}, P ${pOk ? "✓" : "✗"}, C ${cOk ? "✓" : "✗"}, F ${fOk ? "✓" : "✗"}`}
                >
                  <Target className="h-3 w-3" /> {passed}/4 targets
                </span>
              );
            })()}
          </div>
        </header>

        <input
          value={planDraft.name}
          onChange={(e) => setPlanDraft((p) => ({ ...p, name: e.target.value }))}
          className="w-full px-3 py-1.5 text-sm rounded-md border border-border bg-background mb-3 focus:outline-none focus:ring-1 focus:ring-foreground/20"
        />

        {planDraft.mealIds.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
            No meals added yet — use “To plan” above.
          </div>
        ) : (
          <ul className="space-y-2">
            {planDraft.mealIds.map((id, idx) => {
              const m = mealLibrary.find((x) => x.id === id);
              if (!m) return null;
              const kcal = m.ingredientIds.reduce((acc, iid) => acc + (ingredients.find((i) => i.id === iid)?.kcal ?? 0), 0);
              return (
                <li key={`${id}-${idx}`} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface border border-border">
                  <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-16">{segmentLabel[m.mealType]}</span>
                      <span className="truncate">{m.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground">{Math.round(kcal)} kcal</span>
                    <button
                      onClick={() => removeMealFromPlan(idx)}
                      className="text-muted-foreground hover:text-[hsl(var(--destructive))]"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-[hsl(var(--surface-border))] mt-5 pt-5 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Drafts auto-save. Publishing pushes the plan to the patient.
          </p>
          <button
            onClick={() => toast({ title: "Meal plan published", description: `${planDraft.name} sent to Yassin.` })}
            className="btn-primary-pill"
            disabled={planDraft.mealIds.length === 0}
          >
            <Send className="h-3.5 w-3.5" /> Publish plan
          </button>
        </div>
      </section>
    </div>
  );
}
