
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const savedUser = localStorage.getItem('noteshub_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call - in real app, this would authenticate with backend
    const savedUsers = JSON.parse(localStorage.getItem('noteshub_users') || '[]');
    const existingUser = savedUsers.find((u: any) => u.email === email && u.password === password);
    
    if (existingUser) {
      const userData = {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        hasUploaded: existingUser.hasUploaded || false
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('noteshub_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, username: string): Promise<boolean> => {
    // Simulate API call - in real app, this would create user in backend
    const savedUsers = JSON.parse(localStorage.getItem('noteshub_users') || '[]');
    const existingUser = savedUsers.find((u: any) => u.email === email || u.username === username);
    
    if (existingUser) {
      return false; // User already exists
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      username,
      hasUploaded: false
    };

    savedUsers.push(newUser);
    localStorage.setItem('noteshub_users', JSON.stringify(savedUsers));

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
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('noteshub_user');
  };

  const updateUserUploadStatus = () => {
    if (user) {
      const updatedUser = { ...user, hasUploaded: true };
      setUser(updatedUser);
      localStorage.setItem('noteshub_user', JSON.stringify(updatedUser));
      
      // Update in users array
      const savedUsers = JSON.parse(localStorage.getItem('noteshub_users') || '[]');
      const updatedUsers = savedUsers.map((u: any) => 
        u.id === user.id ? { ...u, hasUploaded: true } : u
      );
      localStorage.setItem('noteshub_users', JSON.stringify(updatedUsers));
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
