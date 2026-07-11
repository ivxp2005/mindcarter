CREATE TYPE "public"."booking_mode" AS ENUM('video', 'in_person', 'phone');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('scheduled', 'completed', 'canceled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."diary_status" AS ENUM('pending_review', 'reviewed');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('meeting', 'diary', 'message', 'system');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('patient', 'psychologist', 'admin');--> statement-breakpoint
CREATE TYPE "public"."session_kind" AS ENUM('individual_therapy', 'group_coaching', 'assessment_review', 'executive_coaching', 'intake');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'pending');--> statement-breakpoint
CREATE TYPE "public"."weekday" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE "availability_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"psychologist_id" uuid NOT NULL,
	"day_of_week" "weekday" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid,
	"psychologist_id" uuid NOT NULL,
	"group_label" varchar(255),
	"scheduled_date" date NOT NULL,
	"scheduled_time" time NOT NULL,
	"duration_minutes" integer NOT NULL,
	"session_kind" "session_kind" NOT NULL,
	"mode" "booking_mode" NOT NULL,
	"status" "booking_status" DEFAULT 'scheduled' NOT NULL,
	"amount" numeric(10, 2),
	"notes" text,
	"video_room_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diary_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" "diary_status" DEFAULT 'pending_review' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content" text NOT NULL,
	"clinician_note" text
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"action_url" text,
	"action_params" jsonb
);
--> statement-breakpoint
CREATE TABLE "patient_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"primary_concern" text,
	"tags" text[],
	"total_sessions" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psychologist_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"license_number" varchar(100),
	"specialties" text[],
	"bio" text,
	"years_experience" integer
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text,
	"ip" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(32),
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_psychologist_id_psychologist_profiles_user_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologist_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_psychologist_id_users_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD CONSTRAINT "psychologist_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;