import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { doctorApi } from '../api/doctor';
import { QUERY_KEYS } from '../constants/queryKeys';
import { STALE_TIME } from '../constants/config';
import { PaginationParams, CreatePrescriptionPayload, WorkingHours } from '../types';

export const useDoctorDashboard = () =>
  useQuery({
    queryKey: QUERY_KEYS.doctorDashboard,
    queryFn: () => doctorApi.getDashboard().then((r) => r.data),
    staleTime: STALE_TIME.SHORT,
  });

export const useDoctorAppointments = (
  params?: PaginationParams & { status?: string; date?: string }
) =>
  useQuery({
    queryKey: QUERY_KEYS.doctorAppointments(params),
    queryFn: () => doctorApi.getAppointments(params).then((r) => r.data),
    staleTime: STALE_TIME.SHORT,
    placeholderData: keepPreviousData,
  });

export const useDoctorPatients = (params?: PaginationParams) =>
  useQuery({
    queryKey: QUERY_KEYS.doctorPatients(params),
    queryFn: () => doctorApi.getPatients(params).then((r) => r.data),
    staleTime: STALE_TIME.MEDIUM,
    placeholderData: keepPreviousData,
  });

export const usePatientDetail = (patientId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.patientDetail(patientId),
    queryFn: () => doctorApi.getPatientById(patientId).then((r) => r.data),
    staleTime: STALE_TIME.MEDIUM,
    enabled: !!patientId,
  });

export const usePatientPrescriptions = (patientId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.patientPrescriptions(patientId),
    queryFn: () => doctorApi.getPatientPrescriptions(patientId).then((r) => r.data),
    staleTime: STALE_TIME.MEDIUM,
    enabled: !!patientId,
  });

export const usePrescriptionById = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.prescription(id),
    queryFn: () => doctorApi.getPrescriptionById(id).then((r) => r.data),
    staleTime: STALE_TIME.LONG,
    enabled: !!id,
  });

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => doctorApi.createPrescription(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.patientPrescriptions(variables.patientId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctorDashboard });
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      doctorApi.updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctorAppointments() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctorDashboard });
    },
  });
};

export const useDoctorAvailability = () =>
  useQuery({
    queryKey: QUERY_KEYS.doctorAvailability,
    queryFn: () => doctorApi.getAvailability().then((r) => r.data),
    staleTime: STALE_TIME.MEDIUM,
  });

export const useUpdateDoctorAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (availability: WorkingHours[]) =>
      doctorApi.updateAvailability(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctorAvailability });
    },
  });
};
