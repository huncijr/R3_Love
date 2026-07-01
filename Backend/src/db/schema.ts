import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// Users table: stores authentication and progress data
export const user = pgTable("Users", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 50 }),
  calendarDone: boolean("calendar_done").default(false),
  giftDone: boolean("gift_done").default(false),
  gameDone: boolean("game_done").default(false),

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
