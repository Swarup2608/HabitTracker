import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;
const subscribers: Array<(t: string | null) => void> = [];

export function setAccessToken(t: string | null) {
  accessToken = t;
  if (typeof window !== 'undefined') {
    if (t) localStorage.setItem('tracker_at', t);
    else localStorage.removeItem('tracker_at');
  }
}

export function getAccessToken() {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') accessToken = localStorage.getItem('tracker_at');
  return accessToken;
}

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function performRefresh(): Promise<string | null> {
  try {
    const res = await axios.post(`${BASE}/api/auth/refresh`, null, { withCredentials: true });
    const newToken = res.data.accessToken as string;
    setAccessToken(newToken);
    return newToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      refreshing = refreshing || performRefresh();
      const newToken = await refreshing;
      refreshing = null;
      subscribers.forEach((cb) => cb(newToken));
      subscribers.length = 0;
      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original);
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
