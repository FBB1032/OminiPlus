import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Button, Input } from '../../components';
import { storageService } from '../../services/storageService';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  duration: string; // e.g. "7 Days", "Ongoing"
  isActive: boolean;
  startDate: string;
}

interface IntakeLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  date: string; // YYYY-MM-DD
  status: 'taken' | 'pending' | 'skipped';
}

const STORAGE_KEYS = {
  MEDICATIONS: 'ominipulse_medications',
  INTAKE_LOGS: 'ominipulse_intake_logs',
};

const FREQUENCY_OPTIONS = ['Once Daily', 'Twice Daily', 'Thrice Daily', 'Weekly'];
const PRESET_TIMES = ['08:00 AM', '12:00 PM', '02:00 PM', '06:00 PM', '08:00 PM', '10:00 PM'];

export default function MedicationRemindersScreen({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [intakeLogs, setIntakeLogs] = useState<IntakeLog[]>([]);
  
  // Add Medication Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once Daily');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00 AM']);
  const [duration, setDuration] = useState('7 Days');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Check for navigation import parameters
  useEffect(() => {
    if (route.params?.prescribedMeds && route.params.prescribedMeds.length > 0) {
      const meds = route.params.prescribedMeds;
      Alert.alert(
        'Import Prescription',
        `Would you like to automatically add ${meds.length} prescribed medication(s) to your reminders?`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => {
              navigation.setParams({ prescribedMeds: undefined });
            }
          },
          {
            text: 'Add to Reminders',
            onPress: () => {
              importMedications(meds);
            }
          }
        ]
      );
    }
  }, [route.params?.prescribedMeds]);

  const importMedications = async (prescribedMeds: any[]) => {
    try {
      const currentMeds = await storageService.getObject<Medication[]>(STORAGE_KEYS.MEDICATIONS) || [];
      const newMeds: Medication[] = prescribedMeds.map((pm: any, idx: number) => ({
        id: `med-import-${Date.now()}-${idx}`,
        name: pm.name,
        dosage: pm.dosage || 'As prescribed',
        frequency: pm.frequency || 'Once Daily',
        times: pm.frequency.toLowerCase().includes('twice') 
          ? ['08:00 AM', '08:00 PM'] 
          : pm.frequency.toLowerCase().includes('thrice') 
          ? ['08:00 AM', '02:00 PM', '08:00 PM'] 
          : ['08:00 AM'],
        duration: '7 Days',
        isActive: true,
        startDate: new Date().toISOString().split('T')[0],
      }));

      const mergedMeds = [...newMeds, ...currentMeds];
      await saveMedications(mergedMeds);
      
      // Generate intake logs for the new meds for today
      const currentLogs = await storageService.getObject<IntakeLog[]>(STORAGE_KEYS.INTAKE_LOGS) || [];
      const todayStr = new Date().toISOString().split('T')[0];
      const newLogs: IntakeLog[] = [];
      
      newMeds.forEach((m) => {
        m.times.forEach((time, tIdx) => {
          newLogs.push({
            id: `log-import-${m.id}-${tIdx}-${Date.now()}`,
            medicationId: m.id,
            medicationName: m.name,
            dosage: m.dosage,
            time,
            date: todayStr,
            status: 'pending',
          });
        });
      });
      
      const mergedLogs = [...newLogs, ...currentLogs];
      setIntakeLogs(mergedLogs);
      await storageService.setObject(STORAGE_KEYS.INTAKE_LOGS, mergedLogs);

      Alert.alert(
        'Import Successful',
        `Successfully scheduled reminders for ${newMeds.length} medication(s).`
      );
      
      // Clear parameters
      navigation.setParams({ prescribedMeds: undefined });
    } catch (err) {
      Alert.alert('Import Failed', 'Could not save the medication reminders.');
    }
  };

  const loadData = async () => {
    const storedMeds = await storageService.getObject<Medication[]>(STORAGE_KEYS.MEDICATIONS);
    const storedLogs = await storageService.getObject<IntakeLog[]>(STORAGE_KEYS.INTAKE_LOGS);

    if (storedMeds) {
      setMedications(storedMeds);
    } else {
      // Default dummy data if none is set
      const defaultMeds: Medication[] = [
        {
          id: '1',
          name: 'Amoxicillin',
          dosage: '500 mg',
          frequency: 'Twice Daily',
          times: ['08:00 AM', '08:00 PM'],
          duration: '7 Days',
          isActive: true,
          startDate: new Date().toISOString().split('T')[0],
        },
        {
          id: '2',
          name: 'Atorvastatin',
          dosage: '10 mg',
          frequency: 'Once Daily',
          times: ['08:00 PM'],
          duration: 'Ongoing',
          isActive: true,
          startDate: new Date().toISOString().split('T')[0],
        },
      ];
      setMedications(defaultMeds);
      await storageService.setObject(STORAGE_KEYS.MEDICATIONS, defaultMeds);
    }

    if (storedLogs) {
      setIntakeLogs(storedLogs);
    } else {
      // Generate intake logs for today
      const todayStr = new Date().toISOString().split('T')[0];
      const defaultLogs: IntakeLog[] = [
        {
          id: 'log-1',
          medicationId: '1',
          medicationName: 'Amoxicillin',
          dosage: '500 mg',
          time: '08:00 AM',
          date: todayStr,
          status: 'taken',
        },
        {
          id: 'log-2',
          medicationId: '1',
          medicationName: 'Amoxicillin',
          dosage: '500 mg',
          time: '08:00 PM',
          date: todayStr,
          status: 'pending',
        },
        {
          id: 'log-3',
          medicationId: '2',
          medicationName: 'Atorvastatin',
          dosage: '10 mg',
          time: '08:00 PM',
          date: todayStr,
          status: 'pending',
        },
      ];
      setIntakeLogs(defaultLogs);
      await storageService.setObject(STORAGE_KEYS.INTAKE_LOGS, defaultLogs);
    }
  };

  const saveMedications = async (updatedMeds: Medication[]) => {
    setMedications(updatedMeds);
    await storageService.setObject(STORAGE_KEYS.MEDICATIONS, updatedMeds);
    // Refresh today's logs based on changes
    generateTodayLogs(updatedMeds, intakeLogs);
  };

  const saveLogs = async (updatedLogs: IntakeLog[]) => {
    setIntakeLogs(updatedLogs);
    await storageService.setObject(STORAGE_KEYS.INTAKE_LOGS, updatedLogs);
  };

  // Generate today's schedule based on active meds
  const generateTodayLogs = async (allMeds: Medication[], currentLogs: IntakeLog[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const activeMeds = allMeds.filter(m => m.isActive);

    // Keep logs for today that already exist, add new ones if not present
    let updatedLogs = [...currentLogs];

    activeMeds.forEach(med => {
      med.times.forEach(time => {
        const hasLog = currentLogs.some(l => l.medicationId === med.id && l.time === time && l.date === todayStr);
        if (!hasLog) {
          updatedLogs.push({
            id: `log-${med.id}-${time}-${todayStr}`,
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            time,
            date: todayStr,
            status: 'pending',
          });
        }
      });
    });

    // Remove logs for medications that are no longer active or deleted
    updatedLogs = updatedLogs.filter(l => 
      l.date !== todayStr || allMeds.some(m => m.id === l.medicationId && m.isActive)
    );

    saveLogs(updatedLogs);
  };

  const handleAddMedication = () => {
    if (!medName.trim() || !dosage.trim()) {
      Alert.alert('Error', 'Please fill in the medication name and dosage.');
      return;
    }

    const newMed: Medication = {
      id: Date.now().toString(),
      name: medName.trim(),
      dosage: dosage.trim(),
      frequency,
      times: selectedTimes,
      duration,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
    };

    const updatedMeds = [...medications, newMed];
    saveMedications(updatedMeds);

    // Reset Form
    setMedName('');
    setDosage('');
    setFrequency('Once Daily');
    setSelectedTimes(['08:00 AM']);
    setDuration('7 Days');
    setModalVisible(false);
  };

  const handleDeleteMedication = (id: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this medication reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedMeds = medications.filter(m => m.id !== id);
            saveMedications(updatedMeds);
          }
        }
      ]
    );
  };

  const toggleMedActive = (id: string) => {
    const updatedMeds = medications.map(m => {
      if (m.id === id) {
        return { ...m, isActive: !m.isActive };
      }
      return m;
    });
    saveMedications(updatedMeds);
  };

  const toggleIntakeStatus = (logId: string) => {
    const updatedLogs = intakeLogs.map(l => {
      if (l.id === logId) {
        const nextStatus: 'taken' | 'pending' | 'skipped' = l.status === 'taken' ? 'pending' : 'taken';
        return { ...l, status: nextStatus };
      }
      return l;
    });
    saveLogs(updatedLogs);
  };

  const toggleTimeSelection = (time: string) => {
    if (selectedTimes.includes(time)) {
      if (selectedTimes.length > 1) {
        setSelectedTimes(selectedTimes.filter(t => t !== time));
      }
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  // Calculations for compliance
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysSchedule = intakeLogs.filter(l => l.date === todayStr);
  const takenCount = todaysSchedule.filter(l => l.status === 'taken').length;
  const totalCount = todaysSchedule.length;
  const compliancePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medication Reminders</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addIconBtn}>
          <Ionicons name="add" size={26} color={Colors.secondary[600]} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar & Header Stats */}
      {todaysSchedule.length > 0 && (
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Today's Compliance</Text>
              <Text style={styles.progressSubtitle}>
                {takenCount} of {totalCount} doses taken
              </Text>
            </View>
            <Text style={styles.progressPercent}>{compliancePct}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${compliancePct}%` }]} />
          </View>
        </Card>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('today')}
          style={[styles.tab, activeTab === 'today' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>
            Today's Doses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Reminders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lists */}
      <View style={styles.content}>
        {activeTab === 'today' ? (
          todaysSchedule.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={Colors.neutral[400]} />
              <Text style={styles.emptyTitle}>No Doses Scheduled</Text>
              <Text style={styles.emptySubtitle}>Add a medication to generate a daily schedule.</Text>
            </View>
          ) : (
            <FlatList
              data={todaysSchedule.sort((a, b) => a.time.localeCompare(b.time))}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listPadding}
              renderItem={({ item }) => {
                const isTaken = item.status === 'taken';
                return (
                  <Card style={[styles.doseCard, isTaken && styles.doseCardTaken]}>
                    <View style={styles.doseLeft}>
                      <View style={[styles.doseIconContainer, { backgroundColor: isTaken ? '#ECFDF5' : '#FEF2F2' }]}>
                        <Ionicons
                          name="medkit"
                          size={20}
                          color={isTaken ? '#059669' : '#DC2626'}
                        />
                      </View>
                      <View style={styles.doseInfo}>
                        <Text style={[styles.doseMedName, isTaken && styles.doseMedNameTaken]}>
                          {item.medicationName}
                        </Text>
                        <Text style={styles.doseDetails}>
                          {item.dosage} • {item.time}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleIntakeStatus(item.id)}
                      style={[styles.checkBtn, isTaken && styles.checkBtnTaken]}
                    >
                      <Ionicons
                        name={isTaken ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color={isTaken ? '#059669' : Colors.neutral[400]}
                      />
                    </TouchableOpacity>
                  </Card>
                );
              }}
            />
          )
        ) : medications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alarm-outline" size={48} color={Colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No Medications Added</Text>
            <Text style={styles.emptySubtitle}>Tap the plus icon above to add a reminder.</Text>
          </View>
        ) : (
          <FlatList
            data={medications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <Card style={styles.medCard}>
                <View style={styles.medHeader}>
                  <View style={styles.medLeft}>
                    <View style={[styles.medIconContainer, { backgroundColor: item.isActive ? '#EFF6FF' : '#F1F5F9' }]}>
                      <Ionicons
                        name="alarm"
                        size={20}
                        color={item.isActive ? Colors.secondary[600] : Colors.neutral[400]}
                      />
                    </View>
                    <View style={styles.medInfo}>
                      <Text style={styles.medNameText}>{item.name}</Text>
                      <Text style={styles.medDetailsText}>
                        {item.dosage} • {item.frequency}
                      </Text>
                      <Text style={styles.medTimesText}>
                        Times: {item.times.join(', ')}
                      </Text>
                      <Text style={styles.medDurationText}>
                        Duration: {item.duration}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.medActions}>
                    <TouchableOpacity onPress={() => toggleMedActive(item.id)} style={styles.actionBtn}>
                      <Ionicons
                        name={item.isActive ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color={item.isActive ? Colors.secondary[600] : Colors.neutral[400]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteMedication(item.id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            )}
          />
        )}
      </View>

      {/* Sticky Bottom Add Button */}
      <View style={styles.bottomBar}>
        <Button
          label="Add Reminder"
          leftIcon={<Ionicons name="add" size={20} color={Colors.text.inverse} />}
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Add Medication Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Reminder</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.inputLabel}>Medication Name</Text>
              <Input
                placeholder="e.g. Amoxicillin, Vitamin C"
                value={medName}
                onChangeText={setMedName}
              />

              <Text style={styles.inputLabel}>Dosage</Text>
              <Input
                placeholder="e.g. 1 pill, 5 ml, 2 drops"
                value={dosage}
                onChangeText={setDosage}
              />

              <Text style={styles.inputLabel}>Frequency</Text>
              <View style={styles.optionsRow}>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setFrequency(opt)}
                    style={[styles.optionCard, frequency === opt && styles.optionCardActive]}
                  >
                    <Text style={[styles.optionText, frequency === opt && styles.optionTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Reminder Times (Select one or more)</Text>
              <View style={styles.timesContainer}>
                {PRESET_TIMES.map((time) => {
                  const isSelected = selectedTimes.includes(time);
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() => toggleTimeSelection(time)}
                      style={[styles.timeChip, isSelected && styles.timeChipActive]}
                    >
                      <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Duration</Text>
              <View style={styles.optionsRow}>
                {['7 Days', '14 Days', '30 Days', 'Ongoing'].map((dur) => (
                  <TouchableOpacity
                    key={dur}
                    onPress={() => setDuration(dur)}
                    style={[styles.optionCard, duration === dur && styles.optionCardActive]}
                  >
                    <Text style={[styles.optionText, duration === dur && styles.optionTextActive]}>
                      {dur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtonContainer}>
                <Button label="Save Reminder" onPress={handleAddMedication} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    padding: Spacing[1],
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  addIconBtn: {
    padding: Spacing[1],
  },
  progressCard: {
    margin: Spacing[4],
    padding: Spacing[4],
    gap: Spacing[2],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  progressSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  progressPercent: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.secondary[600],
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary[600],
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.secondary[600],
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.secondary[600],
    fontWeight: FontWeight.bold,
  },
  content: {
    flex: 1,
  },
  listPadding: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[6],
    gap: Spacing[2],
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  doseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing[4],
  },
  doseCardTaken: {
    borderColor: '#D1FAE5',
    backgroundColor: '#FAFFFF',
  },
  doseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  doseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doseInfo: {
    gap: 2,
  },
  doseMedName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  doseMedNameTaken: {
    textDecorationLine: 'line-through',
    color: Colors.text.secondary,
  },
  doseDetails: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  checkBtn: {
    padding: Spacing[1],
  },
  checkBtnTaken: {
    opacity: 0.85,
  },
  medCard: {
    padding: Spacing[4],
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medLeft: {
    flexDirection: 'row',
    gap: Spacing[3],
    flex: 1,
  },
  medIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medInfo: {
    gap: 2,
    flex: 1,
  },
  medNameText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  medDetailsText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  medTimesText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  medDurationText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  medActions: {
    flexDirection: 'row',
    gap: Spacing[1],
  },
  actionBtn: {
    padding: Spacing[2],
  },
  bottomBar: {
    padding: Spacing[4],
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  closeBtn: {
    padding: Spacing[1],
  },
  modalScroll: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: -Spacing[2],
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  optionCard: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionCardActive: {
    borderColor: Colors.secondary[600],
    backgroundColor: Colors.secondary[50],
  },
  optionText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  optionTextActive: {
    color: Colors.secondary[600],
    fontWeight: FontWeight.bold,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  timeChipActive: {
    borderColor: Colors.secondary[600],
    backgroundColor: Colors.secondary[600],
  },
  timeChipText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  timeChipTextActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
  modalButtonContainer: {
    marginTop: Spacing[4],
    marginBottom: Spacing[6],
  },
});
