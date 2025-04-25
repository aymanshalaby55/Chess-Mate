"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

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
      // Call the logout endpoint which will clear the cookie
      await api.post("/auth/logout");
      // Clear local user data
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
      // Redirect to home or login page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to load user from localStorage on startup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
          localStorage.removeItem("user");
        }
      }
    }
  }, []);

  // Effect to handle URL parameters from OAuth callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const userData = urlParams.get("user");
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userData));
          setUser(parsedUser);
          localStorage.setItem("user", JSON.stringify(parsedUser));
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

  // Effect to check auth status periodically
  useEffect(() => {
    // Function to check if user is still authenticated
    const checkAuthStatus = async () => {
      if (!user) return;
      
      try {
        // Make a request to a protected endpoint
        await api.get("/auth/profile");
      } catch (error) {
        // If 401 Unauthorized, clear user data
        if ((error as AxiosError)?.response?.status === 401) {
          setUser(null);
          localStorage.removeItem("user");
          toast("Your session has expired. Please log in again.");
        }
      }
    };
    
    // Check auth status every 5 minutes
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);
    
    // Clear interval on unmount
    return () => clearInterval(interval);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, login, loading, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, useUserContext };