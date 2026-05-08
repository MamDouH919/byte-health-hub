

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  Sparkles,
  ImageIcon,
  Dumbbell,
  Timer,
  Pencil,
  Check,
  X,
  Trash2,
  ClipboardList,
  Copy,
  Library,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Workout, SelectedExercise, ExerciseMode, LibraryWorkout, LibraryMuscleGroup, LibrarySegment, WeekSchedule } from "@/lib/workout-data"
import { WORKOUT_COLORS, MOCK_EXERCISES, MODE_PRESETS, LIBRARY_WORKOUTS, LIBRARY_MUSCLE_GROUPS, LIBRARY_SEGMENTS, segmentFromName, COACHES } from "@/lib/workout-data"
import type { Coach } from "@/lib/workout-data"

interface WorkoutBarProps {
  workouts: Workout[]
  onDragStart: (e: React.DragEvent, workoutId: string) => void
  onUpdateExercise: (
    workoutId: string,
    exerciseId: string,
    prescription: string
  ) => void
  onDeleteWorkout: (workoutId: string) => void
  onEditWorkout: (workoutId: string, exercises: SelectedExercise[]) => void
  onDuplicateWorkout: (workoutId: string) => void
  onAddFromLibrary: (lib: LibraryWorkout) => void
  onDropExercise: (workoutId: string, exerciseId: string, mode: string, prescription: string) => void
  onQuickAssign: (lib: LibraryWorkout, day: string) => void
  weekSchedule: WeekSchedule
  onEditScheduledWorkout: (workoutId: string, exercises: SelectedExercise[]) => void
  onRemoveScheduledWorkout: (day: string, workoutId: string) => void
  onLoadCoachWorkouts: (workouts: Workout[]) => void
}

function getColorScheme(workout: Workout) {
  const idx = Number(workout.color) % WORKOUT_COLORS.length
  return WORKOUT_COLORS[idx]
}

/* ------------------------------------------------------------------ */
/*  Inline prescription editor row (used in hover popover)            */
/* ------------------------------------------------------------------ */
/** Keyword → local image path lookup. Checked in order; first match wins. */
const EXERCISE_IMAGE_MAP: { keywords: string[]; path: string }[] = [
  { keywords: ["squat", "goblet squat", "hack squat", "front squat", "back squat", "jump squat", "sumo squat"], path: "/exercises/back-squat.jpg" },
  { keywords: ["romanian", "stiff-leg", "rdl", "good morning", "rack pull"], path: "/exercises/rdl.jpg" },
  { keywords: ["deadlift"], path: "/exercises/deadlift.jpg" },
  { keywords: ["split squat", "bulgarian", "single-leg squat", "reverse lunge", "lunge", "step up"], path: "/exercises/split-squat.jpg" },
  { keywords: ["hip thrust", "glute bridge", "hip flexor"], path: "/exercises/hip-thrust.jpg" },
  { keywords: ["calf raise", "seated calf", "tibialis", "calf stretch"], path: "/exercises/calf-raise.jpg" },
  { keywords: ["leg press", "leg extension", "leg curl", "seated leg curl", "nordic curl", "hamstring"], path: "/exercises/leg-press.jpg" },
  { keywords: ["pull up", "chin up", "weighted pull", "wide-grip pull", "muscle up", "l-sit pull"], path: "/exercises/pull-up.jpg" },
  { keywords: ["lat pulldown", "wide-grip lat", "straight-arm pulldown", "cable pullover"], path: "/exercises/lat-pulldown.jpg" },
  { keywords: ["barbell row", "pendlay row", "bent-over", "t-bar row", "chest-supported row", "dumbbell row", "cable row", "seated cable row", "ring row", "inverted row"], path: "/exercises/barbell-row.jpg" },
  { keywords: ["bench press", "incline bench", "decline bench", "incline dumbbell press", "dumbbell bench press", "chest press machine", "incline machine press", "close-grip bench"], path: "/exercises/bench-press.jpg" },
  { keywords: ["dip", "weighted dip", "chest dip", "tricep dip"], path: "/exercises/tricep-pushdown.jpg" },
  { keywords: ["push up", "pike push", "diamond push", "archer push", "clapping push", "incline push", "wall push", "scap push"], path: "/exercises/push-up.jpg" },
  { keywords: ["cable fly", "pec deck", "dumbbell fly", "pullover", "landmine press"], path: "/exercises/cable-fly.jpg" },
  { keywords: ["overhead press", "military press", "push press", "z press", "push jerk", "arnold press", "dumbbell shoulder press", "machine shoulder press"], path: "/exercises/overhead-press.jpg" },
  { keywords: ["lateral raise", "front raise", "upright row", "shrug", "rear delt", "reverse fly", "bent-over lateral", "face pull", "cable lateral", "machine lateral", "band pull-apart", "reverse pec", "pec deck reverse"], path: "/exercises/lateral-raise.jpg" },
  { keywords: ["barbell curl", "dumbbell curl", "hammer curl", "preacher curl", "concentration curl", "cable curl", "incline dumbbell curl", "drag curl", "reverse curl", "zottman", "21s", "spider curl"], path: "/exercises/dumbbell-curl.jpg" },
  { keywords: ["tricep", "skull crusher", "rope pushdown", "overhead tricep", "overhead extension", "cable overhead", "kickback"], path: "/exercises/tricep-pushdown.jpg" },
  { keywords: ["plank", "side plank", "copenhagen", "weighted plank", "pallof", "dead bug", "bird dog", "hollow body", "l-sit", "tuck hold", "ab rollout", "ab wheel", "cable crunch", "leg raise", "bicycle crunch", "crunch", "v-up", "reverse crunch", "flutter kick", "oblique", "windmill", "side bend", "suitcase carry", "farmer carry", "farmer hold", "landmine rotation"], path: "/exercises/ab-rollout.jpg" },
  { keywords: ["box jump", "broad jump", "power clean", "hang snatch", "kettlebell swing", "battle rope", "burpee", "mountain climber", "jump rope", "high knees", "jumping jack", "sprint", "assault bike", "rowing machine", "stationary bike", "treadmill", "elliptical", "run", "jog", "a-skip", "carioca", "lateral shuffle", "skipping", "butt kick", "tabata", "slow walk"], path: "/exercises/cardio.jpg" },
  { keywords: ["stretch", "pose", "cat-cow", "child's pose", "pigeon", "thoracic", "spinal twist", "doorway", "neck", "shoulder cross", "foam roll", "mobility", "world's greatest", "inchworm", "cobra", "downward dog", "warrior", "forward fold", "supine knee", "lumbar", "diaphragmatic", "breathing", "chest expansion", "clamshell", "donkey kick", "fire hydrant", "wrist", "wall slide", "prone y", "scapular", "scap", "internal rotation", "external rotation", "band curl", "band pushdown", "sleeper", "pendulum swing", "arm circle", "arm swing", "leg swing", "ankle circle", "hip circle", "shoulder circle", "easy bike", "easy jog", "easy row"], path: "/exercises/stretch.jpg" },
]

