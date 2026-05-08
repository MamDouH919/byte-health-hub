import { useState } from "react";
import { useParams } from "react-router-dom";
import { Filter, Info, TrendingDown, TrendingUp } from "lucide-react";
import { StatusPill, type StatusKind } from "@/components/brand/StatusPill";
import { RangeBar } from "@/components/brand/RangeBar";
import { EmptyState } from "@/components/brand/Skeleton";
import { getPatientProfile, type BloodMetric } from "@/lib/data";
import { FileText } from "lucide-react";

const Section = ({ title, status, count }: { title: string; status: StatusKind; count: number }) => (
  <div className="flex items-center gap-3 mb-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    <StatusPill status={status} />
    <span className="text-xs text-muted-foreground">{count} markers</span>
  </div>
);

const Card = ({ m }: { m: BloodMetric }) => {
  const delta = m.prev !== undefined ? m.value - m.prev : 0;
  const deltaPct = m.prev ? (delta / m.prev) * 100 : 0;
  const deltaUp = delta > 0;

  return (
    <article className="surface-card bg-background p-5 hover:shadow-[var(--shadow-card)] transition-shadow">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {m.name}
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
        <StatusPill status={m.status} />
      </header>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tight tabular-nums">{m.display}</div>
        <div className="text-xs text-muted-foreground">{m.unit}</div>
        {m.prev !== undefined && (
          <span className={`ml-auto inline-flex items-center gap-0.5 text-[11px] font-medium ${deltaUp ? "text-[hsl(var(--trend-up))]" : "text-[hsl(var(--trend-down))]"}`}>
            {deltaUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(deltaPct).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <RangeBar
          value={m.value}
          min={m.min}
          max={m.max}
          scaleMin={m.scaleMin}
          scaleMax={m.scaleMax}
        />
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground">
        Optimal: <span className="font-semibold text-foreground">{m.range} {m.unit}</span>
      </div>
    </article>
  );
};

type FilterKey = "all" | "Optimal" | "Normal" | "Needs attention";

const BloodTests = () => {
  const [filter, setFilter] = useState<FilterKey>("all");
  const { id } = useParams();
  const bloodTests = getPatientProfile(id).bloodTests;

  const apply = (list: BloodMetric[]) =>
    filter === "all" ? list : list.filter((m) => m.status === filter);

  const cbc = apply(bloodTests.cbc.metrics);
  const horm = apply(bloodTests.hormones.metrics);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Blood tests</h2>
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface border border-border text-xs">
          <Filter className="h-3 w-3 text-muted-foreground ml-2" />
          {(["all", "Optimal", "Normal", "Needs attention"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Section title="CBC" status="Normal" count={cbc.length} />
        {cbc.length === 0 ? (
          <EmptyState icon={FileText} title="No matching markers" description="Try a different filter." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cbc.map((m) => <Card key={m.name} m={m} />)}
          </div>
        )}
      </div>

      <div>
        <Section title="Hormone Panel" status="Normal" count={horm.length} />
        {horm.length === 0 ? (
          <EmptyState icon={FileText} title="No matching markers" description="Try a different filter." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {horm.map((m) => <Card key={m.name} m={m} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodTests;
