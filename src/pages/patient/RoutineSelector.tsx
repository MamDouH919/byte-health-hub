import { useState } from "react";
import { Image as ImageIcon, Move, Pencil } from "lucide-react";

const RoutineSelector = () => {
  const [mode, setMode] = useState<"select" | "create">("select");

  return (
    <div className="space-y-6">
      <div className="surface-card p-6 max-w-3xl">
        <header className="flex items-center gap-2 mb-5 text-sm">
          <button onClick={() => setMode("select")} className={mode === "select" ? "font-bold" : "text-muted-foreground"}>
            Select Routine
          </button>
          <span className="text-muted-foreground">|</span>
          <button onClick={() => setMode("create")} className={mode === "create" ? "font-bold" : "text-muted-foreground"}>
            Create new
          </button>
        </header>

        {mode === "select" ? (
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
            <div className="text-sm space-y-4">
              <div>
                <div className="text-muted-foreground mb-2">Time of day</div>
                <ul className="space-y-1">
                  <li><button className="font-semibold">Morning <span className="text-muted-foreground font-normal">(34)</span></button></li>
                  <li><button className="font-semibold">Afternoon <span className="text-muted-foreground font-normal">(42)</span></button></li>
                  <li><button className="font-semibold">Evening <span className="text-muted-foreground font-normal">(27)</span></button></li>
                </ul>
              </div>
              <div>
                <div className="text-muted-foreground mb-2">Condition</div>
                <ul className="space-y-1">
                  <li><button className="font-semibold">Diabetes <span className="text-muted-foreground font-normal">(34)</span></button></li>
                  <li><button className="font-semibold">Back pain <span className="text-muted-foreground font-normal">(42)</span></button></li>
                  <li><button className="font-semibold">Hydration <span className="text-muted-foreground font-normal">(27)</span></button></li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="surface-card bg-background px-5 py-4 flex items-center justify-between hover:shadow-[var(--shadow-card)] cursor-grab">
                  <span className="font-medium">Routine {n}</span>
                  <Move className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="font-semibold w-36">Routine Title</label>
                <input className="flex-1 bg-transparent border-b border-border text-sm py-1 focus:outline-none focus:border-[hsl(var(--brand-blue))]" placeholder="ex. Early wake up drink" />
              </div>
              <div className="flex items-center gap-3">
                <label className="font-semibold w-36">Routine Category</label>
                <input className="flex-1 bg-transparent border-b border-border text-sm py-1 focus:outline-none focus:border-[hsl(var(--brand-blue))]" placeholder="ex. Hydration" />
              </div>
              <div>
                <label className="font-semibold block mb-2">Routine Description</label>
                <textarea
                  maxLength={250}
                  rows={4}
                  defaultValue="This section is dedicated to a description for the routine you have created, it has a max limit of 250 characters."
                  className="w-full surface-card bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue)/0.4)]"
                />
              </div>
              <div className="flex justify-end">
                <button className="surface-card bg-background px-4 py-1.5 text-sm inline-flex items-center gap-2 hover:shadow-[var(--shadow-pop)]">
                  Save <Pencil className="h-3 w-3" />
                </button>
              </div>
            </div>

            <button className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground p-6 h-32">
              <ImageIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">Image upload</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineSelector;
