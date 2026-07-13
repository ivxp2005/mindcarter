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
            A practice built where clinical rigor meets{" "}
            <span className="italic text-brand">human curiosity.</span>
          </h1>
          <p
            className="mt-5 text-sm font-medium italic text-white"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            &ldquo;Every breakthrough begins with being understood.&rdquo; — The Mindcarter Team
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
            Founded by clinicians, built for scale.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            We started Mindcarter after a decade in academic hospitals and Fortune 500 boardrooms —
            convinced that the tools of clinical psychology and organizational science deserved a
            modern, accessible home.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Today we serve individuals in 32 countries and partner with enterprises across finance,
            technology and healthcare — always with the same evidence-first standard.
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
              title="Make research-backed psychological care the default — for people and organizations."
            />
          </StaggerItem>
          <StaggerItem>
            <Panel
              eyebrow="Vision"
              title="A world where every leader, team and individual has a licensed guide for the inner work."
            />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ── 4. Team — photo left, copy right, then the leadership grid ──────────── */
const LEADERSHIP = ["Dr. Aditi Carter", "Dr. Marcus Vale", "Dr. Lena Ortiz", "Dr. Rohan Mehra"];

function Team() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — team photo with accent block */}
          <ScrollReveal className="relative">
            <div
              aria-hidden
              className="absolute -bottom-5 -right-5 h-32 w-32 rounded-3xl bg-brand"
            />
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
              <img
                src={heroImg}
                alt="The Mindcarter team"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
          </ScrollReveal>

          {/* Right — copy */}
          <ScrollReveal delay={0.15}>
            <Eyebrow>Leadership</Eyebrow>
            <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              The people behind the practice.
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              Doctorate-level clinicians and organizational scientists who bring both rigor and
              warmth to every engagement — and a team that keeps growing.
            </p>
          </ScrollReveal>
        </div>

        {/* Leadership grid */}
        <StaggerContainer className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEADERSHIP.map((n) => (
            <StaggerItem key={n}>
              <div className="h-full rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-neutral-300 to-neutral-500 transition-transform duration-500 hover:scale-105" />
                <h3 className="mt-4 text-base font-semibold">{n}</h3>
                <p className="text-xs text-muted-foreground">Doctorate-level clinician</p>
              </div>
            </StaggerItem>
          ))}
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
      <Team />
    </SiteShell>
  );
}

function Panel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-8 shadow-sm sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
        {eyebrow}
      </p>
      <p className="mt-4 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">{title}</p>
    </div>
  );
}
