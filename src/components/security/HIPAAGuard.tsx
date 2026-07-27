import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppState,
  AppStateStatus,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

// Inactivity timeout: 5 minutes (300,000 milliseconds)
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

interface HIPAAGuardProps {
  children: React.ReactNode;
}

export const HIPAAGuard = ({ children }: HIPAAGuardProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const addToast = useUIStore((s) => s.addToast);

  const [isCovered, setIsCovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        type: 'warning',
        title: 'Session Timeout',
        message: 'You have been logged out due to inactivity.',
      });
    } catch (error) {
      console.error('[HIPAAGuard] Auto-logout failed:', error);
    }
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    // Start/reset timer when authentication state changes
    if (isAuthenticated) {
      resetTimer();
    } else if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Background / Inactive cover triggers
      if (
        appStateRef.current === 'active' &&
        (nextAppState === 'inactive' || nextAppState === 'background')
      ) {
        // App backgrounded: show privacy cover if logged in
        if (isAuthenticated) {
          setIsCovered(true);
          backgroundTimeRef.current = Date.now();
        }
      }

      // Returning to active state
      if (nextAppState === 'active') {
        setIsCovered(false);

        // Check background inactivity threshold
        if (isAuthenticated && backgroundTimeRef.current) {
          const timeSpentBackgrounded = Date.now() - backgroundTimeRef.current;
          if (timeSpentBackgrounded >= INACTIVITY_TIMEOUT) {
            handleLogout();
          } else {
            resetTimer();
          }
        } else if (isAuthenticated) {
          resetTimer();
        }
        backgroundTimeRef.current = null;
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  return (
    <View
      style={styles.container}
      onTouchStart={resetTimer}
      onTouchMove={resetTimer}
    >
      {children}
      {isCovered && isAuthenticated && (
        <View style={styles.privacyCover}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={40} color={Colors.primary[600]} />
            </View>
            <Text style={styles.title}>HIPAA Secure Session</Text>
            <Text style={styles.subtitle}>
              For your security and privacy, this medical session has been masked.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  privacyCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing[8],
    gap: Spacing[4],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
