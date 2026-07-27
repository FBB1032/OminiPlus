import React, { memo, useState, forwardRef, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const Input = memo(
  forwardRef<TextInput, InputProps>(({
    label,
    placeholder,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    isPassword = false,
    secureTextEntry,
    value,
    defaultValue,
    onFocus,
    onBlur,
    ...rest
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(isPassword || secureTextEntry);

    const hasValue = (value !== undefined && value !== '' && value !== null) || (defaultValue !== undefined && defaultValue !== '');
    const isFloating = isFocused || hasValue;

    const animatedValue = useRef(new Animated.Value(isFloating ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: isFloating ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }, [isFloating, animatedValue]);

    const hasError = !!error;
    const borderColor = hasError
      ? Colors.error.main
      : isFocused
      ? Colors.primary[500]
      : Colors.border;

    const passwordIcon: keyof typeof Ionicons.glyphMap = isSecure ? 'eye-off-outline' : 'eye-outline';

    const displayLabel = label || placeholder;

    const labelTranslateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -10],
    });

    const labelFontSize = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [FontSize.base, 11.5],
    });

    const labelLeft = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [leftIcon ? 36 : Spacing[3], Spacing[2]],
    });

    const labelColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [
        Colors.text.disabled,
        hasError ? Colors.error.main : isFocused ? Colors.primary[500] : Colors.text.secondary,
      ],
    });

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.inputWrapper, { borderColor }]}>
          {displayLabel && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.floatingLabelContainer,
                {
                  transform: [{ translateY: labelTranslateY }],
                  left: labelLeft,
                },
                isFloating && styles.floatingLabelActive,
              ]}
            >
              <Animated.Text
                style={[
                  styles.floatingLabelText,
                  {
                    fontSize: labelFontSize,
                    color: labelColor,
                  },
                ]}
              >
                {displayLabel}
              </Animated.Text>
            </Animated.View>
          )}

          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={isFocused ? Colors.primary[500] : Colors.neutral[400]}
              style={styles.leftIcon}
            />
          )}

          <TextInput
            ref={ref}
            style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
            placeholder={label ? (isFloating ? placeholder : undefined) : undefined}
            placeholderTextColor={Colors.text.disabled}
            value={value}
            defaultValue={defaultValue}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            secureTextEntry={isSecure}
            autoCorrect={false}
            {...rest}
          />

          {(isPassword || rightIcon) && (
            <TouchableOpacity
              onPress={isPassword ? () => setIsSecure((prev) => !prev) : onRightIconPress}
              style={styles.rightIcon}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isPassword ? passwordIcon : rightIcon!}
                size={20}
                color={Colors.neutral[400]}
              />
            </TouchableOpacity>
          )}
        </View>

        {hasError && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={13} color={Colors.error.main} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {!hasError && hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  }),
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    height: 52,
    paddingHorizontal: Spacing[3],
    position: 'relative',
    ...Shadows.xs,
  },
  floatingLabelContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  floatingLabelActive: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  floatingLabelText: {
    fontWeight: FontWeight.medium,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  inputWithLeftIcon: { marginLeft: Spacing[2] },
  leftIcon: { marginRight: 2 },
  rightIcon: { paddingLeft: Spacing[2] },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error.main,
    flex: 1,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 4,
  },
});
