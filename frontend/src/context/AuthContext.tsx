import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "@/services/authService";
import type { AuthSession, AuthUser, LoginCredentials } from "@/types/auth";

interface AuthContextType {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const SESSION_STORAGE_KEY = "soccerstyle.admin.session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredSession() {
  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession;
    if (!session.accessToken || !session.user || typeof session.expiresAt !== "number") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    if (Date.now() >= session.expiresAt) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const storedSession = readStoredSession();
    setSession(storedSession);
    setIsBootstrapping(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    const nextSession: AuthSession = {
      accessToken: response.access_token,
      expiresAt: Date.now() + response.expires_in * 1000,
      user: response.user,
    };

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: session?.accessToken ?? null,
        user: session?.user ?? null,
        isAuthenticated: Boolean(session?.accessToken),
        isBootstrapping,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
};
