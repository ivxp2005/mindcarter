/**
 * admin-data.server.ts — DB-backed data layer for the admin console.
 *
 * Mirrors psychologist-data.server.ts: every handler is guarded by
 * `getAdminSessionUser()`/`role === "admin"` (the admin console's own session
 * cookie, separate from the patient/psychologist one), and DB rows are
 * mapped to DTOs that
 * match the admin console's original mock-data field names so
 * portal-management-access.tsx needed minimal JSX changes to consume them.
 * Clinical notes and diary content are intentionally never queried here —
 * the admin must not see them. Only destructive actions (cancel/refund
 * booking, suspend user, reject psychologist) are written to `audit_log` —
 * see `logAudit()`.
 */
import { createServerFn } from "@tanstack/react-start";
import { alias } from "drizzle-orm/pg-core";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../db/client.server";
import {
  auditLog,
  bookings,
  notifications,
  psychologistProfiles,
  supportTicketMessages,
  supportTickets,
  users,
} from "../db/schema";
import { getAdminSessionUser, hashPassword, verifyPassword } from "./auth.server";
import type { SessionUser } from "./auth-types";

// ─── DTOs returned to the client ────────────────────────────────────────────

export interface AdminBookingDTO {
  id: string;
  patient: string;
  psychologist: string;
  dateTime: string;
  status: "Scheduled" | "Completed" | "Canceled" | "Refunded";
  type: string;
  amount: string;
}

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Patient" | "Psychologist";
  status: "Active" | "Suspended" | "Pending" | "Removed";
  joined: string;
  sessions: number;
}

export interface PendingPsychologistDTO {
  id: string;
  name: string;
  email: string;
  specialty: string;
  submitted: string;
  experience: string;
  license: string;
  docs: { name: string; type: string }[];
  status: "pending" | "approved" | "rejected";
}

export interface AdminTicketMessageDTO {
  sender: "user" | "admin";
  text: string;
  time: string;
}

export interface AdminTicketDTO {
  id: string;
  user: string;
  email: string;
  subject: string;
  status: "Open" | "In Progress" | "Resolved";
  priority: "Low" | "Medium" | "High";
  created: string;
  messages: AdminTicketMessageDTO[];
}

export interface AuditLogEntryDTO {
  action: string;
  actor: string;
  target: string;
  time: string;
}

export interface AdminData {
  users: AdminUserDTO[];
  bookings: AdminBookingDTO[];
  pendingPsychologists: PendingPsychologistDTO[];
  tickets: AdminTicketDTO[];
  auditLog: AuditLogEntryDTO[];
}

const EMPTY_ADMIN_DATA: AdminData = {
  users: [],
  bookings: [],
  pendingPsychologists: [],
  tickets: [],
  auditLog: [],
};

const patientUsers = alias(users, "patient_users");
const psychologistUsers = alias(users, "psychologist_users");

// ─── Enum -> label mapping ──────────────────────────────────────────────────

const STATUS_TO_LABEL: Record<string, AdminBookingDTO["status"]> = {
  scheduled: "Scheduled",
  completed: "Completed",
  canceled: "Canceled",
  refunded: "Refunded",
};

const KIND_TO_LABEL: Record<string, string> = {
  individual_therapy: "Individual Therapy",
  group_coaching: "Group Coaching",
  assessment_review: "Assessment",
  executive_coaching: "Executive Coaching",
  intake: "Intake",
  follow_up: "Follow-up",
};

const USER_STATUS_TO_LABEL: Record<string, AdminUserDTO["status"]> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
  removed: "Removed",
};

