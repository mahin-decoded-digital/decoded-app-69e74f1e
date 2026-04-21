import { create } from 'zustand';
import { apiUrl } from '@/lib/api';
import { AuthCredentials, AuthState, SignupPayload, User } from '@/types/auth';

const SESSION_KEY = 'clearnote-auth-session';

interface SessionData {
  user: User;
  token: string;
}

const readSession = (): SessionData | null => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
};

const writeSession = (session: SessionData | null): void => {
  try {
    if (!session) {
      window.localStorage.removeItem(SESSION_KEY);
      return;
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors
  }
};

const authHeaders = (token: string | null): HeadersInit => {
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isHydrated: false,
  isLoading: false,
  error: null,
  signup: async (payload: SignupPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { user?: User; token?: string; error?: string };
      if (!res.ok || !data.user || !data.token) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      writeSession({ user: data.user, token: data.token });
      set({ user: data.user, token: data.token, isLoading: false, error: null, isHydrated: true });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create account.',
        isHydrated: true,
      });
      return { success: false, message: error instanceof Error ? error.message : 'Failed to create account.' };
    }
  },
  login: async (payload: AuthCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { user?: User; token?: string; error?: string };
      if (!res.ok || !data.user || !data.token) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      writeSession({ user: data.user, token: data.token });
      set({ user: data.user, token: data.token, isLoading: false, error: null, isHydrated: true });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to sign in.',
        isHydrated: true,
      });
      return { success: false, message: error instanceof Error ? error.message : 'Failed to sign in.' };
    }
  },
  logout: async () => {
    const token = get().token;
    try {
      await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: {
          ...authHeaders(token),
        },
      });
    } catch {
      // ignore logout network failures
    }

    writeSession(null);
    set({ user: null, token: null, error: null, isHydrated: true, isLoading: false });
  },
  loadSession: async () => {
    const session = readSession();
    if (!session) {
      set({ user: null, token: null, isHydrated: true, error: null, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: {
          ...authHeaders(session.token),
        },
      });

      const data = (await res.json()) as { user?: User; token?: string; error?: string };
      if (!res.ok || !data.user || !data.token) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      writeSession({ user: data.user, token: data.token });
      set({ user: data.user, token: data.token, isHydrated: true, isLoading: false, error: null });
    } catch {
      writeSession(null);
      set({ user: null, token: null, isHydrated: true, isLoading: false, error: null });
    }
  },
  clearError: () => set({ error: null }),
  markHydrated: () => set({ isHydrated: true }),
}));