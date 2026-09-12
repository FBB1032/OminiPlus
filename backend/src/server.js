/**
 * Server entry point.
 */

const config = require('./config');
const logger = require('./config/logger');
const app = require('./app');
const hub = require('./realtime/hub');
const { dispatchDueBroadcasts } = require('./routes/broadcasts');

const server = app.listen(config.port, () => {
  // WebSocket realtime hub shares the HTTP server (path /ws) — powers live
  // appointment sync + broadcast delivery.
  hub.attach(server);

  // Scheduled-broadcast sweep: dispatch any broadcast whose time arrived.
  const sweep = setInterval(() => {
    dispatchDueBroadcasts().catch((e) => logger.warn('broadcast sweep failed', { message: e.message }));
  }, 60_000);
  sweep.unref?.();

  const groqChain = config.ai.groq.apiKey
    ? [config.ai.groq.model, ...config.ai.groq.fallbackModels].join(' → ')
    : 'none (rule-based fallback)';
  logger.info('OminiPulse backend started', {
    port: config.port,
    env: config.env,
    supabase: config.supabase.url,
    ai: groqChain,
    realtime: '/ws',
  });
});

async function shutdown(signal) {
  logger.info('Shutting down', { signal });
  hub.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
