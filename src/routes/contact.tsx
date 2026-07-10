import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "../components/site-shell";
import { PageHero } from "../components/page-hero";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mindcarter" },
      { name: "description", content: "Reach the Mindcarter team or book a confidential consultation." },
      { property: "og:title", content: "Contact — Mindcarter" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteShell>
      <ScrollReveal yOffset={40}>
        <PageHero
          eyebrow="Contact"
          title="Book a consultation or say hello."
          description="Our intake team responds within one business day. Existing clients — please sign in for scheduling."
        />
      </ScrollReveal>

      <section className="border-b border-border bg-background py-20">
        <StaggerContainer className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.2fr_1fr]">
          <StaggerItem>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="rounded-3xl border border-border bg-background p-8 sm:p-10 transition-shadow hover:shadow-lg"
            >
              <h2 className="text-2xl font-semibold tracking-tight">Send an inquiry</h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Full name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" />
                <Field label="Organization" name="org" />
              </div>
              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  How can we help?
                </label>
                <textarea
                  required
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
                />
              </div>
              <button
                type="submit"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:scale-105 active:scale-95"
              >
                {sent ? "Thank you — we'll be in touch" : "Send inquiry"}
                {!sent && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </StaggerItem>

          <StaggerItem>
            <aside className="space-y-4">
              <Info icon={Phone} title="Call" body="+1 (415) 555-0139" />
              <Info icon={Mail} title="Email" body="hello@mindcarter.co" />
              <Info icon={MapPin} title="Studio" body="200 Market Street, Suite 1400, San Francisco, CA 94111" />
              <div className="overflow-hidden rounded-2xl border border-border transition-transform hover:scale-[1.02]">
                <iframe
                  title="Mindcarter location"
                  className="h-64 w-full grayscale"
                  loading="lazy"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-122.402%2C37.789%2C-122.394%2C37.796&layer=mapnik"
                />
              </div>
            </aside>
          </StaggerItem>
        </StaggerContainer>
      </section>

      <section className="bg-muted/40 py-20">
        <ScrollReveal className="mx-auto max-w-4xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">FAQ</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Frequently asked</h2>
          <StaggerContainer className="mt-10 divide-y divide-border rounded-2xl border border-border bg-background">
            {FAQ.map((f) => (
              <StaggerItem key={f.q}>
                <details className="group p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold">
                    {f.q}
                    <span className="ml-4 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border transition-transform duration-300 group-open:rotate-45 group-hover:bg-foreground group-hover:text-background">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </ScrollReveal>
      </section>
    </SiteShell>
  );
}

const FAQ = [
  { q: "How quickly can I be seen?", a: "Most new clients are matched with a psychologist within 3 business days." },
  { q: "Do you take insurance?", a: "We're out-of-network in the US and provide superbills. Enterprise plans are direct-billed." },
  { q: "Are sessions online or in-person?", a: "Both. Our platform supports secure video sessions and our SF studio is open by appointment." },
  { q: "How is my privacy protected?", a: "We are HIPAA-aligned and ISO 27001 informed. Data is encrypted end-to-end." },
];

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
      />
    </label>
  );
}

function Info({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Phone;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-background p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground text-background">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
        <p className="mt-1 text-sm font-medium">{body}</p>
      </div>
    </div>
  );
}