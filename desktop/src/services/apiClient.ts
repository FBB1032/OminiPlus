import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants';

const TOKEN_KEY = 'ominipulse_desktop_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
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
  _retryCount?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

let refreshPromise: Promise<string> | null = null;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function isRetryableError(error: AxiosError): boolean {
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') return true;
  if (!error.response) return true;
  return false;
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    // Retry on network/CORS errors up to MAX_RETRIES times.
    if (isRetryableError(error) && config && (config._retryCount ?? 0) < MAX_RETRIES) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      await delay(RETRY_DELAY_MS * config._retryCount);
      return apiClient(config);
    }

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
    if (data?.error?.message) return data.error.message;
    if (data?.message) return data.message;
    if (error.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes('cors') || msg.includes('network') || msg.includes('timeout') || msg.includes('econn') || msg.includes('etimedout') || !error.response) {
        return 'Network error — the backend connection failed (CORS or timeout). Ensure the backend is running and CORS is configured. Retry or check your connection and role.';
      }
      return error.message;
    }
    return 'Request failed. Check your connection and try again.';
  }
  return error instanceof Error ? error.message : 'Unexpected error.';
}

export default apiClient;
