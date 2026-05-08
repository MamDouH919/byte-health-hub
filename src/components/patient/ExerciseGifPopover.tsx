import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ExternalLink, Play } from "lucide-react";
import { getExerciseGif } from "@/lib/exercise-gifs";

interface Props {
  name: string;
  children: React.ReactNode;
}

/**
 * Hover-only preview that shows a small animated GIF of the exercise.
 * Demo-only — the GIF library is approximate, not a clinical reference.
 */
export const ExerciseGifPopover = ({ name, children }: Props) => {
  const gif = getExerciseGif(name);
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-4 hover:decoration-foreground/60">
          {children}
          <Play className="h-2.5 w-2.5 text-muted-foreground/70" />
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-56 p-2 rounded-xl border border-border shadow-[var(--shadow-pop)] bg-background"
      >
        <div className="rounded-lg overflow-hidden bg-surface aspect-video flex items-center justify-center">
          <img
            src={gif}
            alt={`${name} demo`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 px-1">
          <span className="text-[11px] font-medium truncate">{name}</span>
          <a
            href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(name + " exercise gif")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
          >
            open <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
