import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import { SiteShell } from "../components/site-shell";
import amarRajanImg from "../assets/amar-rajan.png";
import aboutUsImg from "../assets/345.png";
import aboutBannerImg from "../assets/image copy.png";
import { ScrollReveal } from "../components/scroll-reveal";

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
        <ScrollReveal variant="zoom-out">
          <h1
            className="font-display mt-4 text-3xl font-black leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            Where Organizational Psychology Meets{" "}
            <span className="italic text-brand">Human Potential</span>
          </h1>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 2. About us — copy left, team photo right with floating purpose card ─ */
function AboutUs() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28">
      {/* soft flowing wave pinned to the bottom edge, below the content */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-full text-brand sm:h-32"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-40 120 C 320 30, 680 210, 1040 110 C 1260 55, 1400 90, 1480 65 L 1480 200 L -40 200 Z"
          fill="currentColor"
          opacity="0.06"
        />
        <path
          d="M-40 150 C 340 60, 700 230, 1060 130 C 1270 72, 1400 105, 1480 85"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.16"
        />
      </svg>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <ScrollReveal variant="slide-left">
          <Eyebrow>About us</Eyebrow>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Better people decisions, through the science of human behavior.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            MINDCARTER is an organizational psychology consulting firm that helps organizations
            build future-ready, high-performing, and resilient workplaces by strengthening the
            human systems that drive performance.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We partner with organizations to improve the quality of people decisions, develop
            leadership capability, enhance workforce wellbeing, and build organizational cultures
            that enable individuals, teams, and businesses to perform at their best. Our approach
            combines evidence-based organizational psychology with practical business insight to
            deliver measurable outcomes that support long-term organizational success.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            As organizations navigate rapid technological change and the increasing adoption of
            artificial intelligence, sustainable performance depends not only on technology but
            also on how people adapt, collaborate, exercise judgment, and lead. MINDCARTER helps
            organizations prepare for this future by integrating organizational psychology with
            Behavioral AI Governance, enabling organizations to build AI-ready workforces,
            strengthen human oversight, and foster the responsible adoption of AI.
          </p>

          <motion.div
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Every engagement is designed around the unique context, culture, and strategic
              priorities of the organization. Rather than applying generic management solutions, we
              deliver scientifically informed, ethically grounded, and business-focused
              interventions that strengthen organizational capability and create lasting impact.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Whether supporting leadership development, employee wellbeing, talent decisions, or
              the responsible integration of artificial intelligence, our focus remains the same:
              helping organizations unlock human potential, strengthen performance, and thrive in a
              changing world of work.
            </p>
          </motion.div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline decoration-brand decoration-2 underline-offset-4 transition hover:text-brand"
          >
            {expanded ? "Read less" : "Read more"}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </ScrollReveal>

        {/* Right — team photo with triangle corner accents */}
        <ScrollReveal variant="slide-right" delay={0.15} className="relative">
          <div className="relative overflow-hidden">
            <img
              src={aboutUsImg}
              alt="MindCarter consultants celebrating a successful working session"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* triangle cascade — top-left corner */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -left-6 -top-6 h-40 w-40"
            viewBox="0 0 200 200"
          >
            <path d="M0 0 H80 L0 80 Z" className="fill-brand" />
            <path d="M90 0 H150 L90 60 Z" className="fill-foreground/85" />
            <path d="M0 90 H60 L0 150 Z" className="fill-foreground/20" />
            <path d="M160 0 H200 L160 40 Z" className="fill-brand/40" />
            <path d="M0 160 H40 L0 200 Z" className="fill-brand/40" />
          </svg>

          {/* triangle cascade — bottom-right corner */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40"
            viewBox="0 0 200 200"
          >
            <path d="M200 200 V120 L120 200 Z" className="fill-brand" />
            <path d="M200 110 V50 L140 110 Z" className="fill-foreground/85" />
            <path d="M110 200 H50 L110 140 Z" className="fill-foreground/20" />
            <path d="M200 40 V0 L160 40 Z" className="fill-brand/40" />
            <path d="M40 200 H0 L40 160 Z" className="fill-brand/40" />
          </svg>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 3. Our story — copy left, portrait on a full-height brand panel right ─ */
function OurStory() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-background">
      {/* full-height two-tone panel on the right — cream left half, gold right half */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block"
      >
        <div className="absolute inset-y-0 left-0 w-1/2 bg-brand/15" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-brand" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        {/* Left — copy */}
        <ScrollReveal variant="slide-right" className="lg:pr-10">
          <Eyebrow>Our story</Eyebrow>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Built on the Science of Human Behavior. Inspired by the Future of Work.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Organizations often invest heavily in technology, processes, and strategy to improve
            performance. Yet the most significant opportunities—and the greatest challenges—continue
            to lie with people.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            MINDCARTER was established from a simple observation: lasting organizational success is
            achieved when business decisions are informed by a deep understanding of human behavior.
            This conviction has shaped our approach from the beginning and continues to guide how we
            work with organizations today.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            As workplaces evolve through rapid technological advancement and artificial intelligence,
            the need to understand people has become even more critical. Technology may transform how
            work is done, but people determine how successfully change is adopted, how leaders inspire
            confidence, and how organizations sustain performance.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            This belief continues to shape our journey. We combine organizational psychology,
            behavioral science, and emerging perspectives on Behavioral AI Governance to help
            organizations strengthen the human systems that enable performance today while preparing
            for the workplace of tomorrow.
          </p>
        </ScrollReveal>

        {/* Right — portrait straddling the panel edge */}
        <ScrollReveal variant="slide-left" delay={0.15} className="relative lg:-translate-x-10">
          <div className="relative flex items-end justify-center overflow-hidden shadow-2xl">
            {/* split backdrop — gold left half, opaque cream right half */}
            <div aria-hidden className="absolute inset-y-0 left-0 w-1/2 bg-brand" />
            <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 bg-[#fdf6e0]" />

            {/* bubbles floating across the whole backdrop */}
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* gold half — white bubbles */}
              <circle cx="35" cy="45" r="20" className="fill-white/35" />
              <circle cx="110" cy="25" r="9" className="fill-white/45" />
              <circle cx="26" cy="130" r="7" fill="none" strokeWidth="3" className="stroke-white/60" />
              <circle cx="45" cy="225" r="26" className="fill-white/25" />
              <circle cx="130" cy="272" r="11" className="fill-white/40" />
              {/* cream half — gold bubbles */}
              <circle cx="300" cy="42" r="22" className="fill-brand/35" />
              <circle cx="368" cy="24" r="9" fill="none" strokeWidth="3" className="stroke-brand/60" />
              <circle cx="378" cy="110" r="12" className="fill-brand/55" />
              <circle cx="352" cy="205" r="26" className="fill-brand/25" />
              <circle cx="288" cy="270" r="10" className="fill-brand/45" />
              <circle cx="386" cy="268" r="7" fill="none" strokeWidth="3" className="stroke-brand/50" />
            </svg>
            <img
              src={amarRajanImg}
              alt="Amar Rajan — CEO, Mindcarter"
              className="relative max-h-[480px] w-auto object-contain object-bottom"
              loading="lazy"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 4. Mission, Vision & Team — heading above, cross layout around photo ── */
function MissionVision() {
  return (
    <section className="relative border-t border-border bg-background pt-20 sm:pt-28">
      {/* section heading */}
      <ScrollReveal variant="fade-down">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Eyebrow>What drives us</Eyebrow>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            The principles that guide every engagement.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Two commitments shape how we show up for the people and organizations we serve — one for
            today, one for the world we&rsquo;re working toward.
          </p>
        </div>
      </ScrollReveal>

      {/* Three panels side by side: Vision, Team, Mission */}
      <div className="mt-14 grid lg:grid-cols-3">
        {/* Vision — cream panel */}
        <ScrollReveal
          variant="slide-left"
          className="flex flex-col items-center justify-center bg-[#fdf6e0] px-8 py-16 text-center text-foreground sm:px-12 lg:py-24"
        >
          <h2 className="font-display text-3xl font-black uppercase leading-tight tracking-wide">
            Our
            <br />
            <span className="text-brand">Vision</span>
          </h2>
          <div aria-hidden className="mt-5 h-0.5 w-10 bg-brand" />
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            To be a globally trusted organizational psychology company advancing the future of work
            by integrating behavioral science, human-centered AI, and evidence-based practice. We
            envision a world where organizations harness technology not to replace human potential,
            but to discover it, enable it, and help it evolve.
          </p>
        </ScrollReveal>

        {/* Center — Team */}
        <ScrollReveal
          variant="zoom-in"
          delay={0.1}
          className="flex flex-col items-center justify-center bg-muted/40 px-8 py-16 text-center sm:px-12 lg:py-24"
        >
          <h2 className="font-display text-3xl font-black uppercase leading-tight tracking-wide">
            Our <span className="text-brand">Team</span>
          </h2>
          <div aria-hidden className="mt-5 h-0.5 w-10 bg-brand" />
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A multidisciplinary team bringing together organizational psychologists, data
            scientists, AI specialists, academics, and industry practitioners to deliver
            evidence-based solutions for the future of work.
          </p>
        </ScrollReveal>

        {/* Mission — gold panel */}
        <ScrollReveal
          variant="slide-right"
          delay={0.2}
          className="flex flex-col items-center justify-center bg-brand px-8 py-16 text-center text-brand-foreground sm:px-12 lg:py-24"
        >
          <h2 className="font-display text-3xl font-black uppercase leading-tight tracking-wide">
            Our
            <br />
            Mission
          </h2>
          <div aria-hidden className="mt-5 h-0.5 w-10 bg-brand-foreground" />
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-brand-foreground/80">
            To help individuals and organizations thrive in the age of AI by applying evidence-based
            organizational psychology to improve people decisions, strengthen leadership, enhance
            employee wellbeing, and build workplaces where human potential and technology work
            together to create sustainable organizational success.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 5. Why choose Mindcarter ─────────────────────────────────────────────── */
function WhyChoose() {
  return (
    <section className="border-b border-border bg-foreground py-24 text-background">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal variant="blur-in">
          <div className="text-center">
            <h2 className="font-display mx-auto max-w-2xl text-5xl font-black leading-[1.0] tracking-tight sm:text-6xl">
              Why <span className="text-brand">MindCarter?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-background/70">
              Organizations choose MindCarter because our solutions combine organizational
              psychology, behavioral science, and business insight to address the human dimensions
              of organizational performance. Every engagement is grounded in evidence, tailored to
              organizational context, and designed to deliver measurable outcomes that strengthen
              people, leadership, and organizational capability.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 6. Final CTA — gold rounded panel with booking actions ──────────────── */
function FinalCTA() {
  return (
    <section className="bg-background">
      <ScrollReveal variant="flip-up" className="mx-auto max-w-7xl px-6 py-24">
        <div
          className="relative overflow-hidden rounded-3xl bg-brand bg-cover bg-center p-10 sm:p-16"
          style={{ backgroundImage: `url(${aboutBannerImg})` }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-foreground/5"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-foreground/5"
          />
          <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70">
                Begin
              </p>
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Ready to evolve? Book a confidential consultation.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                to="/employee/book"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:scale-95"
              >
                Book Consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:+14155550139"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-background px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-background/90 active:translate-y-0 active:scale-95"
              >
                <Phone className="h-4 w-4" /> Call Us
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

function AboutPage() {
  return (
    <SiteShell>
      <AboutHero />
      <AboutUs />
      <OurStory />
      <MissionVision />
      <WhyChoose />
      <FinalCTA />
    </SiteShell>
  );
}

