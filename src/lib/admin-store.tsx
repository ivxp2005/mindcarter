import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminReplyFn,
  approvePsychologistFn,
  cancelBookingFn,
  changeAdminPasswordFn,
  createPsychologistFn,
  getAdminDataFn,
  reactivatePsychologistFn,
  refundBookingFn,
  rejectPsychologistFn,
  removePsychologistFn,
  resolveTicketFn,
  setUserStatusFn,
  updateAdminProfileFn,
  type AdminBookingDTO,
  type AdminTicketDTO,
  type AdminUserDTO,
  type AuditLogEntryDTO,
  type PendingPsychologistDTO,
} from "./admin-data.server";
import { requestPasswordResetFn } from "./auth.server";

// ─────────────────────────────────────────────────────────────────────────────
// Single reactive source of truth for the admin console — DB-backed.
//
// One TanStack Query (`["admin-portal"]`) loads users/bookings/pending
// psychologists/tickets/audit-log from Supabase via `getAdminDataFn`;
// mutations call the matching server functions and invalidate that query.
// Overview's stat tiles are DERIVED here from the fetched rows so they can
// never drift from the Booking/User lists shown elsewhere in the console.
// ─────────────────────────────────────────────────────────────────────────────

const QUERY_KEY = ["admin-portal"] as const;

export type {
  AdminBookingDTO,
  AdminTicketDTO,
  AdminUserDTO,
  AuditLogEntryDTO,
  PendingPsychologistDTO,
};

export interface CreatePsychologistInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  title?: string;
  licenseNumber?: string;
  yearsExperience?: number;
  specialties?: string[];
}

interface AdminDataValue {
  users: AdminUserDTO[];
  bookings: AdminBookingDTO[];
  pendingPsychologists: PendingPsychologistDTO[];
  tickets: AdminTicketDTO[];
  auditLog: AuditLogEntryDTO[];
  isLoading: boolean;
  stats: {
    totalPatients: number;
    totalPsychologists: number;
    appts30d: number;
    revenue30d: string;
  };
  cancelBooking: (id: string) => void;
  refundBooking: (id: string) => void;
  setUserStatus: (id: string, status: "active" | "suspended") => void;
  approvePsychologist: (id: string) => void;
  rejectPsychologist: (id: string) => void;
  resetUserPassword: (email: string) => void;
  replyToTicket: (ticketId: string, body: string) => void;
  resolveTicket: (id: string) => void;
  updateAdminProfile: (name: string) => void;
  changeAdminPassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  addPsychologist: (input: CreatePsychologistInput) => Promise<{ ok: boolean; error?: string }>;
  removePsychologist: (id: string) => void;
  reactivatePsychologist: (id: string) => void;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getAdminDataFn(),
    staleTime: 30_000,
  });

  const users = useMemo(() => data?.users ?? [], [data]);
  const bookings = useMemo(() => data?.bookings ?? [], [data]);
  const pendingPsychologists = useMemo(() => data?.pendingPsychologists ?? [], [data]);
  const tickets = useMemo(() => data?.tickets ?? [], [data]);
  const auditLog = useMemo(() => data?.auditLog ?? [], [data]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const cancelMut = useMutation({ mutationFn: cancelBookingFn, onSuccess: invalidate });
  const refundMut = useMutation({ mutationFn: refundBookingFn, onSuccess: invalidate });
  const setStatusMut = useMutation({ mutationFn: setUserStatusFn, onSuccess: invalidate });
  const approveMut = useMutation({ mutationFn: approvePsychologistFn, onSuccess: invalidate });
  const rejectMut = useMutation({ mutationFn: rejectPsychologistFn, onSuccess: invalidate });
  const resetPwMut = useMutation({ mutationFn: requestPasswordResetFn });
  const replyMut = useMutation({ mutationFn: adminReplyFn, onSuccess: invalidate });
  const resolveMut = useMutation({ mutationFn: resolveTicketFn, onSuccess: invalidate });
  const profileMut = useMutation({ mutationFn: updateAdminProfileFn, onSuccess: invalidate });
  const changePwMut = useMutation({ mutationFn: changeAdminPasswordFn });
  const addPsychMut = useMutation({ mutationFn: createPsychologistFn, onSuccess: invalidate });
  const removePsychMut = useMutation({ mutationFn: removePsychologistFn, onSuccess: invalidate });
  const reactivatePsychMut = useMutation({
    mutationFn: reactivatePsychologistFn,
    onSuccess: invalidate,
  });

  const stats = useMemo(() => {
    const totalPatients = users.filter((u) => u.role === "Patient").length;
    const totalPsychologists = users.filter(
      (u) => u.role === "Psychologist" && u.status !== "Removed",
    ).length;
    const now = Date.now();
    const thirtyDaysAgoMs = now - 30 * 24 * 60 * 60 * 1000;
    const recentBookings = bookings.filter((b) => {
      const parsed = Date.parse(b.dateTime.replace(" ", "T"));
      return !Number.isNaN(parsed) && parsed >= thirtyDaysAgoMs;
    });
    const revenue30d = recentBookings
      .filter((b) => b.status === "Completed")
      .reduce((sum, b) => sum + (Number(b.amount.replace(/[^0-9.]/g, "")) || 0), 0);

    return {
      totalPatients,
      totalPsychologists,
      appts30d: recentBookings.length,
      revenue30d: `$${revenue30d.toLocaleString()}`,
    };
  }, [users, bookings]);

  const value = useMemo<AdminDataValue>(
    () => ({
      users,
      bookings,
      pendingPsychologists,
      tickets,
      auditLog,
      isLoading,
      stats,
      cancelBooking: (id) => cancelMut.mutate({ data: { id } }),
      refundBooking: (id) => refundMut.mutate({ data: { id } }),
      setUserStatus: (id, status) => setStatusMut.mutate({ data: { id, status } }),
      approvePsychologist: (id) => approveMut.mutate({ data: { id } }),
      rejectPsychologist: (id) => rejectMut.mutate({ data: { id } }),
      resetUserPassword: (email) => resetPwMut.mutate({ data: { email } }),
      replyToTicket: (ticketId, body) => replyMut.mutate({ data: { ticketId, body } }),
      resolveTicket: (id) => resolveMut.mutate({ data: { id } }),
      updateAdminProfile: (name) => profileMut.mutate({ data: { name } }),
      changeAdminPassword: (currentPassword, newPassword) =>
        changePwMut.mutateAsync({ data: { currentPassword, newPassword } }),
      addPsychologist: (input) => addPsychMut.mutateAsync({ data: input }),
      removePsychologist: (id) => removePsychMut.mutate({ data: { id } }),
      reactivatePsychologist: (id) => reactivatePsychMut.mutate({ data: { id } }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, bookings, pendingPsychologists, tickets, auditLog, isLoading, stats],
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminDataValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return ctx;
}
