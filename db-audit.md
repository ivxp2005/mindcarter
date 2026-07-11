# Mindcarter — Data Model Audit

Audit of every place the app currently uses mock/local/in-memory data or has a
`// TODO: Supabase`-style comment, translated into a proposed list of tables
and columns. **No SQL, no schema, no migrations, no code** — this is a
planning document only.

Sources reviewed: `src/routes/index.tsx` (homepage psychologist directory),
`src/routes/booking.tsx`, `src/routes/contact.tsx`, `src/routes/login.tsx`,
`src/routes/psychologist/*` (`index.tsx`, `meetings.tsx`, `patients.tsx`,
`diaries.tsx`, `analytics.tsx`, `notifications.tsx`, `profile.tsx`) +
`src/lib/psychologist/{types,data}.ts`, `src/routes/portal-management-access.tsx`
(admin console — already has `Booking`, `PsychVerification`, `UserRecord`,
`SupportTicket` interfaces, used below as the starting point), `src/lib/auth.ts`.

## How to read this

Each entity lists: **Fields**, **Relationships**, **Used by** (routes/components
that read or write it today, as mock data), and **Notes** — mainly places
where two routes have independently invented slightly different shapes for
what is really the same underlying thing, and need to be reconciled during
actual schema design.

---

## 1. Core identity

### `users`
The root identity table. Nothing in the app currently models this as one
entity — it's implied by `login.tsx`'s role picker, admin's `UserRecord`,
the psychologist portal's `Patient`/`PsychologistProfile`, and
`src/lib/auth.ts`'s `AdminUser`. Every other entity below should FK into this.

- **Fields**: `id`, `email`, `password_hash`, `role` (`patient` | `psychologist` | `admin`), `name`, `phone`, `status` (`active` | `suspended` | `pending`), `created_at`
- **Relationships**: parent of `patient_profiles`, `psychologist_profiles`, `bookings` (as patient or psychologist), `diary_entries`, `notifications`, `audit_log_entries` (as actor), `support_tickets` (as user)
- **Used by**: `login.tsx` (role selection, currently fake — writes `mc_role` to `localStorage`, no real credential check), `portal-management-access.tsx` `UserManagement` (`UserRecord`: id, name, email, phone, role, status, joined, sessions), `psychologist/*` (patient/psychologist identity is currently duplicated as separate mock arrays, see below)
- **Notes**: `UserRecord.sessions` (a count) should be a derived/computed value (`COUNT(bookings)`), not a stored column. `UserRecord.joined` → `created_at`.

### `sessions` (auth)
Not modeled anywhere consistently today — three different, mutually
incompatible ad hoc mechanisms exist and need to converge on one real scheme:
1. `login.tsx` — no real auth at all, just `localStorage.setItem("mc_role", role)`.
2. `portal-management-access.tsx` — hardcoded `ADMIN_EMAIL_CLIENT`/`ADMIN_PASSWORD_CLIENT`, session kept in `sessionStorage` (`__mc_adm_session`), client-only, trivially bypassable.
3. `src/lib/auth.ts` — a real HMAC-signed cookie-token scheme (`createSessionToken`/`verifySessionToken`, `ADMIN_EMAIL`/`ADMIN_PASSWORD` from env with hardcoded dev fallbacks) that is **defined but never actually wired into** `portal-management-access.tsx`'s login flow.

- **Fields** (if table-backed rather than stateless JWT): `id`, `user_id`, `token_hash`, `expires_at`, `created_at`, `user_agent`, `ip` (optional)
- **Relationships**: belongs to `users`
- **Used by**: `login.tsx`, `portal-management-access.tsx`, `src/lib/auth.ts`
- **Decision**: use the HMAC-signed session-token scheme already in src/lib/auth.ts, extended to cover all three roles (patient | psychologist | admin). Delete the login.tsx localStorage("mc_role") mechanism and the portal-management-access.tsx sessionStorage admin hack entirely — both routes should use the same shared auth going forward.

### `patient_profiles`
Clinical-adjacent extension of `users` for role=`patient`. Per
`portal-management-access.tsx`'s own stated design ("Clinical notes and
message threads are NEVER surfaced to the admin"), this must be a **separate
table from `users`** with stricter access control (readable by the assigned
psychologist and the patient themselves, not by admin).

- **Fields**: `user_id` (FK/PK), `primary_concern`, `tags` (string array), `total_sessions` (derived, or cached counter)
- **Relationships**: 1:1 with `users`; referenced by `bookings.patient_id`, `diary_entries.patient_id`
- **Used by**: `psychologist/patients.tsx`, `psychologist/index.tsx` (dashboard schedule/diary previews), `psychologist/meetings.tsx` (patient lookup)
- **Notes**: mock `Patient` type also carries `name`, `email`, `phone`, `initials`, `status`, `lastSession`, `nextSession` — those belong on `users` (name/email/phone/status) or are derived (`lastSession`/`nextSession`/`initials`) rather than stored here.

