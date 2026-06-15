# Academic-Progress-Tracker

📄 Product Requirements Document (PRD)Project Name: DeptSync (or your chosen name)Objective: A centralized platform for university departments to log weekly events, track academic and extracurricular progress, and utilize AI for automated summaries and progress analysis. Major administrative controls are restricted to faculty.👥 Target Audience & AuthenticationFaculty/Management: Full administrative control. Can create events, log department progress, and generate AI reports.Students: Read-only access to weekly event wraps, personal/departmental progress metrics, and AI-generated summaries.Authentication: Role-Based Access Control (RBAC) via JWT (JSON Web Tokens) or OAuth (Google Workspace for Education).🚀 Core Features & CapabilitiesWeekly Event Wrap-Up: A unified feed displaying seminars, hackathons, and deadlines.Faculty Control Panel: A secure dashboard to manage users, events, and progress metrics.AI Progress Analyzer: Evaluates departmental metrics (attendance, grades, event participation) and generates actionable insights.AI Weekly Summaries: Automatically compiles the week's logs into a digestible newsletter format for students.📊 Analytics & LearningDepartment Health Score: A calculated metric based on weekly engagement.Trend Visualization: Graphs showing event attendance and overall student performance over the semester.AI Predictive Insights: Flags potential drops in student engagement based on historical data.🎨 Design Document: Claymorphism UIThe UI will employ Claymorphism to ensure the platform feels approachable, soft, and modern—reducing the stress often associated with academic management tools.Color Palette:Background: Off-white/Soft pearl (#F7F9FB)Primary Accent: Mint Green (#A8E6CF)Secondary Accent: Baby Blue (#D0E1F9)Highlight: Soft Lavender (#E2D4F0)Text: Dark Slate (#4A4E69) for readability without harsh blacks.Visual Elements:Border Radius: 16px to 24px (highly rounded).Shadows (The Clay Effect): A combination of soft outer drop shadows for elevation and dual inner shadows (one light, one dark) to create a 3D, "puffy" or inflated look.Typography: Rounded, geometric sans-serif (e.g., Nunito or Quicksand).🏗️ Technical Architecture & Tech StackComponentTechnologyRationaleFrontendReact.js + Tailwind CSSComponent-based, easy to style the complex claymorphism shadows using custom Tailwind utilities.BackendNode.js + Express.jsFast, scalable, and shares JavaScript syntax with the frontend.DatabasePostgreSQL + Prisma ORMRelational data structure is perfect for tying users, roles, and events together securely.AI IntegrationOpenAI API / Gemini APIFor natural language processing (Summaries and Progress Analysis).AuthenticationJSON Web Tokens (JWT)Stateless, scalable authentication ideal for role-based routing.DeploymentVercel (Front) + Render (Back)Seamless CI/CD pipelines, perfect for academic projects and scalable for production.📊 Data Architecture & ERD SchemaHere is the core relational structure needed to support your application.User: id, name, email, password_hash, role (ENUM: STUDENT, FACULTY), department_id.Department: id, name, head_faculty_id.Event: id, title, description, date, department_id, created_by_faculty_id.ProgressRecord: id, department_id, metric_name (e.g., 'Attendance', 'Avg Grade'), value, week_number, year.AISummary: id, department_id, week_number, generated_text, created_at.💻 Core Code ImplementationHere is the foundational code to implement the Claymorphism UI, the Login flow, and the AI Progress Analyzer.1. CSS/Tailwind Setup for Claymorphism (styles.css)To get that soft, squeezable look, we define a custom CSS class that you can apply to your React components.CSS/* Core Claymorphism Utility */
.clay-card {
  background-color: #D0E1F9; /* Baby Blue base */
  border-radius: 20px;
  /* Outer shadow for depth, Inner light for highlight, Inner dark for 3D volume */
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.4), 
    -8px -8px 16px rgba(255, 255, 255, 0.8),
    inset 4px 4px 8px rgba(255, 255, 255, 0.6),
    inset -4px -4px 8px rgba(163, 177, 198, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clay-card:hover {
  transform: scale(1.02);
}

.clay-btn {
  background-color: #A8E6CF; /* Mint Green */
  border-radius: 16px;
  border: none;
  font-weight: bold;
  color: #4A4E69;
  box-shadow: 
    4px 4px 10px rgba(163, 177, 198, 0.5), 
    -4px -4px 10px rgba(255, 255, 255, 0.9),
    inset 2px 2px 5px rgba(255, 255, 255, 0.5),
    inset -2px -2px 5px rgba(163, 177, 198, 0.3);
  cursor: pointer;
}

.clay-btn:active {
  /* Flattens the button when clicked */
  box-shadow: 
    inset 4px 4px 8px rgba(163, 177, 198, 0.5),
    inset -4px -4px 8px rgba(255, 255, 255, 0.8);
}
2. Frontend: React Login ComponentThis component enforces the visual style while handling authentication.JavaScriptimport React, { useState } from 'react';
import './styles.css'; // Importing our clay utilities

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    // In production, this posts to your Node.js backend
    console.log("Logging in with:", email, password);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center font-sans">
      <form onSubmit={handleLogin} className="clay-card p-10 w-96 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#4A4E69] text-center mb-4">DeptSync Login</h2>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#4A4E69] font-semibold">Email</label>
          <input 
            type="email" 
            className="p-3 rounded-2xl bg-[#F7F9FB] border-none outline-none text-[#4A4E69] shadow-inner"
            style={{ boxShadow: 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff' }}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#4A4E69] font-semibold">Password</label>
          <input 
            type="password" 
            className="p-3 rounded-2xl bg-[#F7F9FB] border-none outline-none text-[#4A4E69]"
            style={{ boxShadow: 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff' }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="clay-btn py-3 mt-4 text-lg">
          Sign In
        </button>
      </form>
    </div>
  );
}
3. Backend: Node.js/Express AI Progress Analyzer RouteThis is the core logic where the Faculty triggers an AI analysis of the department's week.JavaScriptconst express = require('express');
const axios = require('axios'); // For calling the AI API
const router = express.Router();

// Middleware to verify Faculty JWT goes here...

router.post('/api/analyze-progress', async (req, res) => {
  try {
    const { departmentId, weekData } = req.body;
    
    // Constructing the prompt for the AI
    const aiPrompt = `
      You are an expert academic department analyst. 
      Review the following weekly data for department ID ${departmentId}:
      Events held: ${weekData.eventCount}
      Average Student Attendance: ${weekData.attendanceRate}%
      Pending Deadlines: ${weekData.deadlines}
      
      Generate a brief, actionable 3-bullet summary of the department's progress 
      and one suggestion for improving engagement next week.
    `;

    // Example using OpenAI API (replace with your preferred LLM provider)
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4",
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.7
    }, {
      headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` }
    });

    const aiAnalysis = response.data.choices[0].message.content;

    // In a full app, you would save this to PostgreSQL via Prisma here
    
    res.status(200).json({ 
      success: true, 
      analysis: aiAnalysis 
    });

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    res.status(500).json({ error: "Failed to generate progress analysis." });
  }
});

module.exports = router;


## Workspace Quick Start

This repository is a pnpm workspace. The working applications live under `artifacts/`:

- `artifacts/api-server` — Express backend (dev port: 4000)
- `artifacts/department-hub` — React frontend (Create React App)

1. Install pnpm (if needed):

```powershell
npm install -g pnpm
```

2. Install workspace dependencies (run from the nested workspace root):

```powershell
cd Academic-Progress-Tracker
pnpm install
```

3. Run both apps in development (runs backend + frontend):

```powershell
pnpm run dev
```

4. Or run packages individually in separate terminals:

```powershell
pnpm --filter ./artifacts/api-server run dev      # backend (nodemon)
pnpm --filter ./artifacts/department-hub run start # frontend (CRA)
```

5. Build frontend for production:

```powershell
pnpm --filter ./artifacts/department-hub run build
```

6. Run backend in production mode:

```powershell
pnpm --filter ./artifacts/api-server run start
# or: node artifacts/api-server/server.js
```

Notes:
- See `artifacts/api-server/.env.example` for required env variables (e.g. `AI_API_KEY`, `PORT`, `DATABASE_URL`, `SESSION_SECRET`).
- Backend default port: `4000`.
- Frontend build output: `artifacts/department-hub/build`.

Treat `Academic-Progress-Tracker` as the canonical project root going forward.
