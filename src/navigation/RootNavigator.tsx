import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { SplashScreen } from '../screens/shared/SplashScreen';
import { OnboardingScreen } from '../features/auth/screens/OnboardingScreen';
import { AuthNavigator } from './AuthNavigator';
import { DoctorNavigator } from './DoctorNavigator';
import { PatientNavigator } from './PatientNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isInitialized, role, onboardingCompleted } = useAuth();
  const [splashTimerDone, setSplashTimerDone] = useState(false);

  console.log('[RootNavigator] State Update:', { isAuthenticated, isInitialized, role, onboardingCompleted });

  useEffect(() => {
    authService.restoreSession();

    // Keep splash screen visible for 3s in dev mode to review splash screen changes
    const timer = setTimeout(() => {
      setSplashTimerDone(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
