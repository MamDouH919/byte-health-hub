import { useEffect, useState } from "react";

/**
 * True once the window has scrolled past `threshold` px.
 * Uses hysteresis (a 24px deadband) + rAF coalescing to prevent the sticky
 * tab bar from oscillating ("shivering") when content height changes mid-route.
 */
export const useScrolled = (threshold = 40) => {
  const [scrolled, setScrolled] = useState(() =>
    typeof window !== "undefined" && window.scrollY > threshold,
  );
  useEffect(() => {
    const enter = threshold + 12;
    const exit = Math.max(0, threshold - 12);
    let raf = 0;
    let current = window.scrollY > threshold;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        if (!current && y > enter) { current = true; setScrolled(true); }
        else if (current && y < exit) { current = false; setScrolled(false); }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [threshold]);
  return scrolled;
};
