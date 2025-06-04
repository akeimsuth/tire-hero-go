
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Customer, Provider } from '@/types/api';
import { authAPI } from '@/services/api';

interface AuthContextType {
  user: Partial<User> | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: unknown) => Promise<void>;
  customer: (userData: unknown, id) => Promise<void>;
  provider: (userData: unknown, id) => Promise<void>;
  logout: () => void;
  isCustomer: boolean;
  isProvider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('authToken', response.jwt);
      checkAuth();
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (userData: unknown) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('authToken', response.jwt);
      checkAuth();
      return response;
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

    const customer = async (userData: unknown, id) => {
    try {
      const response = await authAPI.customer(userData, id);
      //setUser(response.user);
      checkAuth();
      console.log('User updated: ', response.data);
    } catch (error) {
      throw new Error('Update user failed');
    }
  };

    const provider = async (userData: unknown, id) => {
    try {
      const response = await authAPI.provider(userData, id);
      //setUser(response.user);
      checkAuth();
      console.log('User updated: ', response.data);
    } catch (error) {
      throw new Error('Update user failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const userData = await authAPI.me();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const isCustomer = user?.accountType === 'customer';
  const isProvider = user?.accountType === 'provider';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      customer,
      provider,
      isCustomer,
      isProvider
    }}>
      {children}
    </AuthContext.Provider>
  );
};
