import { useState } from "react";
import { Footprints, Flame, Clock, HeartPulse, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface HrZone {
  id: string;
  label: string;
  /** Lower bound as % of HRmax */
  pctLo: number;
  /** Upper bound as % of HRmax */
  pctHi: number;
  description: string;
  selected: boolean;
}

export interface ExerciseGoals {
  steps: number;
  calories: number;
  minutes: number;
  avgHr: number;
  zones: HrZone[];
}

export const defaultExerciseGoals: ExerciseGoals = {
  steps: 8000,
  calories: 450,
  minutes: 45,
  avgHr: 138,
  zones: [
    { id: "z1", label: "Zone 1 — Recovery",   pctLo: 50, pctHi: 60, description: "Very light. Active recovery & warm-ups.",        selected: false },
    { id: "z2", label: "Zone 2 — Aerobic",    pctLo: 60, pctHi: 70, description: "Easy aerobic. Builds endurance base.",            selected: true  },
    { id: "z3", label: "Zone 3 — Tempo",      pctLo: 70, pctHi: 80, description: "Moderate. Improves aerobic capacity.",            selected: true  },
    { id: "z4", label: "Zone 4 — Threshold",  pctLo: 80, pctHi: 90, description: "Hard. Lactate threshold work.",                   selected: false },
    { id: "z5", label: "Zone 5 — VO₂ Max",    pctLo: 90, pctHi: 100, description: "Maximum effort. Short intervals only.",          selected: false },
  ],
};

interface Props {
  value: ExerciseGoals;
  onChange: (next: ExerciseGoals) => void;
  age: number;
}

const StatCard = ({
  Icon, label, value, unit, onCommit,
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  unit: string;
  onCommit: (v: number) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const start = () => { setDraft(String(value)); setEditing(true); };
  const save  = () => {
    const n = parseInt(draft.replace(/[^\d]/g, ""), 10);
    if (!isNaN(n) && n >= 0) onCommit(n);
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-3 flex flex-col gap-1.5 group relative">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
        {!editing && (
          <button
            onClick={start}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      {editing ? (
        <div className="flex items-center gap-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            autoFocus
            className="h-7 text-sm font-semibold px-2"
          />
          <button onClick={save} className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-background text-foreground" aria-label="Save"><Check className="h-3 w-3" /></button>
          <button onClick={() => setEditing(false)} className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-background text-muted-foreground" aria-label="Cancel"><X className="h-3 w-3" /></button>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold tabular-nums text-foreground">{value.toLocaleString()}</span>
          <span className="text-[11px] text-muted-foreground">{unit}</span>
        </div>
      )}
    </div>
  );
};

export function ExerciseGoalCard({ value, onChange, age }: Props) {
  const hrMax = 220 - age;

  const update = (patch: Partial<ExerciseGoals>) => onChange({ ...value, ...patch });

  const toggleZone = (id: string) =>
    update({
      zones: value.zones.map((z) => (z.id === id ? { ...z, selected: !z.selected } : z)),
    });

  return (
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard Icon={Footprints as any}  label="Daily steps"      value={value.steps}    unit="steps/day"  onCommit={(v) => update({ steps: v })} />
        <StatCard Icon={Flame as any}       label="Calories burned"  value={value.calories} unit="kcal/day"   onCommit={(v) => update({ calories: v })} />
        <StatCard Icon={Clock as any}       label="Exercise minutes" value={value.minutes}  unit="min/session" onCommit={(v) => update({ minutes: v })} />
        <StatCard Icon={HeartPulse as any}  label="Avg heart rate"   value={value.avgHr}    unit="bpm"        onCommit={(v) => update({ avgHr: v })} />
      </div>

      {/* HR zones */}
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Heart-Rate Zones
          </div>
          <span className="text-[10.5px] text-muted-foreground tabular-nums">
            HRmax ≈ {hrMax} bpm (220 − {age})
          </span>
        </div>
        <div className="space-y-1.5">
          {value.zones.map((z) => {
            const lo = Math.round((z.pctLo / 100) * hrMax);
            const hi = Math.round((z.pctHi / 100) * hrMax);
            return (
              <button
                key={z.id}
                onClick={() => toggleZone(z.id)}
                className={`w-full text-left rounded-md border px-3 py-2 transition-colors flex items-center gap-3 ${
                  z.selected
                    ? "border-foreground bg-background shadow-[var(--shadow-card)]"
                    : "border-border bg-surface/60 hover:bg-background"
                }`}
              >
                <span
                  className={`h-3.5 w-3.5 rounded-sm border shrink-0 inline-flex items-center justify-center ${
                    z.selected ? "border-foreground bg-foreground text-background" : "border-border bg-background"
                  }`}
                >
                  {z.selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-semibold text-foreground truncate">{z.label}</span>
                    <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">
                      {lo}–{hi} bpm · {z.pctLo}–{z.pctHi}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{z.description}</p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10.5px] text-muted-foreground">
          Tap to select the zones the patient should train in. AI defaults selected — override anytime.
        </p>
      </div>

      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold pt-1">
        Clinician notes
      </div>
    </div>
  );
}
