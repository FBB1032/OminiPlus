import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme'; // Wait, let's see if we have formatters. We have formatters.ts

interface DatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  error?: FieldError;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DatePicker = memo(<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Select date',
  error,
  minimumDate,
  maximumDate,
}: DatePickerProps<T>) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const hasError = !!error;

  // Generate days for the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const startDayIndex = firstDay.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = [];
    
    // Fill in blanks for previous month offset
    for (let i = 0; i < startDayIndex; i++) {
      days.push(null);
    }
    
    // Fill in actual days
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const formatDateString = (dateVal: string | Date | undefined) => {
    if (!dateVal) return '';
    const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const displayValue = value ? formatDateString(value) : '';

          const handleSelectDay = (day: Date) => {
            // Check bounds
            if (minimumDate && day < new Date(minimumDate.setHours(0,0,0,0))) return;
            if (maximumDate && day > new Date(maximumDate.setHours(23,59,59,999))) return;
            
            onChange(formatDateString(day));
            setModalVisible(false);
          };

          const days = getDaysInMonth(currentMonth);

          return (
            <>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (value) {
                    const parsed = new Date(value);
                    if (!isNaN(parsed.getTime())) {
                      setCurrentMonth(parsed);
                    }
                  }
                  setModalVisible(true);
                }}
                style={[
                  styles.pickerWrapper,
                  { borderColor: hasError ? Colors.error.main : Colors.border },
                ]}
              >
                <Text style={[styles.valueText, !value && { color: Colors.text.disabled }]}>
                  {displayValue || placeholder}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>

              <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
              >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                  <Pressable style={styles.modalContent}>
                    <View style={styles.calendarHeader}>
                      <TouchableOpacity onPress={handlePrevMonth}>
                        <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
                      </TouchableOpacity>
                      <Text style={styles.monthTitle}>
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </Text>
                      <TouchableOpacity onPress={handleNextMonth}>
                        <Ionicons name="chevron-forward" size={24} color={Colors.text.primary} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.weekDaysRow}>
                      {weekDays.map((d, i) => (
                        <Text key={i} style={styles.weekDayText}>
                          {d}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.daysGrid}>
                      {days.map((day, idx) => {
                        if (!day) {
                          return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
                        }

                        const dayStr = formatDateString(day);
                        const isSelected = value === dayStr;
                        const isToday = formatDateString(new Date()) === dayStr;
                        
                        let isDisable = false;
                        if (minimumDate && day < new Date(minimumDate.setHours(0,0,0,0))) isDisable = true;
                        if (maximumDate && day > new Date(maximumDate.setHours(23,59,59,999))) isDisable = true;

                        return (
                          <TouchableOpacity
                            key={dayStr}
                            disabled={isDisable}
                            style={[
                              styles.dayCell,
                              isSelected && styles.dayCellSelected,
                              isToday && !isSelected && styles.dayCellToday,
                              isDisable && styles.dayCellDisabled,
                            ]}
                            onPress={() => handleSelectDay(day)}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                isSelected && styles.dayTextSelected,
                                isToday && !isSelected && styles.dayTextToday,
                                isDisable && styles.dayTextDisabled,
                              ]}
                            >
                              {day.getDate()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </Pressable>
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
}) as <T extends FieldValues>(props: DatePickerProps<T>) => React.ReactElement;

(DatePicker as React.FC).displayName = 'DatePicker';

const styles = StyleSheet.create({
  container: { gap: Spacing[1] },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  pickerWrapper: {
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
  valueText: {
    fontSize: FontSize.base,
    color: Colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[4],
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    width: '100%',
    maxWidth: 340,
    ...Shadows.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  monthTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    marginHorizontal: 3,
    borderRadius: 18,
  },
  dayCellEmpty: {
    width: 36,
    height: 36,
    marginVertical: 2,
    marginHorizontal: 3,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary[600],
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: Colors.primary[600],
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
  },
  dayTextSelected: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
  dayTextToday: {
    color: Colors.primary[600],
    fontWeight: FontWeight.bold,
  },
  dayTextDisabled: {
    textDecorationLine: 'line-through',
  },
  cancelBtn: {
    marginTop: Spacing[4],
    alignItems: 'center',
    paddingVertical: Spacing[2],
  },
  cancelBtnText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
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
