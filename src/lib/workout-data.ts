export type ExerciseMode = "strength" | "timed" | null

export type Exercise = {
  id: string
  name: string
  category: string
}

/** An exercise with a chosen mode attached (after coach picks dumbbell or clock) */
export type SelectedExercise = Exercise & {
  mode: ExerciseMode
  prescription: string // e.g. "3×10" or "1 min"
}

export const MODE_PRESETS = {
  strength: { label: "3×10", prescription: "3×10" },
  timed: { label: "3g × 1 min", prescription: "3g × 1 min" },
} as const

export type WorkoutSegment = "Warm Up" | "Main Block" | "Active Recovery" | "Other"

export type Workout = {
  id: string
  name: string
  color: string // tailwind color key, e.g. "emerald"
  exercises: SelectedExercise[]
  segment?: WorkoutSegment
}

/* Monochrome palette — all workout pills use the neutral surface scheme. */
const MONO = {
  bg:     "bg-[hsl(var(--surface))]",
  border: "border-[hsl(var(--surface-border))]",
  text:   "text-foreground",
  dot:    "bg-foreground",
  badge:  "bg-[hsl(var(--surface))] text-foreground border border-[hsl(var(--surface-border))]",
  ring:   "ring-[hsl(var(--surface-border))]",
} as const
export const WORKOUT_COLORS = [MONO, MONO, MONO, MONO, MONO, MONO] as const

export type WorkoutColorScheme = (typeof WORKOUT_COLORS)[number]

/** Companies athletes belong to */
export const COMPANIES = ["Carina", "Asfour", "Wayup", "Adsero"] as const
export type Company = (typeof COMPANIES)[number]

/** Mock athletes/users a coach can assign workouts to */
export type Athlete = {
  id: string
  name: string
  avatar: string // initials
  company: Company
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase()
}

function ath(id: string, name: string, company: Company): Athlete {
  return { id, name, avatar: initials(name), company }
}

export const MOCK_ATHLETES: Athlete[] = [
  // Carina
  ath("ath-1",  "Ali Farag",        "Carina"),
  ath("ath-2",  "Nour El Sherbini", "Carina"),
  ath("ath-3",  "Omar Khalil",      "Carina"),
  ath("ath-4",  "Layla Hassan",     "Carina"),
  // Asfour
  ath("ath-5",  "Yassin Asfour",    "Asfour"),
  ath("ath-6",  "Tarek Momen",      "Asfour"),
  ath("ath-7",  "Salma Hany",       "Asfour"),
  ath("ath-8",  "Karim Abdel",      "Asfour"),
  // Wayup
  ath("ath-9",  "Mariam Metwally", "Wayup"),
  ath("ath-10", "Fares Desouky",   "Wayup"),
  ath("ath-11", "Dina Rashwan",    "Wayup"),
  ath("ath-12", "Yousef Soliman",  "Wayup"),
  // Adsero
  ath("ath-13", "Rowan Elaraby",   "Adsero"),
  ath("ath-14", "Ahmed Elnawasany","Adsero"),
  ath("ath-15", "Hania El Hammamy","Adsero"),
  ath("ath-16", "Zeina Mickawy",   "Adsero"),
]

export type WeekSchedule = Record<string, Workout[]>

export const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const

/** Derive a WorkoutSegment from a workout name string.
 *  Handles the exact values from WORKOUT_NAME_OPTIONS as well as
 *  any freeform name that contains the segment keywords.
 */
export function segmentFromName(name: string): WorkoutSegment {
  const n = name.toLowerCase()
  if (n === "warm up" || n.startsWith("warm")) return "Warm Up"
  if (n === "active recovery" || n.includes("recovery")) return "Active Recovery"
  if (n.startsWith("main block") || n.includes("main")) return "Main Block"
  return "Other"
}

export const CATEGORIES = ["All", "Legs", "Biceps", "Triceps", "Core", "Back", "Chest", "Shoulders", "Cardio", "Stretching"] as const

export const WORKOUT_NAME_OPTIONS = [
  "Warm Up",
  "Main Block (Strength)",
  "Main Block (Cardio)",
  "Active Recovery",
] as const

export const MOCK_EXERCISES: Exercise[] = [
  // Legs (12)
  { id: "ex-l1",  name: "Back Squat",         category: "Legs" },
  { id: "ex-l2",  name: "Front Squat",         category: "Legs" },
  { id: "ex-l3",  name: "Romanian Deadlift",   category: "Legs" },
  { id: "ex-l4",  name: "Leg Press",           category: "Legs" },
  { id: "ex-l5",  name: "Walking Lunge",       category: "Legs" },
  { id: "ex-l6",  name: "Reverse Lunge",       category: "Legs" },
  { id: "ex-l7",  name: "Bulgarian Split Squat",category: "Legs" },
  { id: "ex-l8",  name: "Glute Bridge",        category: "Legs" },
  { id: "ex-l9",  name: "Hip Thrust",          category: "Legs" },
  { id: "ex-l10", name: "Calf Raise",          category: "Legs" },
  { id: "ex-l11", name: "Leg Curl",            category: "Legs" },
  { id: "ex-l12", name: "Step Up",             category: "Legs" },

  // Biceps (12)
  { id: "ex-bi1",  name: "Barbell Curl",         category: "Biceps" },
  { id: "ex-bi2",  name: "Dumbbell Curl",         category: "Biceps" },
  { id: "ex-bi3",  name: "Hammer Curl",           category: "Biceps" },
  { id: "ex-bi4",  name: "Preacher Curl",         category: "Biceps" },
  { id: "ex-bi5",  name: "Concentration Curl",    category: "Biceps" },
  { id: "ex-bi6",  name: "Cable Curl",            category: "Biceps" },
  { id: "ex-bi7",  name: "Incline DB Curl",       category: "Biceps" },
  { id: "ex-bi8",  name: "Reverse Curl",          category: "Biceps" },
  { id: "ex-bi9",  name: "Zottman Curl",          category: "Biceps" },
  { id: "ex-bi10", name: "21s Curl",              category: "Biceps" },
  { id: "ex-bi11", name: "Spider Curl",           category: "Biceps" },
  { id: "ex-bi12", name: "Cross-Body Curl",       category: "Biceps" },

  // Triceps (12)
  { id: "ex-tr1",  name: "Tricep Dip",            category: "Triceps" },
  { id: "ex-tr2",  name: "Tricep Pushdown",       category: "Triceps" },
  { id: "ex-tr3",  name: "Overhead Tricep Ext",   category: "Triceps" },
  { id: "ex-tr4",  name: "Skull Crusher",         category: "Triceps" },
  { id: "ex-tr5",  name: "Close-Grip Bench",      category: "Triceps" },
  { id: "ex-tr6",  name: "Cable Overhead Ext",    category: "Triceps" },
  { id: "ex-tr7",  name: "Diamond Push Up",       category: "Triceps" },
  { id: "ex-tr8",  name: "Kickback",              category: "Triceps" },
  { id: "ex-tr9",  name: "Rope Pushdown",         category: "Triceps" },
  { id: "ex-tr10", name: "Tate Press",            category: "Triceps" },
  { id: "ex-tr11", name: "JM Press",              category: "Triceps" },
  { id: "ex-tr12", name: "Board Press",           category: "Triceps" },

  // Core (12)
  { id: "ex-c1",  name: "Plank",               category: "Core" },
  { id: "ex-c2",  name: "Side Plank",          category: "Core" },
  { id: "ex-c3",  name: "Crunches",            category: "Core" },
  { id: "ex-c4",  name: "Bicycle Crunch",      category: "Core" },
  { id: "ex-c5",  name: "Dead Bug",            category: "Core" },
  { id: "ex-c6",  name: "Leg Raise",           category: "Core" },
  { id: "ex-c7",  name: "Russian Twist",       category: "Core" },
  { id: "ex-c8",  name: "Hollow Body Hold",    category: "Core" },
  { id: "ex-c9",  name: "Ab Rollout",          category: "Core" },
  { id: "ex-c10", name: "Mountain Climber",    category: "Core" },
  { id: "ex-c11", name: "Pallof Press",        category: "Core" },
  { id: "ex-c12", name: "Cable Crunch",        category: "Core" },

  // Back (12)
  { id: "ex-b1",  name: "Deadlift",            category: "Back" },
  { id: "ex-b2",  name: "Pull Up",             category: "Back" },
  { id: "ex-b3",  name: "Chin Up",             category: "Back" },
  { id: "ex-b4",  name: "Barbell Row",         category: "Back" },
  { id: "ex-b5",  name: "Single-Arm DB Row",   category: "Back" },
  { id: "ex-b6",  name: "Cable Row",           category: "Back" },
  { id: "ex-b7",  name: "Lat Pulldown",        category: "Back" },
  { id: "ex-b8",  name: "Face Pull",           category: "Back" },
  { id: "ex-b9",  name: "Rack Pull",           category: "Back" },
  { id: "ex-b10", name: "Good Morning",        category: "Back" },
  { id: "ex-b11", name: "Inverted Row",        category: "Back" },
  { id: "ex-b12", name: "T-Bar Row",           category: "Back" },

  // Chest (12)
  { id: "ex-ch1",  name: "Bench Press",        category: "Chest" },
  { id: "ex-ch2",  name: "Incline Bench Press",category: "Chest" },
  { id: "ex-ch3",  name: "Decline Bench Press",category: "Chest" },
  { id: "ex-ch4",  name: "Push Up",            category: "Chest" },
  { id: "ex-ch5",  name: "Wide Push Up",       category: "Chest" },
  { id: "ex-ch6",  name: "DB Fly",             category: "Chest" },
  { id: "ex-ch7",  name: "Cable Fly",          category: "Chest" },
  { id: "ex-ch8",  name: "Pec Deck",           category: "Chest" },
  { id: "ex-ch9",  name: "Chest Dip",          category: "Chest" },
  { id: "ex-ch10", name: "Landmine Press",     category: "Chest" },
  { id: "ex-ch11", name: "DB Pullover",        category: "Chest" },
  { id: "ex-ch12", name: "Incline DB Press",   category: "Chest" },

  // Shoulders (12)
  { id: "ex-sh1",  name: "Overhead Press",     category: "Shoulders" },
  { id: "ex-sh2",  name: "Arnold Press",       category: "Shoulders" },
  { id: "ex-sh3",  name: "Lateral Raise",      category: "Shoulders" },
  { id: "ex-sh4",  name: "Front Raise",        category: "Shoulders" },
  { id: "ex-sh5",  name: "Rear Delt Fly",      category: "Shoulders" },
  { id: "ex-sh6",  name: "Upright Row",        category: "Shoulders" },
  { id: "ex-sh7",  name: "Cable Lateral Raise",category: "Shoulders" },
  { id: "ex-sh8",  name: "Shrug",              category: "Shoulders" },
  { id: "ex-sh9",  name: "Push Press",         category: "Shoulders" },
  { id: "ex-sh10", name: "Face Pull",          category: "Shoulders" },
  { id: "ex-sh11", name: "Plate Front Raise",  category: "Shoulders" },
  { id: "ex-sh12", name: "Battle Rope",        category: "Shoulders" },

  // Stretching (12)
  { id: "ex-st1",  name: "Hip Flexor Stretch",    category: "Stretching" },
  { id: "ex-st2",  name: "Hamstring Stretch",     category: "Stretching" },
  { id: "ex-st3",  name: "Quad Stretch",          category: "Stretching" },
  { id: "ex-st4",  name: "Pigeon Pose",           category: "Stretching" },
  { id: "ex-st5",  name: "Child's Pose",          category: "Stretching" },
  { id: "ex-st6",  name: "Cat-Cow",               category: "Stretching" },
  { id: "ex-st7",  name: "Thoracic Rotation",     category: "Stretching" },
  { id: "ex-st8",  name: "Doorway Chest Stretch", category: "Stretching" },
  { id: "ex-st9",  name: "Seated Spinal Twist",   category: "Stretching" },
  { id: "ex-st10", name: "Calf Stretch",          category: "Stretching" },
  { id: "ex-st11", name: "Shoulder Cross Stretch",category: "Stretching" },
  { id: "ex-st12", name: "Neck Side Stretch",     category: "Stretching" },

  // Cardio (12)
  { id: "ex-cd1",  name: "Treadmill Run",      category: "Cardio" },
  { id: "ex-cd2",  name: "Rowing Machine",     category: "Cardio" },
  { id: "ex-cd3",  name: "Stationary Bike",    category: "Cardio" },
  { id: "ex-cd4",  name: "Jump Rope",          category: "Cardio" },
  { id: "ex-cd5",  name: "Burpees",            category: "Cardio" },
  { id: "ex-cd6",  name: "Box Jumps",          category: "Cardio" },
  { id: "ex-cd7",  name: "Stair Climber",      category: "Cardio" },
  { id: "ex-cd8",  name: "Ski Erg",            category: "Cardio" },
  { id: "ex-cd9",  name: "Sprint Intervals",   category: "Cardio" },
  { id: "ex-cd10", name: "Assault Bike",       category: "Cardio" },
  { id: "ex-cd11", name: "High Knees",         category: "Cardio" },
  { id: "ex-cd12", name: "Jumping Jacks",      category: "Cardio" },
]

export function createEmptyWeek(): WeekSchedule {
  return Object.fromEntries(DAYS.map((day) => [day, []])) as WeekSchedule
}

export const PLAN_GOALS      = ["Fat loss", "Strength", "Muscle gain", "Endurance", "General fitness", "Rehab & mobility"] as const
export const PLAN_LEVELS     = ["Beginner", "Intermediate", "Advanced"] as const
export const PLAN_FREQUENCIES = ["2d", "3d", "4d", "5d", "6d"] as const
export const PLAN_EQUIPMENT  = ["Gym", "Home", "No equipment"] as const
export const PLAN_FLAGS      = ["Knee pain", "Back pain", "Shoulder limitation", "Postpartum", "Hypertension", "No impact", "Low intensity only", "Core focus", "Upper body only", "Lower body only"] as const

