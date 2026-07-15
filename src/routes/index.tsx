import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Phone,
  ClipboardCheck,
  Compass,
  HeartPulse,
  MessageSquare,
  Quote,
  Search,
} from "lucide-react";
import amarRajanImg from "../assets/amar-rajan.png";
import teamImg from "../assets/team.png";
import imageImg from "../assets/image.png";
import imageCopy2Img from "../assets/image copy 2.png";
import imageCopyImg from "../assets/image copy.png";
import imageCopy3Img from "../assets/image copy 3.png";
import imageCopy4Img from "../assets/image copy 4.png";
import { SiteShell } from "../components/site-shell";
import { AngularCornerBackground } from "../components/angular-background";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";
import { useParallaxScroll } from "../hooks/use-parallax-scroll";
import { useSession } from "../lib/use-session";

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

/** Shown above hero when a user is signed in (real session, not local role guess) */
function RoleWelcomeBanner() {
  const { data: session } = useSession();
  if (!session || (session.role !== "psychologist" && session.role !== "patient")) return null;

  const isDoctor = session.role === "psychologist";

  return (
    <div
      className="relative z-10 flex items-center justify-between gap-4 px-6 py-3 text-sm font-medium"
      style={{ backgroundColor: "#111111", color: "#F4C430" }}
    >
      <span>
        Welcome back, <strong>{session.name}</strong> — signed in as{" "}
        <span className="font-semibold">{isDoctor ? "Psychologist" : "Client"}</span>
      </span>
      {isDoctor && (
        <Link
          to="/psychologist"
          className="inline-flex items-center gap-1.5 rounded-full border border-current px-3 py-1 text-xs font-semibold transition hover:bg-white/10"
        >
          <LayoutDashboard className="h-3 w-3" />
          Doctor Portal
        </Link>
      )}
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

function Hero() {
  const scrollY = useParallaxScroll();
  const textY = Math.min(scrollY * 0.25, 80);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-foreground">
      {/* ── Fine grid texture — evokes structured, data-driven analysis ── */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* ── Gold accent glows — brand signature ── */}
      <div
        aria-hidden
        className="absolute -left-[10%] -top-[15%] h-[60vh] w-[50vw] rounded-full opacity-[0.16] blur-[130px]"
        style={{ background: "radial-gradient(circle, #F4C430 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-[20%] -right-[10%] h-[55vh] w-[45vw] rounded-full opacity-[0.12] blur-[140px]"
        style={{ background: "radial-gradient(circle, #F4C430 0%, transparent 70%)" }}
      />

      {/* ── Content — centered over the abstract background ── */}
      <div
        className="relative flex h-full flex-col items-center justify-center px-6 text-center"
        style={{ transform: `translateY(${textY}px)`, willChange: "transform" }}
      >
        {/* Headline */}
        <h1 className="font-display text-5xl font-black leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-8xl">
          {["Discover.", "Enable.", "Evolve."].map((word, i) => (
            <motion.span key={word} className="block overflow-hidden">
              <motion.span
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: EASE_OUT }}
                className="block"
              >
                {word}
              </motion.span>
            </motion.span>
          ))}
        </h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.52, ease: EASE_OUT }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
        >
          Empowering organizations and employees through evidence-based, innovative organizational
          behavior strategies.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.64, ease: EASE_OUT }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
            style={{ backgroundColor: "#F4C430", color: "#111111" }}
          >
            Book Consultation <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="tel:+14155550139"
            className="inline-flex items-center gap-2 rounded-full border-2 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0 active:scale-95"
            style={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            <Phone className="h-4 w-4" /> Call Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function HomeAbout() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 sm:py-28">
      {/* ── Angular black/gold geometric background ── */}
      <AngularCornerBackground className="opacity-90" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
          {/* ── Left — photo mosaic ──────────────────────────────── */}
          <ScrollReveal className="relative hidden lg:block">
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

          {/* ── Right — headline + lead line ──────────────────────── */}
          <ScrollReveal delay={0.15}>
            <h2 className="font-display text-5xl font-black leading-[1.0] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-foreground">About</span> <span className="text-brand">Us</span>
            </h2>
            <p className="mt-6 max-w-lg text-xl font-semibold leading-snug text-foreground">
              MindCarter is an organizational psychology consulting firm that helps organizations
              make better people decisions through evidence-based behavioral science.
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              We partner with organizations to strengthen leadership, enhance employee wellbeing,
              improve talent decisions, and build high-performing workplaces—drawing on psychometric
              assessment, leadership development, employee assistance programs, behavioral interviewing,
              executive coaching, and organizational development, all tailored to each organization's
              unique culture and goals. By combining scientific rigor with practical application, we
              help leaders unlock individual and team potential and build resilient, thriving workplaces.
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-3 text-xs font-bold uppercase tracking-wide text-foreground transition hover:bg-foreground hover:text-background"
            >
              Read more <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

const FLAGSHIP_SERVICES = [
  {
    icon: HeartPulse,
    title: "Employee Assistance Program (EAP)",
    tag: "High ROI · Cost Effective · AI-Enabled · Human-Supported",
    desc: "MindCarter's Employee Assistance Program (EAP) combines intelligent AI with qualified psychologists to deliver continuous, confidential, and accessible employee wellbeing support. Through 24/7 AI-powered emotional check-ins, evidence-based wellbeing guidance, and seamless access to psychologists by appointment, the program helps employees navigate workplace challenges such as burnout, stress, motivation, interpersonal conflicts, leadership demands, and work-life balance. Designed around prevention and early intervention rather than crisis response, our scalable EAP enables organizations to enhance employee wellbeing, strengthen engagement and resilience, and achieve a measurable return on their wellbeing investment.",
    image: imageCopy4Img,
    imageClassName: "h-[340px] w-[340px] sm:h-[430px] sm:w-[430px] -translate-y-8 sm:-translate-y-12 scale-[1.8]",
  },
  {
    icon: ClipboardCheck,
    title: "Psychometric Assessments",
    tag: "Scientific · Objective · Predictive · Actionable",
    desc: "Make critical people decisions with confidence. Our scientifically validated psychometric assessments provide objective insights into personality, leadership potential, behavioural competencies, motivation, cognitive abilities, and team dynamics. Whether for recruitment, leadership development, succession planning, coaching, or team effectiveness, our assessments transform psychological data into practical business decisions.",
    image: imageCopy2Img,
  },
  {
    icon: Compass,
    title: "Personality-Based Leadership Development",
    tag: "Self-Aware · Evidence Based · Personalised · Transformational",
    desc: "Exceptional leadership begins with understanding oneself. Our personality-based leadership development programmes help leaders recognise how their personality shapes communication, decision-making, motivation, conflict management, and influence. Using behavioural science and psychometric insights, we create personalised development journeys that strengthen leadership effectiveness and build high-performing teams.",
    image: imageCopy3Img,
    imageClassName: "h-[340px] w-[340px] sm:h-[430px] sm:w-[430px] -translate-y-8 sm:-translate-y-12 scale-[1.5]",
  },
  {
    icon: MessageSquare,
    title: "Behavioral Interview Program",
    tag: "Structured · Bias Aware · Competency-Based · Evidence Driven",
    desc: "Hiring decisions should be guided by evidence, not intuition. Our Behavioral Interview Program equips organizations with structured interview frameworks, competency-based questioning techniques, and standardized evaluation methods that improve hiring quality, reduce bias, and enhance the prediction of future job performance. We help organizations build fair, consistent, and scientifically informed recruitment processes.",
    image: imageImg,
    imageClassName: "h-[340px] w-[340px] sm:h-[430px] sm:w-[430px] -translate-y-8 sm:-translate-y-12 scale-[1.4]",
  },
];

function Services() {
  return (
    <section
      id="services"
      className="relative overflow-hidden border-b border-border bg-background py-24"
    >
      <AngularCornerBackground />
      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
              Services
            </p>
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
              <ScrollReveal key={s.title}>
                <div className="grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
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
                      to="/services"
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-background transition hover:opacity-90"
                    >
                      Learn more <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.1} className="mt-20 flex justify-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-3 text-xs font-bold uppercase tracking-wide text-foreground transition hover:bg-foreground hover:text-background"
          >
            Read more <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </ScrollReveal>
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
        <h2 className="font-display mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h2>
      </div>
      {description && (
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

const WHY_ITEMS = [
  {
    k: "01",
    t: "Evidence-based",
    sub: "Research, not intuition",
    d: "A premier authority in organizational behavior, offering evidence-based solutions grounded in academic rigor and published research.",
  },
  {
    k: "02",
    t: "Global expertise",
    sub: "Practitioners, not theorists",
    d: "A team of global experts and revered industry practitioners keeps us at the forefront of the latest trends.",
  },
  {
    k: "03",
    t: "Specialized offerings",
    sub: "Assessments to coaching",
    d: "Internationally recognized psychometric assessments, comprehensive training, developmental initiatives and coaching programs.",
  },
  {
    k: "04",
    t: "Lasting impact",
    sub: "Built to last",
    d: "Practical, research-rooted solutions that enhance organizational effectiveness and nurture employee satisfaction.",
  },
];

function WhyItem({ item }: { item: (typeof WHY_ITEMS)[number] }) {
  return (
    <div className="group">
      <p className="font-mono text-xs text-brand transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
        {item.k}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-background">{item.t}</h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand/80">{item.sub}</p>
      <p className="mt-2 text-sm leading-relaxed text-background/60">{item.d}</p>
    </div>
  );
}

function WhyChoose() {
  return (
    <section className="border-b border-border bg-foreground py-24 text-background">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-background/60">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
              Why Mindcarter
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-2xl text-5xl font-black leading-[1.0] tracking-tight sm:text-6xl">
              Why Choose <span className="text-brand">Mindcarter?</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative mt-20">
          <svg
            aria-hidden
            viewBox="0 0 1200 160"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -top-14 left-0 hidden h-28 w-full lg:block"
          >
            <path
              d="M0,140 Q600,-40 1200,140"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 10"
              strokeLinecap="round"
              className="text-background/25"
            />
          </svg>

          <div className="grid gap-14 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10">
            <StaggerContainer className="grid gap-14 sm:grid-cols-2 lg:grid-cols-1">
              <StaggerItem>
                <WhyItem item={WHY_ITEMS[0]} />
              </StaggerItem>
              <StaggerItem>
                <WhyItem item={WHY_ITEMS[2]} />
              </StaggerItem>
            </StaggerContainer>

            <ScrollReveal
              delay={0.15}
              className="relative order-first mx-auto w-52 shrink-0 sm:w-64 lg:order-none"
            >
              <div
                aria-hidden
                className="absolute inset-0 -z-10 scale-125 rounded-full bg-brand/20 blur-3xl"
              />
              <div className="aspect-[3/4] overflow-hidden rounded-[2.5rem] border border-background/10 shadow-2xl">
                <div
                  aria-hidden
                  style={{
                    backgroundImage: `url(${teamImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="h-full w-full"
                />
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid gap-14 sm:grid-cols-2 lg:grid-cols-1">
              <StaggerItem>
                <WhyItem item={WHY_ITEMS[1]} />
              </StaggerItem>
              <StaggerItem>
                <WhyItem item={WHY_ITEMS[3]} />
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

const PSYCHOLOGISTS: {
  name: string;
  role: string;
  tags: string[];
  hours: number;
  languages: string[];
  price: number;
  nextAvailable: string;
  photo?: string;
}[] = [
  {
    name: "Dr. Aditi Carter",
    role: "Clinical Psychologist",
    tags: ["CBT", "Trauma"],
    hours: 250,
    languages: ["Malayalam", "English"],
    price: 1000,
    nextAvailable: "15 mins",
  },
  {
    name: "Dr. Marcus Vale",
    role: "Organizational Psychologist",
    tags: ["Leadership", "Culture"],
    hours: 500,
    languages: ["Malayalam", "Tamil"],
    price: 1200,
    nextAvailable: "20 mins",
  },
  {
    name: "Dr. Lena Ortiz",
    role: "Neuropsychologist",
    tags: ["Cognition", "Assessment"],
    hours: 800,
    languages: ["English", "Hindi"],
    price: 1500,
    nextAvailable: "30 mins",
  },
  {
    name: "Dr. Rohan Mehra",
    role: "Executive Coach",
    tags: ["C-suite", "Founders"],
    hours: 650,
    languages: ["English", "Hindi"],
    price: 1400,
    nextAvailable: "45 mins",
  },
];

function Psychologists() {
  const [query, setQuery] = useState("");

  const matchesQuery = (p: (typeof PSYCHOLOGISTS)[number]) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.languages.some((l) => l.toLowerCase().includes(q)) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  };

  const hasMatches = PSYCHOLOGISTS.some(matchesQuery);

  return (
    <section
      className="relative overflow-hidden border-b border-border py-16 sm:py-20"
      style={{ backgroundColor: "#F4C430" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-foreground/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-foreground/5"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="relative grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70">
                  Our Team
                </p>
                <h2 className="font-display mt-3 text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                  Evidence-based professionals committed to helping people thrive at work.
                </h2>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-foreground/70">
                At Mindcarter we bring together psychologists with advanced academic training in
                psychology, including Master's, M.Phil., and Ph.D. qualifications. Drawing on
                organizational psychology and behavioral science, they help individuals and
                organizations address workplace challenges, strengthen leadership, improve
                performance, and foster healthier, more productive work environments.
              </p>
            </div>

            <div className="relative mx-auto mt-6 max-w-2xl">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, specialty, language, or tags…"
                className="w-full rounded-full border border-border bg-background py-3 pl-12 pr-5 text-sm shadow-sm outline-none transition focus:border-foreground"
              />
            </div>

            <StaggerContainer className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {!hasMatches && (
            <p className="col-span-full py-10 text-center text-sm text-foreground/70">
              No psychologists match your search.
            </p>
          )}
          {PSYCHOLOGISTS.map((p) => {
            const initials = p.name
              .replace(/^Dr\.\s*/, "")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2);
            return (
              <StaggerItem key={p.name} className={matchesQuery(p) ? "" : "hidden"}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-[400ms] ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/25 to-brand/5 text-3xl font-black text-foreground/20 transition duration-700 group-hover:scale-105"
                        aria-hidden
                      >
                        {initials}
                      </div>
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                      </span>
                      Available in {p.nextAvailable}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold leading-tight">{p.name}</h3>
                    <p className="mt-1 text-[11px] uppercase leading-snug tracking-[0.16em] text-muted-foreground">
                      {p.role}
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-y border-border py-3 text-center">
                      <div>
                        <p className="text-base font-bold text-foreground">{p.hours}+</p>
                        <p className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
                          Therapy hrs
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-snug">
                          {p.languages.join(", ")}
                        </p>
                        <p className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
                          Languages
                        </p>
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
                          Per session
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-4">
                      <Link
                        to="/booking"
                        search={{ name: p.name, role: p.role, price: p.price }}
                        className="w-full rounded-full bg-brand py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-brand-foreground transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                      >
                        Book now
                      </Link>
                      <Link
                        to="/contact"
                        className="w-full rounded-full border border-border py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition hover:border-foreground hover:text-foreground"
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

            <div className="relative mt-8 flex justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-3 text-xs font-bold uppercase tracking-wide text-foreground transition hover:bg-foreground hover:text-background"
              >
                View more
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

const CLIENT_LOGOS = [
  { src: "/logos/ff7bfd_912cbb931bc744a19548cc7bb65dba75~mv2.avif", alt: "SunTec" },
  { src: "/logos/ff7bfd_161c6b1cd256424197b6975db81e4d88~mv2.avif", alt: "Allianz" },
  { src: "/logos/ff7bfd_7eaa659e4e3a4ebab83385be12220063~mv2.avif", alt: "UST Global" },
  {
    src: "/logos/ff7bfd_1b12610f59024756aaf021d3235e7bcd~mv2.avif",
    alt: "TATA Consultancy Services",
  },
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

function ClientLogoTrack() {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="flex w-max items-center gap-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        animation: "mc-client-marquee 34s linear infinite",
        animationPlayState: paused ? "paused" : "running",
      }}
    >
      {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, i) => (
        <div
          key={`${logo.alt}-${i}`}
          className="flex shrink-0 items-center justify-center"
          style={{ width: "150px", height: "60px" }}
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
}

function OurClients() {
  return (
    <section className="border-b border-border bg-background py-24">
      <style>{`
        @keyframes mc-client-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
              Our Clients
            </p>
            <h2 className="font-display mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Trusted by industry leaders.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We partner and serve the best people in the industry with best in class services.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <ClientLogoTrack />
          </div>
        </ScrollReveal>
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
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
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
