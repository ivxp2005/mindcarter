import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "../components/site-shell";
import { PageHero } from "../components/page-hero";
import { Facebook, Instagram, Twitter } from "lucide-react";
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
                  <InfoRow icon={WhatsAppIcon} label="+91 75940 71071" href="tel:+917594071071" />
                  <InfoRow icon={GmailIcon} label="info@mindcarter.com" href="mailto:info@mindcarter.com" />
                  <InfoRow
                    icon={GoogleMapsIcon}
                    label="Module no: A, Tejaswini, Technopark, Trivandrum"
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

function GmailIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#F2F2F2" />
      <path d="M22 6V18C22 19.1 21.1 20 20 20H18V8L12 13L6 8V20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4H20C21.1 4 22 4.9 22 6Z" fill="#EA4335" />
      <path d="M18 8L12 13L6 8V4H18V8Z" fill="#FBBC05" />
      <path d="M2 6V18C2 19.1 2.9 20 4 20H6V8L12 13L18 8V20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6Z" fill="#34A853" />
      <path d="M2 6V14L8 9L2 6Z" fill="#4285F4" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.762.455 3.486 1.32 5.011l-1.4 5.115 5.234-1.372c1.472.802 3.125 1.25 4.85 1.25 5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zM12 20.136c-1.576 0-3.12-.418-4.484-1.21l-.321-.19-3.33.873.889-3.242-.209-.333a8.106 8.106 0 01-1.246-4.22c0-4.492 3.655-8.147 8.147-8.147 2.176 0 4.222.847 5.76 2.387A8.09 8.09 0 0120.147 12c0 4.492-3.656 8.136-8.147 8.136zm4.568-6.195c-.25-.125-1.482-.731-1.712-.815-.23-.083-.397-.125-.564.125-.167.25-.647.815-.793.982-.146.167-.292.187-.542.062a6.837 6.837 0 01-2.013-1.242 7.534 7.534 0 01-1.392-1.733c-.146-.25-.016-.386.11-.51.112-.11.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.02-.438-.063-.125-.564-1.358-.773-1.859-.203-.489-.41-.422-.564-.43-.146-.007-.313-.008-.48-.008s-.438.062-.667.313c-.23.25-.877.855-.877 2.087s.898 2.42 1.023 2.587c.125.167 1.767 2.7 4.282 3.785.598.258 1.065.412 1.43.528.601.191 1.147.164 1.58.1.482-.072 1.483-.605 1.692-1.19.209-.584.209-1.085.146-1.19-.063-.105-.23-.167-.48-.292z" fill="#25D366" />
    </svg>
  );
}

function GoogleMapsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.5 9.5C19.5 14.5 12 21.5 12 21.5C12 21.5 4.5 14.5 4.5 9.5C4.5 5.35786 7.85786 2 12 2C16.1421 2 19.5 5.35786 19.5 9.5Z" fill="#EA4335" />
      <path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" fill="#FFFFFF" />
    </svg>
  );
}

function InfoRow({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType;
  label: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 text-sm text-background/85 transition-colors group-hover:text-brand">
      <div className="mt-0.5 shrink-0">
        <Icon />
      </div>
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