export type PlanGoal      = (typeof PLAN_GOALS)[number]
export type PlanLevel     = (typeof PLAN_LEVELS)[number]
export type PlanFrequency = (typeof PLAN_FREQUENCIES)[number]
export type PlanEquipment = (typeof PLAN_EQUIPMENT)[number]
export type PlanFlag      = (typeof PLAN_FLAGS)[number]

/** Ready-made weekly plans a coach can load directly into the schedule */
export type SavedPlan = {
  id: string
  name: string
  description: string
  goal: PlanGoal
  level: PlanLevel
  frequency: PlanFrequency
  equipment: PlanEquipment
  safeFor: PlanFlag[]
  schedule: Partial<Record<(typeof DAYS)[number], { name: string; color: string; exercises: { id: string; name: string; category: string; mode: "strength" | "timed"; prescription: string }[] }[]>>
}

/** All 7 week days in order — used to fill rest days */
export const ALL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const

/** Returns the full 7-day week view for a plan, filling gaps with null (rest) */
export function getFullWeek(plan: SavedPlan): Array<{ day: string; rest: boolean; workouts: any }> {
  return ALL_DAYS.map(day => ({
    day,
    rest: !(day in plan.schedule),
    workouts: plan.schedule[day as keyof typeof plan.schedule],
  }))
}

