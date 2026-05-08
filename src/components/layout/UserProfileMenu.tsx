import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";

export const UserProfileMenu = ({ user = "Sajeda Ayesh" }: { user?: string }) => {
  const [open, setOpen] = useState(false);
  const { role, signOut, name } = useAuth();
  const navigate = useNavigate();
  const displayName = name || user;
  const initials = displayName.replace(/^Dr\.\s+/i, "").split(" ").map((p) => p[0]).slice(0, 2).join("");
  const doctor = {
    name: displayName.replace(/^Dr\.\s+/i, ""),
    initials,
    title: role === "clinician" ? "Dr." : "",
    role: role === "clinician" ? "Lead Clinician" : "Patient",
    email: role === "clinician" ? "sajeda.ayesh@noor.health" : "yassin@example.com",
  };
  const onSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open profile"
          className="flex items-center gap-2 rounded-full hover:bg-surface px-1 py-0.5 transition-colors"
        >
          <span className="text-xs font-medium hidden sm:inline">{displayName}</span>
          <span className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-[10px] font-semibold text-muted-foreground bg-background">
            {initials}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[260px] p-0 overflow-hidden border border-border shadow-[var(--shadow-pop)] rounded-xl"
      >
        {/* Header */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-border">
          <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold shrink-0">
            {doctor.initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">
              {doctor.title} {doctor.name}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{doctor.role}</div>
          </div>
        </div>

        {/* Email */}
        <div className="px-4 py-2.5 flex items-center gap-2 text-[11px] text-muted-foreground border-b border-border">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{doctor.email}</span>
        </div>

        {/* Actions */}
        <div className="py-1">
          <button className="w-full px-4 py-2 text-xs font-medium text-left hover:bg-surface inline-flex items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-muted-foreground" /> Account settings
          </button>
          <button onClick={onSignOut} className="w-full px-4 py-2 text-xs font-medium text-left hover:bg-surface inline-flex items-center gap-2 text-[hsl(0_85%_45%)]">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
