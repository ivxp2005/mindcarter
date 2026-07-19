import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "../components/site-shell";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";
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
function GmailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg className="h-5.5 w-5.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.762.455 3.486 1.32 5.011l-1.4 5.115 5.234-1.372c1.472.802 3.125 1.25 4.85 1.25 5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zM12 20.136c-1.576 0-3.12-.418-4.484-1.21l-.321-.19-3.33.873.889-3.242-.209-.333a8.106 8.106 0 01-1.246-4.22c0-4.492 3.655-8.147 8.147-8.147 2.176 0 4.222.847 5.76 2.387A8.09 8.09 0 0120.147 12c0 4.492-3.656 8.136-8.147 8.136zm4.568-6.195c-.25-.125-1.482-.731-1.712-.815-.23-.083-.397-.125-.564.125-.167.25-.647.815-.793.982-.146.167-.292.187-.542.062a6.837 6.837 0 01-2.013-1.242 7.534 7.534 0 01-1.392-1.733c-.146-.25-.016-.386.11-.51.112-.11.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.02-.438-.063-.125-.564-1.358-.773-1.859-.203-.489-.41-.422-.564-.43-.146-.007-.313-.008-.48-.008s-.438.062-.667.313c-.23.25-.877.855-.877 2.087s.898 2.42 1.023 2.587c.125.167 1.767 2.7 4.282 3.785.598.258 1.065.412 1.43.528.601.191 1.147.164 1.58.1.482-.072 1.483-.605 1.692-1.19.209-.584.209-1.085.146-1.19-.063-.105-.23-.167-.48-.292z" fill="#25D366" />
    </svg>
  );
}

function GoogleMapsIcon() {
  return (
    <svg className="h-5.5 w-5.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.5 9.5C19.5 14.5 12 21.5 12 21.5C12 21.5 4.5 14.5 4.5 9.5C4.5 5.35786 7.85786 2 12 2C16.1421 2 19.5 5.35786 19.5 9.5Z" fill="#EA4335" />
      <path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" fill="#FFFFFF" />
    </svg>
  );
}

const CONTACT_ITEMS = [
  { icon: GmailIcon, label: "Email", value: "info@mindcarter.com", href: "mailto:info@mindcarter.com" },
  { icon: WhatsAppIcon, label: "Phone", value: "+91 75940 71071", href: "tel:+917594071071" },
  {
    icon: GoogleMapsIcon,
    label: "Office",
    value: "Module no: A, Tejaswini, Technopark, Trivandrum",
  },
] as const;

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

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        {/* Left — heading + CTA */}
        <ScrollReveal variant="slide-left">
          <Eyebrow label="Get in touch" />
          <h2 className="font-display mt-4 max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Ready to evolve? Book a confidential consultation.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/70">
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

        {/* Right — contact cards */}
        <StaggerContainer className="flex flex-col gap-4">
          {CONTACT_ITEMS.map((c) => {
            const body = (
              <div className="flex items-center gap-4 rounded-2xl bg-background p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-black/5"
                >
                  <c.icon />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{c.value}</p>
                </div>
              </div>
            );
            return (
              <StaggerItem key={c.label} variant="slide-right">
                {"href" in c && c.href ? (
                  <a href={c.href} className="block">
                    {body}
                  </a>
                ) : (
                  body
                )}
              </StaggerItem>
            );
          })}
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
