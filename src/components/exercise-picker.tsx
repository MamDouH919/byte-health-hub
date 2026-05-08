

import { useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { Dumbbell, Timer, Search, ChevronDown, ChevronRight, Check, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Exercise, ExerciseMode } from "@/lib/workout-data"
import { CATEGORIES, MOCK_EXERCISES, MODE_PRESETS, WORKOUT_NAME_OPTIONS } from "@/lib/workout-data"

/**
 * Maps exercise names to publicly available animated GIF demos.
 * Source: Wger open fitness API (wger.de) — free to use.
 * Falls back to undefined (no preview shown) for unmapped exercises.
 */
const EXERCISE_GIFS: Record<string, string> = {
  // Legs
  "Back Squat":           "https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif",
  "Front Squat":          "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Romanian Deadlift":    "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
  "Leg Press":            "https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif",
  "Walking Lunge":        "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  "Hip Thrust":           "https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif",
  "Calf Raise":           "https://media.giphy.com/media/xT9IgG50Lg7russBDa/giphy.gif",
  // Back
  "Deadlift":             "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
  "Pull Up":              "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
  "Barbell Row":          "https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif",
  "Lat Pulldown":         "https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif",
  // Chest
  "Bench Press":          "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Push Up":              "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Incline Bench Press":  "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
  // Shoulders
  "Overhead Press":       "https://media.giphy.com/media/3oriO3sR7bHN8NNENU/giphy.gif",
  "Lateral Raise":        "https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif",
  "Arnold Press":         "https://media.giphy.com/media/l0HlCYggGSEQMNBLy/giphy.gif",
  // Biceps
  "Barbell Curl":         "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Dumbbell Curl":        "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "Hammer Curl":          "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  // Triceps
  "Tricep Dip":           "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
  "Tricep Pushdown":      "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Skull Crusher":        "https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif",
  // Core
  "Plank":                "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "Crunches":             "https://media.giphy.com/media/l0HlAgJTr98oNECuY/giphy.gif",
  "Bicycle Crunch":       "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Mountain Climber":     "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  // Cardio
  "Treadmill Run":        "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
  "Jump Rope":            "https://media.giphy.com/media/xT9IgxX8HjgzUGe7e8/giphy.gif",
  "Burpees":              "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
  "Box Jumps":            "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
  // Stretching
  "Pigeon Pose":          "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  "Child's Pose":         "https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif",
  "Cat-Cow":              "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
}

interface ExercisePickerProps {
  categoryFilter: string
  onCategoryChange: (value: string) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  /** Maps exercise id to its chosen mode */
  exerciseModes: Map<string, ExerciseMode>
  /** Maps exercise id to a custom prescription override */
  prescriptions: Map<string, string>
  onSetMode: (id: string, mode: ExerciseMode) => void
  onSetPrescription: (id: string, prescription: string) => void
  onSave: (name: string) => void
}

/** Portal-based preview that escapes any overflow clipping */
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

  // Position above the anchor, centred horizontally, clamped to viewport
  const CARD_W = 192
  const CARD_H = 168 // approx: 128px img + 40px label
  const GAP = 8

  let left = anchorRect.left + anchorRect.width / 2 - CARD_W / 2
  let top  = anchorRect.top - CARD_H - GAP

  // Clamp to viewport edges
  left = Math.max(8, Math.min(left, window.innerWidth  - CARD_W - 8))
  top  = Math.max(8, Math.min(top,  window.innerHeight - CARD_H - 8))

  return createPortal(
    <div
      style={{ position: "fixed", left, top, width: CARD_W, zIndex: 9999 }}
      className="pointer-events-none rounded-2xl border border-[hsl(var(--surface-border))] bg-background shadow-[var(--shadow-pop)] animate-scale-in"
    >
      <div className="overflow-hidden rounded-t-xl bg-muted">
        <img
          src={gifUrl}
          alt={`${name} demonstration`}
          className="h-32 w-full object-cover"
        />
      </div>
      <div className="px-3 py-2">
        <p className="text-xs font-semibold text-card-foreground">{name}</p>
        <p className="text-[10px] text-muted-foreground">{category}</p>
      </div>
    </div>,
    document.body
  )
}

