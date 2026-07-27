import React, { useState } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { usePrescriptionHistory } from '../../hooks/usePatient';
import { Card, Avatar, SkeletonList, EmptyState, ErrorState, Divider } from '../../components';

export default function PrescriptionHistoryScreen({ route, navigation }: any) {
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: prescriptionsResponse, isLoading: _isLoading, isError, refetch } = usePrescriptionHistory();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);

  React.useEffect(() => {
    if (prescriptionsResponse?.data && route.params?.prescriptionId) {
      const found = prescriptionsResponse.data.find((p: any) => p.id === route.params.prescriptionId);
      if (found) {
        setSelectedPrescription(found);
        setModalVisible(true);
      }
    }
  }, [prescriptionsResponse, route.params?.prescriptionId]);

  const handleOpenDetail = (prescription: any) => {
    setSelectedPrescription(prescription);
    setModalVisible(true);
  };

  const renderPrescriptionItem = ({ item }: { item: any }) => {
    const issueDate = new Date(item.issuedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleOpenDetail(item)}
          style={styles.cardHeader}
        >
          <View style={styles.headerLeft}>
            <View style={styles.iconBg}>
              <Ionicons name="medkit-outline" size={20} color={Colors.secondary[600]} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
              <Text style={styles.doctorName}>
                Dr. {item.doctor.firstName} {item.doctor.lastName} • {item.doctor.specialization}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.dateText}>{issueDate}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.neutral[400]} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.medsSummary}>
          <Text style={styles.medsLabel}>Medications:</Text>
          <Text style={styles.medsValue} numberOfLines={1}>
            {item.medications.map((m: any) => m.name).join(', ')}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescriptions</Text>
        <View style={styles.placeholder} />
      </View>

      {showSkeleton ? (
        <View style={styles.listContainer}>
          <SkeletonList count={5} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} message="Could not load prescription records." />
      ) : !prescriptionsResponse || prescriptionsResponse.data.length === 0 ? (
        <EmptyState
          icon="medical-outline"
          title="No prescriptions"
          subtitle="You haven't received any prescriptions yet."
        />
      ) : (
        <FlatList
          data={prescriptionsResponse.data}
          keyExtractor={(item) => item.id}
          renderItem={renderPrescriptionItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={_isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <SafeAreaView style={styles.modalSafeArea}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Prescription Details</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
                </View>

                {/* Modal Body */}
                <ScrollView contentContainerStyle={styles.modalScroll}>
                  <View style={styles.docHeaderCard}>
                    <Avatar
                      name={`Dr. ${selectedPrescription.doctor.lastName}`}
                      uri={selectedPrescription.doctor.avatarUrl}
                      size="md"
                    />
                    <View>
                      <Text style={styles.docDetailName}>
                        Dr. {selectedPrescription.doctor.firstName} {selectedPrescription.doctor.lastName}
                      </Text>
                      <Text style={styles.docDetailSpec}>
                        {selectedPrescription.doctor.specialization}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSecLabel}>Diagnosis</Text>
                    <Text style={styles.detailSecVal}>{selectedPrescription.diagnosis}</Text>
                  </View>

                  <Divider spacing={3} />

                  <Text style={styles.medsSecTitle}>Medications</Text>
                  {selectedPrescription.medications.map((med: any, i: number) => (
                    <View key={i} style={styles.medDetailItem}>
                      <View style={styles.medHeaderRow}>
                        <Text style={styles.medDetailName}>{med.name}</Text>
                        <Text style={styles.medDetailDuration}>{med.duration}</Text>
                      </View>
                      <Text style={styles.medDetailSpecs}>
                        Dosage: {med.dosage} • {med.frequency}
                      </Text>
                      {med.instructions ? (
                        <Text style={styles.medDetailInst}>Note: {med.instructions}</Text>
                      ) : null}
                      {i < selectedPrescription.medications.length - 1 && <View style={styles.medSeparator} />}
                    </View>
                  ))}

                  {selectedPrescription.instructions ? (
                    <>
                      <Divider spacing={3} />
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSecLabel}>General Instructions</Text>
                        <Text style={styles.detailSecVal}>{selectedPrescription.instructions}</Text>
                      </View>
                    </>
                  ) : null}

                  {selectedPrescription.followUpDate ? (
                    <>
                      <Divider spacing={3} />
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSecLabel}>Follow-up Date</Text>
                        <Text style={styles.detailSecVal}>
                          {new Date(selectedPrescription.followUpDate).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </>
                  ) : null}

                  <Divider spacing={3} />

                  <View style={styles.signatureRow}>
                    <Text style={styles.sigLabel}>Issued on:</Text>
                    <Text style={styles.sigValue}>
                      {new Date(selectedPrescription.issuedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </View>
          </View>
        </Modal>
      )}
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
  listContainer: {
    padding: Spacing[4],
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing[3],
    gap: Spacing[3],
    ...Shadows.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    gap: 2,
    flex: 1,
  },
  diagnosisText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  doctorName: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  dateText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  medsSummary: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing[3],
    gap: 2,
  },
  medsLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  medsValue: {
    fontSize: FontSize.xs,
    color: Colors.text.primary,
  },
  separator: {
    height: Spacing[3],
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
    height: '80%',
    ...Shadows.lg,
  },
  modalSafeArea: {
    flex: 1,
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
  docHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.background,
    padding: Spacing[3],
    borderRadius: 12,
  },
  docDetailName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  docDetailSpec: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  detailSection: {
    gap: 4,
  },
  detailSecLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  detailSecVal: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
  },
  medsSecTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  medDetailItem: {
    gap: 4,
  },
  medHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medDetailName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  medDetailDuration: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.secondary[600],
    backgroundColor: Colors.secondary[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  medDetailSpecs: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  medDetailInst: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    fontStyle: 'italic',
  },
  medSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[2],
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[2],
    paddingBottom: Spacing[6],
  },
  sigLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  sigValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
});
