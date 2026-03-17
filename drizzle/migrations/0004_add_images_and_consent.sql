CREATE TABLE "images" (
	"imageId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"mimeType" text NOT NULL,
	"data" bytea NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "consentGiven" boolean DEFAULT false NOT NULL;
