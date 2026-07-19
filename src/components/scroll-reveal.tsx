import { motion, type TargetAndTransition } from "framer-motion";
import { ReactNode } from "react";

export type RevealVariant =
  | "fade-up"
  | "fade-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-out"
  | "blur-in"
  | "flip-up";

const VARIANT_INITIAL: Record<RevealVariant, TargetAndTransition> = {
  "fade-up": { opacity: 0, y: 30 },
  "fade-down": { opacity: 0, y: -30 },
  "slide-left": { opacity: 0, x: -60 },
  "slide-right": { opacity: 0, x: 60 },
  "zoom-in": { opacity: 0, scale: 0.88 },
  "zoom-out": { opacity: 0, scale: 1.1 },
  "blur-in": { opacity: 0, filter: "blur(12px)" },
  "flip-up": { opacity: 0, y: 40, rotateX: 18 },
};

const VARIANT_VISIBLE: Record<RevealVariant, TargetAndTransition> = {
  "fade-up": { opacity: 1, y: 0 },
  "fade-down": { opacity: 1, y: 0 },
  "slide-left": { opacity: 1, x: 0 },
  "slide-right": { opacity: 1, x: 0 },
  "zoom-in": { opacity: 1, scale: 1 },
  "zoom-out": { opacity: 1, scale: 1 },
  "blur-in": { opacity: 1, filter: "blur(0px)" },
  "flip-up": { opacity: 1, y: 0, rotateX: 0 },
};

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  variant?: RevealVariant;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  yOffset = 30,
  variant = "fade-up",
}: ScrollRevealProps) {
  const initial =
    variant === "fade-up" ? { opacity: 0, y: yOffset } : VARIANT_INITIAL[variant];

  return (
    <motion.div
      initial={initial}
      whileInView={VARIANT_VISIBLE[variant]}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // easeOut
      }}
      style={variant === "flip-up" ? { transformPerspective: 800 } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  yOffset = 20,
  variant = "fade-up",
}: {
  children: ReactNode;
  className?: string;
  yOffset?: number;
  variant?: RevealVariant;
}) {
  const hidden =
    variant === "fade-up" ? { opacity: 0, y: yOffset } : VARIANT_INITIAL[variant];

  return (
    <motion.div
      variants={{
        hidden,
        visible: {
          ...VARIANT_VISIBLE[variant],
          transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
