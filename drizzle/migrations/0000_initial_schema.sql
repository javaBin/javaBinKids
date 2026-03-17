CREATE TABLE "admin_users" (
	"adminUserId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"passwordHash" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"courseId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arrangementId" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"ageMin" integer NOT NULL,
	"ageMax" integer NOT NULL,
	"maxParticipants" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"arrangementId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp NOT NULL,
	"location" text NOT NULL,
	"cancelled" boolean DEFAULT false NOT NULL,
	"registrationOpens" timestamp NOT NULL,
	"registrationCloses" timestamp NOT NULL,
	"imageUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"registrationId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"courseId" uuid NOT NULL,
	"parentName" text NOT NULL,
	"parentEmail" text NOT NULL,
	"parentPhone" text NOT NULL,
	"childName" text NOT NULL,
	"childAge" integer NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"waitlistPosition" integer,
	"cancellationToken" uuid DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_courseId_parentEmail_childName_unique" UNIQUE("courseId","parentEmail","childName")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adminUserId" uuid NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_arrangementId_events_arrangementId_fk" FOREIGN KEY ("arrangementId") REFERENCES "public"."events"("arrangementId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_courseId_courses_courseId_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("courseId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_adminUserId_admin_users_adminUserId_fk" FOREIGN KEY ("adminUserId") REFERENCES "public"."admin_users"("adminUserId") ON DELETE no action ON UPDATE no action;