import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  KeyRound,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  HeartHandshake,
  CalendarIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Switch } from "../../components/ui/switch";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { GradientAvatar } from "../../components/gradient-avatar";
import { ScrollReveal } from "../../components/scroll-reveal";
import { usePatientData, parseISODate } from "../../lib/patient-store";
import { emailSchema, phoneSchema } from "../../lib/auth-schemas";

function phoneError(value: string): string | null {
  return phoneSchema.safeParse(value).success ? null : "Enter a 10-digit phone number";
}

function emailError(value: string): string | null {
  if (value.trim() === "") return null;
  return emailSchema.safeParse(value).success ? null : "Enter a valid email address";
}

export const Route = createFileRoute("/client/profile")({
  component: ProfilePage,
});

/** Premium ease-out — matches the marketing site's motion language. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
  digitsOnly = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string | null;
  digitsOnly?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        inputMode={digitsOnly ? "numeric" : undefined}
        maxLength={maxLength}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(digitsOnly ? raw.replace(/\D/g, "").slice(0, maxLength) : raw);
        }}
        aria-invalid={!!error}
        className={`mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors ${
          error ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground"
        }`}
      />
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function DateOfBirthField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISODate(value) : undefined;

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Date of birth
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="mt-2 flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm outline-none transition-colors hover:border-foreground/40 focus:border-foreground"
          >
            <span className={selected ? "" : "text-muted-foreground"}>
              {selected
                ? selected.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a date"}
            </span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            captionLayout="dropdown"
            startMonth={new Date(1930, 0)}
            endMonth={new Date()}
            defaultMonth={selected ?? new Date(1995, 0)}
            disabled={{ after: new Date() }}
            onSelect={(d) => {
              if (!d) return;
              onChange(toISO(d));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </label>
  );
}

function ProfilePage() {
  const { profile, saveProfile } = usePatientData();
  const navigate = useNavigate();
  const needsOnboarding = profile !== null && !profile.onboardingComplete;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [prefs, setPrefs] = useState({
    sessionReminders: true,
    journalPrompts: true,
    careTeamMessages: true,
    marketing: false,
  });

  // Hydrate the form once the patient's profile loads from the DB.
  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setAddress(profile.address);
    setDob(profile.dateOfBirth);
    setEmergencyName(profile.emergencyContactName);
    setEmergencyPhone(profile.emergencyContactPhone);
    setPrefs(profile.notificationPrefs);
  }, [profile]);

  return (
    <div className="space-y-4">
      {/* ─────────────────────── Identity hero band ─────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground text-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl"
          animate={{ scale: [1, 1.18, 1], x: [0, 18, 0], y: [0, -12, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex flex-col items-center gap-4 p-8 text-center sm:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <GradientAvatar
              name={name || "Client"}
              size="xl"
              className="ring-4 ring-background/10"
            />
          </motion.div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
              {needsOnboarding ? "Welcome — let's set up your profile" : name || "Your profile"}
            </h1>
            <p className="text-sm text-background/60">
              {needsOnboarding
                ? "Complete the details below to unlock the rest of your portal."
                : "Client"}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Confidential &amp; secure
          </span>
        </div>
      </section>

      <ScrollReveal>
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* Sidebar summary */}
          <div className="space-y-4">
            <section className="rounded-2xl border border-border bg-background p-6 transition-all duration-300 ease-out hover:border-brand/40 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
              <h2 className="text-sm font-semibold">Contact</h2>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> {email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> {address}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6 transition-all duration-300 ease-out hover:border-brand/40 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <HeartHandshake className="h-3.5 w-3.5 text-brand" /> Emergency contact
              </h2>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{emergencyName}</p>
                <p>{emergencyPhone}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6 transition-all duration-300 ease-out hover:border-brand/40 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
              <h2 className="text-sm font-semibold">Security</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Send yourself a password reset link.
              </p>
              <button
                type="button"
                onClick={() => toast.success("Password reset link sent to your email (mock).")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:translate-y-0 active:scale-95"
              >
                <KeyRound className="h-4 w-4" /> Change password
              </button>
            </section>
          </div>

          {/* Main content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (emailError(email) || phoneError(phone) || phoneError(emergencyPhone)) {
                toast.error("Please fix the highlighted fields before saving.");
                return;
              }
              saveProfile({
                name,
                phone,
                dateOfBirth: dob,
                address,
                emergencyContactName: emergencyName,
                emergencyContactPhone: emergencyPhone,
                preferredLanguage: profile?.preferredLanguage ?? "",
                notificationPrefs: prefs,
              });
              toast.success("Profile updated.");
              const nowComplete = [name, phone, dob, address, emergencyName, emergencyPhone].every(
                (v) => v.trim().length > 0,
              );
              if (needsOnboarding && nowComplete) {
                navigate({ to: "/client" });
              }
            }}
            className="space-y-4"
          >
            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold">Personal info</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={name} onChange={setName} />
                <DateOfBirthField value={dob} onChange={setDob} />
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  error={emailError(email)}
                />
                <Field
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  digitsOnly
                  maxLength={10}
                  error={phoneError(phone)}
                />
                <Field label="Address" value={address} onChange={setAddress} />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold">Emergency contact</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Contact name" value={emergencyName} onChange={setEmergencyName} />
                <Field
                  label="Contact phone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={setEmergencyPhone}
                  digitsOnly
                  maxLength={10}
                  error={phoneError(emergencyPhone)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold">Notification preferences</h2>
              <div className="mt-4 divide-y divide-border">
                {(
                  [
                    ["sessionReminders", "Session reminders"],
                    ["journalPrompts", "Daily journal check-in prompts"],
                    ["careTeamMessages", "Care team messages"],
                    ["marketing", "Product & marketing updates"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-2.5">
                    <span className="text-sm">{label}</span>
                    <Switch
                      checked={prefs[key]}
                      onCheckedChange={(v) => setPrefs((prev) => ({ ...prev, [key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </section>

            <button
              type="submit"
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              Save changes
            </button>
          </form>
        </div>
      </ScrollReveal>
    </div>
  );
}
