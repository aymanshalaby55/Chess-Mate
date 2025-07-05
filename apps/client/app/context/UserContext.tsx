'use client';

import api from '@/lib/api';
import { AxiosError } from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User, UserContextType } from '@/types';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      window.location.href = 'http://localhost:4040/api/auth/google';
    } catch (error) {
      console.error('Login Error:', error);
      toast.error('Failed to start login process.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout Error:', error);
      toast.error('There was a problem logging out.');
    } finally {
      clearUser();
      window.location.href = '/';
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const loadUserFromCookies = () => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find((cookie) => cookie.startsWith('user='));
    if (userCookie) {
      try {
        const storedUser = decodeURIComponent(userCookie.split('=')[1]);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user from cookie:', error);
        clearUser();
      }
    }
  };

  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userData = urlParams.get('user');

    if (userData) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData));
        setUser(parsedUser);
        localStorage.setItem('user', JSON.stringify(parsedUser));
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        console.error('Error parsing OAuth user data:', error);
        toast.error('Failed to process login response.');
      } finally {
        setLoading(false);
      }
    }
  };

  const checkAuthStatus = async () => {
    if (!user) return;
    try {
      await api.get('/auth/profile');
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 401) {
        toast('Session expired. Please log in again.');
        clearUser();
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadUserFromCookies();
      handleOAuthCallback();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, login, loading, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
