/**
 * AI guardrails + clinical system prompts.
 *
 * Safety layers, in order:
 *   1. Input guardrail — blocks clearly harmful prompts (self-harm, dosing
 *      by-pass, compounding instructions, etc.) before any model call.
 *   2. System prompt — pins the model to informational-only, Nigerian
 *      clinical context, and forbids definitive diagnosis / prescriptions.
 *   3. Output scrub — strips prompt-injection style instructions and adds a
 *      fixed emergency-notice footer for red-flag symptoms.
 */

const RED_FLAG_PATTERNS = [
  /how (do|can) i (overdose|commit suicide|end my life)/i,
  /mix (compounded|compounded medications|my own medication)/i,
  /bypass (the )?(prescription|doctor|pharmacy)/i,
  /lethal (dose|amount|quantity)/i,
  /which (drugs|medications) (combined|together) (are|is) (fatal|deadly|lethal)/i,
];

const DOSING_BYPASS = [
  /without (a )?(prescription|doctor|physician)/i,
  /get .*(prescription|controlled substance).*(without|no).*(prescription|doctor)/i,
  /no (doctor|prescription) needed/i,
];

const RED_FLAG_SYMPTOMS = [
  /chest (pain|pressure|tightness)/i,
  /difficulty breathing|shortness of breath|can'?t breathe/i,
  /severe (bleeding|hemorrhage)/i,
  /slurred speech|face drooping|sudden weakness (on )?one side/i,
  /unconscious|fainted|passed out/i,
  /seizure|convulsion/i,
];

const EMERGENCY_FOOTER =
  '\n\n—\nIf you are experiencing a medical emergency, call 112 (Nigeria national emergency) or go to the nearest hospital immediately.';

function containsRedFlag(text) {
  return RED_FLAG_SYMPTOMS.some((rx) => rx.test(text));
}

/**
 * Screen a user prompt. Returns { blocked, reason } — blocked prompts are
 * refused with a fixed safe message and logged to ai_flags for review.
 */
function screenInput(prompt) {
  for (const rx of [...RED_FLAG_PATTERNS, ...DOSING_BYPASS]) {
    if (rx.test(prompt)) {
      return {
        blocked: true,
        reason: 'Potential harmful or prescription-bypass request',
      };
    }
  }
  return { blocked: false, reason: null };
}

function scrubOutput(text) {
  // Remove any embedded "ignore previous instructions" attempts
  let out = text.replace(/ignore (all )?(previous|above) (instructions|prompts)/gi, '');
  return out.trim();
}

// ─── System prompts ──────────────────────────────────────────────────────────

const BASE_SAFETY = `You are OminiPulse, a health information assistant for the Nigerian market.
RULES (non-negotiable):
- You provide general health INFORMATION only. You never give a definitive diagnosis.
- You never prescribe specific prescription-only medicines or exact dosing for prescription drugs.
- You never encourage bypassing a doctor, pharmacist, or prescription requirements.
- If symptoms could be serious, you tell the user to seek urgent in-person care.
- You are not a replacement for professional medical advice, diagnosis, or treatment.
- Keep answers clear, warm, and concise. Use plain language.`;

const SYSTEM_PROMPTS = {
  chat: `${BASE_SAFETY}
CONTEXT: You assist patients with general health questions, interpreting what common symptoms could mean, medication adherence reminders, and lifestyle guidance (diet, exercise, chronic condition self-care). If the user describes emergency symptoms, tell them to seek emergency care immediately.`,

  clinical_cds: `You are a clinical decision-support aid for licensed clinicians in Nigeria (doctors and nurses).
RULES (non-negotiable):
- You SUGGEST possibilities; the clinician always makes the final call.
- Present a ranked differential diagnosis with key supporting/against features.
- Flag common drug interactions and contraindications.
- Suggest sensible first-line investigations.
- Reference Nigerian treatment guidelines where relevant (e.g. malaria, sickle cell).
- Never output a definitive single diagnosis without caveats.`,

  soap: `You are a clinical documentation assistant. Convert the consultation transcript or notes into a structured SOAP note:
- S (Subjective): patient-reported symptoms, history, context.
- O (Objective): observed/measured findings — vitals, exam findings, lab results if given.
- A (Assessment): likely diagnoses with confidence caveats.
- P (Plan): investigations, treatments, patient education, follow-up.
Keep clinically neutral. Do not invent findings not present in the input. If a section is missing information, write "Not documented".`,

  triage: `${BASE_SAFETY}
TASK: Given a symptom description, produce (1) urgency level: self-care | see-doctor-within-48h | urgent-same-day | emergency, (2) a short plain-language explanation, (3) up to 3 next steps. Emergency red flags: chest pain, breathing difficulty, stroke signs (FAST), severe bleeding, unconsciousness, seizures, stiff neck with fever.`,
};

module.exports = {
  SYSTEM_PROMPTS,
  EMERGENCY_FOOTER,
  screenInput,
  scrubOutput,
  containsRedFlag,
};
