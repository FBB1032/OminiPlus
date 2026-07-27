import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  shadow?: 'none' | 'xs' | 'sm' | 'md';
}

export const Card = memo<CardProps>(({ children, style, padding = Spacing[4], shadow = 'sm' }) => (
  <View style={[styles.card, { padding }, shadow !== 'none' && Shadows[shadow], style]}>
    {children}
  </View>
));

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
