

import { useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  ImageIcon,
  Sparkles,
  Trash2,
  GripVertical,
  LayoutList,
  ArrowDown,
  Copy,
  BookOpen,
  ChevronDown,
  Moon,
  PlayCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Workout, WeekSchedule, SavedPlan } from "@/lib/workout-data"
import { DAYS, WORKOUT_COLORS, MOCK_ATHLETES } from "@/lib/workout-data"
import { PlanPickerDialog } from "@/components/plan-picker-dialog"

const EXERCISE_GIFS: Record<string, string> = {
  // Legs
  "Back Squat":             "https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif",
  "Front Squat":            "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Romanian Deadlift":      "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
  "Leg Press":              "https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif",
  "Walking Lunge":          "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  "Reverse Lunge":          "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  "Bulgarian Split Squat":  "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
  "Glute Bridge":           "https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif",
  "Hip Thrust":             "https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif",
  "Calf Raise":             "https://media.giphy.com/media/xT9IgG50Lg7russBDa/giphy.gif",
  "Leg Curl":               "https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif",
  "Step Up":                "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
  "Goblet Squat":           "https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif",
  // Biceps
  "Barbell Curl":           "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Dumbbell Curl":          "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Hammer Curl":            "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Preacher Curl":          "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Concentration Curl":     "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Cable Curl":             "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Incline DB Curl":        "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Reverse Curl":           "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Zottman Curl":           "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "21s Curl":               "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Spider Curl":            "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Cross-Body Curl":        "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  // Triceps
  "Tricep Dip":             "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "Tricep Pushdown":        "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "Overhead Tricep Ext":    "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "Skull Crusher":          "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "Close-Grip Bench":       "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Cable Overhead Ext":     "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "Diamond Push Up":        "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Kickback":               "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "Rope Pushdown":          "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "Tate Press":             "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "JM Press":               "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Board Press":            "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  // Core
  "Plank":                  "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "Side Plank":             "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "Crunches":               "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Bicycle Crunch":         "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Dead Bug":               "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "Leg Raise":              "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Russian Twist":          "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Hollow Body Hold":       "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "Ab Rollout":             "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "Mountain Climber":       "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Mountain Climbers":      "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Pallof Press":           "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "Cable Crunch":           "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  // Back
  "Deadlift":               "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
  "Pull Up":                "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
  "Chin Up":                "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
  "Barbell Row":            "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  "Single-Arm DB Row":      "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  "Cable Row":              "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  "Lat Pulldown":           "https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif",
  "Face Pull":              "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  "Rack Pull":              "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
  "Good Morning":           "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
  "Inverted Row":           "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  "T-Bar Row":              "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  // Chest
  "Bench Press":            "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Incline Bench Press":    "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
  "Decline Bench Press":    "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Push Up":                "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Wide Push Up":           "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "DB Fly":                 "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Cable Fly":              "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Pec Deck":               "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Chest Dip":              "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "Landmine Press":         "https://media.giphy.com/media/3oriO3sR7bHN8NNENU/giphy.gif",
  "DB Pullover":            "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Incline DB Press":       "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
  // Shoulders
  "Overhead Press":         "https://media.giphy.com/media/3oriO3sR7bHN8NNENU/giphy.gif",
  "Arnold Press":           "https://media.giphy.com/media/3oriO3sR7bHN8NNENU/giphy.gif",
  "Lateral Raise":          "https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif",
  "Front Raise":            "https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif",
  "Rear Delt Fly":          "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  "Upright Row":            "https://media.giphy.com/media/3oriO3sR7bHN8NNENU/giphy.gif",
  "Cable Lateral Raise":    "https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif",
  "Shrug":                  "https://media.giphy.com/media/3oriO3sR7bHN8NNENU/giphy.gif",
  "Push Press":             "https://media.giphy.com/media/3oriO3sR7bHN8NNENU/giphy.gif",
  "Plate Front Raise":      "https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif",
  "Battle Rope":            "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  // Stretching
  "Hip Flexor Stretch":     "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  "Hamstring Stretch":      "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  "Quad Stretch":           "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  "Pigeon Pose":            "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  "Child's Pose":           "https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif",
  "Cat-Cow":                "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
  "Thoracic Rotation":      "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
  "Doorway Chest Stretch":  "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Seated Spinal Twist":    "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
  "Calf Stretch":           "https://media.giphy.com/media/xT9IgG50Lg7russBDa/giphy.gif",
  "Shoulder Cross Stretch": "https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif",
  "Neck Side Stretch":      "https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif",
  // Cardio
  "Treadmill Run":          "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
  "Rowing Machine":         "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  "Stationary Bike":        "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
  "Jump Rope":              "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Burpees":                "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Box Jumps":              "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
  "Stair Climber":          "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
  "Ski Erg":                "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  "Sprint Intervals":       "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
  "Assault Bike":           "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
  "High Knees":             "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Jumping Jacks":          "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
}

