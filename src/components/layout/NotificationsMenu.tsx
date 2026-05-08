import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, Activity, Moon, Footprints, HeartPulse, Droplet, X, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { patients } from "@/lib/data";

type Severity = "high" | "medium" | "low";
type SectionKey = "profile" | "sleep" | "exercise" | "nutrition" | "meds" | "reports";

const severityStyles: Record<Severity, string> = {
  high: "bg-[hsl(0_85%_50%/0.12)] text-[hsl(0_85%_45%)]",
  medium: "bg-[hsl(28_95%_48%/0.14)] text-[hsl(28_85%_40%)]",
  low: "bg-[hsl(142_55%_38%/0.14)] text-[hsl(142_55%_30%)]",
};

const severityLabel: Record<Severity, string> = {
  high: "High risk",
  medium: "Watch",
  low: "Info",
};

const sectionLabel: Record<SectionKey, string> = {
  profile: "Health snapshot",
  sleep: "Sleep plan",
  exercise: "Exercise plan",
  nutrition: "Nutrition plan",
  meds: "Medications",
  reports: "Reports",
};

interface Notification {
  id: number;
  patient: string;
  patientId: string;
  company: string;
  message: string;
  time: string;
  severity: Severity;
  section: SectionKey;
  anchor?: string; // optional sub-section to scroll to
  Icon: typeof Bell;
}

// Resolve a patient name to an existing patient row id (falls back to first match).
const pid = (name: string) => patients.find((p) => p.name === name)?.id ?? patients[0].id;

const seedNotifications: Notification[] = [
  { id: 1, patient: "Yassin Asfour", patientId: pid("Yassin Asfour"), company: "Carina", message: "High-risk: resting HR out of range for 3 consecutive days (avg 92 bpm).", time: "12 min ago", severity: "high", section: "profile", anchor: "health-snapshot", Icon: HeartPulse },
  { id: 2, patient: "Motasim Hamdi", patientId: pid("Motasim Hamdi"), company: "Wayup", message: "Sleep efficiency below 70% for 8 nights — recovery trending down.", time: "1 h ago", severity: "high", section: "sleep", Icon: Moon },
  { id: 3, patient: "Ali Farag", patientId: pid("Ali Farag"), company: "Adsero", message: "Daily distance < 1.2 km for 9 days — flagged sedentary pattern.", time: "3 h ago", severity: "medium", section: "exercise", Icon: Footprints },
  { id: 4, patient: "Omar El-Sayed", patientId: pid("Omar El-Sayed"), company: "Byte", message: "Fasting glucose elevated (118 mg/dL) on latest lab draw.", time: "Yesterday", severity: "medium", section: "reports", Icon: Droplet },
  { id: 5, patient: "Lina Khoury", patientId: pid("Lina Khoury"), company: "Carina", message: "HRV dropped 22% week-over-week — possible overreach.", time: "Yesterday", severity: "medium", section: "profile", anchor: "health-snapshot", Icon: Activity },
  { id: 6, patient: "Noura Hassan", patientId: pid("Noura Hassan"), company: "Wayup", message: "Missed 4 consecutive training sessions — adherence at 41%.", time: "2 d ago", severity: "low", section: "exercise", Icon: AlertTriangle },
  { id: 7, patient: "Yassin Asfour", patientId: pid("Yassin Asfour"), company: "Carina", message: "Late-night meals logged 5/7 days — glucose curve worsening.", time: "2 d ago", severity: "low", section: "nutrition", Icon: Droplet },
  { id: 8, patient: "Ali Farag", patientId: pid("Ali Farag"), company: "Byte", message: "Blood pressure 142/92 sustained — flag for clinician review.", time: "3 d ago", severity: "high", section: "profile", anchor: "key-insights", Icon: HeartPulse },
];

export const NotificationsMenu = () => {
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [viewAll, setViewAll] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)).length,
    [notifications, readIds]
  );

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
    toast({ title: "All caught up", description: `${notifications.length} alerts marked as read.` });
  };

  const markOneRead = (id: number) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const openNotification = (n: Notification) => {
    markOneRead(n.id);
    setOpen(false);
    setViewAll(false);
    const hash = n.anchor ? `#${n.anchor}` : "";
    navigate(`/patient/${n.patientId}/${n.section}${hash}`);
  };

  const openAll = () => {
    setOpen(false);
    setViewAll(true);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="relative h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-surface transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-3.5 min-w-3.5 px-1 rounded-full bg-[hsl(var(--brand-blue))] text-[9px] font-semibold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-[380px] p-0 overflow-hidden border border-border shadow-[var(--shadow-pop)] rounded-xl"
        >
          <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-[hsl(220_14%_94%)] to-background flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Patient alerts</div>
              <div className="text-[11px] text-muted-foreground">
                {unreadCount} unread · {notifications.length} total
              </div>
            </div>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          </div>

          <ul className="max-h-[420px] overflow-y-auto divide-y divide-border">
            {notifications.slice(0, 5).map((n) => {
              const isRead = readIds.has(n.id);
              return (
                <li
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={`px-4 py-3 flex gap-3 hover:bg-surface/70 cursor-pointer transition-colors ${
                    isRead ? "opacity-60" : ""
                  }`}
                >
                  <span
                    className={`h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 ${severityStyles[n.severity]}`}
                  >
                    <n.Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-semibold truncate">{n.patient}</span>
                      <span className="text-[10px] text-muted-foreground truncate">· {n.company}</span>
                      {!isRead && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-blue))] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-surface text-muted-foreground border border-border">
                        {sectionLabel[n.section]}
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">{n.time}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="px-4 py-2.5 border-t border-border bg-surface/50 text-center">
            <button
              onClick={openAll}
              className="text-xs font-medium text-[hsl(var(--brand-blue))] hover:underline"
            >
              View all notifications
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {viewAll && (
        <>
          <div
            className="fixed inset-0 bg-foreground/30 backdrop-blur-[2px] z-50 animate-fade-in"
            onClick={() => setViewAll(false)}
          />
          <aside
            role="dialog"
            aria-label="All notifications"
            className="fixed top-0 right-0 h-full w-[440px] max-w-[100vw] bg-background border-l border-border shadow-[var(--shadow-pop)] z-50 flex flex-col animate-slide-in-right"
          >
            <header className="px-5 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-[hsl(220_14%_94%)] to-background">
              <div>
                <div className="font-semibold">All patient alerts</div>
                <div className="text-[11px] text-muted-foreground">
                  {unreadCount} unread · {notifications.length} total
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border border-border bg-background hover:bg-surface text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
                <button
                  onClick={() => setViewAll(false)}
                  className="p-1 rounded hover:bg-surface"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <ul className="flex-1 overflow-y-auto divide-y divide-border">
              {notifications.map((n) => {
                const isRead = readIds.has(n.id);
                return (
                  <li
                    key={n.id}
                    onClick={() => openNotification(n)}
                    className={`px-5 py-4 flex gap-3 hover:bg-surface/70 cursor-pointer transition-colors ${
                      isRead ? "opacity-60" : ""
                    }`}
                  >
                    <span
                      className={`h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0 ${severityStyles[n.severity]}`}
                    >
                      <n.Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-semibold truncate">{n.patient}</span>
                        <span className="text-[10px] text-muted-foreground truncate">· {n.company}</span>
                        <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${severityStyles[n.severity]}`}>
                          {severityLabel[n.severity]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug mt-1">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-surface text-muted-foreground border border-border">
                          {sectionLabel[n.section]}
                        </span>
                        <span className="text-[10px] text-muted-foreground/80">{n.time}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </>
      )}
    </>
  );
};
