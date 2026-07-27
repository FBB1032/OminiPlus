import React, { memo, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';

interface PasswordInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  error?: FieldError;
  showStrengthMeter?: boolean;
  showRequirements?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

const calculateStrength = (password: string): PasswordStrength => {
  if (!password) return 'weak';

  let strength = 0;

  // Length
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Uppercase
  if (/[A-Z]/.test(password)) strength++;

  // Lowercase
  if (/[a-z]/.test(password)) strength++;

  // Numbers
  if (/\d/.test(password)) strength++;

  // Special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  if (strength < 2) return 'weak';
  if (strength < 3) return 'fair';
  if (strength < 5) return 'good';
  return 'strong';
};

const getRequirements = (password: string) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

export const PasswordInput = memo(<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Enter password',
  error,
  showStrengthMeter = true,
  showRequirements = true,
  containerStyle,
  inputStyle,
}: PasswordInputProps<T>) => {
  const [isVisible, setIsVisible] = useState(false);
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const strength = calculateStrength(value);
          const requirements = getRequirements(value);

          return (
            <>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: hasError ? Colors.error.main : Colors.border },
                ]}
              >
                <TextInput
                  style={[styles.input, inputStyle]}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.text.disabled}
                  secureTextEntry={!isVisible}
                  value={value}
                  onChangeText={onChange}
                  editable={!hasError || true}
                />
                <TouchableOpacity
                  onPress={() => setIsVisible(!isVisible)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={isVisible ? 'eye' : 'eye-off'}
                    size={20}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {hasError && error?.message && (
                <Text style={styles.errorText}>{error.message}</Text>
              )}

              {showStrengthMeter && value && (
                <View style={styles.strengthMeterContainer}>
                  <View style={styles.strengthBarsContainer}>
                    {[1, 2, 3, 4].map((bar) => (
                      <View
                        key={bar}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              strength === 'weak'
                                ? Colors.error.main
                                : strength === 'fair'
                                  ? Colors.warning.main
                                  : strength === 'good'
                                    ? Colors.info.main
                                    : Colors.success.main,
                            opacity: bar <= (strength === 'weak' ? 1 : strength === 'fair' ? 2 : strength === 'good' ? 3 : 4) ? 1 : 0.2,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.strengthText,
                      {
                        color:
                          strength === 'weak'
                            ? Colors.error.main
                            : strength === 'fair'
                              ? Colors.warning.main
                              : strength === 'good'
                                ? Colors.info.main
                                : Colors.success.main,
                      },
                    ]}
                  >
                    {strength.charAt(0).toUpperCase() + strength.slice(1)}
                  </Text>
                </View>
              )}

              {showRequirements && value && (
                <View style={styles.requirementsContainer}>
                  <RequirementItem
                    met={requirements.length}
                    label="At least 8 characters"
                  />
                  <RequirementItem
                    met={requirements.uppercase}
                    label="One uppercase letter"
                  />
                  <RequirementItem
                    met={requirements.lowercase}
                    label="One lowercase letter"
                  />
                  <RequirementItem
                    met={requirements.number}
                    label="One number"
                  />
                  <RequirementItem
                    met={requirements.special}
                    label="One special character"
                  />
                </View>
              )}
            </>
          );
        }}
      />
    </View>
  );
});

PasswordInput.displayName = 'PasswordInput';

const RequirementItem = memo<{ met: boolean; label: string }>(
  ({ met, label }) => (
    <View style={styles.requirementItem}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={met ? Colors.success.main : Colors.text.disabled}
      />
      <Text
        style={[
          styles.requirementText,
          { color: met ? Colors.text.primary : Colors.text.disabled },
        ]}
      >
        {label}
      </Text>
    </View>
  )
);

RequirementItem.displayName = 'RequirementItem';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[4],
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[3],
    ...Shadows.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing[3],
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  errorText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.error.main,
    marginTop: Spacing[1],
  },
  strengthMeterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  strengthBarsContainer: {
    flexDirection: 'row',
    gap: Spacing[1],
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    minWidth: 50,
  },
  requirementsContainer: {
    marginTop: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginVertical: Spacing[1],
  },
  requirementText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});