/**
 * Parse a strength prescription like "3×10" into { sets, reps }.
 * Parse a timed prescription like "1 min" or "30 sec" into { value, unit }.
 */
function parseStrength(p: string): { sets: number; reps: number } {
  const m = p.match(/(\d+)[×x](\d+)/)
  return m ? { sets: Number(m[1]), reps: Number(m[2]) } : { sets: 3, reps: 10 }
}
function parseTimed(p: string): { groups: number; value: number; unit: "min" | "sec" } {
  // Format: "3g × 1 min" or legacy "1 min"
  const full = p.match(/(\d+)g\s*[×x]\s*(\d+)\s*(min|sec)/)
  if (full) return { groups: Number(full[1]), value: Number(full[2]), unit: full[3] as "min" | "sec" }
  const simple = p.match(/(\d+)\s*(min|sec)/)
  return simple ? { groups: 3, value: Number(simple[1]), unit: simple[2] as "min" | "sec" } : { groups: 3, value: 1, unit: "min" }
}
function formatStrength(sets: number, reps: number) { return `${sets}×${reps}` }
function formatTimed(groups: number, value: number, unit: "min" | "sec") { return `${groups}g × ${value} ${unit}` }

function PrescriptionEditor({
  mode,
  prescription,
  onChange,
}: {
  mode: "strength" | "timed"
  prescription: string
  onChange: (val: string) => void
}) {
  if (mode === "strength") {
    const { sets, reps } = parseStrength(prescription)
    return (
      <div
        className="ml-auto flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="number"
          min={1}
          value={sets}
          onChange={(e) => onChange(formatStrength(Math.max(1, Number(e.target.value) || 1), reps))}
          className="w-8 rounded border border-border bg-background text-center text-xs font-semibold text-[hsl(var(--status-optimal-fg))] tabular-nums focus:outline-none focus:ring-1 focus:ring-foreground/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Sets"
        />
        <span className="text-xs text-muted-foreground">×</span>
        <input
          type="number"
          min={1}
          value={reps}
          onChange={(e) => onChange(formatStrength(sets, Math.max(1, Number(e.target.value) || 1)))}
          className="w-8 rounded border border-border bg-background text-center text-xs font-semibold text-[hsl(var(--status-optimal-fg))] tabular-nums focus:outline-none focus:ring-1 focus:ring-foreground/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Reps"
        />
      </div>
    )
  }

  // Timed
  const { groups, value, unit } = parseTimed(prescription)
  const inputCls = "w-8 rounded border border-border bg-background text-center text-xs font-semibold text-[hsl(var(--status-optimal-fg))] tabular-nums focus:outline-none focus:ring-1 focus:ring-foreground/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
  return (
    <div
      className="ml-auto flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Groups */}
      <input
        type="number"
        min={1}
        value={groups}
        onChange={(e) => onChange(formatTimed(Math.max(1, Number(e.target.value) || 1), value, unit))}
        className={inputCls}
        aria-label="Groups"
      />
      <span className="text-[10px] text-muted-foreground">g ×</span>
      {/* Duration */}
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(formatTimed(groups, Math.max(1, Number(e.target.value) || 1), unit))}
        className={cn(inputCls, "w-9")}
        aria-label="Duration"
      />
      {/* Unit toggle */}
      <button
        type="button"
        onClick={() => {
          const newUnit = unit === "min" ? "sec" : "min"
          onChange(formatTimed(groups, newUnit === "min" ? 1 : 30, newUnit))
        }}
        className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-accent transition-colors"
      >
        {unit}
      </button>
    </div>
  )
}

