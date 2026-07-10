import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { LayoutDashboard } from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Phone,
  Brain,
  Building2,
  ClipboardCheck,
  Compass,
  Sparkles,
  Bot,
  GraduationCap,
  HeartPulse,
  Users,
  ShieldCheck,
  Quote,
} from "lucide-react";
import amarRajanImg from "../assets/amar-rajan.png";
import teamImg from "../assets/team.png";
import { SiteShell } from "../components/site-shell";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";

export const Route = createFileRoute("/")({
  component: Index,
});

/** Premium ease-out — used for every deliberate entrance/hover in this page. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function Index() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteShell>
        <RoleWelcomeBanner />
        <Hero />
        <HomeAbout />
        <Psychologists />
        <Services />
        <WhyChoose />
        <OurClients />
        <FinalCTA />
      </SiteShell>
    </MotionConfig>
  );
}

/** Shown above hero when a user is logged in via localStorage role */
function RoleWelcomeBanner() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => { setRole(localStorage.getItem("mc_role")); }, []);
  if (!role) return null;

  const isDoctor = role === "psychologist";
  const portalTo = isDoctor ? "/psychologist" : "/patient";
  const label = isDoctor ? "Doctor Portal" : "Patient Portal";
  const name = isDoctor ? "Dr. Aditi Carter" : "Alex";

  return (
    <div
      className="relative z-10 flex items-center justify-between gap-4 px-6 py-3 text-sm font-medium"
      style={{ backgroundColor: "#111111", color: "#F4C430" }}
    >
      <span>
        Welcome back, <strong>{name}</strong> — signed in as{" "}
        <span className="capitalize font-semibold">{role}</span>
      </span>
      <Link
        to={portalTo}
        className="inline-flex items-center gap-1.5 rounded-full border border-current px-3 py-1 text-xs font-semibold transition hover:bg-white/10"
      >
        <LayoutDashboard className="h-3 w-3" />{label}
      </Link>
    </div>
  );
}


function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
      </span>
      Live · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </div>
  );
}

/** Returns a smooth scrollY value updated via rAF — avoids scroll jank. */
function useParallaxScroll() {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number>(0);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setScrollY(window.scrollY));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  return scrollY;
}

function Hero() {
  const scrollY = useParallaxScroll();

  const blobBotY = Math.min(scrollY * 0.35, 130);
  const blobTopY = Math.min(scrollY * 0.22, 90);
  const imageY = Math.min(scrollY * 0.18, 60);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col overflow-hidden lg:h-screen"
      style={{ backgroundColor: "#F4C430" }}
    >
      {/* ── Background blobs — positioned inward so overflow:hidden clips cleanly ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full opacity-30"
        style={{
          backgroundColor: "#c89b00",
          transform: `translateY(${blobBotY}px)`,
          willChange: "transform",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-80 w-80 rounded-full opacity-20"
        style={{
          backgroundColor: "#c89b00",
          transform: `translateY(${blobTopY}px)`,
          willChange: "transform",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 h-32 w-32 -translate-x-1/2 rounded-full opacity-10"
        style={{
          backgroundColor: "#8a6600",
          transform: `translateX(-50%) translateY(${Math.min(scrollY * 0.28, 60)}px)`,
          willChange: "transform",
        }}
      />

      {/* ── Main content grid — fills the full section height ─── */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-stretch px-8 sm:px-14 lg:h-full lg:grid lg:grid-cols-[1fr_auto]">

        {/* Left — text column */}
        <div className="flex flex-col justify-center py-16 lg:py-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: "#5a4200" }}
          >
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{
                delay: 1.2,
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block"
            >
              Begin
            </motion.span>
          </motion.p>
          <h1
            className="max-w-xl text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-7xl"
            style={{ color: "#111111" }}
          >
            {["Discover.", "Enable.", "Evolve."].map((word, i) => (
              <motion.span
                key={word}
                className="block overflow-hidden"
              >
                <motion.span
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1 + i * 0.1,
                    ease: EASE_OUT,
                  }}
                  className="block"
                >
                  {word}
                </motion.span>
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE_OUT }}
            className="mt-5 max-w-sm text-base leading-relaxed sm:text-lg"
            style={{ color: "#3a2e00" }}
          >
            Empowering organizations and employees through evidence-based, and
            innovative organizational behavior strategies.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62, ease: EASE_OUT }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:opacity-90 active:translate-y-0 active:scale-95"
              style={{ backgroundColor: "#111111" }}
            >
              Book Consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:+14155550139"
              className="inline-flex items-center gap-2 rounded-full border-2 bg-black/10 px-6 py-3 text-sm font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-black/20 active:translate-y-0 active:scale-95"
              style={{ borderColor: "#111111", color: "#111111" }}
            >
              <Phone className="h-4 w-4" /> Call Us
            </a>
          </motion.div>

          {/* CEO attribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.74, ease: EASE_OUT }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="h-px w-10" style={{ backgroundColor: "#7a5e00" }} />
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#5a4200" }}>
              Amar Rajan — CEO, Mindcarter
            </p>
          </motion.div>
        </div>

        {/* Right — CEO photo, constrained to section height */}
        <div
          className="flex items-end justify-center pb-4 lg:self-end lg:justify-end lg:pb-0"
          style={{
            transform: `translateY(${imageY}px)`,
            willChange: "transform",
          }}
        >
          <img
            src={amarRajanImg}
            alt="Amar Rajan — CEO, Mindcarter"
            className="block w-auto max-h-[38vh] object-contain object-bottom sm:max-h-[46vh] lg:max-h-[78vh]"
          />
        </div>
      </div>
    </section>
  );
}

