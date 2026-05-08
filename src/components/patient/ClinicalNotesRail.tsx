import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ClipboardList, ChevronLeft, ChevronDown, ChevronUp, Pin, PinOff, Send, Filter, Inbox } from "lucide-react";
import { clinicalNotes } from "@/lib/data";
import { EmptyState } from "@/components/brand/Skeleton";
import { toast } from "@/hooks/use-toast";

const specMap: Record<string, string> = {
  Orthopedic:      "bg-[hsl(var(--spec-ortho-bg))]     text-[hsl(var(--spec-ortho-fg))]",
  Nutritionist:    "bg-[hsl(var(--spec-nutrition-bg))] text-[hsl(var(--spec-nutrition-fg))]",
  Physiotherapist: "bg-[hsl(var(--spec-physio-bg))]    text-[hsl(var(--spec-physio-fg))]",
};
const specialties = ["Orthopedic", "Nutritionist", "Physiotherapist"] as const;

type Spec = typeof specialties[number];
type Note = {
  id: number; author: string; date: string; specialty: Spec; body: string;
  mine?: boolean; pinned?: boolean;
};

const CURRENT_CLINICIAN = "Dr. Sajeda Ayesh";

// Roster of taggable clinicians — built from existing notes + the current user.
const ROSTER: { name: string; specialty: Spec }[] = (() => {
  const seen = new Map<string, Spec>();
  seen.set(CURRENT_CLINICIAN, "Physiotherapist");
  for (const n of clinicalNotes) if (!seen.has(n.author)) seen.set(n.author, n.specialty as Spec);
  return Array.from(seen, ([name, specialty]) => ({ name, specialty }));
})();

// Parse @mentions out of a draft. Matches names from the roster (longest first to avoid partial overlap).
const parseMentions = (text: string): string[] => {
  const sortedNames = [...ROSTER.map((r) => r.name)].sort((a, b) => b.length - a.length);
  const found = new Set<string>();
  for (const name of sortedNames) {
    const re = new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    if (re.test(text)) found.add(name);
  }
  return Array.from(found);
};

