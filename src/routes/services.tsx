import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "../components/site-shell";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
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
    anchor: "eap",
    title: "Employee Assistance Program (EAP)",
    tag: "High ROI · Cost Effective · AI-Enabled · Human-Supported",
    desc: "MindCarter's Employee Assistance Program (EAP) combines intelligent AI with qualified psychologists to deliver continuous, confidential, and accessible employee wellbeing support. Through 24/7 AI-powered emotional check-ins, evidence-based wellbeing guidance, and seamless access to psychologists by appointment, the program helps employees navigate workplace challenges such as burnout, stress, motivation, interpersonal conflicts, leadership demands, and work-life balance. Designed around prevention and early intervention rather than crisis response, our scalable EAP enables organizations to enhance employee wellbeing, strengthen engagement and resilience, and achieve a measurable return on their wellbeing investment.",
    image: imageCopy4Img,
    imageClassName: "h-[340px] w-[340px] sm:h-[430px] sm:w-[430px] -translate-y-8 sm:-translate-y-12 scale-[1.8]",
  },
  {
    anchor: "psychometric-assessments",
    title: "Psychometric Assessments",
    tag: "Scientific · Objective · Predictive · Actionable",
    desc: "Make critical people decisions with confidence. Our scientifically validated psychometric assessments provide objective insights into personality, leadership potential, behavioural competencies, motivation, cognitive abilities, and team dynamics. Whether for recruitment, leadership development, succession planning, coaching, or team effectiveness, our assessments transform psychological data into practical business decisions.",
    image: imageCopy2Img,
  },
  {
    anchor: "leadership-development",
    title: "Personality-Based Leadership Development",
    tag: "Self-Aware · Evidence Based · Personalised · Transformational",
    desc: "Exceptional leadership begins with understanding oneself. Our personality-based leadership development programmes help leaders recognise how their personality shapes communication, decision-making, motivation, conflict management, and influence. Using behavioural science and psychometric insights, we create personalised development journeys that strengthen leadership effectiveness and build high-performing teams.",
    image: imageCopy3Img,
    imageClassName: "h-[340px] w-[340px] sm:h-[430px] sm:w-[430px] -translate-y-8 sm:-translate-y-12 scale-[1.5]",
  },
  {
    anchor: "behavioral-interview",
    title: "Behavioral Interview Program",
    tag: "Structured · Bias Aware · Competency-Based · Evidence Driven",
    desc: "Hiring decisions should be guided by evidence, not intuition. Our Behavioral Interview Program equips organizations with structured interview frameworks, competency-based questioning techniques, and standardized evaluation methods that improve hiring quality, reduce bias, and enhance the prediction of future job performance. We help organizations build fair, consistent, and scientifically informed recruitment processes.",
    image: imageImg,
    imageClassName: "h-[340px] w-[340px] sm:h-[430px] sm:w-[430px] -translate-y-8 sm:-translate-y-12 scale-[1.4]",
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
            <Eyebrow label="Services" />
            <h2 className="font-display mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              How We Help Organizations
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Evidence-based organizational psychology solutions that strengthen people,
              leadership, and organizational performance.
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
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand">
                      {s.tag}
                    </p>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
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
    <section className="border-t border-border py-20 sm:py-24" style={{ backgroundColor: INK }}>
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal variant="zoom-in" className="text-center">
          <Eyebrow label="Get in touch" dark />
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
            Ready to evolve? Book a confidential consultation.
          </h2>
          <Link
            to="/employee/book"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
            style={{ backgroundColor: GOLD, color: INK }}
          >
            Book Consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <StaggerContainer className="mx-auto mt-16 grid max-w-3xl gap-8 border-t border-white/10 pt-12 sm:grid-cols-3">
          <StaggerItem className="flex flex-col items-center gap-3 text-center">
            <Mail className="h-5 w-5" style={{ color: GOLD }} />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Email</p>
            <p className="text-sm font-medium text-white">info@mindcarter.com</p>
          </StaggerItem>
          <StaggerItem className="flex flex-col items-center gap-3 text-center">
            <Phone className="h-5 w-5" style={{ color: GOLD }} />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Phone</p>
            <p className="text-sm font-medium text-white">+91 75940 71071</p>
          </StaggerItem>
          <StaggerItem className="flex flex-col items-center gap-3 text-center">
            <MapPin className="h-5 w-5" style={{ color: GOLD }} />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Office</p>
            <p className="text-sm font-medium text-white">
              Module no: A, Tejaswini, Technopark, Trivandrum
            </p>
          </StaggerItem>
        </StaggerContainer>
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
