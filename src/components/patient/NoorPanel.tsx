import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface Msg { role: "user" | "noor"; text: string; }

const seedMessages: Msg[] = [
  { role: "noor", text: "Hello Dr. Sajeda Ayesh, ask me anything. Would you like to know potential issues regarding Yassin's **CBC profile or hormone panel?**" },
  { role: "user", text: "Give me a summary of Yassin's Blood Tests and in particular CBC" },
  { role: "noor", text: "Yassin's blood tests show mostly normal results, but there are a few concerns:\n\n- **Elevated white blood cells** suggest possible **infection** or **inflammation**.\n- **Low free testosterone**, despite normal total testosterone, may indicate **hormonal imbalance**.\n- Slightly **low hemoglobin**, possibly **mild anemia**.\n\nOverall, results are stable but warrant follow-up for immune and hormone-related issues" },
];

// Tiny markdown -> JSX (bold + bullets) without adding a dep
const renderText = (text: string) => {
  const lines = text.split("\n");
  return lines.map((ln, i) => {
    if (ln.startsWith("- ")) {
      return (
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
          {inline(ln.slice(2))}
        </li>
      );
    }
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

export const NoorPanel = ({ compact = false }: { compact?: boolean }) => {
  const [msgs, setMsgs] = useState<Msg[]>(seedMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: input }, { role: "noor", text: "Looking into Yassin's records — I'll surface the most relevant findings shortly. *(demo response)*" }]);
    setInput("");
  };

  return (
    <aside className="surface-card bg-background flex flex-col h-full overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <span className="relative h-8 w-8 rounded-full noor-orb noor-pulse inline-flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-white/95" />
        </span>
        <div className="leading-tight">
          <div className="font-semibold">Noor</div>
          <div className="text-xs text-muted-foreground">Your health intelligence assistant</div>
        </div>
      </header>

      {!compact && (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {msgs.map((m, i) => (
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="bubble-user max-w-[80%]">{m.text}</div>
                </div>
              ) : (
                <div key={i} className="space-y-1.5">{renderText(m.text)}</div>
              )
            ))}
          </div>

          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center gap-2 surface-card bg-surface px-4 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="ask anything"
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
              />
              <button onClick={send} aria-label="Send" className="text-[hsl(var(--brand-blue))]">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};
