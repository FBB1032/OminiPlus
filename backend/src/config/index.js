/**
 * OminiPulse Backend — environment configuration
 *
 * All secrets live here, loaded once. Never import this file from client code.
 */

const path = require("path");
const dotenv = require("dotenv");

// Load backend/.env (fallback: repo root .env for local dev convenience)
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback = undefined) {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

const corsOrigins = optional("CORS_ORIGINS", "");

const config = {
  env: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", 8080)),

  // ─── Supabase (database + GoTrue auth) ─────────────────────────────────────
  supabase: {
    url: required("SUPABASE_URL", process.env.EXPO_PUBLIC_SUPABASE_URL),
    anonKey: required(
      "SUPABASE_ANON_KEY",
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    ),
    serviceKey: optional("SUPABASE_SERVICE_ROLE_KEY"), // server-only; enables admin ops
  },

  // ─── CORS ──────────────────────────────────────────────────────────────────
  cors: {
    // Comma-separated list of allowed origins; "*" allows all (dev only)
    origins: corsOrigins
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    allowAll: corsOrigins === "*" || corsOrigins === undefined,
  },

  // ─── Rate limits ───────────────────────────────────────────────────────────
  rateLimit: {
    windowMs: Number(optional("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000)),
    max: Number(optional("RATE_LIMIT_MAX", 300)),
    aiWindowMs: Number(optional("AI_RATE_LIMIT_WINDOW_MS", 60 * 1000)),
    aiMax: Number(optional("AI_RATE_LIMIT_MAX", 20)),
  },

  // ─── AI engine ─────────────────────────────────────────────────────────────
  ai: {
    // Groq-only model chain: if the primary model fails (decommissioned,
    // rate-limited, capacity error), the engine automatically retries with
    // the next model in GROQ_FALLBACK_MODELS.
    groq: {
      apiKey: optional("GROQ_API_KEY"),
      model: optional("GROQ_MODEL", "openai/gpt-oss-120b"),
      // Ordered fallback models — same Groq key, tried in sequence.
      fallbackModels: optional(
        "GROQ_FALLBACK_MODELS",
        "openai/gpt-oss-20b,groq/compound-mini,allam-2-7b",
      )
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      baseUrl: optional("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
    },
    fallbackModel: optional("AI_FALLBACK_MODEL", "rule-based"),
    maxTokens: Number(optional("AI_MAX_TOKENS", 1024)),
    temperature: Number(optional("AI_TEMPERATURE", 0.3)),
    timeoutMs: Number(optional("AI_TIMEOUT_MS", 30000)),
    dailyUserCap: Number(optional("AI_DAILY_USER_CAP", 30)),
  },
};

module.exports = config;
