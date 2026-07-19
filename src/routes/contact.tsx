import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "../components/site-shell";
import { PageHero } from "../components/page-hero";
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter } from "lucide-react";
import { ScrollReveal } from "../components/scroll-reveal";

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
      <ScrollReveal variant="fade-down">
        <PageHero
          eyebrow="Contact"
          title="Book a consultation or say hello."
          description="Our intake team responds within one business day. Existing clients — please sign in for scheduling."
        />
      </ScrollReveal>

      <section className="border-b border-border bg-background py-20">
        <ScrollReveal variant="zoom-in" className="mx-auto max-w-6xl px-6">
          <div className="grid overflow-hidden rounded-2xl border border-border shadow-sm lg:grid-cols-[3fr_2fr]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="bg-background p-8 sm:p-12"
            >
              <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
                Contact Us
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Our intake team responds within one business day. Existing clients — please sign in for scheduling.
              </p>

              <div className="mt-8 space-y-5">
                <TextField label="Name" name="name" required />
                <TextField label="Email" name="email" type="email" required />
                <TextField label="Message" name="message" as="textarea" rows={5} required />
              </div>

              <button
                type="submit"
                className="mt-8 rounded-md bg-brand px-9 py-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                {sent ? "Sent" : "Send"}
              </button>
            </form>

            <div className="relative flex flex-col justify-between overflow-hidden bg-foreground p-8 text-background sm:p-10">
              <span
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 h-36 w-36 bg-brand [clip-path:polygon(30%_0,100%_0,100%_70%)]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 h-20 w-20 bg-brand [clip-path:polygon(0_30%,0_100%,70%_100%)]"
              />

              <div className="relative z-10 mt-6">
                <h3 className="font-display text-2xl font-black tracking-tight">Info</h3>
                <div className="mt-8 space-y-5">
                  <InfoRow icon={Phone} label="+1 (415) 555-0139" href="tel:+14155550139" />
                  <InfoRow icon={Mail} label="hello@mindcarter.co" href="mailto:hello@mindcarter.co" />
                  <InfoRow
                    icon={MapPin}
                    label="200 Market Street, Suite 1400, San Francisco, CA 94111"
                  />
                </div>
              </div>

              <div className="relative z-10 mt-10 flex gap-3">
                {[Twitter, Facebook, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label={Icon.displayName}
                    className="grid h-8 w-8 place-items-center rounded-full border border-background/25 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-brand-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="slide-right" className="mx-auto mt-8 max-w-6xl px-6">
          <div className="overflow-hidden rounded-2xl border border-border transition-transform duration-300 hover:scale-[1.01]">
            <iframe
              title="Mindcarter location"
              className="h-64 w-full grayscale"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-122.402%2C37.789%2C-122.394%2C37.796&layer=mapnik"
            />
          </div>
        </ScrollReveal>
      </section>
    </SiteShell>
  );
}

function TextField({
  label,
  name,
  type = "text",
  required,
  as = "input",
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  as?: "input" | "textarea";
  rows?: number;
}) {
  const sharedClassName =
    "w-full rounded-md border border-transparent bg-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:bg-background";
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {as === "textarea" ? (
        <textarea name={name} required={required} rows={rows} className={`mt-1.5 ${sharedClassName}`} />
      ) : (
        <input name={name} type={type} required={required} className={`mt-1.5 ${sharedClassName}`} />
      )}
    </label>
  );
}

function InfoRow({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof Phone;
  label: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 text-sm text-background/85 transition-colors group-hover:text-brand">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="leading-relaxed">{label}</span>
    </div>
  );
  return href ? (
    <a href={href} className="group block">
      {content}
    </a>
  ) : (
    content
  );
}