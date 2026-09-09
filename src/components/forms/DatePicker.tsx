import React, { memo, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';

interface DatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  error?: FieldError;
  minimumDate?: Date;
  maximumDate?: Date;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toDisplayDate = (d: Date) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

const parseValue = (value: unknown): Date | null => {
  if (!value) return null;
  const parsed = typeof value === 'string' ? new Date(value) : (value as Date);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
};

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDayIndex; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
  return days;
};

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
  const [viewMode, setViewMode] = useState<'calendar' | 'months' | 'years'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const hasError = !!error;

  const minTime = minimumDate ? startOfDay(minimumDate).getTime() : null;
  const maxTime = maximumDate ? startOfDay(maximumDate).getTime() : null;

  const isOutOfRange = (d: Date) => {
    const t = startOfDay(d).getTime();
    return (minTime !== null && t < minTime) || (maxTime !== null && t > maxTime);
  };

  const todayISO = toISODate(new Date());

  const years = useMemo(() => {
    const now = new Date();
    const minYear = minimumDate ? minimumDate.getFullYear() : now.getFullYear() - 100;
    const maxYear = maximumDate ? maximumDate.getFullYear() : now.getFullYear() + 10;
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) list.push(y);
    return list;
  }, [minimumDate, maximumDate]);

  const weeks = useMemo(() => {
    const days = getDaysInMonth(currentMonth);
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [currentMonth]);

  const canGoPrev =
    minTime === null || new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getTime() >= minTime;
  const canGoNext =
    maxTime === null || new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).getTime() <= maxTime;

  const todayInRange = !isOutOfRange(new Date());

  const closeModal = () => setModalVisible(false);

  const openModal = (value: unknown) => {
    let parsed = parseValue(value);
    if (parsed && isOutOfRange(parsed)) parsed = null;
    setPendingDate(parsed);

    let base = parsed ?? new Date();
    if (!parsed) {
      if (maxTime !== null && base.getTime() > maxTime && maximumDate) base = startOfDay(maximumDate);
      else if (minTime !== null && base.getTime() < minTime && minimumDate) base = startOfDay(minimumDate);
    }
    setCurrentMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setViewMode('calendar');
    setModalVisible(true);
  };

  const handlePrevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleSelectDay = (day: Date) => setPendingDate(day);

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
    setViewMode('calendar');
  };

  const handleSelectYear = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setViewMode('calendar');
  };

  const handleToday = () => {
    const t = new Date();
    setPendingDate(t);
    setCurrentMonth(new Date(t.getFullYear(), t.getMonth(), 1));
  };

  const isMonthDisabled = (monthIndex: number) => {
    const y = currentMonth.getFullYear();
    const monthStart = new Date(y, monthIndex, 1).getTime();
    const monthEnd = new Date(y, monthIndex + 1, 0).getTime();
    return (minTime !== null && monthEnd < minTime) || (maxTime !== null && monthStart > maxTime);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const parsed = parseValue(value);
          const displayValue = parsed ? toDisplayDate(parsed) : '';
          const selectedISO = parsed ? toISODate(parsed) : '';
          const pendingISO = pendingDate ? toISODate(pendingDate) : '';

          const confirmDate = () => {
            if (!pendingDate) return;
            onChange(toISODate(pendingDate));
            closeModal();
          };

          return (
            <>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openModal(value)}
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
                animationType="slide"
                onRequestClose={closeModal}
              >
                <Pressable style={styles.modalOverlay} onPress={closeModal}>
                  <Pressable style={styles.sheetContent}>
                    <SafeAreaView edges={['bottom']} style={styles.sheetInner}>
                      <View style={styles.handleBar} />

                      <View style={styles.sheetHeaderRow}>
                        <Text style={styles.sheetTitle}>{label || 'Select Date'}</Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={closeModal} activeOpacity={0.7}>
                          <Ionicons name="close" size={18} color={Colors.text.secondary} />
                        </TouchableOpacity>
                      </View>

                      {viewMode === 'calendar' && (
                        <>
                          <View style={styles.navRow}>
                            <TouchableOpacity
                              style={styles.navArrow}
                              onPress={handlePrevMonth}
                              disabled={!canGoPrev}
                              activeOpacity={0.6}
                            >
                              <Ionicons
                                name="chevron-back"
                                size={22}
                                color={canGoPrev ? Colors.text.primary : Colors.neutral[300]}
                              />
                            </TouchableOpacity>

                            <View style={styles.navTitleGroup}>
                              <TouchableOpacity
                                style={styles.navChip}
                                onPress={() => setViewMode('months')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.navChipText}>{MONTH_NAMES[currentMonth.getMonth()]}</Text>
                                <Ionicons name="chevron-down" size={13} color={Colors.text.secondary} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.navChip}
                                onPress={() => setViewMode('years')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.navChipText}>{currentMonth.getFullYear()}</Text>
                                <Ionicons name="chevron-down" size={13} color={Colors.text.secondary} />
                              </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                              style={styles.navArrow}
                              onPress={handleNextMonth}
                              disabled={!canGoNext}
                              activeOpacity={0.6}
                            >
                              <Ionicons
                                name="chevron-forward"
                                size={22}
                                color={canGoNext ? Colors.text.primary : Colors.neutral[300]}
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.weekdayRow}>
                            {WEEKDAY_LABELS.map((d, i) => (
                              <View key={i} style={styles.weekdayCell}>
                                <Text style={styles.weekdayText}>{d}</Text>
                              </View>
                            ))}
                          </View>

                          <View>
                            {weeks.map((week, wi) => (
                              <View key={wi} style={styles.weekRow}>
                                {week.map((day, di) => {
                                  if (!day) return <View key={`e-${wi}-${di}`} style={styles.dayCell} />;

                                  const iso = toISODate(day);
                                  const disabled = isOutOfRange(day);
                                  const isSelected = pendingISO === iso;
                                  const isToday = iso === todayISO;

                                  return (
                                    <TouchableOpacity
                                      key={iso}
                                      style={[styles.dayCell, disabled && styles.dayCellDisabled]}
                                      disabled={disabled}
                                      activeOpacity={0.6}
                                      onPress={() => handleSelectDay(day)}
                                    >
                                      <View
                                        style={[
                                          styles.dayInner,
                                          isSelected && styles.dayInnerSelected,
                                          isToday && !isSelected && styles.dayInnerToday,
                                        ]}
                                      >
                                        <Text
                                          style={[
                                            styles.dayText,
                                            isSelected && styles.dayTextSelected,
                                            isToday && !isSelected && styles.dayTextToday,
                                          ]}
                                        >
                                          {day.getDate()}
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            ))}
                          </View>
                        </>
                      )}

                      {viewMode === 'months' && (
                        <View>
                          {[0, 1, 2, 3].map((rowIdx) => (
                            <View key={rowIdx} style={styles.monthRow}>
                              {MONTH_SHORT.slice(rowIdx * 3, rowIdx * 3 + 3).map((m, i) => {
                                const monthIndex = rowIdx * 3 + i;
                                const active = currentMonth.getMonth() === monthIndex;
                                const disabled = isMonthDisabled(monthIndex);
                                return (
                                  <TouchableOpacity
                                    key={m}
                                    style={[
                                      styles.monthCell,
                                      active && styles.monthCellActive,
                                      disabled && styles.monthCellDisabled,
                                    ]}
                                    disabled={disabled}
                                    activeOpacity={0.7}
                                    onPress={() => handleSelectMonth(monthIndex)}
                                  >
                                    <Text style={[styles.monthCellText, active && styles.monthCellTextActive]}>
                                      {m}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          ))}
                        </View>
                      )}

                      {viewMode === 'years' && (
                        <FlatList
                          data={years}
                          keyExtractor={(y) => String(y)}
                          style={styles.yearsList}
                          showsVerticalScrollIndicator={false}
                          initialNumToRender={15}
                          getItemLayout={(_, index) => ({ length: 48, offset: 48 * index, index })}
                          initialScrollIndex={Math.max(0, years.indexOf(currentMonth.getFullYear()))}
                          renderItem={({ item: y }) => {
                            const active = currentMonth.getFullYear() === y;
                            return (
                              <TouchableOpacity
                                style={[styles.yearRow, active && styles.yearRowActive]}
                                activeOpacity={0.7}
                                onPress={() => handleSelectYear(y)}
                              >
                                <Text style={[styles.yearText, active && styles.yearTextActive]}>{y}</Text>
                                {active && <Ionicons name="checkmark" size={18} color={Colors.primary[600]} />}
                              </TouchableOpacity>
                            );
                          }}
                        />
                      )}

                      {viewMode !== 'calendar' && (
                        <TouchableOpacity
                          style={styles.backToCalendarBtn}
                          activeOpacity={0.7}
                          onPress={() => setViewMode('calendar')}
                        >
                          <Ionicons name="chevron-back" size={16} color={Colors.text.secondary} />
                          <Text style={styles.backToCalendarText}>Back to Calendar</Text>
                        </TouchableOpacity>
                      )}

                      <View style={styles.footerRow}>
                        <TouchableOpacity
                          style={styles.todayBtn}
                          activeOpacity={0.7}
                          disabled={!todayInRange}
                          onPress={handleToday}
                        >
                          <Text style={[styles.todayBtnText, !todayInRange && styles.btnTextDisabled]}>Today</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.doneBtn, !pendingDate && styles.doneBtnDisabled]}
                          activeOpacity={0.8}
                          disabled={!pendingDate}
                          onPress={confirmDate}
                        >
                          <Text style={styles.doneBtnText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    </SafeAreaView>
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
    backgroundColor: 'rgba(15, 23, 23, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
  },
  sheetInner: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  handleBar: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral[300],
    marginBottom: Spacing[3],
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  sheetTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[3],
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleGroup: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  navChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
  },
  navChipText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Spacing[2],
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[400],
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayInner: {
    width: '86%',
    height: '86%',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInnerSelected: {
    backgroundColor: Colors.primary[600],
  },
  dayInnerToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
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
  monthRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[2],
  },
  monthCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
  },
  monthCellActive: {
    backgroundColor: Colors.primary[600],
  },
  monthCellDisabled: {
    opacity: 0.3,
  },
  monthCellText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  monthCellTextActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
  yearsList: {
    maxHeight: 336,
    flexGrow: 0,
  },
  yearRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.md,
  },
  yearRowActive: {
    backgroundColor: Colors.primary[50],
  },
  yearText: {
    fontSize: FontSize.base,
    color: Colors.text.primary,
  },
  yearTextActive: {
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  backToCalendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing[2],
    marginTop: Spacing[1],
  },
  backToCalendarText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  todayBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  todayBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  doneBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[600],
  },
  doneBtnDisabled: {
    opacity: 0.4,
  },
  doneBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  btnTextDisabled: {
    opacity: 0.4,
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
