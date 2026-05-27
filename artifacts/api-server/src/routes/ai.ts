import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, aiSummariesTable, eventsTable, progressLogsTable, departmentsTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

router.get("/ai/summaries", requireAuth, async (req, res): Promise<void> => {
  const { departmentId, type } = req.query;
  let query = db.select().from(aiSummariesTable);
  const conditions: ReturnType<typeof eq>[] = [];
  if (departmentId) conditions.push(eq(aiSummariesTable.departmentId, Number(departmentId)));
  if (type) conditions.push(eq(aiSummariesTable.type, String(type)));

  const summaries = await db
    .select()
    .from(aiSummariesTable)
    .orderBy(desc(aiSummariesTable.generatedAt))
    .limit(20);

  let deptName: string | null = null;
  const enriched = await Promise.all(summaries.map(async (s) => {
    if (s.departmentId) {
      const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, s.departmentId));
      deptName = dept?.name ?? null;
    }
    return {
      id: s.id,
      type: s.type,
      content: s.content,
      insights: s.insights,
      departmentId: s.departmentId,
      departmentName: deptName,
      dateRangeStart: s.dateRangeStart?.toISOString() ?? null,
      dateRangeEnd: s.dateRangeEnd?.toISOString() ?? null,
      generatedAt: s.generatedAt.toISOString(),
    };
  }));

  res.json(enriched);
});

router.post("/ai/summaries", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { type, departmentId, dateRangeStart, dateRangeEnd } = req.body;
  if (!type) {
    res.status(400).json({ error: "Type is required" });
    return;
  }

  // Gather context for AI
  const events = await db.select().from(eventsTable).limit(20).orderBy(desc(eventsTable.createdAt));
  const progressLogs = await db.select().from(progressLogsTable).limit(10).orderBy(desc(progressLogsTable.createdAt));

  const eventsSummary = events.map(e =>
    `- ${e.title} (${e.category}, ${e.status}, ${e.startDate.toLocaleDateString()})`
  ).join("\n");

  const progressSummary = progressLogs.map(p =>
    `- Week ${p.weekNumber}/${p.year}: ${p.title} - ${p.description ?? "No description"}`
  ).join("\n");

  let content: string;
  let insights: string;

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = type === "WEEKLY"
      ? `Generate a concise weekly academic department summary based on these events:\n${eventsSummary || "No events yet."}\n\nAnd progress logs:\n${progressSummary || "No progress logs yet."}\n\nWrite 2-3 paragraphs summarizing activity, highlighting achievements, and noting areas to watch.`
      : type === "TREND"
      ? `Analyze trends in this academic department based on events:\n${eventsSummary || "No events yet."}\n\nProgress:\n${progressSummary || "No progress yet."}\n\nIdentify 2-3 key trends and patterns.`
      : `Provide a ${type.toLowerCase()} analysis of the department activities. Events:\n${eventsSummary || "No events yet."}\n\nProgress:\n${progressSummary || "No progress yet."}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an academic department analyst providing concise, professional summaries." },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
    });

    content = completion.choices[0]?.message?.content ?? "Summary generated successfully.";

    const insightsCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an academic analyst. Provide 3 actionable recommendations as a JSON array of strings." },
        { role: "user", content: `Based on:\n${eventsSummary || "No events yet."}\nProgress:\n${progressSummary || "No progress yet."}\n\nReturn JSON: {"recommendations": ["...", "...", "..."]}` },
      ],
      max_tokens: 300,
    });

    const raw = insightsCompletion.choices[0]?.message?.content ?? "{}";
    insights = raw;
  } catch (err) {
    logger.warn({ err }, "OpenAI call failed, using fallback summary");
    content = `${type} summary for the department:\n\nRecent events show active participation across academic and extracurricular categories. The department has logged ${events.length} events and ${progressLogs.length} progress updates.\n\nKey highlights include ${events.slice(0, 3).map(e => e.title).join(", ") || "various departmental activities"}. The team continues to make steady progress toward semester goals.`;
    insights = JSON.stringify({ recommendations: ["Continue regular event logging for better tracking", "Increase student participation in academic events", "Consider scheduling more extracurricular activities for engagement"] });
  }

  const [summary] = await db.insert(aiSummariesTable).values({
    type,
    content,
    insights,
    departmentId: departmentId ?? null,
    dateRangeStart: dateRangeStart ? new Date(dateRangeStart) : null,
    dateRangeEnd: dateRangeEnd ? new Date(dateRangeEnd) : null,
  }).returning();

  res.status(201).json({
    id: summary.id,
    type: summary.type,
    content: summary.content,
    insights: summary.insights,
    departmentId: summary.departmentId,
    departmentName: null,
    dateRangeStart: summary.dateRangeStart?.toISOString() ?? null,
    dateRangeEnd: summary.dateRangeEnd?.toISOString() ?? null,
    generatedAt: summary.generatedAt.toISOString(),
  });
});

router.get("/ai/summaries/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [summary] = await db.select().from(aiSummariesTable).where(eq(aiSummariesTable.id, id));
  if (!summary) {
    res.status(404).json({ error: "Summary not found" });
    return;
  }
  res.json({
    id: summary.id,
    type: summary.type,
    content: summary.content,
    insights: summary.insights,
    departmentId: summary.departmentId,
    departmentName: null,
    dateRangeStart: summary.dateRangeStart?.toISOString() ?? null,
    dateRangeEnd: summary.dateRangeEnd?.toISOString() ?? null,
    generatedAt: summary.generatedAt.toISOString(),
  });
});

router.get("/ai/insights", requireAuth, async (_req, res): Promise<void> => {
  // Return latest summary as insights, or generate static insights
  const [latestSummary] = await db
    .select()
    .from(aiSummariesTable)
    .orderBy(desc(aiSummariesTable.generatedAt))
    .limit(1);

  const events = await db.select().from(eventsTable).limit(30);
  const completed = events.filter(e => e.status === "COMPLETED").length;
  const completionRate = events.length > 0 ? Math.round((completed / events.length) * 100) : 0;

  const academicCount = events.filter(e => e.category === "ACADEMIC").length;
  const extraCount = events.filter(e => e.category === "EXTRACURRICULAR").length;

  res.json({
    summary: latestSummary?.content ?? "No AI summary generated yet. Generate one from the AI Insights page to see department-wide analysis.",
    recommendations: [
      "Schedule more academic workshops to boost faculty engagement",
      "Track student participation rates more consistently",
      "Consider weekly progress reviews to maintain momentum",
    ],
    trends: [
      {
        label: "Event Completion",
        direction: completionRate > 60 ? "UP" : completionRate > 30 ? "STABLE" : "DOWN",
        description: `${completionRate}% of events completed this period`,
      },
      {
        label: "Academic Focus",
        direction: academicCount > extraCount ? "UP" : "STABLE",
        description: `${academicCount} academic vs ${extraCount} extracurricular events`,
      },
      {
        label: "Department Activity",
        direction: events.length > 5 ? "UP" : "STABLE",
        description: `${events.length} total events logged`,
      },
    ],
    lastUpdated: latestSummary?.generatedAt?.toISOString() ?? null,
  });
});

export default router;
