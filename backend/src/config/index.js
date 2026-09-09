/**
 * OminiPulse Backend — environment configuration
 *
 * All secrets live here, loaded once. Never import this file from client code.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load backend/.env (fallback: repo root .env for local dev convenience)
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback = undefined) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

const config = {
  env: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', 8080)),

  // ─── Supabase (database + GoTrue auth) ─────────────────────────────────────
  supabase: {
    url: required('SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
    anonKey: required('SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
    serviceKey: optional('SUPABASE_SERVICE_ROLE_KEY'), // server-only; enables admin ops
  },

  // ─── CORS ──────────────────────────────────────────────────────────────────
  cors: {
    // Comma-separated list of allowed origins; "*" allows all (dev only)
    origins: optional('CORS_ORIGINS', 'http://localhost:3000,http://localhost:8081,http://localhost:19006')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    allowAll: optional('CORS_ORIGINS', '') === '*',
  },

  // ─── Rate limits ───────────────────────────────────────────────────────────
  rateLimit: {
    windowMs: Number(optional('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000)),
    max: Number(optional('RATE_LIMIT_MAX', 300)),
    aiWindowMs: Number(optional('AI_RATE_LIMIT_WINDOW_MS', 60 * 1000)),
    aiMax: Number(optional('AI_RATE_LIMIT_MAX', 20)),
  },

  // ─── AI engine ─────────────────────────────────────────────────────────────
  ai: {
    // Ordered provider chain: first configured provider with quota wins.
    // Groq is the default primary (free tier, fastest tokens/sec).
    groq: {
      apiKey: optional('GROQ_API_KEY'),
      model: optional('GROQ_MODEL', 'llama-3.3-70b-versatile'),
      baseUrl: 'https://api.groq.com/openai/v1',
    },
    gemini: {
      apiKey: optional('GEMINI_API_KEY'),
      model: optional('GEMINI_MODEL', 'gemini-1.5-flash'),
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    },
    openai: {
      apiKey: optional('OPENAI_API_KEY'),
      model: optional('OPENAI_MODEL', 'gpt-4o-mini'),
      baseUrl: 'https://api.openai.com/v1',
    },
    fallbackModel: optional('AI_FALLBACK_MODEL', 'rule-based'),
    maxTokens: Number(optional('AI_MAX_TOKENS', 1024)),
    temperature: Number(optional('AI_TEMPERATURE', 0.3)),
    timeoutMs: Number(optional('AI_TIMEOUT_MS', 30000)),
    dailyUserCap: Number(optional('AI_DAILY_USER_CAP', 30)),
  },
};

module.exports = config;
