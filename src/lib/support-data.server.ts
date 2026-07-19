/**
 * support-data.server.ts — DB-backed support-ticket layer shared by the
 * patient portal, the psychologist portal, and the admin console.
 *
 * Mirrors patient-data.server.ts / psychologist-data.server.ts: every handler
 * is scoped to the logged-in user via `getSessionUser()`. Unlike diary
 * entries, tickets can be authored by either a patient or a psychologist, so
 * these functions branch on role rather than requiring one specific role.
 */
import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../db/client.server";
import { supportTicketMessages, supportTickets } from "../db/schema";
import { getSessionUser } from "./auth.server";

export interface TicketMessageDTO {
  id: string;
  sender: "user" | "admin";
  text: string;
  time: string;
}

export interface TicketDTO {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  messages: TicketMessageDTO[];
}

function toDTO(
  ticket: typeof supportTickets.$inferSelect,
  messages: (typeof supportTicketMessages.$inferSelect)[],
  authorId: string,
): TicketDTO {
  return {
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt.toISOString(),
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.senderId === authorId ? "user" : "admin",
      text: m.body,
      time: m.createdAt.toISOString(),
    })),
  };
}

// ─── Read ───────────────────────────────────────────────────────────────────

export const getMyTicketsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<TicketDTO[]> => {
    const user = await getSessionUser();
    if (!user) return [];

    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.authorId, user.id))
      .orderBy(desc(supportTickets.createdAt));

    if (tickets.length === 0) return [];

    const allMessages = await Promise.all(
      tickets.map((t) =>
        db
          .select()
          .from(supportTicketMessages)
          .where(eq(supportTicketMessages.ticketId, t.id))
          .orderBy(asc(supportTicketMessages.createdAt)),
      ),
    );

    return tickets.map((t, i) => toDTO(t, allMessages[i], user.id));
  },
);

// ─── Mutations ──────────────────────────────────────────────────────────────

export const submitTicketFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as { subject: string; priority: "low" | "medium" | "high"; message: string },
  )
  .handler(async ({ data }) => {
    const user = await getSessionUser();
    if (!user) return { ok: false as const, error: "Not authorized." };

    const [ticket] = await db
      .insert(supportTickets)
      .values({ authorId: user.id, subject: data.subject, priority: data.priority })
      .returning({ id: supportTickets.id });

    await db.insert(supportTicketMessages).values({
      ticketId: ticket.id,
      senderId: user.id,
      body: data.message,
    });

    return { ok: true as const, id: ticket.id };
  });

export const replyToTicketFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { ticketId: string; body: string })
  .handler(async ({ data }) => {
    const user = await getSessionUser();
    if (!user) return { ok: false as const, error: "Not authorized." };

    const owned = await db
      .select({ id: supportTickets.id })
      .from(supportTickets)
      .where(and(eq(supportTickets.id, data.ticketId), eq(supportTickets.authorId, user.id)))
      .limit(1);
    if (owned.length === 0) return { ok: false as const, error: "Ticket not found." };

    await db.insert(supportTicketMessages).values({
      ticketId: data.ticketId,
      senderId: user.id,
      body: data.body,
    });

    return { ok: true as const };
  });
