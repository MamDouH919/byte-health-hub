# Nutrition tab — schema review & improvement advice

This is an **advisory plan**. Nothing will be built until you approve. The goal is to map the schemas you shared (user data contract, ingredient schema, meal plan output) against the current `Nutrition.tsx` and recommend high‑impact upgrades.

---

## 1. Where the current UI already aligns

The existing tab covers most of the right concepts, just with looser data:

- **Plan Context cards** (Health Notes, Superfoods, Caloric Strategy) → map cleanly to `health_notes[]`, `superfoods[]`, and `calorie_strategy` in the plan schema.
- **7‑day meal grid with per‑day macros** → mirrors `days[].meals[]` and `day_macros`.
- **AI score + Regenerate + Notes for AI** → conceptually matches `validation_summary` and `generation_metadata`.

So the structural skeleton is already close. The gaps are in **data fidelity, drill‑down depth, and trust signals**.

---

## 2. Key gaps vs the schema

| Schema concept | Today in UI | Gap |
|---|---|---|
| `nutrition_targets` (kcal, P/C/F with tolerance) | Hardcoded "2350 kcal" string | No explicit target band, no compliance indicator |
| `calorie_strategy.daily_allowed_range` (min/max) | Not shown | Cannot see if a day falls inside/outside the band |
| `weekly_macros` (incl. fiber, sodium, potassium, iron, calcium, phosphorus) | Only kcal/P/C/F | Micronutrients invisible — yet they're the differentiator |
| `meals[].recipes[].scaled_ingredients[]` | Free‑text "portion" string | No structured ingredients, no per‑ingredient macros |
| `is_novel` + `novel_recipes[]` (AI‑generated, validated) | Not surfaced | Clinician can't see what was AI‑invented vs library |
| `generation_metadata` (model, timings, slot/gap fill logs, deviations, validation attempts) | Generic "AI generated v2" pill | No transparency / auditability |
| `health_notes[].source` (e.g. `blood_tests.hba1c`) | Plain text | No traceability back to the originating report |
| `superfoods[].type` (`ingredient` vs `recipe`) + `id` | Plain title + body | No link to ingredient/recipe records |
| Ingredient schema: `allergen_flags`, `dietary_flags`, `glycemic_index`, `cost_tier`, `cultural_tags`, `SourceTracking` | None | Safety filtering & provenance missing |
| Bilingual `name_en` / `name_ar` | EN only | No Arabic display |
| `household_units` (cup, tbsp + gram_equivalent) | "180 g" only | Users think in cups/spoons too |
| `meal_role_tag` (`breakfast_base`, `main`, `snack`) | Implicit via `tone` | OK, but should derive from schema |
| `plan_metadata` (plan_id, generated_at, duration) | Not shown | No version/audit header |

---

## 3. Recommended improvements (prioritised)

### Tier 1 — high value, low effort

1. **Daily target band on the macro strip**
   Show actual vs `daily_allowed_range.min/max_calories` as a small range bar (we already have `RangeBar.tsx`). Same for P/C/F using `nutrition_targets[].tolerance`. Color: green inside band, amber near edge, red outside.

2. **"Novel recipe" badge**
   When `recipe.is_novel === true`, show a small `Sparkles` chip next to the meal name. On hover/click, surface its `validation_result` (passed/failed, attempts, validator name). Builds clinician trust.

3. **Source traceability on Health Notes**
   Each note already has `body`. Add a tiny source chip ("blood_tests.hba1c", "inbody.body_fat_percentage") that links to the relevant report tab. Pulls directly from `health_notes[].source`.

4. **Plan metadata header**
   Replace "v2 · just now" with a compact strip: `PLAN-2026-03-31-0001 · generated 31 Mar 10:15 · DeepSeek R1 · 4.28s`. Pulled from `plan_metadata` + `generation_metadata.pipeline_execution`.

### Tier 2 — meaningful UX upgrades

