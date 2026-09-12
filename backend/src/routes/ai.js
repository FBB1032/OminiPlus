/**
 * AI routes — mobile app AI features.
 *
 * All endpoints are JWT-authenticated and rate-limited more aggressively
 * than the rest of the API (models are the scarce resource).
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const config = require('../config');
const { wrap, ApiError } = require('../middleware/errors');
const { validate } = require('../middleware/validate');
const { authenticate, requirePermission } = require('../middleware/auth');
const ai = require('../ai/engine');
const sentinel = require('../ai/sentinel');
const { logInteraction } = require('../services/aiInteractionLog');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: config.rateLimit.aiWindowMs,
  max: config.rateLimit.aiMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Too many AI requests — please wait a minute.' } },
});

const chatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(30),
});

const cdsSchema = z.object({
  presentation: z.string().min(10).max(6000),
  history: z.string().max(3000).optional(),
  medications: z.string().max(2000).optional(),
  vitals: z.string().max(1000).optional(),
});

const soapSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  transcript: z.string().min(20).max(20000),
});

const triageSchema = z.object({
  symptoms: z.string().min(3).max(4000),
  duration: z.string().max(200).optional(),
});

async function ensureUsageBudget(supabase, userId) {
  const used = await ai.countUsageToday(supabase, userId);
  if (used >= config.ai.dailyUserCap) {
    throw new ApiError(429, 'ai_quota_exceeded', `Daily AI limit reached (${config.ai.dailyUserCap}/day). Try again tomorrow.`);
  }
  return used;
}

// ─── POST /api/ai/chat — patient/doctor AI assistant ─────────────────────────

router.post(
  '/chat',
  authenticate,
  requirePermission('ai:chat'),
  aiLimiter,
  validate(chatSchema),
  wrap(async (req, res) => {
    await ensureUsageBudget(req.auth.supabase, req.auth.userId);

    let conversationId = req.body.conversationId ?? null;

    // Load or create conversation (RLS: users only see their own)
    if (conversationId) {
      const { data: existing, error } = await req.auth.supabase
        .from('ai_conversations')
        .select('id')
        .eq('id', conversationId)
        .maybeSingle();
      if (error) throw new ApiError(500, 'db_error', error.message);
      if (!existing) throw new ApiError(404, 'not_found', 'Conversation not found');
    } else {
      const { data: created, error } = await req.auth.supabase
        .from('ai_conversations')
        .insert({ profile_id: req.auth.userId, feature: 'chat' })
        .select('id')
        .single();
      if (error) throw new ApiError(500, 'db_error', error.message);
      conversationId = created.id;
    }

    const lastUser = req.body.messages[req.body.messages.length - 1];
    const { data: stored, error: storeErr } = await req.auth.supabase
      .from('ai_messages')
      .insert({ conversation_id: conversationId, role: 'user', content: lastUser.content })
      .select('id')
      .single();
    if (storeErr) throw new ApiError(500, 'db_error', storeErr.message);

    const result = await ai.chat({
      supabase: req.auth.supabase,
      userId: req.auth.userId,
      messages: req.body.messages,
    });

    await req.auth.supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: result.reply,
      provider: result.provider,
      model: result.model,
    });

    await ai.recordUsage(req.auth.supabase, req.auth.userId, 'chat', result.provider, result.model, 0, 0, result.urgency === 'blocked');

    // AI interaction audit: prompt + generated response (admin reviewable).
    logInteraction({
      req,
      feature: 'chat',
      prompt: lastUser.content,
      response: result.reply,
      provider: result.provider,
      model: result.model,
      urgency: result.urgency,
      flagged: result.urgency === 'blocked',
      conversationId,
    });

    res.json({
      conversationId,
      reply: result.reply,
      provider: result.provider,
      model: result.model,
      urgency: result.urgency,
    });
  })
);

// ─── GET /api/ai/conversations/:id — fetch transcript ────────────────────────

router.get(
  '/conversations/:id',
  authenticate,
  requirePermission('ai:chat'),
  wrap(async (req, res) => {
    const { data, error } = await req.auth.supabase
      .from('ai_messages')
      .select('id, role, content, provider, model, created_at')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true });
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ messages: data ?? [] });
  })
);

// ─── POST /api/ai/cds — clinician decision support ──────────────────────────

router.post(
  '/cds',
  authenticate,
  requirePermission('ai:clinical_cds'),
  aiLimiter,
  validate(cdsSchema),
  wrap(async (req, res) => {
    await ensureUsageBudget(req.auth.supabase, req.auth.userId);
    const result = await ai.clinicalCds(req.body);
    await ai.recordUsage(req.auth.supabase, req.auth.userId, 'clinical_cds', result.provider, result.model, 0, 0, false);

    logInteraction({
      req,
      feature: 'clinical_cds',
      prompt: req.body.presentation,
      response: result.reply,
      provider: result.provider,
      model: result.model,
    });

    res.json(result);
  })
);

// ─── POST /api/ai/soap — voice/note → SOAP ───────────────────────────────────

router.post(
  '/soap',
  authenticate,
  requirePermission('ai:soap'),
  aiLimiter,
  validate(soapSchema),
  wrap(async (req, res) => {
    await ensureUsageBudget(req.auth.supabase, req.auth.userId);
    const result = await ai.generateSoap({ transcript: req.body.transcript });

    if (req.body.appointmentId && result.soap) {
      // Upsert draft SOAP note for the appointment (RLS: doctor-owned)
      const { error } = await req.auth.supabase.from('soap_notes').upsert(
        {
          appointment_id: req.body.appointmentId,
          subjective: extractSection(result.soap, 'S'),
          objective: extractSection(result.soap, 'O'),
          assessment: extractSection(result.soap, 'A'),
          plan: extractSection(result.soap, 'P'),
          created_by: req.auth.userId,
        },
        { onConflict: 'appointment_id' }
      );
      if (error) {
        req.logger.warn('SOAP persist failed', { message: error.message });
      }
    }

    await ai.recordUsage(req.auth.supabase, req.auth.userId, 'soap', result.provider, result.model, 0, 0, false);

    logInteraction({
      req,
      feature: 'soap',
      prompt: req.body.transcript,
      response: result.reply,
      provider: result.provider,
      model: result.model,
    });

    res.json(result);
  })
);

function extractSection(text, letter) {
  const names = { S: 'Subjective', O: 'Objective', A: 'Assessment', P: 'Plan' };
  const rx = new RegExp(`\\*?\\*?${letter}\\s*\\(?${names[letter]}\\)?\\*?\\*?\\s*:?\\s*([\\s\\S]*?)(?=(?:\\n\\s*\\*?\\*?[SOAP]\\b)|$)`, 'i');
  const m = text.match(rx);
  return m ? m[1].trim() : null;
}

// ─── POST /api/ai/triage — symptom checker (mobile app) ──────────────────────

router.post(
  '/triage',
  authenticate,
  requirePermission('ai:chat'),
  aiLimiter,
  validate(triageSchema),
  wrap(async (req, res) => {
    await ensureUsageBudget(req.auth.supabase, req.auth.userId);
    const result = await ai.triage(req.body);
    await ai.recordUsage(req.auth.supabase, req.auth.userId, 'triage', result.provider, result.model, 0, 0, result.urgency === 'blocked');

    logInteraction({
      req,
      feature: 'triage',
      prompt: req.body.symptoms,
      response: result.reply ?? result.triage ?? null,
      provider: result.provider,
      model: result.model,
      urgency: result.urgency,
      flagged: result.urgency === 'blocked',
    });

    res.json(result);
  })
);

// ─── POST /api/ai/sentinel — evaluate a vitals reading (rule-based, free) ─────

router.post(
  '/sentinel',
  authenticate,
  requirePermission('ai:sentinel'),
  wrap(async (req, res) => {
    const reading = req.body;
    const { alerts } = sentinel.evaluateReading(reading);

    logInteraction({
      req,
      feature: 'sentinel',
      prompt: JSON.stringify(reading).slice(0, 4000),
      response: JSON.stringify(alerts).slice(0, 4000),
      provider: 'rules',
      model: 'sentinel',
    });

    // Persist critical alerts as notifications for the patient
    for (const alert of alerts.filter((a) => a.severity === 'critical')) {
      await req.auth.supabase.from('notifications').insert({
        profile_id: req.auth.userId,
        type: 'general',
        title: 'Vitals Alert',
        body: alert.message,
      });
    }

    res.json({ alerts });
  })
);

module.exports = router;
