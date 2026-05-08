// Seed data based on screenshots — keep names & values consistent for QA.
import type { LucideIcon } from "lucide-react";
import {
  Sun, Droplet, Footprints, Apple, Moon, Wind, Activity, Coffee, Salad, Bed, Brain,
} from "lucide-react";

export type PlanStatus = "Complete" | "Incomplete" | "Requires adjustment" | "Missing";

export interface PatientRow {
  id: string;
  name: string;
  company: string;
  userId: string;
  meal: PlanStatus;
  exercise: PlanStatus;
  sleep: PlanStatus;
  totalAvg: number;
  last14: number;
  trendPct: number; // positive = up, negative = down
}

export const patients: PatientRow[] = [
  { id: "yassin-05", name: "Yassin Asfour", company: "Carina", userId: "05", meal: "Requires adjustment", exercise: "Complete", sleep: "Requires adjustment", totalAvg: 23, last14: 71, trendPct: 15 },
  { id: "ali-02",    name: "Ali Farag",     company: "Adsero", userId: "02", meal: "Missing",             exercise: "Incomplete", sleep: "Missing",             totalAvg: 32, last14: 21, trendPct: 15 },
  { id: "motasim-04",name: "Motasim Hamdi", company: "Wayup",  userId: "04", meal: "Incomplete",          exercise: "Requires adjustment", sleep: "Incomplete",  totalAvg: 31, last14: 32, trendPct: -8 },
  { id: "yassin-06", name: "Yassin Asfour", company: "Carina", userId: "06", meal: "Requires adjustment", exercise: "Complete", sleep: "Requires adjustment", totalAvg: 21, last14: 53, trendPct: 12 },
  { id: "ali-01",    name: "Ali Farag",     company: "Byte",   userId: "01", meal: "Missing",             exercise: "Incomplete", sleep: "Missing",             totalAvg: 34, last14: 64, trendPct: -8 },
  { id: "motasim-03",name: "Motasim Hamdi", company: "Asfour", userId: "03", meal: "Incomplete",          exercise: "Requires adjustment", sleep: "Incomplete",  totalAvg: 22, last14: 53, trendPct: 4 },
  { id: "lina-07",   name: "Lina Khoury",   company: "Carina", userId: "07", meal: "Complete",            exercise: "Complete", sleep: "Complete",            totalAvg: 18, last14: 84, trendPct: 9 },
  { id: "omar-08",   name: "Omar El-Sayed", company: "Byte",   userId: "08", meal: "Requires adjustment", exercise: "Incomplete", sleep: "Requires adjustment", totalAvg: 27, last14: 46, trendPct: -3 },
  { id: "noura-09",  name: "Noura Hassan",  company: "Wayup",  userId: "09", meal: "Complete",            exercise: "Requires adjustment", sleep: "Complete",  totalAvg: 25, last14: 72, trendPct: 6 },
];

