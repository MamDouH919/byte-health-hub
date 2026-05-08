import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BellRing, Send } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  NUDGE_CATEGORIES,
  NUDGE_TEMPLATES,
  renderNudge,
  type NudgeCategoryId,
} from "@/lib/nudge-templates";
import type { PatientRow } from "@/lib/data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: PatientRow[];
  defaultCategory?: NudgeCategoryId;
  onSent: (category: NudgeCategoryId, patientIds: string[]) => void;
}

const firstName = (full: string) => full.split(" ")[0] ?? full;

export const NudgeDialog = ({ open, onOpenChange, patients, defaultCategory = "movement", onSent }: Props) => {
  const [category, setCategory] = useState<NudgeCategoryId>(defaultCategory);
  const [templateId, setTemplateId] = useState<string>(NUDGE_TEMPLATES[defaultCategory][0].id);

  // Reset to defaults whenever the dialog re-opens or target changes
  useEffect(() => {
    if (open) {
      setCategory(defaultCategory);
      setTemplateId(NUDGE_TEMPLATES[defaultCategory][0].id);
    }
  }, [open, defaultCategory]);

  // Keep template valid when category changes
  useEffect(() => {
    const list = NUDGE_TEMPLATES[category];
    if (!list.some((t) => t.id === templateId)) setTemplateId(list[0].id);
  }, [category, templateId]);

  const template = useMemo(
    () => NUDGE_TEMPLATES[category].find((t) => t.id === templateId) ?? NUDGE_TEMPLATES[category][0],
    [category, templateId],
  );

  const previewName = patients[0] ? firstName(patients[0].name) : "there";
  const preview = renderNudge(template.body, previewName);

  const visibleNames = patients.slice(0, 3).map((p) => p.name);
  const overflow = Math.max(0, patients.length - visibleNames.length);

  const handleSend = () => {
    if (patients.length === 0) return;
    onSent(category, patients.map((p) => p.id));
    const cat = NUDGE_CATEGORIES.find((c) => c.id === category)!;
    toast.success(
      patients.length === 1
        ? `Nudge sent to ${patients[0].name}`
        : `Nudge sent to ${patients.length} patients`,
      { description: `${cat.label} · "${template.title}"`, icon: <BellRing className="h-4 w-4" /> },
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-base">
            Send a personal nudge to {patients.length} patient{patients.length === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            A direct message from you — separate from the automated notifications they already receive.
          </DialogDescription>
          {patients.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {visibleNames.map((n) => (
                <span
                  key={n}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-surface border border-border text-foreground/80"
                >
                  {n}
                </span>
              ))}
              {overflow > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">
                  +{overflow} more
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Category picker */}
          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Category
            </div>
            <div className="flex flex-wrap gap-1.5">
              {NUDGE_CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = c.id === category;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={[
                      "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
                      active
                        ? `${c.toneBg} ${c.toneFg} border-transparent font-semibold`
                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-surface",
                    ].join(" ")}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Template picker */}
          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Template
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {NUDGE_TEMPLATES[category].map((t) => {
                const active = t.id === templateId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={[
                      "text-left rounded-xl border px-3 py-2.5 transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:bg-surface",
                    ].join(" ")}
                  >
                    <div className="text-xs font-semibold">{t.title}</div>
                    <div
                      className={[
                        "text-[11px] mt-1 line-clamp-2 leading-snug",
                        active ? "text-background/70" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {t.body.replace(/\{\{firstName\}\}/g, "…")}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Preview */}
          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center justify-between gap-2">
              <span>
                Personal message {patients.length > 1 && <span className="normal-case font-normal text-muted-foreground/80">· using {previewName}'s first name</span>}
              </span>
              <span className="normal-case font-normal text-[10px] text-muted-foreground/80">
                Sent personally · not an automated notification
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-[hsl(var(--status-neutral-bg))] px-4 py-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
              {preview}
            </div>
          </section>
        </div>

        <div className="px-6 py-3 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-surface"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={patients.length === 0}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
            Send nudge{patients.length > 1 && <span className="tabular-nums opacity-80">({patients.length})</span>}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
