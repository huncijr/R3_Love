CREATE TABLE "Users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255),
	"partner_name" varchar(255),
	"gender" varchar(50),
	"is_single" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
