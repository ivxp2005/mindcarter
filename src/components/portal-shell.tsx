import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Home, LogOut, ChevronDown, Menu } from "lucide-react";
import { Sheet, SheetContent } from "./ui/sheet";

type NavItem = { label: string; to?: string; exact?: boolean };

function NavLinks({ navItems, onNavigate }: { navItems: NavItem[]; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((n, i) => {
        const active = n.to
          ? n.exact
            ? location.pathname === n.to
            : location.pathname === n.to || location.pathname.startsWith(n.to + "/")
          : i === 0;
        const cls = `rounded-lg px-3 py-2 text-sm font-medium transition ${
          active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
        }`;
        return n.to ? (
          <Link key={n.label} to={n.to} className={cls} onClick={onNavigate}>
            {n.label}
          </Link>
        ) : (
          <a key={n.label} href="#" className={cls}>
            {n.label}
          </a>
        );
      })}
    </nav>
  );
}

function BrandHeader({ brand }: { brand: string }) {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-border px-6">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background">
        <span className="text-sm font-black">M</span>
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold">Mindcarter.</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{brand}</p>
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
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Home className="h-4 w-4" /> Back to Home
      </Link>
      <button
        onClick={() => {
          onNavigate?.();
          onSignOut();
        }}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-red-500"
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </div>
  );
}

export function PortalShell({
  brand,
  navItems,
  children,
}: {
  brand: string;
  navItems: NavItem[];
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isDoctor =
    brand.toLowerCase().includes("psychologist") || brand.toLowerCase().includes("doctor");
  const initials = isDoctor ? "Dr" : "Pt";
  const userName = isDoctor ? "Dr. Aditi Carter" : "Alex";
  const userRole = isDoctor ? "Psychologist" : "Patient";

  const handleSignOut = () => {
    localStorage.removeItem("mc_role");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      {/* ── Sidebar (desktop) ───────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-background lg:flex">
        <BrandHeader brand={brand} />
        <NavLinks navItems={navItems} />
        <BottomActions onSignOut={handleSignOut} />
      </aside>

      {/* ── Sidebar (mobile drawer) ─────────────────────────── */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <BrandHeader brand={brand} />
          <NavLinks navItems={navItems} onNavigate={() => setMobileNavOpen(false)} />
          <BottomActions onSignOut={handleSignOut} onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* ── Main content ─────────────────────────────────────── */}
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
              {brand} · <span className="text-foreground">{location.pathname}</span>
            </p>
          </div>

          {/* Profile dropdown */}
          <div className="relative shrink-0">
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
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                {/* Menu */}
                <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                  {/* User info */}
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userRole}</p>
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
  );
}
