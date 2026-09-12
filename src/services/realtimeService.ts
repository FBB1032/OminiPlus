/**
 * Mobile realtime service — WebSocket client for instant sync.
 *
 * Connects to the backend hub (GET /ws?token=<supabase access token>) and
 * exposes subscription APIs. Reconnects with exponential backoff; token is
 * refreshed from the auth store before each attempt so long-lived sessions
 * keep a valid JWT.
 *
 * Used by:
 *   • Doctor dashboard — appointment.booked / appointment.* events invalidate
 *     React Query caches so the dashboard reflects patient bookings without
 *     manual refresh.
 *   • Broadcast/account events — toasts + cache invalidation.
 */

import { API_BASE_URL } from '../constants/config';

export type RealtimeEvent = {
  channel: string;
  event: string;
  payload: Record<string, unknown>;
  ts: string;
};

type Listener = (event: RealtimeEvent) => void;

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;

class RealtimeService {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private eventTypes = new Set<string>();
  private reconnectAttempts = 0;
  private shouldConnect = false;
  private getToken: (() => string | null) | null = null;

  /** Configure the token provider (called before connect()). */
  init(getToken: () => string | null) {
    this.getToken = getToken;
  }

  /** Subscribe to hub events. Returns an unsubscribe fn. */
  subscribe(listener: Listener, eventTypes?: string[]) {
    this.listeners.add(listener);
    if (eventTypes) {
      for (const t of eventTypes) this.eventTypes.add(t);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private wsUrl(token: string): string {
    // API_BASE_URL is https://host/api — derive wss://host/ws.
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    const wsBase = base.replace(/^http/, 'ws');
    return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
  }

  connect() {
    const token = this.getToken?.() ?? null;
    if (!token || typeof WebSocket === 'undefined') return;

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

  private scheduleReconnect() {
    if (!this.shouldConnect) return;
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** this.reconnectAttempts,
      RECONNECT_MAX_MS
    );
    this.reconnectAttempts += 1;
    setTimeout(() => {
      if (this.shouldConnect) this.connect();
    }, delay);
  }

  disconnect() {
    this.shouldConnect = false;
    this.reconnectAttempts = 0;
    this.socket?.close();
    this.socket = null;
    this.listeners.clear();
    this.eventTypes.clear();
  }
}

export const realtimeService = new RealtimeService();