export const SAVED_PLANS: SavedPlan[] = [
  // ── STRENGTH ──────────────────────────────────────────────────────────────
  {
    id: "s-01",
    name: "3-Day Full Body Strength",
    description: "Mon / Wed / Fri compound lifts. Big three focused with progressive overload.",
    goal: "Strength", level: "Intermediate", frequency: "3d", equipment: "Gym", safeFor: ["Hypertension"],
    schedule: {
      MON: [{ name: "Strength A", color: "0", exercises: [{ id: "s01-1", name: "Back Squat", category: "Strength", mode: "strength", prescription: "5×5" }, { id: "s01-2", name: "Bench Press", category: "Strength", mode: "strength", prescription: "5×5" }, { id: "s01-3", name: "Barbell Row", category: "Strength", mode: "strength", prescription: "5×5" }] }],
      WED: [{ name: "Strength B", color: "1", exercises: [{ id: "s01-4", name: "Deadlift", category: "Strength", mode: "strength", prescription: "1×5" }, { id: "s01-5", name: "Overhead Press", category: "Strength", mode: "strength", prescription: "5×5" }, { id: "s01-6", name: "Pull Up", category: "Strength", mode: "strength", prescription: "3×8" }] }],
      FRI: [{ name: "Strength A+", color: "0", exercises: [{ id: "s01-7", name: "Back Squat", category: "Strength", mode: "strength", prescription: "5×5 +2.5kg" }, { id: "s01-8", name: "Bench Press", category: "Strength", mode: "strength", prescription: "5×5 +2.5kg" }, { id: "s01-9", name: "Barbell Row", category: "Strength", mode: "strength", prescription: "5×5 +2.5kg" }] }],
    },
  },
  {
    id: "s-02",
    name: "4-Day Powerlifting Base",
    description: "Squat / Bench / Deadlift / Overhead with accessory work, four days.",
    goal: "Strength", level: "Advanced", frequency: "4d", equipment: "Gym", safeFor: [],
    schedule: {
      MON: [{ name: "Squat Day", color: "0", exercises: [{ id: "s02-1", name: "Back Squat", category: "Strength", mode: "strength", prescription: "5×3 @ 85%" }, { id: "s02-2", name: "Pause Squat", category: "Strength", mode: "strength", prescription: "3×3" }, { id: "s02-3", name: "Leg Press", category: "Strength", mode: "strength", prescription: "3×10" }] }],
      TUE: [{ name: "Bench Day", color: "1", exercises: [{ id: "s02-4", name: "Bench Press", category: "Strength", mode: "strength", prescription: "5×3 @ 85%" }, { id: "s02-5", name: "Close-Grip Bench", category: "Strength", mode: "strength", prescription: "3×6" }, { id: "s02-6", name: "Dumbbell Row", category: "Strength", mode: "strength", prescription: "3×10" }] }],
      THU: [{ name: "Deadlift Day", color: "2", exercises: [{ id: "s02-7", name: "Deadlift", category: "Strength", mode: "strength", prescription: "4×3 @ 85%" }, { id: "s02-8", name: "Romanian Deadlift", category: "Strength", mode: "strength", prescription: "3×8" }, { id: "s02-9", name: "Leg Curl", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      SAT: [{ name: "Overhead Day", color: "0", exercises: [{ id: "s02-10", name: "Overhead Press", category: "Strength", mode: "strength", prescription: "5×5" }, { id: "s02-11", name: "Pull Up", category: "Strength", mode: "strength", prescription: "4×6" }, { id: "s02-12", name: "Face Pull", category: "Strength", mode: "strength", prescription: "3×15" }] }],
    },
  },
  {
    id: "s-03",
    name: "2-Day Beginner Strength",
    description: "Simple twice-weekly full-body plan to learn the fundamental lifts safely.",
    goal: "Strength", level: "Beginner", frequency: "2d", equipment: "Gym", safeFor: ["Hypertension", "Low intensity only"],
    schedule: {
      TUE: [{ name: "Full Body A", color: "0", exercises: [{ id: "s03-1", name: "Goblet Squat", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "s03-2", name: "Dumbbell Press", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "s03-3", name: "Lat Pulldown", category: "Strength", mode: "strength", prescription: "3×10" }] }],
      FRI: [{ name: "Full Body B", color: "1", exercises: [{ id: "s03-4", name: "Romanian Deadlift", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "s03-5", name: "Push Up", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "s03-6", name: "Seated Cable Row", category: "Strength", mode: "strength", prescription: "3×12" }] }],
    },
  },
  {
    id: "s-04",
    name: "Home Dumbbell Strength",
    description: "3-day dumbbell-only program for serious strength gains at home.",
    goal: "Strength", level: "Intermediate", frequency: "3d", equipment: "Home", safeFor: ["Hypertension"],
    schedule: {
      MON: [{ name: "Push", color: "0", exercises: [{ id: "s04-1", name: "Dumbbell Press", category: "Strength", mode: "strength", prescription: "4×8" }, { id: "s04-2", name: "Dumbbell Overhead Press", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "s04-3", name: "Tricep Kickback", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      WED: [{ name: "Pull", color: "1", exercises: [{ id: "s04-4", name: "Dumbbell Row", category: "Strength", mode: "strength", prescription: "4×8" }, { id: "s04-5", name: "Reverse Fly", category: "Strength", mode: "strength", prescription: "3×15" }, { id: "s04-6", name: "Dumbbell Curl", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      FRI: [{ name: "Legs", color: "2", exercises: [{ id: "s04-7", name: "Goblet Squat", category: "Strength", mode: "strength", prescription: "4×10" }, { id: "s04-8", name: "Dumbbell Romanian Deadlift", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "s04-9", name: "Walking Lunge", category: "Strength", mode: "strength", prescription: "3×12" }] }],
    },
  },

  // ── MUSCLE GAIN ───────────────────────────────────────────────────────────
  {
    id: "m-01",
    name: "Push / Pull / Legs",
    description: "Classic 6-day PPL split. Each muscle group trained twice per week.",
    goal: "Muscle gain", level: "Advanced", frequency: "6d", equipment: "Gym", safeFor: [],
    schedule: {
      MON: [{ name: "Push A", color: "0", exercises: [{ id: "m01-1", name: "Bench Press", category: "Strength", mode: "strength", prescription: "4×8" }, { id: "m01-2", name: "Overhead Press", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "m01-3", name: "Rope Pushdown", category: "Strength", mode: "strength", prescription: "3×15" }] }],
      TUE: [{ name: "Pull A", color: "1", exercises: [{ id: "m01-4", name: "Deadlift", category: "Strength", mode: "strength", prescription: "3×5" }, { id: "m01-5", name: "Pull Up", category: "Strength", mode: "strength", prescription: "4×8" }, { id: "m01-6", name: "Barbell Curl", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      WED: [{ name: "Legs A", color: "2", exercises: [{ id: "m01-7", name: "Back Squat", category: "Strength", mode: "strength", prescription: "4×8" }, { id: "m01-8", name: "Leg Press", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "m01-9", name: "Calf Raise", category: "Strength", mode: "strength", prescription: "4×15" }] }],
      THU: [{ name: "Push B", color: "0", exercises: [{ id: "m01-10", name: "Incline Bench Press", category: "Strength", mode: "strength", prescription: "4×10" }, { id: "m01-11", name: "Cable Fly", category: "Strength", mode: "strength", prescription: "3×15" }, { id: "m01-12", name: "Lateral Raise", category: "Strength", mode: "strength", prescription: "3×15" }] }],
      FRI: [{ name: "Pull B", color: "1", exercises: [{ id: "m01-13", name: "Lat Pulldown", category: "Strength", mode: "strength", prescription: "4×10" }, { id: "m01-14", name: "Cable Row", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "m01-15", name: "Hammer Curl", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      SAT: [{ name: "Legs B", color: "2", exercises: [{ id: "m01-16", name: "Romanian Deadlift", category: "Strength", mode: "strength", prescription: "4×10" }, { id: "m01-17", name: "Hip Thrust", category: "Strength", mode: "strength", prescription: "4×12" }, { id: "m01-18", name: "Leg Curl", category: "Strength", mode: "strength", prescription: "3×15" }] }],
    },
  },
  {
    id: "m-02",
    name: "Upper / Lower Hypertrophy",
    description: "4-day alternating upper and lower body sessions for balanced muscle gain.",
    goal: "Muscle gain", level: "Intermediate", frequency: "4d", equipment: "Gym", safeFor: [],
    schedule: {
      MON: [{ name: "Upper Power", color: "0", exercises: [{ id: "m02-1", name: "Bench Press", category: "Strength", mode: "strength", prescription: "4×6" }, { id: "m02-2", name: "Barbell Row", category: "Strength", mode: "strength", prescription: "4×6" }, { id: "m02-3", name: "Overhead Press", category: "Strength", mode: "strength", prescription: "3×8" }] }],
      TUE: [{ name: "Lower Power", color: "2", exercises: [{ id: "m02-4", name: "Back Squat", category: "Strength", mode: "strength", prescription: "4×6" }, { id: "m02-5", name: "Romanian Deadlift", category: "Strength", mode: "strength", prescription: "3×8" }, { id: "m02-6", name: "Leg Press", category: "Strength", mode: "strength", prescription: "3×10" }] }],
      THU: [{ name: "Upper Volume", color: "1", exercises: [{ id: "m02-7", name: "Incline Dumbbell Press", category: "Strength", mode: "strength", prescription: "4×12" }, { id: "m02-8", name: "Lat Pulldown", category: "Strength", mode: "strength", prescription: "4×12" }, { id: "m02-9", name: "Lateral Raise", category: "Strength", mode: "strength", prescription: "3×15" }] }],
      FRI: [{ name: "Lower Volume", color: "3", exercises: [{ id: "m02-10", name: "Hip Thrust", category: "Strength", mode: "strength", prescription: "4×12" }, { id: "m02-11", name: "Bulgarian Split Squat", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "m02-12", name: "Calf Raise", category: "Strength", mode: "strength", prescription: "4×15" }] }],
    },
  },
  {
    id: "m-03",
    name: "5-Day Bro Split",
    description: "Dedicated day per muscle group — chest, back, shoulders, arms, legs.",
    goal: "Muscle gain", level: "Advanced", frequency: "5d", equipment: "Gym", safeFor: [],
    schedule: {
      MON: [{ name: "Chest Day", color: "0", exercises: [{ id: "m03-1", name: "Flat Bench Press", category: "Strength", mode: "strength", prescription: "4×8" }, { id: "m03-2", name: "Incline Bench Press", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "m03-3", name: "Cable Fly", category: "Strength", mode: "strength", prescription: "3×15" }] }],
      TUE: [{ name: "Back Day", color: "1", exercises: [{ id: "m03-4", name: "Deadlift", category: "Strength", mode: "strength", prescription: "4×5" }, { id: "m03-5", name: "Lat Pulldown", category: "Strength", mode: "strength", prescription: "4×10" }, { id: "m03-6", name: "Cable Row", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      WED: [{ name: "Shoulder Day", color: "0", exercises: [{ id: "m03-7", name: "Overhead Press", category: "Strength", mode: "strength", prescription: "4×10" }, { id: "m03-8", name: "Lateral Raise", category: "Strength", mode: "strength", prescription: "4×15" }, { id: "m03-9", name: "Rear Delt Fly", category: "Strength", mode: "strength", prescription: "3×15" }] }],
      THU: [{ name: "Arms Day", color: "4", exercises: [{ id: "m03-10", name: "Barbell Curl", category: "Strength", mode: "strength", prescription: "4×10" }, { id: "m03-11", name: "Rope Pushdown", category: "Strength", mode: "strength", prescription: "4×12" }, { id: "m03-12", name: "Hammer Curl", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      FRI: [{ name: "Leg Day", color: "2", exercises: [{ id: "m03-13", name: "Back Squat", category: "Strength", mode: "strength", prescription: "4×8" }, { id: "m03-14", name: "Hip Thrust", category: "Strength", mode: "strength", prescription: "4×12" }, { id: "m03-15", name: "Leg Curl", category: "Strength", mode: "strength", prescription: "3×15" }] }],
    },
  },
  {
    id: "m-04",
    name: "3-Day Home Muscle Builder",
    description: "Dumbbell and resistance band hypertrophy plan, no gym required.",
    goal: "Muscle gain", level: "Beginner", frequency: "3d", equipment: "Home", safeFor: [],
    schedule: {
      MON: [{ name: "Upper Body", color: "0", exercises: [{ id: "m04-1", name: "Push Up", category: "Strength", mode: "strength", prescription: "4×12" }, { id: "m04-2", name: "Band Pull-Apart", category: "Strength", mode: "strength", prescription: "3×20" }, { id: "m04-3", name: "Dumbbell Curl", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      WED: [{ name: "Lower Body", color: "2", exercises: [{ id: "m04-4", name: "Goblet Squat", category: "Strength", mode: "strength", prescription: "4×12" }, { id: "m04-5", name: "Glute Bridge", category: "Strength", mode: "strength", prescription: "4×15" }, { id: "m04-6", name: "Walking Lunge", category: "Strength", mode: "strength", prescription: "3×10" }] }],
      FRI: [{ name: "Full Body Pump", color: "1", exercises: [{ id: "m04-7", name: "Dumbbell Row", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "m04-8", name: "Dumbbell Overhead Press", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "m04-9", name: "Romanian Deadlift", category: "Strength", mode: "strength", prescription: "3×12" }] }],
    },
  },

  // ── FAT LOSS ──────────────────────────────────────────────────────────────
  {
    id: "f-01",
    name: "4-Day Fat Loss Circuit",
    description: "High-rep circuit training with short rest periods to maximise calorie burn.",
    goal: "Fat loss", level: "Intermediate", frequency: "4d", equipment: "Gym", safeFor: [],
    schedule: {
      MON: [{ name: "Upper Circuit", color: "3", exercises: [{ id: "f01-1", name: "Push Up", category: "Strength", mode: "strength", prescription: "4×15" }, { id: "f01-2", name: "Lat Pulldown", category: "Strength", mode: "strength", prescription: "4×15" }, { id: "f01-3", name: "Battle Ropes", category: "Cardio", mode: "timed", prescription: "3g × 30 sec" }] }],
      TUE: [{ name: "Lower Circuit", color: "3", exercises: [{ id: "f01-4", name: "Bodyweight Squat", category: "Strength", mode: "strength", prescription: "4×20" }, { id: "f01-5", name: "Glute Bridge", category: "Strength", mode: "strength", prescription: "3×20" }, { id: "f01-6", name: "Box Jumps", category: "Cardio", mode: "strength", prescription: "4×8" }] }],
      THU: [{ name: "HIIT Cardio", color: "4", exercises: [{ id: "f01-7", name: "Sprint Intervals", category: "Cardio", mode: "timed", prescription: "8g × 30 sec" }, { id: "f01-8", name: "Assault Bike", category: "Cardio", mode: "timed", prescription: "3g × 1 min" }] }],
      SAT: [{ name: "Full Body Burn", color: "3", exercises: [{ id: "f01-9", name: "Burpees", category: "Cardio", mode: "timed", prescription: "4g × 45 sec" }, { id: "f01-10", name: "Mountain Climbers", category: "Cardio", mode: "timed", prescription: "3g × 45 sec" }, { id: "f01-11", name: "Jump Rope", category: "Cardio", mode: "timed", prescription: "3g × 2 min" }] }],
    },
  },
  {
    id: "f-02",
    name: "3-Day Home Fat Burner",
    description: "Bodyweight HIIT three days a week. Zero equipment, maximum sweat.",
    goal: "Fat loss", level: "Beginner", frequency: "3d", equipment: "Home", safeFor: [],
    schedule: {
      MON: [{ name: "Full Body HIIT", color: "3", exercises: [{ id: "f02-1", name: "Burpees", category: "Cardio", mode: "timed", prescription: "3g × 45 sec" }, { id: "f02-2", name: "High Knees", category: "Cardio", mode: "timed", prescription: "3g × 1 min" }, { id: "f02-3", name: "Push Up", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      WED: [{ name: "Core & Cardio", color: "4", exercises: [{ id: "f02-4", name: "Plank", category: "Core", mode: "timed", prescription: "3g × 1 min" }, { id: "f02-5", name: "Bicycle Crunch", category: "Core", mode: "strength", prescription: "3×20" }, { id: "f02-6", name: "Jump Rope", category: "Cardio", mode: "timed", prescription: "3g × 2 min" }] }],
      FRI: [{ name: "Lower Burn", color: "3", exercises: [{ id: "f02-7", name: "Bodyweight Squat", category: "Strength", mode: "strength", prescription: "4×15" }, { id: "f02-8", name: "Mountain Climbers", category: "Cardio", mode: "timed", prescription: "3g × 45 sec" }, { id: "f02-9", name: "Glute Bridge", category: "Strength", mode: "strength", prescription: "3×15" }] }],
    },
  },
  {
    id: "f-03",
    name: "5-Day Metabolic Conditioning",
    description: "Daily metabolic sessions mixing strength and cardio for elite fat loss.",
    goal: "Fat loss", level: "Advanced", frequency: "5d", equipment: "Gym", safeFor: [],
    schedule: {
      MON: [{ name: "Strength + Cardio A", color: "3", exercises: [{ id: "f03-1", name: "Back Squat", category: "Strength", mode: "strength", prescription: "4×6" }, { id: "f03-2", name: "Rowing Machine", category: "Cardio", mode: "timed", prescription: "3g × 5 min" }] }],
      TUE: [{ name: "HIIT A", color: "4", exercises: [{ id: "f03-3", name: "Sprint Intervals", category: "Cardio", mode: "timed", prescription: "10g × 30 sec" }, { id: "f03-4", name: "Battle Ropes", category: "Cardio", mode: "timed", prescription: "4g × 30 sec" }] }],
      WED: [{ name: "Strength + Cardio B", color: "3", exercises: [{ id: "f03-5", name: "Deadlift", category: "Strength", mode: "strength", prescription: "4×5" }, { id: "f03-6", name: "Assault Bike", category: "Cardio", mode: "timed", prescription: "3g × 5 min" }] }],
      THU: [{ name: "HIIT B", color: "4", exercises: [{ id: "f03-7", name: "Box Jumps", category: "Cardio", mode: "strength", prescription: "5×5" }, { id: "f03-8", name: "Burpees", category: "Cardio", mode: "timed", prescription: "4g × 1 min" }] }],
      FRI: [{ name: "Full Body Finisher", color: "3", exercises: [{ id: "f03-9", name: "Bench Press", category: "Strength", mode: "strength", prescription: "4×8" }, { id: "f03-10", name: "Jump Rope", category: "Cardio", mode: "timed", prescription: "5g × 2 min" }] }],
    },
  },
  {
    id: "f-04",
    name: "2-Day Beginner Fat Loss",
    description: "Twice a week to get started. Full body with light cardio finishers.",
    goal: "Fat loss", level: "Beginner", frequency: "2d", equipment: "No equipment", safeFor: ["Knee pain", "Hypertension", "Low intensity only"],
    schedule: {
      TUE: [{ name: "Full Body A", color: "3", exercises: [{ id: "f04-1", name: "Bodyweight Squat", category: "Strength", mode: "strength", prescription: "3×15" }, { id: "f04-2", name: "Push Up", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "f04-3", name: "Marching in Place", category: "Cardio", mode: "timed", prescription: "2g × 3 min" }] }],
      FRI: [{ name: "Full Body B", color: "4", exercises: [{ id: "f04-4", name: "Glute Bridge", category: "Strength", mode: "strength", prescription: "3×15" }, { id: "f04-5", name: "Side Plank", category: "Core", mode: "timed", prescription: "3g × 30 sec" }, { id: "f04-6", name: "Step Ups", category: "Cardio", mode: "strength", prescription: "3×12" }] }],
    },
  },

  // ── ENDURANCE ─────────────────────────────────────────────────────────────
  {
    id: "e-01",
    name: "4-Day Cardio & Core",
    description: "Steady-state cardio, HIIT intervals, and core — built for endurance athletes.",
    goal: "Endurance", level: "Intermediate", frequency: "4d", equipment: "Gym", safeFor: ["Shoulder limitation"],
    schedule: {
      MON: [{ name: "Steady Cardio", color: "3", exercises: [{ id: "e01-1", name: "Treadmill", category: "Cardio", mode: "timed", prescription: "1g × 30 min" }, { id: "e01-2", name: "Plank", category: "Core", mode: "timed", prescription: "3g × 1 min" }] }],
      TUE: [{ name: "Core Circuit", color: "4", exercises: [{ id: "e01-3", name: "Dead Bug", category: "Core", mode: "timed", prescription: "3g × 45 sec" }, { id: "e01-4", name: "Bicycle Crunch", category: "Core", mode: "strength", prescription: "3×20" }, { id: "e01-5", name: "Side Plank", category: "Core", mode: "timed", prescription: "3g × 45 sec" }] }],
      THU: [{ name: "HIIT", color: "3", exercises: [{ id: "e01-6", name: "Sprint Intervals", category: "Cardio", mode: "timed", prescription: "8g × 30 sec" }, { id: "e01-7", name: "Assault Bike", category: "Cardio", mode: "timed", prescription: "3g × 1 min" }] }],
      SAT: [{ name: "Long Cardio", color: "4", exercises: [{ id: "e01-8", name: "Rowing Machine", category: "Cardio", mode: "timed", prescription: "1g × 20 min" }, { id: "e01-9", name: "Stationary Bike", category: "Cardio", mode: "timed", prescription: "1g × 20 min" }] }],
    },
  },
  {
    id: "e-02",
    name: "3-Day Run & Strength",
    description: "Two run sessions, one full-body strength session for running performance.",
    goal: "Endurance", level: "Beginner", frequency: "3d", equipment: "No equipment", safeFor: ["Hypertension"],
    schedule: {
      MON: [{ name: "Easy Run", color: "4", exercises: [{ id: "e02-1", name: "Easy Run / Walk", category: "Cardio", mode: "timed", prescription: "1g × 25 min" }] }],
      WED: [{ name: "Full Body Strength", color: "1", exercises: [{ id: "e02-2", name: "Bodyweight Squat", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "e02-3", name: "Push Up", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "e02-4", name: "Dead Bug", category: "Core", mode: "timed", prescription: "3g × 45 sec" }] }],
      SAT: [{ name: "Long Run", color: "4", exercises: [{ id: "e02-5", name: "Long Run / Walk", category: "Cardio", mode: "timed", prescription: "1g × 40 min" }] }],
    },
  },
  {
    id: "e-03",
    name: "5-Day Endurance Athlete",
    description: "Five sessions mixing rowing, cycling, running, and functional strength.",
    goal: "Endurance", level: "Advanced", frequency: "5d", equipment: "Gym", safeFor: [],
    schedule: {
      MON: [{ name: "Interval Run", color: "3", exercises: [{ id: "e03-1", name: "Sprint Intervals", category: "Cardio", mode: "timed", prescription: "10g × 400m" }] }],
      TUE: [{ name: "Strength Support", color: "1", exercises: [{ id: "e03-2", name: "Back Squat", category: "Strength", mode: "strength", prescription: "4×6" }, { id: "e03-3", name: "Deadlift", category: "Strength", mode: "strength", prescription: "3×5" }, { id: "e03-4", name: "Plank", category: "Core", mode: "timed", prescription: "3g × 1 min" }] }],
      WED: [{ name: "Rowing", color: "4", exercises: [{ id: "e03-5", name: "Rowing Machine", category: "Cardio", mode: "timed", prescription: "1g × 30 min" }] }],
      THU: [{ name: "Cycling", color: "4", exercises: [{ id: "e03-6", name: "Stationary Bike", category: "Cardio", mode: "timed", prescription: "1g × 40 min" }] }],
      SAT: [{ name: "Long Run", color: "3", exercises: [{ id: "e03-7", name: "Long Run", category: "Cardio", mode: "timed", prescription: "1g × 60 min" }] }],
    },
  },

  // ── GENERAL FITNESS ───────────────────────────────────────────────────────
  {
    id: "g-01",
    name: "2-Day General Fitness",
    description: "Twice-weekly full-body sessions for everyday health and energy.",
    goal: "General fitness", level: "Beginner", frequency: "2d", equipment: "Home", safeFor: ["Hypertension", "Knee pain", "Low intensity only", "Postpartum"],
    schedule: {
      TUE: [{ name: "Full Body A", color: "1", exercises: [{ id: "g01-1", name: "Push Up", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "g01-2", name: "Bodyweight Squat", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "g01-3", name: "Dead Bug", category: "Core", mode: "timed", prescription: "3g × 45 sec" }] }],
      FRI: [{ name: "Full Body B", color: "2", exercises: [{ id: "g01-4", name: "Plank", category: "Core", mode: "timed", prescription: "3g × 45 sec" }, { id: "g01-5", name: "Glute Bridge", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "g01-6", name: "Walking Lunge", category: "Strength", mode: "strength", prescription: "3×10" }] }],
    },
  },
  {
    id: "g-02",
    name: "3-Day Gym Starter",
    description: "Three balanced sessions a week for those new to the gym.",
    goal: "General fitness", level: "Beginner", frequency: "3d", equipment: "Gym", safeFor: ["Hypertension"],
    schedule: {
      MON: [{ name: "Full Body A", color: "0", exercises: [{ id: "g02-1", name: "Leg Press", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "g02-2", name: "Chest Press Machine", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "g02-3", name: "Lat Pulldown", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      WED: [{ name: "Cardio + Core", color: "3", exercises: [{ id: "g02-4", name: "Treadmill Walk", category: "Cardio", mode: "timed", prescription: "1g × 20 min" }, { id: "g02-5", name: "Plank", category: "Core", mode: "timed", prescription: "3g × 45 sec" }, { id: "g02-6", name: "Bicycle Crunch", category: "Core", mode: "strength", prescription: "3×15" }] }],
      FRI: [{ name: "Full Body B", color: "1", exercises: [{ id: "g02-7", name: "Goblet Squat", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "g02-8", name: "Seated Row Machine", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "g02-9", name: "Dumbbell Press", category: "Strength", mode: "strength", prescription: "3×12" }] }],
    },
  },
  {
    id: "g-03",
    name: "4-Day Active Lifestyle",
    description: "Mix of strength, cardio, and mobility for a well-rounded active lifestyle.",
    goal: "General fitness", level: "Intermediate", frequency: "4d", equipment: "Gym", safeFor: ["Hypertension"],
    schedule: {
      MON: [{ name: "Strength Full Body", color: "1", exercises: [{ id: "g03-1", name: "Back Squat", category: "Strength", mode: "strength", prescription: "3×8" }, { id: "g03-2", name: "Bench Press", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "g03-3", name: "Lat Pulldown", category: "Strength", mode: "strength", prescription: "3×10" }] }],
      TUE: [{ name: "Cardio", color: "3", exercises: [{ id: "g03-4", name: "Treadmill", category: "Cardio", mode: "timed", prescription: "1g × 25 min" }, { id: "g03-5", name: "Stationary Bike", category: "Cardio", mode: "timed", prescription: "1g × 15 min" }] }],
      THU: [{ name: "Strength Full Body B", color: "1", exercises: [{ id: "g03-6", name: "Deadlift", category: "Strength", mode: "strength", prescription: "3×6" }, { id: "g03-7", name: "Overhead Press", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "g03-8", name: "Dumbbell Row", category: "Strength", mode: "strength", prescription: "3×12" }] }],
      SAT: [{ name: "Mobility & Easy Cardio", color: "5", exercises: [{ id: "g03-9", name: "Hip Flexor Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "g03-10", name: "Cat-Cow", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "g03-11", name: "Easy Walk", category: "Cardio", mode: "timed", prescription: "1g × 20 min" }] }],
    },
  },

  // ── REHAB & MOBILITY ──────────────────────────────────────────────────────
  {
    id: "r-01",
    name: "Active Recovery Week",
    description: "3-day low-intensity mobility and stretching for deload or recovery.",
    goal: "Rehab & mobility", level: "Beginner", frequency: "3d", equipment: "No equipment", safeFor: ["Knee pain", "Back pain", "Shoulder limitation", "Postpartum", "Hypertension", "No impact", "Low intensity only"],
    schedule: {
      MON: [{ name: "Morning Activation", color: "5", exercises: [{ id: "r01-1", name: "Hip Flexor Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r01-2", name: "Cat-Cow", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r01-3", name: "Dead Bug", category: "Core", mode: "timed", prescription: "3g × 1 min" }] }],
      WED: [{ name: "Mobility Flow", color: "5", exercises: [{ id: "r01-4", name: "Pigeon Pose", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r01-5", name: "Thoracic Rotation", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r01-6", name: "Hamstring Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }] }],
      FRI: [{ name: "Active Recovery", color: "5", exercises: [{ id: "r01-7", name: "Child's Pose", category: "Stretching", mode: "timed", prescription: "3g × 2 min" }, { id: "r01-8", name: "Seated Spinal Twist", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r01-9", name: "Calf Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }] }],
    },
  },
  {
    id: "r-02",
    name: "Postpartum Return to Fitness",
    description: "Gentle 3-day postnatal plan: core restoration, pelvic floor, low-impact cardio.",
    goal: "Rehab & mobility", level: "Beginner", frequency: "3d", equipment: "Home", safeFor: ["Postpartum", "Knee pain", "Back pain", "No impact", "Low intensity only", "Core focus"],
    schedule: {
      MON: [{ name: "Core Restore", color: "5", exercises: [{ id: "r02-1", name: "Diaphragmatic Breathing", category: "Core", mode: "timed", prescription: "3g × 2 min" }, { id: "r02-2", name: "Dead Bug", category: "Core", mode: "timed", prescription: "3g × 45 sec" }, { id: "r02-3", name: "Glute Bridge", category: "Strength", mode: "strength", prescription: "3×10" }] }],
      WED: [{ name: "Gentle Mobility", color: "5", exercises: [{ id: "r02-4", name: "Cat-Cow", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r02-5", name: "Hip Flexor Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r02-6", name: "Child's Pose", category: "Stretching", mode: "timed", prescription: "3g × 2 min" }] }],
      FRI: [{ name: "Low-Impact Cardio", color: "4", exercises: [{ id: "r02-7", name: "Walking", category: "Cardio", mode: "timed", prescription: "1g × 20 min" }, { id: "r02-8", name: "Side Plank", category: "Core", mode: "timed", prescription: "3g × 30 sec" }] }],
    },
  },
  {
    id: "r-03",
    name: "Knee Rehab Protocol",
    description: "4-day program focusing on quad/hamstring strengthening and mobility around the knee.",
    goal: "Rehab & mobility", level: "Beginner", frequency: "4d", equipment: "Gym", safeFor: ["Knee pain", "Low intensity only", "Hypertension"],
    schedule: {
      MON: [{ name: "Quad Activation", color: "5", exercises: [{ id: "r03-1", name: "Terminal Knee Extension", category: "Rehab", mode: "strength", prescription: "3×15" }, { id: "r03-2", name: "Straight Leg Raise", category: "Rehab", mode: "strength", prescription: "3×12" }, { id: "r03-3", name: "Stationary Bike", category: "Cardio", mode: "timed", prescription: "1g × 10 min" }] }],
      TUE: [{ name: "Hip & Glute", color: "5", exercises: [{ id: "r03-4", name: "Glute Bridge", category: "Strength", mode: "strength", prescription: "3×15" }, { id: "r03-5", name: "Clamshell", category: "Rehab", mode: "strength", prescription: "3×15" }, { id: "r03-6", name: "Side Lying Hip Abduction", category: "Rehab", mode: "strength", prescription: "3×15" }] }],
      THU: [{ name: "Step & Balance", color: "5", exercises: [{ id: "r03-7", name: "Step Up", category: "Strength", mode: "strength", prescription: "3×10" }, { id: "r03-8", name: "Single Leg Balance", category: "Rehab", mode: "timed", prescription: "3g × 30 sec" }, { id: "r03-9", name: "Hamstring Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }] }],
      SAT: [{ name: "Mobility & Cardio", color: "5", exercises: [{ id: "r03-10", name: "Stationary Bike", category: "Cardio", mode: "timed", prescription: "1g × 15 min" }, { id: "r03-11", name: "Quad Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r03-12", name: "IT Band Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }] }],
    },
  },
  {
    id: "r-04",
    name: "Back Pain Management",
    description: "3-day gentle strengthening plan for lower and upper back health.",
    goal: "Rehab & mobility", level: "Beginner", frequency: "3d", equipment: "No equipment", safeFor: ["Back pain", "Hypertension", "Low intensity only", "No impact"],
    schedule: {
      MON: [{ name: "Core & Spine", color: "5", exercises: [{ id: "r04-1", name: "Cat-Cow", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r04-2", name: "Bird Dog", category: "Core", mode: "strength", prescription: "3×10" }, { id: "r04-3", name: "Dead Bug", category: "Core", mode: "timed", prescription: "3g × 45 sec" }] }],
      WED: [{ name: "Hip & Glute", color: "5", exercises: [{ id: "r04-4", name: "Glute Bridge", category: "Strength", mode: "strength", prescription: "3×12" }, { id: "r04-5", name: "Hip Flexor Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r04-6", name: "Pigeon Pose", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }] }],
      FRI: [{ name: "Gentle Movement", color: "5", exercises: [{ id: "r04-7", name: "Child's Pose", category: "Stretching", mode: "timed", prescription: "3g × 2 min" }, { id: "r04-8", name: "Thoracic Rotation", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r04-9", name: "Walking", category: "Cardio", mode: "timed", prescription: "1g × 15 min" }] }],
    },
  },
  {
    id: "r-05",
    name: "Shoulder Rehab & Strength",
    description: "3-day rotator cuff and scapular stability program for shoulder issues.",
    goal: "Rehab & mobility", level: "Beginner", frequency: "3d", equipment: "Home", safeFor: ["Shoulder limitation", "Hypertension", "Low intensity only"],
    schedule: {
      MON: [{ name: "Rotator Cuff", color: "5", exercises: [{ id: "r05-1", name: "Band External Rotation", category: "Rehab", mode: "strength", prescription: "3×15" }, { id: "r05-2", name: "Band Internal Rotation", category: "Rehab", mode: "strength", prescription: "3×15" }, { id: "r05-3", name: "Pendulum Swing", category: "Rehab", mode: "timed", prescription: "3g × 1 min" }] }],
      WED: [{ name: "Scapular Stability", color: "5", exercises: [{ id: "r05-4", name: "Band Pull-Apart", category: "Strength", mode: "strength", prescription: "3×20" }, { id: "r05-5", name: "Wall Slide", category: "Rehab", mode: "strength", prescription: "3×12" }, { id: "r05-6", name: "Thoracic Rotation", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }] }],
      FRI: [{ name: "Strength & Mobility", color: "5", exercises: [{ id: "r05-7", name: "Prone Y-T-W", category: "Rehab", mode: "strength", prescription: "3×10" }, { id: "r05-8", name: "Cross-Body Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "r05-9", name: "Doorway Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }] }],
    },
  },
]

export const LIBRARY_MUSCLE_GROUPS = ["Legs", "Back", "Chest", "Shoulders", "Arms", "Core", "Cardio", "Full Body"] as const
export type LibraryMuscleGroup = (typeof LIBRARY_MUSCLE_GROUPS)[number]

export const LIBRARY_SEGMENTS = ["Warm Up", "Main Block", "Active Recovery"] as const
export type LibrarySegment = (typeof LIBRARY_SEGMENTS)[number]

/** Pre-built workout library coaches can pick from */
export type LibraryWorkout = {
  id: string
  name: string
  muscleGroup: LibraryMuscleGroup
  segment: LibrarySegment
  exercises: { name: string; mode: "strength" | "timed"; prescription: string }[]
}

// ─── COACH PROFILES ──────────────────────────────────────────────────────────

export type Coach = {
  id: string
  name: string
  specialty: string
  avatar: string // initials
  workouts: Workout[]
}

export const COACHES: Coach[] = [
  {
    id: "coach-1",
    name: "Sarah Mitchell",
    specialty: "Strength & Conditioning",
    avatar: "SM",
    workouts: [
      { id: "sm-1",  name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "e1", name: "Hip Flexor Stretch", category: "Stretching", mode: "timed",     prescription: "3g × 1 min"  }, { id: "e2", name: "Glute Bridge",       category: "Legs",       mode: "strength", prescription: "3×12"       }, { id: "e3", name: "Arm Circle",         category: "Shoulders",  mode: "timed",    prescription: "3g × 30 sec" }] },
      { id: "sm-2",  name: "Main Block (Strength)", color: "1", segment: "Main Block", exercises: [{ id: "e4", name: "Back Squat",         category: "Legs",       mode: "strength", prescription: "4×6"        }, { id: "e5", name: "Romanian Deadlift",  category: "Back",       mode: "strength", prescription: "3×10"       }, { id: "e6", name: "Calf Raise",         category: "Legs",       mode: "strength", prescription: "3×15"       }] },
      { id: "sm-3",  name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "e7", name: "Hamstring Stretch",  category: "Stretching", mode: "timed",     prescription: "3g × 1 min"  }, { id: "e8", name: "Quad Stretch",       category: "Stretching", mode: "timed",    prescription: "3g × 45 sec" }, { id: "e9", name: "Calf Stretch",       category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }] },
      { id: "sm-4",  name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "e10", name: "Band Pull-Apart",   category: "Shoulders",  mode: "strength", prescription: "3×15"       }, { id: "e11", name: "Wall Slide",        category: "Shoulders",  mode: "strength", prescription: "3×10"       }, { id: "e12", name: "Cat-Cow",          category: "Core",       mode: "timed",    prescription: "3g × 1 min"  }] },
      { id: "sm-5",  name: "Main Block (Strength)", color: "1", segment: "Main Block", exercises: [{ id: "e13", name: "Bench Press",      category: "Chest",      mode: "strength", prescription: "4×8"        }, { id: "e14", name: "Pull Up",          category: "Back",       mode: "strength", prescription: "4×6"        }, { id: "e15", name: "Overhead Press",   category: "Shoulders",  mode: "strength", prescription: "3×8"        }] },
      { id: "sm-6",  name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "e16", name: "Child's Pose",     category: "Stretching", mode: "timed",    prescription: "3g × 2 min"  }, { id: "e17", name: "Thoracic Rotation",category: "Core",       mode: "timed",    prescription: "3g × 1 min"  }, { id: "e18", name: "Doorway Chest Stretch", category: "Stretching", mode: "timed", prescription: "3g × 45 sec" }] },
      { id: "sm-7",  name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "e19", name: "Jumping Jacks",    category: "Cardio",     mode: "timed",    prescription: "3g × 1 min"  }, { id: "e20", name: "High Knees",       category: "Cardio",     mode: "timed",    prescription: "3g × 30 sec" }, { id: "e21", name: "Leg Swing",        category: "Legs",       mode: "timed",    prescription: "3g × 30 sec" }] },
      { id: "sm-8",  name: "Main Block (Cardio)", color: "3", segment: "Main Block",  exercises: [{ id: "e22", name: "Sprint Intervals", category: "Cardio",     mode: "timed",    prescription: "8g × 30 sec" }, { id: "e23", name: "Box Jumps",       category: "Legs",       mode: "strength", prescription: "4×5"        }, { id: "e24", name: "Assault Bike",     category: "Cardio",     mode: "timed",    prescription: "3g × 1 min"  }] },
      { id: "sm-9",  name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "e25", name: "Foam Roll Quads",  category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }, { id: "e26", name: "Pigeon Pose",      category: "Stretching", mode: "timed",    prescription: "3g × 2 min"  }, { id: "e27", name: "IT Band Stretch",  category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }] },
      { id: "sm-10", name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "e28", name: "Dead Bug",          category: "Core",       mode: "timed",    prescription: "3g × 45 sec" }, { id: "e29", name: "Bird Dog",         category: "Core",       mode: "strength", prescription: "3×10"       }, { id: "e30", name: "Hollow Body Hold", category: "Core",      mode: "timed",    prescription: "3g × 30 sec" }] },
      { id: "sm-11", name: "Main Block (Strength)", color: "1", segment: "Main Block", exercises: [{ id: "e31", name: "Deadlift",         category: "Back",       mode: "strength", prescription: "5×5"        }, { id: "e32", name: "Barbell Row",      category: "Back",       mode: "strength", prescription: "4×8"        }, { id: "e33", name: "Lat Pulldown",     category: "Back",       mode: "strength", prescription: "3×12"       }] },
      { id: "sm-12", name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "e34", name: "Seated Spinal Twist", category: "Stretching", mode: "timed",  prescription: "3g × 1 min"  }, { id: "e35", name: "Lat Stretch",      category: "Back",       mode: "timed",    prescription: "3g × 45 sec" }, { id: "e36", name: "Neck Side Stretch",category: "Stretching", mode: "timed",    prescription: "3g × 30 sec" }] },
    ],
  },
  {
    id: "coach-2",
    name: "James Okonkwo",
    specialty: "Athletic Performance",
    avatar: "JO",
    workouts: [
      { id: "jo-1",  name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "f1", name: "A-Skip",             category: "Cardio",     mode: "timed",    prescription: "3g × 30 sec" }, { id: "f2", name: "Carioca",            category: "Cardio",     mode: "timed",    prescription: "3g × 30 sec" }, { id: "f3", name: "Lateral Shuffle",    category: "Cardio",     mode: "timed",    prescription: "3g × 30 sec" }] },
      { id: "jo-2",  name: "Main Block (Cardio)", color: "3", segment: "Main Block",  exercises: [{ id: "f4", name: "Power Clean",        category: "Back",       mode: "strength", prescription: "5×3"        }, { id: "f5", name: "Push Jerk",          category: "Shoulders",  mode: "strength", prescription: "4×3"        }, { id: "f6", name: "Hang Snatch",        category: "Shoulders",  mode: "strength", prescription: "4×3"        }] },
      { id: "jo-3",  name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "f7", name: "Easy Jog",           category: "Cardio",     mode: "timed",    prescription: "1g × 10 min" }, { id: "f8", name: "Hip Flexor Stretch", category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }, { id: "f9", name: "Quad Stretch",       category: "Stretching", mode: "timed",    prescription: "3g × 45 sec" }] },
      { id: "jo-4",  name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "f10", name: "World's Greatest Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min" }, { id: "f11", name: "Inchworm",         category: "Core",       mode: "strength", prescription: "2×8"        }, { id: "f12", name: "Butt Kicks",        category: "Cardio",     mode: "timed",    prescription: "3g × 30 sec" }] },
      { id: "jo-5",  name: "Main Block (Strength)", color: "1", segment: "Main Block", exercises: [{ id: "f13", name: "Front Squat",      category: "Legs",       mode: "strength", prescription: "5×4"        }, { id: "f14", name: "Hip Thrust",        category: "Legs",       mode: "strength", prescription: "4×8"        }, { id: "f15", name: "Nordic Curl",       category: "Legs",       mode: "strength", prescription: "3×6"        }] },
      { id: "jo-6",  name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "f16", name: "Downward Dog",     category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }, { id: "f17", name: "Warrior I",         category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }, { id: "f18", name: "Seated Forward Fold", category: "Stretching", mode: "timed",  prescription: "3g × 2 min"  }] },
      { id: "jo-7",  name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "f19", name: "High Knees",       category: "Cardio",     mode: "timed",    prescription: "3g × 30 sec" }, { id: "f20", name: "Arm Circle",        category: "Shoulders",  mode: "timed",    prescription: "3g × 30 sec" }, { id: "f21", name: "Ankle Circle",      category: "Legs",       mode: "timed",    prescription: "3g × 30 sec" }] },
      { id: "jo-8",  name: "Main Block (Cardio)", color: "3", segment: "Main Block",  exercises: [{ id: "f22", name: "Tabata Sprints",   category: "Cardio",     mode: "timed",    prescription: "8g × 20 sec" }, { id: "f23", name: "Broad Jump",        category: "Legs",       mode: "strength", prescription: "4×6"        }, { id: "f24", name: "Burpees",           category: "Cardio",     mode: "timed",    prescription: "3g × 1 min"  }] },
      { id: "jo-9",  name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "f25", name: "Foam Roll Upper Back", category: "Stretching", mode: "timed",  prescription: "3g × 1 min"  }, { id: "f26", name: "Sleeper Stretch",  category: "Stretching", mode: "timed",    prescription: "3g × 45 sec" }, { id: "f27", name: "Cross-Body Stretch", category: "Stretching", mode: "timed",  prescription: "3g × 1 min"  }] },
      { id: "jo-10", name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "f28", name: "Jump Rope",         category: "Cardio",     mode: "timed",    prescription: "3g × 1 min"  }, { id: "f29", name: "Lateral Lunge",     category: "Legs",       mode: "strength", prescription: "2×8"        }, { id: "f30", name: "Scap Push-Up",      category: "Chest",      mode: "strength", prescription: "2×12"       }] },
      { id: "jo-11", name: "Main Block (Strength)", color: "1", segment: "Main Block", exercises: [{ id: "f31", name: "Weighted Pull Up", category: "Back",       mode: "strength", prescription: "5×5"        }, { id: "f32", name: "Pendlay Row",       category: "Back",       mode: "strength", prescription: "4×6"        }, { id: "f33", name: "T-Bar Row",         category: "Back",       mode: "strength", prescription: "3×8"        }] },
      { id: "jo-12", name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "f34", name: "Lumbar Rotation",  category: "Core",       mode: "timed",    prescription: "3g × 1 min"  }, { id: "f35", name: "Supine Knee Hug",   category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }, { id: "f36", name: "Cobra Stretch",     category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }] },
    ],
  },
  {
    id: "coach-3",
    name: "Priya Sharma",
    specialty: "Mobility & Recovery",
    avatar: "PS",
    workouts: [
      { id: "ps-1",  name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "g1", name: "Diaphragmatic Breathing", category: "Core",  mode: "timed",    prescription: "3g × 1 min"  }, { id: "g2", name: "Cat-Cow",            category: "Core",       mode: "timed",    prescription: "3g × 1 min"  }, { id: "g3", name: "Thoracic Rotation",  category: "Core",       mode: "timed",    prescription: "3g × 45 sec" }] },
      { id: "ps-2",  name: "Main Block (Strength)", color: "1", segment: "Main Block", exercises: [{ id: "g4", name: "Ab Rollout",         category: "Core",       mode: "strength", prescription: "3×10"       }, { id: "g5", name: "Pallof Press",       category: "Core",       mode: "strength", prescription: "3×12"       }, { id: "g6", name: "Side Plank",         category: "Core",       mode: "timed",    prescription: "3g × 45 sec" }] },
      { id: "ps-3",  name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "g7", name: "Child's Pose",      category: "Stretching", mode: "timed",    prescription: "3g × 2 min"  }, { id: "g8", name: "Seated Spinal Twist",category: "Core",       mode: "timed",    prescription: "3g × 1 min"  }, { id: "g9", name: "Supine Knee Hug",    category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }] },
      { id: "ps-4",  name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "g10", name: "Wrist Circles",     category: "Arms",       mode: "timed",    prescription: "3g × 30 sec" }, { id: "g11", name: "Neck Side Stretch", category: "Stretching", mode: "timed",    prescription: "3g × 30 sec" }, { id: "g12", name: "Shoulder Cross Stretch", category: "Stretching", mode: "timed", prescription: "3g × 45 sec" }] },
      { id: "ps-5",  name: "Main Block (Strength)", color: "1", segment: "Main Block", exercises: [{ id: "g13", name: "Windmill",         category: "Core",       mode: "strength", prescription: "3×10"       }, { id: "g14", name: "Turkish Get-Up",    category: "Core",       mode: "strength", prescription: "3×5"        }, { id: "g15", name: "Suitcase Carry",    category: "Core",       mode: "timed",    prescription: "3g × 30 sec" }] },
      { id: "ps-6",  name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "g16", name: "Pigeon Pose",      category: "Stretching", mode: "timed",    prescription: "3g × 2 min"  }, { id: "g17", name: "IT Band Stretch",   category: "Stretching", mode: "timed",    prescription: "3g × 1 min"  }, { id: "g18", name: "Foam Roll Upper Back", category: "Stretching", mode: "timed",  prescription: "3g × 1 min"  }] },
      { id: "ps-7",  name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "g19", name: "Hip Circle",        category: "Legs",       mode: "timed",    prescription: "3g × 30 sec" }, { id: "g20", name: "Ankle Circle",      category: "Legs",       mode: "timed",    prescription: "3g × 30 sec" }, { id: "g21", name: "Inchworm",          category: "Core",       mode: "strength", prescription: "2×8"        }] },
      { id: "ps-8",  name: "Main Block (Cardio)", color: "3", segment: "Main Block",  exercises: [{ id: "g22", name: "Yoga Flow A",       category: "Stretching", mode: "timed",    prescription: "3g × 2 min"  }, { id: "g23", name: "Warrior II Sequence", category: "Stretching", mode: "timed",  prescription: "3g × 2 min"  }, { id: "g24", name: "Sun Salutation",    category: "Stretching", mode: "timed",    prescription: "5g × 1 min"  }] },
      { id: "ps-9",  name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "g25", name: "Yin Hip Opener",    category: "Stretching", mode: "timed",    prescription: "1g × 5 min"  }, { id: "g26", name: "Reclined Butterfly", category: "Stretching", mode: "timed",  prescription: "1g × 3 min"  }, { id: "g27", name: "Legs Up The Wall",  category: "Stretching", mode: "timed",    prescription: "1g × 5 min"  }] },
      { id: "ps-10", name: "Warm Up",          color: "0", segment: "Warm Up",        exercises: [{ id: "g28", name: "Pendulum Swing",    category: "Shoulders",  mode: "timed",    prescription: "3g × 1 min"  }, { id: "g29", name: "Sleeper Stretch",   category: "Stretching", mode: "timed",    prescription: "3g × 45 sec" }, { id: "g30", name: "Band Pull-Apart",    category: "Shoulders",  mode: "strength", prescription: "2×15"       }] },
      { id: "ps-11", name: "Main Block (Strength)", color: "1", segment: "Main Block", exercises: [{ id: "g31", name: "Plank",            category: "Core",       mode: "timed",    prescription: "3g × 1 min"  }, { id: "g32", name: "Copenhagen Plank",  category: "Core",       mode: "timed",    prescription: "3g × 20 sec" }, { id: "g33", name: "Dead Bug",          category: "Core",       mode: "strength", prescription: "4×10"       }] },
      { id: "ps-12", name: "Active Recovery",  color: "2", segment: "Active Recovery", exercises: [{ id: "g34", name: "Doorway Chest Stretch", category: "Stretching", mode: "timed", prescription: "3g × 1 min"  }, { id: "g35", name: "Wrist Flexor Stretch", category: "Stretching", mode: "timed",  prescription: "3g × 1 min"  }, { id: "g36", name: "Neck Rolls",        category: "Stretching", mode: "timed",    prescription: "3g × 30 sec" }] },
    ],
  },
]

export const LIBRARY_WORKOUTS: LibraryWorkout[] = [

  // ─── LEGS ────────────────────────────────────────────────────────────────
  // Warm Up
  { id: "lib-l-wu-1",  muscleGroup: "Legs", segment: "Warm Up", name: "Leg Activation",        exercises: [{ name: "Hip Flexor Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Glute Bridge", mode: "strength", prescription: "3×12" }, { name: "Quad Stretch", mode: "timed", prescription: "3g × 45 sec" }] },
  { id: "lib-l-wu-2",  muscleGroup: "Legs", segment: "Warm Up", name: "Hip Mobility Flow",     exercises: [{ name: "Pigeon Pose", mode: "timed", prescription: "3g × 1 min" }, { name: "Cat-Cow", mode: "timed", prescription: "3g × 1 min" }, { name: "Step Up", mode: "strength", prescription: "2×10" }] },
  { id: "lib-l-wu-3",  muscleGroup: "Legs", segment: "Warm Up", name: "Dynamic Leg Prep",      exercises: [{ name: "Leg Swing", mode: "timed", prescription: "3g × 30 sec" }, { name: "Lateral Lunge", mode: "strength", prescription: "2×8" }, { name: "Ankle Circle", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-l-wu-4",  muscleGroup: "Legs", segment: "Warm Up", name: "Glute Wake-Up",         exercises: [{ name: "Clamshell", mode: "strength", prescription: "3×15" }, { name: "Donkey Kick", mode: "strength", prescription: "3×12" }, { name: "Fire Hydrant", mode: "strength", prescription: "3×12" }] },
  { id: "lib-l-wu-5",  muscleGroup: "Legs", segment: "Warm Up", name: "Knee Drive Primer",     exercises: [{ name: "High Knees", mode: "timed", prescription: "3g × 30 sec" }, { name: "Butt Kicks", mode: "timed", prescription: "3g × 30 sec" }, { name: "Skipping", mode: "timed", prescription: "3g × 45 sec" }] },
  // Main Block
  { id: "lib-l-mb-1",  muscleGroup: "Legs", segment: "Main Block", name: "Leg Day Classic",    exercises: [{ name: "Back Squat", mode: "strength", prescription: "4×6" }, { name: "Romanian Deadlift", mode: "strength", prescription: "3×10" }, { name: "Calf Raise", mode: "strength", prescription: "3×15" }] },
  { id: "lib-l-mb-2",  muscleGroup: "Legs", segment: "Main Block", name: "Lower Power",        exercises: [{ name: "Front Squat", mode: "strength", prescription: "5×5" }, { name: "Hip Thrust", mode: "strength", prescription: "4×8" }, { name: "Leg Curl", mode: "strength", prescription: "3×12" }] },
  { id: "lib-l-mb-3",  muscleGroup: "Legs", segment: "Main Block", name: "Glute Focus",        exercises: [{ name: "Hip Thrust", mode: "strength", prescription: "4×12" }, { name: "Bulgarian Split Squat", mode: "strength", prescription: "3×10" }, { name: "Glute Bridge", mode: "strength", prescription: "3×15" }] },
  { id: "lib-l-mb-4",  muscleGroup: "Legs", segment: "Main Block", name: "Quad Dominant",      exercises: [{ name: "Leg Press", mode: "strength", prescription: "4×10" }, { name: "Hack Squat", mode: "strength", prescription: "3×10" }, { name: "Leg Extension", mode: "strength", prescription: "3×15" }] },
  { id: "lib-l-mb-5",  muscleGroup: "Legs", segment: "Main Block", name: "Hamstring Builder",  exercises: [{ name: "Nordic Curl", mode: "strength", prescription: "4×6" }, { name: "Stiff-Leg Deadlift", mode: "strength", prescription: "3×10" }, { name: "Seated Leg Curl", mode: "strength", prescription: "3×12" }] },
  { id: "lib-l-mb-6",  muscleGroup: "Legs", segment: "Main Block", name: "Unilateral Legs",    exercises: [{ name: "Single-Leg Squat", mode: "strength", prescription: "3×8" }, { name: "Reverse Lunge", mode: "strength", prescription: "3×10" }, { name: "Step Up", mode: "strength", prescription: "3×12" }] },
  { id: "lib-l-mb-7",  muscleGroup: "Legs", segment: "Main Block", name: "Plyometric Legs",    exercises: [{ name: "Box Jump", mode: "strength", prescription: "4×5" }, { name: "Jump Squat", mode: "strength", prescription: "3×8" }, { name: "Broad Jump", mode: "strength", prescription: "3×6" }] },
  { id: "lib-l-mb-8",  muscleGroup: "Legs", segment: "Main Block", name: "Calf & Ankle",       exercises: [{ name: "Standing Calf Raise", mode: "strength", prescription: "4×20" }, { name: "Seated Calf Raise", mode: "strength", prescription: "3×15" }, { name: "Tibialis Raise", mode: "strength", prescription: "3×15" }] },
  { id: "lib-l-mb-9",  muscleGroup: "Legs", segment: "Main Block", name: "Sumo Power",         exercises: [{ name: "Sumo Deadlift", mode: "strength", prescription: "4×5" }, { name: "Sumo Squat", mode: "strength", prescription: "3×10" }, { name: "Wide Stance Leg Press", mode: "strength", prescription: "3×12" }] },
  // Active Recovery
  { id: "lib-l-rc-1",  muscleGroup: "Legs", segment: "Active Recovery", name: "Leg Stretch Down",   exercises: [{ name: "Hamstring Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Quad Stretch", mode: "timed", prescription: "3g × 45 sec" }, { name: "Calf Stretch", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-l-rc-2",  muscleGroup: "Legs", segment: "Active Recovery", name: "Lower Body Flush",   exercises: [{ name: "Pigeon Pose", mode: "timed", prescription: "3g × 2 min" }, { name: "IT Band Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Foam Roll Quads", mode: "timed", prescription: "3g × 1 min" }] },

  // ─── BACK ────────────────────────────────────────────────────────────────
  // Warm Up
  { id: "lib-b-wu-1",  muscleGroup: "Back", segment: "Warm Up", name: "Back Activation",       exercises: [{ name: "Cat-Cow", mode: "timed", prescription: "3g × 1 min" }, { name: "Thoracic Rotation", mode: "timed", prescription: "3g × 45 sec" }, { name: "Dead Bug", mode: "timed", prescription: "3g × 45 sec" }] },
  { id: "lib-b-wu-2",  muscleGroup: "Back", segment: "Warm Up", name: "Scapular Prep",         exercises: [{ name: "Band Pull-Apart", mode: "strength", prescription: "3×15" }, { name: "Scap Push-Up", mode: "strength", prescription: "3×12" }, { name: "Wall Slide", mode: "strength", prescription: "3×10" }] },
  { id: "lib-b-wu-3",  muscleGroup: "Back", segment: "Warm Up", name: "Upper Back Primer",     exercises: [{ name: "Face Pull", mode: "strength", prescription: "3×15" }, { name: "Prone Y-T-W", mode: "strength", prescription: "3×10" }, { name: "Chest-Supported Row", mode: "strength", prescription: "2×12" }] },
  { id: "lib-b-wu-4",  muscleGroup: "Back", segment: "Warm Up", name: "Lat Activation",        exercises: [{ name: "Straight-Arm Pulldown", mode: "strength", prescription: "3×12" }, { name: "Shoulder Cross Stretch", mode: "timed", prescription: "3g × 30 sec" }, { name: "Doorway Chest Stretch", mode: "timed", prescription: "3g × 30 sec" }] },
  // Main Block
  { id: "lib-b-mb-1",  muscleGroup: "Back", segment: "Main Block", name: "Pull Day",            exercises: [{ name: "Pull Up", mode: "strength", prescription: "4×8" }, { name: "Barbell Row", mode: "strength", prescription: "3×10" }, { name: "Cable Row", mode: "strength", prescription: "3×12" }] },
  { id: "lib-b-mb-2",  muscleGroup: "Back", segment: "Main Block", name: "Back & Biceps",       exercises: [{ name: "Deadlift", mode: "strength", prescription: "4×5" }, { name: "Lat Pulldown", mode: "strength", prescription: "3×12" }, { name: "Preacher Curl", mode: "strength", prescription: "3×12" }] },
  { id: "lib-b-mb-3",  muscleGroup: "Back", segment: "Main Block", name: "Lat Width",           exercises: [{ name: "Wide-Grip Pull Up", mode: "strength", prescription: "4×8" }, { name: "Wide-Grip Lat Pulldown", mode: "strength", prescription: "3×12" }, { name: "Straight-Arm Pulldown", mode: "strength", prescription: "3×15" }] },
  { id: "lib-b-mb-4",  muscleGroup: "Back", segment: "Main Block", name: "Back Thickness",      exercises: [{ name: "Pendlay Row", mode: "strength", prescription: "4×6" }, { name: "T-Bar Row", mode: "strength", prescription: "3×10" }, { name: "Dumbbell Row", mode: "strength", prescription: "3×12" }] },
  { id: "lib-b-mb-5",  muscleGroup: "Back", segment: "Main Block", name: "Trap Builder",        exercises: [{ name: "Shrug", mode: "strength", prescription: "4×15" }, { name: "Face Pull", mode: "strength", prescription: "3×15" }, { name: "Rack Pull", mode: "strength", prescription: "3×6" }] },
  { id: "lib-b-mb-6",  muscleGroup: "Back", segment: "Main Block", name: "Posterior Chain",     exercises: [{ name: "Romanian Deadlift", mode: "strength", prescription: "4×8" }, { name: "Hyperextension", mode: "strength", prescription: "3×12" }, { name: "Good Morning", mode: "strength", prescription: "3×10" }] },
  { id: "lib-b-mb-7",  muscleGroup: "Back", segment: "Main Block", name: "Gymnastics Back",     exercises: [{ name: "Muscle Up", mode: "strength", prescription: "3×5" }, { name: "Ring Row", mode: "strength", prescription: "3×10" }, { name: "L-Sit Pull Up", mode: "strength", prescription: "3×6" }] },
  { id: "lib-b-mb-8",  muscleGroup: "Back", segment: "Main Block", name: "Cable Back Day",      exercises: [{ name: "Cable Row", mode: "strength", prescription: "4×12" }, { name: "Cable Pullover", mode: "strength", prescription: "3×12" }, { name: "Reverse Fly", mode: "strength", prescription: "3×15" }] },
  { id: "lib-b-mb-9",  muscleGroup: "Back", segment: "Main Block", name: "Strength Pull",       exercises: [{ name: "Weighted Pull Up", mode: "strength", prescription: "5×5" }, { name: "Barbell Row", mode: "strength", prescription: "4×6" }, { name: "Rack Pull", mode: "strength", prescription: "3×5" }] },
  // Active Recovery
  { id: "lib-b-rc-1",  muscleGroup: "Back", segment: "Active Recovery", name: "Back Mobility",       exercises: [{ name: "Child's Pose", mode: "timed", prescription: "3g × 2 min" }, { name: "Seated Spinal Twist", mode: "timed", prescription: "3g × 1 min" }, { name: "Doorway Chest Stretch", mode: "timed", prescription: "3g × 45 sec" }] },
  { id: "lib-b-rc-2",  muscleGroup: "Back", segment: "Active Recovery", name: "Thoracic Release",    exercises: [{ name: "Foam Roll Upper Back", mode: "timed", prescription: "3g × 1 min" }, { name: "Thoracic Rotation", mode: "timed", prescription: "3g × 1 min" }, { name: "Lat Stretch", mode: "timed", prescription: "3g × 45 sec" }] },

  // ─── CHEST ───────────────────────────────────────────────────────────────
  // Warm Up
  { id: "lib-ch-wu-1", muscleGroup: "Chest", segment: "Warm Up", name: "Chest Opener",          exercises: [{ name: "Doorway Chest Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Push Up", mode: "strength", prescription: "2×10" }, { name: "Shoulder Cross Stretch", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-ch-wu-2", muscleGroup: "Chest", segment: "Warm Up", name: "Pec Activation",        exercises: [{ name: "Cable Fly", mode: "strength", prescription: "2×15" }, { name: "Band Pull-Apart", mode: "strength", prescription: "2×15" }, { name: "Arm Circle", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-ch-wu-3", muscleGroup: "Chest", segment: "Warm Up", name: "Push Pattern Prep",     exercises: [{ name: "Push Up", mode: "strength", prescription: "3×10" }, { name: "Incline Push Up", mode: "strength", prescription: "2×12" }, { name: "Scap Push-Up", mode: "strength", prescription: "2×10" }] },
  { id: "lib-ch-wu-4", muscleGroup: "Chest", segment: "Warm Up", name: "Upper Body Primer",     exercises: [{ name: "Arm Swing", mode: "timed", prescription: "3g × 30 sec" }, { name: "Chest Expansion", mode: "timed", prescription: "3g × 30 sec" }, { name: "Wall Push Up", mode: "strength", prescription: "2×15" }] },
  // Main Block
  { id: "lib-ch-mb-1", muscleGroup: "Chest", segment: "Main Block", name: "Push Power",          exercises: [{ name: "Bench Press", mode: "strength", prescription: "4×8" }, { name: "Overhead Press", mode: "strength", prescription: "3×10" }, { name: "Tricep Dip", mode: "strength", prescription: "3×12" }] },
  { id: "lib-ch-mb-2", muscleGroup: "Chest", segment: "Main Block", name: "Chest & Triceps",     exercises: [{ name: "Incline Bench Press", mode: "strength", prescription: "4×10" }, { name: "Cable Fly", mode: "strength", prescription: "3×15" }, { name: "Rope Pushdown", mode: "strength", prescription: "3×15" }] },
  { id: "lib-ch-mb-3", muscleGroup: "Chest", segment: "Main Block", name: "Upper Chest Focus",   exercises: [{ name: "Incline Dumbbell Press", mode: "strength", prescription: "4×10" }, { name: "High Cable Fly", mode: "strength", prescription: "3×15" }, { name: "Landmine Press", mode: "strength", prescription: "3×10" }] },
  { id: "lib-ch-mb-4", muscleGroup: "Chest", segment: "Main Block", name: "Lower Chest Blast",   exercises: [{ name: "Decline Bench Press", mode: "strength", prescription: "4×10" }, { name: "Dip", mode: "strength", prescription: "3×12" }, { name: "Low Cable Fly", mode: "strength", prescription: "3×15" }] },
  { id: "lib-ch-mb-5", muscleGroup: "Chest", segment: "Main Block", name: "Strength Press",      exercises: [{ name: "Barbell Bench Press", mode: "strength", prescription: "5×5" }, { name: "Weighted Dip", mode: "strength", prescription: "4×6" }, { name: "Close-Grip Bench", mode: "strength", prescription: "3×8" }] },
  { id: "lib-ch-mb-6", muscleGroup: "Chest", segment: "Main Block", name: "Dumbbell Chest Day",  exercises: [{ name: "Dumbbell Bench Press", mode: "strength", prescription: "4×10" }, { name: "Dumbbell Fly", mode: "strength", prescription: "3×12" }, { name: "Pullover", mode: "strength", prescription: "3×12" }] },
  { id: "lib-ch-mb-7", muscleGroup: "Chest", segment: "Main Block", name: "Calisthenics Push",   exercises: [{ name: "Archer Push Up", mode: "strength", prescription: "3×8" }, { name: "Pike Push Up", mode: "strength", prescription: "3×10" }, { name: "Diamond Push Up", mode: "strength", prescription: "3×12" }] },
  { id: "lib-ch-mb-8", muscleGroup: "Chest", segment: "Main Block", name: "Volume Chest",        exercises: [{ name: "Bench Press", mode: "strength", prescription: "5×12" }, { name: "Cable Fly", mode: "strength", prescription: "4×15" }, { name: "Push Up", mode: "strength", prescription: "3×20" }] },
  { id: "lib-ch-mb-9", muscleGroup: "Chest", segment: "Main Block", name: "Chest Machine Day",   exercises: [{ name: "Chest Press Machine", mode: "strength", prescription: "4×12" }, { name: "Pec Deck Fly", mode: "strength", prescription: "3×15" }, { name: "Incline Machine Press", mode: "strength", prescription: "3×12" }] },
  // Active Recovery
  { id: "lib-ch-rc-1", muscleGroup: "Chest", segment: "Active Recovery", name: "Chest Cooldown",    exercises: [{ name: "Doorway Chest Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Child's Pose", mode: "timed", prescription: "3g × 1 min" }, { name: "Neck Side Stretch", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-ch-rc-2", muscleGroup: "Chest", segment: "Active Recovery", name: "Pec Release",       exercises: [{ name: "Foam Roll Pecs", mode: "timed", prescription: "3g × 1 min" }, { name: "Chest Expansion Breath", mode: "timed", prescription: "3g × 1 min" }, { name: "Shoulder Cross Stretch", mode: "timed", prescription: "3g × 45 sec" }] },

  // ─── SHOULDERS ──────────────────────────────────────────────────────────
  // Warm Up
  { id: "lib-sh-wu-1", muscleGroup: "Shoulders", segment: "Warm Up", name: "Shoulder Prep",     exercises: [{ name: "Shoulder Cross Stretch", mode: "timed", prescription: "3g × 45 sec" }, { name: "Face Pull", mode: "strength", prescription: "2×15" }, { name: "Lateral Raise", mode: "strength", prescription: "2×12" }] },
  { id: "lib-sh-wu-2", muscleGroup: "Shoulders", segment: "Warm Up", name: "Rotator Cuff Prep", exercises: [{ name: "Internal Rotation Band", mode: "strength", prescription: "3×15" }, { name: "External Rotation Band", mode: "strength", prescription: "3×15" }, { name: "Prone Y-T-W", mode: "strength", prescription: "2×10" }] },
  { id: "lib-sh-wu-3", muscleGroup: "Shoulders", segment: "Warm Up", name: "Overhead Primer",   exercises: [{ name: "Wall Slide", mode: "strength", prescription: "3×10" }, { name: "Arm Circle", mode: "timed", prescription: "3g × 30 sec" }, { name: "Scap Push-Up", mode: "strength", prescription: "2×12" }] },
  { id: "lib-sh-wu-4", muscleGroup: "Shoulders", segment: "Warm Up", name: "Delt Wake-Up",      exercises: [{ name: "Dumbbell Front Raise", mode: "strength", prescription: "2×12" }, { name: "Dumbbell Lateral Raise", mode: "strength", prescription: "2×12" }, { name: "Band Pull-Apart", mode: "strength", prescription: "2×15" }] },
  // Main Block
  { id: "lib-sh-mb-1", muscleGroup: "Shoulders", segment: "Main Block", name: "Shoulder Sculpt", exercises: [{ name: "Arnold Press", mode: "strength", prescription: "3×12" }, { name: "Lateral Raise", mode: "strength", prescription: "3×15" }, { name: "Rear Delt Fly", mode: "strength", prescription: "3×15" }] },
  { id: "lib-sh-mb-2", muscleGroup: "Shoulders", segment: "Main Block", name: "Upper Hypertrophy", exercises: [{ name: "Overhead Press", mode: "strength", prescription: "4×8" }, { name: "Upright Row", mode: "strength", prescription: "3×12" }, { name: "Shrug", mode: "strength", prescription: "3×15" }] },
  { id: "lib-sh-mb-3", muscleGroup: "Shoulders", segment: "Main Block", name: "3D Shoulder",    exercises: [{ name: "Front Raise", mode: "strength", prescription: "3×12" }, { name: "Lateral Raise", mode: "strength", prescription: "3×15" }, { name: "Rear Delt Fly", mode: "strength", prescription: "3×15" }] },
  { id: "lib-sh-mb-4", muscleGroup: "Shoulders", segment: "Main Block", name: "Press Strength",  exercises: [{ name: "Military Press", mode: "strength", prescription: "5×5" }, { name: "Push Press", mode: "strength", prescription: "3×6" }, { name: "Z Press", mode: "strength", prescription: "3×8" }] },
  { id: "lib-sh-mb-5", muscleGroup: "Shoulders", segment: "Main Block", name: "Cable Shoulders", exercises: [{ name: "Cable Lateral Raise", mode: "strength", prescription: "3×15" }, { name: "Cable Front Raise", mode: "strength", prescription: "3×12" }, { name: "Cable Face Pull", mode: "strength", prescription: "3×15" }] },
  { id: "lib-sh-mb-6", muscleGroup: "Shoulders", segment: "Main Block", name: "Rear Delt Day",   exercises: [{ name: "Reverse Pec Deck", mode: "strength", prescription: "4×15" }, { name: "Bent-Over Lateral Raise", mode: "strength", prescription: "3×15" }, { name: "Band Pull-Apart", mode: "strength", prescription: "3×20" }] },
  { id: "lib-sh-mb-7", muscleGroup: "Shoulders", segment: "Main Block", name: "Dumbbell Press Day", exercises: [{ name: "Dumbbell Shoulder Press", mode: "strength", prescription: "4×10" }, { name: "Lateral Raise", mode: "strength", prescription: "3×15" }, { name: "Arnold Press", mode: "strength", prescription: "3×12" }] },
  { id: "lib-sh-mb-8", muscleGroup: "Shoulders", segment: "Main Block", name: "Machine Shoulder", exercises: [{ name: "Machine Shoulder Press", mode: "strength", prescription: "4×12" }, { name: "Pec Deck Reverse Fly", mode: "strength", prescription: "3×15" }, { name: "Machine Lateral Raise", mode: "strength", prescription: "3×15" }] },
  { id: "lib-sh-mb-9", muscleGroup: "Shoulders", segment: "Main Block", name: "Superset Delts",   exercises: [{ name: "Lateral Raise", mode: "strength", prescription: "4×12" }, { name: "Front Raise", mode: "strength", prescription: "4×12" }, { name: "Upright Row", mode: "strength", prescription: "3×12" }] },
  // Active Recovery
  { id: "lib-sh-rc-1", muscleGroup: "Shoulders", segment: "Active Recovery", name: "Shoulder Cooldown", exercises: [{ name: "Shoulder Cross Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Neck Side Stretch", mode: "timed", prescription: "3g × 30 sec" }, { name: "Doorway Chest Stretch", mode: "timed", prescription: "3g × 45 sec" }] },
  { id: "lib-sh-rc-2", muscleGroup: "Shoulders", segment: "Active Recovery", name: "Rotator Cuff Care", exercises: [{ name: "Pendulum Swing", mode: "timed", prescription: "3g × 1 min" }, { name: "Sleeper Stretch", mode: "timed", prescription: "3g × 45 sec" }, { name: "Cross-Body Stretch", mode: "timed", prescription: "3g × 1 min" }] },

  // ─── ARMS ────────────────────────────────────────────────────────────────
  // Warm Up
  { id: "lib-ar-wu-1", muscleGroup: "Arms", segment: "Warm Up", name: "Arm Activation",         exercises: [{ name: "Dumbbell Curl", mode: "strength", prescription: "2×12" }, { name: "Tricep Pushdown", mode: "strength", prescription: "2×12" }, { name: "Shoulder Cross Stretch", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-ar-wu-2", muscleGroup: "Arms", segment: "Warm Up", name: "Elbow Primer",            exercises: [{ name: "Wrist Circles", mode: "timed", prescription: "3g × 30 sec" }, { name: "Band Curl", mode: "strength", prescription: "2×15" }, { name: "Band Pushdown", mode: "strength", prescription: "2×15" }] },
  { id: "lib-ar-wu-3", muscleGroup: "Arms", segment: "Warm Up", name: "Forearm Wake-Up",         exercises: [{ name: "Wrist Flexion", mode: "strength", prescription: "3×15" }, { name: "Wrist Extension", mode: "strength", prescription: "3×15" }, { name: "Farmer Hold", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-ar-wu-4", muscleGroup: "Arms", segment: "Warm Up", name: "Bicep & Tricep Prime",    exercises: [{ name: "Cable Curl", mode: "strength", prescription: "2×15" }, { name: "Cable Pushdown", mode: "strength", prescription: "2×15" }, { name: "Arm Circle", mode: "timed", prescription: "3g × 30 sec" }] },
  // Main Block
  { id: "lib-ar-mb-1", muscleGroup: "Arms", segment: "Main Block", name: "Arm Builder",          exercises: [{ name: "Barbell Curl", mode: "strength", prescription: "3×10" }, { name: "Skull Crusher", mode: "strength", prescription: "3×10" }, { name: "Hammer Curl", mode: "strength", prescription: "3×12" }] },
  { id: "lib-ar-mb-2", muscleGroup: "Arms", segment: "Main Block", name: "Arm Superset",         exercises: [{ name: "Preacher Curl", mode: "strength", prescription: "3×12" }, { name: "Overhead Tricep Ext", mode: "strength", prescription: "3×12" }, { name: "Concentration Curl", mode: "strength", prescription: "3×10" }] },
  { id: "lib-ar-mb-3", muscleGroup: "Arms", segment: "Main Block", name: "Bicep Peak",           exercises: [{ name: "Incline Dumbbell Curl", mode: "strength", prescription: "4×10" }, { name: "Drag Curl", mode: "strength", prescription: "3×12" }, { name: "Cable Curl", mode: "strength", prescription: "3×15" }] },
  { id: "lib-ar-mb-4", muscleGroup: "Arms", segment: "Main Block", name: "Tricep Mass",          exercises: [{ name: "Close-Grip Bench", mode: "strength", prescription: "4×8" }, { name: "Overhead Extension", mode: "strength", prescription: "3×12" }, { name: "Rope Pushdown", mode: "strength", prescription: "3×15" }] },
  { id: "lib-ar-mb-5", muscleGroup: "Arms", segment: "Main Block", name: "Forearm Strength",     exercises: [{ name: "Barbell Wrist Curl", mode: "strength", prescription: "4×15" }, { name: "Reverse Curl", mode: "strength", prescription: "3×12" }, { name: "Farmer Carry", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-ar-mb-6", muscleGroup: "Arms", segment: "Main Block", name: "Cable Arms Day",       exercises: [{ name: "Cable Curl", mode: "strength", prescription: "4×12" }, { name: "Cable Pushdown", mode: "strength", prescription: "4×12" }, { name: "Cable Hammer Curl", mode: "strength", prescription: "3×12" }] },
  { id: "lib-ar-mb-7", muscleGroup: "Arms", segment: "Main Block", name: "21s & Giants",         exercises: [{ name: "21s Barbell Curl", mode: "strength", prescription: "3×21" }, { name: "Dumbbell Kickback", mode: "strength", prescription: "3×15" }, { name: "Zottman Curl", mode: "strength", prescription: "3×10" }] },
  { id: "lib-ar-mb-8", muscleGroup: "Arms", segment: "Main Block", name: "Machine Arms",         exercises: [{ name: "Preacher Machine Curl", mode: "strength", prescription: "4×12" }, { name: "Tricep Machine", mode: "strength", prescription: "4×12" }, { name: "Cable Concentration Curl", mode: "strength", prescription: "3×12" }] },
  { id: "lib-ar-mb-9", muscleGroup: "Arms", segment: "Main Block", name: "High Volume Arms",     exercises: [{ name: "Barbell Curl", mode: "strength", prescription: "5×10" }, { name: "Skull Crusher", mode: "strength", prescription: "5×10" }, { name: "Hammer Curl", mode: "strength", prescription: "4×12" }] },
  // Active Recovery
  { id: "lib-ar-rc-1", muscleGroup: "Arms", segment: "Active Recovery", name: "Arm Stretch Down", exercises: [{ name: "Shoulder Cross Stretch", mode: "timed", prescription: "3g × 45 sec" }, { name: "Neck Side Stretch", mode: "timed", prescription: "3g × 30 sec" }, { name: "Child's Pose", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-ar-rc-2", muscleGroup: "Arms", segment: "Active Recovery", name: "Elbow & Wrist Care", exercises: [{ name: "Wrist Flexor Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Wrist Extensor Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Forearm Massage", mode: "timed", prescription: "3g × 1 min" }] },

  // ─── CORE ────────────────────────────────────────────────────────────────
  // Warm Up
  { id: "lib-co-wu-1", muscleGroup: "Core", segment: "Warm Up", name: "Core Activation",        exercises: [{ name: "Dead Bug", mode: "timed", prescription: "3g × 45 sec" }, { name: "Cat-Cow", mode: "timed", prescription: "3g × 1 min" }, { name: "Hollow Body Hold", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-co-wu-2", muscleGroup: "Core", segment: "Warm Up", name: "Bracing Primer",         exercises: [{ name: "Diaphragmatic Breathing", mode: "timed", prescription: "3g × 1 min" }, { name: "Pallof Hold", mode: "timed", prescription: "3g × 30 sec" }, { name: "Bird Dog", mode: "strength", prescription: "3×10" }] },
  { id: "lib-co-wu-3", muscleGroup: "Core", segment: "Warm Up", name: "Rotation Prep",          exercises: [{ name: "Thoracic Rotation", mode: "timed", prescription: "3g × 45 sec" }, { name: "Windmill", mode: "strength", prescription: "2×10" }, { name: "Side Bend", mode: "strength", prescription: "2×12" }] },
  { id: "lib-co-wu-4", muscleGroup: "Core", segment: "Warm Up", name: "McGill Big Three",       exercises: [{ name: "McGill Curl Up", mode: "strength", prescription: "3×10" }, { name: "Side Plank", mode: "timed", prescription: "3g × 20 sec" }, { name: "Bird Dog", mode: "strength", prescription: "3×10" }] },
  // Main Block
  { id: "lib-co-mb-1", muscleGroup: "Core", segment: "Main Block", name: "Core Circuit",        exercises: [{ name: "Plank", mode: "timed", prescription: "3g × 1 min" }, { name: "Side Plank", mode: "timed", prescription: "3g × 45 sec" }, { name: "Bicycle Crunch", mode: "strength", prescription: "3×20" }] },
  { id: "lib-co-mb-2", muscleGroup: "Core", segment: "Main Block", name: "Core Strength",       exercises: [{ name: "Ab Rollout", mode: "strength", prescription: "3×10" }, { name: "Pallof Press", mode: "strength", prescription: "3×12" }, { name: "Leg Raise", mode: "strength", prescription: "3×15" }] },
  { id: "lib-co-mb-3", muscleGroup: "Core", segment: "Main Block", name: "Anti-Rotation",       exercises: [{ name: "Pallof Press", mode: "strength", prescription: "4×12" }, { name: "Landmine Rotation", mode: "strength", prescription: "3×10" }, { name: "Copenhagen Plank", mode: "timed", prescription: "3g × 20 sec" }] },
  { id: "lib-co-mb-4", muscleGroup: "Core", segment: "Main Block", name: "Flexion Focus",       exercises: [{ name: "Crunch", mode: "strength", prescription: "4×20" }, { name: "V-Up", mode: "strength", prescription: "3×15" }, { name: "Reverse Crunch", mode: "strength", prescription: "3×15" }] },
  { id: "lib-co-mb-5", muscleGroup: "Core", segment: "Main Block", name: "Loaded Core",         exercises: [{ name: "Weighted Plank", mode: "timed", prescription: "3g × 45 sec" }, { name: "Cable Crunch", mode: "strength", prescription: "4×15" }, { name: "Loaded Pallof Press", mode: "strength", prescription: "3×12" }] },
  { id: "lib-co-mb-6", muscleGroup: "Core", segment: "Main Block", name: "Oblique Destroyer",   exercises: [{ name: "Windmill", mode: "strength", prescription: "3×10" }, { name: "Side Bend", mode: "strength", prescription: "4×15" }, { name: "Oblique Crunch", mode: "strength", prescription: "3×20" }] },
  { id: "lib-co-mb-7", muscleGroup: "Core", segment: "Main Block", name: "Lower Abs Blitz",     exercises: [{ name: "Leg Raise", mode: "strength", prescription: "4×15" }, { name: "Reverse Crunch", mode: "strength", prescription: "3×15" }, { name: "Flutter Kick", mode: "timed", prescription: "3g × 45 sec" }] },
  { id: "lib-co-mb-8", muscleGroup: "Core", segment: "Main Block", name: "Gymnastic Core",      exercises: [{ name: "L-Sit", mode: "timed", prescription: "3g × 15 sec" }, { name: "Tuck Hold", mode: "timed", prescription: "3g × 20 sec" }, { name: "Hollow Body Hold", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-co-mb-9", muscleGroup: "Core", segment: "Main Block", name: "Core Stability",      exercises: [{ name: "Dead Bug", mode: "strength", prescription: "4×10" }, { name: "Bird Dog", mode: "strength", prescription: "3×12" }, { name: "Suitcase Carry", mode: "timed", prescription: "3g × 30 sec" }] },
  // Active Recovery
  { id: "lib-co-rc-1", muscleGroup: "Core", segment: "Active Recovery", name: "Core Cooldown",  exercises: [{ name: "Child's Pose", mode: "timed", prescription: "3g × 2 min" }, { name: "Seated Spinal Twist", mode: "timed", prescription: "3g × 1 min" }, { name: "Cat-Cow", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-co-rc-2", muscleGroup: "Core", segment: "Active Recovery", name: "Spinal Deload",  exercises: [{ name: "Supine Knee Hug", mode: "timed", prescription: "3g × 1 min" }, { name: "Lumbar Rotation", mode: "timed", prescription: "3g × 1 min" }, { name: "Cobra Stretch", mode: "timed", prescription: "3g × 1 min" }] },

  // ─── CARDIO ──────────────────────────────────────────────────────────────
  // Warm Up
  { id: "lib-cd-wu-1", muscleGroup: "Cardio", segment: "Warm Up", name: "Cardio Primer",        exercises: [{ name: "Jumping Jacks", mode: "timed", prescription: "3g × 1 min" }, { name: "High Knees", mode: "timed", prescription: "3g × 30 sec" }, { name: "Jump Rope", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-cd-wu-2", muscleGroup: "Cardio", segment: "Warm Up", name: "Aerobic Ramp",         exercises: [{ name: "Easy Jog", mode: "timed", prescription: "3g × 2 min" }, { name: "Butt Kicks", mode: "timed", prescription: "3g × 30 sec" }, { name: "Arm Swing", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-cd-wu-3", muscleGroup: "Cardio", segment: "Warm Up", name: "Dynamic Cardio Prep",  exercises: [{ name: "Lateral Shuffle", mode: "timed", prescription: "3g × 30 sec" }, { name: "Carioca", mode: "timed", prescription: "3g × 30 sec" }, { name: "A-Skip", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-cd-wu-4", muscleGroup: "Cardio", segment: "Warm Up", name: "Bike Warm-Up",         exercises: [{ name: "Easy Bike", mode: "timed", prescription: "3g × 3 min" }, { name: "Leg Swing", mode: "timed", prescription: "3g × 30 sec" }, { name: "Hip Circle", mode: "timed", prescription: "3g × 30 sec" }] },
  // Main Block
  { id: "lib-cd-mb-1", muscleGroup: "Cardio", segment: "Main Block", name: "HIIT Intervals",    exercises: [{ name: "Sprint Intervals", mode: "timed", prescription: "3g × 30 sec" }, { name: "Box Jumps", mode: "timed", prescription: "3g × 45 sec" }, { name: "Assault Bike", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-cd-mb-2", muscleGroup: "Cardio", segment: "Main Block", name: "Endurance Base",    exercises: [{ name: "Rowing Machine", mode: "timed", prescription: "3g × 10 min" }, { name: "Stationary Bike", mode: "timed", prescription: "3g × 15 min" }, { name: "Treadmill Run", mode: "timed", prescription: "3g × 20 min" }] },
  { id: "lib-cd-mb-3", muscleGroup: "Cardio", segment: "Main Block", name: "Cardio Blast",      exercises: [{ name: "Burpees", mode: "timed", prescription: "3g × 1 min" }, { name: "Jump Rope", mode: "timed", prescription: "3g × 2 min" }, { name: "High Knees", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-cd-mb-4", muscleGroup: "Cardio", segment: "Main Block", name: "Zone 2 Steady",     exercises: [{ name: "Treadmill Walk/Jog", mode: "timed", prescription: "1g × 30 min" }, { name: "Stationary Bike", mode: "timed", prescription: "1g × 30 min" }, { name: "Elliptical", mode: "timed", prescription: "1g × 20 min" }] },
  { id: "lib-cd-mb-5", muscleGroup: "Cardio", segment: "Main Block", name: "Tabata Protocol",   exercises: [{ name: "Tabata Sprints", mode: "timed", prescription: "8g × 20 sec" }, { name: "Tabata Bike", mode: "timed", prescription: "8g × 20 sec" }, { name: "Tabata Jump Rope", mode: "timed", prescription: "8g × 20 sec" }] },
  { id: "lib-cd-mb-6", muscleGroup: "Cardio", segment: "Main Block", name: "Rowing Power",      exercises: [{ name: "500m Row", mode: "timed", prescription: "4g × 500 m" }, { name: "2 min Row", mode: "timed", prescription: "3g × 2 min" }, { name: "Easy Row Recovery", mode: "timed", prescription: "2g × 3 min" }] },
  { id: "lib-cd-mb-7", muscleGroup: "Cardio", segment: "Main Block", name: "Bike Intervals",    exercises: [{ name: "30/30 Bike", mode: "timed", prescription: "8g × 30 sec" }, { name: "1 min Hard Bike", mode: "timed", prescription: "5g × 1 min" }, { name: "Assault Bike Sprint", mode: "timed", prescription: "4g × 20 sec" }] },
  { id: "lib-cd-mb-8", muscleGroup: "Cardio", segment: "Main Block", name: "Metabolic Circuit", exercises: [{ name: "Mountain Climbers", mode: "timed", prescription: "4g × 45 sec" }, { name: "Burpees", mode: "timed", prescription: "4g × 45 sec" }, { name: "Jump Rope", mode: "timed", prescription: "4g × 1 min" }] },
  { id: "lib-cd-mb-9", muscleGroup: "Cardio", segment: "Main Block", name: "Long Run",          exercises: [{ name: "Outdoor Run", mode: "timed", prescription: "1g × 45 min" }, { name: "Tempo Run", mode: "timed", prescription: "1g × 20 min" }, { name: "Cool-Down Walk", mode: "timed", prescription: "1g × 5 min" }] },
  // Active Recovery
  { id: "lib-cd-rc-1", muscleGroup: "Cardio", segment: "Active Recovery", name: "Cardio Recovery", exercises: [{ name: "Child's Pose", mode: "timed", prescription: "3g × 2 min" }, { name: "Hamstring Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Calf Stretch", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-cd-rc-2", muscleGroup: "Cardio", segment: "Active Recovery", name: "Easy Walk",       exercises: [{ name: "Slow Walk", mode: "timed", prescription: "1g × 10 min" }, { name: "Hip Flexor Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Quad Stretch", mode: "timed", prescription: "3g × 45 sec" }] },

  // ─── FULL BODY ───────────────────────────────────────────────────────────
  // Warm Up
  { id: "lib-fb-wu-1", muscleGroup: "Full Body", segment: "Warm Up", name: "Morning Activation", exercises: [{ name: "Hip Flexor Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Cat-Cow", mode: "timed", prescription: "3g × 1 min" }, { name: "Dead Bug", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-fb-wu-2", muscleGroup: "Full Body", segment: "Warm Up", name: "Full Body Flow",     exercises: [{ name: "World's Greatest Stretch", mode: "timed", prescription: "3g × 1 min" }, { name: "Inchworm", mode: "strength", prescription: "2×8" }, { name: "Jump Rope", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-fb-wu-3", muscleGroup: "Full Body", segment: "Warm Up", name: "Athletic Warm-Up",   exercises: [{ name: "High Knees", mode: "timed", prescription: "3g × 30 sec" }, { name: "Lateral Shuffle", mode: "timed", prescription: "3g × 30 sec" }, { name: "Arm Circle", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-fb-wu-4", muscleGroup: "Full Body", segment: "Warm Up", name: "Joint Mobility",     exercises: [{ name: "Ankle Circle", mode: "timed", prescription: "3g × 30 sec" }, { name: "Hip Circle", mode: "timed", prescription: "3g × 30 sec" }, { name: "Shoulder Circle", mode: "timed", prescription: "3g × 30 sec" }] },
  // Main Block
  { id: "lib-fb-mb-1", muscleGroup: "Full Body", segment: "Main Block", name: "Strength Foundations", exercises: [{ name: "Deadlift", mode: "strength", prescription: "5×5" }, { name: "Bench Press", mode: "strength", prescription: "5×5" }, { name: "Back Squat", mode: "strength", prescription: "5×5" }] },
  { id: "lib-fb-mb-2", muscleGroup: "Full Body", segment: "Main Block", name: "Full Body Burn",  exercises: [{ name: "Deadlift", mode: "strength", prescription: "3×8" }, { name: "Push Up", mode: "strength", prescription: "3×15" }, { name: "Plank", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-fb-mb-3", muscleGroup: "Full Body", segment: "Main Block", name: "Explosive Athlete", exercises: [{ name: "Box Jumps", mode: "strength", prescription: "4×5" }, { name: "Push Press", mode: "strength", prescription: "4×6" }, { name: "Sprint Intervals", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-fb-mb-4", muscleGroup: "Full Body", segment: "Main Block", name: "Push Pull Legs",  exercises: [{ name: "Pull Up", mode: "strength", prescription: "4×8" }, { name: "Bench Press", mode: "strength", prescription: "4×8" }, { name: "Front Squat", mode: "strength", prescription: "4×8" }] },
  { id: "lib-fb-mb-5", muscleGroup: "Full Body", segment: "Main Block", name: "Olympic Lifts",   exercises: [{ name: "Power Clean", mode: "strength", prescription: "5×3" }, { name: "Push Jerk", mode: "strength", prescription: "4×3" }, { name: "Hang Snatch", mode: "strength", prescription: "4×3" }] },
  { id: "lib-fb-mb-6", muscleGroup: "Full Body", segment: "Main Block", name: "Bodyweight Power", exercises: [{ name: "Burpees", mode: "strength", prescription: "4×10" }, { name: "Clapping Push Up", mode: "strength", prescription: "3×8" }, { name: "Jump Squat", mode: "strength", prescription: "3×10" }] },
  { id: "lib-fb-mb-7", muscleGroup: "Full Body", segment: "Main Block", name: "CrossFit WOD",    exercises: [{ name: "Kettlebell Swing", mode: "strength", prescription: "5×15" }, { name: "Goblet Squat", mode: "strength", prescription: "4×10" }, { name: "Assault Bike", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-fb-mb-8", muscleGroup: "Full Body", segment: "Main Block", name: "Functional Fitness", exercises: [{ name: "Turkish Get-Up", mode: "strength", prescription: "3×5" }, { name: "Farmer Carry", mode: "timed", prescription: "3g × 30 sec" }, { name: "Battle Ropes", mode: "timed", prescription: "3g × 30 sec" }] },
  { id: "lib-fb-mb-9", muscleGroup: "Full Body", segment: "Main Block", name: "Giant Set Day",   exercises: [{ name: "Back Squat", mode: "strength", prescription: "4×8" }, { name: "Barbell Row", mode: "strength", prescription: "4×8" }, { name: "Bench Press", mode: "strength", prescription: "4×8" }] },
  // Active Recovery
  { id: "lib-fb-rc-1", muscleGroup: "Full Body", segment: "Active Recovery", name: "Mobility Flow",    exercises: [{ name: "Pigeon Pose", mode: "timed", prescription: "3g × 1 min" }, { name: "Thoracic Rotation", mode: "timed", prescription: "3g × 1 min" }, { name: "Hamstring Stretch", mode: "timed", prescription: "3g × 1 min" }] },
  { id: "lib-fb-rc-2", muscleGroup: "Full Body", segment: "Active Recovery", name: "Yoga Cool-Down",   exercises: [{ name: "Downward Dog", mode: "timed", prescription: "3g × 1 min" }, { name: "Warrior I", mode: "timed", prescription: "3g × 1 min" }, { name: "Seated Forward Fold", mode: "timed", prescription: "3g × 2 min" }] },
]
