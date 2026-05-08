import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  leadingIcon?: ReactNode;
  headerRight?: ReactNode;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleSection = ({
  title, eyebrow, icon, leadingIcon, headerRight, summary, children, defaultOpen = false, className,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn("surface-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-2.5">
          {leadingIcon && <div className="text-muted-foreground shrink-0 mt-0.5">{leadingIcon}</div>}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-tight">{title}</h2>
            {eyebrow && <p className="text-[11px] text-muted-foreground mt-0.5">{eyebrow}</p>}
          </div>
        </div>
        {(headerRight || icon) && (
          <div className="shrink-0 flex items-center gap-2">
            {headerRight}
            {icon && <div className="text-muted-foreground">{icon}</div>}
          </div>
        )}
      </div>

      {!open && <div className="mt-3">{summary}</div>}

      {open && <div className="mt-4 animate-fade-in">{children}</div>}

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 w-full inline-flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1 -mb-1"
        aria-expanded={open}
      >
        {open ? "Hide details" : "Show details"}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
    </section>
  );
};
