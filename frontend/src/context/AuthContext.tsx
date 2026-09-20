import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { LoginRequest } from '../types';

export const AUTH_TOKEN_KEY = 'lc_token';
const AUTH_USER_KEY = 'lc_user';

interface AuthUser {
  email: string;
  nombreCompleto: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function persistSession(response: { token: string; email: string; nombreCompleto: string }): AuthUser {
  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  const nextUser: AuthUser = { email: response.email, nombreCompleto: response.nombreCompleto };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  return nextUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    setUser(persistSession(response));
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const response = await authApi.loginWithGoogle({ idToken });
    setUser(persistSession(response));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, loginWithGoogle, logout }),
    [user, login, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
