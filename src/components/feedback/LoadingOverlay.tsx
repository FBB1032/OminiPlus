import React, { memo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Modal } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay = memo<LoadingOverlayProps>(({
  visible,
  message = 'Please wait...',
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
  >
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  </Modal>
));

LoadingOverlay.displayName = 'LoadingOverlay';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing[6],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    minWidth: 140,
  },
  message: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
});
