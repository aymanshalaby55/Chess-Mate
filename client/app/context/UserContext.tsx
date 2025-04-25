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
      // Instead of making an AJAX request, redirect the browser to the Google OAuth endpoint
      window.location.href = "http://localhost:4040/api/auth/google";
      // Note: The function will not continue past this point as the page is redirected
    } catch (error) {
      console.error("Login Error:", error);
      toast("Failed to redirect to authentication page");
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

  // Add a function to handle the callback from Google OAuth
  useEffect(() => {
    // Check if this is a callback from Google OAuth
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const userData = urlParams.get("user");
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userData));
          setUser(parsedUser);
          localStorage.setItem("user", JSON.stringify({
            ...parsedUser,
            token
          }));
          // Clear the URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error("Failed to parse user data from callback", error);
        } finally {
          setLoading(false);
        }
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