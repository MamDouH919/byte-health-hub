

import { useState } from "react"
import { Check, RotateCcw, BookOpen, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { SavedPlan, PlanGoal, PlanLevel, PlanFrequency, PlanEquipment, PlanFlag } from "@/lib/workout-data"
import {
  SAVED_PLANS,
  PLAN_GOALS,
  PLAN_LEVELS,
  PLAN_FREQUENCIES,
  PLAN_EQUIPMENT,
  PLAN_FLAGS,
  getFullWeek,
} from "@/lib/workout-data"

/* ── Checkbox row ──────────────────────────────────────────────── */
function FilterRow({
  label,
  active,
  amber,
  onClick,
}: {
  label: string
  active: boolean
  amber?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors",
        active ? "bg-accent" : "hover:bg-accent/60"
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          active && amber
            ? "border-[hsl(var(--status-normal-fg))] bg-[hsl(var(--status-normal-fg))]"
            : active
            ? "border-foreground bg-foreground"
            : "border-border bg-background"
        )}
      >
        {active && (
          <Check className={cn("size-2.5", amber ? "text-white" : "text-background")} />
        )}
      </span>
      <span
        className={cn(
          "text-sm leading-tight",
          active ? "font-medium text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </button>
  )
}

/* ── Filter section ────────────────────────────────────────────── */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {title}
      </p>
      {children}
    </div>
  )
}

/* ── Main component ────────────────────────────────────────────── */
interface PlanPickerDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onLoadPlan: (plan: SavedPlan) => void
}