function ExercisePreviewPortal({
  name,
  category,
  anchorRect,
}: {
  name: string
  category: string
  anchorRect: DOMRect
}) {
  const gifUrl = EXERCISE_GIFS[name]
  if (!gifUrl) return null

  const CARD_W = 192
  const CARD_H = 168
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
        <img src={gifUrl} alt={`${name} demonstration`} className="h-32 w-full object-cover" />
      </div>
      <div className="px-3 py-2">
        <p className="text-xs font-semibold text-card-foreground">{name}</p>
        <p className="text-[10px] text-muted-foreground">{category}</p>
      </div>
    </div>,
    document.body
  )
}

function getColorScheme(workout: Workout) {
  const idx = Number(workout.color) % WORKOUT_COLORS.length
  return WORKOUT_COLORS[idx]
}

interface WeeklyScheduleProps {
  weekSchedule: WeekSchedule
  selectedAthleteId: string
  onDropWorkout: (day: string, workoutId: string) => void
  onRemoveWorkout: (day: string, index: number) => void
  onReorderWorkout: (day: string, fromIndex: number, toIndex: number) => void
  onMoveWorkout: (fromDay: string, fromIndex: number, toDay: string) => void
  onCopyScheduleFrom: (fromAthleteId: string) => void
  onLoadPlan: (plan: SavedPlan) => void
  onDropLibraryWorkout?: (day: string, libId: string) => void
}

/* ---- Single exercise row with hover GIF preview ---- */
function ExerciseRowPreview({ ex }: { ex: { id?: string; name: string; mode: string; prescription: string; category?: string } }) {
  const hasGif = Boolean(EXERCISE_GIFS[ex.name])
  const [preview, setPreview] = useState<DOMRect | null>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const showPreview = useCallback(() => {
    if (nameRef.current) setPreview(nameRef.current.getBoundingClientRect())
  }, [])
  const hidePreview = useCallback(() => setPreview(null), [])

  return (
    <div className="flex items-center gap-2 group/row">
      <span className={cn(
        "size-1.5 shrink-0 rounded-full",
        ex.mode === "strength" ? "bg-[hsl(var(--tag-inbody-fg))]" : ex.mode === "timed" ? "bg-[hsl(var(--status-normal-fg))]" : "bg-muted-foreground/40"
      )} />
      <span
        ref={nameRef}
        onMouseEnter={hasGif ? showPreview : undefined}
        onMouseLeave={hasGif ? hidePreview : undefined}
        className={cn(
          "flex-1 text-xs text-foreground leading-snug select-none",
          hasGif && "cursor-default underline decoration-dotted decoration-muted-foreground/40 underline-offset-2"
        )}
      >
        {ex.name}
        {hasGif && <PlayCircle className="ml-1 inline size-2.5 text-muted-foreground/30" />}
      </span>
      <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">{ex.prescription}</span>
      {preview && (
        <ExercisePreviewPortal name={ex.name} category={ex.category ?? ""} anchorRect={preview} />
      )}
    </div>
  )
}