function getExerciseImage(name: string): string {
  const lower = name.toLowerCase()
  for (const entry of EXERCISE_IMAGE_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) return entry.path
  }
  return "/exercises/stretch.jpg"
}

function WorkoutHoverPortal({ lib, anchorRect }: { lib: LibraryWorkout; anchorRect: DOMRect }) {
  const CARD_W = 260
  const GAP = 10
  let left = anchorRect.right + GAP
  let top  = anchorRect.top
  // keep inside viewport
  left = Math.min(left, window.innerWidth - CARD_W - 8)
  top  = Math.max(8, Math.min(top, window.innerHeight - (lib.exercises.length * 60 + 40) - 8))

  return createPortal(
    <div
      style={{ position: "fixed", left, top, width: CARD_W, zIndex: 9999 }}
      className="pointer-events-none overflow-hidden rounded-2xl border border-[hsl(var(--surface-border))] bg-background shadow-[var(--shadow-pop)] animate-scale-in"
    >
      {/* Header */}
      <div className="border-b border-border bg-muted/50 px-3 py-2">
        <p className="text-xs font-semibold text-foreground">{lib.name}</p>
        <p className="text-[10px] text-muted-foreground">{lib.muscleGroup} · {lib.segment}</p>
      </div>
      {/* Per-exercise rows */}
      {lib.exercises.map((ex, i) => (
        <div
          key={i}
          className={cn("flex items-center gap-0 overflow-hidden", i > 0 && "border-t border-border")}
        >
          <div className="relative size-14 shrink-0 overflow-hidden bg-muted">
            <img
              src={getExerciseImage(ex.name)}
              alt={ex.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 items-center gap-2 px-3">
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-xs font-medium leading-tight text-foreground">{ex.name}</span>
              <div className="flex items-center gap-1">
                <span className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  ex.mode === "strength" ? "bg-[hsl(var(--tag-inbody-fg))]" : "bg-[hsl(var(--status-normal-fg))]"
                )} />
                <span className="text-[10px] capitalize text-muted-foreground">{ex.mode}</span>
              </div>
            </div>
            <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
              {ex.prescription}
            </span>
          </div>
        </div>
      ))}
    </div>,
    document.body
  )
}

function ExercisePreviewPortal({ name, anchorRect }: { name: string; anchorRect: DOMRect }) {
  const imgPath = getExerciseImage(name)

  const CARD_W = 192
  const CARD_H = 160
  const GAP = 8

  let left = anchorRect.left + anchorRect.width / 2 - CARD_W / 2
  let top  = anchorRect.top - CARD_H - GAP

  left = Math.max(8, Math.min(left, window.innerWidth  - CARD_W - 8))
  top  = Math.max(8, Math.min(top,  window.innerHeight - CARD_H - 8))

  return createPortal(
    <div
      style={{ position: "fixed", left, top, width: CARD_W, zIndex: 9999 }}
      className="pointer-events-none rounded-2xl border border-[hsl(var(--surface-border))] bg-background shadow-[var(--shadow-pop)] animate-scale-in"
    >
      <div className="overflow-hidden rounded-t-xl bg-muted">
        <img src={imgPath} alt={`${name} demonstration`} className="h-28 w-full object-cover" />
      </div>
      <div className="px-3 py-2">
        <p className="text-xs font-semibold text-card-foreground">{name}</p>
      </div>
    </div>,
    document.body
  )
}

