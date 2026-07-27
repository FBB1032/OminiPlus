import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../../theme';

interface DividerProps {
  vertical?: boolean;
  spacing?: keyof typeof Spacing;
  color?: string;
  style?: ViewStyle;
}

export const Divider = memo<DividerProps>(({
  vertical = false,
  spacing = 4,
  color = Colors.border,
  style,
}) => {
  const marginProp: ViewStyle = vertical
    ? { marginHorizontal: Spacing[spacing] }
    : { marginVertical: Spacing[spacing] };

  const dimensionProp: ViewStyle = vertical
    ? { width: 1, height: '100%' }
    : { height: 1, width: '100%' };

  return (
    <View
      style={[
        marginProp,
        dimensionProp,
        { backgroundColor: color },
        style,
      ]}
    />
  );
});

Divider.displayName = 'Divider';