export function PlanPickerDialog({ open, onOpenChange, onLoadPlan }: PlanPickerDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null)
  const [filterGoal,      setFilterGoal]      = useState<PlanGoal | null>(null)
  const [filterLevel,     setFilterLevel]     = useState<PlanLevel | null>(null)
  const [filterFrequency, setFilterFrequency] = useState<PlanFrequency | null>(null)
  const [filterEquipment, setFilterEquipment] = useState<PlanEquipment | null>(null)
  const [filterFlags,     setFilterFlags]     = useState<PlanFlag[]>([])

  const activeFilterCount = [filterGoal, filterLevel, filterFrequency, filterEquipment].filter(Boolean).length + filterFlags.length

  function resetFilters() {
    setFilterGoal(null)
    setFilterLevel(null)
    setFilterFrequency(null)
    setFilterEquipment(null)
    setFilterFlags([])
    setSelectedPlan(null)
  }

  function toggleFlag(f: PlanFlag) {
    setFilterFlags(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
    setSelectedPlan(null)
  }

  function handleClose(v: boolean) {
    if (!v) {
      setSelectedPlan(null)
    }
    onOpenChange(v)
  }

  const filteredPlans = SAVED_PLANS.filter(p => {
    if (filterGoal      && p.goal      !== filterGoal)      return false
    if (filterLevel     && p.level     !== filterLevel)     return false
    if (filterFrequency && p.frequency !== filterFrequency) return false
    if (filterEquipment && p.equipment !== filterEquipment) return false
    if (filterFlags.length && !filterFlags.every(f => p.safeFor.includes(f))) return false
    return true
  })

  const fullWeek = selectedPlan ? getFullWeek(selectedPlan) : []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex gap-0 p-0 overflow-hidden"
        style={{ maxWidth: "min(88vw, 1100px)", height: "min(88vh, 720px)" }}
      >
        {/* ── Left sidebar: filters ─────────────────────────────── */}
        <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/20">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <p className="text-sm font-semibold text-foreground">Filters</p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-3" />
                Clear {activeFilterCount}
              </button>
            )}
          </div>

          {/* Filter groups */}
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">

            <FilterSection title="Goal">
              {PLAN_GOALS.map(g => (
                <FilterRow
                  key={g}
                  label={g}
                  active={filterGoal === g}
                  onClick={() => { setFilterGoal(filterGoal === g ? null : g); setSelectedPlan(null) }}
                />
              ))}
            </FilterSection>

            <FilterSection title="Experience">
              {PLAN_LEVELS.map(l => (
                <FilterRow
                  key={l}
                  label={l}
                  active={filterLevel === l}
                  onClick={() => { setFilterLevel(filterLevel === l ? null : l); setSelectedPlan(null) }}
                />
              ))}
            </FilterSection>

            <FilterSection title="Frequency / week">
              {PLAN_FREQUENCIES.map(f => (
                <FilterRow
                  key={f}
                  label={`${f} days`}
                  active={filterFrequency === f}
                  onClick={() => { setFilterFrequency(filterFrequency === f ? null : f); setSelectedPlan(null) }}
                />
              ))}
            </FilterSection>

            <FilterSection title="Equipment">
              {PLAN_EQUIPMENT.map(e => (
                <FilterRow
                  key={e}
                  label={e}
                  active={filterEquipment === e}
                  onClick={() => { setFilterEquipment(filterEquipment === e ? null : e); setSelectedPlan(null) }}
                />
              ))}
            </FilterSection>

            <FilterSection title="Constraints">
              {PLAN_FLAGS.map(f => (
                <FilterRow
                  key={f}
                  label={f}
                  active={filterFlags.includes(f)}
                  amber
                  onClick={() => toggleFlag(f)}
                />
              ))}
            </FilterSection>

          </div>
        </aside>

        {/* ── Right pane ────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col min-w-0">

          {/* Header */}
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-base font-semibold">Load a Workout Plan</DialogTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""}
                  {activeFilterCount > 0 ? " match your filters" : " available"}
                </p>
              </div>
              {selectedPlan && (
                <Button
                  size="sm"
                  onClick={() => {
                    onLoadPlan(selectedPlan)
                    handleClose(false)
                  }}
                >
                  <Check className="size-3.5 mr-1.5" />
                  Load plan
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Plan grid + preview */}
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">

            {/* Plan cards */}
            <div
              className={cn(
                "shrink-0 overflow-y-auto border-b border-border px-6 py-4",
                selectedPlan ? "max-h-[220px]" : "flex-1"
              )}
            >
              {filteredPlans.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
                  <BookOpen className="size-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No plans match these filters.</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs underline text-muted-foreground hover:text-foreground"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredPlans.map(plan => {
                    const isActive = selectedPlan?.id === plan.id
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlan(isActive ? null : plan)
                          if (!isActive) {
                            onLoadPlan(plan)
                            handleClose(false)
                          }
                        }}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all",
                          isActive
                            ? "border-foreground bg-foreground"
                            : "border-border bg-card hover:border-foreground/40 hover:bg-accent/40"
                        )}
                      >
                        <p className={cn(
                          "text-sm font-semibold leading-snug text-balance",
                          isActive ? "text-background" : "text-foreground"
                        )}>
                          {plan.name}
                        </p>
                        <p className={cn(
                          "mt-1.5 text-[11px] leading-relaxed line-clamp-2",
                          isActive ? "text-background/70" : "text-muted-foreground"
                        )}>
                          {plan.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {[plan.goal, plan.level, plan.frequency, plan.equipment].map(tag => (
                            <span
                              key={tag}
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                isActive
                                  ? "border-background/25 text-background/75"
                                  : "border-border text-muted-foreground"
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Schedule preview — expands once a plan is selected */}
            {selectedPlan && (
              <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
                {/* Preview header */}
                <div className="shrink-0 flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/10">
                  <CalendarDays className="size-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">{selectedPlan.name}</p>
                  <span className="text-xs text-muted-foreground">— weekly schedule</span>
                  {selectedPlan.safeFor.length > 0 && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Safe for:</span>
                      {selectedPlan.safeFor.map(f => (
                        <span
                          key={f}
                          className="rounded-full border border-[hsl(var(--status-normal-fg))] bg-[hsl(var(--status-normal-bg))] dark:bg-[hsl(var(--status-normal-fg))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--status-normal-fg))] dark:text-[hsl(var(--status-normal-fg))]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Day columns — horizontal scroll, all 7 days always shown */}
                <div className="flex-1 overflow-x-auto overflow-y-auto">
                  <div className="flex h-full gap-0 divide-x divide-border min-w-max">
                    {fullWeek.map(({ day, rest, workouts }) => (
                      <div
                        key={day}
                        className={cn(
                          "flex w-44 shrink-0 flex-col px-4 py-4",
                          rest && "bg-muted/30"
                        )}
                      >
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {day}
                        </p>
                        {rest ? (
                          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-4">
                            <span className="rounded-full border border-dashed border-border px-3 py-1 text-[11px] font-medium text-muted-foreground/60">
                              Rest
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {workouts?.map((w, i) => (
                              <div key={i}>
                                <p className="mb-2 text-xs font-semibold text-foreground">{w.name}</p>
                                <div className="space-y-1.5">
                                  {w.exercises.map((ex, j) => (
                                    <div key={j} className="flex items-start gap-2">
                                      <span
                                        className={cn(
                                          "mt-1.5 size-1.5 shrink-0 rounded-full",
                                          ex.mode === "strength" ? "bg-[hsl(var(--tag-inbody-fg))]" : "bg-[hsl(var(--status-normal-fg))]"
                                        )}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs leading-snug text-foreground">{ex.name}</p>
                                        <p className="text-[10px] tabular-nums text-muted-foreground">{ex.prescription}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
