import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("auth_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("auth_token");
  });

  useEffect(() => {
    // Configure custom-fetch to use our token
    setAuthTokenGetter(() => {
      return localStorage.getItem("auth_token");
    });
  }, []);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    localStorage.setItem("auth_token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
