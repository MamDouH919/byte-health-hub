import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Stethoscope, Sparkles, Zap, Sunset, Pill, Plus, X } from "lucide-react";
import { ClinicalAlerts } from "@/components/patient/ClinicalAlerts";
import { CollapsibleSection } from "@/components/patient/CollapsibleSection";
import { AddMedDialog } from "@/components/patient/AddMedDialog";
import { getPatientMeds, type MedItem, type MedsData } from "@/lib/data";
import type { MedCategory, CatalogEntry } from "@/lib/meds-catalog";
import { toast } from "sonner";

// (summary now lists all item names; details revealed on expand)

const StatusBadge = ({ status }: { status: NonNullable<MedItem["status"]> }) => {
  const map = {
    Active: "bg-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))]",
    PRN: "bg-[hsl(var(--status-neutral-bg))] text-[hsl(var(--status-neutral-fg))]",
    Paused: "bg-[hsl(var(--status-attention-bg))] text-[hsl(var(--status-attention-fg))]",
  } as const;
  return <span className={`pill ${map[status]}`}>{status}</span>;
};

const Row = ({
  item,
  extra,
  onRemove,
}: {
  item: MedItem;
  extra?: string;
  onRemove: () => void;
}) => (
  <li className="group flex items-start justify-between gap-3 py-1.5">
    <div className="min-w-0">
      <div className="text-sm">
        <span className="font-medium">{item.name}</span>
        <span className="text-muted-foreground tabular-nums ml-2">{item.dose}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {item.detail}
        {extra && <span className="ml-1">· {extra}</span>}
      </div>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      {item.status && <StatusBadge status={item.status} />}
      <button
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  </li>
);

const SectionCard = <T extends MedItem>({
  title,
  eyebrow,
  icon,
  items,
  onAdd,
  onRemove,
  renderExtra,
  tint,
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  items: T[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  renderExtra?: (i: T) => string | undefined;
  tint?: string;
}) => {
  const addBtn = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      aria-label={`Add to ${title}`}
      className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
    >
      <Plus className="h-3.5 w-3.5" />
    </button>
  );

  if (items.length === 0) {
    return (
      <CollapsibleSection
        title={title}
        eyebrow={eyebrow}
        leadingIcon={icon}
        headerRight={addBtn}
        className={tint}
        summary={<p className="text-xs text-muted-foreground italic">None on file. Click + to add.</p>}
      >
        <p className="text-xs text-muted-foreground italic">None on file.</p>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      title={title}
      eyebrow={eyebrow}
      leadingIcon={icon}
      headerRight={addBtn}
      className={tint}
      summary={
        <ul className="flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <li
              key={i}
              className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2 py-1 text-xs"
            >
              <span className="font-medium">{it.name}</span>
              {it.status && it.status !== "Active" && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {it.status}
                </span>
              )}
            </li>
          ))}
        </ul>
      }
    >
      <ul className="divide-y divide-border/60">
        {items.map((it, i) => (
          <Row key={i} item={it} extra={renderExtra?.(it)} onRemove={() => onRemove(i)} />
        ))}
      </ul>
    </CollapsibleSection>
  );
};

