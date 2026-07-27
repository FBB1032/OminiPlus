import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Shadows } from '../../theme';

interface SearchBarProps extends TextInputProps {
  onSearch?: (text: string) => void;
  onFilterPress?: () => void;
}

export function SearchBar({ onSearch, onFilterPress, style, ...props }: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.neutral[400]} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.neutral[400]}
          onChangeText={onSearch}
          {...props}
        />
      </View>
      {onFilterPress && (
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
          <Ionicons name="options" size={20} color={Colors.text.inverse} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    height: 48,
    ...Shadows.sm,
  },
  icon: {
    marginRight: Spacing[2],
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.text.primary,
    fontSize: FontSize.sm,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.secondary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
});
