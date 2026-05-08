import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Check, Sparkles, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { catalogByCategory, type MedCategory, type CatalogEntry } from "@/lib/meds-catalog";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: MedCategory;
  categoryLabel: string;
  existingNames: string[];
  onAdd: (entry: CatalogEntry) => void;
}

export const AddMedDialog = ({ open, onOpenChange, category, categoryLabel, existingNames, onAdd }: Props) => {
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", dose: "", detail: "" });

  useEffect(() => {
    if (!open) {
      setQ("");
      setCreating(false);
      setDraft({ name: "", dose: "", detail: "" });
    }
  }, [open]);
  const items = useMemo(() => catalogByCategory(category), [category]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (i) => !needle || i.name.toLowerCase().includes(needle) || i.group.toLowerCase().includes(needle),
    );
  }, [items, q]);

  // Group by `.group` for visual structure
  const grouped = useMemo(() => {
    const map = new Map<string, CatalogEntry[]>();
    filtered.forEach((it) => {
      if (!map.has(it.group)) map.set(it.group, []);
      map.get(it.group)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const exists = (name: string) => existingNames.includes(name);
  const exactMatch = items.some((i) => i.name.toLowerCase() === q.trim().toLowerCase());

  const submitCustom = () => {
    const name = draft.name.trim();
    if (!name) return;
    onAdd({
      name,
      defaultDose: draft.dose.trim() || "—",
      defaultDetail: draft.detail.trim() || "Custom item",
      category,
      group: "Custom",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            {creating && (
              <button
                onClick={() => setCreating(false)}
                className="h-7 w-7 -ml-1 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface"
                aria-label="Back to search"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <DialogTitle className="text-base">
              {creating ? `New item in ${categoryLabel}` : `Add to ${categoryLabel}`}
            </DialogTitle>
          </div>
          {!creating && (
            <div className="relative mt-3">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or group…"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </DialogHeader>

        {creating ? (
          <div className="px-5 py-4 space-y-3">
            <Field label="Name">
              <input
                autoFocus
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Magnesium malate"
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Dose">
              <input
                value={draft.dose}
                onChange={(e) => setDraft((d) => ({ ...d, dose: e.target.value }))}
                placeholder="e.g. 400 mg"
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Detail / instructions">
              <input
                value={draft.detail}
                onChange={(e) => setDraft((d) => ({ ...d, detail: e.target.value }))}
                placeholder="e.g. With evening meal"
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCreating(false)}
                className="h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={submitCustom}
                disabled={!draft.name.trim()}
                className="h-9 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create & add
              </button>
            </div>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto px-2 py-2">
            <button
              onClick={() => {
                setDraft((d) => ({ ...d, name: q.trim() }));
                setCreating(true);
              }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 mb-1 rounded-md text-left hover:bg-surface transition-colors border border-dashed border-border"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {q.trim() && !exactMatch ? `Create "${q.trim()}"` : "Create custom item"}
                  </div>
                  <div className="text-xs text-muted-foreground">Not in catalog? Add your own.</div>
                </div>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>

            {grouped.length === 0 && (
              <p className="text-xs text-muted-foreground italic px-3 py-6 text-center">
                No catalog matches — use “Create” above.
              </p>
            )}
            {grouped.map(([group, entries]) => (
              <div key={group} className="mb-2 last:mb-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5">
                  {group}
                </div>
                <ul>
                  {entries.map((entry) => {
                    const already = exists(entry.name);
                    return (
                      <li key={entry.name}>
                        <button
                          disabled={already}
                          onClick={() => {
                            onAdd(entry);
                            onOpenChange(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-left transition-colors",
                            already ? "opacity-50 cursor-not-allowed" : "hover:bg-surface",
                          )}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{entry.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {entry.defaultDose} · {entry.defaultDetail}
                            </div>
                          </div>
                          {already ? (
                            <Check className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);
