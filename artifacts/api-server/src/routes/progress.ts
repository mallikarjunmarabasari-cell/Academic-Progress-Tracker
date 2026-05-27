import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, progressLogsTable, usersTable, departmentsTable } from "@workspace/db";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

async function enrichProgressLog(log: typeof progressLogsTable.$inferSelect) {
  let createdByName: string | null = null;
  let departmentName: string | null = null;

  if (log.createdById) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, log.createdById));
    if (user) createdByName = `${user.firstName} ${user.lastName}`;
  }
  if (log.departmentId) {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, log.departmentId));
    if (dept) departmentName = dept.name;
  }

  return {
    id: log.id,
    title: log.title,
    description: log.description,
    weekNumber: log.weekNumber,
    year: log.year,
    metrics: log.metrics,
    createdById: log.createdById,
    createdByName,
    departmentId: log.departmentId,
    departmentName,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt?.toISOString() ?? null,
  };
}

router.get("/progress/stats", requireAuth, async (_req, res): Promise<void> => {
  const allLogs = await db.select().from(progressLogsTable).orderBy(desc(progressLogsTable.createdAt));

  const weeklyMap: Map<string, number> = new Map();
  for (const log of allLogs) {
    const key = `${log.year}-${log.weekNumber}`;
    weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + 1);
  }

  const weeklyTrend = Array.from(weeklyMap.entries())
    .map(([key, count]) => {
      const [year, week] = key.split("-");
      return { week: parseInt(week), year: parseInt(year), count };
    })
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.week - b.week)
    .slice(-12);

  const recentLogs = await db
    .select()
    .from(progressLogsTable)
    .orderBy(desc(progressLogsTable.createdAt))
    .limit(5);

  const enriched = await Promise.all(recentLogs.map(enrichProgressLog));

  res.json({
    totalLogs: allLogs.length,
    weeklyTrend,
    recentWeeks: enriched,
  });
});

router.get("/progress", requireAuth, async (req, res): Promise<void> => {
  const { departmentId, year, week } = req.query;
  const conditions = [];

  if (departmentId) conditions.push(eq(progressLogsTable.departmentId, Number(departmentId)));
  if (year) conditions.push(eq(progressLogsTable.year, Number(year)));
  if (week) conditions.push(eq(progressLogsTable.weekNumber, Number(week)));

  const logs = await db
    .select()
    .from(progressLogsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(progressLogsTable.createdAt));

  const enriched = await Promise.all(logs.map(enrichProgressLog));
  res.json(enriched);
});

router.post("/progress", requireAuth, requireRole("ADMIN", "FACULTY"), async (req: AuthenticatedRequest, res): Promise<void> => {
  const { title, description, weekNumber, year, metrics, departmentId } = req.body;
  if (!title || weekNumber === undefined || year === undefined) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [log] = await db.insert(progressLogsTable).values({
    title,
    description: description ?? null,
    weekNumber: Number(weekNumber),
    year: Number(year),
    metrics: metrics ?? null,
    createdById: req.userId!,
    departmentId: departmentId ?? null,
  }).returning();

  const enriched = await enrichProgressLog(log);
  res.status(201).json(enriched);
});

router.get("/progress/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [log] = await db.select().from(progressLogsTable).where(eq(progressLogsTable.id, id));
  if (!log) {
    res.status(404).json({ error: "Progress log not found" });
    return;
  }
  const enriched = await enrichProgressLog(log);
  res.json(enriched);
});

router.patch("/progress/:id", requireAuth, requireRole("ADMIN", "FACULTY"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { title, description, metrics } = req.body;
  const updates: Partial<typeof progressLogsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (metrics !== undefined) updates.metrics = metrics;

  const [log] = await db.update(progressLogsTable).set(updates).where(eq(progressLogsTable.id, id)).returning();
  if (!log) {
    res.status(404).json({ error: "Progress log not found" });
    return;
  }
  const enriched = await enrichProgressLog(log);
  res.json(enriched);
});

router.delete("/progress/:id", requireAuth, requireRole("ADMIN", "FACULTY"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [deleted] = await db.delete(progressLogsTable).where(eq(progressLogsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Progress log not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
