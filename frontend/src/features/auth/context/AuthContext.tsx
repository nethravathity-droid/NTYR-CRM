import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/features/auth/services/auth.service";
import type { CurrentUser, LoginPayload } from "@/features/auth/types/auth.types";
import { tokenStorage } from "@/lib/storage/token.storage";
import { getApiErrorMessage } from "@/lib/api/client";

interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    const accessToken = tokenStorage.getAccessToken();

    if (!accessToken) {
      setUser(null);
      return;
    }

    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (tokenStorage.getAccessToken()) {
          await refreshUser();
        }
      } catch {
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    void initialize();
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);

    try {
      const result = await authService.login(payload);
      tokenStorage.setTokens(
        result.tokens.accessToken,
        result.tokens.refreshToken,
      );
      setUser(result.user);
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Clear local session even if API logout fails
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isInitializing,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, isInitializing, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}
