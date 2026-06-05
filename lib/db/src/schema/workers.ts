import { pgTable, text, serial, timestamp, boolean, real, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const membershipTypeEnum = pgEnum("membership_type", ["free", "premium", "premium_plus"]);

export const workersTable = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  photoUrl: text("photo_url"),
  profession: text("profession").notNull(),
  category: text("category").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  membershipType: membershipTypeEnum("membership_type").notNull().default("free"),
  averageRating: real("average_rating").notNull().default(0),
  totalRatings: integer("total_ratings").notNull().default(0),
  area: text("area"),
  isApproved: boolean("is_approved").notNull().default(false),
  bio: text("bio"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkerSchema = createInsertSchema(workersTable).omit({
  id: true,
  averageRating: true,
  totalRatings: true,
  createdAt: true,
});
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workersTable.$inferSelect;
