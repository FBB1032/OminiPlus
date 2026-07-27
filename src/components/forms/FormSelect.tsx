import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: Option[];
  error?: FieldError;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export const FormSelect = memo(<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Select an option',
  options,
  error,
  leftIcon,
}: FormSelectProps<T>) => {
  const [modalVisible, setModalVisible] = useState(false);
  const hasError = !!error;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const selectedOption = options.find((o) => o.value === value);

          return (
            <>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setModalVisible(true)}
                style={[
                  styles.selectWrapper,
                  { borderColor: hasError ? Colors.error.main : Colors.border },
                ]}
              >
                <View style={styles.leftRow}>
                  {leftIcon && (
                    <Ionicons
                      name={leftIcon}
                      size={20}
                      color={Colors.neutral[400]}
                      style={styles.leftIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.valueText,
                      !selectedOption && { color: Colors.text.disabled },
                    ]}
                  >
                    {selectedOption ? selectedOption.label : placeholder}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>

              <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
              >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                  <View style={styles.modalContent}>
                    <SafeAreaView style={styles.safeArea}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                        <TouchableOpacity
                          onPress={() => setModalVisible(false)}
                          style={styles.closeButton}
                        >
                          <Ionicons name="close" size={24} color={Colors.text.primary} />
                        </TouchableOpacity>
                      </View>

                      <FlatList
                        data={options}
                        keyExtractor={(item) => item.value}
                        contentContainerStyle={styles.listContainer}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        renderItem={({ item }) => {
                          const isSelected = item.value === value;
                          return (
                            <TouchableOpacity
                              style={[
                                styles.optionItem,
                                isSelected && styles.optionItemSelected,
                              ]}
                              onPress={() => {
                                onChange(item.value);
                                setModalVisible(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.optionText,
                                  isSelected && styles.optionTextSelected,
                                ]}
                              >
                                {item.label}
                              </Text>
                              {isSelected && (
                                <Ionicons name="checkmark" size={20} color={Colors.primary[600]} />
                              )}
                            </TouchableOpacity>
                          );
                        }}
                      />
                    </SafeAreaView>
                  </View>
                </Pressable>
              </Modal>
            </>
          );
        }}
      />

      {hasError && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={Colors.error.main} />
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}
    </View>
  );
}) as <T extends FieldValues>(props: FormSelectProps<T>) => React.ReactElement;

(FormSelect as React.FC).displayName = 'FormSelect';

const styles = StyleSheet.create({
  container: { gap: Spacing[1] },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    height: 52,
    paddingHorizontal: Spacing[3],
    ...Shadows.xs,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftIcon: { marginRight: Spacing[2] },
  valueText: {
    fontSize: FontSize.base,
    color: Colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '60%',
    ...Shadows.lg,
  },
  safeArea: {
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  closeButton: {
    padding: Spacing[1],
  },
  listContainer: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
  },
  optionItemSelected: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[2],
    marginHorizontal: -Spacing[2],
  },
  optionText: {
    fontSize: FontSize.base,
    color: Colors.text.primary,
  },
  optionTextSelected: {
    fontWeight: FontWeight.medium,
    color: Colors.primary[600],
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error.main,
    flex: 1,
  },
});
