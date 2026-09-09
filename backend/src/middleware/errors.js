/**
 * Async route wrapper — forwards rejected promises to the error middleware
 * so handlers can be written without try/catch noise.
 */

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class ApiError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function notFound(req, res) {
  res.status(404).json({ error: { code: 'not_found', message: `Route ${req.method} ${req.path} not found` } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status ?? 500;
  if (status >= 500) {
    req.logger?.error('Unhandled error', { path: req.path, message: err.message, stack: err.stack });
  }
  res.status(status).json({
    error: {
      code: err.code ?? 'internal_error',
      message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

module.exports = { wrap, ApiError, notFound, errorHandler };
