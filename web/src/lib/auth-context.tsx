"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, registerUser, User } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem("vita_token");
      if (storedToken) {
        try {
          const me = await getCurrentUser(storedToken);
          setUser(me);
          setToken(storedToken);
        } catch {
          localStorage.removeItem("vita_token");
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem("vita_token", res.access_token);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await registerUser(name, email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem("vita_token", res.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vita_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
