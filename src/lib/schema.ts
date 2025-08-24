import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  role: text("role").default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const allowedUsers = pgTable("allowed_users", {
  email: text("email").primaryKey(),
});