function ExerciseRow({
  exercise,
  workoutId,
  onUpdateExercise,
}: {
  exercise: SelectedExercise
  workoutId: string
  onUpdateExercise: WorkoutBarProps["onUpdateExercise"]
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(exercise.prescription)
  const [preview, setPreview] = useState<DOMRect | null>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const hasGif = true // all exercises now have a local image

  function save() {
    const trimmed = draft.trim()
    if (trimmed) onUpdateExercise(workoutId, exercise.id, trimmed)
    setIsEditing(false)
  }

  function cancel() {
    setDraft(exercise.prescription)
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-2 py-1.5">
      {exercise.mode === "strength" ? (
        <Dumbbell className="size-3.5 shrink-0 text-muted-foreground" />
      ) : (
        <Timer className="size-3.5 shrink-0 text-muted-foreground" />
      )}
      <span
        ref={nameRef}
        onMouseEnter={hasGif ? () => nameRef.current && setPreview(nameRef.current.getBoundingClientRect()) : undefined}
        onMouseLeave={hasGif ? () => setPreview(null) : undefined}
        className={cn(
          "min-w-0 flex-1 truncate text-xs font-medium text-popover-foreground",
          hasGif && "cursor-default underline decoration-dotted decoration-muted-foreground/40 underline-offset-2"
        )}
      >
        {exercise.name}
        {hasGif && <PlayCircle className="ml-1 inline size-2.5 text-muted-foreground/30" />}
      </span>
      {preview && <ExercisePreviewPortal name={exercise.name} anchorRect={preview} />}
      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save()
              if (e.key === "Escape") cancel()
            }}
            className="h-6 w-16 px-1.5 text-xs"
            autoFocus
          />
          <button onClick={save} className="text-foreground hover:opacity-70">
            <Check className="size-3" />
          </button>
          <button onClick={cancel} className="text-muted-foreground hover:opacity-70">
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-muted-foreground">
            {exercise.prescription}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-2.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Inline prescription input — manual edit, no arrows                */
/* ------------------------------------------------------------------ */
function parseStrength(p: string) {
  const m = p.match(/(\d+)[×x](\d+)/)
  return m ? { sets: Number(m[1]), reps: Number(m[2]) } : { sets: 3, reps: 10 }
}
function parseTimed(p: string): { groups: number; value: number; unit: "min" | "sec" } {
  const full = p.match(/(\d+)g\s*[×x]\s*(\d+)\s*(min|sec)/)
  if (full) return { groups: Number(full[1]), value: Number(full[2]), unit: full[3] as "min" | "sec" }
  const simple = p.match(/(\d+)\s*(min|sec)/)
  return simple ? { groups: 3, value: Number(simple[1]), unit: simple[2] as "min" | "sec" } : { groups: 3, value: 1, unit: "min" }
}

function InlinePrescription({
  mode,
  prescription,
  onChange,
}: {
  mode: "strength" | "timed"
  prescription: string
  onChange: (val: string) => void
}) {
  const inputCls =
    "w-9 rounded border border-border bg-background text-center text-xs font-semibold text-[hsl(var(--status-optimal-fg))] tabular-nums focus:outline-none focus:ring-1 focus:ring-foreground/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none py-0.5"

  if (mode === "strength") {
    const { sets, reps } = parseStrength(prescription)
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={1}
          value={sets}
          onChange={(e) =>
            onChange(`${Math.max(1, Number(e.target.value) || 1)}×${reps}`)
          }
          className={inputCls}
          aria-label="Sets"
        />
        <span className="text-xs text-muted-foreground">×</span>
        <input
          type="number"
          min={1}
          value={reps}
          onChange={(e) =>
            onChange(`${sets}×${Math.max(1, Number(e.target.value) || 1)}`)
          }
          className={inputCls}
          aria-label="Reps"
        />
      </div>
    )
  }

  const { groups, value, unit } = parseTimed(prescription)
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={1}
        value={groups}
        onChange={(e) =>
          onChange(`${Math.max(1, Number(e.target.value) || 1)}g × ${value} ${unit}`)
        }
        className={inputCls}
        aria-label="Groups"
      />
      <span className="text-[10px] text-muted-foreground">g ×</span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) =>
          onChange(`${groups}g × ${Math.max(1, Number(e.target.value) || 1)} ${unit}`)
        }
        className={cn(inputCls, "w-10")}
        aria-label="Duration"
      />
      <button
        type="button"
        onClick={() => {
          const newUnit = unit === "min" ? "sec" : "min"
          onChange(`${groups}g × ${unit === "min" ? 30 : 1} ${newUnit}`)
        }}
        className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-accent transition-colors"
      >
        {unit}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Edit workout dialog — only shows exercises already in the workout  */
