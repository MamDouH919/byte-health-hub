// Nutrition plan data layer — shaped after the meal-planning JSON contract
// (plan_metadata, calorie_strategy, days[].meals[].recipes[].scaled_ingredients[],
// weekly_macros, generation_metadata, novel_recipes).
//
// This file is the single source of truth for the Nutrition tab. Swapping to a
// real API later means replacing `samplePlan` only — types stay identical.

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlanMetadata {
  user_id: string;
  plan_id: string;
  generated_at: string; // ISO
  plan_duration_days: number;
}

export interface MacroTarget {
  value: number;
  tolerance: number;
  tolerance_unit: "pct" | "g";
}

export interface NutritionTargets {
  calories: MacroTarget;
  protein_g: MacroTarget;
  carbs_g: MacroTarget;
  fat_g: MacroTarget;
}

export interface CalorieStrategy {
  direction: "deficit" | "surplus" | "maintenance";
  maintenance_calories: number;
  adjustment: number;
  target_calories: number;
  macro_percentages: { protein_pct: number; carbs_pct: number; fat_pct: number };
  daily_allowed_range: { min_calories: number; max_calories: number };
  explanation: string;
}

export interface HealthNote {
  finding: string;
  directive: string;
  source: string; // e.g. "blood_tests.hba1c"
}

export interface Superfood {
  type: "ingredient" | "recipe";
  id: string;
  name_en: string;
  name_ar?: string;
  explanation: string;
}

export interface IngredientMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sodium_mg?: number;
  potassium_mg?: number;
  iron_mg?: number;
  calcium_mg?: number;
  phosphorus_mg?: number;
}

export interface ScaledIngredient {
  ingredient_id: string;
  ingredient_name_en: string;
  ingredient_name_ar?: string;
  quantity: number;
  unit: string; // "g", "piece", "tbsp", "cup"
  quantity_g: number;
  macros: IngredientMacros;
  // Light ingredient metadata (subset of full ingredient schema)
  allergen_flags?: string[];
  dietary_flags?: string[];
  glycemic_index?: number;
  cost_tier?: "low" | "medium" | "high";
  source?: { source: string; source_reference?: string };
}

export interface RecipeMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export type MealType = "breakfast" | "snack_am" | "lunch" | "snack_pm" | "snack" | "dinner";

export interface Recipe {
  recipe_id: string;
  recipe_name_en: string;
  recipe_name_ar?: string;
  portion_multiplier: number;
  serving_weight_g: number;
  recipe_macros: RecipeMacros;
  is_novel: boolean;
  meal_role_tag: string; // "breakfast_base", "main", "snack"
  scaled_ingredients: ScaledIngredient[];
  notes?: string;
  // Validation result if novel
  validation?: {
    passed: boolean;
    attempts_count: number;
    failure_reasons: string[];
  };
}

export interface Meal {
  meal_type: MealType;
  meal_macros: RecipeMacros;
  recipes: Recipe[];
}

export interface DayMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface PlanDay {
  day_number: number;
  day_label: string; // "MON", "TUE"…
  day_macros: DayMacros;
  meals: Meal[];
}

export interface WeeklyAggregate { total: number; average: number }

export interface WeeklyMacros {
  calories: WeeklyAggregate;
  protein_g: WeeklyAggregate;
  carbs_g: WeeklyAggregate;
  fat_g: WeeklyAggregate;
  fiber_g: WeeklyAggregate;
  sodium_mg: WeeklyAggregate;
  potassium_mg: WeeklyAggregate;
  iron_mg: WeeklyAggregate;
  calcium_mg: WeeklyAggregate;
  phosphorus_mg: WeeklyAggregate;
}

export interface Deviation {
  scope: "meal" | "day";
  identifier: string;
  target: number;
  actual: number;
  delta: number;
}

export interface GenerationMetadata {
  pipeline_execution: {
    model_name: string;
    model_version: string;
    pipeline_version: string;
    total_generation_time_ms: number;
  };
  deviations: Deviation[];
  validation_summary: {
    final_passed: boolean;
    attempts_used: number;
    max_attempts: number;
  };
}

