import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore, ToastMessage } from '../../store/uiStore';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';

const ICON_MAP: Record<ToastMessage['type'], keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
  warning: 'warning',
};

const COLOR_MAP: Record<ToastMessage['type'], string> = {
  success: Colors.success.main,
  error: Colors.error.main,
  info: Colors.primary[500],
  warning: Colors.warning.main,
};

const BG_MAP: Record<ToastMessage['type'], string> = {
  success: Colors.success.light,
  error: Colors.error.light,
  info: Colors.primary[50],
  warning: Colors.warning.light,
};

interface ToastItemProps {
  toast: ToastMessage;
}

const ToastItem = memo<ToastItemProps>(({ toast }) => {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const removeToast = useUIStore((s) => s.removeToast);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -80, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => removeToast(toast.id));
  };

  const iconColor = COLOR_MAP[toast.type];
  const bg = BG_MAP[toast.type];

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bg, transform: [{ translateY }], opacity }, Shadows.md]}>
      <Ionicons name={ICON_MAP[toast.type]} size={22} color={iconColor} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: Colors.text.primary }]}>{toast.title}</Text>
        {toast.message && <Text style={styles.message}>{toast.message}</Text>}
      </View>
      <TouchableOpacity onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={18} color={Colors.text.secondary} />
      </TouchableOpacity>
    </Animated.View>
  );
});

ToastItem.displayName = 'ToastItem';

/** Mount this once at the root level above all screens */
export const ToastProvider = memo(() => {
  const toasts = useUIStore((s) => s.toasts);
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
});

ToastProvider.displayName = 'ToastProvider';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: Spacing[4],
    right: Spacing[4],
    zIndex: 9999,
    gap: Spacing[2],
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
  },
  content: { flex: 1 },
  title: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
  message: { fontSize: FontSize.xs, color: Colors.text.secondary, marginTop: 2 },
});