### `psychologist_profiles`
Extension of `users` for role=`psychologist`. Overlaps significantly with
admin's `PsychVerification` — see Notes.

- **Fields**: `user_id` (FK/PK), `title`, `license_number`, `specialties` (string array), `bio`, `years_experience`
- **Relationships**: 1:1 with `users`; referenced by `bookings.psychologist_id`, `psych_verifications.user_id`, `availability_slots.psychologist_id`
- **Used by**: `psychologist/profile.tsx` (`PROFILE` mock object: name, title, email, phone, license, specialties, bio, hours, notificationPrefs), homepage `PSYCHOLOGISTS` array (`index.tsx`: name, role, tags, hours, languages, price, nextAvailable, photo)
- **Notes**: `PROFILE.notificationPrefs` (emailDigests/sessionReminders/diaryAlerts/marketing booleans) is small and fixed — fine as either JSON on this row or 4 columns, not worth a separate table. `hours` (a list of `{day, range}`) is recurring structured data — see `availability_slots` below, don't inline it as JSON. Homepage's `languages`, `hours` (a therapy-hours *counter*, confusingly same field name as `Profile.hours` which is a weekly *schedule* — these are two different concepts that happen to share a name in the current mocks and must not be conflated), `price`, `photo`, `nextAvailable` are public-directory/booking-facing fields — likely belong here too (or a thin `psychologist_listing` view over this table + aggregates).

### `availability_slots`
Implied by `PROFILE.hours` (`psychologist/profile.tsx`) and by
`nextAvailable` / booking flow, but not modeled as real recurring-schedule
data anywhere yet — currently just a hardcoded read-only list.

- **Fields**: `id`, `psychologist_id`, `day_of_week`, `start_time`, `end_time`
- **Relationships**: belongs to `psychologist_profiles`
- **Used by**: `psychologist/profile.tsx` (display only, not editable despite being under an editable form), homepage booking flow (`nextAvailable` display, currently a static string per psychologist)

---

## 2. Bookings / sessions

This is the biggest reconciliation problem in the audit: **the admin
console's `Booking` and the psychologist portal's `Meeting` are the same
real-world entity, modeled twice, with different fields and no shared ID
space.** A real schema needs exactly one `bookings` table; both UIs are
different filtered views onto it.

