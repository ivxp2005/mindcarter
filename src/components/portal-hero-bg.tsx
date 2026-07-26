import heroBgImg from "../assets/890.png";

/**
 * Shared backdrop for the portal hero bands.
 *
 * Layers, bottom to top: an ambient workplace photo, a scrim that keeps the
 * left edge (where the headline and copy sit) close to solid so white text
 * holds full contrast, then the fine grid texture the portal already used.
 * Pages keep rendering their own gold glow on top — that differs per page.
 *
 * Drop this inside a `relative overflow-hidden` section with `bg-foreground`;
 * the section's own background is what the scrim fades into.
 */
export function PortalHeroBg() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${heroBgImg})` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-foreground via-foreground/85 to-foreground/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </>
  );
}
