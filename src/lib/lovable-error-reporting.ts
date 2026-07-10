/**
 * Error reporting utility.
 * Logs errors to the console. Can be wired up to any third-party
 * error tracking service (e.g. Sentry) by replacing the body below.
 */
export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  console.error("[Error]", error, context);
}
