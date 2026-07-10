import { useCallback, useEffect, useRef, useState } from "react";

/** Returns a smooth scrollY value updated via rAF — avoids scroll jank. */
export function useParallaxScroll() {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number>(0);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setScrollY(window.scrollY));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  return scrollY;
}
