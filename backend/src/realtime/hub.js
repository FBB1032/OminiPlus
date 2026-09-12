/**
 * Realtime hub — WebSocket transport for instant cross-client sync.
 *
 * Design:
 *   • One WebSocket server (ws) shares the Express HTTP server so a single
 *     port serves REST + realtime.
 *   • Connections authenticate with the same Supabase JWT used by REST
 *     (Authorization header or ?token= query for browser WebSocket clients,
 *     which cannot set headers).
 *   • Each socket joins channels derived from the caller's identity:
 *       - role:<role>        e.g. role:doctor
 *       - user:<profile_id>  per-user channel (notifications, broadcasts)
 *       - admins             every administrative role (admin)
 *   • The REST layer publishes events via `publish()`; delivery is
 *     fire-and-forget so a slow client can never block a request.
 *   • Heartbeat ping/pong evicts dead sockets; reconnects re-authenticate.
 *
 * Message protocol (server → client):
 *   { channel: string, event: string, payload: object, ts: string }
 */

const { WebSocketServer } = require('ws');
const { verifyToken } = require('../config/supabase');
const logger = require('../config/logger');

const ADMIN_ROLES = new Set(['admin']);

class RealtimeHub {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // ws → { userId, profile, alive }
  }

  /**
   * Attach to an existing HTTP server.
   * @param {import('http').Server} server
   */
  attach(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (socket, req) => {
      this.handleConnection(socket, req).catch(() => {
        socket.close(4001, 'authentication_failed');
      });
    });

    // Evict dead connections every 30s (pong must arrive within the window).
    this.heartbeatTimer = setInterval(() => {
      if (!this.wss) return;
      for (const [socket, meta] of this.clients) {
        if (!meta.alive) {
          this.clients.delete(socket);
          socket.terminate();
          continue;
        }
        meta.alive = false;
        try {
          socket.ping();
        } catch {
          this.clients.delete(socket);
        }
      }
    }, 30_000);

    logger.info('Realtime hub listening', { path: '/ws' });
  }

  async handleConnection(socket, req) {
    const token = this.extractToken(req);
    if (!token) throw new Error('missing token');

    const { user, error } = await verifyToken(token);
    if (error || !user) throw new Error(error ?? 'invalid token');

    // Load the caller's profile for role channel routing. A missing profile
    // means the account is not (yet) usable — refuse the socket.
    const { createUserClient } = require('../config/supabase');
    const supabase = createUserClient(token);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, is_active, verification_status')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) throw new Error('no profile');
    if (profile.is_active === false || profile.verification_status === 'suspended') {
      throw new Error('account not in good standing');
    }

    this.clients.set(socket, { userId: profile.id, profile, alive: true });

    socket.on('pong', () => {
      const meta = this.clients.get(socket);
      if (meta) meta.alive = true;
    });

    socket.on('close', () => this.clients.delete(socket));
    socket.on('error', () => this.clients.delete(socket));

    this.send(socket, 'connection', 'ready', {
      userId: profile.id,
      role: profile.role,
      channels: this.channelsFor(profile),
    });
  }

  extractToken(req) {
    const header = req.headers.authorization ?? '';
    if (header.startsWith('Bearer ')) return header.slice(7);
    const url = new URL(req.url ?? '', 'http://localhost');
    return url.searchParams.get('token');
  }

  channelsFor(profile) {
    const channels = [`user:${profile.id}`, `role:${profile.role}`];
    if (ADMIN_ROLES.has(profile.role)) channels.push('admins');
    return channels;
  }

  send(socket, channel, event, payload) {
    if (socket.readyState !== 1 /* OPEN */) return false;
    try {
      socket.send(JSON.stringify({ channel, event, payload, ts: new Date().toISOString() }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Publish an event to every socket subscribed to a channel.
   * Channel conventions:
   *   user:<id>   — events about a specific profile (notification, broadcast)
   *   role:<role> — events for every member of a role
   *   admins      — every administrative session
   *   doctors     — alias of role:doctor (kept for readability at call sites)
   */
  publish(channel, event, payload) {
    let delivered = 0;
    for (const [socket, meta] of this.clients) {
      if (this.channelsFor(meta.profile).includes(channel)) {
        if (this.send(socket, channel, event, payload)) delivered += 1;
      }
    }
    return delivered;
  }

  /** Publish to several channels at once (e.g. a booking reaches its doctor + admins). */
  publishAll(channels, event, payload) {
    for (const channel of channels) this.publish(channel, event, payload);
  }

  /** Publish to a specific user's channel. */
  publishToUser(userId, event, payload) {
    return this.publish(`user:${userId}`, event, payload);
  }

  close() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.wss) this.wss.close();
    this.clients.clear();
  }
}

// Process-wide singleton — one hub per Express server.
const hub = new RealtimeHub();

module.exports = hub;
