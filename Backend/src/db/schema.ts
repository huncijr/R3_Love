import { sql } from "drizzle-orm";
import { jsonb } from "drizzle-orm/pg-core";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  integer,
  text,
} from "drizzle-orm/pg-core";

// Users table: stores authentication and progress data
export const user = pgTable("Users", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  emailVerified: boolean("email_verified").default(false),
  verificationCode: varchar("verification_code", { length: 6 }),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  password: varchar("password", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 50 }),
  country: varchar("country", { length: 255 }),
  calendarDone: boolean("calendar_done").default(false),
  giftDone: boolean("gift_done").default(false),
  gameDone: boolean("game_done").default(false),
  spotifyAccessToken: text("spotifyAccessToken"),
  spotifyRefreshToken: text("spotifyRefreshToken"),
  sportifyTokenExpiry: timestamp("spotifyTokenExpiry"),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof user.$inferSelect;
export type newUser = typeof user.$inferInsert;

// Calendar quiz answers: relationship status, partner info and key dates
export const calendarQuiz = pgTable("CalendarQuiz", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isSingle: boolean("is_single").notNull(),
  partnerName: varchar("partner_name", { length: 255 }),
  datingDate: varchar("dating_date", { length: 50 }),
  partnerBirthday: varchar("partner_birthday", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CalendarQuiz = typeof calendarQuiz.$inferSelect;
export type NewCalendarQuiz = typeof calendarQuiz.$inferInsert;

// Custom calendar events created by users (anniversaries, reminders, etc.)
export const calendarEvents = pgTable("CalendarEvents", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  description: varchar("description", { length: 500 }),
  title: varchar("title", { length: 255 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  allDay: boolean("all_day").default(true),
  color: varchar("color", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CalendarEvents = typeof calendarEvents.$inferSelect;
export type NewCalendarEvents = typeof calendarEvents.$inferInsert;

export const giftRecommendations = pgTable("GiftRecommendations", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const giftUsage = pgTable("GiftUsage", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(),
  count: integer("count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GiftUsage = typeof giftUsage.$inferSelect;
export type NewGiftUsage = typeof giftUsage.$inferInsert;
