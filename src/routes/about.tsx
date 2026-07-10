import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "../components/site-shell";
import { PageHero } from "../components/page-hero";
import amarRajanImg from "../assets/amar-rajan.png";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mindcarter" },
      {
        name: "description",
        content:
          "Mindcarter is a research-backed psychology & organizational consulting practice. Learn about our mission, vision, and team.",
      },
      { property: "og:title", content: "About — Mindcarter" },
      { property: "og:description", content: "Our mission, vision and team." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <ScrollReveal yOffset={40}>
        <PageHero
          eyebrow="About"
          title="A practice built where clinical rigor meets human curiosity."
          description="Mindcarter was founded to close the gap between the science of psychology and the everyday realities of individuals, leaders and organizations."
        />
      </ScrollReveal>

      <section className="border-b border-border bg-background py-20">
        <ScrollReveal>
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
            <div className="flex items-end justify-center overflow-hidden rounded-3xl bg-brand/20">
              <img
                src={amarRajanImg}
                alt="Amar Rajan — CEO, Mindcarter"
                className="max-h-[480px] w-auto object-contain object-bottom"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Our story</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Founded by clinicians, built for scale.</h2>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                We started Mindcarter after a decade in academic hospitals and Fortune 500 boardrooms — convinced that the tools of clinical psychology and organizational science deserved a modern, accessible home.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Today we serve individuals in 32 countries and partner with enterprises across finance, technology and healthcare — always with the same evidence-first standard.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="border-b border-border bg-muted/40 py-20">
        <StaggerContainer className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2">
          <StaggerItem>
            <Panel eyebrow="Mission" title="Make research-backed psychological care the default — for people and organizations." />
          </StaggerItem>
          <StaggerItem>
            <Panel eyebrow="Vision" title="A world where every leader, team and individual has a licensed guide for the inner work." />
          </StaggerItem>
        </StaggerContainer>
      </section>

      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Leadership</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">The people behind the practice</h2>
          </ScrollReveal>
          <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Dr. Aditi Carter", "Dr. Marcus Vale", "Dr. Lena Ortiz", "Dr. Rohan Mehra"].map((n) => (
              <StaggerItem key={n}>
                <div className="rounded-2xl border border-border bg-background p-6 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-neutral-300 to-neutral-500 transition-transform duration-500 hover:scale-105" />
                  <h3 className="mt-4 text-base font-semibold">{n}</h3>
                  <p className="text-xs text-muted-foreground">Doctorate-level clinician</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </SiteShell>
  );
}

function Panel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
        {eyebrow}
      </p>
      <p className="mt-4 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{title}</p>
    </div>
  );
}