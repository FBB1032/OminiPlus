import React, { useState, useEffect } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { usePatientDetail, usePatientPrescriptions } from '../../hooks/useDoctor';
import { Avatar, Card, Divider, SkeletonDetail, EmptyState, ErrorState, SkeletonList, AccessDenied } from '../../components';
import { BodyMap } from '../../components/ui/BodyMap';
import { useAuth, useToast } from '../../hooks/useAuth';
import { PainLog, Prescription, Medication, DoctorScreenProps } from '../../types';
import { useAuditLogStore } from '../../store/auditLogStore';
import { useChronicDiseaseStore } from '../../store/chronicDiseaseStore';

type TabType = 'info' | 'vitals' | 'prescriptions' | 'bodymap';

export default function PatientDetailScreen({ route, navigation }: DoctorScreenProps<'PatientDetail'>) {
  const { role, user } = useAuth();
  const { success: showToastSuccess } = useToast();
  const { patientId } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const {
    bpReadings,
    sugarReadings,
    loadChronicData,
    getAdherenceRate,
  } = useChronicDiseaseStore();

  useEffect(() => {
    loadChronicData();
  }, []);

  if (role !== 'doctor' && role !== 'admin') {
    return <AccessDenied onBack={() => navigation.goBack()} message="Only clinical doctors and system administrators are permitted to view patient record files." />;
  }

  if (role === 'doctor' && user?.isApproved === false) {
    return <AccessDenied onBack={() => navigation.goBack()} message="Verification Required: Your practitioner credentials must be verified before you can access patient medical records." />;
  }

  const { data: patient, isLoading: isPatientLoading, isError: isPatientError, refetch: refetchPatient } = usePatientDetail(patientId);
  const { data: prescriptions, isLoading: isPrescriptionsLoading, isError: isPrescriptionsError, refetch: refetchPrescriptions } = usePatientPrescriptions(patientId);

  const showPatientSkeleton = useSkeletonDelay(isPatientLoading, 150);
  const showPrescriptionsSkeleton = useSkeletonDelay(isPrescriptionsLoading, 150);

  const { logEvent } = useAuditLogStore();

  // Emit audit log: doctor viewed patient record
  useEffect(() => {
    if (patientId && user) {
      logEvent({
        patientId,
        patientName: 'Patient Record',
        actorId: user.id,
        actorName: `Dr. ${user.firstName} ${user.lastName}`,
        actorRole: 'doctor',
        actorTitle: (user as any).specialization || 'Healthcare Provider',
        action: 'view',
        recordId: patientId,
        recordName: 'Patient Profile & Medical History Summary',
        recordCategory: 'medical_history',
      });
    }
  }, [patientId]);

  const handleRefetch = () => {
    refetchPatient();
    refetchPrescriptions();
  };

  const age = patient?.age
    ? patient.age
    : patient?.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : null;

  if (showPatientSkeleton) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading Patient...</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SkeletonDetail />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isPatientError || !patient) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <ErrorState onRetry={handleRefetch} message="Could not load patient profile." />
      </SafeAreaView>
    );
  }

  const renderPrescriptionItem = ({ item }: { item: Prescription }) => {
    const issueDate = new Date(item.issuedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.prescriptionCard}
        onPress={() =>
          navigation.navigate('Prescription', {
            appointmentId: item.appointmentId,
            patientId: patient.id,
            mode: 'view',
            prescriptionId: item.id,
          })
        }
      >
        <View style={styles.prescriptionHeader}>
          <View style={styles.prescriptionTitleRow}>
            <Ionicons name="document-text-outline" size={20} color={Colors.primary[600]} />
            <Text style={styles.diagnosisTitle} numberOfLines={1}>
              {item.diagnosis}
            </Text>
          </View>
          <Text style={styles.prescriptionDate}>{issueDate}</Text>
        </View>

        <View style={styles.medsSummary}>
          <Text style={styles.medsLabel}>Medications:</Text>
          {item.medications.map((med: Medication, i: number) => (
            <Text key={i} style={styles.medText} numberOfLines={1}>
              • {med.name} — {med.dosage} ({med.frequency})
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Patient Banner */}
      <View style={styles.banner}>
        <Avatar
          name={`${patient.firstName} ${patient.lastName}`}
          uri={patient.avatarUrl}
          size="lg"
        />
        <View style={styles.bannerInfo}>
          <Text style={styles.patientName}>
            {patient.firstName} {patient.lastName}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {age ? `${age} y/o` : ''} {patient.gender ? `• ${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}` : ''}
          </Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.tabActive]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabLabel, activeTab === 'info' && styles.tabLabelActive]}>
            General
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vitals' && styles.tabActive]}
          onPress={() => setActiveTab('vitals')}
        >
          <Text style={[styles.tabLabel, activeTab === 'vitals' && styles.tabLabelActive]}>
            Vitals ({bpReadings.length + sugarReadings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prescriptions' && styles.tabActive]}
          onPress={() => setActiveTab('prescriptions')}
        >
          <Text style={[styles.tabLabel, activeTab === 'prescriptions' && styles.tabLabelActive]}>
            Rx ({prescriptions?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bodymap' && styles.tabActive]}
          onPress={() => setActiveTab('bodymap')}
        >
          <Text style={[styles.tabLabel, activeTab === 'bodymap' && styles.tabLabelActive]}>
            Pain Map
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'info' ? (
        <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
          {/* Medical Summary */}
          <Card style={styles.infoCard}>
            <Text style={styles.cardTitle}>Vitals & Details</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Age</Text>
              <Text style={styles.detailValue}>{age ? `${age} y/o` : 'N/A'}</Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{patient.email}</Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{patient.phone || 'N/A'}</Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Blood Group</Text>
              <Text style={styles.detailValue}>{patient.bloodGroup || patient.bloodType || 'N/A'}</Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Genotype</Text>
              <Text style={styles.detailValue}>{patient.genotype || 'N/A'}</Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date of Birth</Text>
              <Text style={styles.detailValue}>
                {new Date(patient.dateOfBirth).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={styles.detailValue}>{patient.height ? `${patient.height} cm` : 'N/A'}</Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{patient.weight ? `${patient.weight} kg` : 'N/A'}</Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>BMI</Text>
              {(() => {
                if (!patient.height || !patient.weight) {
                  return <Text style={styles.detailValue}>N/A</Text>;
                }
                const h = patient.height;
                const w = patient.weight;
                const bmiVal = parseFloat((w / Math.pow(h / 100, 2)).toFixed(1));
                let category = 'Normal';
                let color = '#10B981';
                if (bmiVal < 18.5) {
                  category = 'Underweight';
                  color = '#3B82F6';
                } else if (bmiVal >= 25 && bmiVal < 30) {
                  category = 'Overweight';
                  color = '#F59E0B';
                } else if (bmiVal >= 30) {
                  category = 'Obese';
                  color = '#EF4444';
                }
                return (
                  <Text style={[styles.detailValue, { color, fontWeight: 'bold' }]}>
                    {bmiVal} ({category})
                  </Text>
                );
              })()}
            </View>
          </Card>

          {/* Allergies / Chronic Conditions */}
          <Card style={styles.infoCard}>
            <Text style={styles.cardTitle}>Allergies & Conditions</Text>
            <Text style={styles.conditionLabel}>Allergies</Text>
            {patient.allergies && patient.allergies.length > 0 ? (
              <View style={styles.tagContainer}>
                {patient.allergies.map((allergy, i) => (
                  <View key={i} style={[styles.tag, styles.tagRed]}>
                    <Text style={[styles.tagText, styles.tagTextRed]}>{allergy}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No known allergies.</Text>
            )}

            <Divider spacing={4} />

            <Text style={styles.conditionLabel}>Chronic Conditions</Text>
            {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
              <View style={styles.tagContainer}>
                {patient.chronicConditions.map((condition, i) => (
                  <View key={i} style={[styles.tag, styles.tagBlue]}>
                    <Text style={[styles.tagText, styles.tagTextBlue]}>{condition}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No chronic conditions recorded.</Text>
            )}
          </Card>

          {/* Emergency Contact */}
          {patient.emergencyContact ? (
            <Card style={styles.infoCard}>
              <Text style={styles.cardTitle}>Emergency Contact</Text>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{patient.emergencyContact.name}</Text>
              </View>
              <Divider spacing={3} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Relationship</Text>
                <Text style={styles.detailValue}>{patient.emergencyContact.relationship}</Text>
              </View>
              <Divider spacing={3} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{patient.emergencyContact.phone}</Text>
              </View>
            </Card>
          ) : null}
        </ScrollView>
      ) : activeTab === 'vitals' ? (
        <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
          {/* Adherence & Status Card */}
          <Card style={styles.infoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[2] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="pulse" size={20} color={Colors.primary[600]} />
                <Text style={styles.cardTitle}>Chronic Care Adherence</Text>
              </View>
              <View style={[styles.tag, styles.tagBlue]}>
                <Text style={[styles.tagText, styles.tagTextBlue]}>{getAdherenceRate()}% Tracked</Text>
              </View>
            </View>
            <Text style={{ fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 }}>
              Live patient recordings synchronized from patient mobile device. Clinical status reflects recent self-monitoring entries.
            </Text>
          </Card>

          {/* Blood Pressure History */}
          <Card style={styles.infoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[2] }}>
              <Text style={styles.cardTitle}>Blood Pressure Records ({bpReadings.length})</Text>
              <Ionicons name="speedometer-outline" size={18} color="#EF4444" />
            </View>
            {bpReadings.length === 0 ? (
              <Text style={styles.noDataText}>No BP logs recorded by patient yet.</Text>
            ) : (
              bpReadings.map((reading, idx) => {
                const isHigh = reading.category === 'stage1' || reading.category === 'stage2';
                const isElevated = reading.category === 'elevated';
                const badgeBg = isHigh ? '#FEF2F2' : isElevated ? '#FFFBEB' : '#F0FDF4';
                const badgeColor = isHigh ? '#EF4444' : isElevated ? '#D97706' : '#16A34A';
                return (
                  <View key={reading.id || idx} style={{ paddingVertical: 10, borderBottomWidth: idx < bpReadings.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary }}>
                          {reading.systolic}/{reading.diastolic} <Text style={{ fontSize: FontSize.xs, fontWeight: 'normal', color: Colors.text.secondary }}>mmHg</Text>
                        </Text>
                        {reading.pulse ? (
                          <Text style={{ fontSize: FontSize.xs, color: Colors.text.secondary }}>Pulse: {reading.pulse} bpm</Text>
                        ) : null}
                      </View>
                      <View style={{ backgroundColor: badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 11, fontWeight: FontWeight.semiBold, color: badgeColor, textTransform: 'capitalize' }}>
                          {reading.category}
                        </Text>
                      </View>
                    </View>
                    {reading.notes ? (
                      <Text style={{ fontSize: FontSize.xs, color: Colors.text.secondary, fontStyle: 'italic', marginTop: 4 }}>
                        Note: {reading.notes}
                      </Text>
                    ) : null}
                    <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                      {new Date(reading.recordedAt).toLocaleString()}
                    </Text>
                  </View>
                );
              })
            )}
          </Card>

          {/* Blood Glucose History */}
          <Card style={styles.infoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[2] }}>
              <Text style={styles.cardTitle}>Blood Sugar Readings ({sugarReadings.length})</Text>
              <Ionicons name="water-outline" size={18} color="#3B82F6" />
            </View>
            {sugarReadings.length === 0 ? (
              <Text style={styles.noDataText}>No glucose logs recorded by patient yet.</Text>
            ) : (
              sugarReadings.map((reading, idx) => (
                <View key={reading.id || idx} style={{ paddingVertical: 10, borderBottomWidth: idx < sugarReadings.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary }}>
                      {reading.glucoseLevel} <Text style={{ fontSize: FontSize.xs, fontWeight: 'normal', color: Colors.text.secondary }}>mg/dL</Text>
                    </Text>
                    <View style={[styles.tag, styles.tagBlue]}>
                      <Text style={[styles.tagText, styles.tagTextBlue, { textTransform: 'capitalize' }]}>
                        {reading.type.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                    {new Date(reading.recordedAt).toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </Card>

          {/* Hospital Inpatient Referral Action */}
          <Card style={[styles.infoCard, { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Ionicons name="bed-outline" size={20} color={Colors.primary[600]} />
              <Text style={[styles.cardTitle, { color: Colors.primary[700] }]}>Hospital Inpatient Referral</Text>
            </View>
            <Text style={{ fontSize: FontSize.sm, color: Colors.primary[900], lineHeight: 20, marginBottom: 12 }}>
              Need to admit {patient.firstName} to an inpatient ward (ICU, Male Surgical, Emergency)? Route directly to your hospital bed queue.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.primary[600],
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
              onPress={() => {
                showToastSuccess(
                  'Admission Request Routed',
                  `Patient ${patient.firstName} ${patient.lastName} has been queued for admission at your affiliated hospital.`
                );
              }}
            >
              <Ionicons name="share-outline" size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.sm }}>
                Admit to Hospital Ward (Bed #04)
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      ) : activeTab === 'bodymap' ? (
        <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.infoCard}>
            <View style={styles.bodyMapHeader}>
              <Ionicons name="body-outline" size={18} color={Colors.primary[600]} />
              <Text style={styles.cardTitle}>Symptom Pain Map</Text>
            </View>
            {patient.painLogs && patient.painLogs.length > 0 ? (
              <>
                <BodyMap
                  painLogs={patient.painLogs}
                  interactive={false}
                />
                <Divider spacing={4} />
                <Text style={styles.painDetailTitle}>Reported Pain Details</Text>
                {patient.painLogs.map((log: PainLog, i: number) => (
                  <View key={i} style={styles.painLogRow}>
                    <View
                      style={[
                        styles.painSeverityBadge,
                        {
                          backgroundColor:
                            log.severity >= 8 ? '#FEF2F2' :
                            log.severity >= 4 ? '#FFF7ED' : '#FEFCE8',
                          borderColor:
                            log.severity >= 8 ? '#EF4444' :
                            log.severity >= 4 ? '#F97316' : '#EAB308',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.painSeverityBadgeText,
                          {
                            color:
                              log.severity >= 8 ? '#EF4444' :
                              log.severity >= 4 ? '#F97316' : '#B45309',
                          },
                        ]}
                      >
                        {log.severity}/10
                      </Text>
                    </View>
                    <View style={styles.painLogInfo}>
                      <Text style={styles.painLogRegion}>
                        {log.bodyPartId.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </Text>
                      {log.notes ? (
                        <Text style={styles.painLogNotes}>{log.notes}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <EmptyState
                icon="body-outline"
                title="No pain data"
                subtitle="This patient has not recorded any pain regions in the Symptom Checker yet."
              />
            )}
          </Card>
        </ScrollView>
      ) : (
        <View style={styles.listContainer}>
          {showPrescriptionsSkeleton ? (
            <SkeletonList />
          ) : isPrescriptionsError ? (
            <ErrorState onRetry={refetchPrescriptions} message="Could not load prescriptions." />
          ) : !prescriptions || prescriptions.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No prescriptions"
              subtitle="This patient doesn't have any prescriptions issued yet."
            />
          ) : (
            <FlatList
              data={prescriptions}
              keyExtractor={(item) => item.id}
              renderItem={renderPrescriptionItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.prescriptionsScroll}
            />
          )}
        </View>
      )}

      {/* Floating Action Button for Prescription */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('Prescription', {
            appointmentId: 'direct-consult', // direct write prescription
            patientId: patient.id,
            mode: 'create',
          })
        }
      >
        <Ionicons name="add" size={24} color={Colors.text.inverse} />
        <Text style={styles.fabText}>Prescribe</Text>
      </TouchableOpacity>
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
  placeholder: {
    width: 24,
  },
  scrollContent: {
    padding: Spacing[4],
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[5],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[4],
  },
  bannerInfo: {
    gap: 4,
  },
  patientName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  bannerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary[600],
  },
  tabLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.primary[600],
    fontWeight: FontWeight.bold,
  },
  tabContent: {
    padding: Spacing[4],
    gap: Spacing[4],
    paddingBottom: 84, // FAB spacing
  },
  infoCard: {
    padding: Spacing[4],
  },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing[4],
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  conditionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  tag: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagRed: { backgroundColor: '#FEF2F2' },
  tagBlue: { backgroundColor: '#EFF6FF' },
  tagText: { fontSize: FontSize.xs, fontWeight: FontWeight.semiBold },
  tagTextRed: { color: '#EF4444' },
  tagTextBlue: { color: '#3B82F6' },
  noDataText: {
    fontSize: FontSize.xs,
    color: Colors.text.disabled,
    fontStyle: 'italic',
  },
  listContainer: {
    flex: 1,
    padding: Spacing[4],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prescriptionsScroll: {
    paddingBottom: 84, // FAB spacing
  },
  prescriptionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing[4],
    gap: Spacing[3],
    ...Shadows.xs,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prescriptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flex: 1,
  },
  diagnosisTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  prescriptionDate: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  medsSummary: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing[3],
    gap: 4,
  },
  medsLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  medText: {
    fontSize: FontSize.xs,
    color: Colors.text.primary,
  },
  separator: {
    height: Spacing[3],
  },
  fab: {
    position: 'absolute',
    bottom: Spacing[4],
    right: Spacing[4],
    backgroundColor: Colors.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    height: 52,
    borderRadius: 26,
    gap: Spacing[2],
    ...Shadows.md,
  },
  fabText: {
    color: Colors.text.inverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  // Body Map tab styles
  bodyMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  painDetailTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing[2],
  },
  painLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  painSeverityBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 40,
    alignItems: 'center',
  },
  painSeverityBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  painLogInfo: {
    flex: 1,
  },
  painLogRegion: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  painLogNotes: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
