import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants';

const TOKEN_KEY = 'ominipulse_desktop_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _refreshRetry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

/** Single-flight Supabase session refresh; resolves with the new access token. */
async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { supabaseAuthService } = await import('./supabaseAuthService');
      const { token } = await supabaseAuthService.refresh();
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
      }
      return token;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function forceSignOut() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  const { useAuthStore } = await import('@/store/authStore');
  useAuthStore.getState().logout();
  window.location.href = '/login';
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    // 401 → refresh the Supabase session once and replay the request.
    if (error.response?.status === 401 && config && !config._refreshRetry) {
      try {
        config._refreshRetry = true;
        const token = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return apiClient(config);
      } catch {
        await forceSignOut();
        return Promise.reject(error);
      }
    }

    // Normalise the backend error envelope { error: { code, message } }
    // so pages can render a single message string.
    if (error.response?.status === 401) {
      await forceSignOut();
    }
    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from any backend/axios error. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: { message?: string; code?: string }; message?: string }
      | undefined;
    return (
      data?.error?.message ??
      data?.message ??
      error.message ??
      'Request failed. Check your connection and try again.'
    );
  }
  return error instanceof Error ? error.message : 'Unexpected error.';
}

export default apiClient;
