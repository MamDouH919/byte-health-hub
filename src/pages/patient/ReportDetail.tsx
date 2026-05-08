import { useParams, NavLink } from "react-router-dom";
import { ArrowLeft, CalendarDays, FileText } from "lucide-react";
import { StatusPill } from "@/components/brand/StatusPill";
import { getPatientProfile } from "@/lib/data";
import BloodTests from "./BloodTests";

const ReportDetail = () => {
  const { id, report } = useParams();
  const profile = getPatientProfile(id);
  const data = profile.reports.find((r) => r.key === report);

  // Use the rich blood-tests page when applicable
  if (report === "blood-tests") {
    return (
      <div className="space-y-6">
        <BackLink id={id} />
        <BloodTests />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <BackLink id={id} />
        <div className="surface-card p-10 text-center">
          <h2 className="text-lg font-semibold">Report not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink id={id} />

      <section className="surface-card p-6">
        <header className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              {data.category}
            </div>
            <h2 className="text-xl font-semibold mt-1">{data.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <StatusPill status={data.status} />
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3 w-3" /> {data.date}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted-foreground shrink-0">
            <FileText className="h-5 w-5" />
          </div>
        </header>

        <p className="mt-4 text-sm text-foreground/80">{data.summary}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
          {data.metrics.map((m) => (
            <div key={m.label} className="surface-card bg-background p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {m.label}
              </div>
              <div className="text-lg font-semibold tabular-nums mt-1">{m.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const BackLink = ({ id }: { id?: string }) => (
  <NavLink
    to={`/patient/${id}/reports`}
    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft className="h-3.5 w-3.5" /> All reports
  </NavLink>
);

export default ReportDetail;
