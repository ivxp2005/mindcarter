// Types shared between server-only auth logic (src/lib/auth.server.ts) and
// client components (site-nav.tsx, portal-shell.tsx, login.tsx, etc). No
// runtime secrets or DB access here — safe to import from anywhere.

export type UserRole = "patient" | "psychologist" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
