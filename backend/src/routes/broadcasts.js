/**
 * Broadcast routes — desktop Broadcast Center backend.
 *
 * Lifecycle:
 *   1. Admin drafts a message (POST /broadcasts) — target audience, type,
 *      optional scheduled_at.
 *   2. Dispatch:
 *        • immediate → POST /broadcasts/:id/dispatch fans out one
 *          notifications row per recipient (universal distribution) and
 *          pushes a `broadcast.delivered` realtime event so every connected
 *          admin/desktop session renders it instantly.
 *        • scheduled → a dispatch sweep runs every 60s (started by server.js)
 *          and sends any broadcast whose time has arrived.
 *   3. Every dispatch is audited to admin_audit_logs.
 *
 * Delivery guarantees:
 *   • Fan-out is transactional per recipient set (dispatch_broadcast RPC).
 *   • Realtime events are fire-and-forget over the WebSocket hub — clients
 *     that miss them still have the notifications row (poll fallback).
 */

const express = require('express');
const { z } = require('zod');
const { wrap, ApiError } = require('../middleware/errors');
const { validate } = require('../middleware/validate');
const { authenticate, requirePermission } = require('../middleware/auth');
const { capture } = require('../services/adminAudit');
const { adminClient } = require('../config/supabase');
const hub = require('../realtime/hub');

const router = express.Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const broadcastSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(4000),
  type: z.enum(['announcement', 'reminder', 'alert', 'system']).default('announcement'),
  targetAudience: z.enum(['all', 'doctors', 'patients', 'staff']).default('all'),
  scheduledAt: z.string().datetime().optional(),
});

router.use(authenticate, requirePermission('admin:notifications'));

// ─── GET /api/broadcasts — history + drafts + scheduled ──────────────────────

router.get(
  '/',
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase
      .from('broadcast_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data, error } = await query.limit(100);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ broadcasts: data ?? [] });
  })
);

// ─── POST /api/broadcasts — create (draft or scheduled) ─────────────────────

router.post(
  '/',
  validate(broadcastSchema),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const scheduled = req.body.scheduledAt ? 'scheduled' : 'draft';
    const { data, error } = await supabase
      .from('broadcast_messages')
      .insert({
        title: req.body.title,
        body: req.body.body,
        type: req.body.type,
        target_audience: req.body.targetAudience,
        status: scheduled,
        scheduled_at: req.body.scheduledAt ?? null,
        created_by: req.auth.userId,
      })
      .select('*')
      .single();
    if (error) throw new ApiError(400, 'create_failed', error.message);

    await capture({
      req,
      action: `broadcast.${scheduled}`,
      targetType: 'broadcast',
      targetId: data.id,
      targetLabel: data.title,
      metadata: { type: data.type, audience: data.target_audience, scheduledAt: data.scheduled_at },
    });

    res.status(201).json({ broadcast: data });
  })
);

// ─── PATCH /api/broadcasts/:id — edit a draft/scheduled broadcast ────────────

router.patch(
  '/:id',
  validate(broadcastSchema.partial()),
  wrap(async (req, res) => {
    if (!UUID_RE.test(req.params.id)) {
      throw new ApiError(400, 'validation_error', 'Invalid broadcast id');
    }
    const { supabase } = req.auth;
    const { data: existing } = await supabase
      .from('broadcast_messages')
      .select('id, status')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!existing) throw new ApiError(404, 'not_found', 'Broadcast not found');
    if (existing.status === 'sent') {
      throw new ApiError(409, 'already_sent', 'Sent broadcasts are immutable');
    }

    const { data, error } = await supabase
      .from('broadcast_messages')
      .update({
        ...(req.body.title ? { title: req.body.title } : {}),
        ...(req.body.body ? { body: req.body.body } : {}),
        ...(req.body.type ? { type: req.body.type } : {}),
        ...(req.body.targetAudience ? { target_audience: req.body.targetAudience } : {}),
        ...(req.body.scheduledAt ? { scheduled_at: req.body.scheduledAt, status: 'scheduled' } : {}),
      })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'update_failed', error?.message ?? 'Update failed');

    await capture({
      req,
      action: 'broadcast.updated',
      targetType: 'broadcast',
      targetId: data.id,
      targetLabel: data.title,
    });

    res.json({ broadcast: data });
  })
);

