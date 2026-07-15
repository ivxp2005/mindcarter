import { useEffect, useRef, useState } from "react";

/**
 * Counts a number up from 0 → `target` the first time the returned `ref`
 * scrolls into view. Cubic ease-out, rAF-driven. Respects
 * `prefers-reduced-motion` by snapping straight to the target.
 *
 * Usage:
 *   const { ref, display } = useCountUp(12);
 *   <span ref={ref}>{display}</span>
 */
export function useCountUp(target: number, opts?: { duration?: number; decimals?: number }) {
  const { duration = 1100, decimals = 0 } = opts ?? {};
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          setValue(target * easeOut(t));
          if (t < 1) requestAnimationFrame(tick);
          else setValue(target);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return { ref, display };
}
