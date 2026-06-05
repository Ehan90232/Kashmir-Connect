import { pgTable, text, serial, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobRequestStatusEnum = pgEnum("job_request_status", ["open", "assigned", "closed"]);

export const jobRequestsTable = pgTable("job_requests", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  area: text("area").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  budget: text("budget"),
  status: jobRequestStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJobRequestSchema = createInsertSchema(jobRequestsTable).omit({
  id: true,
  status: true,
  createdAt: true,
});
export type InsertJobRequest = z.infer<typeof insertJobRequestSchema>;
export type JobRequest = typeof jobRequestsTable.$inferSelect;