function ExerciseCard({
  exercise,
  currentMode,
  prescription,
  onSetMode,
  onSetPrescription,
}: {
  exercise: Exercise
  currentMode: ExerciseMode | undefined
  prescription: string
  onSetMode: (mode: ExerciseMode) => void
  onSetPrescription: (p: string) => void
}) {
  const isSelected  = currentMode != null
  const isStrength  = currentMode === "strength"
  const isTimed     = currentMode === "timed"
  const hasGif      = Boolean(EXERCISE_GIFS[exercise.name])

  const [preview, setPreview] = useState<DOMRect | null>(null)
  const nameRef = useRef<HTMLSpanElement>(null)

  const showPreview = useCallback(() => {
    if (nameRef.current) setPreview(nameRef.current.getBoundingClientRect())
  }, [])
  const hidePreview = useCallback(() => setPreview(null), [])

  function handleDragStart(e: React.DragEvent) {
    if (!currentMode) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData("text/exercise-id", exercise.id)
    e.dataTransfer.setData("text/exercise-mode", currentMode)
    e.dataTransfer.setData("text/exercise-prescription", prescription)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div
      draggable={isSelected}
      onDragStart={handleDragStart}
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border px-3 py-2 transition-colors bg-background",
        isSelected ? "border-foreground/40 cursor-grab active:cursor-grabbing shadow-[var(--shadow-card)]" : "border-[hsl(var(--surface-border))] cursor-default"
      )}
    >
      {/* Row 1: mode buttons + exercise name */}
      <div className="flex min-w-0 items-center gap-2">
        {/* Dumbbell — strength mode */}
        <button
          type="button"
          aria-label={`Set ${exercise.name} to strength`}
          onClick={() => onSetMode(isStrength ? null : "strength")}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors",
            isStrength
              ? "border-foreground bg-foreground text-background"
              : "border-[hsl(var(--surface-border))] bg-surface text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Dumbbell className="size-3.5" />
        </button>

        {/* Timer — timed mode */}
        <button
          type="button"
          aria-label={`Set ${exercise.name} to timed`}
          onClick={() => onSetMode(isTimed ? null : "timed")}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors",
            isTimed
              ? "border-foreground bg-foreground text-background"
              : "border-[hsl(var(--surface-border))] bg-surface text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Timer className="size-3.5" />
        </button>

        {/* Exercise name — truncates so it never pushes out of bounds */}
        <span
          ref={nameRef}
          onMouseEnter={hasGif ? showPreview : undefined}
          onMouseLeave={hasGif ? hidePreview : undefined}
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-medium text-card-foreground",
            hasGif && "underline decoration-dotted decoration-muted-foreground/50 underline-offset-2"
          )}
        >
          {exercise.name}
          {hasGif && <PlayCircle className="ml-1 inline size-3 text-muted-foreground/40" />}
        </span>
      </div>

      {preview && (
        <ExercisePreviewPortal
          name={exercise.name}
          category={exercise.category}
          anchorRect={preview}
        />
      )}

      {/* Row 2: prescription editor + drag hint — only when active */}
      {isSelected && currentMode && (
        <div className="flex items-center gap-2 pl-0.5">
          <PrescriptionEditor
            mode={currentMode}
            prescription={prescription}
            onChange={onSetPrescription}
          />
          <span className="ml-auto text-[10px] text-muted-foreground/50 select-none">
            drag to workout
          </span>
        </div>
      )}
    </div>
  )
}

