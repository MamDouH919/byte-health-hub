import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import { patients } from "@/lib/data";

type Item = {
  id: string;
  label: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  action: () => void;
};

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQ("");
        setActive(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const patientItems: Item[] = patients.map((p) => ({
    id: `p-${p.id}`,
    label: p.name,
    group: "Patients",
    icon: User,
    hint: `${p.company} · ID ${p.userId}`,
    action: () => navigate(`/patient/${p.id}/profile`),
  }));

  const all = [...patientItems];
  const filtered = q
    ? all.filter((i) => (i.label + " " + (i.hint ?? "")).toLowerCase().includes(q.toLowerCase()))
    : all;

  // group filtered
  const grouped = filtered.reduce<Record<string, Item[]>>((acc, i) => {
    (acc[i.group] ||= []).push(i);
    return acc;
  }, {});

  const flat = filtered;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[active];
      if (item) { item.action(); setOpen(false); }
    }
  };

  if (!open) return null;

  let runningIdx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 animate-fade-in" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-label="Command palette"
        className="relative w-full max-w-xl bg-background rounded-2xl border border-border shadow-[var(--shadow-pop)] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search by patient name, company, or User ID…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex kbd">ESC</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-2">
          {flat.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">No matches for "{q}"</div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="py-1">
              <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{group}</div>
              {items.map((item) => {
                runningIdx += 1;
                const isActive = runningIdx === active;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onMouseEnter={() => setActive(flat.indexOf(item))}
                    onClick={() => { item.action(); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left ${isActive ? "bg-surface" : ""}`}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.hint && <span className="text-xs text-muted-foreground">{item.hint}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-border bg-surface text-[10px] text-muted-foreground flex items-center justify-between">
          <span>↑↓ navigate · ↵ select</span>
          <span><kbd className="kbd">⌘K</kbd> to toggle</span>
        </div>
      </div>
    </div>
  );
};
