import { Router } from "express";
import { eq, and, gte, lte, sql, count } from "drizzle-orm";
import { db, eventsTable, usersTable, departmentsTable } from "@workspace/db";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

async function enrichEvent(event: typeof eventsTable.$inferSelect) {
  let createdByName: string | null = null;
  let departmentName: string | null = null;

  if (event.createdById) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, event.createdById));
    if (user) createdByName = `${user.firstName} ${user.lastName}`;
  }
  if (event.departmentId) {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, event.departmentId));
    if (dept) departmentName = dept.name;
  }

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    status: event.status,
    priority: event.priority,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() ?? null,
    location: event.location,
    createdById: event.createdById,
    createdByName,
    departmentId: event.departmentId,
    departmentName,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt?.toISOString() ?? null,
  };
}

router.get("/events/upcoming", requireAuth, async (_req, res): Promise<void> => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const events = await db
    .select()
    .from(eventsTable)
    .where(and(gte(eventsTable.startDate, now), lte(eventsTable.startDate, nextWeek)))
    .orderBy(eventsTable.startDate)
    .limit(10);
  const enriched = await Promise.all(events.map(enrichEvent));
  res.json(enriched);
});

router.get("/events/stats", requireAuth, async (_req, res): Promise<void> => {
  const allEvents = await db.select().from(eventsTable);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let thisWeek = 0;
  let thisMonth = 0;

  for (const e of allEvents) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
    byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
    if (e.startDate >= weekStart) thisWeek++;
    if (e.startDate >= monthStart) thisMonth++;
  }

  res.json({
    total: allEvents.length,
    thisWeek,
    thisMonth,
    byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
  });
});

router.get("/events", requireAuth, async (req, res): Promise<void> => {
  const { category, status, departmentId, week, year } = req.query;
  
  let query = db.select().from(eventsTable);
  const conditions = [];
  
  if (category) conditions.push(eq(eventsTable.category, String(category)));
  if (status) conditions.push(eq(eventsTable.status, String(status)));
  if (departmentId) conditions.push(eq(eventsTable.departmentId, Number(departmentId)));
  
  const events = await db
    .select()
    .from(eventsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(eventsTable.startDate);

  const enriched = await Promise.all(events.map(enrichEvent));
  res.json(enriched);
});

router.post("/events", requireAuth, requireRole("ADMIN", "FACULTY"), async (req: AuthenticatedRequest, res): Promise<void> => {
  const { title, description, category, status, priority, startDate, endDate, location, departmentId } = req.body;
  if (!title || !category || !status || !priority || !startDate) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [event] = await db.insert(eventsTable).values({
    title,
    description: description ?? null,
    category,
    status,
    priority,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    location: location ?? null,
    createdById: req.userId!,
    departmentId: departmentId ?? null,
  }).returning();

  const enriched = await enrichEvent(event);
  res.status(201).json(enriched);
});

router.get("/events/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const enriched = await enrichEvent(event);
  res.json(enriched);
});

router.patch("/events/:id", requireAuth, requireRole("ADMIN", "FACULTY"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { title, description, category, status, priority, startDate, endDate, location } = req.body;

  const updates: Partial<typeof eventsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;
  if (startDate !== undefined) updates.startDate = new Date(startDate);
  if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null;
  if (location !== undefined) updates.location = location;

  const [event] = await db.update(eventsTable).set(updates).where(eq(eventsTable.id, id)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const enriched = await enrichEvent(event);
  res.json(enriched);
});

router.delete("/events/:id", requireAuth, requireRole("ADMIN", "FACULTY"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [deleted] = await db.delete(eventsTable).where(eq(eventsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
