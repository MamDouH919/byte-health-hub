import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { X, AlertTriangle, ClipboardList, Activity } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TrendIndicator } from "@/components/brand/TrendIndicator";
import { CountUp } from "@/components/brand/CountUp";
import { CardSkeleton } from "@/components/brand/Skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { patients, companies } from "@/lib/data";

type LegendItem = { label: string; count: number; color: string };

const LegendChip = ({ items }: { items: LegendItem[] }) => (
  <TooltipProvider delayDuration={120}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface/70 border border-border/70 text-[12px] text-muted-foreground cursor-default tabular-nums hover:bg-surface transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          {items.map((it) => (
            <span key={it.label} className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: it.color }} />
              <span>{it.count}</span>
            </span>
          ))}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" align="end" className="px-3 py-2">
        <div className="flex flex-col gap-1 text-[12px]">
          {items.map((it) => (
            <div key={it.label} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: it.color }} />
                <span className="text-foreground">{it.label}</span>
              </span>
              <span className="font-semibold tabular-nums">{it.count}</span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Normalize "Requires adjustment" → "Incomplete" for the simplified status model
const normalize = (s: string): "Complete" | "Incomplete" | "Missing" =>
  s === "Complete" ? "Complete" : s === "Missing" ? "Missing" : "Incomplete";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const companyFilter = searchParams.get("company");
  const activeCompany = companies.find((c) => c.id === companyFilter);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filteredPatients = useMemo(() => {
    if (!activeCompany) return patients;
    return patients.filter((p) => p.company === activeCompany.name);
  }, [activeCompany]);

  // Derive stats from filtered patients — counts (not percentages) so the
  // headline number on each card always equals the sum of its legend chips.
  const stats = useMemo(() => {
    const highRisk = filteredPatients.filter((p) => p.last14 < 40);
    const lowEng   = filteredPatients.filter((p) => p.last14 < 60 && p.last14 >= 40);

    // High risk severity tiers — reframed as High / Medium / Low risk
    const highRiskBreakdown = {
      high:   highRisk.filter((p) => p.last14 < 25).length,
      medium: highRisk.filter((p) => p.last14 >= 25 && p.last14 < 33).length,
      low:    highRisk.filter((p) => p.last14 >= 33).length,
    };

    // Low activity trend tiers
    const lowEngBreakdown = {
      declining: lowEng.filter((p) => p.trendPct < 0).length,
      stable:    lowEng.filter((p) => p.trendPct >= 0 && p.trendPct < 5).length,
      improving: lowEng.filter((p) => p.trendPct >= 5).length,
    };

    const planCounts = filteredPatients.reduce(
      (acc, p) => {
        const s = normalize(p.meal);
        acc[s] += 1;
        return acc;
      },
      { Complete: 0, Incomplete: 0, Missing: 0 } as Record<"Complete" | "Incomplete" | "Missing", number>,
    );

    return {
      highRisk: { count: highRisk.length, trendPct: -8, breakdown: highRiskBreakdown },
      lowEng:   { count: lowEng.length,   trendPct: 15, breakdown: lowEngBreakdown },
      plans:    { count: filteredPatients.length, breakdown: planCounts, trendPct: -8 },
    };
  }, [filteredPatients]);

  const clearFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("company");
    setSearchParams(next);
  };

  return (
    <AppShell user="Sajeda Ayesh" showSwitchers>
      <div className="max-w-6xl mx-auto animate-fade-in">

        <div className="mt-16 mx-auto max-w-2xl">
          <div className="surface-card text-center px-8 py-5 text-base text-foreground/80">
            hello doctor Sajeda, thank you for transforming lives.
          </div>
        </div>

        {activeCompany && (
          <div className="mt-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-surface border border-border">
              <span className="text-muted-foreground">Filtered by</span>
              <span className="font-semibold text-foreground">{activeCompany.name}</span>
              <span className="text-muted-foreground">· {filteredPatients.length} patients</span>
              <button
                onClick={clearFilter}
                aria-label="Clear filter"
                className="ml-1 p-0.5 rounded-full hover:bg-background"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} lines={2} />)
          ) : (
            <>
              {/* High Risk — left */}
              <Link
                to="/admin/high-risk"
                className="surface-card p-6 min-h-[180px] flex flex-col hover:shadow-[var(--shadow-pop)] transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-start justify-between">
                  <CountUp value={stats.highRisk.count} className="text-5xl font-bold tracking-tight tabular-nums" />
                  <TrendIndicator pct={stats.highRisk.trendPct} />
                </div>
                <div className="mt-auto pt-6 flex items-end justify-between gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-lg group-hover:text-foreground transition-colors">
                    <AlertTriangle className="h-4 w-4 opacity-70" />
                    High Risk
                  </div>
                  <LegendChip
                    items={[
                      { label: "High risk",   count: stats.highRisk.breakdown.high,   color: "hsl(var(--status-critical-fg))" },
                      { label: "Medium risk", count: stats.highRisk.breakdown.medium, color: "hsl(var(--status-attention-fg))" },
                      { label: "Low risk",    count: stats.highRisk.breakdown.low,    color: "hsl(var(--status-normal-fg))" },
                    ]}
                  />
                </div>
              </Link>

              {/* Plans — middle */}
              <Link
                to="/admin/incomplete-plans"
                className="surface-card p-6 min-h-[180px] flex flex-col hover:shadow-[var(--shadow-pop)] transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-start justify-between">
                  <CountUp value={filteredPatients.length} className="text-5xl font-bold tracking-tight tabular-nums" />
                  <TrendIndicator pct={stats.plans.trendPct} />
                </div>
                <div className="mt-auto pt-6 flex items-end justify-between gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-lg group-hover:text-foreground transition-colors">
                    <ClipboardList className="h-4 w-4 opacity-70" />
                    Plans
                  </div>
                  <LegendChip
                    items={[
                      { label: "Complete",   count: stats.plans.breakdown.Complete,   color: "hsl(var(--status-optimal-fg))" },
                      { label: "Incomplete", count: stats.plans.breakdown.Incomplete, color: "hsl(var(--status-attention-fg))" },
                      { label: "Missing",    count: stats.plans.breakdown.Missing,    color: "hsl(var(--status-critical-fg))" },
                    ]}
                  />
                </div>
              </Link>

              {/* Low Activity — right */}
              <Link
                to="/admin/low-engagement"
                className="surface-card p-6 min-h-[180px] flex flex-col hover:shadow-[var(--shadow-pop)] transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-start justify-between">
                  <CountUp value={stats.lowEng.count} className="text-5xl font-bold tracking-tight tabular-nums" />
                  <TrendIndicator pct={stats.lowEng.trendPct} />
                </div>
                <div className="mt-auto pt-6 flex items-end justify-between gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-lg group-hover:text-foreground transition-colors">
                    <Activity className="h-4 w-4 opacity-70" />
                    Low Activity
                  </div>
                  <LegendChip
                    items={[
                      { label: "Declining", count: stats.lowEng.breakdown.declining, color: "hsl(var(--status-critical-fg))" },
                      { label: "Stable",    count: stats.lowEng.breakdown.stable,    color: "hsl(var(--status-attention-fg))" },
                      { label: "Improving", count: stats.lowEng.breakdown.improving, color: "hsl(var(--status-optimal-fg))" },
                    ]}
                  />
                </div>
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          Open a sample patient profile:{" "}
          <Link to="/patient/yassin-05/profile" className="text-[hsl(var(--brand-blue))] hover:underline font-medium">
            Yassin Asfour
          </Link>
          <div className="mt-2 text-xs">
            Tip: press <kbd className="kbd">⌘K</kbd> to search anything.
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
