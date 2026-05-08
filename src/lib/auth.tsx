import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "clinician" | "user";

type AuthState = {
  role: Role | null;
  name: string;
  patientId?: string; // when role=user, the patient profile to mirror
  signIn: (role: Role) => void;
  signOut: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);
const KEY = "byte.auth.v1";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{ role: Role | null; name: string; patientId?: string }>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { role: null, name: "" };
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const signIn = (role: Role) => {
    if (role === "clinician") {
      setState({ role, name: "Dr. Sajeda Ayesh" });
    } else {
      // Mirror a real patient profile so the user dashboard has data.
      setState({ role, name: "Yassin Asfour", patientId: "yassin-05" });
    }
  };

  const signOut = () => setState({ role: null, name: "" });

  return (
    <AuthCtx.Provider value={{ ...state, signIn, signOut }}>{children}</AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

/** True when the viewer is a patient (not a clinician). Used to hide sensitive UI. */
export const useIsPatientView = () => {
  const { role } = useAuth();
  return role === "user";
};
