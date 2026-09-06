import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useHospitalStore } from '../../store/hospitalStore';
import { Hospital, HospitalTier, HospitalStatus } from '../../types/hospital';
import { AppModal, Input, Button, Card } from '../../components';
import { useToast } from '../../hooks/useAuth';

export default function PlatformAdminHospitalScreen({ navigation }: any) {
  const { success: showSuccess, error: showError } = useToast();

  const hospitals = useHospitalStore((s) => s.hospitals);
  const { registerHospital, updateHospitalStatus } = useHospitalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Registration Form State
  const [hospName, setHospName] = useState('');
  const [shortName, setShortName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Lagos State');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [tier, setTier] = useState<HospitalTier>('tertiary_teaching');
  const [departmentsInput, setDepartmentsInput] = useState('Cardiology, General Medicine, Pediatrics, Surgery');

  const filteredHospitals = hospitals.filter((h) => {
    const query = searchQuery.toLowerCase();
    return (
      h.name.toLowerCase().includes(query) ||
      h.city.toLowerCase().includes(query) ||
      h.licenseNumber.toLowerCase().includes(query) ||
      h.cacNumber.toLowerCase().includes(query)
    );
  });

  const handleRegisterHospital = () => {
    if (!hospName.trim() || !licenseNumber.trim() || !address.trim() || !adminEmail.trim()) {
      showError('Required Fields Missing', 'Please fill in Hospital Name, License Number, Address, and Admin Email.');
      return;
    }

    const depts = departmentsInput
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const newHospital = registerHospital({
      name: hospName.trim(),
      shortName: shortName.trim() || hospName.trim().split(' ')[0],
      licenseNumber: licenseNumber.trim(),
      cacNumber: cacNumber.trim() || `RC-${Math.floor(1000000 + Math.random() * 9000000)}`,
      address: address.trim(),
      city: city.trim() || 'Lagos',
      state: stateName.trim() || 'Lagos State',
      emergencyPhone: emergencyPhone.trim() || '+234 800 000 0000',
      adminEmail: adminEmail.trim(),
      adminName: adminName.trim() || 'Medical Director',
      status: 'active',
      tier,
      departments: depts.length > 0 ? depts : ['General Practice'],
    });

    setIsRegisterModalOpen(false);
    // Reset Form
    setHospName('');
    setShortName('');
    setLicenseNumber('');
    setCacNumber('');
    setAddress('');
    setCity('');
    setAdminEmail('');
    setAdminName('');

    showSuccess('Hospital Registered', `${newHospital.name} has been verified and registered on the OmniPlus platform.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Platform Admin - Hospitals</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Admin Overview Banner */}
        <View style={styles.adminBanner}>
          <View style={styles.adminIconBox}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#0F6E6E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminBannerTitle}>National Health Facilities Registry</Text>
            <Text style={styles.adminBannerSub}>
              Register, verify licenses, and activate healthcare facilities across Nigeria.
            </Text>
          </View>
        </View>

        {/* Action Header */}
        <View style={styles.actionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Registered Hospitals ({hospitals.length})</Text>
            <Text style={styles.sectionSub}>Active facilities with verified medical credentials</Text>
          </View>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => setIsRegisterModalOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.registerBtnText}>Register Hospital</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <Input
          placeholder="Search by facility name, city, license number..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
        />

        {/* Hospital Directory List */}
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id} style={styles.hospitalCard}>
            <View style={styles.hospitalCardHeader}>
              <View style={styles.hospitalIcon}>
                <Ionicons name="business-outline" size={20} color="#0F6E6E" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.hospitalCardName}>{hospital.name}</Text>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#0F6E6E" />
                </View>
                <Text style={styles.hospitalLicense}>
                  License: {hospital.licenseNumber} • CAC: {hospital.cacNumber}
                </Text>
              </View>
              <View
                style={[
                  styles.statusTag,
                  hospital.status === 'active'
                    ? styles.statusActive
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    hospital.status === 'active'
                      ? styles.statusActiveText
                      : styles.statusPendingText,
                  ]}
                >
                  {hospital.status === 'active' ? 'Active / Verified' : 'Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.hospitalMetaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={13} color={Colors.text.secondary} />
                <Text style={styles.metaItemText}>
                  {hospital.address}, {hospital.city}, {hospital.state}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="call-outline" size={13} color={Colors.text.secondary} />
                <Text style={styles.metaItemText}>Emergency: {hospital.emergencyPhone}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="mail-outline" size={13} color={Colors.text.secondary} />
                <Text style={styles.metaItemText}>Admin: {hospital.adminName} ({hospital.adminEmail})</Text>
              </View>
            </View>

            <View style={styles.departmentsRow}>
              {hospital.departments.map((dept) => (
                <View key={dept} style={styles.deptChip}>
                  <Text style={styles.deptChipText}>{dept}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardActionsRow}>
              <Text style={styles.registeredDate}>
                Registered {new Date(hospital.registeredAt).toLocaleDateString()}
              </Text>
              {hospital.status === 'active' ? (
                <TouchableOpacity
                  onPress={() => {
                    updateHospitalStatus(hospital.id, 'suspended');
                    showSuccess('Hospital Suspended', `${hospital.name} temporarily suspended.`);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suspendText}>Suspend</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    updateHospitalStatus(hospital.id, 'active');
                    showSuccess('Hospital Verified', `${hospital.name} activated.`);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activateText}>Activate</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* ── REGISTER HOSPITAL MODAL ── */}
      <AppModal
        visible={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Healthcare Facility"
        contentStyle={{ alignSelf: 'center' }}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setIsRegisterModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Register & Verify"
              onPress={handleRegisterHospital}
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalBody}
        >
          <Input
            label="Official Hospital Organization Name"
            hint="e.g. St. Jude Specialist Hospital"
            value={hospName}
            onChangeText={setHospName}
            leftIcon="business-outline"
            autoFocus
          />

          <Input
            label="Short Display Name"
            hint="e.g. St. Jude Hospital"
            value={shortName}
            onChangeText={setShortName}
            leftIcon="bookmark-outline"
          />

          <Input
            label="Ministry of Health License Number"
            hint="e.g. FMOH/LAG/TER/2023/0411"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            leftIcon="shield-checkmark-outline"
          />

          <Input
            label="Corporate Affairs Commission (CAC) Number"
            hint="e.g. RC-1492048"
            value={cacNumber}
            onChangeText={setCacNumber}
            leftIcon="document-text-outline"
          />

          <Input
            label="Physical Hospital Street Address"
            hint="e.g. 14 Admiralty Way, Lekki Phase 1"
            value={address}
            onChangeText={setAddress}
            leftIcon="location-outline"
          />

          <View style={{ flexDirection: 'row', gap: Spacing[2] }}>
            <View style={{ flex: 1 }}>
              <Input
                label="City"
                hint="e.g. Lagos"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="State"
                hint="e.g. Lagos State"
                value={stateName}
                onChangeText={setStateName}
              />
            </View>
          </View>

          <Input
            label="Emergency Hotline / Switchboard Phone"
            hint="e.g. +234 800 123 4567"
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />

          <Input
            label="Primary Hospital Administrator Name"
            hint="e.g. Dr. Kemi Balogun"
            value={adminName}
            onChangeText={setAdminName}
            leftIcon="person-outline"
          />

          <Input
            label="Primary Administrator Email"
            hint="e.g. medical.director@stjude.ng"
            value={adminEmail}
            onChangeText={setAdminEmail}
            keyboardType="email-address"
            leftIcon="mail-outline"
          />

          <Input
            label="Clinical Departments (Comma Separated)"
            hint="e.g. Cardiology, Pediatrics, Surgery, Oncology"
            value={departmentsInput}
            onChangeText={setDepartmentsInput}
            leftIcon="apps-outline"
          />
        </ScrollView>
      </AppModal>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: '#F0FDFA',
    padding: Spacing[4],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  adminIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E6F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBannerTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  adminBannerSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing[2],
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  sectionSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F6E6E',
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
    borderRadius: 6,
  },
  registerBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: '#FFFFFF',
  },
  hospitalCard: {
    padding: Spacing[3],
    gap: Spacing[2],
  },
  hospitalCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  hospitalIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#E6F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalCardName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  hospitalLicense: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
  statusActive: {
    backgroundColor: '#E6F4F4',
    borderColor: '#B2DFDB',
  },
  statusActiveText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: '#0F6E6E',
  },
  statusPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusPendingText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: '#92400E',
  },
  hospitalMetaRow: {
    gap: 3,
    marginVertical: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItemText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  departmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  deptChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deptChipText: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing[2],
    marginTop: 2,
  },
  registeredDate: {
    fontSize: 10,
    color: Colors.neutral[400],
  },
  suspendText: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: Colors.error.main,
  },
  activateText: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: '#0F6E6E',
  },
  modalBody: {
    paddingVertical: Spacing[2],
    gap: Spacing[3],
  },
});