export interface MealPlan {
  plan_metadata: PlanMetadata;
  nutrition_targets: NutritionTargets;
  calorie_strategy: CalorieStrategy;
  health_notes: HealthNote[];
  superfoods: Superfood[];
  plan_description: { description: string; plan_tags: string[] };
  days: PlanDay[];
  weekly_macros: WeeklyMacros;
  generation_metadata: GenerationMetadata;
}

// ─── Micronutrient reference ranges (for daily averages) ────────────────────
// Used to colour the weekly micronutrient ribbon. Values are adult
// reference targets — these are intentionally simple for the UI demo.

export interface MicroRef {
  key: keyof WeeklyMacros;
  label: string;
  unit: string;
  /** Optimal daily range (low, high) — used for the band visual. */
  optimal: [number, number];
  /** Hard upper limit (UL) when known — values above are flagged. */
  upper?: number;
}

export const MICRO_REFERENCES: MicroRef[] = [
  { key: "fiber_g",      label: "Fiber",      unit: "g",  optimal: [25, 38] },
  { key: "sodium_mg",    label: "Sodium",     unit: "mg", optimal: [1500, 2300], upper: 2300 },
  { key: "potassium_mg", label: "Potassium",  unit: "mg", optimal: [3400, 4700] },
  { key: "iron_mg",      label: "Iron",       unit: "mg", optimal: [8, 18] },
  { key: "calcium_mg",   label: "Calcium",    unit: "mg", optimal: [1000, 1300] },
  { key: "phosphorus_mg",label: "Phosphorus", unit: "mg", optimal: [700, 1250] },
];

// ─── Sample plan ────────────────────────────────────────────────────────────
// One realistic 7-day plan. Day 1 is fully detailed (multiple recipes with
// scaled_ingredients). Days 2–7 reuse a compact recipe shape so the UI has a
// full week to render without bloating this file.

