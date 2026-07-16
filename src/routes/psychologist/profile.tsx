import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, KeyRound, Clock, Mail, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "../../components/ui/switch";
import { GradientAvatar } from "../../components/gradient-avatar";
import { ScrollReveal } from "../../components/scroll-reveal";
import { usePsychologistData } from "../../lib/psychologist-store";
import { requestPasswordResetFn } from "../../lib/auth.server";

export const Route = createFileRoute("/psychologist/profile")({
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

const DEFAULT_PREFS = {
  emailDigests: true,
  sessionReminders: true,
  diaryAlerts: true,
  marketing: false,
};

function ProfilePage() {
  const { profile, saveProfile } = usePsychologistData();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setTitle(profile.title);
    setEmail(profile.email);
    setPhone(profile.phone);
    setSpecialties(profile.specialties);
    setPrefs(profile.notificationPrefs);
  }, [profile]);

  const addTag = () => {
    const tag = newTag.trim();
    if (!tag || specialties.includes(tag)) return;
    setSpecialties((prev) => [...prev, tag]);
    setNewTag("");
  };
  const removeTag = (tag: string) => setSpecialties((prev) => prev.filter((t) => t !== tag));

  return (
    <div className="space-y-6">
      {/* Cover + identity */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground text-background">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 p-8 text-center sm:p-10">
          <GradientAvatar name={name} size="xl" className="ring-4 ring-background/10" />
          <div>
            <h1 className="text-2xl font-black tracking-tight">{name}</h1>
            <p className="text-sm text-background/60">{title}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" /> License{" "}
            {profile?.license || "Not on file"}
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
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-semibold">Working hours</h2>
              <div className="mt-4 divide-y divide-border">
                {(profile?.hours ?? []).map((h) => (
                  <div key={h.day} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {h.day}
                    </span>
                    <span className="font-medium">{h.range}</span>
                  </div>
                ))}
                {profile && profile.hours.length === 0 && (
                  <p className="py-2.5 text-sm text-muted-foreground">No hours set yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-semibold">Security</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Send yourself a password reset link.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (!profile) return;
                  await requestPasswordResetFn({ data: { email: profile.email } });
                  toast.success("Password reset link sent to your email.");
                }}
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
              saveProfile({ name, title, phone, specialties, notificationPrefs: prefs });
              toast.success("Profile updated.");
            }}
            className="space-y-4"
          >
            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold">Personal info</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={name} onChange={setName} />
                <Field label="Title" value={title} onChange={setTitle} />
                <Field label="Email" type="email" value={email} onChange={setEmail} />
                <Field label="Phone" type="tel" value={phone} onChange={setPhone} />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold">Specialties</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {specialties.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a specialty…"
                  className="w-full max-w-xs rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                >
                  Add
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold">Notification preferences</h2>
              <div className="mt-4 divide-y divide-border">
                {(
                  [
                    ["emailDigests", "Weekly email digests"],
                    ["sessionReminders", "Session reminders"],
                    ["diaryAlerts", "Diary submission alerts"],
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
