import { cn } from "@/lib/utils";

export type StatusKind =
  | "Optimal" | "Normal" | "Needs attention" | "Complete"
  | "Incomplete" | "Requires adjustment" | "Missing";

const map: Record<StatusKind, string> = {
  Optimal:                "bg-[hsl(var(--status-optimal-bg))]   text-[hsl(var(--status-optimal-fg))]",
  Complete:               "bg-[hsl(var(--status-optimal-bg))]   text-[hsl(var(--status-optimal-fg))]",
  Normal:                 "bg-[hsl(var(--status-normal-bg))]    text-[hsl(var(--status-normal-fg))]",
  "Needs attention":      "bg-[hsl(var(--status-attention-bg))] text-[hsl(var(--status-attention-fg))]",
  "Requires adjustment":  "bg-[hsl(var(--status-attention-bg))] text-[hsl(var(--status-attention-fg))]",
  Missing:                "bg-[hsl(var(--status-critical-bg))]  text-[hsl(var(--status-critical-fg))]",
  Incomplete:             "bg-[hsl(var(--status-neutral-bg))]   text-[hsl(var(--status-neutral-fg))]",
};

export const StatusPill = ({ status, className }: { status: StatusKind | string; className?: string }) => {
  const cls = map[status as StatusKind] ?? map.Incomplete;
  return <span className={cn("pill", cls, className)}>{status}</span>;
};
