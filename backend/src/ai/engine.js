/**
 * AI engine facade — single entry point for all model calls.
 *
 * Responsibilities:
 *   • Route through the Groq model chain (gpt-oss-120b → gpt-oss-20b →
 *     compound-mini → allam-2-7b) with automatic failover
 *   • Apply guardrails before/after every call
 *   • Enforce a per-user daily usage cap
 *   • Persist conversations + usage to Supabase (ai_conversations, ai_usage)
 */

const config = require('../config');
const logger = require('../config/logger');
const { buildChain, FATAL_STATUS } = require('./providers');
const { SYSTEM_PROMPTS, screenInput, scrubOutput, containsRedFlag, EMERGENCY_FOOTER } = require('./guardrails');

const chain = buildChain();

const BLOCKED_REPLY =
  'I can\u2019t help with that request. For anything involving prescriptions or specific dosing, please consult a licensed doctor or pharmacist. If this is urgent, visit the nearest hospital or call 112.';

/**
 * Core completion with model failover + guardrails.
 * @param {object} opts { systemPrompt, messages, maxTokens?, temperature? }
 * @returns {{ text: string, provider: string, model: string, fallback: boolean }}
 */
async function complete(opts) {
  const { systemPrompt, messages } = opts;
  const maxTokens = opts.maxTokens ?? config.ai.maxTokens;
  const temperature = opts.temperature ?? config.ai.temperature;

  for (const provider of chain) {
    try {
      let text = await provider.complete({ systemPrompt, messages, maxTokens, temperature });
      text = scrubOutput(text);
      if (!text) throw new Error('Empty completion');
      return { text, provider: provider.name, model: provider.model, fallback: false };
    } catch (err) {
      logger.warn('Groq model failed; trying next in chain', { model: provider.model, status: err.status, code: err.code, message: err.message });
      // 401/403 = the API key is invalid/forbidden — no model can fix that.
      if (err.status && FATAL_STATUS.has(err.status)) break;
    }
  }
  return { text: '', provider: 'none', model: config.ai.fallbackModel, fallback: true };
}

/**
 * Patient-facing chat completion with full safety pipeline.
 * @param {object} ctx { supabase, userId, messages: [{role, content}] }
 */
async function chat(ctx) {
  const lastUser = [...ctx.messages].reverse().find((m) => m.role === 'user');
  const prompt = lastUser?.content ?? '';

  const screen = screenInput(prompt);
  if (screen.blocked) {
    await flagPrompt(ctx, prompt, screen.reason, 'high').catch(() => {});
    return { reply: BLOCKED_REPLY, provider: 'guardrail', model: 'blocked', urgency: 'blocked' };
  }

  const result = await complete({
    systemPrompt: SYSTEM_PROMPTS.chat,
    messages: ctx.messages,
  });

  let reply = result.fallback ? fallbackChatReply(prompt) : result.text;
  if (containsRedFlag(prompt) || containsRedFlag(reply)) {
    reply += EMERGENCY_FOOTER;
  }
  return { reply, provider: result.provider, model: result.model, urgency: containsRedFlag(prompt) ? 'red_flag' : 'normal' };
}

/**
 * Clinician CDS differential + interaction check.
 */
