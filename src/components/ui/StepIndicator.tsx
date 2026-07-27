import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0-indexed
  style?: ViewStyle;
}

export const StepIndicator = memo<StepIndicatorProps>(({ steps, currentStep, style }) => (
  <View style={[styles.container, style]}>
    {steps.map((step, index) => {
      const isDone = index < currentStep;
      const isActive = index === currentStep;
      return (
        <React.Fragment key={step}>
          <View style={styles.stepItem}>
            <View style={[
              styles.circle,
              isDone && styles.circleDone,
              isActive && styles.circleActive,
            ]}>
              <Text style={[
                styles.circleText,
                (isDone || isActive) && styles.circleTextActive,
              ]}>
                {isDone ? '✓' : index + 1}
              </Text>
            </View>
            <Text style={[
              styles.stepLabel,
              isActive && styles.stepLabelActive,
              isDone && styles.stepLabelDone,
            ]} numberOfLines={1}>
              {step}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View style={[styles.connector, isDone && styles.connectorDone]} />
          )}
        </React.Fragment>
      );
    })}
  </View>
));

StepIndicator.displayName = 'StepIndicator';

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: Spacing[2] },
  stepItem: { alignItems: 'center', flex: 1 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleDone: { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  circleActive: { backgroundColor: Colors.neutral[0], borderColor: Colors.primary[600] },
  circleText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.neutral[400] },
  circleTextActive: { color: Colors.primary[600] },
  stepLabel: { fontSize: 10, color: Colors.text.secondary, textAlign: 'center' },
  stepLabelActive: { color: Colors.primary[600], fontWeight: FontWeight.semiBold },
  stepLabelDone: { color: Colors.text.secondary },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.neutral[200],
    marginTop: 13,
    marginHorizontal: -8,
  },
  connectorDone: { backgroundColor: Colors.primary[600] },
});
