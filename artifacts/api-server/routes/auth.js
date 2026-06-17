const express = require("express");
const router = express.Router();

const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@department.edu",
    password: "admin123",
    role: "ADMIN",
  },
  {
    id: 2,
    name: "Faculty User",
    email: "faculty@department.edu",
    password: "faculty123",
    role: "FACULTY",
  },
  {
    id: 3,
    name: "Student User",
    email: "student@department.edu",
    password: "student123",
    role: "STUDENT",
  },
];

function createToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    issuedAt: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function parseToken(token) {
  try {
    const json = Buffer.from(token, "base64").toString("utf8");
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password are required." });
  }

  const user = users.find(
    (item) => item.email === email && item.password === password,
  );
  if (!user) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid email or password." });
  }

  const token = createToken(user);
  return res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const payload = parseToken(token);

  if (!payload) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid or missing token." });
  }

  return res.json({
    success: true,
    user: {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    },
  });
});

module.exports = router;