async function clinicalCds(ctx) {
  const prompt = [
    `Patient presentation: ${ctx.presentation}`,
    ctx.history ? `Relevant history: ${ctx.history}` : '',
    ctx.medications ? `Current medications: ${ctx.medications}` : '',
    ctx.vitals ? `Vitals: ${ctx.vitals}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const result = await complete({
    systemPrompt: SYSTEM_PROMPTS.clinical_cds,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  const reply = result.fallback
    ? 'CDS unavailable right now. Please rely on clinical judgement and local guidelines; no differential could be generated.'
    : result.text;
  return { reply, provider: result.provider, model: result.model };
}

/**
 * Ambient SOAP note generation from a transcript.
 */
async function generateSoap(ctx) {
  const result = await complete({
    systemPrompt: SYSTEM_PROMPTS.soap,
    messages: [{ role: 'user', content: `Consultation transcript/notes:\n${ctx.transcript}` }],
    temperature: 0.2,
    maxTokens: Math.max(config.ai.maxTokens, 1400),
  });

  if (result.fallback) {
    return {
      soap: null,
      reply: 'SOAP generation is temporarily unavailable. Use manual structured entry.',
      provider: result.provider,
      model: result.model,
    };
  }
  return { soap: result.text, reply: result.text, provider: result.provider, model: result.model };
}

/**
 * Symptom triage for the mobile app.
 */
async function triage(ctx) {
  const screen = screenInput(ctx.symptoms);
  if (screen.blocked) {
    return { reply: BLOCKED_REPLY, urgency: 'blocked', provider: 'guardrail', model: 'blocked' };
  }

  const result = await complete({
    systemPrompt: SYSTEM_PROMPTS.triage,
    messages: [{ role: 'user', content: `Symptoms: ${ctx.symptoms}\nDuration: ${ctx.duration ?? 'not stated'}` }],
    temperature: 0.1,
  });

  if (result.fallback) return { ...fallbackTriage(ctx.symptoms), provider: 'rule-based', model: 'fallback' };

  let reply = result.text;
  let urgency = 'unknown';
  const m = reply.match(/urgency:\s*(self-care|see-doctor-within-48h|urgent-same-day|emergency)/i);
  if (m) urgency = m[1].toLowerCase();
  if (containsRedFlag(ctx.symptoms)) {
    urgency = 'emergency';
    if (!/112|emergency/i.test(reply)) reply += EMERGENCY_FOOTER;
  }
  return { reply, urgency, provider: result.provider, model: result.model };
}

// ─── Deterministic fallbacks (zero-cost, no provider needed) ─────────────────

function fallbackChatReply(prompt) {
  if (containsRedFlag(prompt)) {
    return (
      'Your symptoms may indicate a serious condition. Please seek emergency care now — call 112 or go to the nearest hospital.' +
      EMERGENCY_FOOTER
    );
  }
  return (
    'The AI assistant is temporarily unavailable. Here is safe general guidance:\n' +
    '- Rest and monitor your symptoms.\n' +
    '- Stay hydrated.\n' +
    '- If symptoms persist beyond 48 hours or worsen, book a consultation with a doctor.\n' +
    EMERGENCY_FOOTER
  );
}

function fallbackTriage(symptoms) {
  if (containsRedFlag(symptoms)) {
    return {
      urgency: 'emergency',
      reply: 'EMERGENCY: your symptoms match serious warning signs. Call 112 or go to the nearest hospital now.' + EMERGENCY_FOOTER,
    };
  }
  return {
    urgency: 'see-doctor-within-48h',
    reply:
      'The triage assistant is temporarily unavailable. If symptoms persist beyond 48 hours or worsen, book a doctor consultation.' +
      EMERGENCY_FOOTER,
  };
}

// ─── Persistence helpers ─────────────────────────────────────────────────────

async function flagPrompt(ctx, prompt, reason, severity) {
  // Insert via the service-role client: the only write policy on ai_flags is
  // admin-gated, so the caller's client would silently fail RLS and the
  // admin review queue would stay empty.
  const { adminClient } = require('../config/supabase');
  if (!adminClient) return;
  await adminClient
    .from('ai_flags')
    .insert({ profile_id: ctx.userId ?? null, prompt, reason, severity, status: 'pending' });
}

async function countUsageToday(supabase, userId) {
  const { data, error } = await supabase.rpc('ai_count_usage_today', { p_user_id: userId });
  if (error) {
    logger.warn('usage count rpc failed', { message: error.message });
    return 0;
  }
  return Number(data ?? 0);
}

async function recordUsage(supabase, userId, feature, provider, model, tokensIn, tokensOut, flagged) {
  await supabase.from('ai_usage').insert({
    profile_id: userId,
    feature,
    provider,
    model,
    prompt_tokens: tokensIn ?? 0,
    completion_tokens: tokensOut ?? 0,
    flagged: flagged ?? false,
  });
}

module.exports = {
  chain,
  complete,
  chat,
  clinicalCds,
  generateSoap,
  triage,
  recordUsage,
  countUsageToday,
  EMERGENCY_FOOTER,
};
