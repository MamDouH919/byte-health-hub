import { useMemo, useState } from "react";
import { Plus, Edit3, Check, X, CalendarDays, Save, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type Severity = "Critical" | "Moderate" | "Mild" | "Cleared";

interface RomEntry {
  motion: string;
  value: string; // e.g. "118°"
  normal: string;
}

interface PartAssessment {
  testResults: string[];      // checked tests with positive findings
  rom: RomEntry[];
  notes: string;
  severity: Severity;
  recommendation: string;
}

interface BodyPartConfig {
  key: string;
  label: string;
  tests: string[];            // common resisted / special tests
  rom: { motion: string; normal: string }[];
}

const BODY_PARTS: BodyPartConfig[] = [
  { key: "main",     label: "Main",     tests: ["General Pain", "Visible Swelling", "Postural Asymmetry"], rom: [] },
  { key: "shoulder", label: "Shoulder", tests: ["Hawkins-Kennedy", "Empty Can", "Resisted Abduction", "Resisted External Rotation"],
    rom: [
      { motion: "Flexion",            normal: "180°" },
      { motion: "Abduction",          normal: "180°" },
      { motion: "External Rotation",  normal: "90°"  },
      { motion: "Internal Rotation",  normal: "70°"  },
    ]},
  { key: "elbow",    label: "Elbow",    tests: ["Resisted Flexion", "Resisted Extension", "Resisted Pronation", "Resisted Supination"],
    rom: [
      { motion: "Flexion",   normal: "150°" },
      { motion: "Extension", normal: "0°"   },
      { motion: "Pronation", normal: "80°"  },
      { motion: "Supination",normal: "80°"  },
    ]},
  { key: "wrist",    label: "Wrist",    tests: ["Phalen's", "Tinel's", "Resisted Wrist Flexion", "Resisted Wrist Extension"],
    rom: [
      { motion: "Flexion",         normal: "80°" },
      { motion: "Extension",       normal: "70°" },
      { motion: "Radial Deviation",normal: "20°" },
      { motion: "Ulnar Deviation", normal: "30°" },
    ]},
  { key: "hip",      label: "Hip",      tests: ["FABER", "FADIR", "Resisted Hip Flexion", "Trendelenburg"],
    rom: [
      { motion: "Flexion",          normal: "120°" },
      { motion: "Extension",        normal: "30°"  },
      { motion: "Internal Rotation",normal: "40°"  },
      { motion: "External Rotation",normal: "45°"  },
    ]},
  { key: "knee",     label: "Knee",     tests: ["Lachman", "McMurray", "Anterior Drawer", "Resisted Flexion", "Squat Depth"],
    rom: [
      { motion: "Flexion",   normal: "135°" },
      { motion: "Extension", normal: "0°"   },
    ]},
  { key: "ankle",    label: "Ankle",    tests: ["Anterior Drawer", "Talar Tilt", "Single-Leg Balance", "Resisted Dorsiflexion"],
    rom: [
      { motion: "Dorsiflexion", normal: "20°" },
      { motion: "Plantarflexion",normal: "50°"},
      { motion: "Inversion",    normal: "35°" },
      { motion: "Eversion",     normal: "15°" },
    ]},
  { key: "neck",     label: "Neck",     tests: ["Spurling's", "Cervical Distraction", "Resisted Rotation"],
    rom: [
      { motion: "Flexion",   normal: "50°" },
      { motion: "Extension", normal: "60°" },
      { motion: "Rotation L",normal: "80°" },
      { motion: "Rotation R",normal: "80°" },
    ]},
  { key: "low-back", label: "Low Back", tests: ["Straight Leg Raise", "Slump Test", "McGill Big-3 Tolerance", "Active Lumbar Extension"],
    rom: [
      { motion: "Lumbar Flexion",   normal: "60°" },
      { motion: "Lumbar Extension", normal: "25°" },
      { motion: "Lateral Flex L",   normal: "25°" },
      { motion: "Lateral Flex R",   normal: "25°" },
    ]},
  { key: "vo2",      label: "VO₂ Max",  tests: ["Cooper Test (12 min)", "Beep Test", "Submaximal Treadmill"],
    rom: []},
];

const sevConfig: Record<Severity, { tone: string; accent: string; icon: typeof AlertTriangle }> = {
  Critical: { tone: "bg-[hsl(var(--status-bad-bg))]  text-[hsl(var(--status-bad-fg))]" , accent: "hsl(var(--status-bad-fg))" , icon: AlertTriangle },
  Moderate: { tone: "bg-[hsl(var(--status-warn-bg))] text-[hsl(var(--status-warn-fg))]", accent: "hsl(var(--status-warn-fg))", icon: AlertCircle },
  Mild:     { tone: "bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-fg))]", accent: "hsl(var(--status-info-fg))", icon: Info },
  Cleared:  { tone: "bg-surface text-muted-foreground border border-border", accent: "hsl(var(--muted-foreground))", icon: Check },
};

const seedData = (): Record<string, PartAssessment> => {
  const d: Record<string, PartAssessment> = {};
  BODY_PARTS.forEach((p) => {
    d[p.key] = {
      testResults: [],
      rom: p.rom.map((r) => ({ motion: r.motion, value: "", normal: r.normal })),
      notes: "",
      severity: "Cleared",
      recommendation: "",
    };
  });
  // pre-fill realistic findings to match the existing patient profile
  d.knee = {
    testResults: ["Resisted Flexion", "Squat Depth"],
    rom: [
      { motion: "Flexion",   value: "118°", normal: "135°" },
      { motion: "Extension", value: "0°",   normal: "0°"   },
    ],
    notes: "Pain (4/10) with loaded knee flexion past 90°. Mild patellofemoral crepitus, no effusion.",
    severity: "Critical",
    recommendation: "Cap loaded knee flexion at 90°. Substitute back-squat with hack squat partials and hip thrust.",
  };
  d["low-back"] = {
    testResults: ["Active Lumbar Extension"],
    rom: [
      { motion: "Lumbar Flexion",   value: "55°", normal: "60°" },
      { motion: "Lumbar Extension", value: "20°", normal: "25°" },
      { motion: "Lateral Flex L",   value: "22°", normal: "25°" },
      { motion: "Lateral Flex R",   value: "20°", normal: "25°" },
    ],
    notes: "Lumbar flare-up triggered by conventional deadlift (3/10). Tight hip flexors loading L4–L5.",
    severity: "Moderate",
    recommendation: "Trap-bar pulls only. Add 90/90 hip CARs daily and McGill big-3 stabilisation.",
  };
  d.shoulder = {
    testResults: ["Hawkins-Kennedy", "Resisted Abduction"],
    rom: [
      { motion: "Flexion",            value: "170°", normal: "180°" },
      { motion: "Abduction",          value: "150°", normal: "180°" },
      { motion: "External Rotation",  value: "70°",  normal: "90°"  },
      { motion: "Internal Rotation",  value: "60°",  normal: "70°"  },
    ],
    notes: "Mild impingement signs at 90° abduction. No frank weakness.",
    severity: "Moderate",
    recommendation: "Neutral-grip DB press over barbell OHP. Lateral raises capped at 80°.",
  };
  d.hip = {
    testResults: ["FABER"],
    rom: [
      { motion: "Flexion",          value: "125°", normal: "120°" },
      { motion: "Extension",        value: "28°",  normal: "30°"  },
      { motion: "Internal Rotation",value: "32°",  normal: "40°"  },
      { motion: "External Rotation",value: "42°",  normal: "45°"  },
    ],
    notes: "Mild anterior tightness, no impingement. ROM trending up vs last assessment.",
    severity: "Mild",
    recommendation: "Continue 90/90 mobility flow and banded hip openers pre-session.",
  };
  return d;
};

export const PhysioAssessment = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [activeKey, setActiveKey] = useState<string>("knee");
  const [data, setData] = useState<Record<string, PartAssessment>>(() => seedData());
  const [editing, setEditing] = useState(false);

  const part = useMemo(() => BODY_PARTS.find((p) => p.key === activeKey)!, [activeKey]);
  const assessment = data[activeKey];

  const updatePart = (next: Partial<PartAssessment>) => {
    setData((d) => ({ ...d, [activeKey]: { ...d[activeKey], ...next } }));
  };

  const toggleTest = (test: string) => {
    const has = assessment.testResults.includes(test);
    updatePart({
      testResults: has ? assessment.testResults.filter((t) => t !== test) : [...assessment.testResults, test],
    });
  };

  const updateRom = (motion: string, value: string) => {
    updatePart({
      rom: assessment.rom.map((r) => (r.motion === motion ? { ...r, value } : r)),
    });
  };

  const save = () => {
    setEditing(false);
    toast({
      title: "Assessment saved",
      description: `${part.label} — ${assessment.severity} · ${date}`,
    });
  };

  // Summary chips for quick overview
  const summary = useMemo(() => {
    const counts: Record<Severity, number> = { Critical: 0, Moderate: 0, Mild: 0, Cleared: 0 };
    Object.values(data).forEach((a) => { counts[a.severity]++; });
    return counts;
  }, [data]);

  return (
    <div className="space-y-5">
      <header className="surface-card p-5 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold">Medical Assessment Data</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Run body-part assessments and capture test results, ROM, and clinical impression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["Critical", "Moderate", "Mild"] as const).map((s) => {
            if (summary[s] === 0) return null;
            const cfg = sevConfig[s];
            const Icon = cfg.icon;
            return (
              <span key={s} className={`pill ${cfg.tone}`}>
                <Icon className="h-3 w-3" /> {summary[s]} {s}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-[170px]"
          />
          <button
            onClick={() => toast({ title: "New assessment", description: "Started a fresh body-part assessment." })}
            className="btn-primary-pill !h-9"
          >
            <Plus className="h-3.5 w-3.5" /> New Assessment
          </button>
        </div>
      </header>

      {/* Body part tabs */}
      <div className="surface-card p-2 overflow-x-auto">
        <div className="inline-flex items-center gap-1 min-w-full">
          {BODY_PARTS.map((p) => {
            const sev = data[p.key].severity;
            const isActive = p.key === activeKey;
            return (
              <button
                key={p.key}
                onClick={() => { setActiveKey(p.key); setEditing(false); }}
                className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                {p.label}
                {sev !== "Cleared" && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background"
                    style={{ background: sevConfig[sev].accent }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active assessment panel */}
      <section className="surface-card p-6">
        <header className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Assessment
            </div>
            <h3 className="text-lg font-semibold mt-0.5">
              {part.label} <span className="text-muted-foreground font-normal text-sm">— {date}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <SeveritySelect
              value={assessment.severity}
              onChange={(severity) => updatePart({ severity })}
              disabled={!editing}
            />
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="btn-surface-pill !h-9">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button onClick={save} className="btn-primary-pill !h-9">
                  <Save className="h-3.5 w-3.5" /> Save
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-surface-pill !h-9">
                <Edit3 className="h-3.5 w-3.5" /> Update Assessment
              </button>
            )}
          </div>
        </header>

        {/* Test results */}
        {part.tests.length > 0 && (
          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Test Results
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Toggle tests with positive findings during assessment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
              {part.tests.map((t) => {
                const positive = assessment.testResults.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!editing}
                    onClick={() => toggleTest(t)}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors ${
                      positive
                        ? "border-[hsl(var(--status-bad-fg))] bg-[hsl(var(--status-bad-bg))] text-[hsl(var(--status-bad-fg))]"
                        : "border-border bg-background hover:bg-surface text-foreground"
                    } ${!editing && "cursor-default opacity-90"}`}
                  >
                    <span className="truncate">{t}</span>
                    <span
                      className={`h-5 w-5 shrink-0 rounded-full inline-flex items-center justify-center text-[10px] ${
                        positive ? "bg-[hsl(var(--status-bad-fg))] text-background" : "bg-surface text-muted-foreground border border-border"
                      }`}
                    >
                      {positive ? "+" : "−"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ROM */}
        {assessment.rom.length > 0 && (
          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
              Range of Motion
            </div>
            <div className="space-y-2">
              {assessment.rom.map((r) => (
                <div
                  key={r.motion}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-background border border-border"
                >
                  <div className="text-sm font-medium">{r.motion}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground">normal {r.normal}</span>
                    {editing ? (
                      <Input
                        value={r.value}
                        onChange={(e) => updateRom(r.motion, e.target.value)}
                        placeholder="—"
                        className="h-8 w-24 text-sm text-right tabular-nums"
                      />
                    ) : (
                      <span className="text-sm font-semibold tabular-nums w-24 text-right">
                        {r.value || "—"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Findings + Recommendation */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Clinical Findings
            </div>
            {editing ? (
              <Textarea
                value={assessment.notes}
                onChange={(e) => updatePart({ notes: e.target.value })}
                placeholder="Findings, palpation, symptom reproduction…"
                className="min-h-[120px]"
              />
            ) : (
              <div className="rounded-lg bg-surface px-3 py-3 text-sm text-foreground/85 leading-relaxed min-h-[120px]">
                {assessment.notes || <span className="text-muted-foreground italic">No findings recorded.</span>}
              </div>
            )}
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Recommendation
            </div>
            {editing ? (
              <Textarea
                value={assessment.recommendation}
                onChange={(e) => updatePart({ recommendation: e.target.value })}
                placeholder="Substitutions, load caps, rehab steps…"
                className="min-h-[120px]"
              />
            ) : (
              <div className="rounded-lg bg-surface px-3 py-3 text-sm text-foreground/85 leading-relaxed min-h-[120px]">
                {assessment.recommendation || <span className="text-muted-foreground italic">No recommendation yet.</span>}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const SeveritySelect = ({
  value, onChange, disabled,
}: { value: Severity; onChange: (s: Severity) => void; disabled?: boolean }) => {
  const cfg = sevConfig[value];
  const Icon = cfg.icon;
  return (
    <label className={`pill ${cfg.tone} cursor-pointer ${disabled ? "opacity-80 cursor-default" : ""}`}>
      <Icon className="h-3 w-3" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Severity)}
        disabled={disabled}
        className="bg-transparent outline-none text-current font-medium pr-1"
      >
        {(["Critical", "Moderate", "Mild", "Cleared"] as Severity[]).map((s) => (
          <option key={s} value={s} className="text-foreground bg-background">{s}</option>
        ))}
      </select>
    </label>
  );
};
