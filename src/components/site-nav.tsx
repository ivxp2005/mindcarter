import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import logoImg from "../assets/mindcarter-logo.avif";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  CalendarClock,
  Users,
  Home,
} from "lucide-react";
import { logoutFn } from "../lib/auth.server";
import { useSession } from "../lib/use-session";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Our Programs" },
  { to: "/contact", label: "Contact" },
] as const;

const patientLinks = [{ to: "/patient", label: "My Wellness", icon: Home }] as const;

const doctorLinks = [
  { to: "/psychologist", label: "Dashboard", icon: LayoutDashboard },
  { to: "/psychologist", label: "Schedule", icon: CalendarClock },
  { to: "/psychologist", label: "Patients", icon: Users },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dropRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const role = session?.role ?? null;

  /* scroll border */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* close dropdown on navigation */
  useEffect(() => {
    setDropOpen(false);
  }, [location.pathname]);

  /* close dropdown on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const isDoctor = role === "psychologist";
  const isPatient = role === "patient";
  const portalTo = isDoctor ? "/psychologist" : "/patient";
  const roleLinks = isDoctor ? doctorLinks : isPatient ? patientLinks : null;
  const userName = session?.name ?? "";
  const userRole = isDoctor ? "Psychologist" : isPatient ? "Patient" : "";
  const initials = session
    ? session.name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const handleSignOut = async () => {
    await logoutFn();
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    setDropOpen(false);
    navigate({ to: "/" });
  };

  const isHome = location.pathname === "/";
  const isDarkNav = isHome && !scrolled;

  const activeClass = isDarkNav ? "text-white font-semibold" : "text-foreground font-semibold";
  const inactiveClass = isDarkNav
    ? "text-white/70 hover:text-white"
    : "text-muted-foreground hover:text-foreground";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/40 backdrop-blur-lg border-b border-border/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)]"
          : isHome
            ? "bg-black/10 backdrop-blur-sm border-b border-transparent"
            : "bg-background/10 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <img
            src={logoImg}
            alt="Mindcarter"
            className="h-14 w-auto transition-all"
            style={{ filter: isDarkNav ? "brightness(0) invert(1)" : "none" }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {publicLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: activeClass }}
              inactiveProps={{ className: inactiveClass }}
              className="text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {/* Role portal links */}
          {roleLinks && (
            <>
              <span className={`h-4 w-px ${isDarkNav ? "bg-white/20" : "bg-border"}`} aria-hidden />
              {roleLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: activeClass }}
                  inactiveProps={{ className: inactiveClass }}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                >
                  <l.icon className="h-3.5 w-3.5" />
                  {l.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Desktop right — logged out: Login + Book; logged in: profile avatar dropdown */}
        <div className="hidden items-center gap-3 md:flex">
          {role ? (
            /* ── Profile Avatar Dropdown ── */
            <div className="relative" ref={dropRef}>
              <button
                id="nav-profile-btn"
                onClick={() => setDropOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5 transition hover:bg-muted"
                aria-expanded={dropOpen}
                aria-haspopup="true"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-xs font-bold text-background">
                  {initials}
                </span>
                <span className="max-w-[110px] truncate text-sm font-medium">{userName}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                    dropOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropOpen && (
                <div
                  className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-xl"
                  role="menu"
                >
                  {/* User info header */}
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userRole}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      to={portalTo}
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {isPatient ? "My Wellness" : "My Dashboard"}
                    </Link>

                    {isDoctor && (
                      <Link
                        to="/psychologist"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <CalendarClock className="h-4 w-4" />
                        My Schedule
                      </Link>
                    )}

                    <Link
                      to="/"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <Home className="h-4 w-4" />
                      Home
                    </Link>

                    <div className="my-1 border-t border-border" />

                    <button
                      id="nav-signout-btn"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Logged-out actions ── */
            <>
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors ${
                  isDarkNav
                    ? "text-white/80 hover:text-white"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                Login
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-[0_1px_0_rgba(0,0,0,0.08)] transition hover:translate-y-[-1px] hover:shadow-md"
              >
                Book Consultation <span aria-hidden>→</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          className={`grid h-10 w-10 place-items-center rounded-md border md:hidden transition-colors ${
            isDarkNav
              ? "border-white/20 text-white hover:bg-white/10"
              : "border-border text-foreground hover:bg-muted"
          }`}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {publicLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}

            {roleLinks && (
              <>
                <div className="my-2 border-t border-border" />
                <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Doctor Portal
                </p>
                {roleLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <l.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {l.label}
                  </Link>
                ))}
              </>
            )}

            <div className="my-2 border-t border-border" />

            {role ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-xs font-bold text-background">
                    {initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userRole}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
                >
                  Book Consultation
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
