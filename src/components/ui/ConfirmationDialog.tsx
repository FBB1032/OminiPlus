import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Button } from './Button';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
}

export const ConfirmationDialog = memo<ConfirmationDialogProps>(({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  isLoading = false,
  containerStyle,
  titleStyle,
  messageStyle,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={onCancel}
        disabled={isLoading}
      >
        <View
          style={[styles.container, containerStyle]}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.icon,
                {
                  backgroundColor: isDangerous
                    ? Colors.error.light
                    : Colors.info.light,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 28,
                  color: isDangerous ? Colors.error.main : Colors.info.main,
                }}
              >
                {isDangerous ? '⚠️' : 'ℹ️'}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, titleStyle]}>{title}</Text>

          <Text style={[styles.message, messageStyle]}>{message}</Text>

          <View style={styles.buttonContainer}>
            <Button
              label={cancelLabel}
              variant="ghost"
              size="md"
              onPress={onCancel}
              disabled={isLoading}
              style={styles.cancelButton}
              fullWidth={false}
            />
            <Button
              label={confirmLabel}
              variant={isDangerous ? 'danger' : 'primary'}
              size="md"
              onPress={onConfirm}
              isLoading={isLoading}
              disabled={isLoading}
              style={styles.confirmButton}
              fullWidth={false}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
});

ConfirmationDialog.displayName = 'ConfirmationDialog';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[6],
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 24,
  },
  iconContainer: {
    marginBottom: Spacing[4],
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
    lineHeight: FontSize.sm * 1.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
    justifyContent: 'center',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    minWidth: 100,
  },
  confirmButton: {
    flex: 1,
    minWidth: 100,
  },
});
