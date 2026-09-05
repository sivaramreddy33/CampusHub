import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  switchDemoRole: (targetRole: 'STUDENT' | 'FACULTY' | 'ADMIN') => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campushub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('campushub_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me/');
      setUser(res.data);
      localStorage.setItem('campushub_user', JSON.stringify(res.data));
    } catch {
      localStorage.removeItem('campushub_access_token');
      localStorage.removeItem('campushub_refresh_token');
      localStorage.removeItem('campushub_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login/', { email, password });
    const { access, refresh, user: loggedUser } = res.data;

    localStorage.setItem('campushub_access_token', access);
    localStorage.setItem('campushub_refresh_token', refresh);
    localStorage.setItem('campushub_user', JSON.stringify(loggedUser));

    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.post('/auth/register/', data);
    const { access, refresh, user: registeredUser } = res.data;

    localStorage.setItem('campushub_access_token', access);
    localStorage.setItem('campushub_refresh_token', refresh);
    localStorage.setItem('campushub_user', JSON.stringify(registeredUser));

    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('campushub_access_token');
    localStorage.removeItem('campushub_refresh_token');
    localStorage.removeItem('campushub_user');
    setUser(null);
  };

  const switchDemoRole = async (targetRole: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    const credentials = {
      STUDENT: { email: 'student@campushub.com', password: 'Student@123' },
      FACULTY: { email: 'faculty@campushub.com', password: 'Faculty@123' },
      ADMIN: { email: 'admin@campushub.com', password: 'Admin@123' }
    };
    const cred = credentials[targetRole];
    await login(cred.email, cred.password);
  };

  const refreshUserProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