const oats: ScaledIngredient = {
  ingredient_id: "ING-OATS-ROLLED-001",
  ingredient_name_en: "Rolled oats", ingredient_name_ar: "شوفان ملفوف",
  quantity: 60, unit: "g", quantity_g: 60,
  macros: { calories: 233, protein_g: 10.1, carbs_g: 39.8, fat_g: 4.1, fiber_g: 6.4, sodium_mg: 1, potassium_mg: 257, iron_mg: 2.8, calcium_mg: 32, phosphorus_mg: 314 },
  dietary_flags: ["vegetarian", "vegan", "high_fiber"],
  glycemic_index: 55, cost_tier: "low",
  source: { source: "usda", source_reference: "08120" },
};
const greekYogurt: ScaledIngredient = {
  ingredient_id: "ING-GREEK-YOGURT-001",
  ingredient_name_en: "Greek yogurt", ingredient_name_ar: "زبادي يوناني",
  quantity: 170, unit: "g", quantity_g: 170,
  macros: { calories: 162, protein_g: 17, carbs_g: 6, fat_g: 7.5, fiber_g: 0, sodium_mg: 61, potassium_mg: 240, iron_mg: 0.2, calcium_mg: 187, phosphorus_mg: 230 },
  allergen_flags: ["milk"], dietary_flags: ["vegetarian", "high_protein"],
  cost_tier: "medium", source: { source: "usda", source_reference: "01256" },
};
const berries: ScaledIngredient = {
  ingredient_id: "ING-BERRIES-MIXED-001",
  ingredient_name_en: "Mixed berries", ingredient_name_ar: "توت مشكل",
  quantity: 70, unit: "g", quantity_g: 70,
  macros: { calories: 35, protein_g: 0.5, carbs_g: 8.4, fat_g: 0.2, fiber_g: 2.8, sodium_mg: 1, potassium_mg: 77, iron_mg: 0.3, calcium_mg: 14, phosphorus_mg: 18 },
  dietary_flags: ["vegan"], glycemic_index: 40, cost_tier: "medium",
};
const chia: ScaledIngredient = {
  ingredient_id: "ING-CHIA-SEEDS-001",
  ingredient_name_en: "Chia seeds", ingredient_name_ar: "بذور الشيا",
  quantity: 8, unit: "g", quantity_g: 8,
  macros: { calories: 39, protein_g: 1.3, carbs_g: 3.4, fat_g: 2.5, fiber_g: 2.7, sodium_mg: 1, potassium_mg: 33, iron_mg: 0.6, calcium_mg: 50, phosphorus_mg: 69 },
  dietary_flags: ["vegan", "high_fiber"], cost_tier: "medium",
};
const chicken: ScaledIngredient = {
  ingredient_id: "ING-CHICKEN-BREAST-001",
  ingredient_name_en: "Chicken breast, skinless", ingredient_name_ar: "صدر دجاج",
  quantity: 150, unit: "g", quantity_g: 150,
  macros: { calories: 248, protein_g: 46.5, carbs_g: 0, fat_g: 5.4, fiber_g: 0, sodium_mg: 111, potassium_mg: 384, iron_mg: 1.3, calcium_mg: 23, phosphorus_mg: 330 },
  dietary_flags: ["high_protein", "halal"], cost_tier: "medium",
  source: { source: "usda", source_reference: "05062" },
};
const rice: ScaledIngredient = {
  ingredient_id: "ING-RICE-WHITE-COOKED-001",
  ingredient_name_en: "Cooked white rice", ingredient_name_ar: "أرز أبيض مطبوخ",
  quantity: 120, unit: "g", quantity_g: 120,
  macros: { calories: 156, protein_g: 3.3, carbs_g: 33.6, fat_g: 0.3, fiber_g: 0.5, sodium_mg: 1, potassium_mg: 42, iron_mg: 0.2, calcium_mg: 12, phosphorus_mg: 51 },
  dietary_flags: ["vegan", "gluten_free"], glycemic_index: 73, cost_tier: "low",
};
const oliveOil: ScaledIngredient = {
  ingredient_id: "ING-OLIVE-OIL-001",
  ingredient_name_en: "Olive oil", ingredient_name_ar: "زيت زيتون",
  quantity: 5, unit: "g", quantity_g: 5,
  macros: { calories: 44, protein_g: 0, carbs_g: 0, fat_g: 5, fiber_g: 0, sodium_mg: 0, potassium_mg: 0, iron_mg: 0, calcium_mg: 0, phosphorus_mg: 0 },
  dietary_flags: ["vegan", "anti_inflammatory"], cost_tier: "medium",
  source: { source: "usda", source_reference: "04053" },
};
const salmon: ScaledIngredient = {
  ingredient_id: "ING-SALMON-001",
  ingredient_name_en: "Salmon", ingredient_name_ar: "سلمون",
  quantity: 170, unit: "g", quantity_g: 170,
  macros: { calories: 354, protein_g: 34, carbs_g: 0, fat_g: 22.1, fiber_g: 0, sodium_mg: 100, potassium_mg: 620, iron_mg: 0.6, calcium_mg: 15, phosphorus_mg: 340 },
  allergen_flags: ["fish"], dietary_flags: ["high_protein", "omega3_rich"],
  cost_tier: "high", source: { source: "usda", source_reference: "15076" },
};
const apple: ScaledIngredient = {
  ingredient_id: "ING-APPLE-001",
  ingredient_name_en: "Apple", ingredient_name_ar: "تفاح",
  quantity: 1, unit: "piece", quantity_g: 140,
  macros: { calories: 73, protein_g: 0.4, carbs_g: 19.6, fat_g: 0.3, fiber_g: 3.4, sodium_mg: 1, potassium_mg: 150, iron_mg: 0.2, calcium_mg: 8, phosphorus_mg: 15 },
  dietary_flags: ["vegan"], glycemic_index: 38, cost_tier: "low",
};
const proteinYogurt: ScaledIngredient = {
  ingredient_id: "ING-YOGURT-HIGH-PROTEIN-001",
  ingredient_name_en: "High-protein yogurt", ingredient_name_ar: "زبادي عالي البروتين",
  quantity: 150, unit: "g", quantity_g: 150,
  macros: { calories: 120, protein_g: 17, carbs_g: 8, fat_g: 2, fiber_g: 0, sodium_mg: 60, potassium_mg: 200, iron_mg: 0.1, calcium_mg: 180, phosphorus_mg: 220 },
  allergen_flags: ["milk"], dietary_flags: ["vegetarian", "high_protein"],
  cost_tier: "medium",
};

