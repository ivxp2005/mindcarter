import loaderGif from "../assets/Infinity@1x-1.0s-200px-200px.gif";

/** Full-page branded loader shown during route transitions that take a
 *  moment (session checks, data loaders). Wired in as the router's
 *  `defaultPendingComponent` — see `src/router.tsx`. */
export function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background"
    >
      <img src={loaderGif} alt="Loading" className="h-20 w-20" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Loading
      </p>
    </div>
  );
}
