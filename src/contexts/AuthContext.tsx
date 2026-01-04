import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axiosInstance from "@/api/axiosInstance";

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
    const storedUser = localStorage.getItem("KlipperAI_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      // The backend sets cookies (auth_token, refresh_token, device_id) automatically
      // via withCredentials: true
      // Extract user data from response if available
      const userData = response.data?.user || response.data;
      
      const user: User = {
        id: userData?.id || userData?.user_id || "unknown",
        email: userData?.email || email,
        username: userData?.username || userData?.name || email.split("@")[0],
        plan: userData?.plan || "free",
        avatar: userData?.avatar,
      };
      
      setUser(user);
      localStorage.setItem("KlipperAI_user", JSON.stringify(user));
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Login failed. Please check your credentials."
      );
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      const response = await axiosInstance.post("/auth/register", {
        name: username, // API expects "name" field
        email,
        password,
      });

      // The backend sets cookies (auth_token, refresh_token, device_id) automatically
      // via withCredentials: true
      // Extract user data from response if available
      const userData = response.data?.user || response.data;
      
      const user: User = {
        id: userData?.id || userData?.user_id || "unknown",
        email: userData?.email || email,
        username: userData?.username || userData?.name || username,
        plan: userData?.plan || "free",
        avatar: userData?.avatar,
      };
      
      setUser(user);
      localStorage.setItem("KlipperAI_user", JSON.stringify(user));
    } catch (error: any) {
      console.error("Signup error:", error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Signup failed. Please try again."
      );
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("KlipperAI_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("KlipperAI_user", JSON.stringify(updatedUser));
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
