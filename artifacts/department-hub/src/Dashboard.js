import React from "react";
import "./styles.css";

export default function Dashboard({ user }) {
  return (
    <div className="dashboard-root">
      <div className="clay-card dashboard-card">
        <h1>Welcome, {user?.name || "User"}</h1>
        <p className="dashboard-role">Role: {user?.role || "Unknown"}</p>
        <div className="dashboard-grid">
          <div className="dashboard-tile">
            <h2>Weekly Events</h2>
            <p>Track seminars, hackathons, and deadlines.</p>
          </div>
          <div className="dashboard-tile">
            <h2>Progress Metrics</h2>
            <p>Review attendance, participation, and department health.</p>
          </div>
          <div className="dashboard-tile">
            <h2>AI Insights</h2>
            <p>Generate summaries and receive data-driven recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
