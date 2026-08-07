import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { Colors } from '../theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';
import OTPVerificationScreen from '../features/auth/screens/OTPVerificationScreen';
import ResetPasswordSuccessScreen from '../features/auth/screens/ResetPasswordSuccessScreen';
import ResetPasswordScreen from '../features/auth/screens/ResetPasswordScreen';
import PendingApprovalScreen from '../features/auth/screens/PendingApprovalScreen';

export const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen as any} />
    <Stack.Screen name="Register" component={RegisterScreen as any} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen as any} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen as any} />
    <Stack.Screen name="ResetPasswordSuccess" component={ResetPasswordSuccessScreen as any} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen as any} />
    <Stack.Screen name="PendingApproval" component={PendingApprovalScreen as any} />
  </Stack.Navigator>
);
