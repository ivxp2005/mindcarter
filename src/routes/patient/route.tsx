import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { WellnessShell } from "../../components/wellness-shell";
import { meFn } from "../../lib/auth.server";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [{ title: "My Wellness — Mindcarter" }, { name: "robots", content: "noindex" }],
  }),
  beforeLoad: async () => {
    const user = await meFn();
    if (!user || user.role !== "patient") {
      throw redirect({ to: "/login" });
    }
  },
  component: PatientLayout,
});

function PatientLayout() {
  return (
    <WellnessShell>
      <Outlet />
    </WellnessShell>
  );
}
