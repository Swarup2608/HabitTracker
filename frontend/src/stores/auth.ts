import { create } from 'zustand';
import type { User } from '@/lib/types';
import { api, fetchCsrfToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
}

// Secure auth store using httpOnly cookies for token storage
// Access tokens are stored in secure httpOnly cookies that are:
// - Never accessible to JavaScript (prevents XSS attacks)
// - Only sent over HTTPS (if secure flag enabled in production)
// - Not vulnerable to localStorage compromises
export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  hydrate: async () => {
    try {
      // Fetch CSRF token first (needed for subsequent requests)
      await fetchCsrfToken();
      
      // Fetch user info; access token is automatically included via httpOnly cookie
      const res = await api.get('/users/me');
      set({ user: res.data.user, loading: false });
    } catch {
      // If /users/me fails (401), user is not authenticated
      set({ user: null, loading: false });
    }
  },
  login: async (email, password) => {
    // Backend returns access token in httpOnly cookie automatically
    const res = await api.post('/auth/login', { email, password });
    // No need to manually store token - it's in the httpOnly cookie
    set({ user: res.data.user });
  },
  register: async (email, username, password) => {
    // Backend returns access token in httpOnly cookie automatically
    const res = await api.post('/auth/register', { email, username, password });
    // No need to manually store token - it's in the httpOnly cookie
    set({ user: res.data.user });
  },
  logout: async () => {
    try {
      // POST to logout endpoint - backend clears httpOnly cookies
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    // Clear user state; httpOnly cookie is already cleared by server
    set({ user: null });
  },
  setUser: (u) => set({ user: u }),
}));
