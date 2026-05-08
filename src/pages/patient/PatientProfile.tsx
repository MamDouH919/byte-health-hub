import { useParams } from "react-router-dom";
import { Heart, Stethoscope } from "lucide-react";
import { StatusPill } from "@/components/brand/StatusPill";
import { RangeBar } from "@/components/brand/RangeBar";
import { CollapsibleSection } from "@/components/patient/CollapsibleSection";
import { HealthRadar } from "@/components/patient/HealthRadar";
import { getPatientProfile } from "@/lib/data";

const PatientProfile = () => {
  const { id } = useParams();
  const profile = getPatientProfile(id);

  const SUMMARY_COUNT = 3;
  const topInsights = profile.insights.slice(0, SUMMARY_COUNT);
  const restInsights = profile.insights.slice(SUMMARY_COUNT);
  const topSnapshot = profile.snapshot.slice(0, SUMMARY_COUNT);
  const restSnapshot = profile.snapshot.slice(SUMMARY_COUNT);

  return (
    <div className="space-y-5">

      {/* Key health insights */}
      <div id="key-insights" className="scroll-mt-32">
      <CollapsibleSection
        title="Key health insights"
        eyebrow="Priority alerts (what needs attention)"
        icon={<Stethoscope className="h-4 w-4" />}
        summary={
          <ul className="space-y-1.5">
            {topInsights.map((row, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                <span>
                  <span className="font-medium">{row.issue}</span>
                  <span className="text-muted-foreground"> — {row.explanation}</span>
                </span>
              </li>
            ))}
            {restInsights.length > 0 && (
              <li className="text-[11px] text-muted-foreground pl-5">
                +{restInsights.length} more insight{restInsights.length > 1 ? "s" : ""}
              </li>
            )}
          </ul>
        }
      >
        {restInsights.length > 0 ? (
          <ol className="space-y-2.5">
            {restInsights.map((row, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground tabular-nums shrink-0">{SUMMARY_COUNT + i + 1}.</span>
                <span>
                  <span className="font-medium">{row.issue}</span>
                  <span className="text-muted-foreground"> → </span>
                  <span>{row.explanation}</span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-muted-foreground italic">No additional insights.</p>
        )}
      </CollapsibleSection>
      </div>

      {/* Health snapshot */}
      <div id="health-snapshot" className="scroll-mt-32">
      <CollapsibleSection
        title="Health snapshot"
        eyebrow="Last 14 days"
        icon={<Heart className="h-4 w-4" />}
        summary={
          <ul className="space-y-2.5">
            {topSnapshot.map((row, i) => (
              <li key={i} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-muted-foreground tabular-nums ml-2">
                      {row.value}{row.unit}
                    </span>
                  </span>
                  <StatusPill status={row.status} />
                </div>
                <RangeBar size="sm" value={row.value} min={row.min} max={row.max} scaleMin={row.scaleMin} scaleMax={row.scaleMax} />
              </li>
            ))}
            {restSnapshot.length > 0 && (
              <li className="text-[11px] text-muted-foreground">
                +{restSnapshot.length} more metric{restSnapshot.length > 1 ? "s" : ""}
              </li>
            )}
          </ul>
        }
      >
        {restSnapshot.length > 0 ? (
          <ul className="space-y-3">
            {restSnapshot.map((row, i) => (
              <li key={i} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-muted-foreground tabular-nums ml-2">
                      {row.value}{row.unit}
                    </span>
                  </span>
                  <StatusPill status={row.status} />
                </div>
                <RangeBar size="sm" value={row.value} min={row.min} max={row.max} scaleMin={row.scaleMin} scaleMax={row.scaleMax} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground italic">No additional metrics.</p>
        )}
      </CollapsibleSection>
      </div>

      {/* Wellness profile — radar across 5 pillars */}
      <HealthRadar patientId={id} />
    </div>
  );
};

export default PatientProfile;
