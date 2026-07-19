import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Phone,
  Quote,
  Search,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getPublicPsychologistsFn,
  type PublicPsychologistDTO,
} from "../lib/patient-data.server";
import heroBgImg from "../assets/890.png";
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
        <span className="font-semibold">{isDoctor ? "Psychologist" : "Employee"}</span>
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
  const sectionRef = useRef<HTMLElement>(null);
  const targetRef = useRef({ x: 0.5, y: 0.35 });
  const currentRef = useRef({ x: 0.5, y: 0.35 });
  const rafRef = useRef(0);

  // Cursor-follow spotlight: lerps the shadow-mask center toward the pointer
  // every frame so the "un-shadowed" reveal glides rather than snaps.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const applyVars = (xPct: number, yPct: number) => {
      section.style.setProperty("--cursor-x", `${xPct * 100}%`);
      section.style.setProperty("--cursor-y", `${yPct * 100}%`);
    };
    applyVars(currentRef.current.x, currentRef.current.y);

    const tick = () => {
      const cur = currentRef.current;
      const target = targetRef.current;
      cur.x += (target.x - cur.x) * 0.12;
      cur.y += (target.y - cur.y) * 0.12;
      applyVars(cur.x, cur.y);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const handleMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      targetRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    section.addEventListener("mousemove", handleMove);
    return () => {
      section.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-foreground"
    >
      {/* ── Full-screen background photo ── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBgImg})` }}
      />

      {/* ── Shadow overlay — darkens the photo (heaviest at the top); a soft
          spotlight follows the cursor and cuts through it, letting that patch
          of the image show at full, un-shadowed brightness ── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/92 via-black/78 to-black/60 transition-opacity duration-300"
        style={{
          maskImage:
            "radial-gradient(circle 160px at var(--cursor-x, 50%) var(--cursor-y, 35%), transparent 0%, transparent 15%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(circle 160px at var(--cursor-x, 50%) var(--cursor-y, 35%), transparent 0%, transparent 15%, black 100%)",
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

      {/* ── Content — centered over the photo ── */}
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
            to="/employee/book"
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
          <ScrollReveal variant="slide-left" className="relative hidden lg:block">
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
          <ScrollReveal variant="slide-right" delay={0.15}>
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
    image: imageCopy4Img,
    title: "Employee Assistance Program (EAP)",
    tag: "High ROI · Cost Effective · AI-Enabled · Human-Supported",
    desc: "Confidential, AI-enabled employee wellbeing support with 24/7 check-ins and seamless access to qualified psychologists.",
    anchor: "eap",
  },
  {
    image: imageCopy2Img,
    title: "Psychometric Assessments",
    tag: "Scientific · Objective · Predictive · Actionable",
    desc: "Scientifically validated assessments that turn insights on personality, cognition and behavior into confident people decisions.",
    anchor: "psychometric-assessments",
  },
  {
    image: imageCopy3Img,
    title: "Personality-Based Leadership Development",
    tag: "Self-Aware · Evidence Based · Personalised · Transformational",
    desc: "Personalised development journeys that help leaders understand how their personality shapes their leadership.",
    anchor: "leadership-development",
  },
  {
    image: imageImg,
    title: "Behavioral Interview Program",
    tag: "Structured · Bias Aware · Competency-Based · Evidence Driven",
    desc: "Structured, evidence-based interview frameworks that improve hiring quality and reduce bias.",
    anchor: "behavioral-interview",
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
        <ScrollReveal variant="fade-down">
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

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {FLAGSHIP_SERVICES.map((s, i) => (
            <ScrollReveal key={s.title} variant="zoom-in" delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-background p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="relative grid h-28 w-28 place-items-center">
                  <div
                    aria-hidden
                    className="absolute h-20 w-20 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-brand/15"
                  />
                  <img
                    src={s.image}
                    alt=""
                    aria-hidden
                    className="relative z-10 h-28 w-28 object-contain"
                  />
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand">
                  {s.tag}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
                <Link
                  to="/services"
                  hash={s.anchor}
                  className="mt-5 inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-wide text-foreground underline decoration-brand decoration-2 underline-offset-4 transition hover:text-brand"
                >
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
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

function Psychologists() {
  const [query, setQuery] = useState("");
  const { data: psychologists = [], isLoading } = useQuery({
    queryKey: ["public-psychologists"],
    queryFn: () => getPublicPsychologistsFn(),
    staleTime: 5 * 60_000,
  });

  const matchesQuery = (p: PublicPsychologistDTO) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.specialties.some((t) => t.toLowerCase().includes(q))
    );
  };

  const hasMatches = psychologists.some(matchesQuery);

  return (
    <section
      id="psychologists"
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
        <ScrollReveal variant="blur-in">
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
                placeholder="Search by name, title, or specialty…"
                className="w-full rounded-full border border-border bg-background py-3 pl-12 pr-5 text-sm shadow-sm outline-none transition focus:border-foreground"
              />
            </div>

            {isLoading && (
              <div className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-2xl border border-border bg-background/60"
                    aria-hidden
                  />
                ))}
              </div>
            )}
            {!isLoading && (
            <StaggerContainer className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {psychologists.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-foreground/70">
              Our clinician directory is being updated. Please check back soon.
            </p>
          )}
          {psychologists.length > 0 && !hasMatches && (
            <p className="col-span-full py-10 text-center text-sm text-foreground/70">
              No psychologists match your search.
            </p>
          )}
          {psychologists.map((p) => {
            const initials = p.name
              .replace(/^Dr\.\s*/, "")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2);
            return (
              <StaggerItem key={p.id} className={matchesQuery(p) ? "" : "hidden"}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-[400ms] ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <div
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/25 to-brand/5 text-3xl font-black text-foreground/20 transition duration-700 group-hover:scale-105"
                      aria-hidden
                    >
                      {initials}
                    </div>
                    {p.rating != null && p.rating > 0 && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest">
                        <Star className="h-3 w-3 fill-brand text-brand" />
                        {p.rating.toFixed(1)} rating
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold leading-tight">{p.name}</h3>
                    <p className="mt-1 text-[11px] uppercase leading-snug tracking-[0.16em] text-muted-foreground">
                      {p.title}
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {p.specialties.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-y border-border py-3 text-center">
                      <div>
                        <p className="text-base font-bold text-foreground">
                          {p.yearsExperience != null ? `${p.yearsExperience}+` : "—"}
                        </p>
                        <p className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
                          Years exp
                        </p>
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground">
                          {p.price != null ? `₹${p.price.toLocaleString("en-IN")}` : "—"}
                        </p>
                        <p className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
                          Per session
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-4">
                      <Link
                        to="/employee/book/$clinicianId"
                        params={{ clinicianId: p.id }}
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
            )}

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
        <ScrollReveal variant="zoom-out">
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
      <ScrollReveal variant="flip-up" className="mx-auto max-w-7xl px-6 py-24">
        <div
          className="relative overflow-hidden rounded-3xl bg-brand bg-cover bg-center p-10 sm:p-16"
          style={{ backgroundImage: `url(${imageCopyImg})` }}
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