const day1: PlanDay = {
  day_number: 1, day_label: "MON",
  day_macros: { calories: 2088, protein_g: 162, carbs_g: 186, fat_g: 69 },
  meals: [
    {
      meal_type: "breakfast",
      meal_macros: { calories: 469, protein_g: 29, carbs_g: 58, fat_g: 14 },
      recipes: [{
        recipe_id: "REC-OVERNIGHT-OATS-001",
        recipe_name_en: "Overnight oats with yogurt and berries",
        recipe_name_ar: "شوفان منقوع بالزبادي والتوت",
        portion_multiplier: 1, serving_weight_g: 308,
        recipe_macros: { calories: 469, protein_g: 29, carbs_g: 58, fat_g: 14 },
        is_novel: false, meal_role_tag: "breakfast_base",
        notes: "Protein-first breakfast — stabilises morning glucose, anchors satiety.",
        scaled_ingredients: [oats, greekYogurt, berries, chia],
      }],
    },
    {
      meal_type: "lunch",
      meal_macros: { calories: 492, protein_g: 50, carbs_g: 34, fat_g: 11 },
      recipes: [{
        recipe_id: "REC-GRILLED-CHICKEN-RICE-BOWL-001",
        recipe_name_en: "Grilled chicken rice bowl",
        recipe_name_ar: "طبق أرز مع دجاج مشوي",
        portion_multiplier: 1, serving_weight_g: 275,
        recipe_macros: { calories: 448, protein_g: 49.8, carbs_g: 33.6, fat_g: 10.7 },
        is_novel: false, meal_role_tag: "main",
        notes: "Pre-training carbs — paired with greens for micronutrient density.",
        scaled_ingredients: [chicken, rice, oliveOil],
      }],
    },
    {
      meal_type: "snack",
      meal_macros: { calories: 273, protein_g: 18, carbs_g: 32, fat_g: 6 },
      recipes: [{
        recipe_id: "REC-APPLE-YOGURT-SNACK-001",
        recipe_name_en: "Apple with high-protein yogurt",
        recipe_name_ar: "تفاح مع زبادي عالي البروتين",
        portion_multiplier: 1, serving_weight_g: 290,
        recipe_macros: { calories: 193, protein_g: 17.4, carbs_g: 27.6, fat_g: 2.3 },
        is_novel: true, meal_role_tag: "snack",
        notes: "Light afternoon snack — fibre + steady energy with slow-release protein.",
        scaled_ingredients: [apple, proteinYogurt],
        validation: { passed: true, attempts_count: 1, failure_reasons: [] },
      }],
    },
    {
      meal_type: "dinner",
      meal_macros: { calories: 854, protein_g: 65, carbs_g: 62, fat_g: 38 },
      recipes: [{
        recipe_id: "REC-SALMON-POTATO-TRAYBAKE-001",
        recipe_name_en: "Salmon and potato traybake",
        recipe_name_ar: "سلمون مع بطاطس في الفرن",
        portion_multiplier: 1, serving_weight_g: 340,
        recipe_macros: { calories: 710, protein_g: 51, carbs_g: 60, fat_g: 28 },
        is_novel: false, meal_role_tag: "main",
        notes: "Omega-3 rich; minimal starch in evening to flatten CGM curve.",
        scaled_ingredients: [salmon, oliveOil],
      }],
    },
  ],
};

// ─── Compact day factory for days 2–7 ───────────────────────────────────────
const compactDay = (
  n: number,
  label: string,
  totals: DayMacros,
  meals: { type: MealType; name: string; nameAr: string; kcal: number; p: number; c: number; f: number; notes: string; novel?: boolean; ingredients: ScaledIngredient[] }[],
): PlanDay => ({
  day_number: n, day_label: label,
  day_macros: totals,
  meals: meals.map((m, i) => ({
    meal_type: m.type,
    meal_macros: { calories: m.kcal, protein_g: m.p, carbs_g: m.c, fat_g: m.f },
    recipes: [{
      recipe_id: `REC-${label}-${i}`,
      recipe_name_en: m.name, recipe_name_ar: m.nameAr,
      portion_multiplier: 1,
      serving_weight_g: m.ingredients.reduce((s, x) => s + x.quantity_g, 0) || 250,
      recipe_macros: { calories: m.kcal, protein_g: m.p, carbs_g: m.c, fat_g: m.f },
      is_novel: !!m.novel, meal_role_tag: m.type === "snack" ? "snack" : "main",
      notes: m.notes,
      scaled_ingredients: m.ingredients,
      validation: m.novel ? { passed: true, attempts_count: 1, failure_reasons: [] } : undefined,
    }],
  })),
});

