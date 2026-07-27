/**
 * OminiPlus AI — Environment-aware logger.
 *
 * In production (__DEV__ === false) all methods are no-ops so no sensitive
 * information (tokens, user objects, storage keys) leaks to the console.
 * In development each call is prefixed with [OminiPlus] for easy filtering.
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';

const PREFIX = '[OminiPlus]';

const noop = () => undefined;

const createLogger = (level: LogLevel) =>
  __DEV__
    ? (...args: unknown[]) => console[level](PREFIX, ...args)
    : noop;

export const logger = {
  log: createLogger('log'),
  info: createLogger('info'),
  warn: createLogger('warn'),
  error: createLogger('error'),
} as const;
