ALTER TYPE "public"."session_kind" ADD VALUE 'follow_up';--> statement-breakpoint
CREATE TABLE "care_team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"psychologist_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "care_team_members_patient_psychologist_unique" UNIQUE("patient_id","psychologist_id")
);
--> statement-breakpoint
ALTER TABLE "diary_entries" ADD COLUMN "mood" integer;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "diary_entries" ADD COLUMN "entry_date" date DEFAULT CURRENT_DATE NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "emergency_contact_name" varchar(255);--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "emergency_contact_phone" varchar(32);--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "preferred_language" varchar(64);--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "notification_prefs" jsonb;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "rating" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "care_team_members" ADD CONSTRAINT "care_team_members_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_team_members" ADD CONSTRAINT "care_team_members_psychologist_id_users_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_mood_range" CHECK ("diary_entries"."mood" BETWEEN 1 AND 5);