/* ---- Scheduled card (draggable + expandable exercises) ---- */
function ScheduledWorkoutCard({
  workout,
  day,
  index,
  onRemove,
  dragOverIndex,
  setDragOverIndex,
  onReorder,
}: {
  workout: Workout
  day: string
  index: number
  onRemove: () => void
  dragOverIndex: number | null
  setDragOverIndex: (v: number | null) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}) {
  const colors = getColorScheme(workout)
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "text/reorder-source",
          JSON.stringify({ day, index })
        )
        e.dataTransfer.effectAllowed = "move"
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("text/reorder-source")) {
          e.preventDefault()
          e.stopPropagation()
          e.dataTransfer.dropEffect = "move"
          setDragOverIndex(index)
        }
      }}
      onDragLeave={() => setDragOverIndex(null)}
      onDrop={(e) => {
        if (e.dataTransfer.types.includes("text/reorder-source")) {
          e.preventDefault()
          e.stopPropagation()
          setDragOverIndex(null)
          try {
            const source = JSON.parse(e.dataTransfer.getData("text/reorder-source"))
            if (source.day === day && source.index !== index) {
              onReorder(source.index, index)
            }
          } catch { /* ignore */ }
        }
      }}
      className={cn(
        "group rounded-lg border transition-all",
        colors.bg,
        colors.border,
        dragOverIndex === index && "ring-2 ring-foreground/20 scale-[1.02]"
      )}
    >
      {/* Card header row */}
      <div
        className="flex cursor-pointer items-center gap-1.5 p-2"
        onClick={() => setExpanded((v) => !v)}
      >
        <GripVertical
          className="size-3.5 shrink-0 cursor-grab text-muted-foreground/50 group-hover:text-muted-foreground active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />

        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className={cn("relative flex size-7 shrink-0 items-center justify-center rounded-md", colors.bg)}>
            <ImageIcon className={cn("size-3.5", colors.text)} />
            <Sparkles className={cn("absolute -top-0.5 -right-0.5 size-2.5", colors.text)} />
          </div>
          <span className={cn("flex-1 truncate text-xs font-semibold leading-tight", colors.text)}>
            {workout.name}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <span className={cn("text-[10px] tabular-nums", colors.text)}>
            {workout.exercises.length}
          </span>
          <ChevronDown className={cn("size-3.5 transition-transform", colors.text, expanded && "rotate-180")} />
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="ml-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
          >
            <Trash2 className="size-3" />
            <span className="sr-only">Remove workout</span>
          </Button>
        </div>
      </div>

      {/* Expanded exercise list */}
      {expanded && (
        <div className={cn("border-t px-3 pb-3 pt-2 space-y-1.5", colors.border)}>
          {workout.exercises.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">No exercises added yet.</p>
          ) : (
            workout.exercises.map((ex, i) => (
              <ExerciseRowPreview key={ex.id ?? i} ex={ex} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ---- Rest Day card ---- */
function RestDayCard() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 bg-muted/30 px-3 py-2.5">
      <Moon className="size-3.5 shrink-0 text-muted-foreground/40" />
      <span className="text-xs font-medium text-muted-foreground/50">Rest Day</span>
    </div>
  )
}

/* ---- Day column ---- */
function DayColumn({
  day,
  workouts,
  onDrop,
  onDropLibrary,
  onRemoveWorkout,
  onReorder,
  onMove,
}: {
  day: string
  workouts: Workout[]
  onDrop: (workoutId: string) => void
  onDropLibrary?: (libId: string) => void
  onRemoveWorkout: (index: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onMove: (fromDay: string, fromIndex: number) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleDragOver(e: React.DragEvent) {
    const hasWorkout =
      e.dataTransfer.types.includes("text/workout-id") ||
      e.dataTransfer.types.includes("text/workout-ids") ||
      e.dataTransfer.types.includes("text/reorder-source") ||
      e.dataTransfer.types.includes("text/library-workout-id")
    if (hasWorkout) {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
      setIsDragOver(true)
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear if leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    setDragOverIndex(null)

    // Cross-day move: a scheduled card dragged from another day
    const reorderRaw = e.dataTransfer.getData("text/reorder-source")
    if (reorderRaw) {
      try {
        const source: { day: string; index: number } = JSON.parse(reorderRaw)
        if (source.day !== day) {
          // Move from source day into this day
          onMove(source.day, source.index)
        }
        // Same-day reorder is handled by the card's own onDrop
      } catch { /* ignore */ }
      return
    }

    // Multi-drop from workout bar
    const multiRaw = e.dataTransfer.getData("text/workout-ids")
    if (multiRaw) {
      try {
        const ids: string[] = JSON.parse(multiRaw)
        ids.forEach((id) => onDrop(id))
      } catch { /* ignore */ }
      return
    }

    // Single-drop from workout bar
    const workoutId = e.dataTransfer.getData("text/workout-id")
    if (workoutId) onDrop(workoutId)

    // Direct drag from library
    const libId = e.dataTransfer.getData("text/library-workout-id")
    if (libId && onDropLibrary) onDropLibrary(libId)
  }

  const isEmpty = workouts.length === 0

  return (
    <div
      className={cn(
        "flex min-h-64 flex-1 flex-col rounded-2xl border bg-background transition-colors",
        isDragOver ? "border-foreground/50 bg-accent/40" : "border-[hsl(var(--surface-border))]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="border-b border-[hsl(var(--surface-border))] px-3 py-2.5 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {day}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2">
        {/* Rest day card shown when nothing is scheduled */}
        {isEmpty && <RestDayCard />}

        {workouts.map((workout, idx) => (
          <ScheduledWorkoutCard
            key={`${workout.id}-${idx}`}
            workout={workout}
            day={day}
            index={idx}
            onRemove={() => onRemoveWorkout(idx)}
            dragOverIndex={dragOverIndex}
            setDragOverIndex={setDragOverIndex}
            onReorder={onReorder}
          />
        ))}

        {/* Drop zone */}
        <div
          className={cn(
            "mt-auto flex min-h-12 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            isDragOver
              ? "border-foreground/40 bg-accent"
              : "border-border/60 bg-transparent"
          )}
        >
          {isEmpty ? (
            <div className="flex flex-col items-center gap-1 py-2">
              <ArrowDown className="size-3.5 text-muted-foreground/40" />
              <span className="text-[11px] text-muted-foreground/60">Drop workout</span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/40">+ add</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- Main component ---- */
export function WeeklySchedule({
  weekSchedule,
  selectedAthleteId,
  onDropWorkout,
  onRemoveWorkout,
  onReorderWorkout,
  onMoveWorkout,
  onCopyScheduleFrom,
  onLoadPlan,
  onDropLibraryWorkout,
}: WeeklyScheduleProps) {
  const otherAthletes = MOCK_ATHLETES.filter(
    (a) => a.id !== selectedAthleteId
  )
  const [planOpen, setPlanOpen] = useState(false)

  return (
    <section className="surface-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          <LayoutList className="h-3.5 w-3.5" /> Weekly Schedule
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {/* Load plan — opens Dialog */}
          <button
            type="button"
            onClick={() => setPlanOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--surface-border))] bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <BookOpen className="size-3.5" />
            Load plan
          </button>

          <PlanPickerDialog
            open={planOpen}
            onOpenChange={setPlanOpen}
            onLoadPlan={(plan) => { onLoadPlan(plan); setPlanOpen(false) }}
          />


          {/* Copy from athlete */}
          <div className="flex items-center gap-2">
            <Copy className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Copy from:</span>
            <Select value="" onValueChange={(athId) => onCopyScheduleFrom(athId)}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Select athlete..." />
              </SelectTrigger>
              <SelectContent>
                {otherAthletes.map((ath) => (
                  <SelectItem key={ath.id} value={ath.id}>
                    <span className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
                        {ath.avatar}
                      </span>
                      {ath.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {DAYS.map((day) => (
          <DayColumn
            key={day}
            day={day}
            workouts={weekSchedule[day] ?? []}
            onDrop={(workoutId) => onDropWorkout(day, workoutId)}
            onDropLibrary={onDropLibraryWorkout ? (libId) => onDropLibraryWorkout(day, libId) : undefined}
            onRemoveWorkout={(index) => onRemoveWorkout(day, index)}
            onReorder={(from, to) => onReorderWorkout(day, from, to)}
            onMove={(fromDay, fromIndex) => onMoveWorkout(fromDay, fromIndex, day)}
          />
        ))}
      </div>
    </section>
  )
}
