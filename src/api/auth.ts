import apiClient from './client';
import {
  ApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOTPPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
} from '../types';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload).then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', payload).then((r) => r.data),

  verifyOTP: (payload: VerifyOTPPayload) =>
    apiClient.post<ApiResponse<{ verified: boolean }>>('/auth/verify-otp', payload).then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload).then((r) => r.data),

  refreshToken: (payload: RefreshTokenPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', payload).then((r) => r.data),

  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),

  me: () =>
    apiClient.get<ApiResponse<AuthResponse['user']>>('/auth/me').then((r) => r.data),
};
