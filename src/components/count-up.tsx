import type { RefObject } from "react";
import { useCountUp } from "../hooks/use-count-up";

/**
 * Animated number that counts up from 0 → `value` the first time it scrolls
 * into view. Wraps `useCountUp`; respects `prefers-reduced-motion`.
 */
export function CountUp({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const { ref, display } = useCountUp(value, { decimals });
  return (
    <span ref={ref as RefObject<HTMLSpanElement>} className={className}>
      {display}
    </span>
  );
}
