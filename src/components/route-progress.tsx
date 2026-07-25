import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Thin top-edge progress bar shown only while the router is genuinely waiting
 * on a navigation (e.g. a layout `beforeLoad` server call). Delayed slightly so
 * fast navigations never flash it, and covers the case the shell-persisting
 * page transition can't: real network latency.
 */
export function RouteProgress() {
  const isPending = useRouterState({
    select: (s) => s.status === "pending" || s.isTransitioning,
  });
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, [isPending]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-brand"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{
            scaleX: 0.9,
            transition: reducedMotion
              ? { duration: 0 }
              : { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
          }}
          exit={{
            scaleX: 1,
            opacity: 0,
            transition: reducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeIn" },
          }}
        />
      )}
    </AnimatePresence>
  );
}
