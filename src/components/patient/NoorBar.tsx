import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { Send, Sparkles, X, GripHorizontal } from "lucide-react";
import { useNoor, type Msg } from "./NoorContext";

const renderText = (text: string) => {
  const lines = text.split("\n");
  return lines.map((ln, i) => {
    if (ln.startsWith("- ")) return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{inline(ln.slice(2))}</li>;
    if (ln.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="text-sm leading-relaxed">{inline(ln)}</p>;
  });
};
const inline = (s: string) => {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
};

const suggestionsForPath = (path: string): string[] => {
  if (path.includes("/exercise")) return ["Why is the plan score low?", "Suggest ACL-safe alternatives", "Compare with last week"];
  if (path.includes("/blood-tests")) return ["Flag any critical values", "Explain low free testosterone", "Recommend follow-up tests"];
  if (path.includes("/profile")) return ["Summarize this patient", "What needs urgent attention?", "Generate a 2-week action plan"];
  if (path.includes("/nutrition")) return ["Suggest meal swaps", "Address late-night eating", "Macros for body recomp"];
  if (path.includes("/sleep")) return ["Why is HRV low?", "Wind-down protocol", "Caffeine cutoff time"];
  return ["Summarize this patient", "What needs attention this week?", "Latest lab insights"];
};

export const NoorBar = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [orbActive, setOrbActive] = useState(false);
  const { msgs, setMsgs } = useNoor();
  const loc = useLocation();
  const suggestions = suggestionsForPath(loc.pathname);

  // Drag state — panel position (top-left in viewport coords)
  const PANEL_W = 420;
  const PANEL_MARGIN = 8;
  const defaultPos = () => ({
    x: typeof window !== "undefined" ? Math.max(PANEL_MARGIN, window.innerWidth - PANEL_W - PANEL_MARGIN) : 16,
    y: 16,
  });
  const [pos, setPos] = useState(defaultPos);
  const dragRef = useRef<{ ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (open) setPos(defaultPos());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onDragStart = (e: React.PointerEvent) => {
    dragRef.current = { ox: e.clientX - pos.x, oy: e.clientY - pos.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const nx = e.clientX - dragRef.current.ox;
    const ny = e.clientY - dragRef.current.oy;
    const maxX = window.innerWidth - PANEL_W - PANEL_MARGIN;
    const maxY = window.innerHeight - 100;
    setPos({
      x: Math.min(Math.max(PANEL_MARGIN, nx), Math.max(PANEL_MARGIN, maxX)),
      y: Math.min(Math.max(PANEL_MARGIN, ny), Math.max(PANEL_MARGIN, maxY)),
    });
  };
  const onDragEnd = () => { dragRef.current = null; };


  // Orb reactivity when generating
  useEffect(() => {
    setOrbActive(generating);
  }, [generating]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text }, { role: "noor", text: "", pending: true }]);
    setGenerating(true);

    const reply = "Based on the latest data, here are the key signals:\n\n- **Adherence** is at 71% — slightly trending up.\n- **Free testosterone** remains in the low band, monitor next cycle.\n- Recovery scores improved on the new mid-week heavy day.\n\nWant me to draft a follow-up note?";

    let i = 0;
    const tick = setInterval(() => {
      i += Math.max(2, Math.floor(reply.length / 60));
      setMsgs((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last && last.role === "noor") {
          copy[copy.length - 1] = { role: "noor", text: reply.slice(0, i), pending: i < reply.length };
        }
        return copy;
      });
      if (i >= reply.length) {
        clearInterval(tick);
        setGenerating(false);
      }
    }, 30);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-11 pl-2 pr-4 rounded-full bg-surface border border-[hsl(var(--surface-border)/0.6)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-pop)] transition-all hover:scale-[1.03]"
        aria-label="Open Noor"
      >
        <span className={`relative h-7 w-7 rounded-full noor-orb inline-flex items-center justify-center ${orbActive ? "animate-pulse-once" : "noor-pulse"}`}>
          <Sparkles className="h-3.5 w-3.5 text-white/95" />
        </span>
        <span className="text-sm font-medium">Noor</span>
      </button>

      {open && createPortal(
        <aside
          role="dialog"
          aria-label="Noor assistant"
          style={{ left: pos.x, top: pos.y, width: PANEL_W, height: `calc(100vh - ${pos.y + 16}px)`, maxHeight: "calc(100vh - 16px)" }}
          className="fixed z-50 max-w-[calc(100vw-1rem)] bg-background rounded-2xl border border-border shadow-[var(--shadow-pop)] flex flex-col overflow-hidden animate-scale-in"
        >
          <header
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-[hsl(220_14%_94%)] to-background cursor-grab active:cursor-grabbing select-none touch-none"
          >
            <div className="flex items-center gap-3">
              <span className={`relative h-9 w-9 rounded-full noor-orb inline-flex items-center justify-center transition-transform duration-1000 ease-in-out ${generating ? "scale-105" : "scale-100"}`}>
                <Sparkles className="h-4 w-4 text-white/95" />
              </span>
              <div className="leading-tight">
                <div className="font-semibold">Noor</div>
                <div className="text-xs text-muted-foreground">{generating ? "Thinking…" : "Your health intelligence assistant"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <GripHorizontal className="h-4 w-4 text-muted-foreground/60" />
              <button
                onClick={() => setOpen(false)}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Close"
                className="p-1 rounded hover:bg-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {msgs.map((m: Msg, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end animate-fade-in">
                    <div className="bubble-user max-w-[80%]">{m.text}</div>
                  </div>
                ) : (
                  <div key={i} className="space-y-1.5 animate-fade-in">
                    {m.pending && m.text === "" ? (
                      <div className="inline-flex items-center gap-1 text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-blink" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-blink" style={{ animationDelay: "200ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-blink" style={{ animationDelay: "400ms" }} />
                      </div>
                    ) : (
                      <>
                        {renderText(m.text)}
                        {m.pending && <span className="inline-block w-1.5 h-3.5 bg-foreground/60 align-middle animate-blink" />}
                      </>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Contextual suggestion chips */}
            <div className="px-4 pt-3 pb-2 flex gap-1.5 flex-wrap border-t border-border">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  disabled={generating}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="px-4 pb-4 pt-2">
              <div className="flex items-center gap-2 surface-card bg-surface px-4 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && ask(input)}
                  placeholder="ask anything"
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                />
                <button onClick={() => ask(input)} aria-label="Send" className="text-[hsl(var(--brand-blue))] disabled:opacity-30" disabled={generating || !input.trim()}>
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
        </aside>,
        document.body
      )}
    </>
  );
};
