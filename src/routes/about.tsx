import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "../components/site-shell";
import heroImg from "../assets/hero.jpg";
import amarRajanImg from "../assets/amar-rajan.png";
import aboutBannerImg from "../assets/image copy.png";
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

/* ── Small eyebrow label reused across sections ─────────────────────────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
      {children}
    </p>
  );
}

/* ── 1. Hero banner — full-bleed geometric background, centered copy ────── */
function AboutHero() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={aboutBannerImg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-foreground/15" />

      <div className="relative mx-auto max-w-3xl px-6 py-14 text-center sm:py-20">
        <ScrollReveal>
          <p
            className="inline-flex items-center gap-2 text-sm font-semibold italic text-white"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-brand" />
            About Us
          </p>
          <h1
            className="font-display mt-4 text-3xl font-black leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            Where Organizational Psychology Meets{" "}
            <span className="italic text-brand">Human Potential</span>
          </h1>
          <p
            className="mt-5 text-sm font-medium italic text-white"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            &ldquo;The future of work belongs to those who understand themselves before they seek to
            transform their organizations. In the age of AI, self-discovery unlocks human potential,
            organizational support enables that potential, and together they evolve toward sustained
            excellence.&rdquo; — The Mindcarter Team
          </p>
          <Link
            to="/contact"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-[0_1px_0_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Work with us <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 2. Our story — image left with floating stat card, copy right ──────── */
function OurStory() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left — portrait with accent + floating stat card */}
        <ScrollReveal className="relative">
          <div
            aria-hidden
            className="absolute -left-5 -top-5 h-28 w-28 rounded-3xl bg-brand/20"
          />
          <div className="relative flex items-end justify-center overflow-hidden rounded-[2rem] bg-brand/10">
            <img
              src={amarRajanImg}
              alt="Amar Rajan — CEO, Mindcarter"
              className="max-h-[480px] w-auto object-contain object-bottom"
              loading="lazy"
            />
          </div>

          {/* floating stat card */}
          <div className="absolute -right-4 top-10 rounded-2xl border border-border bg-background px-5 py-4 shadow-xl">
            <p className="font-display text-3xl font-black leading-none text-foreground">32</p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Countries served
            </p>
          </div>
        </ScrollReveal>

        {/* Right — copy */}
        <ScrollReveal delay={0.15}>
          <Eyebrow>Our story</Eyebrow>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Built on the Science of Human Behavior. Designed for the Future of Work.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            MindCarter was founded with a simple belief: organizations perform at their best when
            they understand the people behind performance. As workplaces become increasingly shaped
            by AI, technological disruption, and changing workforce expectations, success depends not
            only on innovation but also on understanding human behavior.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Drawing on the principles of organizational psychology and behavioral science, we help
            organizations make better people decisions—from selecting and developing talent to
            strengthening leadership, supporting employee wellbeing, and building high-performing
            teams. Every solution we deliver is grounded in scientific evidence, informed by real
            workplace challenges, and designed to create measurable organizational impact.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            At MindCarter, we exist to help individuals discover their potential, enable meaningful
            growth, and evolve alongside the organizations they help shape.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 3. Mission & Vision — copy left, stacked cards right ────────────────── */
function MissionVision() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-muted/30 py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-16 h-44 w-44 rounded-l-[2.5rem] bg-brand/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-12 h-40 w-40 rounded-full bg-foreground/[0.03]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <ScrollReveal>
          <Eyebrow>What drives us</Eyebrow>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            The principles that guide every engagement.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            Two commitments shape how we show up for the people and organizations we serve — one for
            today, one for the world we&rsquo;re working toward.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-5">
          <StaggerItem>
            <Panel
              eyebrow="Mission"
              title="To help individuals and organizations thrive in the age of AI by applying evidence-based organizational psychology to improve people decisions, strengthen leadership, enhance employee wellbeing, and build workplaces where human potential and technology work together to create sustainable organizational success."
            />
          </StaggerItem>
          <StaggerItem>
            <Panel
              eyebrow="Vision"
              title="To be a globally trusted organizational psychology company advancing the future of work by integrating behavioral science, human-centered AI, and evidence-based practice. We envision a world where organizations harness technology not to replace human potential, but to discover it, enable it, and help it evolve."
            />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}



function AboutPage() {
  return (
    <SiteShell>
      <AboutHero />
      <OurStory />
      <MissionVision />
    </SiteShell>
  );
}

function Panel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-8 shadow-sm transition-all duration-300 ease-out sm:p-10 hover:-translate-y-3 hover:scale-[1.03] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] hover:border-brand/30 transform-gpu cursor-default">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
        {eyebrow}
      </p>
      <p className="mt-4 text-sm font-semibold leading-snug tracking-tight sm:text-lg">{title}</p>
    </div>
  );
}
