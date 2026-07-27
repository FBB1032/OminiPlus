import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { patientApi } from '../api/patient';
import { QUERY_KEYS } from '../constants/queryKeys';
import { STALE_TIME } from '../constants/config';
import { PaginationParams, BookAppointmentPayload } from '../types';

export const usePatientHome = () =>
  useQuery({
    queryKey: QUERY_KEYS.patientHome,
    queryFn: () => patientApi.getHome().then((r) => r.data),
    staleTime: STALE_TIME.SHORT,
  });

export const usePatientAppointments = (params?: PaginationParams & { status?: string }) =>
  useQuery({
    queryKey: QUERY_KEYS.patientAppointments(params),
    queryFn: () => patientApi.getAppointments(params).then((r) => r.data),
    staleTime: STALE_TIME.SHORT,
    placeholderData: keepPreviousData,
  });

export const useMedicalRecords = (params?: PaginationParams) =>
  useQuery({
    queryKey: QUERY_KEYS.patientMedicalRecords(params),
    queryFn: () => patientApi.getMedicalRecords(params).then((r) => r.data),
    staleTime: STALE_TIME.MEDIUM,
    placeholderData: keepPreviousData,
  });

export const usePrescriptionHistory = (params?: PaginationParams) =>
  useQuery({
    queryKey: QUERY_KEYS.patientPrescriptionHistory(params),
    queryFn: () => patientApi.getPrescriptionHistory(params).then((r) => r.data),
    staleTime: STALE_TIME.MEDIUM,
    placeholderData: keepPreviousData,
  });

export const useDoctorList = (params?: PaginationParams & { specialization?: string }) =>
  useQuery({
    queryKey: QUERY_KEYS.doctorList(params),
    queryFn: () => patientApi.getDoctors(params).then((r) => r.data),
    staleTime: STALE_TIME.MEDIUM,
    placeholderData: keepPreviousData,
  });

export const useAvailableSlots = (doctorId: string, date: string) =>
  useQuery({
    queryKey: QUERY_KEYS.availableSlots(doctorId, date),
    queryFn: () => patientApi.getAvailableSlots(doctorId, date).then((r) => r.data),
    staleTime: STALE_TIME.SHORT,
    enabled: !!doctorId && !!date,
  });

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookAppointmentPayload) => patientApi.bookAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientHome });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientAppointments() });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientApi.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientHome });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientAppointments() });
    },
  });
};

export const useNotifications = () =>
  useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: () => patientApi.getNotifications().then((r) => r.data),
    staleTime: STALE_TIME.SHORT,
  });
