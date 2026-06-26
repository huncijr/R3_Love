CREATE TABLE "CalendarQuiz" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"has_partner" boolean NOT NULL,
	"dating_date" varchar(50),
	"partner_birthday" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "password" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "CalendarQuiz" ADD CONSTRAINT "CalendarQuiz_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;