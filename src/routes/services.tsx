import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "../components/site-shell";
import { ScrollReveal } from "../components/scroll-reveal";
import { ArrowRight } from "lucide-react";
import { AngularCornerBackground } from "../components/angular-background";
import servicesBannerImg from "../assets/image copy 6.png";
import imageImg from "../assets/image.png";
import imageCopy2Img from "../assets/image copy 2.png";
import imageCopy3Img from "../assets/image copy 3.png";
import imageCopy4Img from "../assets/image copy 4.png";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Mindcarter" },
      {
        name: "description",
        content:
          "Individual therapy, organizational consulting, assessments, executive coaching and enterprise mental health.",
      },
      { property: "og:title", content: "Services — Mindcarter" },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const GOLD = "#F4C430";
const INK = "#111111";

const FLAGSHIP_SERVICES = [
  {
    anchor: "behavioral-ai-governance",
    title: "Behavioral AI Governance",
    tag: "Helping organizations measure AI readiness, enable workforce adoption, and lead the human side of AI transformation.",
    desc: [
      "Artificial intelligence is reshaping the workplace, but successful AI adoption depends as much on people as it does on technology. Organizations need employees who are prepared to work confidently with AI, leaders who can guide change, and cultures that embrace innovation while maintaining human judgment and accountability.",
      "MINDCARTER helps organizations understand how AI-ready their workforce is, identify behavioral and organizational barriers to adoption, and develop the leadership, capabilities, and governance required for successful AI transformation. By combining organizational psychology with behavioral science, we help organizations build employee confidence, strengthen human oversight, and create a workplace where people and AI work together to deliver sustainable business outcomes.",
    ],
    outcomes: [
      "Assess organizational and workforce AI readiness",
      "Accelerate AI adoption through employee engagement",
      "Strengthen leadership capability for AI transformation",
      "Improve human oversight and AI-enabled decision-making",
      "Build a culture of responsible AI and continuous innovation",
    ],
    image: imageImg,
    imageClassName: "h-[340px] w-[340px] sm:h-[430px] sm:w-[430px] -translate-y-8 sm:-translate-y-12 scale-[1.4]",
  },
  {
    anchor: "psychometric-assessments",
    title: "Psychometric Assessments",
    tag: "Evidence-based assessments that enable confident people decisions.",
    desc: [
      "Our scientifically validated psychometric assessments provide objective insights into personality, leadership potential, emotional intelligence, motivation, workplace behaviors, and organizational effectiveness. These assessments support informed decisions across recruitment, leadership development, succession planning, talent management, coaching, and organizational development.",
      "Every assessment is designed to provide meaningful insights that support both individual growth and organizational performance.",
    ],
    outcomes: [
      "Improve hiring and promotion decisions",
      "Identify leadership potential",
      "Enhance employee development",
      "Strengthen team effectiveness",
      "Support evidence-based talent management",
    ],
    image: imageCopy2Img,
  },
  {
    anchor: "leadership-development",
    title: "Leadership Development",
    tag: "Developing leaders who create resilient, high-performing organizations.",
    desc: [
      "Leadership influences culture, engagement, innovation, and organizational performance. Our leadership development solutions help leaders strengthen self-awareness, communication, decision-making, collaboration, adaptability, and strategic leadership capabilities.",
      "Using organizational psychology, experiential learning, executive coaching, and leadership assessment, we design development experiences that translate into measurable workplace impact.",
    ],
    outcomes: [
      "Strengthen leadership capability",
      "Improve team performance",
      "Build psychologically healthy workplaces",
      "Increase collaboration and trust",
      "Enable effective leadership during change",
    ],
    image: imageCopy3Img,
    imageClassName: "h-[340px] w-[340px] sm:h-[430px] sm:w-[430px] -translate-y-8 sm:-translate-y-12 scale-[1.5]",
  },
  {
    anchor: "eap",
    title: "Employee Assistance Program (EAP)",
    tag: "Supporting employee wellbeing to strengthen organizational performance.",
    desc: [
      "Healthy organizations begin with healthy people. Our Employee Assistance Program provides confidential psychological support that promotes mental wellbeing, resilience, and workplace effectiveness.",
      "Combining professional counselling with preventive wellbeing initiatives, our EAP helps employees manage personal and workplace challenges while enabling organizations to foster a healthier, more productive workforce.",
    ],
    outcomes: [
      "Enhance employee wellbeing",
      "Improve resilience and engagement",
      "Reduce psychological risk",
      "Support healthier workplaces",
      "Strengthen organizational performance",
    ],
    image: imageCopy4Img,
    imageClassName: "h-[340px] w-[340px] sm:h-[430px] sm:w-[430px] -translate-y-8 sm:-translate-y-12 scale-[1.8]",
  },
];

const PROCESS = [
  { n: "01", word: "Discover", variant: "black" as const },
  { n: "02", word: "Enable", variant: "gold" as const },
  { n: "03", word: "Evolve", variant: "black" as const },
];

