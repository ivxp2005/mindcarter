import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PortalShell } from "../../components/portal-shell";
import { PsychologistDataProvider } from "../../lib/psychologist-store";
import { meFn } from "../../lib/auth.server";

export const Route = createFileRoute("/psychologist")({
  head: () => ({
    meta: [{ title: "Psychologist Portal — Mindcarter" }, { name: "robots", content: "noindex" }],
  }),
  staleTime: 60_000,
  beforeLoad: async () => {
    const user = await meFn();
    if (!user || user.role !== "psychologist") {
      throw redirect({ to: "/login" });
    }
  },
  component: PsychologistLayout,
});

const NAV_ITEMS = [
  { label: "Dashboard", to: "/psychologist", exact: true },
  { label: "Meetings", to: "/psychologist/meetings" },
  { label: "Patients", to: "/psychologist/patients" },
  { label: "Diaries", to: "/psychologist/diaries" },
  { label: "Analytics", to: "/psychologist/analytics" },
  { label: "Notifications", to: "/psychologist/notifications" },
  { label: "Support", to: "/psychologist/support" },
  { label: "Profile", to: "/psychologist/profile" },
];

function PsychologistLayout() {
  return (
    <PsychologistDataProvider>
      <PortalShell brand="Psychologist Portal" navItems={NAV_ITEMS}>
        <Outlet />
      </PortalShell>
    </PsychologistDataProvider>
  );
}
