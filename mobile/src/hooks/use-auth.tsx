import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { callAction, type AuthResult, type PublicUser } from '@/lib/api';
import { clearToken, getToken, setToken as persistToken } from '@/lib/auth-storage';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type RegisterParams = {
  roomNumber: string;
  name: string;
  password: string;
  floorPasskey: string;
};

type AuthContextValue = {
  status: AuthStatus;
  user: PublicUser | null;
  token: string | null;
  login: (roomNumber: string, password: string) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      if (!storedToken) {
        setStatus('signedOut');
        return;
      }
      try {
        const me = await callAction<PublicUser>('getMe', {}, storedToken);
        setTokenState(storedToken);
        setUser(me);
        setStatus('signedIn');
      } catch {
        await clearToken();
        setStatus('signedOut');
      }
    })();
  }, []);

  const applyAuthResult = useCallback(async (result: AuthResult) => {
    await persistToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
    setStatus('signedIn');
  }, []);

  const login = useCallback(
    async (roomNumber: string, password: string) => {
      const result = await callAction<AuthResult>('login', { roomNumber, password });
      await applyAuthResult(result);
    },
    [applyAuthResult]
  );

  const register = useCallback(
    async (params: RegisterParams) => {
      const result = await callAction<AuthResult>('register', params);
      await applyAuthResult(result);
    },
    [applyAuthResult]
  );

  const signOut = useCallback(async () => {
    await clearToken();
    setTokenState(null);
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo(
    () => ({ status, user, token, login, register, signOut }),
    [status, user, token, login, register, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
