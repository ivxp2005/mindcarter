import type { ReactNode } from "react";

export function PortalPageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PortalEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background p-12 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PortalLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl border border-border bg-muted/40"
          aria-label={label}
        />
      ))}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  completed: "bg-foreground text-background",
  cancelled: "bg-rose-100 text-rose-800",
  not_started: "bg-muted text-foreground",
  in_progress: "bg-amber-100 text-amber-800",
};

export function StatusPill({ status }: { status: string }) {
  const label = status.replace("_", " ");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        statusStyles[status] ?? "bg-muted text-foreground"
      }`}
    >
      {label}
    </span>
  );
}