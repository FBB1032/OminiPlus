import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';
import { Button } from './Button';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  contentStyle?: ViewStyle;
}

export const AppModal = memo<AppModalProps>(({
  visible,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  contentStyle,
}) => {
  // If centered prop is used or custom styling needs centering
  const isCentered = contentStyle && (contentStyle as any).alignSelf === 'center';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.overlay, isCentered && styles.overlayCentered]}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
          <View style={[styles.sheet, isCentered && styles.sheetCentered, contentStyle]}>
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title ? <Text style={styles.title}>{title}</Text> : <View />}
                {showCloseButton && (
                  <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={22} color={Colors.text.secondary} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            <View style={styles.contentContainer}>{children}</View>
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

AppModal.displayName = 'AppModal';

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayCentered: { justifyContent: 'center', alignItems: 'center', padding: Spacing[4] },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.5)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    maxHeight: '90%',
    paddingBottom: Spacing[8],
    ...Shadows.xl,
  },
  sheetCentered: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius['2xl'],
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingBottom: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  footer: {
    padding: Spacing[5],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing[2],
  },
  contentContainer: {
    flexShrink: 1,
    overflow: 'hidden',
  },
});
