/**
 * Validation middleware factory — parses a zod schema and replaces req.body
 * with the sanitized result.
 */

const { ApiError } = require('./errors');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(
      new ApiError(400, 'validation_error', 'Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      })
    );
  }
  req.body = result.data;
  next();
};

module.exports = { validate };
