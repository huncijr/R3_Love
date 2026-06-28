import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const user = pgTable("Users", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export type User = typeof user.$inferSelect;
export type newUser = typeof user.$inferInsert;

export type CalendarQuiz = typeof calendarQuiz.$inferSelect;
export type NewCalendarQuiz = typeof calendarQuiz.$inferInsert;