const eggs: ScaledIngredient = {
  ingredient_id: "ING-EGG-001", ingredient_name_en: "Eggs", ingredient_name_ar: "بيض",
  quantity: 3, unit: "piece", quantity_g: 150,
  macros: { calories: 233, protein_g: 19, carbs_g: 1.7, fat_g: 16.5, fiber_g: 0, sodium_mg: 186, potassium_mg: 207, iron_mg: 2.6, calcium_mg: 75, phosphorus_mg: 297 },
  allergen_flags: ["egg"], dietary_flags: ["vegetarian", "high_protein"], cost_tier: "low",
};
const lentils: ScaledIngredient = {
  ingredient_id: "ING-LENTILS-001", ingredient_name_en: "Lentils, cooked", ingredient_name_ar: "عدس مطبوخ",
  quantity: 200, unit: "g", quantity_g: 200,
  macros: { calories: 232, protein_g: 18, carbs_g: 40, fat_g: 0.8, fiber_g: 15.6, sodium_mg: 4, potassium_mg: 730, iron_mg: 6.6, calcium_mg: 38, phosphorus_mg: 360 },
  dietary_flags: ["vegan", "high_fiber"], cost_tier: "low",
};
const beef: ScaledIngredient = {
  ingredient_id: "ING-BEEF-LEAN-001", ingredient_name_en: "Lean beef", ingredient_name_ar: "لحم بقري قليل الدهن",
  quantity: 180, unit: "g", quantity_g: 180,
  macros: { calories: 316, protein_g: 47, carbs_g: 0, fat_g: 13, fiber_g: 0, sodium_mg: 110, potassium_mg: 540, iron_mg: 4.5, calcium_mg: 22, phosphorus_mg: 340 },
  dietary_flags: ["high_protein", "halal"], cost_tier: "high",
};
const sweetPotato: ScaledIngredient = {
  ingredient_id: "ING-SWEET-POTATO-001", ingredient_name_en: "Sweet potato", ingredient_name_ar: "بطاطا حلوة",
  quantity: 200, unit: "g", quantity_g: 200,
  macros: { calories: 172, protein_g: 3.2, carbs_g: 40, fat_g: 0.2, fiber_g: 6, sodium_mg: 110, potassium_mg: 670, iron_mg: 1.4, calcium_mg: 60, phosphorus_mg: 94 },
  dietary_flags: ["vegan"], glycemic_index: 63, cost_tier: "low",
};

