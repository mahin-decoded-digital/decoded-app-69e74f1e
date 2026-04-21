export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupPayload extends AuthCredentials {
  name: string;
}

export interface AuthAccount extends User {
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: AuthCredentials) => Promise<{ success: boolean; message?: string }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  clearError: () => void;
  markHydrated: () => void;
}