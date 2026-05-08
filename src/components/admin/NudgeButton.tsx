import { Bell, BellRing } from "lucide-react";

interface Props {
  onClick: () => void;
  nudged?: boolean;
  label?: string;
}

export const NudgeButton = ({ onClick, nudged, label = "Nudge" }: Props) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={nudged ? `Nudge again` : label}
    title={nudged ? "Send another nudge" : "Send nudge"}
    className={[
      "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
      nudged
        ? "border-[hsl(var(--status-optimal-fg)/0.3)] bg-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))] hover:opacity-90"
        : "border-border bg-background hover:bg-surface text-foreground/80 hover:text-foreground",
    ].join(" ")}
  >
    {nudged ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
    <span>{nudged ? "Nudged" : label}</span>
  </button>
);
