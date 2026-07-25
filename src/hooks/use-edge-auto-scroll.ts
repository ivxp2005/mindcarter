import { useCallback, useEffect, useRef, useState } from "react";

interface EdgeAutoScrollOptions {
  /** Width of the hot zone at each edge, in px. */
  zone?: number;
  /** Speed (px/s) right at the zone boundary. */
  minSpeed?: number;
  /** Speed (px/s) at the very edge. */
  maxSpeed?: number;
}

/**
 * Scrolls a horizontal container while the mouse hovers near its left/right
 * edge — the deeper into the edge zone, the faster it glides — and stops on
 * its own at either end. Lets a scrollbar-less strip be navigated with a plain
 * mouse. Touch/pen pointers are ignored (native swipe already works) and the
 * glide is skipped under prefers-reduced-motion.
 */
export function useEdgeAutoScroll<T extends HTMLElement>({
  zone = 88,
  minSpeed = 140,
  maxSpeed = 900,
}: EdgeAutoScrollOptions = {}) {
  const ref = useRef<T | null>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const dirRef = useRef<-1 | 0 | 1>(0);
  const speedRef = useRef(0);
  const [edges, setEdges] = useState({ left: false, right: false });

  const syncEdges = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft < max - 1;
    setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  const stop = useCallback(() => {
    dirRef.current = 0;
    speedRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const tick = useCallback(
    (ts: number) => {
      const el = ref.current;
      const dir = dirRef.current;
      if (!el || dir === 0) {
        rafRef.current = 0;
        return;
      }

      const dt = lastTsRef.current ? Math.min(ts - lastTsRef.current, 64) : 16;
      lastTsRef.current = ts;

      const max = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + (dir * speedRef.current * dt) / 1000;
      el.scrollLeft = Math.max(0, Math.min(max, next));
      syncEdges();

      // Reached the end in the direction we were heading — stop cleanly.
      if ((dir === -1 && el.scrollLeft <= 0) || (dir === 1 && el.scrollLeft >= max - 0.5)) {
        stop();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [stop, syncEdges],
  );

  const start = useCallback(() => {
    if (rafRef.current) return;
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      if (el.scrollWidth <= el.clientWidth) return;

      const rect = el.getBoundingClientRect();
      const fromLeft = e.clientX - rect.left;
      const fromRight = rect.right - e.clientX;

      let dir: -1 | 0 | 1 = 0;
      let depth = 0;
      if (fromLeft < zone) {
        dir = -1;
        depth = (zone - fromLeft) / zone;
      } else if (fromRight < zone) {
        dir = 1;
        depth = (zone - fromRight) / zone;
      }

      if (dir === 0) {
        stop();
        return;
      }

      // Squared ramp: barely creeps at the zone boundary, quick at the edge.
      const t = Math.min(Math.max(depth, 0), 1);
      dirRef.current = dir;
      speedRef.current = minSpeed + (maxSpeed - minSpeed) * t * t;
      start();
    },
    [maxSpeed, minSpeed, start, stop, zone],
  );

  const scrollByPage = useCallback(
    (dir: -1 | 1) => {
      const el = ref.current;
      if (!el) return;
      stop();
      el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
    },
    [stop],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    syncEdges();
    el.addEventListener("scroll", syncEdges, { passive: true });
    const observer = new ResizeObserver(syncEdges);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", syncEdges);
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [syncEdges]);

  return {
    ref,
    canLeft: edges.left,
    canRight: edges.right,
    onPointerMove,
    onPointerLeave: stop,
    scrollByPage,
  };
}
