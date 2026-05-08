import { useState, type ComponentType, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil, Plus, Trash2, Check, X,
  Activity, Heart, Droplet, Moon, Wind, Flame, Scale, Target, Star, Sparkles,
  Apple, Salad, Beef, Fish, Drumstick, Wheat, Leaf, Coffee, PieChart, Croissant,
  Dumbbell, Footprints, HeartPulse, ShieldAlert, Zap, Award, Clock, Info, AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { NotifyUserDialog } from "./NotifyUserDialog";

const ICON_PALETTE: { name: string; Icon: ComponentType<{ className?: string }> }[] = [
  { name: "activity", Icon: Activity }, { name: "heart", Icon: Heart }, { name: "droplet", Icon: Droplet },
  { name: "moon", Icon: Moon }, { name: "wind", Icon: Wind }, { name: "flame", Icon: Flame },
  { name: "scale", Icon: Scale }, { name: "target", Icon: Target }, { name: "star", Icon: Star },
  { name: "sparkles", Icon: Sparkles }, { name: "apple", Icon: Apple }, { name: "salad", Icon: Salad },
  { name: "beef", Icon: Beef }, { name: "fish", Icon: Fish }, { name: "drumstick", Icon: Drumstick },
  { name: "wheat", Icon: Wheat }, { name: "leaf", Icon: Leaf }, { name: "coffee", Icon: Coffee },
  { name: "pie", Icon: PieChart }, { name: "croissant", Icon: Croissant }, { name: "dumbbell", Icon: Dumbbell },
  { name: "footprints", Icon: Footprints }, { name: "heartpulse", Icon: HeartPulse },
  { name: "shield", Icon: ShieldAlert }, { name: "zap", Icon: Zap }, { name: "award", Icon: Award },
  { name: "clock", Icon: Clock }, { name: "info", Icon: Info }, { name: "alert", Icon: AlertTriangle },
];

export interface PlanContextItem {
  title: string;
  body: string;
  /** Optional minimal icon shown next to the title — pairs with the accent dot. */
  icon?: ComponentType<{ className?: string }>;
}

export interface PlanContextCardConfig {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Tone classes for the icon chip — should use semantic tokens (e.g. status-info, status-warn). */
  tone: string; // e.g. "bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-fg))]"
  /** Accent color for the left border in the dialog list, e.g. "hsl(var(--status-info-fg))" */
  accent: string;
  summary: string;
  items: PlanContextItem[];
  /** Optional custom content rendered above the editable items list inside the dialog. */
  renderHeader?: () => ReactNode;
  /** Optional sub-label / tagline shown under the dialog title. */
  subtitle?: string;
}

interface Props {
  cards: PlanContextCardConfig[];
  onChange: (key: string, items: PlanContextItem[]) => void;
}

export function PlanContextCards({ cards, onChange }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftIcon, setDraftIcon] = useState<ComponentType<{ className?: string }> | undefined>(undefined);
  const [adding, setAdding] = useState(false);

  // Pending change held for confirm-with-notify dialog.
  const [pending, setPending] = useState<null | { label: string; apply: () => void }>(null);

  const active = cards.find((c) => c.key === openKey);

  const startEdit = (i: number) => {
    if (!active) return;
    setAdding(false);
    setEditingIdx(i);
    setDraftTitle(active.items[i].title);
    setDraftBody(active.items[i].body);
    setDraftIcon(() => active.items[i].icon);
  };

  const startAdd = () => {
    setEditingIdx(null);
    setAdding(true);
    setDraftTitle("");
    setDraftBody("");
    setDraftIcon(undefined);
  };

  const cancel = () => {
    setEditingIdx(null);
    setAdding(false);
    setDraftTitle("");
    setDraftBody("");
    setDraftIcon(undefined);
  };

  const save = () => {
    if (!active) return;
    if (!draftTitle.trim() || !draftBody.trim()) {
      toast({ title: "Missing fields", description: "Both title and details are required." });
      return;
    }
    const next = [...active.items];
    const isAdd = adding;
    if (adding) {
      next.push({ title: draftTitle.trim(), body: draftBody.trim(), icon: draftIcon });
    } else if (editingIdx !== null) {
      next[editingIdx] = { title: draftTitle.trim(), body: draftBody.trim(), icon: draftIcon };
    }
    const label = `${isAdd ? "Added" : "Updated"} · ${active.label} · ${draftTitle.trim()}`;
    setPending({
      label,
      apply: () => {
        onChange(active.key, next);
        toast({ title: isAdd ? "Added" : "Updated", description: `${draftTitle.trim()} saved to ${active.label}.` });
        cancel();
      },
    });
  };

  const remove = (i: number) => {
    if (!active) return;
    const item = active.items[i];
    const next = active.items.filter((_, idx) => idx !== i);
    setPending({
      label: `Removed · ${active.label} · ${item.title}`,
      apply: () => {
        onChange(active.key, next);
        toast({ title: "Removed", description: `Entry removed from ${active.label}.` });
        if (editingIdx === i) cancel();
      },
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => { setOpenKey(c.key); cancel(); }}
              className="surface-card p-5 text-left hover:shadow-[var(--shadow-pop)] transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span className={`h-9 w-9 rounded-lg inline-flex items-center justify-center ${c.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="font-semibold">{c.label}</div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {c.summary}
              </p>
              <div className="mt-3 text-[11px] text-muted-foreground">
                {c.items.length} {c.items.length === 1 ? "entry" : "entries"} →
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={openKey !== null} onOpenChange={(o) => { if (!o) { setOpenKey(null); cancel(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className={`h-9 w-9 rounded-lg inline-flex items-center justify-center ${active.tone}`}>
                    <active.icon className="h-4 w-4" />
                  </span>
                  {active.label}
                </DialogTitle>
                {active.subtitle && (
                  <p className="text-xs text-muted-foreground pl-12 -mt-1">{active.subtitle}</p>
                )}
              </DialogHeader>

              {active.renderHeader && (
                <div className="mt-1">{active.renderHeader()}</div>
              )}

              <div className="space-y-1 mt-2">
                {active.items.map((n, i) =>
                  editingIdx === i ? (
                    <div
                      key={i}
                      className="rounded-lg bg-surface px-3 py-2.5 space-y-2 border border-border"
                    >
                      <Input
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        placeholder="Title"
                        className="h-8 text-sm font-semibold"
                      />
                      <Textarea
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                        placeholder="Details"
                        className="text-sm min-h-[64px]"
                      />
                      <IconPicker value={draftIcon} onChange={(I) => setDraftIcon(() => I)} accent={active.accent} />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancel}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-background"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                        <button
                          onClick={save}
                          className="inline-flex items-center gap-1 text-xs font-medium text-background bg-foreground px-3 py-1 rounded-md hover:opacity-90"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="group flex items-start gap-3 px-2 py-2.5 rounded-md hover:bg-surface/70 transition-colors relative border-b border-border/50 last:border-b-0"
                    >
                      {n.icon ? (
                        <span
                          className="mt-0.5 h-6 w-6 rounded-md inline-flex items-center justify-center shrink-0 border border-border/70 bg-surface"
                          style={{ color: active.accent }}
                          aria-hidden
                        >
                          <n.icon className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span
                          className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: active.accent }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-foreground leading-tight">
                          {n.title}
                        </div>
                        <p className="mt-1 text-[12.5px] text-muted-foreground leading-relaxed pr-16">
                          {n.body}
                        </p>
                      </div>
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(i)}
                          className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-background text-muted-foreground hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => remove(i)}
                          className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-background text-muted-foreground hover:text-[hsl(var(--destructive))]"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                )}

                {adding && (
                  <div
                    className="rounded-lg bg-surface px-3 py-2.5 space-y-2 border border-border mt-2"
                  >
                    <Input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Title"
                      className="h-8 text-sm font-semibold"
                      autoFocus
                    />
                    <Textarea
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      placeholder="Details"
                      className="text-sm min-h-[64px]"
                    />
                    <IconPicker value={draftIcon} onChange={(I) => setDraftIcon(() => I)} accent={active.accent} />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancel}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-background"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                      <button
                        onClick={save}
                        className="inline-flex items-center gap-1 text-xs font-medium text-background bg-foreground px-3 py-1 rounded-md hover:opacity-90"
                      >
                        <Check className="h-3 w-3" /> Save
                      </button>
                    </div>
                  </div>
                )}

                {!adding && (
                  <button
                    onClick={startAdd}
                    className="mt-3 w-full rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-surface transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="h-3 w-3" /> Add entry
                  </button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <NotifyUserDialog
        open={pending !== null}
        onOpenChange={(o) => { if (!o) setPending(null); }}
        changeLabel={pending?.label ?? ""}
        defaultMessage={pending?.label ?? ""}
        onConfirm={() => { pending?.apply(); setPending(null); }}
      />
    </>
  );
}

// ─── Icon picker (inline, used in add/edit forms) ───────────────────────────
function IconPicker({
  value, onChange, accent,
}: {
  value: ComponentType<{ className?: string }> | undefined;
  onChange: (Icon: ComponentType<{ className?: string }> | undefined) => void;
  accent: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Icon (optional)</div>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          title="No icon"
          className={`h-7 w-7 inline-flex items-center justify-center rounded-md border text-muted-foreground hover:bg-background transition-colors ${
            value === undefined ? "border-foreground bg-background" : "border-border bg-surface"
          }`}
        >
          <X className="h-3 w-3" />
        </button>
        {ICON_PALETTE.map(({ name, Icon }) => {
          const selected = value === Icon;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(Icon)}
              title={name}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md border transition-colors hover:bg-background ${
                selected ? "border-foreground bg-background" : "border-border bg-surface"
              }`}
              style={selected ? { color: accent } : undefined}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
