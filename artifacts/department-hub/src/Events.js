import React, { useEffect, useState } from "react";

export default function Events({ token }) {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    department: "",
    attendance: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  function fetchEvents() {
    fetch("http://localhost:4000/api/events", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setEvents(j.events);
      })
      .catch(() => setError("Failed to load events"));
  }

  function submit(e) {
    e.preventDefault();
    setError("");
    fetch("http://localhost:4000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        attendance: Number(form.attendance || 0),
      }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setForm({ title: "", date: "", department: "", attendance: "" });
          fetchEvents();
        } else {
          setError(j.error || "Failed to save");
        }
      })
      .catch(() => setError("Failed to save"));
  }

  return (
    <div className="events">
      <h3>Events</h3>
      {error && <div className="error">{error}</div>}
      <ul>
        {events.map((ev) => (
          <li key={ev.id} className="event-item">
            <strong>{ev.title}</strong> — {ev.date} ({ev.department}) —{" "}
            {ev.attendance} attendees
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="event-form">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Date (YYYY-MM-DD)"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <input
          placeholder="Attendance"
          value={form.attendance}
          onChange={(e) => setForm({ ...form, attendance: e.target.value })}
        />
        <button type="submit">Add Event</button>
      </form>
    </div>
  );
}
