/**
 * Authentication Context — manages user session, token refresh, and auth state.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@chalak/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: { email: string; username: string; password: string; fullName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshCsrfToken: () => Promise<string | null>;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

// Environment variable type declaration — see src/env.d.ts for the full type
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8788';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/session`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success && data.data?.user) {
        setUser(data.data.user);
        setAccessToken(data.data.accessToken || null);
      }
    } catch {
      // Silent fail — user is not authenticated
    } finally {
      setIsLoading(false);
    }
  }

  async function login(emailOrUsername: string, password: string, _rememberMe: boolean = false) {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emailOrUsername, password, rememberMe: _rememberMe }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      await refreshCsrfToken();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function register(regData: { email: string; username: string; password: string; fullName?: string }) {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(regData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      await refreshCsrfToken();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore errors on logout
    }
    setUser(null);
    setAccessToken(null);
  }

  async function refreshCsrfToken(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/csrf-token`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success && data.data?.csrfToken) {
        return data.data.csrfToken;
      }
    } catch {
      // Silent fail
    }
    return null;
  }

  // Auto-refresh access token before it expires
  useEffect(() => {
    if (!accessToken) return;

    let exp: number | null = null;
    try {
      const tokenParts = accessToken.split('.');
      const payloadPart = tokenParts[1];
      if (payloadPart) {
        const payload = JSON.parse(atob(payloadPart));
        exp = payload.exp;
      }
    } catch {
      return;
    }

    if (!exp) return;

    // Refresh 1 minute before expiry
    const refreshIn = exp * 1000 - Date.now() - 60_000;
    if (refreshIn <= 0) return;

    const timer = setTimeout(async () => {
      const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        setAccessToken(data.data.accessToken);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    }, refreshIn);

    return () => clearTimeout(timer);
  }, [accessToken]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshCsrfToken,
    accessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
