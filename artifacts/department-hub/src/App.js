import React, { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./styles.css";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("dept-token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:4000/api/me", {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.success) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          window.localStorage.removeItem("dept-token");
        }
      })
      .catch(() => {
        window.localStorage.removeItem("dept-token");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLoginSuccess = (user, token) => {
    setUser(user);
    setToken(token);
    window.localStorage.setItem("dept-token", token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem("dept-token");
  };

  if (loading) {
    return <div className="loading-screen">Checking login...</div>;
  }

  return (
    <div className="app-root">
      {user ? (
        <>
          <button className="logout-button" onClick={handleLogout}>
            Log out
          </button>
          <Dashboard user={user} />
        </>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
