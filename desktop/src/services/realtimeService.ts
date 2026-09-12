/**
 * Omini Pulse Desktop — Realtime service (WebSocket)
 *
 * Connects to the backend hub (wss://host/ws?token=<supabase token>) and
 * fans events out to registered listeners. Used for:
 *   • Live appointment sync (doctor portal + appointments overview)
 *   • Broadcast delivery (Broadcast Center + notifications bell)
 *   • Admin user-moderation updates (doctors/patients dashboards)
 *
 * Reconnects with exponential backoff. The token is re-read from the auth
 * store on every attempt so long-lived sessions present a fresh JWT.
 */

'use client';

import { API_BASE_URL } from '@/constants';
import { useAuthStore } from '@/store/authStore';

export interface RealtimeEvent {
  channel: string;
  event: string;
  payload: Record<string, unknown>;
  ts: string;
}

type Listener = (event: RealtimeEvent) => void;

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;

class RealtimeService {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectAttempts = 0;
  private shouldConnect = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private wsUrl(token: string): string {
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    const wsBase = base.replace(/^http/, 'ws');
    return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
  }

  connect(): void {
    if (typeof window === 'undefined' || this.socket) return;
    const token = useAuthStore.getState().token;
    if (!token) return;

    this.shouldConnect = true;
    try {
      this.socket = new WebSocket(this.wsUrl(token));
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (raw) => {
      try {
        const message = JSON.parse(String(raw.data)) as RealtimeEvent;
        for (const listener of this.listeners) {
          try {
            listener(message);
          } catch {
            // A faulty listener must not kill the socket loop.
          }
        }
      } catch {
        // Ignore malformed frames.
      }
    };

    this.socket.onclose = () => {
      this.socket = null;
      if (this.shouldConnect) this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  private scheduleReconnect(): void {
    if (!this.shouldConnect) return;
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** this.reconnectAttempts,
      RECONNECT_MAX_MS
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      if (this.shouldConnect) this.connect();
    }, delay);
  }

  disconnect(): void {
    this.shouldConnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.socket?.close();
    this.socket = null;
    this.listeners.clear();
  }
}

export const realtimeService = new RealtimeService();
