import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useDoctorPatients } from '../../hooks/useDoctor';
import { Avatar, SkeletonList, EmptyState, ErrorState, Input } from '../../components';
import { useDebounce } from '../../hooks/useDebounce';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import { useAuth, useToast } from '../../hooks/useAuth';
import { useHospitalStore } from '../../store/hospitalStore';
import { HospitalPatient } from '../../types/hospital';

type PatientTab = 'private' | 'hospital';

export default function PatientListScreen({ navigation }: any) {
  const { user } = useAuth();
  const { success: showToastSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<PatientTab>('private');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Doctor Affiliation from store
  const doctorId = user?.id || 'current_doctor';
  const affiliation = useHospitalStore((s) => s.getDoctorAffiliation(doctorId));
  const hospitalPatients = useHospitalStore((s) =>
    affiliation ? s.getHospitalPatients(affiliation.hospitalId) : []
  );

  const { data: patientData, isLoading: _isLoading, isError, refetch } = useDoctorPatients();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);

  // Local filtering for private patients
  const filteredPrivatePatients = useMemo(() => {
    if (!patientData || !patientData.data) return [];

    return patientData.data.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = (patient.email || '').toLowerCase();
      const query = debouncedSearchQuery.toLowerCase();

      return fullName.includes(query) || email.includes(query);
    });
  }, [patientData, debouncedSearchQuery]);

  // Local filtering for hospital patients
  const filteredHospitalPatients = useMemo(() => {
    return hospitalPatients.filter((patient) => {
      const fullName = patient.fullName.toLowerCase();
      const phone = patient.phone.toLowerCase();
      const email = (patient.email || '').toLowerCase();
      const mrn = patient.mrn.toLowerCase();
      const query = debouncedSearchQuery.toLowerCase();

      return (
        fullName.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        mrn.includes(query)
      );
    });
  }, [hospitalPatients, debouncedSearchQuery]);

  const handleSendPatientInvite = (patient: HospitalPatient) => {
    showToastSuccess(
      'Invite Sent',
      `Sent OmniPlus download link to ${patient.fullName} (${patient.phone}) via SMS.`
    );
  };

  const handleQueueInHospital = (patient: HospitalPatient) => {
    Alert.alert(
      'Queue for In-Hospital Care',
      `Queue ${patient.fullName} (MRN: ${patient.mrn}) for your next physical consultation at ${affiliation?.hospitalName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Queue Patient',
          onPress: () => {
            showToastSuccess(
              'Queued for In-Hospital Care',
              `${patient.fullName} has been added to your physical clinic queue.`
            );
          },
        },
      ]
    );
  };

  const renderPrivatePatientItem = useCallback(
    ({ item }: { item: any }) => {
      const age = item.dateOfBirth
        ? new Date().getFullYear() - new Date(item.dateOfBirth).getFullYear()
        : null;

      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
          activeOpacity={0.7}
          style={styles.patientCard}
        >
          <Avatar
            name={`${item.firstName} ${item.lastName}`}
            uri={item.avatarUrl}
            size="md"
          />
          <View style={styles.infoContainer}>
            <View style={styles.nameHeaderRow}>
              <Text style={styles.patientName}>
                {item.firstName} {item.lastName}
              </Text>
              <View style={styles.telehealthBadge}>
                <Ionicons name="videocam-outline" size={12} color="#0F6E6E" />
                <Text style={styles.telehealthBadgeText}>Direct Telehealth</Text>
              </View>
            </View>
            <View style={styles.detailsRow}>
              {age !== null && <Text style={styles.detailText}>{age} y/o</Text>}
              {item.gender && (
                <>
                  <View style={styles.bulletDot} />
                  <Text style={styles.detailText}>
                    {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
                  </Text>
                </>
              )}
              {item.bloodType && (
                <>
                  <View style={styles.bulletDot} />
                  <Text style={styles.detailText}>Blood: {item.bloodType}</Text>
                </>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  const renderHospitalPatientItem = useCallback(
    ({ item }: { item: HospitalPatient }) => {
      const age = item.dateOfBirth
        ? new Date().getFullYear() - new Date(item.dateOfBirth).getFullYear()
        : null;

      return (
        <View style={styles.hospitalPatientCard}>
          <View style={styles.hospitalCardTop}>
            <Avatar name={item.fullName} size="md" />
            <View style={styles.infoContainer}>
              <View style={styles.nameHeaderRow}>
                <Text style={styles.patientName}>{item.fullName}</Text>
                {item.isAppUser ? (
                  <View style={styles.appUserTag}>
                    <Ionicons name="phone-portrait-outline" size={11} color="#0F6E6E" />
                    <Text style={styles.appUserTagText}>App Patient</Text>
                  </View>
                ) : (
                  <View style={styles.hospitalOnlyTag}>
                    <Ionicons name="document-text-outline" size={11} color="#92400E" />
                    <Text style={styles.hospitalOnlyTagText}>Hospital Record Only</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.mrnText}>MRN: {item.mrn}</Text>
                {age !== null && (
                  <>
                    <View style={styles.bulletDot} />
                    <Text style={styles.detailText}>{age} y/o</Text>
                  </>
                )}
                {item.gender && (
                  <>
                    <View style={styles.bulletDot} />
                    <Text style={styles.detailText}>
                      {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Unregistered Hospital Patient Notice & Actions */}
          {!item.isAppUser && (
            <View style={styles.unregisteredNoticeBox}>
              <View style={styles.noticeTextRow}>
                <Ionicons name="information-circle-outline" size={15} color="#B45309" />
                <Text style={styles.unregisteredNoticeText}>
                  Phone: {item.phone} {item.email ? `• ${item.email}` : ''} is not registered on OmniPlus. Offline in-hospital care only.
                </Text>
              </View>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={() => handleSendPatientInvite(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="paper-plane-outline" size={13} color="#0F6E6E" />
                  <Text style={styles.inviteButtonText}>Send App Invite (SMS)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.queueButton}
                  onPress={() => handleQueueInHospital(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={13} color="#334155" />
                  <Text style={styles.queueButtonText}>Queue for Clinic Visit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {item.isAppUser && (
            <TouchableOpacity
              style={styles.viewRecordBtn}
              onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
              activeOpacity={0.7}
            >
              <Ionicons name="medkit-outline" size={14} color="#0F6E6E" />
              <Text style={styles.viewRecordBtnText}>Open EMR & Clinical Records</Text>
              <Ionicons name="chevron-forward" size={16} color="#0F6E6E" />
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [navigation, affiliation]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patients Directory</Text>
      </View>

      {user?.isApproved === false && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time" size={18} color="#D97706" />
          <Text style={styles.pendingBannerText}>
            Verification Pending. Viewing patient records is locked.
          </Text>
        </View>
      )}

      {/* Tabs: Private vs Hospital */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'private' && styles.tabItemActive]}
          onPress={() => setActiveTab('private')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="person-outline"
            size={15}
            color={activeTab === 'private' ? '#0F6E6E' : Colors.text.secondary}
          />
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'private' && styles.tabItemTextActive,
            ]}
          >
            Private Patients ({patientData?.data?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'hospital' && styles.tabItemActive]}
          onPress={() => setActiveTab('hospital')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="business-outline"
            size={15}
            color={activeTab === 'hospital' ? '#0F6E6E' : Colors.text.secondary}
          />
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'hospital' && styles.tabItemTextActive,
            ]}
            numberOfLines={1}
          >
            {affiliation ? affiliation.hospitalName.split(' ')[0] : 'Hospital'} (
            {hospitalPatients.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hospital Affiliation Header Banner when in Hospital Tab */}
      {activeTab === 'hospital' && affiliation && (
        <View style={styles.hospitalAffiliationBar}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#0F6E6E" />
          <Text style={styles.hospitalAffiliationBarText} numberOfLines={1}>
            {affiliation.hospitalName} • {affiliation.department}
          </Text>
        </View>
      )}

      <View style={styles.searchWrapper}>
        <Input
          placeholder={
            activeTab === 'private'
              ? 'Search private patients by name...'
              : 'Search hospital patients by name, MRN, phone...'
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          clearButtonMode="while-editing"
        />
      </View>

      {activeTab === 'private' ? (
        showSkeleton ? (
          <View style={styles.listContainer}>
            <SkeletonList count={6} />
          </View>
        ) : isError ? (
          <ErrorState onRetry={refetch} message="Could not load private patients list." />
        ) : filteredPrivatePatients.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No private patients found"
            subtitle={
              searchQuery
                ? `No patients match "${searchQuery}"`
                : "You don't have any private consultation patients in your directory yet."
            }
          />
        ) : (
          <FlashList
            data={filteredPrivatePatients}
            keyExtractor={(item) => item.id}
            renderItem={renderPrivatePatientItem}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshing={_isLoading}
            onRefresh={refetch}
            showsVerticalScrollIndicator={false}
            // @ts-ignore
            estimatedItemSize={85}
          />
        )
      ) : !affiliation ? (
        <View style={styles.noAffiliationContainer}>
          <Ionicons name="business-outline" size={48} color={Colors.neutral[400]} />
          <Text style={styles.noAffiliationTitle}>No Hospital Linked</Text>
          <Text style={styles.noAffiliationSubtitle}>
            Connect your doctor account using the 6-digit code provided by your hospital administrator to view your assigned hospital patient roster.
          </Text>
          <TouchableOpacity
            style={styles.connectSettingsBtn}
            onPress={() => navigation.navigate('DoctorTabs', { screen: 'DoctorProfile' })}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
            <Text style={styles.connectSettingsBtnText}>Open Profile Settings</Text>
          </TouchableOpacity>
        </View>
      ) : filteredHospitalPatients.length === 0 ? (
        <EmptyState
          icon="business-outline"
          title="No hospital patients found"
          subtitle={
            searchQuery
              ? `No hospital patients match "${searchQuery}"`
              : `No patients registered yet under ${affiliation.hospitalName}.`
          }
        />
      ) : (
        <FlashList
          data={filteredHospitalPatients}
          keyExtractor={(item) => item.id}
          renderItem={renderHospitalPatientItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          // @ts-ignore
          estimatedItemSize={140}
        />
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
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[2],
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0F6E6E',
  },
  tabItemText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  tabItemTextActive: {
    color: '#0F6E6E',
    fontWeight: FontWeight.bold,
  },
  hospitalAffiliationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: Spacing[4],
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#CCFBF1',
  },
  hospitalAffiliationBarText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: '#0F6E6E',
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listContainer: {
    padding: Spacing[4],
    flexGrow: 1,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: Spacing[3],
    ...Shadows.xs,
  },
  hospitalPatientCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: Spacing[3],
    gap: Spacing[3],
    ...Shadows.xs,
  },
  hospitalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: Spacing[3],
    gap: 4,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  patientName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  telehealthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  telehealthBadgeText: {
    fontSize: 10,
    color: '#0F6E6E',
    fontWeight: FontWeight.medium,
  },
  appUserTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  appUserTagText: {
    fontSize: 10,
    color: '#0F6E6E',
    fontWeight: FontWeight.medium,
  },
  hospitalOnlyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hospitalOnlyTagText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: FontWeight.medium,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  mrnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.neutral[400],
    marginHorizontal: Spacing[2],
  },
  unregisteredNoticeBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  noticeTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  unregisteredNoticeText: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
    lineHeight: 15,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: 2,
  },
  inviteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#E6F4F4',
    borderWidth: 1,
    borderColor: '#B2DFDB',
    paddingVertical: 6,
    borderRadius: 6,
  },
  inviteButtonText: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: '#0F6E6E',
  },
  queueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 6,
    borderRadius: 6,
  },
  queueButtonText: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: '#334155',
  },
  viewRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewRecordBtnText: {
    fontSize: 12,
    color: '#0F6E6E',
    fontWeight: FontWeight.semiBold,
  },
  separator: {
    height: Spacing[3],
  },
  noAffiliationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
    gap: Spacing[3],
  },
  noAffiliationTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  noAffiliationSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  connectSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F6E6E',
    paddingHorizontal: Spacing[4],
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: Spacing[2],
  },
  connectSettingsBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: 8,
  },
  pendingBannerText: {
    fontSize: FontSize.xs,
    color: '#B45309',
    fontWeight: FontWeight.semiBold,
    flex: 1,
  },
});
