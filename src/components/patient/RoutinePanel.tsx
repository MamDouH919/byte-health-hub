import { useState } from "react";
import { Pencil, Plus, Trash2, X, Check, GripVertical } from "lucide-react";
import {
  afternoonRoutine, morningRoutine, eveningRoutine, routineLibrary, routineIcons,
  newRoutineId, type RoutineItem, type RoutineIconKey,
} from "@/lib/data";
import { toast } from "@/hooks/use-toast";
import { RoutineDetailDialog, type RoutineDetailData } from "./RoutineDetailDialog";
import { NotifyUserDialog } from "./NotifyUserDialog";

const toneRing: Record<RoutineItem["tone"], string> = {
  amber: "bg-[hsl(38_95%_96%)] text-[hsl(28_75%_38%)] ring-[hsl(28_60%_85%)]",
  warm:  "bg-[hsl(45_90%_96%)] text-[hsl(28_70%_38%)] ring-[hsl(28_55%_85%)]",
  fresh: "bg-[hsl(142_60%_96%)] text-[hsl(142_55%_30%)] ring-[hsl(142_40%_85%)]",
  soft:  "bg-[hsl(220_15%_97%)] text-[hsl(220_15%_35%)] ring-[hsl(220_13%_88%)]",
  sky:   "bg-[hsl(210_85%_97%)] text-[hsl(215_75%_38%)] ring-[hsl(215_60%_88%)]",
};

