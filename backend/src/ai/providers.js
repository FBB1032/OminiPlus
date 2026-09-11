/**
 * AI provider adapters — Groq-only.
 *
 * Every adapter exposes the same contract so the router can fail over:
 *   async complete({ systemPrompt, messages, maxTokens, temperature }) => string
 *
 * High-availability strategy (all on one Groq API key):
 *   1. `openai/gpt-oss-120b` — strongest general model on Groq; primary.
 *   2. `openai/gpt-oss-20b`  — same family, smaller; fast capacity relief.
 *   3. `groq/compound-mini`  — agentic compound system; independent stack.
 *   4. `allam-2-7b`          — small always-on model; last resort.
 *
 * If a model errors (decommissioned, 429/503 capacity, timeout), the engine
 * automatically retries the request with the next model in the chain. A 401
 * (bad key) fails fast — no model would fix it. If none respond, callers
 * fall back to deterministic rule-based logic, so the product degrades
 * instead of breaking.
 *
 * The chain can be overridden via GROQ_MODEL / GROQ_FALLBACK_MODELS.
 */

const config = require('../config');
const logger = require('../config/logger');

// Errors that mean "switch model" vs "give up entirely"
const FATAL_STATUS = new Set([401, 403]); // bad/expired key or forbidden org

async function fetchJson(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(body?.error?.message ?? `HTTP ${res.status}`);
      err.status = res.status;
      err.code = body?.error?.code;
      throw err;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Groq (OpenAI-compatible chat completions API) ───────────────────────────

function groqModelProvider(model) {
  const { apiKey, baseUrl } = config.ai.groq;
  if (!apiKey) return null;
  return {
    name: 'groq',
    model,
    async complete({ systemPrompt, messages, maxTokens, temperature }) {
      const body = await fetchJson(
        `${baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            temperature,
            max_tokens: maxTokens,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
          }),
        },
        config.ai.timeoutMs
      );
      return body.choices?.[0]?.message?.content ?? '';
    },
  };
}

/**
 * Build the ordered Groq model chain: primary first, then fallback models.
 * The primary is excluded from fallbacks to avoid retrying it twice.
 */
function buildChain() {
  const { apiKey, model, fallbackModels } = config.ai.groq;
  if (!apiKey) {
    logger.warn('No GROQ_API_KEY configured — AI endpoints will use rule-based fallback');
    return [];
  }
  const models = [model, ...fallbackModels.filter((m) => m !== model)];
  logger.info('Groq model chain', { models: models.join(' → ') });
  return models.map((m) => groqModelProvider(m)).filter(Boolean);
}

module.exports = { buildChain, FATAL_STATUS };
