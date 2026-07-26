// Transparent-background build of the source spinner GIF. The original is a
// yellow mark on solid white; alpha was recovered from its blue channel (white
// B=255, yellow B=0) so antialiased edges stay smooth, then saved as animated
// WebP — GIF's 1-bit transparency would have hard-edged the spinner.
// Source asset kept alongside at `Infinity@1x-1.0s-200px-200px.gif`.
import loaderAnim from "../assets/loader-infinity.webp";

/**
 * Full-viewport branded loader shown during route transitions that take a
 * moment (session checks, data loaders). Wired in as the router's
 * `defaultPendingComponent` — see `src/router.tsx`.
 *
 * Rendered as a fixed overlay rather than an in-flow block so it covers the
 * whole screen — including the portal's sidebar and sticky header — and frosts
 * whatever is already painted behind it instead of blanking the page out.
 * The tint is near-absent and the blur does all the work, so the page reads as
 * out-of-focus rather than covered over.
 * z-[100] sits above every other layer in the app — the sticky header (z-30),
 * sheet/dialog overlays (z-50) and the admin console's menus (z-[61]).
 */
export function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/10 backdrop-blur-2xl"
    >
      <img src={loaderAnim} alt="" className="h-20 w-20" />
      {/* The caption is intentionally not shown — the spinner carries the state
          visually — but assistive tech still needs something to announce. */}
      <span className="sr-only">Loading</span>
    </div>
  );
}
