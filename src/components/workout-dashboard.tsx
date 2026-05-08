import { useState, useCallback, useMemo } from "react"
import { ExercisePicker } from "@/components/exercise-picker"
import { WorkoutBar } from "@/components/workout-bar"
import { WeeklySchedule } from "@/components/weekly-schedule"

import { Send } from "lucide-react"
import type {
  Workout,
  WeekSchedule,
  ExerciseMode,
  SelectedExercise,
  Company,
} from "@/lib/workout-data"
import {
  MOCK_EXERCISES,
  MOCK_ATHLETES,
  COMPANIES,
  MODE_PRESETS,
  WORKOUT_COLORS,
  LIBRARY_WORKOUTS,
  createEmptyWeek,
  segmentFromName,
} from "@/lib/workout-data"
import type { LibraryWorkout, SavedPlan } from "@/lib/workout-data"

export function WorkoutDashboard({ initialSchedule }: { initialSchedule?: WeekSchedule }) {
  /* ---- Company filter ---- */
  const [selectedCompany, setSelectedCompany] = useState<Company>(COMPANIES[0])

  const filteredAthletes = useMemo(
    () => MOCK_ATHLETES.filter((a) => a.company === selectedCompany),
    [selectedCompany]
  )

  /* ---- Athlete selector ---- */
  const [selectedAthleteId, setSelectedAthleteId] = useState(
    MOCK_ATHLETES[0].id
  )

  // When company changes, auto-select the first athlete of that company
  const handleCompanyChange = useCallback((company: Company) => {
    setSelectedCompany(company)
    const first = MOCK_ATHLETES.find((a) => a.company === company)
    if (first) setSelectedAthleteId(first.id)
  }, [])

  const selectedAthlete = useMemo(
    () => MOCK_ATHLETES.find((a) => a.id === selectedAthleteId)!,
    [selectedAthleteId]
  )

  /* ---- Per-athlete schedules ---- */
  const [athleteSchedules, setAthleteSchedules] = useState<
    Record<string, WeekSchedule>
  >(() => {
    const base = Object.fromEntries(MOCK_ATHLETES.map((a) => [a.id, createEmptyWeek()]))
    if (initialSchedule) base[MOCK_ATHLETES[0].id] = initialSchedule
    return base
  })

  const weekSchedule = athleteSchedules[selectedAthleteId] ?? createEmptyWeek()

  /* ---- Exercise Picker state ---- */
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [exerciseModes, setExerciseModes] = useState<Map<string, ExerciseMode>>(new Map())
  const [prescriptions, setPrescriptions] = useState<Map<string, string>>(new Map())

  /* ---- Saved workouts (shared across athletes) ---- */
  const [workouts, setWorkouts] = useState<Workout[]>([])

  /* ---- Color tracker ---- */
  const [colorIndex, setColorIndex] = useState(0)

  /* ---- Handlers ---- */

  const handleSetMode = useCallback((id: string, mode: ExerciseMode) => {
    setExerciseModes((prev) => {
      const next = new Map(prev)
      if (mode == null) {
        next.delete(id)
      } else {
        next.set(id, mode)
      }
      return next
    })
  }, [])

  const handleSetPrescription = useCallback((id: string, prescription: string) => {
    setPrescriptions((prev) => {
      const next = new Map(prev)
      next.set(id, prescription)
      return next
    })
  }, [])

  const handleSaveWorkout = useCallback((name: string) => {
    if (!name.trim()) return

    const exercises: SelectedExercise[] = MOCK_EXERCISES.filter(
      (e) => exerciseModes.has(e.id) && exerciseModes.get(e.id) != null
    ).map((e) => {
      const mode = exerciseModes.get(e.id)!
      const defaultPrescription = MODE_PRESETS[mode].prescription
      return { ...e, mode, prescription: prescriptions.get(e.id) ?? defaultPrescription }
    })

    const newWorkout: Workout = {
      id: `wk-${Date.now()}`,
      name: name.trim(),
      color: String(colorIndex % WORKOUT_COLORS.length),
      exercises,
      segment: segmentFromName(name.trim()),
    }

    setWorkouts((prev) => [...prev, newWorkout])
    setColorIndex((i) => i + 1)
    setExerciseModes(new Map())
    setPrescriptions(new Map())
  }, [exerciseModes, prescriptions, colorIndex])

  const handleDeleteWorkout = useCallback(
    (workoutId: string) => {
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId))
      // Also remove from all athlete schedules
      setAthleteSchedules((prev) => {
        const next = { ...prev }
        for (const athId of Object.keys(next)) {
          const sched = next[athId]
          const updated = { ...sched }
          for (const day of Object.keys(updated)) {
            updated[day] = updated[day].filter((w) => w.id !== workoutId)
          }
          next[athId] = updated
        }
        return next
      })
    },
    []
  )

  const handleUpdateExercise = useCallback(
    (workoutId: string, exerciseId: string, prescription: string) => {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId
            ? {
                ...w,
                exercises: w.exercises.map((ex) =>
                  ex.id === exerciseId ? { ...ex, prescription } : ex
                ),
              }
            : w
        )
      )
      setAthleteSchedules((prev) => {
        const next = { ...prev }
        for (const athId of Object.keys(next)) {
          const sched = { ...next[athId] }
          for (const day of Object.keys(sched)) {
            sched[day] = sched[day].map((w) =>
              w.id === workoutId
                ? {
                    ...w,
                    exercises: w.exercises.map((ex) =>
                      ex.id === exerciseId ? { ...ex, prescription } : ex
                    ),
                  }
                : w
            )
          }
          next[athId] = sched
        }
        return next
      })
    },
    []
  )

  const handleDuplicateWorkout = useCallback((workoutId: string) => {
    setWorkouts((prev) => {
      const source = prev.find((w) => w.id === workoutId)
      if (!source) return prev
      const copy: Workout = {
        ...source,
        id: `wk-${Date.now()}`,
        color: String(colorIndex % WORKOUT_COLORS.length),
      }
      const idx = prev.findIndex((w) => w.id === workoutId)
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
    setColorIndex((i) => i + 1)
  }, [colorIndex])

  const handleAddFromLibrary = useCallback((lib: LibraryWorkout) => {
    const exercises: SelectedExercise[] = lib.exercises.map((ex, i) => ({
      id: `${lib.id}-ex-${i}`,
      name: ex.name,
      category: "",
      mode: ex.mode,
      prescription: ex.prescription,
    }))
    const newWorkout: Workout = {
      id: `wk-${Date.now()}`,
      name: lib.name,
      color: String(colorIndex % WORKOUT_COLORS.length),
      exercises,
      segment: lib.segment === "Active Recovery" ? "Active Recovery" : lib.segment === "Warm Up" ? "Warm Up" : "Main Block",
    }
    setWorkouts((prev) => [...prev, newWorkout])
    setColorIndex((i) => i + 1)
  }, [colorIndex])

  const handleDropLibraryWorkout = useCallback((day: string, libId: string) => {
    const lib = LIBRARY_WORKOUTS.find((w) => w.id === libId)
    if (!lib) return
    const exercises: SelectedExercise[] = lib.exercises.map((ex, i) => ({
      id: `${lib.id}-drop-${Date.now()}-${i}`,
      name: ex.name,
      category: "",
      mode: ex.mode,
      prescription: ex.prescription,
    }))
    const newWorkout: Workout = {
      id: `wk-lib-${Date.now()}`,
      name: lib.name,
      color: String(colorIndex % WORKOUT_COLORS.length),
      exercises,
      segment: lib.segment === "Active Recovery" ? "Active Recovery" : lib.segment === "Warm Up" ? "Warm Up" : "Main Block",
    }
    setAthleteSchedules((prev) => ({
      ...prev,
      [selectedAthleteId]: {
        ...prev[selectedAthleteId],
        [day]: [...(prev[selectedAthleteId]?.[day] ?? []), newWorkout],
      },
    }))
    setColorIndex((i) => i + 1)
  }, [colorIndex, selectedAthleteId])

  const handleQuickAssign = useCallback((lib: LibraryWorkout, day: string) => {
    const exercises: SelectedExercise[] = lib.exercises.map((ex, i) => ({
      id: `${lib.id}-qa-${Date.now()}-${i}`,
      name: ex.name,
      category: "",
      mode: ex.mode,
      prescription: ex.prescription,
    }))
    const newWorkout: Workout = {
      id: `wk-qa-${Date.now()}`,
      name: lib.name,
      color: String(colorIndex % WORKOUT_COLORS.length),
      exercises,
      segment: lib.segment === "Active Recovery" ? "Active Recovery" : lib.segment === "Warm Up" ? "Warm Up" : "Main Block",
    }
    setAthleteSchedules((prev) => ({
      ...prev,
      [selectedAthleteId]: {
        ...prev[selectedAthleteId],
        [day]: [...(prev[selectedAthleteId]?.[day] ?? []), newWorkout],
      },
    }))
    setColorIndex((i) => i + 1)
  }, [colorIndex, selectedAthleteId])

  const handleDragStart = useCallback(
    (e: React.DragEvent, workoutId: string) => {
      e.dataTransfer.setData("text/workout-id", workoutId)
      e.dataTransfer.effectAllowed = "copy"
    },
    []
  )

  const handleLoadPlan = useCallback(
    (plan: SavedPlan) => {
      const newSchedule = createEmptyWeek()
      for (const [day, dayWorkouts] of Object.entries(plan.schedule)) {
        if (!dayWorkouts) continue
        newSchedule[day] = dayWorkouts.map((w, wi) => ({
          id: `plan-${plan.id}-${day}-${wi}-${Date.now()}`,
          name: w.name,
          color: w.color,
          exercises: w.exercises,
        }))
      }
      setAthleteSchedules((prev) => ({
        ...prev,
        [selectedAthleteId]: newSchedule,
      }))
    },
    [selectedAthleteId]
  )

  const handleDropExercise = useCallback(
    (workoutId: string, exerciseId: string, mode: string, prescription: string) => {
      const exercise = MOCK_EXERCISES.find((e) => e.id === exerciseId)
      if (!exercise) return
      const newEx: SelectedExercise = {
        ...exercise,
        mode: mode as "strength" | "timed",
        prescription,
      }
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id !== workoutId) return w
          // Avoid duplicates
          if (w.exercises.some((ex) => ex.id === exerciseId)) return w
          return { ...w, exercises: [...w.exercises, newEx] }
        })
      )
    },
    []
  )

  const handleDropWorkout = useCallback(
    (day: string, workoutId: string) => {
      const workout = workouts.find((w) => w.id === workoutId)
      if (!workout) return
      // Add to schedule
      setAthleteSchedules((prev) => ({
        ...prev,
        [selectedAthleteId]: {
          ...prev[selectedAthleteId],
          [day]: [...(prev[selectedAthleteId]?.[day] ?? []), { ...workout }],
        },
      }))
      // Remove from workout bar
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId))
    },
    [workouts, selectedAthleteId]
  )

  const handleRemoveWorkout = useCallback(
    (day: string, index: number) => {
      setAthleteSchedules((prev) => ({
        ...prev,
        [selectedAthleteId]: {
          ...prev[selectedAthleteId],
          [day]: (prev[selectedAthleteId]?.[day] ?? []).filter(
            (_, i) => i !== index
          ),
        },
      }))
    },
    [selectedAthleteId]
  )

  const handleReorderWorkout = useCallback(
    (day: string, fromIndex: number, toIndex: number) => {
      setAthleteSchedules((prev) => {
        const list = [...(prev[selectedAthleteId]?.[day] ?? [])]
        const [moved] = list.splice(fromIndex, 1)
        list.splice(toIndex, 0, moved)
        return {
          ...prev,
          [selectedAthleteId]: {
            ...prev[selectedAthleteId],
            [day]: list,
          },
        }
      })
    },
    [selectedAthleteId]
  )

  const handleMoveWorkout = useCallback(
    (fromDay: string, fromIndex: number, toDay: string) => {
      setAthleteSchedules((prev) => {
        const sched = { ...prev[selectedAthleteId] }
        const fromList = [...(sched[fromDay] ?? [])]
        const [moved] = fromList.splice(fromIndex, 1)
        const toList = [...(sched[toDay] ?? []), moved]
        return {
          ...prev,
          [selectedAthleteId]: {
            ...sched,
            [fromDay]: fromList,
            [toDay]: toList,
          },
        }
      })
    },
    [selectedAthleteId]
  )

  const handleCopyScheduleFrom = useCallback(
    (fromAthleteId: string) => {
      setAthleteSchedules((prev) => ({
        ...prev,
        [selectedAthleteId]: { ...prev[fromAthleteId] },
      }))
    },
    [selectedAthleteId]
  )

  const handleRemoveScheduledWorkout = useCallback(
    (day: string, workoutId: string) => {
      setAthleteSchedules((prev) => {
        const next = { ...prev }
        for (const athId of Object.keys(next)) {
          const sched = { ...next[athId] }
          sched[day] = (sched[day] ?? []).filter((w) => w.id !== workoutId)
          next[athId] = sched
        }
        return next
      })
    },
    []
  )

  const handleEditWorkout = useCallback(
    (workoutId: string, exercises: SelectedExercise[]) => {
      setWorkouts((prev) =>
        prev.map((w) => (w.id === workoutId ? { ...w, exercises } : w))
      )
      // Sync all athlete schedules
      setAthleteSchedules((prev) => {
        const next = { ...prev }
        for (const athId of Object.keys(next)) {
          const sched = { ...next[athId] }
          for (const day of Object.keys(sched)) {
            sched[day] = sched[day].map((w) =>
              w.id === workoutId ? { ...w, exercises } : w
            )
          }
          next[athId] = sched
        }
        return next
      })
    },
    []
  )

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Slim context caption — full Company/Athlete switching lives in the global TopNav */}
      <div className="flex items-center justify-end text-xs text-muted-foreground">
        <span>
          Schedule for{" "}
          <span className="font-semibold text-foreground">
            {selectedAthlete?.name}
          </span>
          <span className="mx-2 opacity-40">·</span>
          <span>{selectedCompany}</span>
        </span>
      </div>

      {/* Section 1: Exercise Picker */}
      <ExercisePicker
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        exerciseModes={exerciseModes}
        prescriptions={prescriptions}
        onSetMode={handleSetMode}
        onSetPrescription={handleSetPrescription}
        onSave={handleSaveWorkout}
      />

      {/* Section 2: Workouts Bar */}
      <WorkoutBar
        workouts={workouts}
        onDragStart={handleDragStart}
        onUpdateExercise={handleUpdateExercise}
        onDeleteWorkout={handleDeleteWorkout}
        onEditWorkout={handleEditWorkout}
        onDuplicateWorkout={handleDuplicateWorkout}
        onAddFromLibrary={handleAddFromLibrary}
        onDropExercise={handleDropExercise}
        onQuickAssign={handleQuickAssign}
        weekSchedule={weekSchedule}
        onEditScheduledWorkout={handleEditWorkout}
        onRemoveScheduledWorkout={handleRemoveScheduledWorkout}
        onLoadCoachWorkouts={(coachWorkouts) => setWorkouts(coachWorkouts)}
      />

      {/* Section 3: Weekly Schedule */}
      <WeeklySchedule
        weekSchedule={weekSchedule}
        selectedAthleteId={selectedAthleteId}
        onDropWorkout={handleDropWorkout}
        onRemoveWorkout={handleRemoveWorkout}
        onReorderWorkout={handleReorderWorkout}
        onMoveWorkout={handleMoveWorkout}
        onCopyScheduleFrom={handleCopyScheduleFrom}
        onLoadPlan={handleLoadPlan}
        onDropLibraryWorkout={handleDropLibraryWorkout}
      />

      {/* Publish button — shared primary pill */}
      <div className="border-t border-[hsl(var(--surface-border))] pt-5">
        <button className="btn-primary-pill">
          <Send className="size-4" />
          Publish plan
        </button>
      </div>
    </div>
  )
}