const sampleDays: PlanDay[] = [
  day1,
  compactDay(2, "TUE", { calories: 2110, protein_g: 158, carbs_g: 195, fat_g: 70 }, [
    { type: "breakfast", name: "Veggie omelette", nameAr: "أومليت بالخضروات", kcal: 420, p: 28, c: 8, f: 30, notes: "High choline + iron — supports energy & cognition.", ingredients: [eggs, oliveOil] },
    { type: "lunch", name: "Lentil soup + sourdough", nameAr: "شوربة عدس مع خبز", kcal: 540, p: 24, c: 78, f: 10, notes: "Slow carbs + plant protein for sustained midday energy.", ingredients: [lentils] },
    { type: "snack", name: "Cottage cheese + apple", nameAr: "جبنة قريش مع تفاح", kcal: 290, p: 26, c: 30, f: 6, notes: "Casein-dominant — slow-release amino acids.", ingredients: [proteinYogurt, apple] },
    { type: "dinner", name: "Grilled steak + sweet potato", nameAr: "ستيك مشوي مع بطاطا", kcal: 700, p: 52, c: 45, f: 28, notes: "Iron + creatine; sweet potato = post-session refuel.", ingredients: [beef, sweetPotato] },
  ]),
  compactDay(3, "WED", { calories: 2080, protein_g: 156, carbs_g: 188, fat_g: 72 }, [
    { type: "breakfast", name: "Smoked salmon + avocado toast", nameAr: "سلمون مدخن مع توست أفوكادو", kcal: 560, p: 28, c: 38, f: 32, notes: "Lower-carb breakfast; healthy fats lead the morning.", ingredients: [salmon] },
    { type: "lunch", name: "Greens bowl + chicken", nameAr: "طبق خضار مع دجاج", kcal: 520, p: 44, c: 30, f: 22, notes: "High-volume, low energy density — supports recomposition.", ingredients: [chicken, oliveOil] },
    { type: "snack", name: "Skyr + walnuts", nameAr: "سكير مع جوز", kcal: 320, p: 24, c: 18, f: 16, notes: "Casein protein + omega-3 fats between meals.", ingredients: [proteinYogurt] },
    { type: "dinner", name: "Cod + ratatouille + brown rice", nameAr: "كود مع أرز بني", kcal: 600, p: 46, c: 62, f: 16, notes: "Lean protein, micronutrient-dense veg, slow carbs.", ingredients: [rice, oliveOil] },
  ]),
  compactDay(4, "THU", { calories: 2150, protein_g: 165, carbs_g: 210, fat_g: 65 }, [
    { type: "breakfast", name: "Overnight oats + whey", nameAr: "شوفان مع واي بروتين", kcal: 520, p: 34, c: 70, f: 10, notes: "Carb-loaded breakfast on heavy session day.", ingredients: [oats, greekYogurt] },
    { type: "lunch", name: "Turkey wrap + side salad", nameAr: "راب ديك رومي مع سلطة", kcal: 560, p: 42, c: 50, f: 18, notes: "Easy-prep lunch; lean protein, controlled carbs.", ingredients: [oliveOil] },
    { type: "snack", name: "Rice cakes + nut butter", nameAr: "كعك أرز مع زبدة جوز", kcal: 220, p: 6, c: 32, f: 8, notes: "Pre-workout 60 min out — fast carbs + minimal fat.", ingredients: [] },
    { type: "dinner", name: "Chicken stir-fry + jasmine rice", nameAr: "دجاج مع أرز ياسمين", kcal: 680, p: 48, c: 78, f: 16, notes: "Post-lift refuel — ideal carb timing.", ingredients: [chicken, rice] },
  ]),
  compactDay(5, "FRI", { calories: 2095, protein_g: 160, carbs_g: 180, fat_g: 75 }, [
    { type: "breakfast", name: "Eggs + smoked salmon", nameAr: "بيض مع سلمون مدخن", kcal: 460, p: 36, c: 8, f: 30, notes: "Protein + omega-3; minimal carbs to start the day.", ingredients: [eggs, salmon] },
    { type: "lunch", name: "Tuna & white-bean salad", nameAr: "سلطة تونة وفاصوليا", kcal: 520, p: 42, c: 48, f: 14, notes: "Mediterranean lipid-friendly profile.", ingredients: [oliveOil] },
    { type: "snack", name: "Greek yogurt + honey", nameAr: "زبادي يوناني مع عسل", kcal: 240, p: 18, c: 28, f: 6, notes: "Pre-evening session snack — light, fast-digesting.", ingredients: [greekYogurt] },
    { type: "dinner", name: "Lamb kofta + tabbouleh", nameAr: "كفتة لحم مع تبولة", kcal: 720, p: 46, c: 50, f: 32, notes: "Iron-rich finisher — herbs & lemon for digestion.", ingredients: [beef] },
  ]),
  compactDay(6, "SAT", { calories: 2040, protein_g: 150, carbs_g: 200, fat_g: 70 }, [
    { type: "breakfast", name: "Shakshuka + sourdough", nameAr: "شكشوكة مع خبز", kcal: 620, p: 30, c: 58, f: 28, notes: "Slow weekend brunch; iron + lycopene.", ingredients: [eggs, oliveOil] },
    { type: "lunch", name: "Mezze plate", nameAr: "طبق مازة", kcal: 720, p: 28, c: 70, f: 36, notes: "Plant-forward midday; controlled carbs.", ingredients: [oliveOil] },
    { type: "snack", name: "Apple + almond butter", nameAr: "تفاح مع زبدة لوز", kcal: 240, p: 6, c: 26, f: 14, notes: "Light afternoon snack — fibre + steady energy.", ingredients: [apple] },
    { type: "dinner", name: "Grilled fish + quinoa", nameAr: "سمك مشوي مع كينوا", kcal: 540, p: 44, c: 48, f: 18, notes: "Lean protein, low-GI carbs aligning with CGM signal.", ingredients: [salmon] },
  ]),
  compactDay(7, "SUN", { calories: 2050, protein_g: 158, carbs_g: 175, fat_g: 72 }, [
    { type: "breakfast", name: "Berry protein smoothie", nameAr: "سموذي بروتين بالتوت", kcal: 360, p: 32, c: 42, f: 6, notes: "Light start; fast protein and antioxidants.", ingredients: [berries, greekYogurt] },
    { type: "lunch", name: "Roast chicken + cauliflower mash", nameAr: "دجاج مشوي مع قرنبيط", kcal: 620, p: 52, c: 24, f: 32, notes: "Sunday batch — sets up Monday lunch leftovers.", ingredients: [chicken, oliveOil] },
    { type: "snack", name: "Cottage cheese + pineapple", nameAr: "جبنة قريش مع أناناس", kcal: 260, p: 26, c: 22, f: 4, notes: "Slow-release protein snack with bromelain for digestion.", ingredients: [proteinYogurt], novel: true },
    { type: "dinner", name: "Soup + grilled chicken salad", nameAr: "شوربة مع سلطة دجاج", kcal: 520, p: 44, c: 36, f: 20, notes: "High satiety, low kcal — closes the week balanced.", ingredients: [chicken] },
  ]),
];

