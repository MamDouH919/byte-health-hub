import { Calendar, Sparkles, Activity, AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { routineIcons, getRoutineDetail, type RoutineIconKey } from "@/lib/data";

export interface RoutineDetailData {
  title: string;
  subtitle: string;
  icon: RoutineIconKey;
  category?: string;
  time?: string;        // "Morning" | "Afternoon" | "Evening" | etc.
}

export const RoutineDetailDialog = ({
  routine, open, onOpenChange,
}: {
  routine: RoutineDetailData | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  if (!routine) return null;
  const Icon = routineIcons[routine.icon] ?? routineIcons.water;
  const detail = getRoutineDetail(routine.title);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground shrink-0">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <span>{routine.category ?? "Routine"}</span>
                {routine.time && (
                  <>
                    <span>·</span>
                    <span>{routine.time}</span>
                  </>
                )}
              </div>
              <DialogTitle className="text-lg mt-0.5">{routine.title}</DialogTitle>
              <DialogDescription className="text-xs mt-1">{routine.subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <section className="surface-card bg-surface/50 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              <Calendar className="h-3.5 w-3.5" /> Schedule
            </div>
            <div className="text-sm">{detail.frequency}</div>
          </section>

          <section className="surface-card bg-surface/50 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Health impact
            </div>
            <p className="text-sm leading-relaxed">{detail.impact}</p>
          </section>

          <section className="surface-card bg-surface/50 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              <Activity className="h-3.5 w-3.5" /> Supports biomarkers
            </div>
            <div className="flex flex-wrap gap-1.5">
              {detail.biomarkers.map((b) => (
                <span key={b} className="pill bg-[hsl(var(--brand-blue)/0.08)] text-[hsl(var(--brand-blue))]">{b}</span>
              ))}
            </div>
          </section>

          {detail.cautions && (
            <section className="surface-card bg-[hsl(var(--status-attention-bg)/0.5)] p-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[hsl(var(--status-attention-fg))] font-semibold mb-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Cautions
              </div>
              <p className="text-sm leading-relaxed text-[hsl(var(--status-attention-fg))]">{detail.cautions}</p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
