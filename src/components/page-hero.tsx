import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
          {eyebrow}
        </p>
        <h1 className="font-display mt-4 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}