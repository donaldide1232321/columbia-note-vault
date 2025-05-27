
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  username: string;
  hasUploaded: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  updateUserUploadStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('noteshub_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simple password hashing for demo (in production, use proper bcrypt)
      const passwordHash = btoa(password);
      
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !users) {
        return false;
      }

      const userData = {
        id: users.id,
        email: users.email,
        username: users.username,
        hasUploaded: users.has_uploaded
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('noteshub_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();

      if (existingUser) {
        return false; // User already exists
      }

      // Simple password hashing for demo (in production, use proper bcrypt)
      const passwordHash = btoa(password);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email,
          username,
          password_hash: passwordHash,
          has_uploaded: false
        })
        .select()
        .single();

      if (error || !newUser) {
        return false;
      }

      const userData = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        hasUploaded: false
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('noteshub_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('noteshub_user');
  };

  const updateUserUploadStatus = async () => {
    if (user) {
      try {
        await supabase
          .from('users')
          .update({ has_uploaded: true })
          .eq('id', user.id);

        const updatedUser = { ...user, hasUploaded: true };
        setUser(updatedUser);
        localStorage.setItem('noteshub_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error updating upload status:', error);
      }
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUserUploadStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
