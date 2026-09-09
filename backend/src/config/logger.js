/**
 * Minimal structured logger — stdout only, one line per event.
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const current = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function emit(level, message, meta) {
  if (LEVELS[level] > current) return;
  const entry = { ts: new Date().toISOString(), level, msg: message };
  if (meta !== undefined) {
    for (const [k, v] of Object.entries(meta)) {
      if (v !== undefined) entry[k] = v;
    }
  }
  process.stdout.write(JSON.stringify(entry) + '\n');
}

module.exports = {
  error: (msg, meta) => emit('error', msg, meta),
  warn: (msg, meta) => emit('warn', msg, meta),
  info: (msg, meta) => emit('info', meta),
  debug: (msg, meta) => emit('debug', msg, meta),
};
