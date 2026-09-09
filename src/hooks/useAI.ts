/**
 * AI hooks — chat, triage, CDS, SOAP backed by /api/ai.
 * Quota (429) and rate-limit errors surface their server message verbatim.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, AIMessage } from '../api/ai';
import { QUERY_KEYS } from '../constants/queryKeys';

export function useAIChat() {
  return useMutation({
    mutationFn: ({ conversationId, messages }: { conversationId: string | null; messages: AIMessage[] }) =>
      aiApi.chat(conversationId, messages),
  });
}

export function useAITriage() {
  return useMutation({
    mutationFn: (payload: { symptoms: string; duration?: string }) => aiApi.triage(payload),
  });
}

export function useAICds() {
  return useMutation({
    mutationFn: (payload: {
      presentation: string;
      history?: string;
      medications?: string;
      vitals?: string;
    }) => aiApi.clinicalCds(payload),
  });
}

export function useAISoap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { appointmentId?: string; transcript: string }) =>
      aiApi.generateSoap(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctorAppointments() });
    },
  });
}
