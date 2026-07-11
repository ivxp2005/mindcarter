/**
 * /secure-admin-portal — DEPRECATED / DEAD ROUTE.
 *
 * This route intentionally returns 404.
 * The admin console has been moved to a separate obscure path.
 * Do NOT add links to either path in the public UI.
 */
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/secure-admin-portal")({
  beforeLoad: () => {
    throw notFound();
  },
  component: () => null,
});