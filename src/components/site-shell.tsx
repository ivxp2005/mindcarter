import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function SiteShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav />
      <main className={`flex-1 ${isHome ? "" : "pt-20"}`}>{children}</main>
      <SiteFooter />
    </div>
  );
}