function HomeAbout() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-12">

        {/* ── Left — photo mosaic ──────────────────────────────── */}
        <ScrollReveal className="relative">
          <div className="grid aspect-square grid-cols-4 grid-rows-4 gap-[3px] bg-border">
            {Array.from({ length: 16 }).map((_, i) => {
              const row = Math.floor(i / 4);
              const col = i % 4;
              return (
                <div
                  key={i}
                  aria-hidden
                  style={{
                    backgroundImage: `url(${teamImg})`,
                    backgroundSize: "400% 400%",
                    backgroundPosition: `${(col / 3) * 100}% ${(row / 3) * 100}%`,
                  }}
                  className="bg-background"
                />
              );
            })}
          </div>

          {/* Decorative accent — mirrors the arrow-in-square motif used elsewhere on the site */}
          <div className="absolute -bottom-6 -left-6 hidden sm:block">
            <div className="absolute left-2 top-2 h-14 w-14 bg-brand" aria-hidden />
            <div className="relative grid h-14 w-14 place-items-center border-2 border-foreground bg-background">
              <ArrowRight className="h-5 w-5 rotate-90 text-foreground" />
            </div>
          </div>
        </ScrollReveal>

        {/* ── Right — headline + copy ──────────────────────────── */}
        <ScrollReveal delay={0.15}>
          <h2 className="text-5xl font-black leading-[1.0] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-foreground">About</span>{" "}
            <span className="text-brand">Us</span>
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Mindcarter stands out as a premier authority in organizational behavior, offering evidence-based solutions that drive results. Our commitment to academic rigor and the seamless integration of published research into our services sets us apart. With a team of global experts and revered industry practitioners, we remain at the forefront of the latest trends. Our specialized offerings encompass internationally recognized psychometric assessments, comprehensive training, tailor-made developmental initiatives, and impactful coaching programs.  At Mindcarter, our solutions are not only deeply rooted in research but also informed by a profound understanding of psychology. We consistently deliver practical, long-lasting solutions that enhance organizational effectiveness and nurture employee satisfaction. Choose Mindcarter for excellence in psychometric assessments, coaching, and management development programs
            </p>
          </div>
          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:scale-95"
          >
            Read More <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>

      </div>
    </section>
  );
}



const SERVICES = [
  { icon: Brain, title: "Individual Therapy", desc: "Evidence-based one-on-one clinical care with licensed psychologists." },
  { icon: Building2, title: "Organizational Consulting", desc: "Diagnostics and interventions for culture, structure and change." },
  { icon: ClipboardCheck, title: "Psychometric Assessments", desc: "Validated instruments across personality, EI, cognition and more." },
  { icon: Compass, title: "Executive Coaching", desc: "Board-level coaching for founders, executives and rising leaders." },
  { icon: Users, title: "Leadership Development", desc: "Curated programs to build resilient, values-aligned leaders." },
  { icon: Sparkles, title: "Cognitive Crafting", desc: "Reframe patterns of thought using CBT, ACT and mindfulness." },
  { icon: Bot, title: "AI Assistant", desc: "24/7 reflective companion tuned to your clinical program." },
  { icon: GraduationCap, title: "Career Coaching", desc: "Purpose-led career navigation and transition support." },
  { icon: HeartPulse, title: "Corporate Wellness", desc: "End-to-end mental health programs for high-performing teams." },
  { icon: ShieldCheck, title: "Employee Assistance", desc: "Confidential EAP for organizations of every size." },
];

