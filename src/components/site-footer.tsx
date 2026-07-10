import { Link } from "@tanstack/react-router";
import logoImg from "../assets/mindcarter-logo.avif";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <img src={logoImg} alt="Mindcarter" className="h-12 w-auto brightness-0 invert" />
            <p className="mt-4 text-sm leading-relaxed text-background/70">
              A premium psychology & organizational consulting practice — research-backed care for individuals and enterprises.
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-background/50">Founded by</p>
            <p className="text-sm font-medium">Amar Rajan</p>
          </div>

          <FooterCol
            title="Quick Links"
            items={[
              { label: "Home", to: "/" },
              { label: "About Us", to: "/about" },
              { label: "Services", to: "/services" },
              { label: "Contact", to: "/contact" },
              { label: "Book Consultation", to: "/contact" },
            ]}
          />
          <FooterCol
            title="Resources"
            items={[
              { label: "Assessments", to: "/services" },
              { label: "Executive Coaching", to: "/services" },
              { label: "Corporate Wellness", to: "/services" },
              { label: "Login", to: "/login" },
            ]}
          />

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-background/50">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-background/80">
              <li>info@mindcarter.com</li>
              <li>+91 75940 71071</li>
              <li>Module no: A, Tejaswini, Technopark,<br />Trivandrum</li>
            </ul>
            <div className="mt-6 flex gap-2">
              {["LN", "IG", "TW", "YT"].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="grid h-9 w-9 place-items-center rounded-full border border-background/20 text-[11px] font-semibold text-background/80 transition hover:border-brand hover:text-brand"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-background/10 pt-6 text-xs text-background/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Mindcarter. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#" className="hover:text-background">Privacy Policy</a>
            <a href="#" className="hover:text-background">Terms & Conditions</a>
            <a href="#" className="hover:text-background">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.2em] text-background/50">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to} className="text-background/80 transition hover:text-brand">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}