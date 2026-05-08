import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import type { ReactNode } from "react";

/** Requires sign-in. Optionally restricts to specific roles. */
export const RequireAuth = ({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: ("clinician" | "user")[];
}) => {
  const { role } = useAuth();
  const loc = useLocation();
  if (!role) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (roles && !roles.includes(role)) {
    // Patients trying to reach clinician-only screens go to their own profile.
    return <Navigate to={role === "user" ? "/me" : "/"} replace />;
  }
  return <>{children}</>;
};