function Eyebrow({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.28em]"
      style={{ color: dark ? "rgba(255,255,255,0.65)" : "rgba(17,17,17,0.55)" }}
    >
      <span
        aria-hidden
        className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
        style={{ backgroundColor: GOLD }}
      />
      {label}
    </p>
  );
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────
function ServicesHero() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={servicesBannerImg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-foreground/15" />

      <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
        <ScrollReveal variant="blur-in">
          <h1
            className="font-display mt-4 text-3xl font-black leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            Organizational Psychology Solutions, Designed for Impact.
          </h1>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── 3. What we do ──────────────────────────────────────────────────────────
function WhatWeDo() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-24">
      <AngularCornerBackground />
      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal variant="fade-down">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow label="PRACTICE AREAS" />
            <h2 className="font-display mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              How We Help Organizations
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Organizations succeed when their people, leaders, and systems evolve together. Mindcarter provides evidence-based organizational psychology solutions that strengthen organizational capability, improve decision-making, and prepare organizations for the future of work.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-20 space-y-20">
          {FLAGSHIP_SERVICES.map((s, i) => {
            const reversed = i % 2 === 1;
            return (
              <ScrollReveal key={s.title} variant={reversed ? "slide-right" : "slide-left"}>
                <div
                  id={s.anchor}
                  className="grid scroll-mt-28 items-center gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16"
                >
                  <div className={reversed ? "md:order-2" : ""}>
                    <div className="relative mx-auto grid h-[300px] w-[300px] place-items-center sm:h-[380px] sm:w-[380px]">
                      <div
                        aria-hidden
                        className="absolute h-[200px] w-[200px] sm:h-[240px] sm:w-[240px] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-brand/15"
                      />
                      <img
                        src={s.image}
                        alt={s.title}
                        className={`relative z-10 object-contain ${s.imageClassName || "h-[310px] w-[310px] sm:h-[390px] sm:w-[390px] -translate-y-5 sm:-translate-y-8"}`}
                      />
                    </div>
                  </div>
                  <div className={reversed ? "md:order-1" : ""}>
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{s.title}</h3>
                    <p className="mt-2 max-w-xl text-sm font-semibold text-brand">{s.tag}</p>
                    <div className="mt-4 max-w-xl space-y-4 text-base leading-relaxed text-muted-foreground">
                      {s.desc.map((para, di) => (
                        <p key={di}>{para}</p>
                      ))}
                    </div>
                    <div className="mt-5 max-w-xl">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                        Outcomes
                      </p>
                      <ul className="mt-3 space-y-2">
                        {s.outcomes.map((o) => (
                          <li key={o} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      to="/employee/book"
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-background transition hover:opacity-90"
                    >
                      Book Consultation <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── 4. How we work ─────────────────────────────────────────────────────────
function HowWeWork() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal variant="slide-left">
          <Eyebrow label="How we work" />
          <h2 className="font-display mt-4 text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Discover. Enable. Evolve.
          </h2>
        </ScrollReveal>

        <div className="mt-16 flex flex-col gap-3 sm:flex-row sm:gap-0">
          {PROCESS.map((step, i) => (
            <ScrollReveal key={step.word} variant="zoom-in" delay={i * 0.1} className="relative flex-1">
              <div
                className="relative flex h-56 flex-col items-center justify-center gap-3 sm:mx-[-1.5rem]"
                style={{
                  backgroundColor: step.variant === "gold" ? GOLD : INK,
                  clipPath:
                    i === 0
                      ? "polygon(0 0, 100% 0, 88% 100%, 0% 100%)"
                      : i === PROCESS.length - 1
                        ? "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)"
                        : "polygon(12% 0, 100% 0, 88% 100%, 0% 100%)",
                }}
              >
                <span
                  className="text-xs font-mono"
                  style={{ color: step.variant === "gold" ? INK : GOLD }}
                >
                  {step.n}
                </span>
                <span
                  className="font-display text-3xl font-black uppercase tracking-tight"
                  style={{ color: step.variant === "gold" ? INK : "white" }}
                >
                  {step.word}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 6. Get in touch ─────────────────────────────────────────────────────────

function GetInTouch() {
  return (
    <section
      className="relative overflow-hidden border-t border-border py-20 sm:py-24"
      style={{ backgroundColor: GOLD }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-foreground/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-12 h-80 w-80 rounded-full bg-foreground/5"
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <ScrollReveal variant="slide-left">
          <Eyebrow label="Get in touch" />
          <h2 className="font-display mx-auto mt-4 max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Ready to evolve? Book a confidential consultation.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-foreground/70">
            Our intake team responds within one business day. Every conversation is private and
            judgement-free.
          </p>
          <Link
            to="/employee/book"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
            style={{ backgroundColor: INK }}
          >
            Book Consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

function ServicesPage() {
  return (
    <SiteShell>
      <ServicesHero />
      <WhatWeDo />
      <HowWeWork />
      <GetInTouch />
    </SiteShell>
  );
}
