/**
 * Express app assembly — middleware stack, route mounting, error handling.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errors');
const requestContext = require('./middleware/requestContext');

const authRoutes = require('./routes/auth');
const doctorsRoutes = require('./routes/doctors');
const appointmentsRoutes = require('./routes/appointments');
const patientsRoutes = require('./routes/patients');
const vitalsRoutes = require('./routes/vitals');
const hospitalRoutes = require('./routes/hospital');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const { router: broadcastRoutes } = require('./routes/broadcasts');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

// ─── Security & transport ────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: config.cors.allowAll ? true : config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// ─── Global rate limit ───────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ─── Request context (logger + supabase factory) ─────────────────────────────
app.use(requestContext);

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'ominipulse-backend',
    env: config.env,
    time: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/broadcasts', broadcastRoutes);

// ─── 404 + errors ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
