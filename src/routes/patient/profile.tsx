import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Mail, Phone, MapPin, ShieldCheck, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "../../components/ui/switch";
import { GradientAvatar } from "../../components/gradient-avatar";
import { ScrollReveal } from "../../components/scroll-reveal";
import { useSession } from "../../lib/use-session";
import { PROFILE_EXTRA } from "../../lib/patient";

export const Route = createFileRoute("/patient/profile")({
  component: ProfilePage,
});

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
      />
    </label>
  );
}

function ProfilePage() {
  const { data: session } = useSession();

  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [phone, setPhone] = useState("+1 555-0142");
  const [address, setAddress] = useState(PROFILE_EXTRA.address);
  const [dob, setDob] = useState(PROFILE_EXTRA.dob);
  const [emergencyName, setEmergencyName] = useState(PROFILE_EXTRA.emergencyContactName);
  const [emergencyPhone, setEmergencyPhone] = useState(PROFILE_EXTRA.emergencyContactPhone);
  const [prefs, setPrefs] = useState(PROFILE_EXTRA.notificationPrefs);

  return (
    <div className="space-y-6">
      {/* Cover + identity */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground text-background">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 p-8 text-center sm:p-10">
          <GradientAvatar
            name={name || "Patient"}
            size="xl"
            className="ring-4 ring-background/10"
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight">{name || "Your profile"}</h1>
            <p className="text-sm text-background/60">Patient</p>
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
            <section className="rounded-2xl border border-border bg-background p-6">
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

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <HeartHandshake className="h-3.5 w-3.5 text-brand" /> Emergency contact
              </h2>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{emergencyName}</p>
                <p>{emergencyPhone}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-semibold">Security</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Send yourself a password reset link.
              </p>
              <button
                type="button"
                onClick={() => toast.success("Password reset link sent to your email (mock).")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                <KeyRound className="h-4 w-4" /> Change password
              </button>
            </section>
          </div>

          {/* Main content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Profile updated.");
            }}
            className="space-y-4"
          >
            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold">Personal info</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={name} onChange={setName} />
                <Field label="Date of birth" type="date" value={dob} onChange={setDob} />
                <Field label="Email" type="email" value={email} onChange={setEmail} />
                <Field label="Phone" type="tel" value={phone} onChange={setPhone} />
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
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
            >
              Save changes
            </button>
          </form>
        </div>
      </ScrollReveal>
    </div>
  );
}
