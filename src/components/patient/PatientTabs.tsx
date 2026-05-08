import { NavLink, useLocation, useParams } from "react-router-dom";
import { Apple, ChevronDown, Dumbbell, FileText, Moon, Pill, User } from "lucide-react";
import { useRef, useState } from "react";
import { ClinicalNotesRail } from "@/components/patient/ClinicalNotesRail";
import { useAuth } from "@/lib/auth";

const tabs = [
  { key: "reports",   label: "Analytics", icon: FileText, hasMenu: true },
  { key: "profile",   label: "profile",   icon: User },
  { key: "nutrition", label: "Nutrition", icon: Apple },
  { key: "exercise",  label: "Exercise",  icon: Dumbbell },
  { key: "sleep",     label: "Sleep",     icon: Moon },
  { key: "meds",      label: "Meds",      icon: Pill },
];

const reportItems = ["Body composition", "Blood tests", "User survey", "Physio assessment", "Wearable data"];

export const PatientTabs = () => {
  const { id } = useParams();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const { role } = useAuth();
  const showNotes = role === "clinician";

  const openMenu = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  return (
    <div className="relative inline-block">
      <nav className="tab-bar">
        {tabs.map((t) => {
          const to = `/patient/${id}/${t.key === "reports" ? "reports" : t.key}`;
          const active =
            t.key === "reports"
              ? loc.pathname.includes("/reports")
              : loc.pathname.endsWith(`/${t.key}`);
          if (t.key === "reports") {
            return (
              <div
                key={t.key}
                className="inline-flex items-center"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
              >
                <NavLink to={to} className="tab-item !pr-1" data-active={active}>
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </NavLink>
                <button
                  data-active={active}
                  onClick={() => setOpen((o) => !o)}
                  className="tab-item !px-1 !-ml-1"
                  aria-label="Analytics menu"
                  aria-expanded={open}
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
              </div>
            );
          }
          return (
            <NavLink key={t.key} to={to} className="tab-item" data-active={active}>
              <t.icon className="h-4 w-4" />
              {t.label}
            </NavLink>
          );
        })}
        {showNotes && <ClinicalNotesRail asTabItem />}
      </nav>

      {open && (
        <div
          className="absolute left-0 mt-3 w-64 surface-card bg-background shadow-[var(--shadow-pop)] py-2 z-30"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          {reportItems.map((label) => {
            const slug = label.toLowerCase().replace(/\s+/g, "-");
            return (
              <NavLink
                key={label}
                to={`/patient/${id}/reports#${slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-2 text-sm hover:bg-surface"
              >
                <span className={loc.hash === `#${slug}` ? "font-semibold text-foreground" : ""}>{label}</span>
                <span className="text-muted-foreground">›</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};