const RoutineIcon = ({ icon, tone }: { icon: RoutineIconKey; tone: RoutineItem["tone"] }) => {
  const Cmp = routineIcons[icon] ?? routineIcons.water;
  return (
    <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ring-1 ${toneRing[tone]}`}>
      <Cmp className="h-4 w-4" strokeWidth={1.6} />
    </div>
  );
};

type Slot = "Morning" | "Afternoon" | "Evening";

const Item = ({
  item, onRemove, onOpen, draggable, onDragStart, onDragOver, onDrop,
}: {
  item: RoutineItem; onRemove?: () => void; onOpen?: () => void; draggable?: boolean;
  onDragStart?: () => void; onDragOver?: (e: React.DragEvent) => void; onDrop?: () => void;
}) => (
  <article
    draggable={draggable}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onClick={onOpen}
    role={onOpen ? "button" : undefined}
    tabIndex={onOpen ? 0 : undefined}
    onKeyDown={(e) => { if (onOpen && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(); } }}
    className="flex items-start gap-3 p-2 surface-card hover:shadow-[var(--shadow-card)] transition-shadow group cursor-pointer"
  >
    <RoutineIcon icon={item.icon} tone={item.tone} />
    <div className="min-w-0 flex-1">
      <div className="font-semibold text-sm leading-snug">{item.title}</div>
      <div className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{item.subtitle}</div>
    </div>
    <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground mt-1" />
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1 text-muted-foreground hover:text-destructive"
          aria-label="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  </article>
);

export const RoutinePanel = () => {
  const [morning, setMorning] = useState<RoutineItem[]>(morningRoutine);
  const [afternoon, setAfternoon] = useState<RoutineItem[]>(afternoonRoutine);
  const [evening, setEvening] = useState<RoutineItem[]>(eveningRoutine);
  const [editing, setEditing] = useState<Slot | null>(null);
  const [mode, setMode] = useState<"select" | "create">("select");
  const [draft, setDraft] = useState({
    title: "", subtitle: "", tone: "sky" as RoutineItem["tone"], icon: "water" as RoutineIconKey,
  });
  const [detail, setDetail] = useState<RoutineDetailData | null>(null);
  const [expanded, setExpanded] = useState<Record<Slot, boolean>>({
    Morning: false, Afternoon: false, Evening: false,
  });

  const openDetail = (item: RoutineItem, time: string) =>
    setDetail({ title: item.title, subtitle: item.subtitle, icon: item.icon, time, category: "Routine" });

  // Drag state
  const [drag, setDrag] = useState<
    | { kind: "library"; libId: string }
    | { kind: "list"; slot: Slot; index: number }
    | null
  >(null);
  const [dropTarget, setDropTarget] = useState<Slot | null>(null);

  // Pending change awaiting clinician confirmation (with optional patient notify)
  const [pending, setPending] = useState<
    | { kind: "library"; libId: string; slot: Slot; label: string }
    | { kind: "create"; slot: Slot; label: string }
    | null
  >(null);

  const close = () => {
    setEditing(null); setMode("select");
    setDraft({ title: "", subtitle: "", tone: "sky", icon: "water" });
  };

  const addToSlot = (slot: Slot, item: RoutineItem) => {
    if (slot === "Morning") setMorning((m) => [...m, item]);
    else if (slot === "Afternoon") setAfternoon((a) => [...a, item]);
    else setEvening((e) => [...e, item]);
  };

  const addFromLibrary = (libId: string, slot: Slot) => {
    const lib = routineLibrary.find((r) => r.id === libId);
    if (!lib) return;
    // Defer the actual mutation until the clinician confirms (and optionally notifies).
    setPending({ kind: "library", libId, slot, label: `Assigned “${lib.title}” → ${slot} routine` });
  };

  const commitFromLibrary = (libId: string, slot: Slot) => {
    const lib = routineLibrary.find((r) => r.id === libId);
    if (!lib) return;
    addToSlot(slot, {
      id: newRoutineId(), title: lib.title, subtitle: lib.description,
      tone: slot === "Morning" ? "warm" : slot === "Afternoon" ? "sky" : "soft", icon: lib.icon,
    });
    toast({ title: "Routine added", description: `${lib.title} → ${slot}` });
  };

  const createNew = () => {
    if (!draft.title.trim() || !editing) return;
    setPending({ kind: "create", slot: editing, label: `Assigned “${draft.title}” → ${editing} routine` });
  };

  const commitCreateNew = (slot: Slot) => {
    if (!draft.title.trim()) return;
    addToSlot(slot, {
      id: newRoutineId(), title: draft.title, subtitle: draft.subtitle,
      tone: draft.tone, icon: draft.icon,
    });
    toast({ title: "Routine created", description: draft.title });
    setDraft({ title: "", subtitle: "", tone: "sky", icon: "water" });
    setMode("select");
  };

  const remove = (slot: Slot, idx: number) => {
    if (slot === "Morning") setMorning((m) => m.filter((_, i) => i !== idx));
    else if (slot === "Afternoon") setAfternoon((a) => a.filter((_, i) => i !== idx));
    else setEvening((e) => e.filter((_, i) => i !== idx));
  };

  const reorder = (slot: Slot, from: number, to: number) => {
    const setter = slot === "Morning" ? setMorning : slot === "Afternoon" ? setAfternoon : setEvening;
    setter((list) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleSlotDrop = (slot: Slot) => {
    if (!drag) return;
    if (drag.kind === "library") {
      addFromLibrary(drag.libId, slot);
    } else if (drag.kind === "list" && drag.slot !== slot) {
      // move across slots → append
      const list = drag.slot === "Morning" ? morning : drag.slot === "Afternoon" ? afternoon : evening;
      const item = list[drag.index];
      if (item) {
        remove(drag.slot, drag.index);
        addToSlot(slot, item);
      }
    }
    setDrag(null); setDropTarget(null);
  };

  const handleItemDrop = (slot: Slot, index: number) => {
    if (drag?.kind === "list" && drag.slot === slot) {
      reorder(slot, drag.index, index);
    } else {
      handleSlotDrop(slot);
    }
    setDrag(null); setDropTarget(null);
  };

  const renderSlot = (slot: Slot, items: RoutineItem[]) => {
    const isExpanded = expanded[slot];
    const VISIBLE = 3;
    const visibleItems = isExpanded ? items : items.slice(0, VISIBLE);
    const hidden = Math.max(0, items.length - VISIBLE);
    return (
    <section
      onDragOver={(e) => { e.preventDefault(); setDropTarget(slot); }}
      onDragLeave={() => setDropTarget((d) => (d === slot ? null : d))}
      onDrop={() => handleSlotDrop(slot)}
      className={`rounded-2xl p-2 -m-2 transition-colors ${dropTarget === slot ? "bg-[hsl(var(--brand-blue)/0.06)] ring-2 ring-[hsl(var(--brand-blue)/0.4)]" : ""}`}
    >
      <header className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm text-muted-foreground">{slot} Routine</h3>
        <button
          onClick={() => setEditing(slot)}
          className="surface-card px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 bg-background hover:shadow-[var(--shadow-pop)]"
        >
          Edit <Pencil className="h-3 w-3" />
        </button>
      </header>
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-xs text-muted-foreground italic px-3 py-4 border border-dashed border-border rounded-xl text-center">
            Drop a routine here
          </div>
        )}
        {visibleItems.map((it, i) => (
          <Item
            key={it.id}
            item={it}
            draggable
            onDragStart={() => setDrag({ kind: "list", slot, index: i })}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleItemDrop(slot, i)}
            onRemove={() => remove(slot, i)}
            onOpen={() => openDetail(it, slot)}
          />
        ))}
        {hidden > 0 && (
          <button
            onClick={() => setExpanded((s) => ({ ...s, [slot]: !isExpanded }))}
            className="w-full text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Show less" : `Show ${hidden} more`}
          </button>
        )}
      </div>
    </section>
    );
  };

  return (
    <>
      <aside className="space-y-6">
        {renderSlot("Morning", morning)}
        {renderSlot("Afternoon", afternoon)}
        {renderSlot("Evening", evening)}
      </aside>

      {editing && (
        <>
          <div className="fixed inset-0 bg-foreground/30 backdrop-blur-[2px] z-50" onClick={close} />
          <div role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-background rounded-2xl border border-border shadow-[var(--shadow-pop)] w-full max-w-3xl pointer-events-auto drawer-in flex flex-col max-h-[85vh]">
              <header className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Edit</div>
                  <div className="font-semibold">{editing} Routine — drag items into the section</div>
                </div>
                <button onClick={close} aria-label="Close" className="p-1 rounded hover:bg-surface"><X className="h-4 w-4" /></button>
              </header>

              <div className="px-6 pt-4">
                <div className="inline-flex p-1 rounded-full bg-surface border border-border text-xs">
                  {(["select", "create"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-4 py-1.5 rounded-full font-medium ${mode === m ? "bg-foreground text-background" : "text-muted-foreground"}`}
                    >
                      {m === "select" ? "Library" : "Create new"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto">
                {/* LEFT — library / create */}
                <div className="min-h-0">
                  {mode === "select" ? (
                    <>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Library — drag or click +</div>
                      <ul className="space-y-2">
                        {routineLibrary.map((r) => {
                          const Icon = routineIcons[r.icon];
                          return (
                            <li
                              key={r.id}
                              draggable
                              onDragStart={() => setDrag({ kind: "library", libId: r.id })}
                              className="flex items-center gap-3 surface-card bg-background px-3 py-2.5 cursor-grab active:cursor-grabbing hover:shadow-[var(--shadow-card)] transition-shadow"
                            >
                              <div className="h-9 w-9 rounded-xl bg-surface border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Icon className="h-4 w-4" strokeWidth={1.6} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{r.title}</div>
                                <div className="text-[11px] text-muted-foreground truncate">{r.category} · {r.time}</div>
                              </div>
                              <button
                                onClick={() => addFromLibrary(r.id, editing)}
                                className="shrink-0 inline-flex items-center gap-1 bg-foreground text-background px-2.5 py-1 rounded-full text-[11px] font-medium hover:opacity-90"
                              >
                                <Plus className="h-3 w-3" /> Add
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">Title</label>
                        <input
                          value={draft.title}
                          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                          placeholder="e.g. Morning hydration"
                          className="w-full surface-card bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue)/0.4)]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">Description</label>
                        <textarea
                          value={draft.subtitle}
                          onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                          rows={3}
                          maxLength={250}
                          placeholder="Why this routine matters..."
                          className="w-full surface-card bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue)/0.4)] resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">Icon</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {(Object.keys(routineIcons) as RoutineIconKey[]).map((k) => {
                            const Cmp = routineIcons[k];
                            return (
                              <button
                                key={k}
                                onClick={() => setDraft((d) => ({ ...d, icon: k }))}
                                className={`h-9 w-9 rounded-lg border flex items-center justify-center ${draft.icon === k ? "border-foreground bg-surface" : "border-border bg-background text-muted-foreground"}`}
                                aria-label={k}
                              >
                                <Cmp className="h-4 w-4" strokeWidth={1.6} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">Color</label>
                        <div className="flex gap-2">
                          {(["amber","warm","fresh","soft","sky"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setDraft((d) => ({ ...d, tone: t }))}
                              className={`h-9 w-9 rounded-lg ring-1 ${toneRing[t]} ${draft.tone === t ? "ring-2 ring-foreground" : ""}`}
                              aria-label={t}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT — drop zone preview of current slot */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDropTarget(editing); }}
                  onDrop={() => handleSlotDrop(editing)}
                  className={`min-h-0 rounded-2xl border-2 border-dashed p-3 ${dropTarget === editing ? "border-[hsl(var(--brand-blue))] bg-[hsl(var(--brand-blue)/0.06)]" : "border-border bg-surface/40"}`}
                >
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{editing} Routine — drop here</div>
                  <div className="space-y-2">
                    {(editing === "Morning" ? morning : editing === "Afternoon" ? afternoon : evening).map((it, i) => (
                      <Item key={it.id} item={it} onRemove={() => remove(editing, i)} onOpen={() => openDetail(it, editing)} />
                    ))}
                    {(editing === "Morning" ? morning : editing === "Afternoon" ? afternoon : evening).length === 0 && (
                      <div className="text-xs text-muted-foreground italic text-center py-8">Drag items from the library</div>
                    )}
                  </div>
                </div>
              </div>

              <footer className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">
                <button onClick={close} className="btn-surface-pill">Done</button>
                {mode === "create" && (
                  <button
                    onClick={createNew}
                    disabled={!draft.title.trim()}
                    className="btn-primary-pill"
                  >
                    <Check className="h-3.5 w-3.5" /> Create & add
                  </button>
                )}
              </footer>
            </div>
          </div>
        </>
      )}

      <RoutineDetailDialog
        routine={detail}
        open={!!detail}
        onOpenChange={(v) => { if (!v) setDetail(null); }}
      />

      <NotifyUserDialog
        open={!!pending}
        onOpenChange={(o) => { if (!o) setPending(null); }}
        changeLabel={pending?.label ?? ""}
        defaultMessage={pending?.label}
        onConfirm={() => {
          if (!pending) return;
          if (pending.kind === "library") commitFromLibrary(pending.libId, pending.slot);
          else commitCreateNew(pending.slot);
          setPending(null);
        }}
      />
    </>
  );
};
