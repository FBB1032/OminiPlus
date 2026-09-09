/**
 * Vitals hooks — chronic disease trackers backed by /api/vitals.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vitalsApi } from '../api/vitals';
import { aiApi } from '../api/ai';
import { STALE_TIME } from '../constants/config';
import { BPReading, SugarReading, AsthmaReading } from '../types';

export const vitalsQueryKeys = {
  bpHistory: (patientId: string) => ['vitals', 'bp', patientId] as const,
  sugarHistory: (patientId: string) => ['vitals', 'sugar', patientId] as const,
};

export function useBloodPressureHistory(patientId: string) {
  return useQuery({
    queryKey: vitalsQueryKeys.bpHistory(patientId),
    queryFn: () => vitalsApi.getBloodPressureHistory(patientId),
    staleTime: STALE_TIME.SHORT,
    enabled: !!patientId,
  });
}

export function useBloodSugarHistory(patientId: string) {
  return useQuery({
    queryFn: () => vitalsApi.getBloodSugarHistory(patientId),
    queryKey: vitalsQueryKeys.sugarHistory(patientId),
    staleTime: STALE_TIME.SHORT,
    enabled: !!patientId,
  });
}

export function useLogBloodPressure(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reading: Omit<BPReading, 'id' | 'category' | 'recordedAt'> & { recordedAt?: string }) =>
      vitalsApi.logBloodPressure(patientId, reading),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vitalsQueryKeys.bpHistory(patientId) });
    },
  });
}

export function useLogBloodSugar(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reading: {
      glucoseLevel: number;
      type: SugarReading['type'];
      notes?: string;
      recordedAt?: string;
    }) => vitalsApi.logBloodSugar(patientId, reading),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vitalsQueryKeys.sugarHistory(patientId) });
    },
  });
}

export function useLogPeakFlow(patientId: string) {
  return useMutation({
    mutationFn: (reading: Omit<AsthmaReading, 'id' | 'recordedAt'> & { recordedAt?: string }) =>
      vitalsApi.logPeakFlow(patientId, reading),
  });
}

/** Rule-based sentinel evaluation (free — not part of the model quota). */
export function useEvaluateSentinel() {
  return useMutation({
    mutationFn: (reading: Record<string, unknown>) =>
      aiApi.sentinel(reading),
  });
}
