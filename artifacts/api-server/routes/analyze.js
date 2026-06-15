const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/analyze-progress", async (req, res) => {
  try {
    const { departmentId, weekData } = req.body;

    const aiPrompt = `You are an expert academic department analyst. Review the following weekly data for department ID ${departmentId}:\nEvents: ${weekData?.eventCount || 0}\nAttendance: ${weekData?.attendanceRate || 0}%\nDeadlines: ${weekData?.deadlines || "none"}\n\nProvide a 3-bullet summary and one suggestion.`;

    // Example placeholder response (replace with real AI call using API key in .env)
    const aiAnalysis = `- Attendance steady at ${weekData?.attendanceRate || 0}%.\n- ${weekData?.eventCount || 0} events held.\n- Pending deadlines: ${weekData?.deadlines || "none"}.\nSuggestion: Increase outreach for low-attendance events.`;

    // To call a real LLM, uncomment and use your provider's client with process.env.AI_API_KEY
    // const response = await axios.post('https://api.openai.com/v1/chat/completions', { ... });

    res.json({ success: true, analysis: aiAnalysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "AI analysis failed" });
  }
});

module.exports = router;
