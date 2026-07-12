import { createFileRoute } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { SiteShell } from "../components/site-shell";
import amarRajanImg from "../assets/amar-rajan.png";
import teamImg from "../assets/team.png";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";
import { useParallaxScroll } from "../hooks/use-parallax-scroll";

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

function AboutHero() {
  const scrollY = useParallaxScroll();
  const textY = Math.min(scrollY * 0.5, 120);
  const textOpacity = Math.max(1 - scrollY / 400, 0);

  return (
    <section
      className="relative flex h-[50vh] min-h-[380px] items-center justify-center overflow-hidden border-b border-border"
      style={{
        backgroundImage: `url(${teamImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-black/25" />

      <div
        className="relative mx-auto max-w-2xl px-6 text-center text-background"
        style={{
          transform: `translateY(${-textY}px)`,
          opacity: textOpacity,
          willChange: "transform, opacity",
        }}
      >
        <Quote className="mx-auto h-6 w-6 text-brand" strokeWidth={2.5} />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-background/70">
          About
        </p>
        <h1 className="font-display mt-4 text-3xl font-black italic leading-[1.15] tracking-tight sm:text-5xl">
          &ldquo;Every breakthrough begins with being understood.&rdquo;
        </h1>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-background/70">
          — The Mindcarter Team
        </p>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <SiteShell>
      <AboutHero />

      <section className="border-b border-border bg-background py-16">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display text-2xl font-black leading-snug tracking-tight sm:text-3xl">
              A practice built where clinical rigor meets human curiosity.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Mindcarter was founded to close the gap between the science of psychology and the everyday realities of individuals, leaders and organizations.
            </p>
          </div>
        </ScrollReveal>
      </section>

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
              <h2 className="font-display mt-3 text-3xl font-black tracking-tight sm:text-4xl">Founded by clinicians, built for scale.</h2>
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
            <h2 className="font-display mt-3 text-3xl font-black tracking-tight sm:text-4xl">The people behind the practice</h2>
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