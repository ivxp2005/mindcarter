import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { WellnessShell } from "../../components/wellness-shell";
import { RescheduleSessionDialog } from "../../components/reschedule-session-dialog";
import { PatientDataProvider } from "../../lib/patient-store";
import { meFn } from "../../lib/auth.server";
import { getOnboardingStatusFn } from "../../lib/patient-data.server";

export const Route = createFileRoute("/employee")({
  head: () => ({
    meta: [{ title: "My Wellness — Mindcarter" }, { name: "robots", content: "noindex" }],
  }),
  staleTime: 60_000,
  beforeLoad: async ({ location }) => {
    const [user, { onboardingComplete }] = await Promise.all([meFn(), getOnboardingStatusFn()]);
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
