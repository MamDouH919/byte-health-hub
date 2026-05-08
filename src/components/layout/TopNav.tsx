import { Command, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NoorBar } from "@/components/patient/NoorBar";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";
import { ContextSwitchersCompact } from "@/components/brand/ContextSwitchers";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { useTheme } from "@/hooks/use-theme";

export const TopNav = ({
  user = "Sajeda Ayesh",
  showNoor = false,
  compact = false,
  subtitle,
  showSwitchers = false,
}: {
  user?: string;
  showNoor?: boolean;
  compact?: boolean;
  subtitle?: string;
  showSwitchers?: boolean;
}) => {
  const { theme, toggleTheme } = useTheme();
  const triggerCmd = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full px-6 flex items-center justify-between bg-gradient-to-r from-secondary via-muted to-background border-b border-border transition-[padding] duration-300 ${
        compact ? "py-1.5" : "py-2.5"
      }`}
    >
      <div className="flex items-center gap-3">
        <Logo />
        {compact && subtitle && (
          <span className="hidden sm:inline-flex items-center text-sm text-muted-foreground border-l border-border pl-3 ml-1 animate-fade-in">
            {subtitle}
          </span>
        )}
        {showSwitchers && (
          <div className="hidden md:flex items-center gap-2 border-l border-border pl-3 ml-1">
            <ContextSwitchersCompact />
            <button
              onClick={triggerCmd}
              className="hidden md:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-background/60 border border-border text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open command palette"
            >
              <Command className="h-3 w-3" />
              <span>Search…</span>
              <kbd className="ml-1 font-mono text-[10px] border border-border rounded px-1 bg-surface">⌘K</kbd>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showNoor && <NoorBar />}
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <NotificationsMenu />
        <UserProfileMenu user={user} />
      </div>
    </header>
  );
};
