import { Footprints, Moon, Salad, Droplet, ClipboardCheck, type LucideIcon } from "lucide-react";

export type NudgeCategoryId = "movement" | "sleep" | "nutrition" | "hydration" | "adherence";

export interface NudgeCategory {
  id: NudgeCategoryId;
  label: string;
  icon: LucideIcon;
  /** Soft pastel tone (bg + fg) reusing existing semantic tokens */
  toneBg: string;
  toneFg: string;
}

export const NUDGE_CATEGORIES: NudgeCategory[] = [
  { id: "movement",  label: "Movement",  icon: Footprints,    toneBg: "bg-[hsl(var(--status-attention-bg))]", toneFg: "text-[hsl(var(--status-attention-fg))]" },
  { id: "sleep",     label: "Sleep",     icon: Moon,          toneBg: "bg-[hsl(var(--status-neutral-bg))]",   toneFg: "text-[hsl(var(--status-neutral-fg))]" },
  { id: "nutrition", label: "Nutrition", icon: Salad,         toneBg: "bg-[hsl(var(--status-optimal-bg))]",   toneFg: "text-[hsl(var(--status-optimal-fg))]" },
  { id: "hydration", label: "Hydration", icon: Droplet,       toneBg: "bg-[hsl(var(--brand-blue)/0.12)]",     toneFg: "text-[hsl(var(--brand-blue))]" },
  { id: "adherence", label: "Adherence", icon: ClipboardCheck,toneBg: "bg-[hsl(var(--status-critical-bg))]",  toneFg: "text-[hsl(var(--status-critical-fg))]" },
];

export interface NudgeTemplate {
  id: string;
  title: string;
  body: string; // supports {{firstName}}
}

export const NUDGE_TEMPLATES: Record<NudgeCategoryId, NudgeTemplate[]> = {
  movement: [
    { id: "mv-1", title: "Personal check-in", body: "Hey {{firstName}}, it's {{clinicianName}} — I noticed your steps have dipped this week. No pressure, but a 15-min walk today would really help. Let me know how you're feeling.\n\n— {{clinicianName}}" },
    { id: "mv-2", title: "Just a thought",    body: "{{firstName}}, popping in personally — your body's asking for a little more movement. Could you fit a short stretch break every hour today? I'll check in tomorrow.\n\n— {{clinicianName}}" },
    { id: "mv-3", title: "Let's reset",       body: "Hi {{firstName}}, {{clinicianName}} here. Want to try a small reset together? Aim for 6,000 steps and one mobility session today — message me if anything feels off.\n\n— {{clinicianName}}" },
  ],
  sleep: [
    { id: "sl-1", title: "Personal check-in", body: "Hey {{firstName}}, {{clinicianName}} here. I've been watching your sleep trend and I'd love for you to try lights-off 30 min earlier tonight. Curious if it shifts how you feel tomorrow.\n\n— {{clinicianName}}" },
    { id: "sl-2", title: "A small ask",       body: "{{firstName}}, this is a personal one from me — try keeping bedtime within ±30 min this week. It'll do more than any supplement. I'm here if you want to talk it through.\n\n— {{clinicianName}}" },
    { id: "sl-3", title: "Let's experiment",  body: "Hi {{firstName}}, want to run a small experiment with me? Last coffee before 1pm for 3 days. I'll review your sleep with you on Friday.\n\n— {{clinicianName}}" },
  ],
  nutrition: [
    { id: "nu-1", title: "Personal check-in", body: "Hey {{firstName}}, {{clinicianName}} here — quick personal nudge: try starting each meal with protein today. Tell me how your afternoon energy feels.\n\n— {{clinicianName}}" },
    { id: "nu-2", title: "One simple goal",   body: "{{firstName}}, just from me to you — half your plate veg at lunch and dinner this week. That's the only goal. I'll check in Friday.\n\n— {{clinicianName}}" },
    { id: "nu-3", title: "Let's stay close",  body: "Hi {{firstName}}, {{clinicianName}} here. Could you log your meals before noon today? It really helps me tune your plan around what's working for you.\n\n— {{clinicianName}}" },
  ],
  hydration: [
    { id: "hy-1", title: "Personal check-in", body: "Hey {{firstName}}, {{clinicianName}} — quick one from me: refill your bottle now and aim for 2L today. Your HR and sleep will thank you.\n\n— {{clinicianName}}" },
    { id: "hy-2", title: "Small habit",       body: "{{firstName}}, a personal favour — a glass of water before each meal today. Tiny habit, big difference. Let me know if you stick with it.\n\n— {{clinicianName}}" },
    { id: "hy-3", title: "Tomorrow's start",  body: "Hi {{firstName}}, {{clinicianName}} here. Try starting tomorrow with 500ml right after waking. I'll ask you about it on our next call.\n\n— {{clinicianName}}" },
  ],
  adherence: [
    { id: "ad-1", title: "Just checking in",  body: "Hey {{firstName}}, {{clinicianName}} here — haven't seen you in the app in a few days. Everything okay? Anything in the plan we should adjust together?\n\n— {{clinicianName}}" },
    { id: "ad-2", title: "From me to you",    body: "{{firstName}}, this is personal — pick just one thing from your plan today. Momentum matters more than perfection, and I'm in your corner.\n\n— {{clinicianName}}" },
    { id: "ad-3", title: "Quick favour",      body: "Hi {{firstName}}, {{clinicianName}} here. Could you log today's meals and training when you get a moment? Helps me keep your plan dialled in for you.\n\n— {{clinicianName}}" },
  ],
};

export const renderNudge = (body: string, firstName: string, clinicianName = "Dr. Sarah") =>
  body
    .replace(/\{\{firstName\}\}/g, firstName || "there")
    .replace(/\{\{clinicianName\}\}/g, clinicianName);
