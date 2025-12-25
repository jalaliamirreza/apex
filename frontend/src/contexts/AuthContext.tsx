import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MockUser, MOCK_USERS, getUserByUsername } from '../data/mockUsers';

interface AuthContextType {
  user: MockUser | null;
  login: (username: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'syncro_mock_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEY);
    if (savedUsername) {
      const savedUser = getUserByUsername(savedUsername);
      if (savedUser) setUser(savedUser);
    }
  }, []);

  const login = (username: string) => {
    const foundUser = getUserByUsername(username);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, username);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasRole = (role: string) => user?.roles.includes(role) ?? false;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      hasRole,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
