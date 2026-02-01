'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';

interface QuizResult {
  _id: string;
  score: number;
  totalQuestions: number;
  subject: string;
  chapter?: string;
  createdAt: string;
}

interface Bookmark {
  _id: string;
  question: string;
  createdAt: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isPremium: boolean;
  profileImage?: string;
  bio?: string;
  phone?: string;
  institution?: string;
  quizHistory: QuizResult[];
  bookmarks: Bookmark[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  const checkAuth = React.useCallback(async () => {
    try {
      const data = await apiFetch<any>('/auth/me');
      
      // Handle response structure (direct object vs wrapped)
      const userData = data.user || data;
      
      if (userData && userData._id) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      
      // Redirect if on a protected route
      const protectedRoutes = ['/dashboard', '/admin', '/profile', '/leaderboard', '/revision', '/mock-tests'];
      if (typeof window !== 'undefined' && protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
         router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        checkAuth,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
