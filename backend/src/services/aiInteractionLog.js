/**
 * AI interaction logging — records every user↔AI prompt/response pair into
 * public.ai_interaction_logs (0006) for administrative review.
 *
 * Writes use the service-role client (the table's insert path is the
 * security-definer RPC `log_ai_interaction`, executable only by the service
 * role) so:
 *   • users cannot forge logs attributed to other profiles,
 *   • a logging failure never breaks the AI response — it is fire-and-forget
 *     with a structured error log for follow-up.
 */

const logger = require('../config/logger');
const { adminClient } = require('../config/supabase');

/**
 * @param {object} opts
 * @param {object} opts.req              Express request (req.auth = { userId, profile })
 * @param {string} opts.feature          'chat' | 'triage' | 'clinical_cds' | 'soap' | 'sentinel'
 * @param {string} opts.prompt           the user's input prompt
 * @param {string} [opts.response]       the generated response
 * @param {string} [opts.provider]
 * @param {string} [opts.model]
 * @param {string} [opts.urgency]
 * @param {boolean} [opts.flagged]
 * @param {string} [opts.conversationId]
 */
function logInteraction({ req, feature, prompt, response, provider, model, urgency, flagged = false, conversationId }) {
  // Fire-and-forget: never await in the request path.
  setImmediate(() => {
    const profile = req?.auth?.profile;
    const payload = {
      p_profile_id: req?.auth?.userId,
      p_profile_role: profile?.role,
      p_feature: feature,
      p_prompt: prompt,
      p_response: response ?? null,
      p_provider: provider ?? null,
      p_model: model ?? null,
      p_urgency: urgency ?? null,
      p_flagged: flagged,
      p_conversation_id: conversationId ?? null,
    };

    if (!adminClient) {
      logger.warn('ai interaction NOT logged (no service client)', { feature });
      return;
    }
    adminClient
      .rpc('log_ai_interaction', payload)
      .then(() => {}, (error) => {
        logger.error('ai interaction log write failed', { feature, message: error?.message });
      });
  });
}

module.exports = { logInteraction };
