const express = require('express');
const router = express.Router();

let events = [
  {
    id: 1,
    title: 'Intro to AI Workshop',
    date: '2026-06-01',
    department: 'Computer Science',
    attendance: 120
  },
  {
    id: 2,
    title: 'Hackathon',
    date: '2026-06-08',
    department: 'Computer Science',
    attendance: 300
  }
];

let nextId = 3;

router.get('/events', (req, res) => {
  res.json({ success: true, events });
});

router.post('/events', (req, res) => {
  const { title, date, department, attendance } = req.body || {};
  if (!title || !date) return res.status(400).json({ success: false, error: 'title and date are required' });

  const ev = { id: nextId++, title, date, department: department || 'General', attendance: attendance || 0 };
  events.push(ev);
  res.json({ success: true, event: ev });
});

module.exports = router;
