import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { samplePlan, type PlanDay } from "@/lib/nutrition-plan";
import type { PlanContextItem } from "@/components/patient/PlanContextCards";
import type { DayPlan } from "@/lib/data";

interface PatientBio {
  name: string;
  age: number;
  bioAge: number;
  gender: string;
  company: string;
  goal?: string;
  conditions?: string[];
}

const FG: [number, number, number] = [20, 20, 20];
const MUTED: [number, number, number] = [110, 110, 110];
const ACCENT: [number, number, number] = [40, 40, 40];

const addHeader = (doc: jsPDF, title: string, subtitle: string) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...FG);
  doc.text(title, 40, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(subtitle, 40, 74);

  // Divider
  doc.setDrawColor(220);
  doc.setLineWidth(0.5);
  doc.line(40, 88, doc.internal.pageSize.getWidth() - 40, 88);
};

const addBio = (doc: jsPDF, bio: PatientBio, y: number): number => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...FG);
  doc.text("Patient", 40, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...FG);
  const line1 = `${bio.name}  ·  ${bio.age}y (bio ${bio.bioAge})  ·  ${bio.gender}  ·  ${bio.company}`;
  doc.text(line1, 40, y + 16);

  doc.setTextColor(...MUTED);
  let yy = y + 30;
  if (bio.goal) { doc.text(`Goal: ${bio.goal}`, 40, yy); yy += 12; }
  if (bio.conditions?.length) { doc.text(`Conditions: ${bio.conditions.join(", ")}`, 40, yy); yy += 12; }
  return yy + 6;
};

const addSection = (doc: jsPDF, title: string, items: PlanContextItem[], y: number): number => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...FG);
  doc.text(title, 40, y);
  y += 10;

  autoTable(doc, {
    startY: y + 4,
    head: [["", ""]],
    body: items.map((it) => [it.title, it.body]),
    showHead: "never",
    styles: { fontSize: 9, cellPadding: 6, textColor: 30, lineColor: 230, lineWidth: 0.3 },
    columnStyles: {
      0: { cellWidth: 140, fontStyle: "bold", textColor: ACCENT },
      1: { textColor: 80 },
    },
    margin: { left: 40, right: 40 },
    theme: "grid",
  });
  // @ts-expect-error lastAutoTable injected by autotable
  return doc.lastAutoTable.finalY + 18;
};

const ensureSpace = (doc: jsPDF, y: number, need: number): number => {
  const h = doc.internal.pageSize.getHeight();
  if (y + need > h - 40) {
    doc.addPage();
    return 56;
  }
  return y;
};

// ─── Nutrition PDF ──────────────────────────────────────────────────────────
export function buildNutritionPdf(opts: {
  bio: PatientBio;
  healthNotes: PlanContextItem[];
  superfoods: PlanContextItem[];
  caloricStrategy: PlanContextItem[];
  plan: PlanDay[];
}): jsPDF {
  const { bio, healthNotes, superfoods, caloricStrategy, plan } = opts;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  addHeader(doc, "Nutrition Plan", `Generated ${new Date().toLocaleDateString()} · ${samplePlan.plan_metadata.plan_id}`);
  let y = addBio(doc, bio, 110);

  y = ensureSpace(doc, y, 80);
  y = addSection(doc, "Health Notes", healthNotes, y);
  y = ensureSpace(doc, y, 80);
  y = addSection(doc, "Superfoods", superfoods, y);
  y = ensureSpace(doc, y, 80);
  y = addSection(doc, "Caloric Strategy", caloricStrategy, y);

  // Per-day meal plan
  y = ensureSpace(doc, y, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...FG);
  doc.text("Weekly Meal Plan", 40, y);
  y += 16;

  plan.forEach((d) => {
    y = ensureSpace(doc, y, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...FG);
    const dayCals = Math.round(d.day_macros.calories);
    doc.text(
      `${d.day_label} — ${dayCals} kcal · P${Math.round(d.day_macros.protein_g)}  C${Math.round(d.day_macros.carbs_g)}  F${Math.round(d.day_macros.fat_g)}`,
      40, y,
    );
    y += 6;

    if (d.meals.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("No meals planned.", 40, y + 14);
      y += 24;
      return;
    }

    autoTable(doc, {
      startY: y + 6,
      head: [["Meal", "Recipes", "kcal", "P", "C", "F"]],
      body: d.meals.map((m) => [
        m.meal_type.replace("_", " "),
        m.recipes.map((r) => r.recipe_name_en).join("\n"),
        String(Math.round(m.meal_macros.calories)),
        String(Math.round(m.meal_macros.protein_g)),
        String(Math.round(m.meal_macros.carbs_g)),
        String(Math.round(m.meal_macros.fat_g)),
      ]),
      styles: { fontSize: 8.5, cellPadding: 5, textColor: 40, lineColor: 230, lineWidth: 0.3 },
      headStyles: { fillColor: [245, 245, 245], textColor: 60, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: "bold", textColor: ACCENT },
        1: { cellWidth: "auto" },
        2: { cellWidth: 40, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 30, halign: "right" },
        5: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 40, right: 40 },
      theme: "grid",
    });
    // @ts-expect-error lastAutoTable injected by autotable
    y = doc.lastAutoTable.finalY + 14;
  });

  // Footer page numbers
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${bio.name} · Nutrition Plan · Page ${p}/${pages}`, 40, doc.internal.pageSize.getHeight() - 24);
  }

  return doc;
}

// ─── Exercise PDF ───────────────────────────────────────────────────────────
export function buildExercisePdf(opts: {
  bio: PatientBio;
  heartRate: PlanContextItem[];
  injuries: PlanContextItem[];
  exerciseCtx: PlanContextItem[];
  plan: DayPlan[];
}): jsPDF {
  const { bio, heartRate, injuries, exerciseCtx, plan } = opts;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  addHeader(doc, "Exercise Plan", `Generated ${new Date().toLocaleDateString()}`);
  let y = addBio(doc, bio, 110);

  y = ensureSpace(doc, y, 80);
  y = addSection(doc, "Heart Rate Strategy", heartRate, y);
  y = ensureSpace(doc, y, 80);
  y = addSection(doc, "Injuries & Constraints", injuries, y);
  y = ensureSpace(doc, y, 80);
  y = addSection(doc, "Exercise Goals", exerciseCtx, y);

  y = ensureSpace(doc, y, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...FG);
  doc.text("Weekly Workout Plan", 40, y);
  y += 16;

  plan.forEach((d) => {
    y = ensureSpace(doc, y, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...FG);
    doc.text(`${d.day} — ${d.type}`, 40, y);

    if (d.exercises.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("Rest day.", 40, y + 14);
      y += 26;
      return;
    }

    autoTable(doc, {
      startY: y + 8,
      head: [["Exercise", "Sets / Reps", "Notes"]],
      body: d.exercises.map((ex) => [ex.name, ex.sets, ex.notes ?? ""]),
      styles: { fontSize: 9, cellPadding: 5, textColor: 40, lineColor: 230, lineWidth: 0.3 },
      headStyles: { fillColor: [245, 245, 245], textColor: 60, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 200, fontStyle: "bold", textColor: ACCENT },
        1: { cellWidth: 90 },
        2: { cellWidth: "auto", textColor: 90 },
      },
      margin: { left: 40, right: 40 },
      theme: "grid",
    });
    // @ts-expect-error lastAutoTable injected by autotable
    y = doc.lastAutoTable.finalY + 14;
  });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${bio.name} · Exercise Plan · Page ${p}/${pages}`, 40, doc.internal.pageSize.getHeight() - 24);
  }

  return doc;
}
