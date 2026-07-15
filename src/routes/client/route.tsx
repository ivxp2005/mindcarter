import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { WellnessShell } from "../../components/wellness-shell";
import { BookSessionDialog } from "../../components/book-session-dialog";
import { PatientDataProvider } from "../../lib/patient-store";
import { meFn } from "../../lib/auth.server";
import { getOnboardingStatusFn } from "../../lib/patient-data.server";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [{ title: "My Wellness — Mindcarter" }, { name: "robots", content: "noindex" }],
  }),
  beforeLoad: async ({ location }) => {
    const user = await meFn();
    if (!user || user.role !== "patient") {
      throw redirect({ to: "/login" });
    }
    const { onboardingComplete } = await getOnboardingStatusFn();
    if (!onboardingComplete && location.pathname !== "/client/profile") {
      throw redirect({ to: "/client/profile" });
    }
  },
  component: ClientLayout,
});

function ClientLayout() {
  return (
    <PatientDataProvider>
      <WellnessShell>
        <Outlet />
      </WellnessShell>
      <BookSessionDialog />
    </PatientDataProvider>
  );
}
