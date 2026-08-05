import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Button, Input } from '../../components';
import { useChronicDiseaseStore } from '../../store/chronicDiseaseStore';
import { ChronicConditionType, BPReading, SugarReading } from '../../types/chronic';

export default function ChronicDiseaseScreen({ navigation, route }: any) {
  const initialTab = route.params?.initialTab || 'hypertension';
  const [activeTab, setActiveTab] = useState<ChronicConditionType>(initialTab);

  const {
    bpReadings,
    sugarReadings,
    asthmaReadings,
    pregnancyLogs,
    followUps,
    loadChronicData,
    addBPReading,
    addSugarReading,
    getAdherenceRate,
  } = useChronicDiseaseStore();

  // Log Modal State
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [systolicInput, setSystolicInput] = useState('');
  const [diastolicInput, setDiastolicInput] = useState('');
  const [sugarInput, setSugarInput] = useState('');
  const [sugarType, setSugarType] = useState<'fasting' | 'post_meal' | 'random'>('fasting');

  useEffect(() => {
    loadChronicData();
  }, []);

  const handleSaveBP = async () => {
    const sys = parseInt(systolicInput, 10);
    const dia = parseInt(diastolicInput, 10);

    if (isNaN(sys) || isNaN(dia) || sys < 50 || dia < 30) {
      Alert.alert('Invalid Input', 'Please enter valid Systolic and Diastolic pressure values.');
      return;
    }

    await addBPReading(sys, dia);
    setSystolicInput('');
    setDiastolicInput('');
    setLogModalVisible(false);
    Alert.alert('BP Logged', `Recorded BP reading of ${sys}/${dia} mmHg.`);
  };

  const handleSaveSugar = async () => {
    const sugar = parseFloat(sugarInput);

    if (isNaN(sugar) || sugar < 20 || sugar > 600) {
      Alert.alert('Invalid Input', 'Please enter a valid glucose reading in mg/dL.');
      return;
    }

    await addSugarReading(sugar, sugarType);
    setSugarInput('');
    setLogModalVisible(false);
    Alert.alert('Blood Sugar Logged', `Recorded ${sugarType.replace('_', ' ')} reading of ${sugar} mg/dL.`);
  };

  const adherenceRate = getAdherenceRate();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chronic Disease Management</Text>
        <TouchableOpacity onPress={() => setLogModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.secondary[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Adherence & Doctor Follow-up Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.statsLabel}>Medication Adherence</Text>
              <Text style={styles.statsValue}>{adherenceRate}%</Text>
              <Text style={styles.statsSubtext}>9 of 10 doses taken on time this week</Text>
            </View>

            <View style={styles.dividerCol} />

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.statsLabel}>Next Specialist Review</Text>
              <Text style={styles.followUpDate}>
                {followUps[0] ? new Date(followUps[0].scheduledDate).toLocaleDateString() : 'In 4 Days'}
              </Text>
              <Text style={styles.statsSubtext} numberOfLines={1}>
                {followUps[0] ? followUps[0].doctorName : 'Dr. Musa Ahmed'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Condition Tabs */}
        <View style={styles.tabsRow}>
          {[
            { id: 'hypertension', label: 'Hypertension (BP)', icon: 'heart-outline' },
            { id: 'diabetes', label: 'Diabetes (Sugar)', icon: 'water-outline' },
            { id: 'asthma', label: 'Asthma (Flow)', icon: 'fitness-outline' },
            { id: 'pregnancy', label: 'Pregnancy', icon: 'woman-outline' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as ChronicConditionType)}
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={14}
                  color={isSelected ? Colors.text.inverse : Colors.text.secondary}
                />
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab 1: Hypertension (BP Trends) */}
        {activeTab === 'hypertension' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>BP Trend Analysis</Text>
              <TouchableOpacity onPress={() => setLogModalVisible(true)} style={styles.quickLogBtn}>
                <Ionicons name="add" size={16} color={Colors.secondary[600]} />
                <Text style={styles.quickLogText}>Log BP</Text>
              </TouchableOpacity>
            </View>

            {/* Visual Trend Bars */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Recent Blood Pressure Log</Text>
              <View style={styles.barContainer}>
                {bpReadings.slice(0, 5).map((reading, idx) => {
                  const sysPct = Math.min(100, Math.max(30, (reading.systolic / 180) * 100));
                  return (
                    <View key={reading.id || idx} style={styles.barCol}>
                      <Text style={styles.barValText}>{reading.systolic}</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${sysPct}%` }]} />
                      </View>
                      <Text style={styles.barValText}>{reading.diastolic}</Text>
                      <Text style={styles.barDateText}>
                        {new Date(reading.recordedAt).toLocaleDateString(undefined, { weekday: 'narrow' })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Reading Log Cards */}
            <Text style={styles.subSectionTitle}>Recent Readings</Text>
            {bpReadings.map((item) => (
              <Card key={item.id} style={styles.readingCard}>
                <View style={styles.readingRow}>
                  <View style={styles.readingIconBox}>
                    <Ionicons name="pulse" size={20} color={Colors.primary[600]} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.readingValue}>
                      {item.systolic} / {item.diastolic} <Text style={styles.unitText}>mmHg</Text>
                    </Text>
                    <Text style={styles.readingDate}>
                      {new Date(item.recordedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor:
                          item.category === 'normal'
                            ? '#ECFDF5'
                            : item.category === 'elevated'
                            ? '#FFFBEB'
                            : '#FEF2F2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color:
                            item.category === 'normal'
                              ? '#065F46'
                              : item.category === 'elevated'
                              ? '#92400E'
                              : '#B91C1C',
                        },
                      ]}
                    >
                      {item.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Tab 2: Diabetes (Sugar Trends) */}
        {activeTab === 'diabetes' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Blood Glucose Trends</Text>
              <TouchableOpacity onPress={() => setLogModalVisible(true)} style={styles.quickLogBtn}>
                <Ionicons name="add" size={16} color={Colors.secondary[600]} />
                <Text style={styles.quickLogText}>Log Glucose</Text>
              </TouchableOpacity>
            </View>

            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Target Fasting Range: 70 - 100 mg/dL</Text>
              <View style={styles.targetBox}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.primary[700]} />
                <Text style={styles.targetText}>
                  Your 7-day average fasting glucose is 100 mg/dL (In target range).
                </Text>
              </View>
            </Card>

            <Text style={styles.subSectionTitle}>Glucose Readings</Text>
            {sugarReadings.map((item) => (
              <Card key={item.id} style={styles.readingCard}>
                <View style={styles.readingRow}>
                  <View style={[styles.readingIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="water" size={20} color="#2563EB" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.readingValue}>
                      {item.glucoseLevel} <Text style={styles.unitText}>mg/dL</Text>
                    </Text>
                    <Text style={styles.readingDate}>
                      {item.type.replace('_', ' ').toUpperCase()} •{' '}
                      {new Date(item.recordedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor:
                          item.category === 'normal' ? '#ECFDF5' : '#FFFBEB',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: item.category === 'normal' ? '#065F46' : '#92400E',
                        },
                      ]}
                    >
                      {item.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Tab 3: Asthma */}
        {activeTab === 'asthma' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Asthma & Peak Flow Tracker</Text>
            {asthmaReadings.map((item) => (
              <Card key={item.id} style={styles.readingCard}>
                <View style={styles.readingRow}>
                  <View style={[styles.readingIconBox, { backgroundColor: '#F0FDFA' }]}>
                    <Ionicons name="fitness" size={20} color="#0D9488" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.readingValue}>{item.peakFlow} L/min Peak Flow</Text>
                    <Text style={styles.readingDate}>{item.inhalerPuffs} Inhaler Puffs Recorded</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Tab 4: Pregnancy */}
        {activeTab === 'pregnancy' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pregnancy Journey Tracker</Text>
            {pregnancyLogs.map((item) => (
              <Card key={item.id} style={styles.readingCard}>
                <View style={styles.readingRow}>
                  <View style={[styles.readingIconBox, { backgroundColor: '#FDF2F8' }]}>
                    <Ionicons name="woman" size={20} color="#DB2777" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.readingValue}>Week {item.currentWeek} Milestone</Text>
                    <Text style={styles.readingDate}>Weight: {item.weightKg} kg • {item.fetalKicksCount || 10} Kicks Logged</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Doctor Follow-Up Schedule Card */}
        <View style={styles.followUpSection}>
          <Text style={styles.subSectionTitle}>Upcoming Doctor Follow-up Schedule</Text>
          {followUps.map((fol) => (
            <Card key={fol.id} style={styles.followUpCard}>
              <View style={styles.followUpHeader}>
                <View style={styles.doctorAvatarBox}>
                  <Ionicons name="medical-sharp" size={20} color={Colors.primary[600]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doctorName}>{fol.doctorName}</Text>
                  <Text style={styles.doctorSpec}>{fol.doctorSpecialization}</Text>
                </View>
                <View style={styles.confirmedBadge}>
                  <Text style={styles.confirmedText}>Confirmed</Text>
                </View>
              </View>

              <View style={styles.followUpBody}>
                <Text style={styles.reasonText}>{fol.reason}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
                  <Text style={styles.locationText}>{fol.location}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.secondary[600]} />
                  <Text style={styles.dateHighlight}>
                    {new Date(fol.scheduledDate).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Log Reading Modal */}
      <Modal visible={logModalVisible} transparent animationType="slide" onRequestClose={() => setLogModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === 'hypertension' ? 'Log Blood Pressure' : 'Log Blood Sugar'}
              </Text>
              <TouchableOpacity onPress={() => setLogModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {activeTab === 'hypertension' ? (
                <>
                  <Text style={styles.modalLabel}>Systolic Pressure (mmHg)</Text>
                  <Input placeholder="e.g. 120" keyboardType="numeric" value={systolicInput} onChangeText={setSystolicInput} />

                  <Text style={styles.modalLabel}>Diastolic Pressure (mmHg)</Text>
                  <Input placeholder="e.g. 80" keyboardType="numeric" value={diastolicInput} onChangeText={setDiastolicInput} />

                  <Button label="Save BP Reading" onPress={handleSaveBP} />
                </>
              ) : (
                <>
                  <Text style={styles.modalLabel}>Reading Type</Text>
                  <View style={styles.typeRow}>
                    {(['fasting', 'post_meal', 'random'] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setSugarType(t)}
                        style={[styles.typeChip, sugarType === t && styles.typeChipActive]}
                      >
                        <Text style={[styles.typeText, sugarType === t && styles.typeTextActive]}>
                          {t.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.modalLabel}>Glucose Level (mg/dL)</Text>
                  <Input placeholder="e.g. 98" keyboardType="numeric" value={sugarInput} onChangeText={setSugarInput} />

                  <Button label="Save Glucose Reading" onPress={handleSaveSugar} />
                </>
              )}
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: Spacing[1],
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  addBtn: {
    padding: Spacing[1],
  },
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  statsCard: {
    padding: Spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  statsValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.secondary[600],
  },
  followUpDate: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  statsSubtext: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  dividerCol: {
    width: 1,
    height: 48,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[3],
  },
  tabsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: Colors.primary[700],
    borderColor: Colors.primary[700],
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
  sectionContainer: {
    gap: Spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  quickLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickLogText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.secondary[600],
  },
  chartCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  chartTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: Spacing[2],
  },
  barCol: {
    alignItems: 'center',
    gap: 4,
  },
  barValText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  barTrack: {
    width: 14,
    height: 70,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.secondary[600],
    borderRadius: 7,
  },
  barDateText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  targetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: Spacing[3],
    borderRadius: 8,
    gap: 8,
  },
  targetText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.primary[900],
  },
  subSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  readingCard: {
    padding: Spacing[3],
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  readingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readingValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  unitText: {
    fontSize: FontSize.xs,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  readingDate: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  followUpSection: {
    gap: Spacing[3],
    marginTop: Spacing[2],
  },
  followUpCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  doctorAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  doctorSpec: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  confirmedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  confirmedText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#065F46',
  },
  followUpBody: {
    backgroundColor: Colors.background,
    padding: Spacing[3],
    borderRadius: 8,
    gap: 6,
  },
  reasonText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  dateHighlight: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.secondary[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing[4],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  modalScroll: {
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  modalLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  typeChip: {
    flex: 1,
    paddingVertical: Spacing[2],
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  typeChipActive: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  typeText: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  typeTextActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
});
