import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  plan: "free" | "pro" | "enterprise";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("clipforge_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - replace with real auth later
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      email,
      username: email.split("@")[0],
      plan: "free",
    };
    
    setUser(mockUser);
    localStorage.setItem("clipforge_user", JSON.stringify(mockUser));
  };

  const signup = async (email: string, password: string, username: string) => {
    // Mock signup - replace with real auth later
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      email,
      username,
      plan: "free",
    };
    
    setUser(mockUser);
    localStorage.setItem("clipforge_user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("clipforge_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("clipforge_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