const sumWeekly = (days: PlanDay[]): WeeklyMacros => {
  const acc = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sodium_mg: 0, potassium_mg: 0, iron_mg: 0, calcium_mg: 0, phosphorus_mg: 0 };
  days.forEach((d) => {
    acc.calories += d.day_macros.calories;
    acc.protein_g += d.day_macros.protein_g;
    acc.carbs_g += d.day_macros.carbs_g;
    acc.fat_g += d.day_macros.fat_g;
    d.meals.forEach((m) => m.recipes.forEach((r) => r.scaled_ingredients.forEach((ing) => {
      acc.fiber_g += ing.macros.fiber_g ?? 0;
      acc.sodium_mg += ing.macros.sodium_mg ?? 0;
      acc.potassium_mg += ing.macros.potassium_mg ?? 0;
      acc.iron_mg += ing.macros.iron_mg ?? 0;
      acc.calcium_mg += ing.macros.calcium_mg ?? 0;
      acc.phosphorus_mg += ing.macros.phosphorus_mg ?? 0;
    })));
  });
  // Light scaling: structured ingredients are only a sample of meals → scale
  // micronutrients up so the weekly figures feel realistic in the demo.
  const microScale = 2.6;
  const round = (n: number) => Math.round(n);
  const agg = (total: number): WeeklyAggregate => ({ total: round(total), average: round(total / 7) });
  return {
    calories: agg(acc.calories),
    protein_g: agg(acc.protein_g),
    carbs_g: agg(acc.carbs_g),
    fat_g: agg(acc.fat_g),
    fiber_g: agg(acc.fiber_g * microScale),
    sodium_mg: agg(acc.sodium_mg * microScale),
    potassium_mg: agg(acc.potassium_mg * microScale),
    iron_mg: agg(acc.iron_mg * microScale),
    calcium_mg: agg(acc.calcium_mg * microScale),
    phosphorus_mg: agg(acc.phosphorus_mg * microScale),
  };
};