/* ------------------------------------------------------------------ */
function EditWorkoutDialog({
  workout,
  open,
  onClose,
  onSave,
}: {
  workout: Workout
  open: boolean
  onClose: () => void
  onSave: (exercises: SelectedExercise[]) => void
}) {
  // Initialise from the workout's own exercises
  const [exercises, setExercises] = useState<SelectedExercise[]>(() =>
    workout.exercises.map((ex) => ({ ...ex }))
  )

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setExercises(workout.exercises.map((ex) => ({ ...ex })))
    } else {
      onClose()
    }
  }

  function setPrescription(id: string, prescription: string) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, prescription } : ex))
    )
  }

  function handleSave() {
    onSave(exercises)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit — {workout.name}</DialogTitle>
          <DialogDescription>
            Adjust the prescription for each exercise.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 py-2">
          {exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No exercises in this workout.
            </p>
          ) : (
            exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center gap-3 rounded-lg border border-foreground bg-accent/30 px-3 py-2.5"
              >
                {ex.mode === "strength" ? (
                  <Dumbbell className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Timer className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1 text-sm font-medium text-foreground">
                  {ex.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {ex.category}
                </span>
                <InlinePrescription
                  mode={ex.mode as "strength" | "timed"}
                  prescription={ex.prescription}
                  onChange={(p) => setPrescription(ex.id, p)}
                />
              </div>
            ))
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={exercises.length === 0}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Workout card with hover popover, edit button, and delete           */
/* ------------------------------------------------------------------ */
function WorkoutCard({
  workout,
  onDragStart,
  onUpdateExercise,
  onDeleteWorkout,
  onEditWorkout,
  onDuplicate,
  onDropExercise,
}: {
  workout: Workout
  onDragStart: (e: React.DragEvent) => void
  onUpdateExercise: WorkoutBarProps["onUpdateExercise"]
  onDeleteWorkout: () => void
  onEditWorkout: (exercises: SelectedExercise[]) => void
  onDuplicate: () => void
  onDropExercise: (exerciseId: string, mode: string, prescription: string) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const colors = getColorScheme(workout)

  function handleDragOver(e: React.DragEvent) {
    // Only accept exercise drops, not workout drops
    if (e.dataTransfer.types.includes("text/exercise-id")) {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
      setIsDropTarget(true)
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    setIsDropTarget(false)
  }

  function handleDrop(e: React.DragEvent) {
    setIsDropTarget(false)
    const exerciseId   = e.dataTransfer.getData("text/exercise-id")
    const mode         = e.dataTransfer.getData("text/exercise-mode")
    const prescription = e.dataTransfer.getData("text/exercise-prescription")
    if (exerciseId && mode) {
      e.preventDefault()
      e.stopPropagation()
      onDropExercise(exerciseId, mode, prescription)
    }
  }

  return (
    <>
      <Popover>
        <div
          draggable
          onDragStart={onDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative flex w-32 shrink-0 cursor-grab flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:shadow-md active:cursor-grabbing",
            colors.bg,
            isDropTarget ? "border-foreground ring-2 ring-foreground/20 scale-105" : colors.border
          )}
        >
          {/* Delete */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDeleteWorkout() }}
            className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
            aria-label={`Delete ${workout.name}`}
          >
            <X className="size-3" />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
            className="absolute -top-2 -left-2 z-10 flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-accent group-hover:opacity-100"
            aria-label={`Edit ${workout.name}`}
          >
            <Pencil className="size-3" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate() }}
            className="absolute -bottom-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-accent group-hover:opacity-100"
            aria-label={`Duplicate ${workout.name}`}
          >
            <Copy className="size-3" />
          </button>

          <Badge className={cn("text-[10px] border-0 max-w-full truncate", colors.badge)}>
            {workout.name}
          </Badge>
          <div className={cn("relative flex size-14 items-center justify-center rounded-md", colors.bg)}>
            <ImageIcon className={cn("size-6", colors.text)} />
            <Sparkles className={cn("absolute -top-1 -right-1 size-3.5", colors.text)} />
          </div>

          {/* Hover trigger is ONLY on the exercise count label */}
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground transition-colors"
            >
              {workout.exercises.length} exercise{workout.exercises.length !== 1 && "s"}
            </button>
          </PopoverTrigger>
        </div>

        <PopoverContent
          side="bottom"
          align="center"
          className="w-64 p-3"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", colors.dot)} />
            <p className="text-xs font-semibold text-popover-foreground">
              {workout.name}
              <span className="ml-1 font-normal text-muted-foreground">
                ({workout.exercises.length})
              </span>
            </p>
          </div>
          {workout.exercises.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No exercises — click the pencil to add some.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {workout.exercises.map((ex) => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  workoutId={workout.id}
                  onUpdateExercise={onUpdateExercise}
                />
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {editOpen && (
        <EditWorkoutDialog
          workout={workout}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={onEditWorkout}
        />
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Library dropdown — improved: segment filter + recently used +     */
/*  quick-assign day pills + drag directly from library item          */
/* ------------------------------------------------------------------ */
const SEGMENT_COLORS: Record<LibrarySegment, string> = {
  "Warm Up":         "text-[hsl(var(--status-normal-fg))]",
  "Main Block":      "text-[hsl(var(--tag-inbody-fg))]",
  "Active Recovery": "text-[hsl(var(--status-optimal-fg))]",
}
const SEGMENT_BG: Record<LibrarySegment, string> = {
  "Warm Up":         "bg-[hsl(var(--status-normal-bg))] border-[hsl(var(--status-normal-bg))] text-[hsl(var(--status-normal-fg))]",
  "Main Block":      "bg-[hsl(var(--tag-inbody-bg))] border-[hsl(var(--tag-inbody-bg))] text-[hsl(var(--tag-inbody-fg))]",
  "Active Recovery": "bg-[hsl(var(--status-optimal-bg))] border-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))]",
}
const SEGMENT_ACTIVE: Record<LibrarySegment, string> = {
  "Warm Up":         "bg-[hsl(var(--status-normal-fg))] border-[hsl(var(--status-normal-fg))] text-white",
  "Main Block":      "bg-[hsl(var(--tag-inbody-fg))] border-[hsl(var(--tag-inbody-fg))] text-white",
  "Active Recovery": "bg-[hsl(var(--trend-up))] border-[hsl(var(--status-optimal-fg))] text-white",
}

const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const

function LibraryDropdown({
  onAdd,
  onQuickAssign,
  weekSchedule,
  onEditScheduledWorkout,
  onRemoveScheduledWorkout,
}: {
  onAdd: (lib: LibraryWorkout) => void
  onQuickAssign: (lib: LibraryWorkout, day: string) => void
  weekSchedule: WeekSchedule
  onEditScheduledWorkout: (workoutId: string, exercises: SelectedExercise[]) => void
  onRemoveScheduledWorkout: (day: string, workoutId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [segmentFilter, setSegmentFilter] = useState<LibrarySegment | null>(null)
  const [openGroup, setOpenGroup] = useState<LibraryMuscleGroup | null>(null)
  const [openSegment, setOpenSegment] = useState<LibrarySegment | null>(null)
  const [hoveredWorkout, setHoveredWorkout] = useState<LibraryWorkout | null>(null)

  // flash keys: "<libId>" for tray-add, "<libId>-<day>" for quick-assign
  const [flashKeys, setFlashKeys] = useState<Set<string>>(new Set())
  // footer chip hover: "<day>-<workoutIndex>"
  const [hoveredChip, setHoveredChip] = useState<string | null>(null)
  // rect of the currently hovered workout row for portal positioning
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null)
  // inline edit state
  const [editingWorkout, setEditingWorkout] = useState<{ workout: Workout; day: string } | null>(null)
  const [draftExercises, setDraftExercises] = useState<SelectedExercise[]>([])

  function closeAll() {
    setOpen(false)
    setOpenGroup(null)
    setOpenSegment(null)
    setHoveredWorkout(null)
    setFlashKeys(new Set())
    setPanelEverOpened(false)
    setEditingWorkout(null)
    setDraftExercises([])
    setHoveredRect(null)
  }

  function flash(key: string) {
    setFlashKeys((prev) => new Set(prev).add(key))
    setTimeout(() => {
      setFlashKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, 1500)
  }

  function toggleGroup(g: LibraryMuscleGroup) {
    setOpenGroup((prev) => (prev === g ? null : g))
    setOpenSegment(null)
    setHoveredWorkout(null)
  }

  function handleAdd(lib: LibraryWorkout) {
    onAdd(lib)
    flash(lib.id)
  }

  function handleQuickAssign(lib: LibraryWorkout, day: string) {
    onQuickAssign(lib, day)
    flash(`${lib.id}-${day}`)
  }

  function handleDragStart(e: React.DragEvent, lib: LibraryWorkout) {
    e.dataTransfer.setData("text/library-workout-id", lib.id)
    e.dataTransfer.effectAllowed = "copy"
  }

  // Muscle groups visible under the current segment filter
  const visibleGroups = LIBRARY_MUSCLE_GROUPS.filter((g) => {
    if (!segmentFilter) return true
    return LIBRARY_WORKOUTS.some((w) => w.muscleGroup === g && w.segment === segmentFilter)
  })

  const panelWorkouts =
    openGroup && openSegment
      ? LIBRARY_WORKOUTS.filter(
          (w) =>
            w.muscleGroup === openGroup &&
            w.segment === openSegment &&
            (!segmentFilter || w.segment === segmentFilter)
        )
      : null

  const showPanel = panelWorkouts !== null
  // Once the panel has been opened, keep the drawer wide so hovering back to
  // the left nav doesn't collapse the right column.
  const [panelEverOpened, setPanelEverOpened] = useState(false)
  if (showPanel && !panelEverOpened) setPanelEverOpened(true)
  // Reset when drawer closes
  const drawerWide = open && (showPanel || panelEverOpened)

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
      >
        <Library className="size-3.5" />
        Library
        <ChevronDown className="size-3" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={closeAll}
          aria-hidden="true"
        />
      )}

      {/* Full-height side drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 top-0 z-50 flex flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out",
          drawerWide ? "w-[640px]" : "w-72",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ── Header: title + Done button + segment filter pills ── */}
        <div className="shrink-0 border-b border-border px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Workout Library
            </p>
            <button
              type="button"
              onClick={closeAll}
              className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              <X className="size-3.5" />
              Done
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => { setSegmentFilter(null); setOpenSegment(null); setHoveredWorkout(null) }}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                segmentFilter === null
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              All
            </button>
            {LIBRARY_SEGMENTS.map((seg) => (
              <button
                key={seg}
                type="button"
                onClick={() => {
                  setSegmentFilter((prev) => (prev === seg ? null : seg))
                  setOpenSegment(null)
                  setHoveredWorkout(null)
                }}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  segmentFilter === seg ? SEGMENT_ACTIVE[seg] : SEGMENT_BG[seg]
                )}
              >
                {seg}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body: two-column flex, fills remaining height ── */}
        <div className="flex min-h-0 flex-1">
          {/* Left: recently used + accordion nav */}
          <div className={cn("flex flex-col border-r border-border", drawerWide ? "w-60" : "w-full")}>
            <div className="flex-1 overflow-y-auto p-1.5">
                {/* Muscle group accordion */}
                {visibleGroups.map((group) => {
                  const groupWorkouts = LIBRARY_WORKOUTS.filter(
                    (w) => w.muscleGroup === group && (!segmentFilter || w.segment === segmentFilter)
                  )
                  if (groupWorkouts.length === 0) return null
                  const isGroupOpen = openGroup === group
                  return (
                    <div key={group}>
                      <button
                        type="button"
                        onMouseEnter={() => toggleGroup(group)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        {group}
                        <ChevronDown
                          className={cn(
                            "size-3.5 text-muted-foreground transition-transform",
                            isGroupOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {isGroupOpen && (
                        <div className="mb-1 ml-2 border-l border-border pl-2">
                          {LIBRARY_SEGMENTS.map((seg) => {
                            if (segmentFilter && seg !== segmentFilter) return null
                            const segWorkouts = groupWorkouts.filter((w) => w.segment === seg)
                            if (segWorkouts.length === 0) return null
                            const isSegOpen = openSegment === seg
                            return (
                              <button
                                key={seg}
                                type="button"
                                onMouseEnter={() => { setOpenSegment(seg); setHoveredWorkout(null) }}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition-colors hover:bg-accent",
                                  isSegOpen && "bg-accent"
                                )}
                              >
                                <span className={cn("text-xs font-medium", SEGMENT_COLORS[seg])}>
                                  {seg}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {segWorkouts.length}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Right: workout list with drag + quick-assign */}
          {showPanel && (
            <div className="flex min-w-0 flex-1 flex-col">
              <p className={cn("shrink-0 px-4 py-2.5 text-[11px] font-semibold border-b border-border", SEGMENT_COLORS[openSegment!])}>
                {openGroup} — {openSegment}
              </p>
              <div className="flex-1 overflow-y-auto p-1.5">
                  {panelWorkouts.map((lib) => {
                    const isHovered = hoveredWorkout?.id === lib.id
                    const isAdded = flashKeys.has(lib.id)
                    return (
                      <div
                        key={lib.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lib)}
                        className="group"
                        onMouseEnter={(e) => {
                          setHoveredWorkout(lib)
                          setHoveredRect((e.currentTarget as HTMLElement).getBoundingClientRect())
                        }}
                        onMouseLeave={() => { setHoveredWorkout(null); setHoveredRect(null) }}
                      >
                        <div
                          className={cn(
                            "flex w-full items-start gap-2 rounded-md px-3 py-2 transition-colors",
                            isAdded ? "bg-[hsl(var(--status-optimal-bg))] dark:bg-[hsl(var(--trend-up) / 30)]" : isHovered && "bg-accent"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleAdd(lib)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <span className={cn("block truncate text-sm font-medium", isAdded ? "text-[hsl(var(--status-optimal-fg))] dark:text-[hsl(var(--status-optimal-fg))]" : "text-foreground")}>
                                  {lib.name}
                                  {isAdded && <Check className="ml-1.5 inline size-3 text-[hsl(var(--status-optimal-fg))]" />}
                                </span>
                                <span className="mt-0.5 block text-[10px] leading-relaxed text-muted-foreground">
                                  {lib.exercises.map((ex) => ex.name).join(" · ")}
                                </span>
                              </button>
                              {/* Quick-assign day pills on hover */}
                              {isHovered && (
                                <div className="flex shrink-0 items-center gap-0.5">
                                  {DAYS_SHORT.map((d) => {
                                    const dayFlashed = flashKeys.has(`${lib.id}-${d}`)
                                    return (
                                      <button
                                        key={d}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleQuickAssign(lib, d) }}
                                        title={`Assign to ${d}`}
                                        className={cn(
                                          "rounded border px-1 py-0.5 text-[9px] font-bold transition-colors",
                                          dayFlashed
                                            ? "border-[hsl(var(--status-optimal-fg))] bg-[hsl(var(--trend-up))] text-white"
                                            : "border-border bg-background text-muted-foreground hover:border-foreground hover:bg-foreground hover:text-background"
                                        )}
                                      >
                                        {d.slice(0, 2)}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Portal-based hover card — renders outside scroll container */}
                        {isHovered && hoveredRect && (
                          <WorkoutHoverPortal lib={lib} anchorRect={hoveredRect} />
                        )}
                      </div>
                    )
                  })}
                </div>
            </div>
          )}
        </div>

        {/* ── Footer: allocated days summary ── */}
        <div className="shrink-0 border-t border-border bg-card px-4 py-3">
          {editingWorkout ? (
            /* ── Inline edit panel ── */
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "size-2 shrink-0 rounded-full",
                    (() => {
                      const seg = editingWorkout.workout.segment ?? segmentFromName(editingWorkout.workout.name)
                      return seg === "Warm Up" ? "bg-[hsl(var(--status-attention-fg))]" : seg === "Main Block" ? "bg-[hsl(var(--tag-inbody-fg))]" : "bg-[hsl(var(--trend-up))]"
                    })()
                  )} />
                  <p className="text-xs font-semibold text-foreground">{editingWorkout.workout.name}</p>
                  <span className="text-[10px] text-muted-foreground">— {editingWorkout.day}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onEditScheduledWorkout(editingWorkout.workout.id, draftExercises)
                      setEditingWorkout(null)
                      setDraftExercises([])
                    }}
                    className="flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background transition-colors hover:opacity-80"
                  >
                    <Check className="size-3" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingWorkout(null); setDraftExercises([]) }}
                    className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent"
                  >
                    <X className="size-3" />
                    Cancel
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-border bg-background p-2">
                {draftExercises.map((ex, ei) => (
                  <div key={ei} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                    <span className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      ex.mode === "strength" ? "bg-[hsl(var(--tag-inbody-fg))]" : "bg-[hsl(var(--status-normal-fg))]"
                    )} />
                    <span className="flex-1 text-xs text-foreground">{ex.name}</span>
                    <input
                      type="text"
                      value={ex.prescription}
                      onChange={(e) => {
                        const val = e.target.value
                        setDraftExercises((prev) =>
                          prev.map((item, idx) => idx === ei ? { ...item, prescription: val } : item)
                        )
                      }}
                      className="w-24 rounded border border-border bg-background px-1.5 py-0.5 text-right text-[11px] tabular-nums text-foreground outline-none focus:border-foreground focus:ring-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Chips view ── */
            <>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Week allocation
              </p>
              <div className="flex flex-col gap-1.5">
                {DAYS_SHORT.map((day) => {
                  const dayWorkouts = weekSchedule[day] ?? []
                  return (
                    <div key={day} className="flex items-start gap-2">
                      <span className="w-8 shrink-0 pt-0.5 text-[10px] font-bold text-muted-foreground">
                        {day}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dayWorkouts.length === 0 ? (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        ) : (
                          dayWorkouts.map((w, i) => {
                            const chipKey = `${day}-${i}`
                            const isHovered = hoveredChip === chipKey
                            const seg = w.segment ?? segmentFromName(w.name)
                            const segColor =
                              seg === "Warm Up"
                                ? "bg-[hsl(var(--status-attention-bg))] border-[hsl(var(--status-attention-fg))] text-[hsl(var(--status-attention-fg))]"
                                : seg === "Main Block"
                                ? "bg-[hsl(var(--tag-inbody-bg))] border-[hsl(var(--tag-inbody-fg))] text-[hsl(var(--tag-inbody-fg))]"
                                : seg === "Active Recovery"
                                ? "bg-[hsl(var(--status-optimal-bg))] border-[hsl(var(--status-optimal-fg))] text-[hsl(var(--status-optimal-fg))]"
                                : "bg-muted border-border text-muted-foreground"
                            return (
                              <div
                                key={i}
                                className="group relative flex items-center gap-0.5"
                                onMouseEnter={() => setHoveredChip(chipKey)}
                                onMouseLeave={() => setHoveredChip(null)}
                              >
                                {/* Chip label */}
                                <span className={cn(
                                  "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                  segColor
                                )}>
                                  {w.name}
                                </span>
                                {/* Edit button */}
                                <button
                                  type="button"
                                  title="Edit exercises"
                                  onClick={() => {
                                    setEditingWorkout({ workout: w, day })
                                    setDraftExercises(w.exercises.map((ex) => ({ ...ex })))
                                  }}
                                  className="hidden rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground group-hover:flex"
                                >
                                  <Pencil className="size-2.5" />
                                </button>
                                {/* Remove button */}
                                <button
                                  type="button"
                                  title="Remove from schedule"
                                  onClick={() => onRemoveScheduledWorkout(day, w.id)}
                                  className="hidden rounded p-0.5 text-muted-foreground transition-colors hover:bg-[hsl(var(--status-critical-bg))] hover:text-[hsl(var(--status-critical-fg))] group-hover:flex"
                                >
                                  <X className="size-2.5" />
                                </button>
                                {/* Exercise tooltip on hover */}
                                {isHovered && w.exercises.length > 0 && (
                                  <div className="absolute bottom-full left-0 z-50 mb-1.5 min-w-[200px] rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                                    <p className="mb-1.5 text-[10px] font-semibold text-muted-foreground">
                                      {w.name}
                                    </p>
                                    {w.exercises.map((ex, ei) => (
                                      <div key={ei} className="flex items-center gap-2 py-0.5">
                                        <span className={cn(
                                          "size-1.5 shrink-0 rounded-full",
                                          ex.mode === "strength" ? "bg-[hsl(var(--tag-inbody-fg))]" : "bg-[hsl(var(--status-normal-fg))]"
                                        )} />
                                        <span className="flex-1 text-xs text-foreground">{ex.name}</span>
                                        <span className="text-[10px] tabular-nums text-muted-foreground">{ex.prescription}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  WorkoutBar                                                         */
/* ------------------------------------------------------------------ */
export function WorkoutBar({
  workouts,
  onDragStart,
  onUpdateExercise,
  onDeleteWorkout,
  onEditWorkout,
  onDuplicateWorkout,
  onAddFromLibrary,
  onDropExercise,
  onQuickAssign,
  weekSchedule,
  onEditScheduledWorkout,
  onRemoveScheduledWorkout,
  onLoadCoachWorkouts,
}: WorkoutBarProps) {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [coachDropdownOpen, setCoachDropdownOpen] = useState(false)

  function handleSelectCoach(coach: Coach | null) {
    setSelectedCoach(coach)
    setCoachDropdownOpen(false)
    onLoadCoachWorkouts(coach ? coach.workouts : [])
  }
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [libraryOpen, setLibraryOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return

    el.addEventListener("scroll", checkScroll, { passive: true })

    // Trap wheel events so they scroll the container, not the page
    function onWheel(e: WheelEvent) {
      const { scrollLeft, scrollWidth, clientWidth } = el!
      const atLeft  = scrollLeft === 0
      const atRight = scrollLeft + clientWidth >= scrollWidth - 1
      // Only intercept if there's somewhere to scroll or the user is scrolling horizontally
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      if (isHorizontal || (!atLeft && e.deltaY < 0) || (!atRight && e.deltaY > 0)) {
        e.preventDefault()
        el!.scrollLeft += isHorizontal ? e.deltaX : e.deltaY
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false })

    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)

    return () => {
      el.removeEventListener("scroll", checkScroll)
      el.removeEventListener("wheel", onWheel)
      ro.disconnect()
    }
  }, [checkScroll, workouts])

  function scrollBy(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" })
  }

  const allSelected =
    workouts.length > 0 && selectedIds.size === workouts.length

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(workouts.map((w) => w.id)))
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleCardDragStart(e: React.DragEvent, workoutId: string) {
    // If this card is part of a selection, drag all selected; otherwise single
    const ids =
      selectedIds.has(workoutId) && selectedIds.size > 1
        ? [...selectedIds]
        : [workoutId]

    if (ids.length > 1) {
      e.dataTransfer.setData("text/workout-ids", JSON.stringify(ids))
    } else {
      e.dataTransfer.setData("text/workout-id", ids[0])
    }
    onDragStart(e, workoutId)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <section className="surface-card p-5">
      <header className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        <ClipboardList className="h-3.5 w-3.5" /> Workouts
      </header>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">

          {/* Coach selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCoachDropdownOpen((v) => !v)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCoach
                  ? "border-foreground/30 bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              {selectedCoach ? (
                <>
                  <span className="flex size-5 items-center justify-center rounded-full bg-background/20 text-[9px] font-bold">
                    {selectedCoach.avatar}
                  </span>
                  {selectedCoach.name}
                </>
              ) : (
                <>
                  <User className="size-3.5" />
                  Select coach
                </>
              )}
              <ChevronDown className="size-3 opacity-60" />
            </button>

            {coachDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-2xl border border-[hsl(var(--surface-border))] bg-background shadow-[var(--shadow-pop)]">
                {/* Clear selection */}
                {selectedCoach && (
                  <button
                    type="button"
                    onClick={() => handleSelectCoach(null)}
                    className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
                  >
                    <X className="size-3" />
                    Clear selection
                  </button>
                )}
                {COACHES.map((coach) => (
                  <button
                    key={coach.id}
                    type="button"
                    onClick={() => handleSelectCoach(coach)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent",
                      selectedCoach?.id === coach.id && "bg-accent"
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                      {coach.avatar}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground">{coach.name}</span>
                      <span className="text-[10px] text-muted-foreground">{coach.specialty}</span>
                    </div>
                    {selectedCoach?.id === coach.id && (
                      <Check className="ml-auto size-3.5 text-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Workout library dropdown */}
          <LibraryDropdown
  onAdd={onAddFromLibrary}
  onQuickAssign={onQuickAssign}
  weekSchedule={weekSchedule}
  onEditScheduledWorkout={onEditScheduledWorkout}
  onRemoveScheduledWorkout={onRemoveScheduledWorkout}
/>

          {workouts.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className={cn(
                "rounded-full border px-3 py-0.5 text-xs font-medium transition-colors",
                allSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          )}

          {selectedIds.size > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} selected — drag any card onto a day to add all
            </span>
          )}
        </div>

        {workouts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-center">
            <ClipboardList className="size-7 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No workouts saved yet
            </p>
            <p className="text-xs text-muted-foreground/60">
              Select exercises above, then click Save to create your first workout.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Left arrow */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollBy("left")}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex size-7 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-accent transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="size-4 text-muted-foreground" />
              </button>
            )}
            {/* Right arrow */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollBy("right")}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 flex size-7 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-accent transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            )}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth py-1 pb-2 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {workouts.map((w) => (
              <div key={w.id} className="relative shrink-0">
                {/* Selection checkbox ring */}
                <button
                  type="button"
                  onClick={() => toggleSelect(w.id)}
                  aria-label={`${selectedIds.has(w.id) ? "Deselect" : "Select"} ${w.name}`}
                  className={cn(
                    "absolute -top-2 left-1/2 z-20 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border text-[10px] font-bold shadow-sm transition-all",
                    selectedIds.has(w.id)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground opacity-0 hover:opacity-100"
                  )}
                >
                  {selectedIds.has(w.id) ? "✓" : "○"}
                </button>

                <div
                  className={cn(
                    "transition-all",
                    selectedIds.has(w.id) && "ring-2 ring-foreground/30 rounded-lg"
                  )}
                >
  <WorkoutCard
    workout={w}
    onDragStart={(e) => handleCardDragStart(e, w.id)}
    onUpdateExercise={onUpdateExercise}
    onDeleteWorkout={() => onDeleteWorkout(w.id)}
    onEditWorkout={(exercises) => onEditWorkout(w.id, exercises)}
    onDuplicate={() => onDuplicateWorkout(w.id)}
    onDropExercise={(exerciseId, mode, prescription) =>
      onDropExercise(w.id, exerciseId, mode, prescription)
    }
  />
                </div>
              </div>
            ))}
          </div>
          </div>
        )}
      </div>
    </section>
  )
}