const Meds = () => {
  const { id } = useParams();
  const [meds, setMeds] = useState<MedsData>(() => getPatientMeds(id));
  const [picker, setPicker] = useState<{ category: MedCategory; label: string } | null>(null);

  // Reset state when switching patients
  useEffect(() => {
    setMeds(getPatientMeds(id));
  }, [id]);

  const totals = useMemo(() => {
    const total =
      meds.prescriptions.length + meds.supplements.length + meds.performance.length + meds.sleepAids.length;
    const otc = meds.supplements.length + meds.performance.length + meds.sleepAids.length;
    return { total, rx: meds.prescriptions.length, otc };
  }, [meds]);

  const addItem = (entry: CatalogEntry) => {
    setMeds((prev) => {
      const next = { ...prev };
      const newItem: MedItem = {
        name: entry.name,
        dose: entry.defaultDose,
        detail: entry.defaultDetail,
        status: "Active",
      };
      if (entry.category === "prescriptions") {
        next.prescriptions = [
          ...prev.prescriptions,
          { ...newItem, prescriber: "Dr. Sajeda Ayesh", refill: "—" },
        ];
      } else {
        next[entry.category] = [...prev[entry.category], newItem];
      }
      return next;
    });
    toast.success(`${entry.name} added`);
  };

  const removeItem = (category: MedCategory, idx: number) => {
    setMeds((prev) => {
      const next = { ...prev };
      const arr = [...prev[category]];
      const [removed] = arr.splice(idx, 1);
      // @ts-expect-error narrowed at runtime
      next[category] = arr;
      if (removed) toast(`${removed.name} removed`);
      return next;
    });
  };

  const existingNamesFor = (cat: MedCategory) => meds[cat].map((m) => m.name);

  return (
    <div className="space-y-5">
      <ClinicalAlerts />

      {/* Summary strip */}
      <section className="surface-card p-5 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums leading-none">{totals.total}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Active items</div>
          </div>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="flex items-center gap-6 text-sm">
          <div>
            <div className="text-base font-medium tabular-nums">{totals.rx}</div>
            <div className="text-[11px] text-muted-foreground">Prescriptions</div>
          </div>
          <div>
            <div className="text-base font-medium tabular-nums">{totals.otc}</div>
            <div className="text-[11px] text-muted-foreground">Supplements & OTC</div>
          </div>
          <div>
            <div className="text-base font-medium tabular-nums">{meds.sleepAids.length}</div>
            <div className="text-[11px] text-muted-foreground">Sleep aids</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard
          title="Prescription medication"
          eyebrow="Doctor-prescribed, with refill tracking"
          icon={<Stethoscope className="h-4 w-4" />}
          items={meds.prescriptions}
          tint="bg-[hsl(210_60%_97%)] border-[hsl(210_45%_88%)]"
          onAdd={() => setPicker({ category: "prescriptions", label: "Prescriptions" })}
          onRemove={(i) => removeItem("prescriptions", i)}
          renderExtra={(p) => `${p.prescriber} · refill ${p.refill}`}
        />

        <SectionCard
          title="Supplements"
          eyebrow="Longevity & general health stack"
          icon={<Sparkles className="h-4 w-4" />}
          items={meds.supplements}
          tint="bg-[hsl(150_50%_96%)] border-[hsl(150_35%_86%)]"
          onAdd={() => setPicker({ category: "supplements", label: "Supplements" })}
          onRemove={(i) => removeItem("supplements", i)}
        />

        <SectionCard
          title="Performance & recovery"
          eyebrow="Tied to training sessions"
          icon={<Zap className="h-4 w-4" />}
          items={meds.performance}
          tint="bg-[hsl(35_85%_96%)] border-[hsl(35_60%_86%)]"
          onAdd={() => setPicker({ category: "performance", label: "Performance & recovery" })}
          onRemove={(i) => removeItem("performance", i)}
        />

        <SectionCard
          title="Sleep aids"
          eyebrow="Evening protocol"
          icon={<Sunset className="h-4 w-4" />}
          items={meds.sleepAids}
          tint="bg-[hsl(265_50%_97%)] border-[hsl(265_35%_88%)]"
          onAdd={() => setPicker({ category: "sleepAids", label: "Sleep aids" })}
          onRemove={(i) => removeItem("sleepAids", i)}
        />
      </div>

      {picker && (
        <AddMedDialog
          open={!!picker}
          onOpenChange={(v) => !v && setPicker(null)}
          category={picker.category}
          categoryLabel={picker.label}
          existingNames={existingNamesFor(picker.category)}
          onAdd={addItem}
        />
      )}
    </div>
  );
};

export default Meds;