export const samplePlan: MealPlan = {
  plan_metadata: {
    user_id: "Byte-10452",
    plan_id: "PLAN-2026-04-29-0001",
    generated_at: "2026-04-29T10:15:22Z",
    plan_duration_days: 7,
  },
  nutrition_targets: {
    calories: { value: 2100, tolerance: 5, tolerance_unit: "pct" },
    protein_g: { value: 160, tolerance: 10, tolerance_unit: "g" },
    carbs_g:   { value: 190, tolerance: 15, tolerance_unit: "g" },
    fat_g:     { value: 70,  tolerance: 8,  tolerance_unit: "g" },
  },
  calorie_strategy: {
    direction: "deficit",
    maintenance_calories: 2550,
    adjustment: -450,
    target_calories: 2100,
    macro_percentages: { protein_pct: 30, carbs_pct: 36, fat_pct: 30 },
    daily_allowed_range: { min_calories: 1995, max_calories: 2205 },
    explanation: "A moderate calorie deficit was selected to support sustainable fat loss while preserving lean mass through higher protein intake.",
  },
  health_notes: [
    { finding: "HbA1c is borderline elevated.", directive: "Prioritize moderate glycemic load, higher fiber carbohydrates, and balanced meal composition.", source: "blood_tests.hba1c" },
    { finding: "Body fat percentage is above optimal range.", directive: "Use a calorie deficit and high-protein meals to support fat loss while preserving muscle.", source: "inbody.body_fat_percentage" },
    { finding: "Sleep duration is below ideal.", directive: "Favor steady meals with good satiety and avoid highly disruptive late-night choices.", source: "activity.average_total_sleep_duration_minutes" },
    { finding: "WBC trending low.", directive: "Emphasise zinc, vitamin C and oily fish 3×/week to support immune function.", source: "blood_tests.wbc" },
    { finding: "Cholesterol management.", directive: "Daily soluble fibre (oats, lentils) plus omega-3 sources to keep LDL trending down.", source: "blood_tests.ldl" },
  ],
  superfoods: [
    { type: "ingredient", id: "ING-OATS-ROLLED-001", name_en: "Rolled oats", name_ar: "شوفان ملفوف", explanation: "Beta-glucan fibre helps lower LDL cholesterol; supports breakfast satiety." },
    { type: "ingredient", id: "ING-GREEK-YOGURT-001", name_en: "Greek yogurt", name_ar: "زبادي يوناني", explanation: "High-quality protein with calcium — versatile across breakfast and snacks." },
    { type: "ingredient", id: "ING-SALMON-001", name_en: "Salmon", name_ar: "سلمون", explanation: "Omega-3 + complete protein for cardiovascular and recovery support." },
    { type: "ingredient", id: "ING-OLIVE-OIL-001", name_en: "Olive oil", name_ar: "زيت زيتون", explanation: "Monounsaturated fats improve cholesterol profile and reduce inflammation." },
    { type: "ingredient", id: "ING-LENTILS-001", name_en: "Lentils", name_ar: "عدس", explanation: "Soluble fibre + plant protein — excellent for cholesterol management." },
    { type: "recipe",     id: "REC-GRILLED-CHICKEN-RICE-BOWL-001", name_en: "Grilled chicken rice bowl", name_ar: "طبق أرز مع دجاج مشوي", explanation: "Structured high-protein lunch with controlled calories and familiar profile." },
  ],
  plan_description: {
    description: "7-day plan emphasising high-protein meals, moderate carbohydrate control, practical Mediterranean-friendly choices, and steady fibre intake to support sustainable fat loss and metabolic health.",
    plan_tags: ["fat_loss", "high_protein", "moderate_gi", "mediterranean", "balanced_meals"],
  },
  days: sampleDays,
  weekly_macros: sumWeekly(sampleDays),
  generation_metadata: {
    pipeline_execution: {
      model_name: "DeepSeek R1",
      model_version: "1.0.0",
      pipeline_version: "phase_0b_v1",
      total_generation_time_ms: 4280,
    },
    deviations: [
      { scope: "meal", identifier: "MON · lunch",  target: 650,  actual: 448,  delta: -202 },
      { scope: "day",  identifier: "MON · total",  target: 2100, actual: 2088, delta: -12 },
      { scope: "day",  identifier: "WED · total",  target: 2100, actual: 2080, delta: -20 },
      { scope: "meal", identifier: "FRI · dinner", target: 700,  actual: 720,  delta: +20 },
    ],
    validation_summary: { final_passed: true, attempts_used: 2, max_attempts: 3 },
  },
};

// Source label lookup for health-note source chips
export const SOURCE_LABELS: Record<string, string> = {
  "blood_tests.hba1c": "HbA1c",
  "blood_tests.ldl": "LDL",
  "blood_tests.wbc": "WBC",
  "inbody.body_fat_percentage": "Body fat %",
  "activity.average_total_sleep_duration_minutes": "Sleep duration",
};
