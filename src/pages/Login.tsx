import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, User, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth, type Role } from "@/lib/auth";

const Login = () => {
  const [role, setRole] = useState<Role>("clinician");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(role);
    navigate(role === "clinician" ? "/" : "/me");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-secondary via-background to-muted flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="surface-card bg-background p-8 shadow-[var(--shadow-pop)]">
          <header className="mb-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-xs text-muted-foreground mt-1">Sign in to continue</p>
          </header>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-surface border border-border mb-6">
            {([
              { key: "clinician", label: "Clinician", icon: Stethoscope },
              { key: "user", label: "User", icon: User },
            ] as const).map((r) => {
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium transition-colors ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <r.icon className="h-3.5 w-3.5" />
                  {r.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                className="mt-1 w-full h-10 px-3 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue))]/40"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full h-10 px-3 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue))]/40"
              />
            </div>

            <button
              type="submit"
              className="btn-primary-pill w-full mt-2"
            >
              Sign in <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-[11px] text-muted-foreground text-center mt-5">
            Demo build · no credentials required
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
