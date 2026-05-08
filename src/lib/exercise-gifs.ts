// Demo-only mapping from exercise name → animated GIF preview.
// Sources are public Giphy CDN URLs picked for visual approximation;
// not medically accurate references — for UI demo purposes only.

const GIFS: Record<string, string> = {
  "Incline DB Press":        "https://media.giphy.com/media/xT9DPldfo5BNheaPgI/giphy.gif",
  "Cable Fly":               "https://media.giphy.com/media/3o6ZsYDM3v3jLP6fEs/giphy.gif",
  "Push-Up (deficit)":       "https://media.giphy.com/media/3oEjI80FPMwQbhT5HG/giphy.gif",
  "Machine Chest Press":     "https://media.giphy.com/media/xT9DPldfo5BNheaPgI/giphy.gif",
  "Pec Deck":                "https://media.giphy.com/media/3o6ZsYDM3v3jLP6fEs/giphy.gif",
  "Tricep Pushdown":         "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",

  "Lat Pulldown":            "https://media.giphy.com/media/3oxRm1pBnVe5XSIMVa/giphy.gif",
  "Seated Cable Row":        "https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif",
  "Face Pull":               "https://media.giphy.com/media/3o7aD4ImYCV2LUnA9G/giphy.gif",
  "Single-Arm DB Row":       "https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif",
  "Straight-Arm Pulldown":   "https://media.giphy.com/media/3oxRm1pBnVe5XSIMVa/giphy.gif",
  "Hyperextension":          "https://media.giphy.com/media/3o7aD4ImYCV2LUnA9G/giphy.gif",

  "DB Shoulder Press":       "https://media.giphy.com/media/26gsspfbuhSEgUyNa/giphy.gif",
  "Lateral Raise":           "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Rear Delt Fly":           "https://media.giphy.com/media/3o7aD4ImYCV2LUnA9G/giphy.gif",
  "Cable Front Raise":       "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Upright Row":             "https://media.giphy.com/media/26gsspfbuhSEgUyNa/giphy.gif",
  "Shrug":                   "https://media.giphy.com/media/26gsspfbuhSEgUyNa/giphy.gif",

  "EZ Bar Curl":             "https://media.giphy.com/media/3oEjI4UoWoesU17PZK/giphy.gif",
  "Hammer Curl":             "https://media.giphy.com/media/3oEjI4UoWoesU17PZK/giphy.gif",
  "Overhead Tricep Ext":     "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Cable Curl":              "https://media.giphy.com/media/3oEjI4UoWoesU17PZK/giphy.gif",
  "Wrist Curl":              "https://media.giphy.com/media/3oEjI4UoWoesU17PZK/giphy.gif",

  "Leg Press":               "https://media.giphy.com/media/3o7TKsQ8Xb3gnwTm0w/giphy.gif",
  "Romanian Deadlift":       "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Seated Leg Curl":         "https://media.giphy.com/media/3o7TKsQ8Xb3gnwTm0w/giphy.gif",
  "Walking Lunge":           "https://media.giphy.com/media/3o7TKsQ8Xb3gnwTm0w/giphy.gif",
  "Leg Extension":           "https://media.giphy.com/media/3o7TKsQ8Xb3gnwTm0w/giphy.gif",
  "Standing Calf Raise":     "https://media.giphy.com/media/3o7TKsQ8Xb3gnwTm0w/giphy.gif",

  // alt / regen plan
  "Flat Barbell Bench":      "https://media.giphy.com/media/xT9DPldfo5BNheaPgI/giphy.gif",
  "Incline DB Fly":          "https://media.giphy.com/media/3o6ZsYDM3v3jLP6fEs/giphy.gif",
  "Dip (assisted)":          "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Chest-Supported Row":     "https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif",
  "Single-Arm Pulldown":     "https://media.giphy.com/media/3oxRm1pBnVe5XSIMVa/giphy.gif",
  "Reverse Fly":             "https://media.giphy.com/media/3o7aD4ImYCV2LUnA9G/giphy.gif",
  "Arnold Press":            "https://media.giphy.com/media/26gsspfbuhSEgUyNa/giphy.gif",
  "Cable Lateral":           "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Preacher Curl":           "https://media.giphy.com/media/3oEjI4UoWoesU17PZK/giphy.gif",
  "Hack Squat (partial)":    "https://media.giphy.com/media/3o7TKsQ8Xb3gnwTm0w/giphy.gif",
  "Hip Thrust":              "https://media.giphy.com/media/3o7TKsQ8Xb3gnwTm0w/giphy.gif",
  "Calf Raise":              "https://media.giphy.com/media/3o7TKsQ8Xb3gnwTm0w/giphy.gif",
};

const FALLBACK = "https://media.giphy.com/media/3oEjI80FPMwQbhT5HG/giphy.gif";

export const getExerciseGif = (name: string): string => GIFS[name] ?? FALLBACK;