const TICKET_STATUS_TO_LABEL: Record<string, AdminTicketDTO["status"]> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const TICKET_PRIORITY_TO_LABEL: Record<string, AdminTicketDTO["priority"]> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function formatDateTime(date: string, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${date} ${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatJoined(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function timeAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}

// ─── Auth guard ─────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getAdminSessionUser();
  return user && user.role === "admin" ? user : null;
}

/** Records a destructive admin action to audit_log. */
async function logAudit(actorId: string, action: string, target: string): Promise<void> {
  await db.insert(auditLog).values({ actorId, action, target });
}

// ─── Read ───────────────────────────────────────────────────────────────────

export const getAdminDataFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminData> => {
    if (!(await requireAdmin())) return EMPTY_ADMIN_DATA;

    const [
      userRows,
      bookingRows,
      patientSessionCounts,
      psychSessionCounts,
      pendingPsychRows,
      ticketRows,
      auditRows,
    ] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(ne(users.role, "admin"))
        .orderBy(desc(users.createdAt)),
      db
        .select({
          id: bookings.id,
          patientName: patientUsers.name,
          psychologistName: psychologistUsers.name,
          date: bookings.scheduledDate,
          time: bookings.scheduledTime,
          kind: bookings.sessionKind,
          status: bookings.status,
          amount: bookings.amount,
        })
        .from(bookings)
        .innerJoin(psychologistUsers, eq(bookings.psychologistId, psychologistUsers.id))
        .leftJoin(patientUsers, eq(bookings.patientId, patientUsers.id))
        .orderBy(desc(bookings.scheduledDate)),
      db
        .select({ userId: bookings.patientId, count: sql<number>`count(*)::int` })
        .from(bookings)
        .groupBy(bookings.patientId),
      db
        .select({ userId: bookings.psychologistId, count: sql<number>`count(*)::int` })
        .from(bookings)
        .groupBy(bookings.psychologistId),
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          specialties: psychologistProfiles.specialties,
          licenseNumber: psychologistProfiles.licenseNumber,
          yearsExperience: psychologistProfiles.yearsExperience,
        })
        .from(users)
        .leftJoin(psychologistProfiles, eq(psychologistProfiles.userId, users.id))
        .where(and(eq(users.role, "psychologist"), eq(users.status, "pending"))),
      db
        .select({
          id: supportTickets.id,
          authorId: supportTickets.authorId,
          authorName: users.name,
          authorEmail: users.email,
          subject: supportTickets.subject,
          status: supportTickets.status,
          priority: supportTickets.priority,
          createdAt: supportTickets.createdAt,
        })
        .from(supportTickets)
        .innerJoin(users, eq(supportTickets.authorId, users.id))
        .orderBy(desc(supportTickets.createdAt)),
      db
        .select({
          action: auditLog.action,
          actorEmail: users.email,
          target: auditLog.target,
          createdAt: auditLog.createdAt,
        })
        .from(auditLog)
        .innerJoin(users, eq(auditLog.actorId, users.id))
        .orderBy(desc(auditLog.createdAt))
        .limit(50),
    ]);

    const patientSessionMap = new Map<string, number>(
      patientSessionCounts
        .filter((r) => r.userId !== null)
        .map((r) => [r.userId as string, r.count]),
    );
    const psychSessionMap = new Map<string, number>(
      psychSessionCounts.map((r) => [r.userId, r.count]),
    );

    const dtoUsers: AdminUserDTO[] = userRows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      role: u.role === "psychologist" ? "Psychologist" : "Patient",
      status: USER_STATUS_TO_LABEL[u.status] ?? "Active",
      joined: formatJoined(u.createdAt),
      sessions:
        u.role === "psychologist"
          ? (psychSessionMap.get(u.id) ?? 0)
          : (patientSessionMap.get(u.id) ?? 0),
    }));

    const dtoBookings: AdminBookingDTO[] = bookingRows.map((b) => ({
      id: b.id,
      patient: b.patientName ?? "Unknown patient",
      psychologist: b.psychologistName,
      dateTime: formatDateTime(b.date, b.time),
      status: STATUS_TO_LABEL[b.status] ?? "Scheduled",
      type: KIND_TO_LABEL[b.kind] ?? b.kind,
      amount: b.amount ? `$${b.amount}` : "—",
    }));

    const dtoPending: PendingPsychologistDTO[] = pendingPsychRows.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      specialty: p.specialties?.[0] ?? "General Practice",
      submitted: timeAgo(p.createdAt),
      experience: p.yearsExperience ? `${p.yearsExperience} years` : "—",
      license: p.licenseNumber ?? "—",
      docs: [],
      status: "pending",
    }));

    const messageRows =
      ticketRows.length === 0
        ? []
        : await db
            .select({
              ticketId: supportTicketMessages.ticketId,
              senderId: supportTicketMessages.senderId,
              body: supportTicketMessages.body,
              createdAt: supportTicketMessages.createdAt,
            })
            .from(supportTicketMessages)
            .orderBy(asc(supportTicketMessages.createdAt));

    const messagesByTicket = new Map<string, typeof messageRows>();
    for (const m of messageRows) {
      const arr = messagesByTicket.get(m.ticketId) ?? [];
      arr.push(m);
      messagesByTicket.set(m.ticketId, arr);
    }

    const dtoTickets: AdminTicketDTO[] = ticketRows.map((t) => ({
      id: t.id,
      user: t.authorName,
      email: t.authorEmail,
      subject: t.subject,
      status: TICKET_STATUS_TO_LABEL[t.status] ?? "Open",
      priority: TICKET_PRIORITY_TO_LABEL[t.priority] ?? "Medium",
      created: timeAgo(t.createdAt),
      messages: (messagesByTicket.get(t.id) ?? []).map((m) => ({
        sender: m.senderId === t.authorId ? "user" : "admin",
        text: m.body,
        time: timeAgo(m.createdAt),
      })),
    }));

    const dtoAuditLog: AuditLogEntryDTO[] = auditRows.map((a) => ({
      action: a.action,
      actor: a.actorEmail,
      target: a.target,
      time: timeAgo(a.createdAt),
    }));

    return {
      users: dtoUsers,
      bookings: dtoBookings,
      pendingPsychologists: dtoPending,
      tickets: dtoTickets,
      auditLog: dtoAuditLog,
    };
  },
);

