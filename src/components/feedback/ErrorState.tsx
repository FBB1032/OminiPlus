import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../theme';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = memo<ErrorStateProps>(({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
}) => (
  <View style={styles.container}>
    <View style={styles.iconWrapper}>
      <Ionicons name="cloud-offline-outline" size={48} color={Colors.error.main} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <Button
        label="Try Again"
        variant="outline"
        size="sm"
        fullWidth={false}
        onPress={onRetry}
        leftIcon={<Ionicons name="refresh-outline" size={16} color={Colors.primary[600]} />}
        style={styles.button}
      />
    )}
  </View>
));

ErrorState.displayName = 'ErrorState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
    gap: Spacing[2],
    paddingVertical: Spacing[10],
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.error.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: { marginTop: Spacing[2] },
});
