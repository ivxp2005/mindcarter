import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarPlus, Check } from "lucide-react";
import { GradientAvatar } from "../gradient-avatar";
import { buildSessionICS, downloadICS, formatINR, formatLongDate } from "../../lib/booking-flow";

export interface ConfirmedBooking {
  id: string;
  clinicianName: string;
  clinicianTitle: string;
  date: string;
  time: string;
  kind: string;
  durationMin: number;
  mode: string;
  amount: number; // 0 = fee confirmed at booking
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function ConfirmationStep({
  booking,
  onBookAnother,
}: {
  booking: ConfirmedBooking;
  onBookAnother: () => void;
}) {
  const handleCalendar = () => {
    downloadICS(
      `mindcarter-session-${booking.date}.ics`,
      buildSessionICS({
        clinicianName: booking.clinicianName,
        dateISO: booking.date,
        time: booking.time,
        durationMin: booking.durationMin,
        kind: booking.kind,
        mode: booking.mode,
      }),
    );
  };

  return (
    <div className="mx-auto max-w-md text-center">
      <motion.span
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <Check className="h-8 w-8 text-brand-foreground" strokeWidth={3} />
      </motion.span>
      <motion.h2
        tabIndex={-1}
        className="font-display mt-5 text-3xl font-black tracking-tight outline-none"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }}
      >
        You're booked.
      </motion.h2>
      <motion.p
        className="mt-2 text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT }}
      >
        A confirmation is waiting in your notifications, and the session now appears under Sessions.
      </motion.p>

      <motion.div
        className="mt-6 rounded-2xl border border-border bg-background p-6 text-left shadow-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT }}
      >
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <GradientAvatar name={booking.clinicianName} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-bold">{booking.clinicianName}</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {booking.clinicianTitle}
            </p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-right font-semibold">{formatLongDate(booking.date)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Time</dt>
            <dd className="font-semibold">{booking.time}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="font-semibold">
              {booking.kind} · {booking.durationMin} min
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Mode</dt>
            <dd className="font-semibold">{booking.mode}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-2">
            <dt className="text-muted-foreground">Amount paid</dt>
            <dd className="font-black">
              {booking.amount > 0 ? formatINR(booking.amount) : "Confirmed at booking"}
            </dd>
          </div>
        </dl>
      </motion.div>

      <motion.div
        className="mt-6 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: EASE_OUT }}
      >
        <button
          onClick={handleCalendar}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:translate-y-0 active:scale-95"
        >
          <CalendarPlus className="h-4 w-4" /> Add to calendar
        </button>
        <Link
          to="/employee/sessions"
          className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
        >
          View my sessions
        </Link>
        <button
          onClick={onBookAnother}
          className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:translate-y-0 active:scale-95"
        >
          Book another
        </button>
      </motion.div>
    </div>
  );
}
