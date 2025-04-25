"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const login = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/auth/google");
      setUser(data);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast("Email or Password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post("/auth/logout");
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, login, loading, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, useUserContext };