export const dashboardStats = [
  { label: "High Risk",        value: 78, trendPct: -8 },
  { label: "Low Engagement",   value: 43, trendPct: 15 },
  { label: "Incomp. Plans",    value: 12, trendPct: -8 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Per-patient health snapshots, meta, insights, blood tests
// ─────────────────────────────────────────────────────────────────────────────

export interface SnapshotRow {
  label: string; value: number; unit: string;
  min: number; max: number; scaleMin: number; scaleMax: number;
  status: string;
}

export interface PatientMeta {
  age: number;
  bioAge: number;
  gender: "Male" | "Female";
  riskLevel: "Low" | "Moderate" | "High";
  adherencePct: number;
  lastSync: string;
  conditions: string[];
  goal: string;
}

export interface PatientProfile {
  meta: PatientMeta;
  snapshot: SnapshotRow[];
  insights: { issue: string; explanation: string }[];
  bloodTests: typeof defaultBloodTests;
  reports: ReportCardData[];
}

export interface ReportCardData {
  key: string;
  title: string;
  category: string;            // e.g. Body composition
  date: string;
  status: "Optimal" | "Normal" | "Needs attention";
  summary: string;
  metrics: { label: string; value: string }[];
  // Optional rich content used by per-report inline views
  bodyComposition?: BloodMetric[];
  surveyAnswers?: SurveyAnswer[];
  physioFindings?: PhysioFinding[];
  wearableMetrics?: WearableMetric[];
  /** Short clinician-facing context shown above the inline content. */
  context?: string;
}

export type WearableCategory = "Sleep" | "Heart Health" | "Activity" | "Exercise";
export type WearableChart = "area" | "bar";

export interface WearableMetric {
  key: string;
  label: string;
  category: WearableCategory;
  chart: WearableChart;
  unit?: string;
  display: string;          // current value formatted
  value: number;            // current numeric value (for trend math)
  status?: "Optimal" | "Normal" | "Needs attention";
  // Monthly history (most recent last)
  history: { month: string; value: number }[];
}

export interface SurveyAnswer {
  question: string;
  answer: string;
  category: "Mental Health" | "Allergies" | "Family History" | "Goals" | "Nutrition" | "Lifestyle";
  priority: "critical" | "important" | "standard";
}

export interface PhysioFinding {
  region: string;            // e.g. "Right Knee", "Lower Back"
  severity: "Critical" | "Moderate" | "Mild";
  test: string;              // e.g. "Resisted Flexion", "Squat depth"
  finding: string;           // narrative finding
  rom?: { motion: string; value: string; normal: string }[];
  recommendation?: string;
}

const defaultBloodTests = {
  cbc: {
    status: "Normal" as const,
    metrics: [
      { name: "Hemoglobin",  value: 13.2, display: "13.2", unit: "g/dL",   range: "13.5–17.5", min: 13.5, max: 17.5, scaleMin: 10,  scaleMax: 20,  status: "Needs attention" as const, prev: 13.0 },
      { name: "WBC",         value: 11.4, display: "11.4", unit: "10³/µL", range: "4.0–10.0",  min: 4.0,  max: 10.0, scaleMin: 2,   scaleMax: 14,  status: "Needs attention" as const, prev: 9.6 },
      { name: "Platelets",   value: 245,  display: "245",  unit: "10³/µL", range: "150–400",   min: 150,  max: 400,  scaleMin: 100, scaleMax: 450, status: "Optimal" as const, prev: 240 },
      { name: "RBC",         value: 4.9,  display: "4.9",  unit: "10⁶/µL", range: "4.5–5.9",   min: 4.5,  max: 5.9,  scaleMin: 3,   scaleMax: 7,   status: "Optimal" as const, prev: 4.8 },
    ] as BloodMetric[],
  },
  hormones: {
    status: "Normal" as const,
    metrics: [
      { name: "Free Testosterone", value: 7.5,  display: "7.5",  unit: "pg/mL", range: "8.7–25.1",   min: 8.7,   max: 25.1,  scaleMin: 0,   scaleMax: 30,  status: "Needs attention" as const, prev: 8.1 },
      { name: "Total Testosterone",value: 650,  display: "650",  unit: "ng/dL", range: "300.0–950.0",min: 300,   max: 950,   scaleMin: 200, scaleMax: 1100,status: "Optimal" as const, prev: 610 },
      { name: "Cortisol",          value: 8,    display: "8",    unit: "µg/dL", range: "6.0–18.4",   min: 6,     max: 18.4,  scaleMin: 2,   scaleMax: 22,  status: "Needs attention" as const, prev: 9 },
      { name: "DHEA-S",            value: 300,  display: "300",  unit: "µg/dL", range: "120.0–520.0",min: 120,   max: 520,   scaleMin: 50,  scaleMax: 600, status: "Optimal" as const, prev: 290 },
      { name: "Estradiol",         value: 14,   display: "14",   unit: "pg/mL", range: "10.0–40.0",  min: 10,    max: 40,    scaleMin: 0,   scaleMax: 50,  status: "Needs attention" as const, prev: 13 },
    ] as BloodMetric[],
  },
};

export interface BloodMetric {
  name: string;
  value: number;
  display: string;
  unit: string;
  range: string;
  min: number;
  max: number;
  scaleMin: number;
  scaleMax: number;
  status: "Optimal" | "Normal" | "Needs attention";
  prev?: number;
}

// Legacy export for any existing imports
export const bloodTests = defaultBloodTests;

const buildBodyComposition = (bodyFat: number, weight = 84.7, height = 178): BloodMetric[] => {
  const heightM = height / 100;
  const bmi = +(weight / (heightM * heightM)).toFixed(1);
  const smm = +(weight * (1 - bodyFat / 100) * 0.55).toFixed(1); // skeletal muscle mass approx
  const water = +(weight * 0.58).toFixed(1);
  const visceral = bodyFat > 25 ? 13 : bodyFat > 20 ? 9 : 6;
  return [
    { name: "Weight",        value: weight,   display: weight.toFixed(1),   unit: "kg",    range: "70–85",     min: 70,  max: 85,   scaleMin: 55,  scaleMax: 110, status: weight > 85 ? "Needs attention" : "Optimal", prev: +(weight + 1.4).toFixed(1) },
    { name: "Height",        value: height,   display: String(height),       unit: "cm",    range: "—",         min: 150, max: 200,  scaleMin: 140, scaleMax: 210, status: "Normal", prev: height },
    { name: "BMI",           value: bmi,      display: bmi.toFixed(1),       unit: "kg/m²", range: "18.5–24.9", min: 18.5,max: 24.9, scaleMin: 15,  scaleMax: 35,  status: bmi > 24.9 ? "Needs attention" : "Optimal", prev: +(bmi + 0.4).toFixed(1) },
    { name: "Body Fat (PBF)",value: bodyFat,  display: bodyFat.toFixed(1),   unit: "%",     range: "10–20",     min: 10,  max: 20,   scaleMin: 5,   scaleMax: 40,  status: bodyFat > 20 ? "Needs attention" : "Optimal", prev: +(bodyFat + 1.2).toFixed(1) },
    { name: "Visceral Fat",  value: visceral, display: String(visceral),     unit: "level", range: "1–9",       min: 1,   max: 9,    scaleMin: 0,   scaleMax: 20,  status: visceral > 9 ? "Needs attention" : "Optimal", prev: visceral + 1 },
    { name: "Skeletal Muscle (SMM)", value: smm, display: smm.toFixed(1),    unit: "kg",    range: "30–38",     min: 30,  max: 38,   scaleMin: 20,  scaleMax: 45,  status: smm < 30 ? "Needs attention" : "Optimal", prev: +(smm - 0.6).toFixed(1) },
    { name: "Body Water",    value: water,    display: water.toFixed(1),     unit: "L",     range: "42–54",     min: 42,  max: 54,   scaleMin: 30,  scaleMax: 65,  status: water < 42 ? "Needs attention" : "Optimal", prev: +(water - 0.3).toFixed(1) },
  ];
};

const defaultSurvey: SurveyAnswer[] = [
  { question: "Do you have a history of mental health concerns or chronic stress?", answer: "Moderate work-related stress (6/10). History of mild anxiety, no medication. Sleep onset latency 30+ min on high-stress days.", category: "Mental Health", priority: "critical" },
  { question: "Any known food, drug, or environmental allergies?", answer: "Severe peanut allergy (carries EpiPen). Mild lactose intolerance. No known drug allergies.", category: "Allergies", priority: "critical" },
  { question: "Family history of cardiovascular disease, diabetes, or cancer?", answer: "Father: Type 2 diabetes diagnosed at 52, hypertension. Mother: high cholesterol. Maternal grandfather: MI at 61.", category: "Family History", priority: "critical" },
  { question: "Current mood / energy levels (1–10)?", answer: "Energy 6/10, mood 7/10. Notable afternoon dip around 3pm.", category: "Mental Health", priority: "important" },
  { question: "Primary health goals for the next 6 months?", answer: "Pain-free training, drop body fat to 18%, sustainably increase Zone-2 capacity for hiking trip in October.", category: "Goals", priority: "important" },
  { question: "Average weekly protein intake?", answer: "≈ 130 g/day across 3–4 meals. Mostly chicken, eggs, whey post-workout. Tracks ~1.5 g/kg.", category: "Nutrition", priority: "standard" },
  { question: "Alcohol & smoking status?", answer: "Non-smoker. 2–3 drinks/week, mostly weekends.", category: "Lifestyle", priority: "standard" },
  { question: "Caffeine intake & timing?", answer: "2 coffees/day. Last caffeine moved to 1pm to support sleep.", category: "Lifestyle", priority: "standard" },
  { question: "Hydration target hit on most days?", answer: "Yes — averages 2.6 L/day per wearable log.", category: "Lifestyle", priority: "standard" },
  { question: "Dietary preferences or restrictions?", answer: "Mediterranean-leaning. Avoids dairy. Open to most cuisines.", category: "Nutrition", priority: "standard" },
];

const defaultPhysio: PhysioFinding[] = [
  { region: "Right Knee", severity: "Critical", test: "Resisted Flexion + Squat depth",
    finding: "Pain (4/10) with loaded knee flexion past 90°. Mild patellofemoral crepitus, no effusion.",
    rom: [
      { motion: "Flexion",   value: "118°", normal: "135°" },
      { motion: "Extension", value: "0°",   normal: "0°" },
    ],
    recommendation: "Cap loaded knee flexion at 90°. Substitute back-squat with hack squat partials and hip thrust." },
  { region: "Lower Back", severity: "Moderate", test: "Active Lumbar Extension",
    finding: "Lumbar flare-up triggered by conventional deadlift (3/10). Tight hip flexors loading L4–L5.",
    rom: [
      { motion: "Lumbar Flexion",   value: "55°", normal: "60°" },
      { motion: "Lumbar Extension", value: "20°", normal: "25°" },
    ],
    recommendation: "Trap-bar pulls only. Add 90/90 hip CARs daily and McGill big-3 stabilisation." },
  { region: "Right Shoulder", severity: "Moderate", test: "Hawkins-Kennedy + Resisted Abduction",
    finding: "Mild impingement signs at 90° abduction. No frank weakness.",
    rom: [
      { motion: "Abduction",        value: "150°", normal: "180°" },
      { motion: "External Rotation",value: "70°",  normal: "90°" },
    ],
    recommendation: "Neutral-grip DB press over barbell OHP. Lateral raises capped at 80°." },
  { region: "Left Hip", severity: "Mild", test: "FABER + Hip ROM",
    finding: "Mild anterior tightness, no impingement. ROM trending up vs last assessment.",
    rom: [
      { motion: "Flexion",          value: "125°", normal: "120°" },
      { motion: "Internal Rotation",value: "32°",  normal: "40°" },
    ],
    recommendation: "Continue 90/90 mobility flow and banded hip openers pre-session." },
];

// ── Wearable metric history builder ──────────────────────────────────────────
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const lastNMonths = (n: number) => {
  const now = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(MONTH_NAMES[d.getMonth()]);
  }
  return out;
};

const seriesFor = (seed: string, end: number, deltaPct: number, jitterPct = 8, months = 8) => {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const start = Math.max(1, Math.round(end / (1 + deltaPct / 100)));
  const labels = lastNMonths(months);
  const data = labels.map((month, i) => {
    const t = i / (labels.length - 1);
    const base = start + (end - start) * t;
    const noise = (rand() - 0.5) * (Math.abs(end) * jitterPct / 100);
    const value = Math.max(0, +(base + noise).toFixed(1));
    return { month, value };
  });
  data[data.length - 1].value = end;
  return data;
};

const sleepStagesSeries = (seed: string, months = 8) => {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  return lastNMonths(months).map((month) => {
    const deep  = +(60 + rand() * 30).toFixed(0);   // min
    const rem   = +(80 + rand() * 35).toFixed(0);
    const light = +(180 + rand() * 60).toFixed(0);
    const awake = +(15 + rand() * 15).toFixed(0);
    return { month, deep, rem, light, awake };
  });
};

const buildWearableMetrics = (
  seed: string, sleepScore: number, hrv: number
): WearableMetric[] => {
  const stages = sleepStagesSeries(seed);
  const last = stages[stages.length - 1];
  const fmtMin = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
  const stageHistory = (key: "deep" | "rem" | "light" | "awake") =>
    stages.map(s => ({ month: s.month, value: s[key] }));

  return [
    // Sleep
    { key: "avg-sleep-score", label: "Avg. Sleep Score", category: "Sleep", chart: "area",
      unit: "/100", value: sleepScore, display: `${sleepScore}`,
      status: sleepScore >= 70 ? "Optimal" : "Needs attention",
      history: seriesFor(seed + "ss", sleepScore, 6, 6) },
    { key: "sleep-deep", label: "Deep Sleep", category: "Sleep", chart: "area",
      unit: "per night", value: last.deep, display: fmtMin(last.deep),
      status: last.deep >= 70 ? "Optimal" : "Needs attention",
      history: stageHistory("deep") },
    { key: "sleep-rem", label: "REM Sleep", category: "Sleep", chart: "area",
      unit: "per night", value: last.rem, display: fmtMin(last.rem),
      status: last.rem >= 90 ? "Optimal" : "Normal",
      history: stageHistory("rem") },
    { key: "sleep-light", label: "Light Sleep", category: "Sleep", chart: "area",
      unit: "per night", value: last.light, display: fmtMin(last.light),
      status: "Normal",
      history: stageHistory("light") },
    { key: "sleep-awake", label: "Awake Time", category: "Sleep", chart: "bar",
      unit: "per night", value: last.awake, display: fmtMin(last.awake),
      status: last.awake > 25 ? "Needs attention" : "Optimal",
      history: stageHistory("awake") },

    // Heart health
    { key: "avg-hr", label: "Avg. Heart Rate", category: "Heart Health", chart: "bar",
      unit: "bpm", value: 68, display: "68",
      status: "Normal",
      history: seriesFor(seed + "ahr", 68, -4, 4) },
    { key: "rhr", label: "Resting Heart Rate", category: "Heart Health", chart: "bar",
      unit: "bpm", value: 54, display: "54",
      status: "Optimal",
      history: seriesFor(seed + "rhr", 54, -8, 5) },
    { key: "hrv", label: "HRV", category: "Heart Health", chart: "area",
      unit: "ms", value: hrv, display: `${hrv}`,
      status: hrv < 45 ? "Needs attention" : "Optimal",
      history: seriesFor(seed + "hrv", hrv, 12, 10) },

    // Activity
    { key: "steps", label: "Steps", category: "Activity", chart: "bar",
      unit: "/day", value: 8200, display: "8,200",
      status: "Normal",
      history: seriesFor(seed + "stp", 8200, 18, 12) },
    { key: "avg-cal", label: "Avg. Daily Calories", category: "Activity", chart: "area",
      unit: "kcal", value: 2450, display: "2,450",
      status: "Normal",
      history: seriesFor(seed + "cal", 2450, 5, 6) },

    // Exercise
    { key: "ex-mins", label: "Avg. Exercise Mins", category: "Exercise", chart: "bar",
      unit: "min/day", value: 42, display: "42",
      status: "Optimal",
      history: seriesFor(seed + "exm", 42, 25, 14) },
    { key: "ex-hr", label: "Avg. Exercise Heart Rate", category: "Exercise", chart: "bar",
      unit: "bpm", value: 138, display: "138",
      status: "Normal",
      history: seriesFor(seed + "exh", 138, 3, 4) },
    { key: "ex-points", label: "Avg. Exercise Points", category: "Exercise", chart: "area",
      unit: "/50", value: 38, display: "38",
      status: "Optimal",
      history: seriesFor(seed + "exp", 38, 22, 10) },
  ];
};

const buildReports = (
  bodyFat: number, vo2: number, sleepScore: number, hrv: number, glucose: number,
  seed: string = "default"
): ReportCardData[] => [
  { key: "body-composition", title: "Body Composition", category: "InBody Scan", date: "Apr 12, 2026", status: bodyFat > 22 ? "Needs attention" : "Optimal",
    summary: "Full segmental analysis: weight, BMI, visceral fat, SMM, body fat %, body water, height.",
    context: bodyFat > 22
      ? `Body fat (${bodyFat}%) and BMI sit above the optimal band — visceral fat is the priority lever. Lean mass and hydration are stable, so the focus is calorie partitioning rather than weight loss alone.`
      : `Composition is on track: body fat ${bodyFat}%, lean mass holding, visceral fat in the safe zone. Maintain current protein and resistance work to protect SMM through the cut.`,
    metrics: [
      { label: "Body Fat", value: `${bodyFat}%` }, { label: "BMI", value: "26.7 kg/m²" }, { label: "Visceral fat", value: bodyFat > 22 ? "12" : "7" },
    ],
    bodyComposition: buildBodyComposition(bodyFat),
  },
  { key: "blood-tests", title: "Blood Tests", category: "Lab Panel", date: "Apr 5, 2026", status: "Normal",
    summary: "CBC + hormone panel reviewed by clinician.",
    context: "CBC broadly normal with mildly elevated WBC (likely post-training). Free testosterone trends low — worth re-checking in 8 weeks alongside cortisol and sleep score.",
    metrics: [
    { label: "Hemoglobin", value: "13.2 g/dL" }, { label: "WBC", value: "11.4" }, { label: "Cortisol", value: "8 µg/dL" },
  ]},
  { key: "user-survey", title: "User Survey", category: "Self-report", date: "Apr 10, 2026", status: "Normal",
    summary: "Wellbeing, lifestyle, family history and goals — critical answers prioritised at the top.",
    context: "Three critical flags: severe peanut allergy, work-related stress with disrupted sleep onset, and a strong family history of T2D + CVD. All plan decisions should reference these.",
    metrics: [
      { label: "Critical flags", value: "3" }, { label: "Allergies", value: "Peanut (severe)" }, { label: "Family Hx", value: "T2D · CVD" },
    ],
    surveyAnswers: defaultSurvey,
  },
  { key: "physio-assessment", title: "Physio Assessment", category: "Movement Screen", date: "Mar 28, 2026", status: "Needs attention",
    summary: "Priority issues from the body-part assessment, ranked by severity.",
    context: "Right knee is the rate-limiter — loaded flexion past 90° provokes pain and crepitus. Lumbar and shoulder findings are manageable with substitutions; left hip is improving.",
    metrics: [
      { label: "Critical findings", value: "1" }, { label: "Moderate", value: "2" }, { label: "Mild", value: "1" },
    ],
    physioFindings: defaultPhysio,
  },
  { key: "wearable-data", title: "Wearable Data", category: "Continuous tracking", date: "Last 14 days", status: hrv < 45 ? "Needs attention" : "Optimal",
    summary: "Sleep, heart health, activity and exercise — historical trends across the last 8 months.",
    context: hrv < 45
      ? `HRV (${hrv} ms) is suppressed and sleep score (${sleepScore}/100) sits below target — autonomic load is elevated. Volume has been redistributed mid-week, RHR remains stable.`
      : `Recovery markers are strong: HRV ${hrv} ms, RHR steady, exercise points trending up. Sleep score ${sleepScore}/100 supports the current training load.`,
    metrics: [
      { label: "Sleep score", value: `${sleepScore}/100` }, { label: "Avg HRV", value: `${hrv} ms` }, { label: "VO₂ max", value: `${vo2}` }, { label: "Fasting glucose", value: `${glucose} mmol/L` },
    ],
    wearableMetrics: buildWearableMetrics(seed + sleepScore + hrv, sleepScore, hrv),
  },
];

// Snapshot template
const snapshot = (
  weight: number, bodyFat: number, steps: number, sleepScore: number, exerciseAvg: number
): SnapshotRow[] => [
  { label: "Weight",       value: weight,      unit: "kg",   min: 70,   max: 85,    scaleMin: 60,  scaleMax: 110,   status: weight > 85 ? "Needs attention" : "Normal" },
  { label: "Body Fat",     value: bodyFat,     unit: "%",    min: 10,   max: 20,    scaleMin: 5,   scaleMax: 40,    status: bodyFat > 20 ? "Needs attention" : "Optimal" },
  { label: "Steps",        value: steps,       unit: "/day", min: 7000, max: 12000, scaleMin: 0,   scaleMax: 15000, status: steps >= 7000 ? "Optimal" : "Needs attention" },
  { label: "Sleep score",  value: sleepScore,  unit: "/100", min: 70,   max: 100,   scaleMin: 0,   scaleMax: 100,   status: sleepScore >= 70 ? "Optimal" : "Needs attention" },
  { label: "Exercise Avg", value: exerciseAvg, unit: "/50",  min: 35,   max: 50,    scaleMin: 0,   scaleMax: 50,    status: exerciseAvg >= 35 ? "Optimal" : "Normal" },
];


export const patientProfiles: Record<string, PatientProfile> = {
  "yassin-05": {
    meta: { age: 33, bioAge: 30, gender: "Male", riskLevel: "Moderate", adherencePct: 71, lastSync: "2h ago", conditions: ["Pre-diabetic", "ACL recovery"], goal: "Body recomposition" },
    snapshot: snapshot(92.4, 28.7, 6200, 52, 34),
    insights: [
      { issue: "Elevated HbA1c (6.1%)",         explanation: "Pre-diabetic range" },
      { issue: "Right Knee Pain (4/10)",        explanation: "Reported during squats & stairs" },
      { issue: "Low Nutrition Adherence (58%)", explanation: "Frequent late-night eating" },
      { issue: "Recovery Deficit",              explanation: "Avg sleep: 5h 45m | Low HRV trend" },
    ],
    bloodTests: defaultBloodTests,
    reports: buildReports(28.7, 38, 52, 42, 5.8),
  },
  "yassin-06": {
    meta: { age: 33, bioAge: 31, gender: "Male", riskLevel: "Moderate", adherencePct: 53, lastSync: "6h ago", conditions: ["Insulin resistance", "Shoulder impingement"], goal: "Strength rebuild" },
    snapshot: snapshot(94.1, 29.4, 5400, 58, 30),
    insights: [
      { issue: "HOMA-IR 2.8",                   explanation: "Insulin resistance mild — restrict refined carbs" },
      { issue: "Right shoulder pain (3/10)",    explanation: "On overhead press; avoid until reassessed" },
      { issue: "Travel week disruption",        explanation: "5 missed sessions, sleep window shifted +2h" },
    ],
    bloodTests: defaultBloodTests,
    reports: buildReports(29.4, 34, 58, 40, 6.0),
  },
  "ali-01": {
    meta: { age: 41, bioAge: 44, gender: "Male", riskLevel: "High", adherencePct: 38, lastSync: "1d ago", conditions: ["Hypertension", "Sedentary"], goal: "Blood pressure control" },
    snapshot: snapshot(98.2, 31.4, 3800, 48, 22),
    insights: [
      { issue: "Stage-1 hypertension (142/92)", explanation: "Sustained over last 7 days" },
      { issue: "Very low step count",           explanation: "Avg 3.8k/day, target 8k+" },
      { issue: "Skipped check-ins (3)",         explanation: "Engagement dropping last 2 weeks" },
    ],
    bloodTests: defaultBloodTests,
    reports: buildReports(31.4, 28, 48, 38, 6.1),
  },
  "ali-02": {
    meta: { age: 38, bioAge: 36, gender: "Male", riskLevel: "Moderate", adherencePct: 64, lastSync: "45m ago", conditions: ["Lower back pain", "High LDL"], goal: "Pain-free training" },
    snapshot: snapshot(84.7, 24.6, 7800, 68, 38),
    insights: [
      { issue: "Lumbar flare-up (3/10)",        explanation: "Triggered by deadlift session — switched to trap-bar" },
      { issue: "LDL 3.4 mmol/L",                explanation: "Borderline high; nutrition swap to omega-3 rich meals" },
      { issue: "Strong cardio progression",     explanation: "Zone-2 capacity +12% over 6 weeks" },
      { issue: "Sleep latency 38 min",          explanation: "Caffeine cutoff moved to 1pm" },
    ],
    bloodTests: defaultBloodTests,
    reports: buildReports(24.6, 44, 68, 52, 5.4),
  },
  "motasim-03": {
    meta: { age: 29, bioAge: 27, gender: "Male", riskLevel: "Low", adherencePct: 81, lastSync: "20m ago", conditions: ["Asthma (mild)"], goal: "Hybrid endurance + strength" },
    snapshot: snapshot(76.3, 16.8, 10400, 82, 42),
    insights: [
      { issue: "VO₂ max 52 ml/kg/min",          explanation: "Top decile for age — sustain Z2 base" },
      { issue: "Iron at lower bound",           explanation: "Ferritin 38 ng/mL — added beef liver 2×/wk" },
      { issue: "Asthma well-controlled",        explanation: "Zero rescue-inhaler uses in last 30 days" },
    ],
    bloodTests: defaultBloodTests,
    reports: buildReports(16.8, 52, 82, 64, 4.9),
  },
  "motasim-04": {
    meta: { age: 29, bioAge: 28, gender: "Male", riskLevel: "Low", adherencePct: 88, lastSync: "8m ago", conditions: ["Tendinopathy (R Achilles)"], goal: "Marathon prep" },
    snapshot: snapshot(74.8, 15.4, 12200, 88, 45),
    insights: [
      { issue: "Achilles tendon loading plan",  explanation: "Isometric heel raises 4×/wk — pain trending down (1/10)" },
      { issue: "Resting HR 48 bpm",             explanation: "Excellent aerobic adaptation" },
      { issue: "Carbohydrate periodisation",    explanation: "Long runs fueled at 70g/h — gut tolerance solid" },
      { issue: "HRV +18% month-over-month",     explanation: "Recovery capacity expanding" },
    ],
    bloodTests: defaultBloodTests,
    reports: buildReports(15.4, 58, 88, 72, 4.7),
  },
  "lina-07": {
    meta: { age: 28, bioAge: 26, gender: "Female", riskLevel: "Low", adherencePct: 92, lastSync: "12m ago", conditions: ["PCOS (managed)"], goal: "Strength & longevity" },
    snapshot: snapshot(62.1, 22.4, 11200, 86, 44),
    insights: [
      { issue: "Excellent recovery trend",  explanation: "HRV up 14% over 30 days" },
      { issue: "Slight iron dip",           explanation: "Ferritin 26 ng/mL — supplement added" },
    ],
    bloodTests: defaultBloodTests,
    reports: buildReports(22.4, 48, 86, 62, 4.8),
  },
  "omar-08": {
    meta: { age: 52, bioAge: 55, gender: "Male", riskLevel: "Moderate", adherencePct: 54, lastSync: "5h ago", conditions: ["Type 2 Diabetes", "High LDL"], goal: "Reverse insulin resistance" },
    snapshot: snapshot(88.0, 26.1, 5400, 64, 28),
    insights: [
      { issue: "Fasting glucose 7.2 mmol/L", explanation: "Above target — adjust evening carbs" },
      { issue: "LDL 3.8 mmol/L",             explanation: "Statin dose review pending" },
    ],
    bloodTests: defaultBloodTests,
    reports: buildReports(26.1, 32, 64, 44, 7.2),
  },
  "noura-09": {
    meta: { age: 36, bioAge: 34, gender: "Female", riskLevel: "Low", adherencePct: 78, lastSync: "30m ago", conditions: ["Postpartum recovery"], goal: "Rebuild aerobic base" },
    snapshot: snapshot(68.4, 25.0, 8400, 74, 36),
    insights: [
      { issue: "Aerobic capacity returning",  explanation: "VO₂ +6% vs. last cycle" },
      { issue: "Pelvic-floor program adherence", explanation: "5/7 sessions completed" },
    ],
    bloodTests: defaultBloodTests,
    reports: buildReports(25.0, 36, 74, 52, 5.0),
  },
};

// Default profile fallback (legacy code may import these)
export const healthSnapshot = patientProfiles["yassin-05"].snapshot;
export const patientMeta = {
  riskLevel: patientProfiles["yassin-05"].meta.riskLevel,
  adherencePct: patientProfiles["yassin-05"].meta.adherencePct,
  lastSync: patientProfiles["yassin-05"].meta.lastSync,
  conditions: patientProfiles["yassin-05"].meta.conditions,
};
export const keyInsights = patientProfiles["yassin-05"].insights;

export const getPatientProfile = (id?: string): PatientProfile =>
  (id && patientProfiles[id]) || patientProfiles["yassin-05"];

// ─────────────────────────────────────────────────────────────────────────────
// Meds & Supplements (per patient)
// ─────────────────────────────────────────────────────────────────────────────

export interface MedItem {
  name: string;
  dose: string;
  detail: string;          // frequency, timing, or purpose
  status?: "Active" | "Paused" | "PRN";
}

export interface MedsData {
  prescriptions: (MedItem & { prescriber: string; refill: string })[];
  supplements: MedItem[];
  performance: MedItem[];
  sleepAids: MedItem[];
}

const emptyMeds: MedsData = { prescriptions: [], supplements: [], performance: [], sleepAids: [] };

export const patientMeds: Record<string, MedsData> = {
  "ali-02": {
    prescriptions: [
      { name: "Ibuprofen", dose: "400 mg", detail: "PRN for lumbar flare-ups, max 2×/day", prescriber: "Dr. Sajeda Ayesh", refill: "May 14", status: "PRN" },
      { name: "Atorvastatin", dose: "10 mg", detail: "Once daily, evening — for borderline LDL", prescriber: "Dr. Sajeda Ayesh", refill: "May 22", status: "Active" },
    ],
    supplements: [
      { name: "Omega-3 (EPA/DHA)", dose: "2 g", detail: "With breakfast — LDL & inflammation support", status: "Active" },
      { name: "Vitamin D3", dose: "2000 IU", detail: "Morning, with fat — bone & immune", status: "Active" },
      { name: "Curcumin (Meriva)", dose: "500 mg", detail: "2×/day — joint & lumbar inflammation", status: "Active" },
    ],
    performance: [
      { name: "Collagen peptides", dose: "15 g", detail: "Pre-training with vitamin C — tendon support", status: "Active" },
      { name: "Electrolytes", dose: "1 sachet", detail: "Intra-workout on Zone-2 sessions", status: "Active" },
    ],
    sleepAids: [
      { name: "Magnesium glycinate", dose: "300 mg", detail: "60 min before bed — sleep latency", status: "Active" },
      { name: "L-Theanine", dose: "200 mg", detail: "With evening wind-down — caffeine offset", status: "Active" },
    ],
  },
  "motasim-03": {
    prescriptions: [
      { name: "Salbutamol inhaler", dose: "100 mcg", detail: "PRN — exercise-induced asthma", prescriber: "Dr. Sajeda Ayesh", refill: "Jun 02", status: "PRN" },
    ],
    supplements: [
      { name: "Iron bisglycinate", dose: "25 mg", detail: "With vitamin C, away from coffee — ferritin support", status: "Active" },
      { name: "Vitamin D3", dose: "2000 IU", detail: "Morning", status: "Active" },
      { name: "Omega-3", dose: "2 g", detail: "With lunch", status: "Active" },
    ],
    performance: [
      { name: "Creatine monohydrate", dose: "5 g", detail: "Daily, any time — strength & recovery", status: "Active" },
      { name: "Beta-alanine", dose: "3.2 g", detail: "Split AM/PM — Z4 buffering", status: "Active" },
      { name: "Whey isolate", dose: "30 g", detail: "Post-training", status: "Active" },
    ],
    sleepAids: [
      { name: "Magnesium glycinate", dose: "400 mg", detail: "Pre-bed", status: "Active" },
    ],
  },
  "motasim-04": {
    prescriptions: [],
    supplements: [
      { name: "Vitamin D3 + K2", dose: "4000 IU / 100 mcg", detail: "Morning with fat", status: "Active" },
      { name: "Omega-3", dose: "3 g", detail: "Split with meals — anti-inflammatory load for tendinopathy", status: "Active" },
      { name: "Collagen + Vit C", dose: "15 g + 50 mg", detail: "30–60 min pre-loading — Achilles support", status: "Active" },
    ],
    performance: [
      { name: "Beta-alanine", dose: "3.2 g", detail: "Daily — lactate buffering for long runs", status: "Active" },
      { name: "Sodium bicarbonate", dose: "0.2 g/kg", detail: "Pre-tempo only — gut tested", status: "Active" },
      { name: "Carb mix (maltodextrin/fructose)", dose: "70 g/h", detail: "Long runs — fueling protocol", status: "Active" },
      { name: "Tart cherry concentrate", dose: "30 mL", detail: "Post long-run — recovery & sleep", status: "Active" },
    ],
    sleepAids: [
      { name: "Magnesium glycinate", dose: "400 mg", detail: "Pre-bed — recovery & sleep depth", status: "Active" },
      { name: "Glycine", dose: "3 g", detail: "30 min before bed", status: "Active" },
    ],
  },
  "yassin-05": {
    prescriptions: [
      { name: "Metformin", dose: "500 mg", detail: "Twice daily with meals — pre-diabetic management", prescriber: "Dr. Sajeda Ayesh", refill: "May 30", status: "Active" },
    ],
    supplements: [
      { name: "Berberine", dose: "500 mg", detail: "3×/day with meals — glucose support", status: "Active" },
      { name: "Vitamin D3", dose: "2000 IU", detail: "Morning", status: "Active" },
      { name: "Omega-3", dose: "2 g", detail: "With dinner", status: "Active" },
    ],
    performance: [
      { name: "Collagen peptides", dose: "15 g", detail: "Pre-rehab — ACL connective tissue", status: "Active" },
      { name: "Whey isolate", dose: "30 g", detail: "Post-training", status: "Active" },
    ],
    sleepAids: [
      { name: "Magnesium glycinate", dose: "300 mg", detail: "Pre-bed — sleep depth", status: "Active" },
      { name: "Ashwagandha (KSM-66)", dose: "600 mg", detail: "Evening — cortisol regulation", status: "Active" },
    ],
  },
  "yassin-06": {
    prescriptions: [],
    supplements: [
      { name: "Inositol (myo + d-chiro)", dose: "4 g", detail: "Morning — insulin sensitivity", status: "Active" },
      { name: "Omega-3", dose: "2 g", detail: "With breakfast", status: "Active" },
      { name: "Vitamin D3", dose: "2000 IU", detail: "Morning", status: "Active" },
    ],
    performance: [
      { name: "Creatine monohydrate", dose: "5 g", detail: "Daily — strength rebuild", status: "Active" },
      { name: "Electrolytes", dose: "1 sachet", detail: "Travel days", status: "Active" },
    ],
    sleepAids: [
      { name: "Melatonin", dose: "0.5 mg", detail: "Travel weeks only — circadian reset", status: "PRN" },
      { name: "Magnesium glycinate", dose: "300 mg", detail: "Pre-bed", status: "Active" },
    ],
  },
  "ali-01": {
    prescriptions: [
      { name: "Amlodipine", dose: "5 mg", detail: "Once daily, morning — hypertension", prescriber: "Dr. Sajeda Ayesh", refill: "May 18", status: "Active" },
    ],
    supplements: [
      { name: "CoQ10", dose: "200 mg", detail: "Morning — cardiovascular support", status: "Active" },
      { name: "Omega-3", dose: "2 g", detail: "Daily", status: "Active" },
      { name: "Magnesium taurate", dose: "300 mg", detail: "BP & vascular support", status: "Active" },
    ],
    performance: [
      { name: "Electrolytes", dose: "1 sachet", detail: "Walks > 45 min", status: "Active" },
    ],
    sleepAids: [
      { name: "Magnesium glycinate", dose: "300 mg", detail: "Pre-bed", status: "Active" },
    ],
  },
  "lina-07": {
    prescriptions: [],
    supplements: [
      { name: "Inositol", dose: "4 g", detail: "Morning — PCOS support", status: "Active" },
      { name: "Iron bisglycinate", dose: "25 mg", detail: "Alt days with vit C", status: "Active" },
      { name: "Vitamin D3 + K2", dose: "2000 IU", detail: "Morning", status: "Active" },
    ],
    performance: [
      { name: "Creatine monohydrate", dose: "3 g", detail: "Daily — longevity & strength", status: "Active" },
    ],
    sleepAids: [
      { name: "Magnesium glycinate", dose: "300 mg", detail: "Pre-bed", status: "Active" },
    ],
  },
  "omar-08": {
    prescriptions: [
      { name: "Metformin", dose: "1000 mg", detail: "Twice daily with meals", prescriber: "Dr. Sajeda Ayesh", refill: "May 12", status: "Active" },
      { name: "Rosuvastatin", dose: "10 mg", detail: "Evening — LDL", prescriber: "Dr. Sajeda Ayesh", refill: "May 12", status: "Active" },
    ],
    supplements: [
      { name: "Berberine", dose: "500 mg", detail: "3×/day with meals", status: "Active" },
      { name: "CoQ10", dose: "200 mg", detail: "Statin co-supplement", status: "Active" },
      { name: "Omega-3", dose: "3 g", detail: "Split with meals", status: "Active" },
    ],
    performance: [],
    sleepAids: [
      { name: "Magnesium glycinate", dose: "400 mg", detail: "Pre-bed", status: "Active" },
    ],
  },
  "noura-09": {
    prescriptions: [],
    supplements: [
      { name: "Postnatal multivitamin", dose: "1 tab", detail: "Morning — recovery", status: "Active" },
      { name: "Iron bisglycinate", dose: "25 mg", detail: "With vit C", status: "Active" },
      { name: "Omega-3 (DHA-rich)", dose: "2 g", detail: "Lactation support", status: "Active" },
    ],
    performance: [
      { name: "Electrolytes", dose: "1 sachet", detail: "Cardio sessions", status: "Active" },
    ],
    sleepAids: [
      { name: "Magnesium glycinate", dose: "300 mg", detail: "Pre-bed", status: "Active" },
    ],
  },
};

export const getPatientMeds = (id?: string): MedsData =>
  (id && patientMeds[id]) || patientMeds["yassin-05"] || emptyMeds;

// ─────────────────────────────────────────────────────────────────────────────
// Routines (with line icons)
// ─────────────────────────────────────────────────────────────────────────────

export type RoutineIconKey =
  | "sun" | "water" | "walk" | "meal" | "moon" | "breath" | "movement" | "coffee" | "salad" | "sleep" | "focus";

export const routineIcons: Record<RoutineIconKey, LucideIcon> = {
  sun: Sun, water: Droplet, walk: Footprints, meal: Apple, moon: Moon,
  breath: Wind, movement: Activity, coffee: Coffee, salad: Salad, sleep: Bed, focus: Brain,
};

export interface RoutineItem {
  id: string;
  title: string;
  subtitle: string;
  tone: "amber" | "warm" | "fresh" | "soft" | "sky";
  icon: RoutineIconKey;
}

let _routineSeq = 1000;
export const newRoutineId = () => `r-${++_routineSeq}`;

export const morningRoutine: RoutineItem[] = [
  { id: "m1", title: "Hydrate",                                  subtitle: "Rehydrates after sleep, kickstarts metabolism & cognition", tone: "sky",   icon: "water" },
  { id: "m2", title: "Sunlight exposure (5–15 min outdoors)",    subtitle: "Anchors circadian rhythm",                                 tone: "warm",  icon: "sun"   },
  { id: "m3", title: "Light movement (walk or mobility)",        subtitle: "Signals start-of-day to the body",                         tone: "soft",  icon: "walk"  },
  { id: "m4", title: "Protein-first meal",                       subtitle: "Stabilizes blood sugar",                                   tone: "fresh", icon: "meal"  },
];
export const afternoonRoutine: RoutineItem[] = [
  { id: "a1", title: "Hydration check",   subtitle: "Aim for 500ml between lunch and 4pm", tone: "sky",   icon: "water" },
  { id: "a2", title: "Post-lunch walk",   subtitle: "10 min easy walk to blunt glucose",   tone: "fresh", icon: "walk"  },
  { id: "a3", title: "Focus block",       subtitle: "25 min deep work, no notifications",  tone: "soft",  icon: "focus" },
];
export const eveningRoutine: RoutineItem[] = [
  { id: "e1", title: "Last meal by 7pm",         subtitle: "Time-restricted eating window — supports autophagy & glucose control", tone: "fresh", icon: "meal" },
  { id: "e2", title: "Evening mobility flow",    subtitle: "8 min hip + thoracic mobility to offload the spine before bed",        tone: "soft",  icon: "movement" },
  { id: "e3", title: "Wind-down breathwork",     subtitle: "4-7-8 breathing × 5 cycles to drop sympathetic tone & HR",              tone: "sky",   icon: "breath" },
  { id: "e4", title: "Lights-out routine",       subtitle: "Dim lights, cool room to 18°C by 9pm — protects melatonin onset",      tone: "amber", icon: "sleep" },
];

export interface RoutineLibraryItem {
  id: string; title: string; category: string; time: "Morning" | "Afternoon" | "Evening"; description: string; icon: RoutineIconKey;
  frequency?: string;     // e.g. "Daily", "5×/week"
  impact?: string;        // how it affects the user's health
  biomarkers?: string[];  // biomarkers / outcomes supported
  cautions?: string;      // optional
}

// Detail lookup for any routine — keyed by title (titles are unique enough across library + slots)
export const routineDetails: Record<string, { frequency: string; impact: string; biomarkers: string[]; cautions?: string }> = {
  "Hydrate":                                 { frequency: "Daily, on waking",      impact: "Restores overnight fluid loss, lowers morning cortisol spike, supports cognitive performance in the first hours after waking.", biomarkers: ["Hydration", "Cortisol", "Cognitive load"] },
  "Sunlight exposure (5–15 min outdoors)":   { frequency: "Daily, within 1h of waking", impact: "Anchors circadian rhythm, supports melatonin timing in the evening, and improves mood via serotonin pathways.", biomarkers: ["Melatonin onset", "Sleep score", "Mood"] },
  "Light movement (walk or mobility)":       { frequency: "Daily, 5–10 min",       impact: "Raises body temperature gradually, primes the nervous system, and improves joint readiness for later loaded work.", biomarkers: ["Resting HR", "Joint ROM"] },
  "Protein-first meal":                      { frequency: "Daily, breakfast",      impact: "Stabilises post-meal glucose, increases satiety, and protects lean mass during a body-recomposition phase.", biomarkers: ["Fasting glucose", "Lean mass", "HbA1c"] },
  "Hydration check":                         { frequency: "Daily, midday",         impact: "Prevents the early-afternoon energy dip caused by mild dehydration.", biomarkers: ["Hydration", "Cognitive load"] },
  "Post-lunch walk":                         { frequency: "Daily, after lunch",    impact: "Blunts post-prandial glucose spike by ~20–30%, supports insulin sensitivity.", biomarkers: ["Post-prandial glucose", "Insulin sensitivity"] },
  "Focus block":                             { frequency: "1–2× per workday",      impact: "Protects deep-work cognitive output and reduces decision fatigue later in the day.", biomarkers: ["Stress score", "Mood"] },
  "Early wake-up hydration":                 { frequency: "Daily",                  impact: "Frontloads hydration before caffeine, reducing diuretic effect later.", biomarkers: ["Hydration"] },
  "Sunlight exposure walk":                  { frequency: "Daily, AM",              impact: "Combines circadian anchoring with low-intensity movement.", biomarkers: ["Sleep score", "Mood", "Resting HR"] },
  "Post-lunch stroll":                       { frequency: "Daily",                  impact: "Improves glycemic control without adding training load.", biomarkers: ["Post-prandial glucose"] },
  "Evening mobility flow":                   { frequency: "5×/week",                impact: "Improves hip & thoracic mobility, reduces next-day stiffness.", biomarkers: ["ROM", "Recovery"] },
  "Wind-down breathwork":                    { frequency: "Daily, 30 min pre-bed",  impact: "Activates the parasympathetic nervous system, raising HRV and improving sleep onset.", biomarkers: ["HRV", "Sleep onset latency"] },
  "Greens + protein lunch":                  { frequency: "Daily",                  impact: "Improves micronutrient intake and protein distribution across the day.", biomarkers: ["Iron", "Lean mass", "Satiety"] },
  "Caffeine cut-off":                        { frequency: "Daily, after 2pm",       impact: "Improves deep-sleep quality by giving caffeine time to clear.", biomarkers: ["Deep sleep %", "Sleep score"] },
  "Lights-out routine":                      { frequency: "Daily, 9pm",             impact: "Lower light + cooler room supports melatonin release and sleep efficiency.", biomarkers: ["Sleep efficiency", "Core body temp"] },
};

export const getRoutineDetail = (title: string) =>
  routineDetails[title] ?? {
    frequency: "Daily",
    impact: "Supports healthy daily rhythm, recovery, and adherence to the broader plan.",
    biomarkers: ["General wellbeing"],
  };

export const routineLibrary: RoutineLibraryItem[] = [
  { id: "r1", title: "Early wake-up hydration", category: "Hydration", time: "Morning",   description: "500ml water + electrolytes within 15 min of waking.", icon: "water" },
  { id: "r2", title: "Sunlight exposure walk",  category: "Circadian", time: "Morning",   description: "10–15 min outdoor light to anchor circadian rhythm.", icon: "sun" },
  { id: "r3", title: "Post-lunch stroll",       category: "Glucose",   time: "Afternoon", description: "10 min easy walk to blunt post-prandial glucose.",     icon: "walk" },
  { id: "r4", title: "Evening mobility flow",   category: "Recovery",  time: "Evening",   description: "8 min hip + thoracic mobility before bed.",           icon: "movement" },
  { id: "r5", title: "Wind-down breathwork",    category: "Sleep",     time: "Evening",   description: "4-7-8 breathing, 5 cycles.",                          icon: "breath" },
  { id: "r6", title: "Greens + protein lunch",  category: "Nutrition", time: "Afternoon", description: "Plate half greens, palm of protein.",                 icon: "salad" },
  { id: "r7", title: "Caffeine cut-off",        category: "Sleep",     time: "Afternoon", description: "No caffeine after 2pm.",                              icon: "coffee" },
  { id: "r8", title: "Lights-out routine",      category: "Sleep",     time: "Evening",   description: "Dim lights and cool room 9pm.",                       icon: "sleep" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Notes / Exercise (unchanged from previous iteration)
// ─────────────────────────────────────────────────────────────────────────────

export const clinicalNotes = [
  { id: 1, author: "Dr. Khalid Rahman", date: "Apr 5, 2026",  specialty: "Orthopedic" as const, body: "ACL reconstruction recovery on track — cleared for bilateral leg press at moderate load. Avoid deep squats beyond 90° for 4 more weeks." },
  { id: 2, author: "Sara Al-Mohsen",   date: "Apr 3, 2026",  specialty: "Nutritionist" as const, body: "Latest blood panel shows low ferritin (18 ng/mL). Increasing iron-rich foods and adding 65mg elemental iron supplement. Recheck in 6 weeks." },
  { id: 3, author: "Dr. Khalid Rahman", date: "Mar 28, 2026", specialty: "Orthopedic" as const, body: "Mild patellofemoral crepitus noted on right knee. No swelling. Continue current physio protocol, monitor for pain during loaded flexion." },
  { id: 4, author: "James Thornton",   date: "Mar 25, 2026", specialty: "Physiotherapist" as const, body: "Hip flexor tightness improving — ROM now 125° (was 110°). Adding eccentric hamstring work. Foam rolling protocol maintained." },
];

export const planContext = [
  { tag: "InBody Scan",  tone: "inbody" as const,   text: "Elevated body fat at 24% with lower-than-target lean mass in the lower body — prioritising hypertrophy-focused leg work this cycle." },
  { tag: "Blood Panel",  tone: "blood" as const,    text: "Mildly elevated fasting glucose (5.8 mmol/L) flagged — plan includes higher-volume conditioning sessions to support metabolic health." },
  { tag: "Wearable",     tone: "wearable" as const, text: "Consistently low HRV on Mondays detected, so the heaviest session has been shifted to mid-week when recovery scores are highest." },
  { tag: "Ortho Note",   tone: "ortho" as const,    text: "Recurring left-knee discomfort (Mar 2026) — all deep-squat variations replaced with partial-ROM or machine alternatives." },
  { tag: "Athlete Goal", tone: "athlete" as const,  text: "Training frequency increased from 3× to 5× per week based on stated goal of body recomposition ahead of the upcoming assessment." },
];

export interface Exercise { name: string; sets: string; notes?: string; }
export interface DayPlan { day: string; type: string; tone: "chest"|"back"|"shoulder"|"arms"|"leg"|"rest"; count: number; exercises: Exercise[]; }

export const weekPlan: DayPlan[] = [
  { day: "MON", type: "Chest Day", tone: "chest", count: 6, exercises: [
    { name: "Incline DB Press",   sets: "4 × 8–10",  notes: "Targets upper-chest fibres — keep elbows at ~45° to spare the shoulder capsule." },
    { name: "Cable Fly",          sets: "3 × 12",    notes: "Mid-chest isolation — squeeze at midline, avoid bouncing out of the stretch." },
    { name: "Push-Up (deficit)",  sets: "3 × AMRAP", notes: "Adds ROM for sternal head — maintain a rigid plank, no hip sag." },
    { name: "Machine Chest Press", sets: "3 × 10",   notes: "Stable plane lets you push closer to failure safely." },
    { name: "Pec Deck",           sets: "3 × 12",    notes: "Pure adduction — slow eccentric, no shrug." },
    { name: "Tricep Pushdown",    sets: "3 × 12",    notes: "Pump finisher — keep elbows pinned to ribs." },
  ]},
  { day: "TUE", type: "Back Day", tone: "back", count: 6, exercises: [
    { name: "Lat Pulldown",       sets: "4 × 10",    notes: "Drive elbows down-and-back, lead with the lats not the biceps." },
    { name: "Seated Cable Row",   sets: "3 × 10–12", notes: "Mid-back focus — pause at full contraction, keep chest tall." },
    { name: "Face Pull",          sets: "3 × 15",    notes: "Posture cue — external rotation at end range, light load." },
    { name: "Single-Arm DB Row",  sets: "3 × 10",    notes: "Allows full lat stretch — flat back, no twisting." },
    { name: "Straight-Arm Pulldown", sets: "3 × 12", notes: "Lat isolation without bicep — keep small bend in elbows." },
    { name: "Hyperextension",     sets: "3 × 12",    notes: "Posterior chain warm-down — no hyper-extending the lumbar." },
  ]},
  { day: "WED", type: "Shoulder Day", tone: "shoulder", count: 6, exercises: [
    { name: "DB Shoulder Press",  sets: "4 × 8",     notes: "Press in scapular plane — slight forward angle protects the joint." },
    { name: "Lateral Raise",      sets: "3 × 12",    notes: "Activates medial delt — lead with the elbow, don't shrug at the top." },
    { name: "Rear Delt Fly",      sets: "3 × 15",    notes: "Posterior chain balance — light weight, slow tempo." },
    { name: "Cable Front Raise",  sets: "3 × 12",    notes: "Anterior delt isolation — control the descent, no momentum." },
    { name: "Upright Row",        sets: "3 × 12",    notes: "Stop at chest height to avoid impingement." },
    { name: "Shrug",              sets: "3 × 15",    notes: "Trap finisher — pause 1s at top, full ROM." },
  ]},
  { day: "THU", type: "Arms Day", tone: "arms", count: 6, exercises: [
    { name: "EZ Bar Curl",        sets: "4 × 10",    notes: "Bicep mass builder — elbows tucked, no swinging." },
    { name: "Tricep Pushdown",    sets: "4 × 12",    notes: "Lateral head focus — full lockout each rep." },
    { name: "Hammer Curl",        sets: "3 × 12",    notes: "Brachialis & forearm — neutral grip throughout." },
    { name: "Overhead Tricep Ext", sets: "3 × 12",   notes: "Long head stretch — keep elbows close to head." },
    { name: "Cable Curl",         sets: "3 × 15",    notes: "Constant tension across the full ROM." },
    { name: "Wrist Curl",         sets: "3 × 15",    notes: "Forearm finisher — small ROM, no momentum." },
  ]},
  { day: "FRI", type: "Leg Day", tone: "leg", count: 6, exercises: [
    { name: "Leg Press",          sets: "4 × 10",    notes: "ACL-safe ROM — don't drop knees past 90°." },
    { name: "Romanian Deadlift",  sets: "3 × 8",     notes: "Hamstring & glute stretch — neutral spine, soft knees." },
    { name: "Seated Leg Curl",    sets: "3 × 12",    notes: "Hamstring isolation — pause at full contraction." },
    { name: "Walking Lunge",      sets: "3 × 12/leg", notes: "Unilateral strength — front knee tracks over toes." },
    { name: "Leg Extension",      sets: "3 × 15",    notes: "Quad finisher — full ROM, controlled tempo." },
    { name: "Standing Calf Raise", sets: "4 × 15",   notes: "Pause 1s at the top of each rep for the gastroc." },
  ]},
  { day: "SAT", type: "Rest Day", tone: "rest", count: 0, exercises: [] },
  { day: "SUN", type: "Rest Day", tone: "rest", count: 0, exercises: [] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Companies (for global Companies switcher modal)
// ─────────────────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  industry: string;
  members: number;
  patientIds: string[]; // ids from `patients`
}

// `members` reflects the actual number of patients seeded for that company so
// dashboard counts, company chips, and table totals stay coherent.
export const companies: Company[] = (
  [
    { id: "carina", name: "Carina",  industry: "Health-tech"   },
    { id: "adsero", name: "Adsero",  industry: "Legal"         },
    { id: "wayup",  name: "Wayup",   industry: "Logistics"     },
    { id: "byte",   name: "Byte",    industry: "Clinical SaaS" },
    { id: "asfour", name: "Asfour",  industry: "Manufacturing" },
  ] as Array<Pick<Company, "id" | "name" | "industry">>
).map((c) => {
  const ids = patients.filter((p) => p.company === c.name).map((p) => p.id);
  return { ...c, patientIds: ids, members: ids.length };
});
