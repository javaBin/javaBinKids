CREATE TABLE IF NOT EXISTS "submissions" (
	"submissionId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arrangementId" uuid NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"equipmentRequirements" text,
	"ageMin" integer NOT NULL,
	"ageMax" integer NOT NULL,
	"maxParticipants" integer NOT NULL,
	"speakerName" text NOT NULL,
	"speakerEmail" text NOT NULL,
	"speakerBio" text NOT NULL,
	"editToken" uuid DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "submissions" ADD CONSTRAINT "submissions_arrangementId_events_arrangementId_fk" FOREIGN KEY ("arrangementId") REFERENCES "events"("arrangementId") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "events" ADD COLUMN "openForSubmissions" boolean DEFAULT false NOT NULL;
ALTER TABLE "events" ADD COLUMN "submissionDeadline" timestamp;
