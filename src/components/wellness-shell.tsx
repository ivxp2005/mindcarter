import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import { motion, MotionConfig } from "framer-motion";
import {
  LayoutDashboard,
  CalendarHeart,
  Users,
  BookOpen,
  Bell,
  UserCircle,
  Home,
  LogOut,
  Menu,
  ChevronDown,
  Flame,
} from "lucide-react";
import logoImg from "../assets/mindcarter-logo.avif";
import { Sheet, SheetContent } from "./ui/sheet";
import { logoutFn } from "../lib/auth.server";
import { useSession } from "../lib/use-session";
import { usePatientData } from "../lib/patient-store";

type NavItem = { label: string; to: string; exact?: boolean; icon: React.ElementType };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/client", exact: true, icon: LayoutDashboard },
  { label: "Sessions", to: "/client/sessions", icon: CalendarHeart },
  { label: "Care Team", to: "/client/care-team", icon: Users },
  { label: "Wellness Journal", to: "/client/journal", icon: BookOpen },
  { label: "Notifications", to: "/client/notifications", icon: Bell },
  { label: "Profile", to: "/client/profile", icon: UserCircle },
];

/** Human-friendly section name for the top-bar breadcrumb (never the raw path). */
function sectionLabel(pathname: string): string {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) =>
      i.exact ? pathname === i.to : pathname === i.to || pathname.startsWith(i.to + "/"),
    );
  return match?.label ?? "Dashboard";
}

function NavLinks({ idPrefix, onNavigate }: { idPrefix: string; onNavigate?: () => void }) {
  const location = useLocation();
  const { stats, profile } = usePatientData();
  const onboardingLocked = profile !== null && !profile.onboardingComplete;
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? location.pathname === item.to
          : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        const badge =
          item.to === "/client/notifications" && stats.unreadCount > 0 ? stats.unreadCount : null;
        const locked = onboardingLocked && item.to !== "/client/profile";

        if (locked) {
          return (
            <span
              key={item.to}
              title="Complete your profile to unlock this section"
              className="group relative flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/40"
            >
              <Icon className="relative z-10 h-4 w-4 shrink-0" />
              <span className="relative z-10">{item.label}</span>
            </span>
          );
        }

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              active ? "text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${idPrefix}-nav-pill`}
                className="absolute inset-0 -z-0 rounded-lg bg-foreground"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className="relative z-10">{item.label}</span>
            {badge !== null && (
              <span className="relative z-10 ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-brand-foreground">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function BrandHeader() {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-border px-6">
      <img src={logoImg} alt="Mindcarter" className="h-8 w-auto" />
      <div className="leading-tight">
        <p className="text-sm font-semibold">Mindcarter.</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Wellness</p>
      </div>
    </div>
  );
}

function StreakPill() {
  const { stats } = usePatientData();
  return (
    <div className="mx-3 mb-1 flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
      <motion.span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand"
        animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Flame className="h-4 w-4" />
      </motion.span>
      <div className="leading-tight">
        <p className="text-sm font-bold">{stats.streakDays}-day streak</p>
        <p className="text-[11px] text-muted-foreground">Keep it going</p>
      </div>
    </div>
  );
}

function BottomActions({
  onSignOut,
  onNavigate,
}: {
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-border p-3">
      <Link
        to="/"
        onClick={onNavigate}
        className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Home className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />{" "}
        Back to Home
      </Link>
      <button
        onClick={() => {
          onNavigate?.();
          onSignOut();
        }}
        className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-red-500"
      >
        <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />{" "}
        Sign Out
      </button>
    </div>
  );
}

export function WellnessShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const initials = session
    ? session.name
        .split(" ")
        .map((n: string) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";
  const userName = session?.name ?? "";

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSignOut = async () => {
    await logoutFn();
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    navigate({ to: "/" });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="min-h-screen text-foreground"
        style={{
          background: "linear-gradient(160deg, #eceae7 0%, #e3e2de 50%, #d9d8d3 100%)",
          backgroundAttachment: "fixed",
        }}
      >
        {/* ── Sidebar (desktop) */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-background lg:flex">
          <BrandHeader />
          <NavLinks idPrefix="desktop" />
          <StreakPill />
          <BottomActions onSignOut={handleSignOut} />
        </aside>

        {/* ── Sidebar (mobile drawer) */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="flex w-72 flex-col p-0">
            <BrandHeader />
            <NavLinks idPrefix="mobile" onNavigate={() => setMobileNavOpen(false)} />
            <StreakPill />
            <BottomActions onSignOut={handleSignOut} onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* ── Main content */}
        <div className="lg:pl-64">
          {/* Top header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-6 backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border transition hover:bg-muted lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Wellness ·{" "}
                <span className="text-foreground">{sectionLabel(location.pathname)}</span>
              </p>
            </div>

            {/* Profile dropdown */}
            <div className="relative shrink-0" ref={dropRef}>
              <button
                id="portal-profile-btn"
                onClick={() => setDropOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 transition hover:bg-muted"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-sm font-bold text-background">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium sm:inline">{userName}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${dropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-sm font-semibold">{userName}</p>
                      <p className="text-xs text-muted-foreground">Client</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Home className="h-4 w-4" /> Back to Home
                      </Link>
                      <div className="my-1 border-t border-border" />
                      <button
                        onClick={() => {
                          setDropOpen(false);
                          handleSignOut();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
        </div>
      </div>
    </MotionConfig>
  );
}
