import { createContext } from "react";
import { User as AppUser } from "@/types/types";

export interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  error: Error | null;
  isOnline: boolean;
  login: (email: string, password: string) => Promise<AppUser | null>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<AppUser | null>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<AppUser>) => Promise<void>;
}

// Create and export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
