import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isLoading = useAuthStore((s) => s.isLoading);
  const role = useAuthStore((s) => s.role);

  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const isDoctor = role === 'doctor';
  const isPatient = role === 'patient';
  const isAdmin = role === 'admin';

  return { 
    user, 
    tokens, 
    isAuthenticated, 
    isInitialized, 
    isLoading, 
    role, 
    isDoctor, 
    isPatient, 
    isAdmin,
    onboardingCompleted,
    completeOnboarding
  };
};

export const useToast = () => {
  const addToast = useUIStore((s) => s.addToast);

  return {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),
  };
};