/** Row-based scroll-in delay, capped so a 10-card grid doesn't drag past ~400ms. */
function rowRevealDelay(i: number, columns = 4, rowStep = 0.12, colStep = 0.05, cap = 0.4) {
  const row = Math.floor(i / columns);
  const col = i % columns;
  return Math.min(row * rowStep + col * colStep, cap);
}

function Services() {
  return (
    <section id="services" className="border-b border-border bg-muted/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <SectionHeading eyebrow="Services" title="A full-spectrum practice" description="From one-on-one clinical care to enterprise-scale programs, everything we do is measurable, humane and research-backed." />
        </ScrollReveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, delay: rowRevealDelay(i), ease: EASE_OUT }}
            >
              <article
                className="group relative flex h-full flex-col rounded-2xl border border-border bg-background p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-foreground text-background transition group-hover:bg-brand group-hover:text-brand-foreground">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-6 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <Link
                  to="/services"
                  className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-foreground opacity-0 transition group-hover:opacity-100"
                >
                  Learn more <ArrowRight className="h-3 w-3" />
                </Link>
              </article>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
          {eyebrow}
        </p>
        <h2 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h2>
      </div>
      {description && (
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function WhyChoose() {
  const items = [
    { k: "01", t: "Clinician-led", d: "Every program is designed and supervised by licensed psychologists." },
    { k: "02", t: "Outcome tracking", d: "We measure progress with validated instruments — not vibes." },
    { k: "03", t: "Enterprise-grade", d: "HIPAA and ISO 27001 aligned infrastructure across every session." },
    { k: "04", t: "Human first", d: "Care that fits your language, culture and stage of life." },
  ];
  return (
    <section className="border-b border-border bg-foreground py-24 text-background">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-background/60">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
                Why Mindcarter
              </p>
              <h2 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
                Precision care, delivered with warmth.
              </h2>
            </div>
            <div className="max-w-xl space-y-4 text-base leading-relaxed text-background/70">
              <p>
                Mindcarter stands out as a premier authority in organizational behavior, offering evidence-based solutions that drive results. Our commitment to academic rigor and the seamless integration of published research into our services sets us apart. With a team of global experts and revered industry practitioners, we remain at the forefront of the latest trends. Our specialized offerings encompass internationally recognized psychometric assessments, comprehensive training, tailor-made developmental initiatives, and impactful coaching programs.
              </p>
              <p>
                At Mindcarter, our solutions are not only deeply rooted in research but also informed by a profound understanding of psychology. We consistently deliver practical, long-lasting solutions that enhance organizational effectiveness and nurture employee satisfaction. Choose Mindcarter for excellence in psychometric assessments, coaching, and management development programs.
              </p>
            </div>
          </div>
        </ScrollReveal>
        <StaggerContainer className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-background/10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <StaggerItem key={it.k} className="h-full">
              <div className="group h-full bg-foreground p-8 transition-colors duration-300 ease-out hover:bg-background/[0.06]">
                <p className="font-mono text-xs text-brand transition-transform duration-300 ease-out group-hover:-translate-y-0.5">{it.k}</p>
                <h3 className="mt-4 text-lg font-semibold">{it.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/70">{it.d}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

const PSYCHOLOGISTS = [
  { name: "Dr. Aditi Carter", role: "Clinical Psychology · PhD", tags: ["CBT", "Trauma"] },
  { name: "Dr. Marcus Vale", role: "Organizational Psychology · PsyD", tags: ["Leadership", "Culture"] },
  { name: "Dr. Lena Ortiz", role: "Neuropsychology · PhD", tags: ["Cognition", "Assessment"] },
  { name: "Dr. Rohan Mehra", role: "Executive Coach · MCC", tags: ["C-suite", "Founders"] },
];

function Psychologists() {
  return (
    <section className="border-b border-border py-24" style={{ backgroundColor: "#F4C430" }}>
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.24em]"
                style={{ color: "#5a4200" }}
              >
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-foreground align-middle" />
                Featured Psychologists
              </p>
              <h2 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                A curated bench of specialists
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed" style={{ color: "#3a2e00" }}>
              Doctorate-level clinicians and coaches across therapy, organizational psychology and executive practice.
            </p>
          </div>
        </ScrollReveal>
        <StaggerContainer className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PSYCHOLOGISTS.map((p) => (
            <StaggerItem key={p.name}>
              <article
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-[400ms] ease-out hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <div
                    className="h-full w-full bg-gradient-to-br from-neutral-300 to-neutral-500 transition duration-700 group-hover:scale-105"
                    aria-hidden
                  />
                  <div className="absolute inset-0 flex items-end justify-between p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                      </span>
                      Available
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand transition-transform duration-200 ease-out group-hover:scale-110">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="min-h-[2.4em] text-[11px] uppercase leading-snug tracking-[0.18em] text-muted-foreground">{p.role}</p>
                  <h3 className="mt-2 text-base font-semibold">{p.name}</h3>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}


const CLIENT_LOGOS = [
  { src: "/logos/ff7bfd_912cbb931bc744a19548cc7bb65dba75~mv2.avif", alt: "SunTec" },
  { src: "/logos/ff7bfd_161c6b1cd256424197b6975db81e4d88~mv2.avif", alt: "Allianz" },
  { src: "/logos/ff7bfd_7eaa659e4e3a4ebab83385be12220063~mv2.avif", alt: "UST Global" },
  { src: "/logos/ff7bfd_1b12610f59024756aaf021d3235e7bcd~mv2.avif", alt: "TATA Consultancy Services" },
  { src: "/logos/ff7bfd_d529e031d5b34105902848607a1bb1c7~mv2.avif", alt: "RR Donnelley" },
  { src: "/logos/ff7bfd_222d37932ae14e178000418c094e5400~mv2.avif", alt: "Reflections" },
  { src: "/logos/ff7bfd_a5a6d9b749014c61ac0d50781ae600e3~mv2.avif", alt: "D+H" },
  { src: "/logos/ff7bfd_f290bdb69ef74a18b2a91ed07ef1e0be~mv2.avif", alt: "Bhima" },
  { src: "/logos/ff7bfd_ee21d1fb7fe6414bbb702e2f0648182f~mv2.avif", alt: "Lubrizol" },
  { src: "/logos/theMathCompany.avif", alt: "TheMathCompany" },
  { src: "/logos/ff7bfd_03362116d99841fcad9f08f6a0606e6b~mv2.avif", alt: "Winning Edge" },
  { src: "/logos/ff7bfd_868ab94dd59d4c93aa87285e4330297b~mv2.avif", alt: "IBS" },
  { src: "/logos/ff7bfd_ace9fde15bf14613bb6ff2af3fa1e1b5~mv2.avif", alt: "RM" },
];

// Split logos into rows of 5 for staggered reveal
const CLIENT_ROWS = [
  CLIENT_LOGOS.slice(0, 5),
  CLIENT_LOGOS.slice(5, 10),
  CLIENT_LOGOS.slice(10),
];

function OurClients() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="border-b border-border bg-muted/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Our Clients"
            title="Trusted by industry leaders."
            description="We partner and serve the best people in the industry with best in class services."
          />
        </ScrollReveal>

        <div className="mt-14 space-y-10">
          {CLIENT_ROWS.map((row, rowIdx) => {
            const isLastRow = rowIdx === CLIENT_ROWS.length - 1;
            return (
              <div
                key={rowIdx}
                className={
                  isLastRow
                    ? "flex flex-wrap justify-center gap-8"
                    : "grid grid-cols-2 place-items-center gap-8 sm:grid-cols-3 lg:grid-cols-5"
                }
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 400ms ease ${rowIdx * 200}ms, transform 400ms ease ${rowIdx * 200}ms`,
                }}
              >
                {row.map((logo) => (
                  <div
                    key={logo.alt}
                    className="flex items-center justify-center"
                    style={{ width: "140px", height: "56px" }}
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-background">
      <ScrollReveal className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-10 sm:p-16">
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
              <h2 className="mt-3 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Ready to evolve? Book a confidential consultation.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:scale-95"
              >
                Book Consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:+14155550139"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-transparent px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-foreground/10 active:translate-y-0 active:scale-95"
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
