import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db, departmentsTable, usersTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

async function enrichDepartment(dept: typeof departmentsTable.$inferSelect) {
  let headUserName: string | null = null;
  if (dept.headUserId) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dept.headUserId));
    if (user) headUserName = `${user.firstName} ${user.lastName}`;
  }

  const members = await db.select().from(usersTable).where(eq(usersTable.departmentId, dept.id));

  return {
    id: dept.id,
    name: dept.name,
    code: dept.code,
    headUserId: dept.headUserId,
    headUserName,
    memberCount: members.length,
    createdAt: dept.createdAt.toISOString(),
    updatedAt: dept.updatedAt?.toISOString() ?? null,
  };
}

router.get("/departments", requireAuth, async (_req, res): Promise<void> => {
  const depts = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
  const enriched = await Promise.all(depts.map(enrichDepartment));
  res.json(enriched);
});

router.post("/departments", requireAuth, requireRole("ADMIN"), async (_req, res): Promise<void> => {
  const { name, code, headUserId } = _req.body;
  if (!name || !code) {
    res.status(400).json({ error: "Name and code are required" });
    return;
  }

  const [dept] = await db.insert(departmentsTable).values({
    name,
    code: code.toUpperCase(),
    headUserId: headUserId ?? null,
  }).returning();

  const enriched = await enrichDepartment(dept);
  res.status(201).json(enriched);
});

router.get("/departments/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, id));
  if (!dept) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  const enriched = await enrichDepartment(dept);
  res.json(enriched);
});

router.patch("/departments/:id", requireAuth, requireRole("ADMIN"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, code, headUserId } = req.body;
  const updates: Partial<typeof departmentsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (code !== undefined) updates.code = code.toUpperCase();
  if (headUserId !== undefined) updates.headUserId = headUserId;

  const [dept] = await db.update(departmentsTable).set(updates).where(eq(departmentsTable.id, id)).returning();
  if (!dept) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  const enriched = await enrichDepartment(dept);
  res.json(enriched);
});

export default router;
