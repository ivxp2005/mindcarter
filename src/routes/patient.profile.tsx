import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Check } from "lucide-react";
import { PortalPageHeader } from "../components/portal-page-header";
import { getProfile, updateProfile, type Profile } from "../services/patient-api";

export const Route = createFileRoute("/patient/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // TODO: Supabase — getProfile()
    getProfile().then((p) => {
      setProfile(p);
      setForm(p);
    });
  }, []);

  if (!form) {
    return (
      <>
        <PortalPageHeader eyebrow="Profile" title="Account settings" />
        <div className="mt-8 h-96 animate-pulse rounded-2xl bg-muted/40" />
      </>
    );
  }

  const onSave = async () => {
    setSaving(true);
    // TODO: Supabase — updateProfile(form)
    const updated = await updateProfile(form);
    setProfile(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const dirty = JSON.stringify(form) !== JSON.stringify(profile);

  return (
    <>
      <PortalPageHeader
        eyebrow="Profile"
        title="Account settings"
        actions={
          <button
            onClick={onSave}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-50"
          >
            {saved ? <Check className="h-4 w-4" /> : null}
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          </button>
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-2xl border border-border bg-background p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Avatar
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative">
              <img
                src={form.avatar}
                alt={form.fullName}
                className="h-20 w-20 rounded-full object-cover"
              />
              <button
                aria-label="Change avatar"
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-foreground text-background"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold">{form.fullName}</p>
              <p className="text-xs text-muted-foreground">{form.email}</p>
            </div>
          </div>
          <div className="mt-8 space-y-3 border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Security
            </p>
            <button className="w-full rounded-xl border border-border p-3 text-left text-sm font-semibold">
              Change password →
            </button>
            <button className="w-full rounded-xl border border-border p-3 text-left text-sm font-semibold">
              Two-factor authentication →
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal information
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Date of birth" type="date" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} />
              <div className="sm:col-span-2">
                <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notifications
            </p>
            <div className="mt-4 space-y-3">
              <Toggle
                label="Email reminders"
                hint="Session reminders, reports and updates"
                checked={form.notifications.email}
                onChange={(v) =>
                  setForm({ ...form, notifications: { ...form.notifications, email: v } })
                }
              />
              <Toggle
                label="SMS reminders"
                hint="Text alerts for upcoming sessions"
                checked={form.notifications.sms}
                onChange={(v) =>
                  setForm({ ...form, notifications: { ...form.notifications, sms: v } })
                }
              />
              <Toggle
                label="Product updates"
                hint="New features and offers from Mindcarter"
                checked={form.notifications.product}
                onChange={(v) =>
                  setForm({ ...form, notifications: { ...form.notifications, product: v } })
                }
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

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
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
      />
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-foreground" : "bg-muted"
        }`}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-background transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </label>
  );
}