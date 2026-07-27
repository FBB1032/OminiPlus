import React, { memo, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';

interface Option {
  label: string;
  value: string;
}

interface FormSelectSearchableProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: Option[];
  error?: FieldError;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const FormSelectSearchable = memo(<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Select an option',
  options,
  error,
  leftIcon,
  searchable = false,
  searchPlaceholder = 'Search...',
}: FormSelectSearchableProps<T>) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const hasError = !!error;

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

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
                onRequestClose={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => {
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.modalContent}>
                    <SafeAreaView style={styles.safeArea}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setModalVisible(false);
                            setSearchQuery('');
                          }}
                          style={styles.closeButton}
                        >
                          <Ionicons name="close" size={24} color={Colors.text.primary} />
                        </TouchableOpacity>
                      </View>

                      {searchable && (
                        <View style={styles.searchContainer}>
                          <Ionicons
                            name="search"
                            size={18}
                            color={Colors.text.secondary}
                            style={styles.searchIcon}
                          />
                          <TextInput
                            style={styles.searchInput}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={Colors.text.disabled}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                          />
                          {searchQuery && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                              <Ionicons
                                name="close-circle"
                                size={18}
                                color={Colors.text.secondary}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      <FlatList
                        data={filteredOptions}
                        keyExtractor={(item) => item.value}
                        scrollEnabled
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
                                setSearchQuery('');
                              }}
                            >
                              <Text
                                style={[
                                  styles.optionLabel,
                                  isSelected && styles.optionLabelSelected,
                                ]}
                              >
                                {item.label}
                              </Text>
                              {isSelected && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color={Colors.primary[600]}
                                />
                              )}
                            </TouchableOpacity>
                          );
                        }}
                        ListEmptyComponent={
                          searchQuery && filteredOptions.length === 0 ? (
                            <View style={styles.emptyState}>
                              <Ionicons
                                name="search"
                                size={32}
                                color={Colors.text.disabled}
                              />
                              <Text style={styles.emptyStateText}>
                                No results for "{searchQuery}"
                              </Text>
                            </View>
                          ) : undefined
                        }
                      />
                    </SafeAreaView>
                  </View>
                </Pressable>
              </Modal>
            </>
          );
        }}
      />

      {hasError && error?.message && (
        <Text style={styles.errorText}>{error.message}</Text>
      )}
    </View>
  );
});

FormSelectSearchable.displayName = 'FormSelectSearchable';

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
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    ...Shadows.sm,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftIcon: {
    marginRight: Spacing[2],
  },
  valueText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.surface,
    marginTop: 'auto',
  },
  safeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  closeButton: {
    padding: Spacing[1],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
  },
  searchIcon: {
    marginRight: Spacing[2],
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing[2],
    fontSize: FontSize.base,
    color: Colors.text.primary,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionItemSelected: {
    backgroundColor: Colors.primary[50],
  },
  optionLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    flex: 1,
  },
  optionLabelSelected: {
    color: Colors.primary[600],
    fontWeight: FontWeight.semiBold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing[8],
  },
  emptyStateText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing[2],
  },
  errorText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.error.main,
    marginTop: Spacing[1],
  },
});
