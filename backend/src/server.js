/**
 * Server entry point.
 */

const config = require('./config');
const logger = require('./config/logger');
const app = require('./app');

const server = app.listen(config.port, () => {
  const groqChain = config.ai.groq.apiKey
    ? [config.ai.groq.model, ...config.ai.groq.fallbackModels].join(' → ')
    : 'none (rule-based fallback)';
  logger.info('OminiPulse backend started', {
    port: config.port,
    env: config.env,
    supabase: config.supabase.url,
    ai: groqChain,
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
