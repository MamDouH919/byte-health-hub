import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { PatientTabs } from "@/components/patient/PatientTabs";
import { RoutinePanel } from "@/components/patient/RoutinePanel";
import { NoorBar } from "@/components/patient/NoorBar";
import { PageTransition } from "@/components/PageTransition";
import { useScrolled } from "@/hooks/use-scrolled";
import { patients } from "@/lib/data";
import { useAuth } from "@/lib/auth";

export const PatientLayout = () => {
  const { id } = useParams();
  const loc = useLocation();
  const scrolled = useScrolled(80);
  const patient = patients.find((p) => p.id === id) ?? patients[0];
  const isProfileTab = loc.pathname.endsWith("/profile");
  const { role, patientId, name } = useAuth();

  // Patients can only ever view their own profile.
  if (role === "user" && patientId && id !== patientId) {
    return <Navigate to={`/patient/${patientId}/profile`} replace />;
  }
  const isClinician = role === "clinician";

  // Scroll to anchor (e.g. from notification deep-links) after content mounts.
  useEffect(() => {
    if (!loc.hash) return;
    const id = loc.hash.slice(1);
    const tries = [0, 120, 320, 700];
    const timers = tries.map((delay) =>
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-[hsl(var(--brand-blue))]", "rounded-xl");
          window.setTimeout(() => {
            el.classList.remove("ring-2", "ring-[hsl(var(--brand-blue))]", "rounded-xl");
          }, 2400);
        }
      }, delay)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [loc.pathname, loc.hash]);

  return (
    <AppShell user={isClinician ? "Dr. Sajeda Ayesh" : (name || patient.name)} showSwitchers={isClinician} compact={scrolled} subtitle={scrolled ? patient.name : undefined}>
      {/* Sticky tab bar: floats below the top nav on scroll, borderless for seamless feel */}
      <div
        className={`sticky z-30 transition-all duration-300 ${
          scrolled
            ? "top-12 -mx-8 px-4 py-2 bg-background/80 backdrop-blur-md"
            : "top-12 -mx-8 px-4 py-6"
        }`}
      >
        <div className={`relative flex justify-center transition-all ${scrolled ? "scale-[0.92]" : ""}`}>
          {/* Patient identity chip — pinned to far-left edge (where notes used to be) */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <PatientHeader />
          </div>
          {/* Floating nav — Clinical Notes is now merged inside as its rightmost item */}
          <PatientTabs />
          {/* Floating Noor — pinned to screen right edge */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <NoorBar />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10 max-w-[1280px] mx-auto px-6 pt-4">
        <section className={isProfileTab ? "col-span-12 lg:col-span-6" : "col-span-12"}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </section>

        {isProfileTab && (
          <div className="col-span-12 lg:col-span-6">
            <div className="sticky top-20">
              <RoutinePanel />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
