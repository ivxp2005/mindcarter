import { useRouterState } from "@tanstack/react-router";
import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Marketing pages only — the same four routes that opt into `mc-dark-scrollbar`
 * and mirror `publicLinks` in site-nav.tsx. Portal routes, /booking and /login
 * deliberately keep native scrolling.
 */
const SMOOTH_SCROLL_PATHS = new Set(["/", "/about", "/services", "/contact"]);

/**
 * Physics-based wheel smoothing for the marketing pages.
 *
 * Lenis runs in real-scroll mode (no wrapper transform), so `window.scrollY`,
 * IntersectionObserver, `position: sticky`, native scrollbar dragging and the
 * router's scroll restoration all keep working untouched.
 */
export function SmoothScroll() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  // `reducedMotion` is null until the media query resolves (SSR/first paint) —
  // compare against `false` explicitly so Lenis never initializes on that guess.
  const enabled = SMOOTH_SCROLL_PATHS.has(pathname) && reducedMotion === false;

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      lerp: 0.1, // framerate-independent smoothing; higher = snappier
      smoothWheel: true, // the whole point: blend discrete wheel ticks
      syncTouch: false, // leave native touch momentum alone on mobile
      autoRaf: false, // ticked from Framer Motion's shared rAF loop below
      autoResize: true, // ResizeObserver on wrapper + content
      overscroll: true, // let the browser handle rubber-banding at the edges
    });
    lenisRef.current = lenis;

    return () => {
      lenisRef.current = null;
      lenis.destroy();
    };
  }, [enabled]);

  // One rAF callback shared with every Framer Motion animation on the page:
  // scroll interpolates first, then reveals/parallax read the new position in
  // the same frame. No-ops while `lenisRef` is null (portal routes, reduced motion).
  useAnimationFrame((time) => {
    lenisRef.current?.raf(time);
  });

  // Page swaps change document height (and the router restores scroll position).
  // Lenis' ResizeObserver catches this asynchronously; recomputing on navigation
  // removes the one-frame window where max-scroll is still the old page's.
  useEffect(() => {
    lenisRef.current?.resize();
  }, [pathname]);

  return null;
}
