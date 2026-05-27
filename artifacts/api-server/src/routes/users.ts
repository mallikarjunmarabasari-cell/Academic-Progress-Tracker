import { Router } from "express";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { db, usersTable, departmentsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "departmenthub_salt").digest("hex");
}

async function enrichUser(user: typeof usersTable.$inferSelect) {
  let departmentName: string | null = null;
  if (user.departmentId) {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId));
    departmentName = dept?.name ?? null;
  }
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    departmentId: user.departmentId,
    departmentName,
    isActive: user.isActive,
    lastLogin: user.lastLogin?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt?.toISOString() ?? null,
  };
}

router.get("/users", requireAuth, requireRole("ADMIN", "MANAGEMENT"), async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.firstName);
  const enriched = await Promise.all(users.map(enrichUser));
  res.json(enriched);
});

router.post("/users", requireAuth, requireRole("ADMIN"), async (_req, res): Promise<void> => {
  const { email, password, firstName, lastName, role, departmentId } = _req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    firstName,
    lastName,
    role,
    departmentId: departmentId ?? null,
    isActive: true,
  }).returning();

  const enriched = await enrichUser(user);
  res.status(201).json(enriched);
});

router.get("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const enriched = await enrichUser(user);
  res.json(enriched);
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { firstName, lastName, role, departmentId, isActive } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (role !== undefined) updates.role = role;
  if (departmentId !== undefined) updates.departmentId = departmentId;
  if (isActive !== undefined) updates.isActive = isActive;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const enriched = await enrichUser(user);
  res.json(enriched);
});

router.delete("/users/:id", requireAuth, requireRole("ADMIN"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
