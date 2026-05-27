import { Router } from "express";
import { desc, count, gte } from "drizzle-orm";
import { db, eventsTable, progressLogsTable, usersTable, departmentsTable, aiSummariesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/dashboard/stats", requireAuth, async (_req, res): Promise<void> => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [allEvents, allProgress, allUsers, allDepts, allSummaries] = await Promise.all([
    db.select().from(eventsTable),
    db.select().from(progressLogsTable),
    db.select().from(usersTable),
    db.select().from(departmentsTable),
    db.select().from(aiSummariesTable),
  ]);

  const eventsThisWeek = allEvents.filter(e => e.startDate >= weekStart).length;
  const upcomingEvents = allEvents.filter(e => e.startDate >= now && e.startDate <= nextWeek).length;
  const completedEvents = allEvents.filter(e => e.status === "COMPLETED").length;
  const completionRate = allEvents.length > 0 ? Math.round((completedEvents / allEvents.length) * 100) : 0;
  const activeStudents = allUsers.filter(u => u.role === "STUDENT" && u.isActive).length;

  res.json({
    totalEvents: allEvents.length,
    eventsThisWeek,
    totalProgressLogs: allProgress.length,
    activeStudents,
    completionRate,
    totalDepartments: allDepts.length,
    upcomingEvents,
    recentAiSummaries: allSummaries.length,
  });
});

router.get("/dashboard/activity", requireAuth, async (_req, res): Promise<void> => {
  const [recentEvents, recentProgress, recentSummaries] = await Promise.all([
    db.select().from(eventsTable).orderBy(desc(eventsTable.createdAt)).limit(5),
    db.select().from(progressLogsTable).orderBy(desc(progressLogsTable.createdAt)).limit(3),
    db.select().from(aiSummariesTable).orderBy(desc(aiSummariesTable.generatedAt)).limit(2),
  ]);

  const items: {
    id: number;
    type: string;
    title: string;
    description: string;
    userName: string | null;
    createdAt: string;
  }[] = [];

  for (const e of recentEvents) {
    let userName: string | null = null;
    if (e.createdById) {
      const [user] = await db.select().from(usersTable).where(
        (await import("drizzle-orm")).eq(usersTable.id, e.createdById)
      );
      if (user) userName = `${user.firstName} ${user.lastName}`;
    }
    items.push({
      id: e.id,
      type: "EVENT_CREATED",
      title: `New event: ${e.title}`,
      description: `${e.category} event scheduled for ${e.startDate.toLocaleDateString()}`,
      userName,
      createdAt: e.createdAt.toISOString(),
    });
  }

  for (const p of recentProgress) {
    items.push({
      id: p.id + 1000,
      type: "PROGRESS_LOGGED",
      title: `Progress logged: ${p.title}`,
      description: `Week ${p.weekNumber}, ${p.year}`,
      userName: null,
      createdAt: p.createdAt.toISOString(),
    });
  }

  for (const s of recentSummaries) {
    items.push({
      id: s.id + 2000,
      type: "AI_SUMMARY_GENERATED",
      title: `AI summary generated`,
      description: `${s.type} analysis completed`,
      userName: null,
      createdAt: s.generatedAt.toISOString(),
    });
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(items.slice(0, 10));
});

export default router;
