import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSize, FontWeight } from '../../theme';

interface DoctorStatusBadgeProps {
  status?: 'available' | 'busy' | 'offline';
  customWaitTime?: string;
  size?: 'sm' | 'md';
}

export const DoctorStatusBadge: React.FC<DoctorStatusBadgeProps> = ({
  status = 'available',
  customWaitTime,
  size = 'md',
}) => {
  let label = 'Available Now';
  let dotColor = '#0F6E6E'; // Teal
  let badgeBg = '#E6F4F4';
  let textColor = '#0F6E6E';
  let borderColor = '#99D4D4';

  if (status === 'busy') {
    label = customWaitTime || 'Busy (In Consultation)';
    dotColor = '#F59E0B'; // Amber
    badgeBg = '#FFFBEB';
    textColor = '#92400E';
    borderColor = '#FDE68A';
  } else if (status === 'offline') {
    label = customWaitTime || 'Offline';
    dotColor = '#64748B'; // Slate
    badgeBg = '#F8FAFC';
    textColor = '#475569';
    borderColor = '#E2E8F0';
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeBg, borderColor },
        isSmall && styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }, isSmall && styles.dotSm]} />
      <Text style={[styles.text, { color: textColor }, isSmall && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotSm: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  textSm: {
    fontSize: 10,
  },
});