export function ExercisePicker({
  categoryFilter,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  exerciseModes,
  prescriptions,
  onSetMode,
  onSetPrescription,
  onSave,
}: ExercisePickerProps) {
  const [open, setOpen] = useState(false)
  const [mainBlockOpen, setMainBlockOpen] = useState(false)
  const filtered = MOCK_EXERCISES.filter((e) => {
    const matchesCategory =
      categoryFilter === "All" || e.category === categoryFilter
    const matchesSearch =
      !searchQuery ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const selectedExercises = MOCK_EXERCISES.filter(
    (e) => exerciseModes.has(e.id) && exerciseModes.get(e.id) != null
  )

  return (
    <section className="surface-card p-5">
      <header className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        <Dumbbell className="h-3.5 w-3.5" /> Exercise Picker
      </header>
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left: filter + exercise grid — min-w-0 lets flex child shrink below content width */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Filter pills + search */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mr-1">
              Filter
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  "rounded-full border px-4 py-1 text-sm font-medium transition-colors",
                  categoryFilter === cat
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground hover:bg-accent"
                )}
              >
                {cat}
              </button>
            ))}
            <div className="relative ml-auto w-48">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>

          {/* Horizontally scrollable exercise grid: 2 rows, scrolls sideways */}
          <div className="w-full overflow-x-auto pb-2">
            <div
              className="grid gap-2"
              style={{
                gridTemplateRows: "repeat(2, minmax(0, auto))",
                gridAutoFlow: "column",
                gridAutoColumns: "minmax(200px, 260px)",
                width: "max-content",
              }}
            >
              {filtered.map((exercise) => {
                const mode = exerciseModes.get(exercise.id) ?? undefined
                const defaultPrescription = mode ? MODE_PRESETS[mode].prescription : ""
                const prescription = prescriptions.get(exercise.id) ?? defaultPrescription
                return (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    currentMode={mode}
                    prescription={prescription}
                    onSetMode={(m) => onSetMode(exercise.id, m)}
                    onSetPrescription={(p) => onSetPrescription(exercise.id, p)}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: selected exercises panel — flex-shrink-0 keeps it fixed width */}
        <div className="w-full flex-shrink-0 rounded-2xl border border-[hsl(var(--surface-border))] bg-background p-4 lg:w-72">
          <h3 className="mb-3 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Added exercises
          </h3>
          {selectedExercises.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 italic">
              Select an exercise mode to add
            </p>
          ) : (
            <ul className="mb-4 flex flex-wrap gap-x-6 gap-y-1.5">
              {selectedExercises.map((ex) => {
                const mode = exerciseModes.get(ex.id)!
                const defaultPrescription = MODE_PRESETS[mode].prescription
                const prescription = prescriptions.get(ex.id) ?? defaultPrescription
                return (
                  <li key={ex.id} className="flex items-center gap-2 text-sm">
                    <span className="size-2 rounded-full bg-[hsl(var(--trend-up))]" />
                    <span className="font-medium text-foreground">
                      {ex.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({prescription})
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setMainBlockOpen(false) }}>
            <PopoverTrigger asChild>
              <Button
                disabled={selectedExercises.length === 0}
                className="flex w-full items-center justify-between gap-2 rounded-lg bg-foreground text-background hover:opacity-90"
              >
                <span>Save as</span>
                <ChevronDown className="size-4 opacity-70" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 p-1"
              align="end"
              sideOffset={6}
            >
              {/* Warm Up */}
              <button
                type="button"
                onClick={() => { onSave("Warm Up"); setOpen(false) }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Warm Up
              </button>

              {/* Main Block — hover to reveal submenu */}
              <div
                className="relative"
                onMouseEnter={() => setMainBlockOpen(true)}
                onMouseLeave={() => setMainBlockOpen(false)}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <span>Main Block</span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </button>

                {mainBlockOpen && (
                  <div className="absolute left-full top-0 z-50 ml-1 w-44 rounded-md border border-border bg-popover p-1 shadow-md">
                    <button
                      type="button"
                      onClick={() => { onSave("Main Block (Strength)"); setOpen(false); setMainBlockOpen(false) }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <Dumbbell className="size-3.5 text-[hsl(var(--tag-inbody-fg))]" />
                      Strength
                    </button>
                    <button
                      type="button"
                      onClick={() => { onSave("Main Block (Cardio)"); setOpen(false); setMainBlockOpen(false) }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <Timer className="size-3.5 text-[hsl(var(--status-normal-fg))]" />
                      Cardio
                    </button>
                  </div>
                )}
              </div>

              {/* Core Finisher */}
              <button
                type="button"
                onClick={() => { onSave("Active Recovery"); setOpen(false) }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Core Finisher
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </section>
  )
}
