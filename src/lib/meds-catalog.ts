// Curated catalog of common meds & supplements, grouped by section.
// Used by the Meds page picker — clinicians can search/select instead of free-typing.
export type MedCategory = "prescriptions" | "supplements" | "performance" | "sleepAids";

export interface CatalogEntry {
  name: string;
  defaultDose: string;
  defaultDetail: string;
  category: MedCategory;
  group: string; // sub-grouping inside the picker (e.g. "Cardio-metabolic")
}

export const medsCatalog: CatalogEntry[] = [
  // ── Prescriptions ─────────────────────────────────────────
  { name: "Metformin",       defaultDose: "500 mg",  defaultDetail: "Twice daily with meals",       category: "prescriptions", group: "Cardio-metabolic" },
  { name: "Atorvastatin",    defaultDose: "10 mg",   defaultDetail: "Once daily, evening",          category: "prescriptions", group: "Cardio-metabolic" },
  { name: "Rosuvastatin",    defaultDose: "10 mg",   defaultDetail: "Once daily, evening",          category: "prescriptions", group: "Cardio-metabolic" },
  { name: "Amlodipine",      defaultDose: "5 mg",    defaultDetail: "Once daily, morning",          category: "prescriptions", group: "Blood pressure" },
  { name: "Lisinopril",      defaultDose: "10 mg",   defaultDetail: "Once daily",                   category: "prescriptions", group: "Blood pressure" },
  { name: "Ibuprofen",       defaultDose: "400 mg",  defaultDetail: "PRN, max 3×/day with food",    category: "prescriptions", group: "Pain & inflammation" },
  { name: "Salbutamol",      defaultDose: "100 mcg", defaultDetail: "PRN — inhaler",                category: "prescriptions", group: "Respiratory" },
  { name: "Levothyroxine",   defaultDose: "50 mcg",  defaultDetail: "Morning, fasted",              category: "prescriptions", group: "Endocrine" },

  // ── Supplements ───────────────────────────────────────────
  { name: "Vitamin D3",          defaultDose: "2000 IU", defaultDetail: "Morning, with fat",                       category: "supplements", group: "Vitamins & minerals" },
  { name: "Vitamin D3 + K2",     defaultDose: "2000 IU / 100 mcg", defaultDetail: "Morning, with fat",             category: "supplements", group: "Vitamins & minerals" },
  { name: "Vitamin B12",         defaultDose: "1000 mcg",defaultDetail: "Morning",                                  category: "supplements", group: "Vitamins & minerals" },
  { name: "Iron bisglycinate",   defaultDose: "25 mg",   defaultDetail: "With vitamin C, away from coffee/tea",     category: "supplements", group: "Vitamins & minerals" },
  { name: "Omega-3 (EPA/DHA)",   defaultDose: "2 g",     defaultDetail: "With a meal — anti-inflammatory",          category: "supplements", group: "Cardio-metabolic" },
  { name: "Berberine",           defaultDose: "500 mg",  defaultDetail: "3×/day with meals — glucose support",      category: "supplements", group: "Cardio-metabolic" },
  { name: "Inositol",            defaultDose: "4 g",     defaultDetail: "Morning — insulin sensitivity",            category: "supplements", group: "Cardio-metabolic" },
  { name: "CoQ10 (Ubiquinol)",   defaultDose: "200 mg",  defaultDetail: "Morning — mitochondrial / statin co-supp", category: "supplements", group: "Longevity" },
  { name: "NMN",                 defaultDose: "500 mg",  defaultDetail: "Morning",                                   category: "supplements", group: "Longevity" },
  { name: "Resveratrol",         defaultDose: "500 mg",  defaultDetail: "Morning, with fat",                         category: "supplements", group: "Longevity" },
  { name: "Curcumin (Meriva)",   defaultDose: "500 mg",  defaultDetail: "2×/day — joint inflammation",               category: "supplements", group: "Longevity" },

  // ── Performance & recovery ────────────────────────────────
  { name: "Creatine monohydrate", defaultDose: "5 g",   defaultDetail: "Daily, any time",                         category: "performance", group: "Strength" },
  { name: "Whey isolate",         defaultDose: "30 g",  defaultDetail: "Post-training",                           category: "performance", group: "Strength" },
  { name: "Collagen + Vit C",     defaultDose: "15 g + 50 mg", defaultDetail: "30–60 min pre-loading — tendon",  category: "performance", group: "Connective tissue" },
  { name: "Beta-alanine",         defaultDose: "3.2 g", defaultDetail: "Split AM/PM — Z4 buffering",              category: "performance", group: "Endurance" },
  { name: "Sodium bicarbonate",   defaultDose: "0.2 g/kg", defaultDetail: "Pre-tempo only — gut tested",          category: "performance", group: "Endurance" },
  { name: "Electrolytes",         defaultDose: "1 sachet", defaultDetail: "Intra-workout / hot conditions",       category: "performance", group: "Hydration" },
  { name: "Carb mix (malto/fructose)", defaultDose: "70 g/h", defaultDetail: "Long sessions — fueling protocol", category: "performance", group: "Endurance" },
  { name: "Tart cherry concentrate", defaultDose: "30 mL", defaultDetail: "Post-session — recovery",              category: "performance", group: "Recovery" },

  // ── Sleep aids ────────────────────────────────────────────
  { name: "Magnesium glycinate", defaultDose: "300 mg", defaultDetail: "60 min before bed",                       category: "sleepAids", group: "Minerals" },
  { name: "Magnesium threonate", defaultDose: "144 mg", defaultDetail: "Pre-bed — cognitive variant",             category: "sleepAids", group: "Minerals" },
  { name: "Glycine",             defaultDose: "3 g",    defaultDetail: "30 min before bed",                       category: "sleepAids", group: "Amino acids" },
  { name: "L-Theanine",          defaultDose: "200 mg", defaultDetail: "Evening wind-down",                       category: "sleepAids", group: "Amino acids" },
  { name: "Melatonin",           defaultDose: "0.5 mg", defaultDetail: "Travel / circadian reset only",           category: "sleepAids", group: "Hormonal" },
  { name: "Ashwagandha (KSM-66)",defaultDose: "600 mg", defaultDetail: "Evening — cortisol regulation",           category: "sleepAids", group: "Adaptogens" },
];

export const catalogByCategory = (cat: MedCategory) =>
  medsCatalog.filter((c) => c.category === cat);
