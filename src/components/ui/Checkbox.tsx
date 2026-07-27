import React, { memo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

interface CheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'switch';
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Checkbox = memo<CheckboxProps>(({
  value,
  onChange,
  label,
  disabled = false,
  error = false,
  size = 'md',
  variant = 'default',
  containerStyle,
  labelStyle,
}) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!disabled) {
      Animated.sequence([
        Animated.timing(animatedScale, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      onChange(!value);
    }
  };

  const sizes = {
    sm: { box: 16, icon: 12 },
    md: { box: 20, icon: 14 },
    lg: { box: 24, icon: 16 },
  };

  const currentSize = sizes[size];

  if (variant === 'switch') {
    return (
      <View style={[styles.switchContainer, containerStyle]}>
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          style={styles.switchTouchable}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.switchBox,
              {
                width: 50,
                backgroundColor: value ? Colors.primary[600] : Colors.neutral[300],
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.switchThumb,
                {
                  transform: [{ translateX: value ? 27 : 3 }],
                },
              ]}
            />
          </View>
        </TouchableOpacity>
        {label && (
          <Text
            style={[
              styles.label,
              labelStyle,
              { opacity: disabled ? 0.6 : 1 },
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={styles.touchable}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.checkboxBox,
            {
              width: currentSize.box,
              height: currentSize.box,
              borderRadius: BorderRadius.sm,
              borderColor: error
                ? Colors.error.main
                : value
                  ? Colors.primary[600]
                  : Colors.border,
              backgroundColor: value ? Colors.primary[600] : Colors.surface,
              opacity: disabled ? 0.6 : 1,
              transform: [{ scale: animatedScale }],
            },
          ]}
        >
          {value && (
            <Ionicons
              name="checkmark"
              size={currentSize.icon}
              color={Colors.text.inverse}
              style={styles.checkmark}
            />
          )}
        </Animated.View>
      </TouchableOpacity>

      {label && (
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          style={styles.labelTouchable}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.label,
              labelStyle,
              { opacity: disabled ? 0.6 : 1 },
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  touchable: {
    padding: Spacing[1],
  },
  checkboxBox: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    textAlign: 'center',
  },
  labelTouchable: {
    flex: 1,
    paddingVertical: Spacing[2],
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },

  // Switch variant
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  switchTouchable: {
    padding: Spacing[1],
  },
  switchBox: {
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
