import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Animates only the content region of a portal shell, so the sidebar and header
 * stay mounted across navigation. The exit leg is deliberately much shorter than
 * the enter leg — `mode="wait"` runs them back to back, and a long exit is what
 * makes the page you just left linger on screen.
 */
export function PortalPageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE_OUT } }}
        exit={{ opacity: 0, transition: { duration: 0.12, ease: "easeIn" } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
