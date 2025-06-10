import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types/api';
import { authAPI } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, setUser, setLoading, logout } from '@/store/authSlice';

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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      // First, set the credentials with the initial user data and token
      dispatch(setCredentials({ 
        user: {
          ...response.user,
          //role: response.user?.role?.name // Map accountType to role
        }, 
        token: response.jwt 
      }));
      checkAuth();
      // Set loading to false since we have the initial data
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(logout());
      throw new Error('Login failed');
    }
  };

  const register = async (userData: unknown) => {
    try {
      const response = await authAPI.register(userData);
      dispatch(setCredentials({ 
        user: {
          ...response.user,
          //role: response.user?.role?.name // Map accountType to role
        }, 
        token: response.jwt 
      }));
      checkAuth();
      return response;
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const customer = async (userData: unknown, id) => {
    try {
      const response = await authAPI.customer(userData, id);
      console.log('User updated: ', response.data);
    } catch (error) {
      throw new Error('Update user failed');
    }
  };

  const provider = async (userData: unknown, id) => {
    try {
      const response = await authAPI.provider(userData, id);
      console.log('User updated: ', response.data);
    } catch (error) {
      throw new Error('Update user failed');
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const checkAuth = async () => {
    try {
      const userData = await authAPI.me();
      dispatch(setUser({
        ...userData,
        role: userData?.role?.name // Map accountType to role
      }));
    } catch (error) {
      dispatch(logout());
    }
    dispatch(setLoading(false));
  };

  // useEffect(() => {
  //   checkAuth();
  // }, [user]);

  const isCustomer = user?.role?.name === 'customer';
  const isProvider = user?.role?.name === 'provider';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout: logoutUser,
        customer,
        provider,
        isCustomer,
        isProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
