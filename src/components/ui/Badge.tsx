import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppointmentStatus } from '../../types';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../theme';

type BadgeVariant = AppointmentStatus | 'default' | 'info' | 'active';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  scheduled: { bg: Colors.status.scheduled, text: Colors.status.scheduledText },
  completed: { bg: Colors.status.completed, text: Colors.status.completedText },
  cancelled: { bg: Colors.status.cancelled, text: Colors.status.cancelledText },
  pending: { bg: Colors.status.pending, text: Colors.status.pendingText },
  no_show: { bg: Colors.neutral[100], text: Colors.neutral[600] },
  active: { bg: Colors.success.light, text: Colors.success.dark },
  info: { bg: Colors.info.light, text: Colors.info.dark },
  default: { bg: Colors.neutral[100], text: Colors.neutral[600] },
};

export const Badge = memo<BadgeProps>(({ label, variant = 'default', style, labelStyle }) => {
  const { bg, text } = variantMap[variant];
  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }, labelStyle]}>{label}</Text>
    </View>
  );
});

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    includeFontPadding: false,
  },
});
