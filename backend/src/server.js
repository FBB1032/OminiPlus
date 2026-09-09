/**
 * Server entry point.
 */

const config = require('./config');
const logger = require('./config/logger');
const app = require('./app');

const server = app.listen(config.port, () => {
  logger.info('OminiPulse backend started', {
    port: config.port,
    env: config.env,
    supabase: config.supabase.url,
    aiProviders: ['groq', 'gemini', 'openai'].filter((p) => config.ai[p].apiKey).join('>') || 'none (rule-based fallback)',
  });
});

async function shutdown(signal) {
  logger.info('Shutting down', { signal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
