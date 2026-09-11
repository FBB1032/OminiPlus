/**
 * AI API — live backend (https://ominipulse.onrender.com/api).
 *
 *   POST /ai/chat   → assistant reply (stores conversation + messages server-side)
 *   POST /ai/triage → symptom checker assessment
 *   POST /ai/cds    → clinician decision support (doctor)
 *   POST /ai/soap   → transcript → SOAP note (doctor)
 *   POST /ai/sentinel → rule-based vitals evaluation (free, no quota)
 *
 * AI endpoints are rate-limited and have a per-user daily quota; 429
 * responses carry a human-readable message surfaced verbatim by AppError.
 */

import apiClient from './client';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatResponse {
  conversationId: string;
  reply: string;
  provider: string;
  model: string;
  urgency: string;
}

export interface AITriageResponse {
  /** Live backend field; the offline mock returns `triage`. */
  reply?: string;
  triage?: string;
  urgency: string;
  advice?: string[];
  provider: string;
  model: string;
}

/** Live backend returns the differential as free text in `reply`. */
export interface AICdsResponse {
  reply: string;
  provider: string;
  model: string;
}

export interface AISoapResponse {
  soap: string | null;
  reply: string;
  provider: string;
  model: string;
}

export const aiApi = {
  chat: (conversationId: string | null, messages: AIMessage[]) =>
    apiClient
      .post<AIChatResponse>('/ai/chat', {
        conversationId: conversationId ?? undefined,
        messages,
      })
      .then((r) => r.data),

  getConversation: (conversationId: string) =>
    apiClient
      .get<{ messages: Array<{ id: string; role: string; content: string; created_at: string }> }>(
        `/ai/conversations/${conversationId}`
      )
      .then((r) => r.data),

  triage: (payload: { symptoms: string; duration?: string }) =>
    apiClient.post<AITriageResponse>('/ai/triage', payload).then((r) => r.data),

  clinicalCds: (payload: {
    presentation: string;
    history?: string;
    medications?: string;
    vitals?: string;
  }) => apiClient.post<AICdsResponse>('/ai/cds', payload).then((r) => r.data),

  generateSoap: (payload: { appointmentId?: string; transcript: string }) =>
    apiClient.post<AISoapResponse>('/ai/soap', payload).then((r) => r.data),

  sentinel: (reading: Record<string, unknown>) =>
    apiClient.post<{ alerts: Array<{ severity: string; message: string; rule?: string }> }>('/ai/sentinel', reading).then((r) => r.data),
};