5. **Ingredient‑level expansion inside each meal**
   Today a meal is one line. Add an expand toggle that reveals `scaled_ingredients[]` as a small table: name (EN/AR), qty + household unit, kcal/P/C/F, and badges for `allergen_flags`, `glycemic_index`, `cost_tier`. This is where the schema's depth actually pays off.

6. **Micronutrient ribbon (weekly view)**
   Add a collapsible "Micronutrients" panel showing weekly averages for fiber, sodium, potassium, iron, calcium, phosphorus from `weekly_macros`, each with a target reference and a small sparkline across the 7 days. This is the single biggest visible differentiator vs a generic meal planner.

7. **Deviations panel**
   A small "Deviations" section listing entries from `generation_metadata.deviations` (e.g. "Day 1 lunch −30 kcal vs target"). Helps the clinician spot drift before publishing.

8. **Validation summary popover**
   On the AI score chip, clicking opens a popover that shows `validation_summary.attempts[]` — which rules passed, what was regenerated and why. Replaces the current opaque "48/100".

### Tier 3 — strategic / requires backend coordination

9. **Bilingual rendering (EN/AR) with a single toggle**
   The schema is already bilingual end‑to‑end. Add a language toggle in the tab header; recipe/ingredient names switch via `name_en` / `name_ar`. Good fit for the Egyptian market.

10. **Allergen & dietary safety filter**
    Sidebar chip filter ("vegetarian", "halal", "gluten‑free", "no peanuts"). Greys out / flags any meal whose ingredients violate the filter. Backed by `dietary_flags` and `allergen_flags`.

11. **Substitution UI for novel recipes**
    `novel_recipes[].recipe_template.ingredients[].substitution_overrides[]` is in the schema. Right‑click an ingredient → "Swap with…" lists allowed substitutes. Powerful clinician tool.

12. **Source provenance on every nutrition number**
    Show a tiny info icon on each macro that opens `SourceTracking` (e.g. "USDA · entry 12345 · verified by system"). Matches the schema's explicit anti‑hallucination stance.

---

## 4. Suggested data layer

Currently `Nutrition.tsx` hardcodes `baseWeek` and `altWeek` arrays inside the component. To support the above without rewriting the page each iteration:

- Extract a typed mock at `src/lib/nutrition-plan.ts` shaped exactly like the JSON sample (`PlanMetadata`, `Day`, `Meal`, `Recipe`, `ScaledIngredient`, `WeeklyMacros`, `GenerationMetadata`).
- Load one realistic sample (the JSON you provided) and have the component render from that shape.
- This makes future swap‑to‑real‑API trivial: only the loader changes.

---

## 5. Technical notes (for the developer pass)

- New types live in `src/lib/nutrition-plan.ts`; UI stays in `src/pages/patient/Nutrition.tsx` plus 2–3 small subcomponents (`MealRow`, `IngredientTable`, `MicronutrientRibbon`, `ValidationPopover`).
- Reuse existing primitives: `RangeBar`, `StatusPill`, `CountUp`, `Popover`, `Tooltip`, `surface-card`. No new deps.
- Bilingual: store language in a small `useLang()` hook, default EN, toggle in tab header. No i18n library needed yet for this scope.
- Keep the Create tab untouched in this pass — it's a separate ingredient/meal builder and not directly schema‑driven.

---

## 6. What I'd like you to choose

Pick any combination and I'll implement it next:

- **A. Quick wins only** — Tier 1 items (1–4). Small, high signal, no schema refactor. ~1 pass.
- **B. Quick wins + ingredient depth** — Tier 1 + items 5, 6, 7. The most visible upgrade for clinicians.
- **C. Full schema alignment** — also extract typed data layer (section 4), add validation popover and bilingual toggle.
- **D. Custom** — tell me which numbered items to do.

No code is changed yet. Reply with A/B/C/D (or specific item numbers) and I'll proceed.