// Render a note body with highlighted @mentions.
const renderBodyWithMentions = (body: string) => {
  const names = ROSTER.map((r) => r.name).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`@(?:${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts: Array<string | { mention: string }> = [];
  let last = 0;
  for (const m of body.matchAll(pattern)) {
    if (m.index! > last) parts.push(body.slice(last, m.index));
    parts.push({ mention: m[0] });
    last = m.index! + m[0].length;
  }
  if (last < body.length) parts.push(body.slice(last));
  return parts.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : (
      <span key={i} className="inline-flex items-center font-medium text-[hsl(var(--brand-blue))] bg-[hsl(var(--brand-blue)/0.08)] px-1 rounded">
        {p.mention}
      </span>
    )
  );
};

export const ClinicalNotesRail = ({ asTabItem = false }: { asTabItem?: boolean } = {}) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"mine" | "others">("others");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [draft, setDraft] = useState("");
  const [specFilter, setSpecFilter] = useState<"all" | Spec>("all");
  const [notes, setNotes] = useState<Note[]>(
    clinicalNotes.map((n) => ({ ...n, mine: false, pinned: false }))
  );
  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mentionMatches = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return ROSTER.filter((r) => r.name !== CURRENT_CLINICIAN && r.name.toLowerCase().includes(q)).slice(0, 6);
  }, [mentionQuery]);

  useEffect(() => { setMentionIndex(0); }, [mentionQuery]);

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);
    const caret = e.target.selectionStart ?? value.length;
    const upToCaret = value.slice(0, caret);
    // Detect "@token" with no whitespace after @ at the caret
    const m = upToCaret.match(/(?:^|\s)@([\w .'-]{0,40})$/);
    setMentionQuery(m ? m[1] : null);
  };

  const insertMention = (name: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? draft.length;
    const before = draft.slice(0, caret);
    const after = draft.slice(caret);
    const replaced = before.replace(/(^|\s)@([\w .'-]{0,40})$/, (_, p1) => `${p1}@${name} `);
    const next = replaced + after;
    setDraft(next);
    setMentionQuery(null);
    requestAnimationFrame(() => {
      el.focus();
      const pos = replaced.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const toggleExpand = (id: number) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const togglePin = (id: number) => {
    setNotes((n) => n.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)));
  };

  const visible = useMemo(() => {
    let list = notes.filter((n) => (tab === "mine" ? n.mine : !n.mine));
    if (specFilter !== "all") list = list.filter((n) => n.specialty === specFilter);
    // pinned first
    return [...list].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  }, [notes, tab, specFilter]);

  const submit = () => {
    if (!draft.trim()) return;
    const body = draft.trim();
    const mentioned = parseMentions(body).filter((name) => name !== CURRENT_CLINICIAN);
    const newNote: Note = {
      id: Date.now(),
      author: CURRENT_CLINICIAN,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      specialty: "Physiotherapist",
      body,
      mine: true,
    };
    setNotes((n) => [newNote, ...n]);
    setDraft("");
    setMentionQuery(null);
    setTab("mine");
    setExpandedIds((prev) => new Set([...prev, newNote.id]));
    if (mentioned.length > 0) {
      toast({
        title: `Tagged ${mentioned.length} clinician${mentioned.length > 1 ? "s" : ""}`,
        description: `Notification sent to ${mentioned.join(", ")}.`,
      });
    } else {
      toast({ title: "Note submitted", description: "Saved to clinical notes." });
    }
  };

  return (
    <>
      {asTabItem ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`tab-item ${open ? "invisible" : ""}`}
          aria-label="Open clinical notes"
        >
          <ClipboardList className="h-4 w-4" />
          Notes
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-2 h-11 pl-3 pr-4 rounded-full bg-surface border border-[hsl(var(--surface-border)/0.6)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-pop)] transition-all hover:scale-[1.03] ${open ? "invisible" : ""}`}
          aria-label="Open clinical notes"
        >
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Clinical Notes</span>
        </button>
      )}

      {open && createPortal(
        <>
          <div className="fixed inset-0 bg-foreground/10 backdrop-blur-[2px] z-40 animate-fade-in" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-[400px] bg-background border-r border-border shadow-[var(--shadow-pop)] z-50 flex flex-col animate-slide-in-right">
            <div className="px-5 py-5 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span className="font-semibold">Clinical Notes</span>
                <span className="text-muted-foreground text-sm">| Yassin Asfour</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close"><ChevronLeft className="h-4 w-4" /></button>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-4">
              <div className="inline-flex p-1 rounded-full bg-surface border border-border text-xs">
                {(["mine", "others"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                      tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "mine" ? "My Notes" : "Others"}
                    <span className="ml-1.5 opacity-70">
                      {notes.filter((n) => (t === "mine" ? n.mine : !n.mine)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Specialty filter chips */}
            <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3 w-3 text-muted-foreground mr-1" />
              <button
                onClick={() => setSpecFilter("all")}
                className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                  specFilter === "all" ? "bg-foreground text-background border-foreground" : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {specialties.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecFilter(s)}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                    specFilter === s
                      ? `${specMap[s]} border-transparent`
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {visible.length === 0 && (
                <EmptyState
                  icon={Inbox}
                  title={tab === "mine" ? "No notes yet" : "No notes from other clinicians"}
                  description={tab === "mine" ? "Add your first observation below." : "Adjust filters or check back later."}
                />
              )}
              {visible.map((n) => {
                const isOpen = expandedIds.has(n.id);
                return (
                  <article
                    key={n.id}
                    className={`surface-card overflow-hidden transition-all animate-fade-in ${n.pinned ? "ring-1 ring-[hsl(var(--brand-blue)/0.4)]" : ""}`}
                  >
                    <div className="w-full px-4 py-3 flex items-center justify-between gap-2 hover:bg-background/50">
                      <button onClick={() => toggleExpand(n.id)} className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          {n.pinned && <Pin className="h-3 w-3 text-[hsl(var(--brand-blue))] shrink-0" />}
                          <span className="font-semibold text-sm truncate">{n.author}</span>
                          <span className={`pill ${specMap[n.specialty]}`}>{n.specialty}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{n.date}</div>
                      </button>
                      <button
                        onClick={() => togglePin(n.id)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        aria-label={n.pinned ? "Unpin" : "Pin"}
                      >
                        {n.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => toggleExpand(n.id)} className="p-1 text-muted-foreground" aria-label="Toggle">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                    {isOpen && (
                      <div className="px-4 pb-4 animate-fade-in">
                        <p className="text-sm text-foreground/80 leading-relaxed border-t border-border pt-3 whitespace-pre-wrap">{renderBodyWithMentions(n.body)}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="px-4 py-4 border-t border-border">
              <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Add note as {CURRENT_CLINICIAN}
              </div>
              <div className="relative flex items-end gap-2">
                {/* Mention suggestions popover */}
                {mentionQuery !== null && mentionMatches.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-[260px] surface-card bg-background shadow-[var(--shadow-pop)] rounded-xl overflow-hidden z-10 animate-fade-in">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                      Tag clinician
                    </div>
                    <ul className="max-h-56 overflow-y-auto">
                      {mentionMatches.map((r, i) => (
                        <li key={r.name}>
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); insertMention(r.name); }}
                            onMouseEnter={() => setMentionIndex(i)}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 text-sm ${
                              i === mentionIndex ? "bg-surface" : "hover:bg-surface/60"
                            }`}
                          >
                            <span className="font-medium truncate">{r.name}</span>
                            <span className={`pill ${specMap[r.specialty]} shrink-0`}>{r.specialty}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={handleDraftChange}
                  onKeyDown={(e) => {
                    if (mentionQuery !== null && mentionMatches.length > 0) {
                      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((i) => (i + 1) % mentionMatches.length); return; }
                      if (e.key === "ArrowUp")   { e.preventDefault(); setMentionIndex((i) => (i - 1 + mentionMatches.length) % mentionMatches.length); return; }
                      if (e.key === "Enter" || e.key === "Tab") {
                        e.preventDefault();
                        insertMention(mentionMatches[mentionIndex].name);
                        return;
                      }
                      if (e.key === "Escape") { setMentionQuery(null); return; }
                    }
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
                  }}
                  placeholder="Write a clinical note... use @ to tag a clinician"
                  rows={2}
                  className="flex-1 surface-card px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue)/0.4)] resize-none"
                />
                <button
                  onClick={submit}
                  disabled={!draft.trim()}
                  className="h-10 w-10 rounded-lg bg-foreground text-background flex items-center justify-center hover:opacity-90 disabled:opacity-30"
                  aria-label="Submit note"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </>,
        document.body
      )}
    </>
  );
};
