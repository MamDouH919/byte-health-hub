import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

/** Wraps page content to fade-in on route change. */
export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  const [key, setKey] = useState(loc.pathname);
  useEffect(() => { setKey(loc.pathname); }, [loc.pathname]);
  // Plain opacity fade — no translateY — to avoid scroll-height jitter that
  // makes the sticky tab bar shiver when switching tabs (e.g. Exercise/Nutrition).
  return (
    <div key={key} className="animate-page-fade">
      {children}
    </div>
  );
};
