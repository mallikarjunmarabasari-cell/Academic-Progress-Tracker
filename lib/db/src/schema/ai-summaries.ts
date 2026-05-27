import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiSummariesTable = pgTable("ai_summaries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("WEEKLY"), // WEEKLY, MONTHLY, PROGRESS, TREND
  content: text("content").notNull(),
  insights: text("insights"), // JSON string
  departmentId: integer("department_id"),
  dateRangeStart: timestamp("date_range_start", { withTimezone: true }),
  dateRangeEnd: timestamp("date_range_end", { withTimezone: true }),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAiSummarySchema = createInsertSchema(aiSummariesTable).omit({ id: true, generatedAt: true });
export type InsertAiSummary = z.infer<typeof insertAiSummarySchema>;
export type AiSummary = typeof aiSummariesTable.$inferSelect;
