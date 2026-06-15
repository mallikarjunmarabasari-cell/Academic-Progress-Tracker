import React, { useState } from "react";
import "./styles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    alert(`This demo would POST to /api/login with ${email}`);
  };

  return (
    <div className="clay-card login-card">
      <h2>DeptSync Login</h2>
      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="clay-btn" type="submit">
          Sign In
        </button>
      </form>
    </div>
  );
}
