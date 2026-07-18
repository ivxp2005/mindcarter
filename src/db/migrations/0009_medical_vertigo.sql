ALTER TABLE "bookings" ADD COLUMN "meet_link" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "google_calendar_event_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "refund_status" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "canceled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "google_calendar_access_token" text;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "google_calendar_refresh_token" text;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "google_calendar_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "google_calendar_connected" boolean DEFAULT false NOT NULL;