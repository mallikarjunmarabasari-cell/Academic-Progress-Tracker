import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("ACADEMIC"), // ACADEMIC, EXTRACURRICULAR, ADMINISTRATIVE
  status: text("status").notNull().default("PLANNED"), // PLANNED, ONGOING, COMPLETED, CANCELLED
  priority: text("priority").notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  location: text("location"),
  createdById: integer("created_by_id").notNull(),
  departmentId: integer("department_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
