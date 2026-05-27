import { Router } from "express";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable, departmentsTable } from "@workspace/db";
import { signToken } from "../lib/jwt";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "departmenthub_salt").digest("hex");
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!user.isActive) {
    res.status(401).json({ error: "Account is inactive" });
    return;
  }

  await db.update(usersTable).set({ lastLogin: new Date() }).where(eq(usersTable.id, user.id));

  const token = signToken({ userId: user.id, role: user.role });

  let departmentName: string | null = null;
  if (user.departmentId) {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId));
    departmentName = dept?.name ?? null;
  }

  res.json({
    token,
    user: {
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
    },
  });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, firstName, lastName, role, departmentId } = req.body;
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
    role: role ?? "STUDENT",
    departmentId: departmentId ?? null,
    isActive: true,
  }).returning();

  const token = signToken({ userId: user.id, role: user.role });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: null,
      isActive: user.isActive,
      lastLogin: null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: null,
    },
  });
});

router.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  let departmentName: string | null = null;
  if (user.departmentId) {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId));
    departmentName = dept?.name ?? null;
  }

  res.json({
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
  });
});

export default router;
