import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const progressLogsTable = pgTable("progress_logs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  weekNumber: integer("week_number").notNull(),
  year: integer("year").notNull(),
  metrics: text("metrics"), // JSON string
  createdById: integer("created_by_id").notNull(),
  departmentId: integer("department_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProgressLogSchema = createInsertSchema(progressLogsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProgressLog = z.infer<typeof insertProgressLogSchema>;
export type ProgressLog = typeof progressLogsTable.$inferSelect;
