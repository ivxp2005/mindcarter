import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "../components/portal-shell";

export const PATIENT_NAV = [
  { label: "Dashboard", to: "/patient", exact: true },
  { label: "Our Doctors", to: "/patient/doctors" },
  { label: "Bookings", to: "/patient/bookings" },
  { label: "Assessments", to: "/patient/assessments" },
  { label: "Reports", to: "/patient/reports" },
  { label: "Messages", to: "/patient/messages" },
  { label: "Profile", to: "/patient/profile" },
];

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Patient Portal — Mindcarter" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PatientLayout,
});

function PatientLayout() {
  return (
    <PortalShell brand="Patient Portal" navItems={PATIENT_NAV}>
      <Outlet />
    </PortalShell>
  );
}