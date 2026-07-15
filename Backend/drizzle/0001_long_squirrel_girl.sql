ALTER TABLE "Users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Users" ADD COLUMN "verification_code" varchar(6);--> statement-breakpoint
ALTER TABLE "Users" ADD COLUMN "verification_code_expiry" timestamp;