import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface SpotlightNavItem {
  label: string;
  to: string;
}

export interface SpotlightNavbarProps {
  items: readonly SpotlightNavItem[];
  className?: string;
  /** "overlay" = light text for use on top of a dark hero image, "solid" = normal foreground text */
  variant?: "overlay" | "solid";
}

export function SpotlightNavbar({ items, className, variant = "solid" }: SpotlightNavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const [hoverX, setHoverX] = useState<number | null>(null);
  const spotlightX = useRef(0);
  const ambienceX = useRef(0);

  const activeIndex = items.findIndex((item) => item.to === location.pathname);

  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = nav.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setHoverX(x);
      spotlightX.current = x;
      nav.style.setProperty("--spotlight-x", `${x}px`);
    };

    const handleMouseLeave = () => {
      setHoverX(null);
      if (activeIndex < 0) return;
      const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
      if (activeItem) {
        const navRect = nav.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const targetX = itemRect.left - navRect.left + itemRect.width / 2;

        animate(spotlightX.current, targetX, {
          type: "spring",
          stiffness: 200,
          damping: 20,
          onUpdate: (v) => {
            spotlightX.current = v;
            nav.style.setProperty("--spotlight-x", `${v}px`);
          },
        });
      }
    };

    nav.addEventListener("mousemove", handleMouseMove);
    nav.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      nav.removeEventListener("mousemove", handleMouseMove);
      nav.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [activeIndex]);

  useEffect(() => {
    if (!navRef.current || activeIndex < 0) return;
    const nav = navRef.current;
    const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

    if (activeItem) {
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const targetX = itemRect.left - navRect.left + itemRect.width / 2;

      animate(ambienceX.current, targetX, {
        type: "spring",
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          ambienceX.current = v;
          nav.style.setProperty("--ambience-x", `${v}px`);
        },
      });
    }
  }, [activeIndex]);

  const isOverlay = variant === "overlay";

  return (
    <nav
      ref={navRef}
      className={cn(
        "relative flex h-11 shrink-0 items-center overflow-hidden rounded-full border backdrop-blur-md transition-colors duration-300",
        isOverlay ? "border-white/15 bg-white/10" : "border-border/60 bg-background/30",
        className,
      )}
      style={
        {
          "--spotlight-color": isOverlay ? "rgba(255,255,255,0.16)" : "rgba(250,204,21,0.14)",
          "--ambience-color": isOverlay ? "rgba(255,255,255,0.9)" : "rgba(250,204,21,0.9)",
        } as React.CSSProperties
      }
    >
      <ul className="relative z-10 flex h-full items-center gap-0 px-2">
        {items.map((item, idx) => (
          <li key={item.to} className="relative flex h-full items-center justify-center">
            <Link
              to={item.to}
              data-index={idx}
              activeOptions={{ exact: true }}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
                idx === activeIndex
                  ? isOverlay
                    ? "text-white"
                    : "text-foreground font-semibold"
                  : isOverlay
                    ? "text-white/70 hover:text-white"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* moving spotlight that follows the cursor */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-full w-full opacity-0 transition-opacity duration-300"
        style={{
          opacity: hoverX !== null ? 1 : 0,
          background:
            "radial-gradient(120px circle at var(--spotlight-x) 100%, var(--spotlight-color), transparent 50%)",
        }}
      />

      {/* glow sitting under the active item */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-[2px] w-full"
        style={{
          background:
            "radial-gradient(60px circle at var(--ambience-x) 0%, var(--ambience-color), transparent 100%)",
        }}
      />
    </nav>
  );
}
