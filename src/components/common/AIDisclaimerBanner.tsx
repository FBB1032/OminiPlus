import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../theme';

interface AIDisclaimerBannerProps {
  compact?: boolean;
}

export const AIDisclaimerBanner: React.FC<AIDisclaimerBannerProps> = ({ compact = false }) => {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.iconWrapper}>
        <Ionicons name="shield-checkmark" size={compact ? 16 : 18} color="#1E40AF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, compact && styles.compactTitle]}>Medical AI Disclaimer</Text>
        <Text style={[styles.disclaimerText, compact && styles.compactText]}>
          AI guidance is informational and does not replace consultation with a licensed healthcare professional.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: Spacing[3],
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[2],
    gap: Spacing[3],
  },
  compactContainer: {
    padding: Spacing[2],
    marginHorizontal: 0,
    marginVertical: Spacing[1],
    gap: Spacing[2],
  },
  iconWrapper: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactTitle: {
    fontSize: 10,
  },
  disclaimerText: {
    fontSize: FontSize.xs,
    color: '#1E3A8A',
    lineHeight: 16,
    fontWeight: FontWeight.medium,
  },
  compactText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
