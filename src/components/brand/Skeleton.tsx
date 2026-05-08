import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "rounded-md bg-gradient-to-r from-[hsl(220_14%_94%)] via-[hsl(220_14%_88%)] to-[hsl(220_14%_94%)] bg-[length:800px_100%] animate-shimmer",
      className,
    )}
  />
);

export const CardSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="surface-card p-6 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-3 w-full" />
    ))}
  </div>
);

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
    {Icon && (
      <div className="h-14 w-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
    )}
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
