/**
 * Rule-based vitals sentinel — zero-cost anomaly detection for wearable/manual
 * readings. Runs before any model call; matches the sentinel thresholds from
 * NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md (Stage 5, Sentinel Vitals Monitoring).
 */

const RULES = [
  {
    key: 'tachycardia_rest',
    match: (r) => r.reading_type === 'heart_rate' && (r.pulse ?? r.value) != null && (r.pulse ?? r.value) > 120,
    severity: 'critical',
    message: 'Resting heart rate above 120 bpm — possible tachycardia. Seek urgent evaluation.',
  },
  {
    key: 'bradycardia_rest',
    match: (r) => r.reading_type === 'heart_rate' && (r.pulse ?? r.value) != null && (r.pulse ?? r.value) < 45,
    severity: 'critical',
    message: 'Resting heart rate below 45 bpm — possible bradycardia. Seek urgent evaluation.',
  },
  {
    key: 'hypoxemia',
    match: (r) => r.reading_type === 'spo2' && r.value != null && r.value < 92,
    severity: 'critical',
    message: 'Blood oxygen below 92% — possible hypoxemia. Seek emergency care now.',
  },
  {
    key: 'hypertensive_crisis',
    match: (r) =>
      r.reading_type === 'blood_pressure' && (r.systolic ?? 0) >= 180 && (r.diastolic ?? 0) >= 120,
    severity: 'critical',
    message: 'Blood pressure at hypertensive-crisis level. Seek emergency care now.',
  },
  {
    key: 'hypertension_stage2',
    match: (r) => r.reading_type === 'blood_pressure' && (r.systolic ?? 0) >= 140,
    severity: 'warning',
    message: 'Blood pressure is high (stage 2 range). Contact your doctor within 24 hours.',
  },
  {
    key: 'hypoglycemia',
    match: (r) => r.reading_type === 'blood_glucose' && r.value != null && r.value < 70,
    severity: 'critical',
    message: 'Blood glucose below 70 mg/dL — possible hypoglycemia. Take fast-acting sugar now.',
  },
  {
    key: 'hyperglycemia',
    match: (r) => r.reading_type === 'blood_glucose' && r.value != null && r.value > 250,
    severity: 'warning',
    message: 'Blood glucose above 250 mg/dL. Contact your doctor; check for ketones if Type 1.',
  },
];

/**
 * Evaluate a single vitals reading.
 * @returns {{ alerts: Array<{key, severity, message}> }}
 */
function evaluateReading(reading) {
  const alerts = [];
  for (const rule of RULES) {
    try {
      if (rule.match(reading)) {
        alerts.push({ key: rule.key, severity: rule.severity, message: rule.message });
      }
    } catch {
      // a malformed reading field never crashes the sentinel
    }
  }
  return { alerts };
}

module.exports = { evaluateReading, RULES };
