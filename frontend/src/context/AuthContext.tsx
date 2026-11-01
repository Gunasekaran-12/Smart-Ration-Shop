import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { authApi, beneficiaryAuthApi } from '../services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  beneficiaryLogin: (cardNumber: string, dateOfBirth: string, password?: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const data = await authApi.login({ username, password });
    const authUser: User = {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      shopId: data.shopId,
      shopName: data.shopName,
      rationCardId: data.rationCardId,
      cardNumber: data.cardNumber,
    };

    setToken(data.token);
    setUser(authUser);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(authUser));
  };

  const beneficiaryLogin = async (cardNumber: string, dateOfBirth: string, password?: string) => {
    const data = await beneficiaryAuthApi.login({ cardNumber, dateOfBirth, password });
    const authUser: User = {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      shopId: data.shopId,
      shopName: data.shopName,
      rationCardId: data.rationCardId,
      cardNumber: data.cardNumber,
    };

    setToken(data.token);
    setUser(authUser);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(authUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        beneficiaryLogin,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
