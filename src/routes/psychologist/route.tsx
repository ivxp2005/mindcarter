import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "../../components/portal-shell";

export const Route = createFileRoute("/psychologist")({
  head: () => ({
    meta: [{ title: "Psychologist Portal — Mindcarter" }, { name: "robots", content: "noindex" }],
  }),
  component: PsychologistLayout,
});

const NAV_ITEMS = [
  { label: "Dashboard", to: "/psychologist", exact: true },
  { label: "Meetings", to: "/psychologist/meetings" },
  { label: "Patients", to: "/psychologist/patients" },
  { label: "Diaries", to: "/psychologist/diaries" },
  { label: "Analytics", to: "/psychologist/analytics" },
  { label: "Notifications", to: "/psychologist/notifications" },
  { label: "Profile", to: "/psychologist/profile" },
];

function PsychologistLayout() {
  return (
    <PortalShell brand="Psychologist Portal" navItems={NAV_ITEMS}>
      <Outlet />
    </PortalShell>
  );
}