### `bookings`
- **Fields** (union of admin's `Booking` and psychologist portal's `Meeting`, deduplicated):
  `id`, `patient_id` (FK `users`, nullable for group sessions), `psychologist_id` (FK `users`), `group_label` (nullable — covers `Meeting.patientName = "Northwind exec cohort"` when `patientId` is null), `scheduled_date`, `scheduled_time`, `duration_minutes`, `session_kind` (`Individual therapy` | `Assessment review` | `Group coaching` | `Executive coaching` | `Intake` — admin's `Booking.type` uses a different vocabulary: `Video Session` | `In-Person` | `Chat Session`, which is actually conflating *session kind* with *session mode*, see below), `mode` (`Video` | `In-person` | `Phone`), `status` (`Scheduled`/`upcoming` | `Completed` | `Canceled` | `Refunded` — admin and psychologist mocks use overlapping but not identical status enums, needs one canonical list), `amount`, `notes` (clinician-visible only), `video_room_url` (nullable)
- **Relationships**: belongs to `users` (twice: patient, psychologist); referenced by `transactions`, `audit_log_entries.target`
- **Used by**: `booking.tsx` (creates one — currently `// TODO: Supabase / payment provider — charge card, insert booking`), `portal-management-access.tsx` `BookingMasterLog` (admin-wide view + cancel/refund mutations), `psychologist/index.tsx` (today's schedule preview), `psychologist/meetings.tsx` (full CRUD-ish view: tabs, calendar, detail dialog, mock "Start session"/"Reschedule" actions)
- **Decision**: split into two separate columns. session_kind: individual_therapy | 
  group_coaching | assessment_review | executive_coaching | intake. mode: video | 
  in_person | phone. Both portal-management-access.tsx and psychologist/meetings.tsx 
  must read/write these same two fields on the same bookings table — no separate 
  Meeting type going forward.
- **Note**: admin's cancel/refund actions (`BookingMasterLog.handleCancel`/
  `handleRefund`) and the psychologist portal's "Start session"/"Reschedule" mock 
  actions are all mutations on this same table from two different UIs with two 
  different mock copies of the "same" data today.
- **Constraint**: raw card data (`booking.tsx`'s `cardName`/`cardNumber`/`expiry`/
  `cvc` state) must never land in this table or any table — that's a 
  payment-provider (Stripe/etc.) tokenization concern, not app data.

### `transactions`
Implied by `booking.tsx`'s payment flow and the admin console's empty
Revenue tab (`PlaceholderSection id="revenue"` — literally "Connect your
database to populate this section," no fields defined yet at all).

- **Fields**: `id`, `booking_id` (FK), `amount`, `platform_fee` (booking.tsx hardcodes `PLATFORM_FEE = 49`), `currency`, `status` (`succeeded`/`refunded`/`failed`), `provider_reference` (external payment-provider charge ID), `created_at`
- **Relationships**: belongs to `bookings`
- **Used by**: `booking.tsx` (create, mocked via `setPaid(true)` + a toast, no real charge), admin Revenue tab (currently has zero fields/data to reconcile against — this table is a proposal, not a reconciliation)

---

## 3. Clinical documentation

### `diary_entries`
- **Fields**: `id`, `patient_id` (FK `users`), `author_id` (FK `users`, the psychologist), `title`, `status` (`pending_review` | `reviewed`), `submitted_at`, `content`, `clinician_note` (nullable)
- **Relationships**: belongs to `users` (patient) and `users` (author/psychologist)
- **Used by**: `psychologist/diaries.tsx` (list/filter, mark-as-reviewed, save-note — all local `useState` mutations today, nothing persists across reload), `psychologist/index.tsx` (recent-diaries preview + "Diaries pending" stat card)
- **Notes**: `excerpt` in the mock type is a derived/truncated view of `content`, not a separate stored field. This table is squarely the kind of data `portal-management-access.tsx` explicitly says the admin should never see — access control matters here more than for any other entity.

---

## 4. Notifications

### `notifications`
- **Fields**: `id`, `user_id` (FK — recipient), `kind` (`meeting` | `diary` | `message` | `system`), `title`, `body`, `read` (boolean), `created_at`, `action_url` (nullable), `action_params` (nullable JSON — mock's `actionSearch` is a small key-value map for deep-linking)
- **Relationships**: belongs to `users`
- **Used by**: `psychologist/notifications.tsx` (list, mark-as-read/mark-all-read — local state only), `psychologist/index.tsx` ("Notifications" stat card)
- **Notes**: the mock data is psychologist-specific, but the shape is generic enough to be the one notifications table for all roles (patient-facing and admin-facing notifications would reuse it, not need their own tables).

---

## 5. Admin / verification / support (from `portal-management-access.tsx`)

### `psych_verifications`
Already has a TS interface (`PsychVerification`) — used almost as-is.

- **Fields**: `id`, `user_id` (FK — the applicant), `specialty`, `submitted_at`, `status` (`pending` | `approved` | `rejected`), `experience_years`, `license_number`
- **Relationships**: belongs to `users`; parent of `verification_documents`
- **Used by**: `portal-management-access.tsx` `VerificationQueue` (approve/reject mutations, local state only)
- **Notes**: `name`/`email` in the mock type duplicate `users` — drop, join instead. Once approved, this record's `specialty`/`experience_years`/`license_number` likely seed `psychologist_profiles` rather than living twice.

### `verification_documents`
Currently a nested array (`PsychVerification.docs: {name, type}[]`) — should
be its own table since it's a one-to-many collection of uploaded files.

- **Fields**: `id`, `verification_id` (FK), `file_name`, `file_type` (`PDF` | `IMG`), `storage_url`, `uploaded_at`
- **Relationships**: belongs to `psych_verifications`
- **Used by**: `portal-management-access.tsx` `VerificationQueue` detail panel ("View" button per doc — currently non-functional, no real file storage)

### `support_tickets`
Already has TS interfaces (`SupportTicket`, `TicketMessage`).

- **Fields**: `id`, `user_id` (FK), `subject`, `status` (`Open` | `In Progress` | `Resolved`), `priority` (`Low` | `Medium` | `High`), `created_at`
- **Relationships**: belongs to `users`; parent of `ticket_messages`
- **Used by**: `portal-management-access.tsx` `SupportTickets` (reply, resolve — local state, in-memory chat log)
- **Notes**: `user`/`email` in the mock duplicate `users` — join instead.

### `ticket_messages`
Currently a nested array (`SupportTicket.messages: {sender, text, time}[]`).

- **Fields**: `id`, `ticket_id` (FK), `sender` (`user` | `admin`), `body`, `created_at`
- **Relationships**: belongs to `support_tickets`
- **Used by**: `portal-management-access.tsx` `SupportTickets` message thread + reply box

### `audit_log_entries`
Already effectively an interface (inline array literal, no named type, but
same idea) — a real compliance log needs this to be genuinely
insert-only/tamper-evident, unlike today's in-memory array.

- **Fields**: `id`, `action`, `actor_id` (FK `users`, admin who performed it), `target` (free-text reference — booking ID, user email, ticket ID, etc.), `created_at`
- **Relationships**: belongs to `users` (actor); loosely references whatever `target` names (polymorphic, not a hard FK in the current mock)
- **Used by**: `portal-management-access.tsx` `AuditLogSection` (read-only display) and `OverviewSection` ("Recent Activity" — same data, different view)
- **Notes**: today nothing actually *writes* new audit entries when an admin cancels a booking, approves a verification, resolves a ticket, etc. — those mutations and the audit log are disconnected mocks. Once real, every admin mutation above should insert one row here.

### System health (`portal-management-access.tsx` `SYSTEM_HEALTH`)
Static array of `{name, status, color, icon}` (API Gateway, Video Sessions,
Payment Service, etc.) with no dynamic data behind it at all.

- **Notes**: this almost certainly should **not** be an app database table —
  it reads like a stand-in for an external status-monitoring integration
  (e.g. a status page provider or infra healthcheck endpoint). Flagging it
  here for completeness, not proposing a table.

### Revenue & Settings tabs (`portal-management-access.tsx` `PlaceholderSection`)
Both render literally "Connect your database to populate this section" with
zero mock fields defined. Revenue's underlying data is `transactions`
(above, aggregated). Settings has no product definition yet — nothing to
model until requirements exist.

---

## 6. Marketing-site-only, no persistence today

### Contact inquiries (`contact.tsx`)
Form collects name, email, phone, org, message but **has no backend call at
all** — not even a TODO comment, `setSent(true)` is the entire "submit"
handler. No entity currently implied beyond the raw form fields.

- **Proposed entity**: `contact_inquiries` — `id`, `name`, `email`, `phone` (nullable), `organization` (nullable), `message`, `created_at`, `status` (`new` | `contacted` | `closed`, for the intake team mentioned in the page copy: "Our intake team responds within one business day")
- **Used by**: `contact.tsx`

### Homepage psychologist directory (`index.tsx`, `PSYCHOLOGISTS` array)
Public-facing bookable-service listing, distinct from the authenticated
`psychologist_profiles` above (though they should ultimately be the same
underlying people).

- **Fields already inferred above** under `psychologist_profiles` notes: `tags`, `hours` (career-hours counter, not weekly schedule), `languages`, `price`, `next_available`, `photo`
- **Used by**: `index.tsx` `Psychologists` section, feeds into `booking.tsx` via `Link search={{ name, role, price }}`
- **Notes**: the search box at the top of this section (`"Search by name, specialty, language, or tags…"`) is decorative only right now — no filtering logic wired up, which implies these fields need to be indexed/searchable once real.

---

## Summary: proposed tables

| Table | Reconciles / replaces |
|---|---|
| `users` | `login.tsx` role picker, admin `UserRecord`, `src/lib/auth.ts` `AdminUser` |
| `sessions` | `mc_role` localStorage, admin `sessionStorage` hack, unused `src/lib/auth.ts` HMAC scheme |
| `patient_profiles` | psychologist portal `Patient` (clinical fields only) |
| `psychologist_profiles` | psychologist portal `PROFILE`, homepage `PSYCHOLOGISTS` |
| `availability_slots` | `PROFILE.hours` |
| `bookings` | admin `Booking` + psychologist portal `Meeting` (currently two separate mocks of one entity) |
| `transactions` | `booking.tsx` payment flow, admin's empty Revenue tab |
| `diary_entries` | psychologist portal `DiaryEntry` |
| `notifications` | psychologist portal `PortalNotification` |
| `psych_verifications` | admin `PsychVerification` |
| `verification_documents` | `PsychVerification.docs[]` |
| `support_tickets` | admin `SupportTicket` |
| `ticket_messages` | `SupportTicket.messages[]` |
| `audit_log_entries` | admin `AUDIT_LOG` |
| `contact_inquiries` | `contact.tsx` (new — nothing currently models this) |

Analytics (`WeeklySessions`, `SessionTypeSlice`, `PatientGrowthPoint` in
`src/lib/psychologist/data.ts`) are intentionally **not** listed as tables —
they're aggregations over `bookings`/`users` and should be computed via
query (or a materialized view later), not stored directly.
