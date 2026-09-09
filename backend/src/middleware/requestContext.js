/**
 * Request context middleware — attaches a per-request logger + Supabase client
 * factory, and records request timing.
 */

const { createUserClient } = require('../config/supabase');
const logger = require('../config/logger');

module.exports = function requestContext(req, res, next) {
  const started = Date.now();
  req.logger = {
    info: (msg, meta) => logger.info(msg, { reqId: req.id, path: req.path, ...meta }),
    warn: (msg, meta) => logger.warn(msg, { reqId: req.id, path: req.path, ...meta }),
    error: (msg, meta) => logger.error(msg, { reqId: req.id, path: req.path, ...meta }),
  };
  req.supabase = (token) => createUserClient(token);
  res.on('finish', () => {
    req.logger.info('request', { status: res.statusCode, ms: Date.now() - started });
  });
  next();
};
