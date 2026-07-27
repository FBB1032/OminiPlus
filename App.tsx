import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastProvider, ErrorBoundary, HIPAAGuard } from './src/components';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from './src/api/queryClient';


export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <HIPAAGuard>
              <RootNavigator />
            </HIPAAGuard>
            <ToastProvider />
            <StatusBar style="auto" />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