// ─── Mutations ──────────────────────────────────────────────────────────────

export const cancelBookingFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };
    await db
      .update(bookings)
      .set({ status: "canceled", updatedAt: new Date() })
      .where(eq(bookings.id, data.id));
    await logAudit(admin.id, "Booking canceled", `Booking ${data.id.slice(0, 8)}`);
    return { ok: true as const };
  });

export const refundBookingFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };
    await db
      .update(bookings)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(eq(bookings.id, data.id));
    await logAudit(admin.id, "Booking refunded", `Booking ${data.id.slice(0, 8)}`);
    return { ok: true as const };
  });

export const setUserStatusFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string; status: "active" | "suspended" })
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };
    await db.update(users).set({ status: data.status }).where(eq(users.id, data.id));
    if (data.status === "suspended") {
      const target = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, data.id))
        .limit(1);
      await logAudit(admin.id, "User suspended", target[0]?.email ?? data.id);
    }
    return { ok: true as const };
  });

export const adminReplyFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { ticketId: string; body: string })
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };

    const ticketRows = await db
      .select({ authorId: supportTickets.authorId, authorRole: users.role })
      .from(supportTickets)
      .innerJoin(users, eq(supportTickets.authorId, users.id))
      .where(eq(supportTickets.id, data.ticketId))
      .limit(1);
    const ticket = ticketRows[0];
    if (!ticket) return { ok: false as const, error: "Ticket not found." };

    await db.insert(supportTicketMessages).values({
      ticketId: data.ticketId,
      senderId: admin.id,
      body: data.body,
    });
    await db
      .update(supportTickets)
      .set({ status: "in_progress" })
      .where(eq(supportTickets.id, data.ticketId));
    await db.insert(notifications).values({
      userId: ticket.authorId,
      kind: "message",
      title: "Support ticket update",
      body: data.body.length > 140 ? `${data.body.slice(0, 140)}…` : data.body,
      actionUrl: ticket.authorRole === "psychologist" ? "/psychologist/support" : "/employee/support",
    });

    return { ok: true as const };
  });

export const resolveTicketFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };
    await db
      .update(supportTickets)
      .set({ status: "resolved" })
      .where(eq(supportTickets.id, data.id));
    return { ok: true as const };
  });

export const updateAdminProfileFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { name: string })
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };
    await db.update(users).set({ name: data.name }).where(eq(users.id, admin.id));
    return { ok: true as const };
  });

export const changeAdminPasswordFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { currentPassword: string; newPassword: string })
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };

    const rows = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, admin.id))
      .limit(1);
    const hash = rows[0]?.passwordHash;
    if (!hash || !(await verifyPassword(data.currentPassword, hash))) {
      return { ok: false as const, error: "Current password is incorrect." };
    }

    const newHash = await hashPassword(data.newPassword);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, admin.id));
    return { ok: true as const };
  });

export const createPsychologistFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as {
        name: string;
        email: string;
        password: string;
        phone?: string;
        title?: string;
        licenseNumber?: string;
        yearsExperience?: number;
        specialties?: string[];
      },
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };

    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    if (!email || !name) return { ok: false as const, error: "Name and email are required." };
    if (data.password.length < 8) {
      return { ok: false as const, error: "Password must be at least 8 characters." };
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return { ok: false as const, error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: "psychologist",
        name,
        phone: data.phone?.trim() || null,
        status: "active",
      })
      .returning({ id: users.id });

    await db.insert(psychologistProfiles).values({
      userId: user.id,
      title: data.title?.trim() || null,
      licenseNumber: data.licenseNumber?.trim() || null,
      yearsExperience: data.yearsExperience ?? null,
      specialties: data.specialties?.length ? data.specialties : null,
    });

    return { ok: true as const, id: user.id };
  });

export const removePsychologistFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };

    const target = await db
      .select({ email: users.email })
      .from(users)
      .where(and(eq(users.id, data.id), eq(users.role, "psychologist")))
      .limit(1);
    if (target.length === 0) return { ok: false as const, error: "Psychologist not found." };

    await db
      .update(users)
      .set({ status: "removed" })
      .where(and(eq(users.id, data.id), eq(users.role, "psychologist")));
    await logAudit(admin.id, "Psychologist removed", target[0].email);
    return { ok: true as const };
  });

export const reactivatePsychologistFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Not authorized." };
    await db
      .update(users)
      .set({ status: "active" })
      .where(and(eq(users.id, data.id), eq(users.role, "psychologist")));
    return { ok: true as const };
  });
