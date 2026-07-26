import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { WellnessShell } from "../../components/wellness-shell";
import { RescheduleSessionDialog } from "../../components/reschedule-session-dialog";
import { PatientDataProvider, ONBOARDING_QUERY_KEY } from "../../lib/patient-store";
import { meFn } from "../../lib/auth.server";
import { getOnboardingStatusFn } from "../../lib/patient-data.server";

export const Route = createFileRoute("/employee")({
  head: () => ({
    meta: [{ title: "My Wellness — Mindcarter" }, { name: "robots", content: "noindex" }],
  }),
  staleTime: 60_000,
  // Runs on every navigation within the portal. Reading both checks through the
  // query cache instead of calling the server functions directly means moving
  // between portal pages is a cache hit rather than two round-trips — the
  // network cost is paid once on entry, then again only after staleTime.
  //
  // `["session"]` is deliberately the same key/staleTime as `useSession()`, so
  // the guard and the shell share one cache entry instead of each fetching it.
  //
  // This does not weaken access control: it decides routing only, and every
  // server function independently re-validates the session (and the user's
  // current status) on its own. Sign-out invalidates `["session"]`, and saving a
  // profile invalidates the onboarding key, so both gates re-check immediately
  // when it actually matters.
  beforeLoad: async ({ location, context }) => {
    const [user, { onboardingComplete }] = await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["session"],
        queryFn: () => meFn(),
        staleTime: 60_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: ONBOARDING_QUERY_KEY,
        queryFn: () => getOnboardingStatusFn(),
        staleTime: 60_000,
      }),
    ]);
    if (!user || user.role !== "patient") {
      throw redirect({ to: "/login" });
    }
    if (!onboardingComplete && location.pathname !== "/employee/profile") {
      throw redirect({ to: "/employee/profile" });
    }
  },
  component: EmployeeLayout,
});

function EmployeeLayout() {
  return (
    <PatientDataProvider>
      <WellnessShell>
        <Outlet />
      </WellnessShell>
      <RescheduleSessionDialog />
    </PatientDataProvider>
  );
}