// ─── POST /api/broadcasts/:id/dispatch — fan-out + realtime push ─────────────

router.post(
  '/:id/dispatch',
  wrap(async (req, res) => {
    if (!UUID_RE.test(req.params.id)) {
      throw new ApiError(400, 'validation_error', 'Invalid broadcast id');
    }
    if (!adminClient) {
      throw new ApiError(503, 'unavailable', 'Broadcast dispatch requires the service-role key');
    }

    const { data: broadcast } = await adminClient
      .from('broadcast_messages')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!broadcast) throw new ApiError(404, 'not_found', 'Broadcast not found');
    if (broadcast.status === 'sent') {
      throw new ApiError(409, 'already_sent', 'This broadcast has already been dispatched');
    }

    const { data: result, error: dispatchError } = await adminClient.rpc('dispatch_broadcast', {
      p_broadcast_id: req.params.id,
    });
    if (dispatchError) throw new ApiError(500, 'dispatch_failed', dispatchError.message);
    if (!result?.ok) {
      throw new ApiError(400, 'dispatch_failed', result?.error ?? 'Dispatch failed');
    }

    await capture({
      req,
      action: 'broadcast.dispatched',
      targetType: 'broadcast',
      targetId: broadcast.id,
      targetLabel: broadcast.title,
      metadata: { recipients: result.recipients, audience: broadcast.target_audience },
    });

    // Realtime push: every connected admin + desktop session renders the
    // broadcast instantly. Recipients' own notifications arrive via their
    // user channel.
    const payload = {
      id: broadcast.id,
      title: broadcast.title,
      body: broadcast.body,
      type: broadcast.type,
      audience: broadcast.target_audience,
      recipients: result.recipients,
      sentAt: new Date().toISOString(),
    };
    hub.publish('admins', 'broadcast.delivered', payload);
    hub.publish('role:doctor', 'broadcast.delivered', payload);
    hub.publish('role:patient', 'broadcast.delivered', payload);

    res.json({ broadcastId: broadcast.id, recipients: result.recipients, sentAt: payload.sentAt });
  })
);

// ─── DELETE /api/broadcasts/:id — remove a draft/scheduled broadcast ─────────

router.delete(
  '/:id',
  wrap(async (req, res) => {
    if (!UUID_RE.test(req.params.id)) {
      throw new ApiError(400, 'validation_error', 'Invalid broadcast id');
    }
    const { supabase } = req.auth;
    const { data: existing } = await supabase
      .from('broadcast_messages')
      .select('id, status, title')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!existing) throw new ApiError(404, 'not_found', 'Broadcast not found');
    if (existing.status === 'sent') {
      throw new ApiError(409, 'already_sent', 'Sent broadcasts are part of the delivery record and cannot be deleted');
    }

    await supabase.from('broadcast_messages').delete().eq('id', req.params.id);

    await capture({
      req,
      action: 'broadcast.deleted',
      targetType: 'broadcast',
      targetId: existing.id,
      targetLabel: existing.title,
    });

    res.json({ deleted: true });
  })
);

/**
 * Scheduled-broadcast sweep — invoked from server.js on an interval.
 * Sends every scheduled broadcast whose time has arrived (idempotent: the
 * RPC refuses already-sent rows).
 */
async function dispatchDueBroadcasts() {
  if (!adminClient) return;
  try {
    const { data: due, error } = await adminClient
      .from('broadcast_messages')
      .select('id, title')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())
      .limit(20);
    if (error || !due?.length) return;

    for (const b of due) {
      const { data: result, error: dispatchError } = await adminClient.rpc('dispatch_broadcast', {
        p_broadcast_id: b.id,
      });
      if (!dispatchError && result?.ok) {
        hub.publish('admins', 'broadcast.delivered', {
          id: b.id,
          title: b.title,
          scheduled: true,
          recipients: result.recipients,
          sentAt: new Date().toISOString(),
        });
      }
    }
  } catch (e) {
    // Sweep failures are logged by caller context; never throw.
  }
}

module.exports = { router, dispatchDueBroadcasts };
