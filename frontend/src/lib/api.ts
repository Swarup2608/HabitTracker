import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Access tokens are stored in httpOnly cookies by the backend
// This approach prevents XSS vulnerabilities that plague localStorage storage
// The refresh token is also httpOnly and automatically sent with credentials
let csrfToken: string | null = null;
let refreshing: Promise<void> | null = null;
const subscribers: Array<() => void> = [];
const apiErrorHandlers = new Set<(error: AxiosError) => void>();

// Fetch CSRF token from server
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await axios.get(`${BASE}/api/csrf-token`, { withCredentials: true });
    csrfToken = res.data.csrfToken;
    return csrfToken;
  } catch {
    return null;
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,  // Includes httpOnly cookies in requests
});

api.interceptors.request.use(async (config) => {
  // Access token is sent automatically via httpOnly cookie
  // No need to manually add Authorization header

  // Add CSRF token for state-changing requests
  if (['post', 'patch', 'put', 'delete'].includes(config.method?.toLowerCase() || '')) {
    // Pre-fetch CSRF token if not cached
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

async function performRefresh(): Promise<void> {
  try {
    // POST to refresh endpoint, which returns new access token in httpOnly cookie
    // The backend automatically sets the new access token cookie
    await api.post('/auth/refresh', null);
  } catch {
    // Refresh failed, user will need to log in again
    throw new Error('Token refresh failed');
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (error.response?.status === 429) {
      apiErrorHandlers.forEach((handler) => handler(error));
    }

    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      refreshing = refreshing || performRefresh();
      
      try {
        await refreshing;
        refreshing = null;
        subscribers.forEach((cb) => cb());
        subscribers.length = 0;
        // Retry the request with new tokens from cookie
        return api(original);
      } catch {
        refreshing = null;
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export function apiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error || err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

export function onRefreshToken(callback: () => void) {
  subscribers.push(callback);
}

export function onApiError(callback: (error: AxiosError) => void): () => void {
  apiErrorHandlers.add(callback);
  return () => {
    apiErrorHandlers.delete(callback);
  };
}
