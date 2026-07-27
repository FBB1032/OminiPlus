export type UserRole = 'doctor' | 'patient' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  isApproved?: boolean;
  height?: number;
  weight?: number;
  bloodGroup?: string;
  genotype?: string;
  age?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  agreeToTerms?: boolean;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  genotype?: string;
  age?: string;
  dateOfBirth?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
