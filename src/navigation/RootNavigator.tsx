import React, { useEffect, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { realtimeService } from '../services/realtimeService';
import { queryClient } from '../api/queryClient';
import { QUERY_KEYS } from '../constants/queryKeys';
import { useAuthStore } from '../store/authStore';
import { SplashScreen } from '../screens/shared/SplashScreen';
import { OnboardingScreen } from '../features/auth/screens/OnboardingScreen';
import { AuthNavigator } from './AuthNavigator';
import { DoctorNavigator } from './DoctorNavigator';
import { PatientNavigator } from './PatientNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isInitialized, role, onboardingCompleted } = useAuth();
  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const isRealtimeActive = useRef(false);

  console.log('[RootNavigator] State Update:', { isAuthenticated, isInitialized, role, onboardingCompleted });

  useEffect(() => {
    authService.restoreSession();

    // Keep splash screen visible for 3s in dev mode to review splash screen changes
    const timer = setTimeout(() => {
      setSplashTimerDone(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // ── Realtime sync ──────────────────────────────────────────────────────────
  // Connect whenever an authenticated session exists; appointment events
  // invalidate the relevant React Query caches so the doctor dashboard /
  // schedules reflect patient bookings instantly (no pull-to-refresh).
  useEffect(() => {
    realtimeService.init(() => useAuthStoreTokens());

    if (isAuthenticated && !isRealtimeActive.current) {
      isRealtimeActive.current = true;
      realtimeService.connect();
      const unsubscribe = realtimeService.subscribe((msg) => {
        if (msg.event.startsWith('appointment.')) {
          // Refresh every doctor-side appointment view (prefix match covers
          // status-filtered + date-filtered queries) and dashboards.
          queryClient.invalidateQueries({ queryKey: ['doctor', 'appointments'] });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctorDashboard });
          queryClient.invalidateQueries({ queryKey: ['patient', 'appointments'] });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientHome });
        }
        if (msg.event === 'broadcast.delivered') {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
        }
        if (msg.event === 'account.status' && msg.payload?.isActive === false) {
          // Suspended mid-session: terminate immediately (server already
          // refuses future REST calls).
          authService.logout();
        }
      });
      return () => {
        isRealtimeActive.current = false;
        unsubscribe();
        realtimeService.disconnect();
      };
    }
  }, [isAuthenticated]);

  // Splash only shows for unauthenticated users
  const showSplash = !isAuthenticated && (!isInitialized || !splashTimerDone);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingCompleted ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator as React.ComponentType} />
      ) : role === 'doctor' || role === 'admin' ? (
        <Stack.Screen name="Doctor" component={DoctorNavigator as React.ComponentType} />
      ) : (
        <Stack.Screen name="Patient" component={PatientNavigator as React.ComponentType} />
      )}
    </Stack.Navigator>
  );
};

// Token provider for the realtime socket (re-read from the store on each
// reconnect so long sessions never present an expired JWT).
function useAuthStoreTokens(): string | null {
  const { tokens } = useAuthStore.getState();
  return tokens?.accessToken ?? null;
}
