import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Building2, ChevronDown, Users, X, ArrowRight, Filter } from "lucide-react";
import { patients, companies } from "@/lib/data";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Pill = ({
  icon: Icon, label, count, onClick,
}: { icon: React.ComponentType<{ className?: string }>; label: string; count: number; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="filter-pill min-w-[200px] inline-flex items-center gap-2"
  >
    <Icon className="h-4 w-4 text-muted-foreground" />
    <span className="text-foreground">{label}</span>
    <span className="text-muted-foreground">({count})</span>
    <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
  </button>
);

/** Users dropdown — inline. Selecting routes to that patient's profile. */
const UsersDropdown = ({ size = "lg" }: { size?: "sm" | "lg" }) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {size === "lg" ? (
          <button className="filter-pill min-w-[200px] inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">Users</span>
            <span className="text-muted-foreground">({patients.length})</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
          </button>
        ) : (
          <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-background/60 border border-border text-muted-foreground hover:text-foreground transition-colors">
            <Users className="h-3.5 w-3.5" />
            <span>Users</span>
            <span className="tabular-nums opacity-70">({patients.length})</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Switch patient
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {patients.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onSelect={() => navigate(`/patient/${p.id}/profile`)}
            className="flex items-start justify-between gap-2 cursor-pointer"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{p.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {p.company} · ID {p.userId}
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** Companies modal — clickable list of companies + their users. */
const CompaniesModal = ({ size = "lg" }: { size?: "sm" | "lg" }) => {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(companies[0].id);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const onDashboard = location.pathname === "/";
  const active = companies.find((c) => c.id === activeId) ?? companies[0];
  const activePatients = patients.filter((p) => active.patientIds.includes(p.id));

  const applyFilter = () => {
    setOpen(false);
    if (onDashboard) {
      const next = new URLSearchParams(searchParams);
      next.set("company", active.id);
      setSearchParams(next);
    } else {
      navigate(`/?company=${active.id}`);
    }
  };

  return (
    <>
      {size === "lg" ? (
        <Pill icon={Building2} label="Companies" count={companies.length} onClick={() => setOpen(true)} />
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-background/60 border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Companies</span>
          <span className="tabular-nums opacity-70">({companies.length})</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 bg-foreground/30 backdrop-blur-[2px] z-50" onClick={() => setOpen(false)} />
          <div role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-background rounded-2xl border border-border shadow-[var(--shadow-pop)] w-full max-w-3xl pointer-events-auto drawer-in flex flex-col max-h-[80vh]">
              <header className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Directory</div>
                  <div className="font-semibold">Companies & users</div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 rounded hover:bg-surface">
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] divide-x divide-border min-h-0">
                {/* Companies list */}
                <ul className="overflow-y-auto py-2">
                  {companies.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => setActiveId(c.id)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm transition-colors ${
                          activeId === c.id ? "bg-surface font-semibold" : "hover:bg-surface/60"
                        }`}
                      >
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="text-[11px] text-muted-foreground tabular-nums">{c.members}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Active company detail */}
                <div className="overflow-y-auto p-5">
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{active.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {active.industry} · {active.members} members · {activePatients.length} active patients
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={applyFilter}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-background hover:bg-surface inline-flex items-center gap-1.5"
                      >
                        <Filter className="h-3 w-3" /> Filter dashboard
                      </button>
                      <button
                        onClick={() => { setOpen(false); navigate(`/admin/${active.id}`); }}
                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-foreground text-background hover:opacity-90"
                      >
                        View overview
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                    Patients
                  </div>
                  {activePatients.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-6 text-center border border-dashed border-border rounded-xl">
                      No active patients in this company.
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {activePatients.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => { setOpen(false); navigate(`/patient/${p.id}/profile`); }}
                            className="w-full text-left flex items-center justify-between gap-2 surface-card bg-background px-3 py-2 hover:shadow-[var(--shadow-card)] transition-shadow"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{p.name}</div>
                              <div className="text-[11px] text-muted-foreground truncate">ID {p.userId} · adherence {p.last14}%</div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

/** Large pill version — used on Dashboard. */
export const ContextSwitchers = () => (
  <div className="flex items-center justify-center gap-6">
    <CompaniesModal size="lg" />
    <UsersDropdown size="lg" />
  </div>
);

/** Compact version — lives in TopNav on every other page. */
export const ContextSwitchersCompact = () => (
  <div className="hidden md:flex items-center gap-2">
    <CompaniesModal size="sm" />
    <UsersDropdown size="sm" />
  </div>
);
