/**
 * Omini Pulse AI — Axios HTTP Client
 *
 * Targets the deployed Express backend (https://ominipulse.onrender.com/api)
 * backed by the unified Supabase (JWT auth + RLS).
 *
 * Responsibilities:
 *  - Axios instance setup (base URL, timeout, headers)
 *  - Request interceptor: inject Supabase Bearer token
 *  - Response interceptor: retry transient errors, refresh the Supabase
 *    session on 401, fall back to mock data when the backend is unreachable
 *  - Normalised AppError on failure ({ error: { code, message } } envelope)
 *
 * Mock data lives in `./__mocks__/mockData.ts` and only kicks in after
 * retries are exhausted on network / server errors, so demo flows keep
 * working offline.
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';
import { secureStoreService } from '../services/secureStoreService';
import { logger } from '../utils/logger';
import { getMockResponse } from './__mocks__/mockData';

// ─── Error Type ───────────────────────────────────────────────────────────────

export class AppError extends Error {
  statusCode: number;
  code?: string;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, code?: string, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.name = 'AppError';
  }
}

// ─── Token Refresh Queue ──────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// ─── Retry Configuration ──────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1_000;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _refreshRetry?: boolean;
}

const retryDelay = (count: number) => RETRY_BASE_DELAY_MS * Math.pow(2, count - 1);

const shouldRetry = (error: AxiosError, count: number): boolean => {
  if (count >= MAX_RETRIES) return false;
  if (!error.response) return true; // network error
  return RETRYABLE_STATUS_CODES.has(error.response.status);
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor: Inject Access Token ─────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStoreService.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Supabase session refresh (single-flight) ─────────────────────────────────

async function refreshSupabaseSession(): Promise<string> {
  const { supabaseAuthService } = await import('../services/supabaseAuthService');
  const auth = await supabaseAuthService.refresh();
  const { accessToken, refreshToken, expiresAt } = auth.tokens;
  await Promise.all([
    secureStoreService.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    secureStoreService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
  try {
    const { storageService } = await import('../services/storageService');
    await storageService.set(STORAGE_KEYS.TOKEN_EXPIRY, String(expiresAt));
  } catch {
    // non-fatal
  }
  return accessToken;
}

async function handleSessionExpiry() {
  try {
    const { useAuthStore } = await import('../store/authStore');
    const { queryClient } = await import('./queryClient');
    await useAuthStore.getState().logout();
    queryClient.clear();
  } catch (logoutErr) {
    logger.error('[API] Failed to clean up session after refresh failure:', logoutErr);
  }
}

// ─── Response Interceptor: Retry / Refresh / Mock Fallback ───────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;
    const retryCount = config?._retryCount ?? 0;

    // 1. Retry transient errors (non-401)
    if (error.response?.status !== 401 && shouldRetry(error, retryCount)) {
      config._retryCount = retryCount + 1;
      const delay = retryDelay(config._retryCount);
      logger.log(
        `[API Retry] ${config._retryCount}/${MAX_RETRIES} — ${config.method?.toUpperCase()} ${config.url} (${delay}ms)`
      );
      await new Promise((res) => setTimeout(res, delay));
      return apiClient(config);
    }

    // 2. Mock fallback — after exhausting retries on network / server errors
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
    const isServerError =
      error.response && (error.response.status === 404 || error.response.status >= 500);

    if ((isNetworkError || isServerError) && retryCount >= MAX_RETRIES) {
      const mock = getMockResponse(error.config);
      if (mock) {
        logger.warn(
          `[API Mock] Falling back to mock for ${error.config?.method?.toUpperCase()} ${error.config?.url}`
        );
        return Promise.resolve(mock);
      }
    }

    // 3. 401 — refresh the Supabase session and replay once
    if (error.response?.status === 401 && !config._refreshRetry) {
      if (isRefreshing) {
        // Queue the request until the ongoing refresh completes
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              config.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(config));
            },
            reject,
          });
        });
      }

      config._refreshRetry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshSupabaseSession();
        processQueue(null, newAccessToken);
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(config);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await handleSessionExpiry();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 4. Normalise to AppError — the live backend returns
    //    { error: { code, message } } (zod validation details included on 400)
    const apiErrorData = error.response?.data as
      | { error?: { code?: string; message?: string }; message?: string; errors?: Record<string, string[]> }
      | undefined;
    const message =
      apiErrorData?.error?.message ??
      apiErrorData?.message ??
      error.message ??
      'Something went wrong. Please try again.';
    const statusCode = error.response?.status ?? 500;

    return Promise.reject(new AppError(message, statusCode, apiErrorData?.error?.code, apiErrorData?.errors));
  },
);

export default apiClient;
