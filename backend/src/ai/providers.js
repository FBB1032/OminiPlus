/**
 * AI provider adapters.
 *
 * Every adapter exposes the same contract so the router can fail over:
 *   async complete({ systemPrompt, messages, maxTokens, temperature }) => string
 *
 * Cost/speed rationale (why this ordering):
 *   1. Groq  — Llama 3.3 70B at ~free tier pricing, ~300 tok/s. Cheapest
 *              high-quality option today; the default primary.
 *   2. Gemini — 1.5 Flash has a generous free tier; strong medical reasoning.
 *   3. OpenAI — gpt-4o-mini as paid safety net.
 * If none is configured, callers fall back to deterministic rule-based logic,
 * so the product degrades instead of breaking.
 */

const config = require('../config');
const logger = require('../config/logger');

async function fetchJson(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(body?.error?.message ?? `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Groq (OpenAI-compatible chat completions API) ───────────────────────────

function groqProvider() {
  const { apiKey, model, baseUrl } = config.ai.groq;
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

// ─── Google Gemini ───────────────────────────────────────────────────────────

function geminiProvider() {
  const { apiKey, model, baseUrl } = config.ai.gemini;
  if (!apiKey) return null;
  return {
    name: 'gemini',
    model,
    async complete({ systemPrompt, messages, maxTokens, temperature }) {
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const body = await fetchJson(
        `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: maxTokens, temperature },
          }),
        },
        config.ai.timeoutMs
      );
      return (
        body.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
      );
    },
  };
}

// ─── OpenAI (safety net) ─────────────────────────────────────────────────────

function openaiProvider() {
  const { apiKey, model, baseUrl } = config.ai.openai;
  if (!apiKey) return null;
  return {
    name: 'openai',
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

function buildChain() {
  const providers = [groqProvider(), geminiProvider(), openaiProvider()].filter(Boolean);
  if (providers.length === 0) {
    logger.warn('No AI provider configured — AI endpoints will use rule-based fallback');
  }
  return providers;
}

module.exports = { buildChain };
