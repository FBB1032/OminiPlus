import React, { memo, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  error?: string;
  onComplete?: (code: string) => void;
}

export const OTPInput = memo<OTPInputProps>(({ value, onChange, length = 6, error, onComplete }) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const chars = value.split('');
    chars[index] = digit;
    const newVal = chars.join('').slice(0, length);
    onChange(newVal);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newVal.length === length && onComplete) {
      setTimeout(() => onComplete(newVal), 50);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View>
      <View style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const isFilled = !!value[i];
          const isActive = value.length === i;
          return (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[
                styles.box,
                isFilled && styles.boxFilled,
                isActive && styles.boxActive,
                !!error && styles.boxError,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={value[i] ?? ''}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              selectTextOnFocus
              caretHidden
            />
          );
        })}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

OTPInput.displayName = 'OTPInput';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing[3], justifyContent: 'center' },
  box: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
    ...Shadows.xs,
  },
  boxFilled: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[50] },
  boxActive: { borderColor: Colors.primary[600] },
  boxError: { borderColor: Colors.error.main },
  error: { fontSize: FontSize.xs, color: Colors.error.main, textAlign: 'center', marginTop: Spacing[2] },
});
