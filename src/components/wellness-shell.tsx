import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import { motion, MotionConfig } from "framer-motion";
import {
  LayoutDashboard,
  CalendarHeart,
  CalendarPlus,
  Users,
  BookOpen,
  Bell,
  UserCircle,
  Home,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  Flame,
  LifeBuoy,
} from "lucide-react";
import logoImg from "../assets/mindcarter-logo.avif";
import { Sheet, SheetContent, SheetTitle } from "./ui/sheet";
import { logoutFn } from "../lib/auth.server";
import { useSession } from "../lib/use-session";
import { usePatientData } from "../lib/patient-store";

type NavItem = { label: string; to: string; exact?: boolean; icon: React.ElementType };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/employee", exact: true, icon: LayoutDashboard },
  { label: "Sessions", to: "/employee/sessions", icon: CalendarHeart },
  { label: "Book a Session", to: "/employee/book", icon: CalendarPlus },
  { label: "Care Team", to: "/employee/care-team", icon: Users },
  { label: "Wellness Journal", to: "/employee/journal", icon: BookOpen },
  { label: "Notifications", to: "/employee/notifications", icon: Bell },
  { label: "Support", to: "/employee/support", icon: LifeBuoy },
  { label: "Profile", to: "/employee/profile", icon: UserCircle },
];

/**
 * Shared nav motion — Apple/Linear-style: quick, settled, no flashy overshoot.
 * Every animated property here is `transform` or `opacity` only, so the whole
 * nav stays on the compositor and holds 60fps.
 *
 * The spring's own settling time (~0.35s at this stiffness/damping) is what
 * gives the pill its ~0.4s travel — a spring is physics-driven, so it takes
 * stiffness/damping rather than an explicit duration.
 */
const NAV_SPRING = { type: "spring" as const, stiffness: 320, damping: 28 };
/** Selected icon pops to 1.08 and settles back. */
const ICON_POP = { scale: [1, 1.08, 1] };
const ICON_POP_TRANSITION = { duration: 0.4, ease: "easeOut" as const };
/** Press feedback: down to 0.95, spring back. */
const TAP_SCALE = { scale: 0.95 };

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
          item.to === "/employee/notifications" && stats.unreadCount > 0 ? stats.unreadCount : null;
        const locked = onboardingLocked && item.to !== "/employee/profile";

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
          <motion.div key={item.to} whileTap={TAP_SCALE} transition={NAV_SPRING}>
            <Link
              to={item.to}
              onClick={onNavigate}
              className={`group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                active ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId={`${idPrefix}-nav-pill`}
                  className="absolute inset-0 -z-0 rounded-lg bg-foreground will-change-transform"
                  transition={NAV_SPRING}
                />
              ) : (
                /* Hover wash as an opacity fade rather than a color change,
                   to keep the transition on the compositor. */
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-lg bg-foreground/[0.06] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                />
              )}
              <motion.span
                className="relative z-10 flex shrink-0 transform-gpu"
                animate={active ? ICON_POP : { scale: 1 }}
                transition={ICON_POP_TRANSITION}
              >
                <Icon className="h-4 w-4 transform-gpu transition-transform duration-200 ease-out group-hover:rotate-[3deg]" />
              </motion.span>
              <span className="relative z-10">{item.label}</span>
              {badge !== null && (
                <span className="relative z-10 ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-brand-foreground">
                  {badge}
                </span>
              )}
            </Link>
          </motion.div>
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

/** Mobile drawer nav: a dark full-height panel led by the signed-in user's
 *  identity, with sign-out split off at the bottom. Deliberately separate from
 *  the desktop sidebar's `NavLinks`/`BottomActions` so restyling the drawer
 *  can't leak into the desktop chrome. */
function MobileNavPanel({
  onNavigate,
  onSignOut,
}: {
  onNavigate: () => void;
  onSignOut: () => void;
}) {
  const location = useLocation();
  const { stats, profile } = usePatientData();
  const { data: session } = useSession();
  const onboardingLocked = profile !== null && !profile.onboardingComplete;

  const userName = session?.name ?? "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* ── Identity header — the whole row (and its arrow) opens Profile. */}
      <Link
        to="/employee/profile"
        onClick={onNavigate}
        className="group flex items-center gap-3.5 border-b border-border px-5 pb-5 pt-12 transition-colors hover:bg-muted/60"
      >
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand text-lg font-black text-brand-foreground">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold leading-tight text-foreground">{userName}</p>
          <p className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Employee
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>

      {/* ── Nav */}
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-2">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? location.pathname === item.to
            : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          const badge =
            item.to === "/employee/notifications" && stats.unreadCount > 0
              ? stats.unreadCount
              : null;
          const locked = onboardingLocked && item.to !== "/employee/profile";

          if (locked) {
            return (
              <span
                key={item.to}
                title="Complete your profile to unlock this section"
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/40"
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
            );
          }

          return (
            <motion.div key={item.to} whileTap={TAP_SCALE} transition={NAV_SPRING}>
              <Link
                to={item.to}
                onClick={onNavigate}
                className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  active ? "text-brand-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 -z-0 rounded-xl bg-brand will-change-transform"
                    transition={NAV_SPRING}
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-xl bg-foreground/[0.06] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                  />
                )}
                <motion.span
                  className="relative z-10 flex shrink-0 transform-gpu"
                  animate={active ? ICON_POP : { scale: 1 }}
                  transition={ICON_POP_TRANSITION}
                >
                  <Icon className="h-[18px] w-[18px] transform-gpu transition-transform duration-200 ease-out group-hover:rotate-[3deg]" />
                </motion.span>
                <span className="relative z-10 truncate">{item.label}</span>
                {badge !== null && (
                  <span
                    className={`relative z-10 ml-auto grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[10px] font-bold ${
                      active ? "bg-brand-foreground text-brand" : "bg-foreground text-background"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* ── Streak */}
      <div className="mx-3 mb-2 flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
        <motion.span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand"
          animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flame className="h-4 w-4" />
        </motion.span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-bold">{stats.streakDays}-day streak</p>
          <p className="truncate text-[11px] text-muted-foreground">Keep it going</p>
        </div>
      </div>

      {/* ── Bottom actions */}
      <div className="flex shrink-0 flex-col gap-1 border-t border-border p-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Home className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
        <button
          onClick={() => {
            onNavigate();
            onSignOut();
          }}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
          Sign Out
        </button>
      </div>
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
          <SheetContent side="left" className="flex w-[min(19rem,85vw)] flex-col p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <MobileNavPanel
              onNavigate={() => setMobileNavOpen(false)}
              onSignOut={handleSignOut}
            />
          </SheetContent>
        </Sheet>

        {/* ── Main content */}
        <div className="min-w-0 lg:pl-64">
          {/* Top header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border transition hover:bg-muted lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <p className="truncate text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:tracking-[0.2em]">
                <span className="hidden sm:inline">Wellness · </span>
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
                      <p className="text-xs text-muted-foreground">Employee</p>
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

          <main className="mx-auto min-w-0 max-w-7xl px-4 py-[clamp(1.5rem,4vw,2.5rem)] xs:px-5 sm:px-6">
            {children}
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
