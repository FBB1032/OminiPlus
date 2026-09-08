import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useHospitalStore, ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '../../store/hospitalStore';
import { StaffRole, HospitalPermission, HospitalPatient } from '../../types/hospital';
import { AppModal, Input, Button, Card, Divider } from '../../components';
import { useToast } from '../../hooks/useAuth';

type PortalTab = 'staff' | 'doctors' | 'patients';

const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  nurse: 'Nurse',
  receptionist: 'Receptionist / Front Desk',
  pharmacist: 'Pharmacist',
  lab_tech: 'Laboratory Scientist',
  billing_officer: 'Billing & Accounts Officer',
  records_officer: 'Medical Records Officer',
};

export default function HospitalPortalScreen({ navigation }: any) {
  const { success: showSuccess, error: showError } = useToast();

  // Fixed single hospital scope (1 Hospital, 1 Admin, 1 Hospital Staff binding - no switching)
  const hospitals = useHospitalStore((s) => s.hospitals);
  const activeHospital = hospitals[0] || {
    id: 'hosp-evercare',
    name: 'Evercare Hospital Lekki',
    licenseNumber: 'MOH/LAG/2021/4891',
    cacNumber: 'RC-1498201',
    address: '1 Admiralty Way, Lekki Phase 1',
    city: 'Lagos State',
    adminName: 'Dr. Ibrahim Sani',
    adminEmail: 'admin@evercare.ng',
  };

  const [activeTab, setActiveTab] = useState<PortalTab>('staff');

  // Store data & actions
  const staffList = useHospitalStore((s) => s.getHospitalStaff(activeHospital.id));
  const inviteCodes = useHospitalStore((s) => s.getHospitalInviteCodes(activeHospital.id));
  const hospitalPatients = useHospitalStore((s) => s.getHospitalPatients(activeHospital.id));
  const affiliations = useHospitalStore((s) => s.doctorAffiliations);

  const {
    createStaff,
    toggleStaffPermission,
    removeStaff,
    generateDoctorInviteCode,
    intakeHospitalPatient,
  } = useHospitalStore();

  // Add Staff Modal State
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffDept, setStaffDept] = useState('Outpatient Clinic');
  const [staffRole, setStaffRole] = useState<StaffRole>('nurse');
  const [selectedPermissions, setSelectedPermissions] = useState<HospitalPermission[]>(
    ROLE_DEFAULT_PERMISSIONS['nurse']
  );

  // Generate Doctor Code Modal State
  const [isDoctorCodeModalOpen, setIsDoctorCodeModalOpen] = useState(false);
  const [doctorDeptInput, setDoctorDeptInput] = useState('Cardiology');
  const [newlyGeneratedCode, setNewlyGeneratedCode] = useState<string | null>(null);

  // Intake Patient Modal State
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patFullName, setPatFullName] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patMrn, setPatMrn] = useState('');
  const [patDept, setPatDept] = useState('General Medicine');
  const [patIsAppUser, setPatIsAppUser] = useState(false);

  // When staff role changes, auto-tick default permissions
  const handleRoleChange = (role: StaffRole) => {
    setStaffRole(role);
    setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS[role] || []);
  };

  const handleTogglePermission = (permission: HospitalPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSaveStaff = () => {
    if (!staffName.trim() || !staffEmail.trim() || !staffPhone.trim()) {
      showError('Missing Information', 'Please fill in full name, email, and phone.');
      return;
    }

    createStaff({
      hospitalId: activeHospital.id,
      fullName: staffName.trim(),
      email: staffEmail.trim(),
      phone: staffPhone.trim(),
      role: staffRole,
      department: staffDept.trim(),
      customPermissions: selectedPermissions,
    });

    setIsAddStaffModalOpen(false);
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    showSuccess('Staff Member Added', `${staffName} has been assigned as a ${STAFF_ROLE_LABELS[staffRole]}.`);
  };

  const handleGenerateCode = () => {
    if (!doctorDeptInput.trim()) {
      showError('Department Required', 'Please enter a department for this doctor link code.');
      return;
    }

    const invite = generateDoctorInviteCode(
      activeHospital.id,
      doctorDeptInput.trim(),
      activeHospital.adminName
    );

    setNewlyGeneratedCode(invite.code);
    showSuccess('6-Digit Code Generated', `Code: ${invite.code} (Valid for 48 hours)`);
  };

  const handleSavePatient = () => {
    if (!patFullName.trim() || !patPhone.trim()) {
      showError('Missing Information', 'Patient name and phone number are required.');
      return;
    }

    const mrn = patMrn.trim() || `EVR-${Math.floor(1000 + Math.random() * 9000)}`;

    intakeHospitalPatient({
      hospitalId: activeHospital.id,
      hospitalName: activeHospital.name,
      fullName: patFullName.trim(),
      phone: patPhone.trim(),
      email: patEmail.trim() || undefined,
      mrn,
      dateOfBirth: '1990-01-01',
      gender: 'male',
      department: patDept.trim(),
      isAppUser: patIsAppUser,
      lastVisit: new Date().toISOString().split('T')[0],
      notes: patIsAppUser
        ? 'Account registered on OmniPlus app.'
        : 'Physical in-hospital record. Not registered on app.',
    });

    setIsPatientModalOpen(false);
    setPatFullName('');
    setPatPhone('');
    setPatEmail('');
    setPatMrn('');
    showSuccess('Patient Intaked', `${patFullName} registered with MRN: ${mrn}`);
  };

  // Doctors affiliated with this hospital
  const linkedDoctors = Object.values(affiliations).filter(
    (aff) => aff.hospitalId === activeHospital.id
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospital Admin Portal</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Fixed & Immutable Hospital Banner */}
        <Card style={styles.hospitalIdentityCard}>
          <View style={styles.hospitalHeaderRow}>
            <View style={styles.hospitalIconContainer}>
              <Ionicons name="business-outline" size={24} color="#0F6E6E" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.hospitalNameText}>{activeHospital.name}</Text>
                <Ionicons name="shield-checkmark-outline" size={16} color="#0F6E6E" />
              </View>
              <Text style={styles.hospitalLicenseText}>
                Lic: {activeHospital.licenseNumber} • CAC: {activeHospital.cacNumber}
              </Text>
              <Text style={styles.hospitalAddressText}>
                {activeHospital.address}, {activeHospital.city}
              </Text>
            </View>
          </View>

          <View style={styles.lockedIdentityBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#0F6E6E" />
            <Text style={styles.lockedIdentityText}>
              Organization identity verified & locked by Platform Super-Admin. Name cannot be modified.
            </Text>
          </View>
        </Card>

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.portalTab, activeTab === 'staff' && styles.portalTabActive]}
            onPress={() => setActiveTab('staff')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people-outline"
              size={16}
              color={activeTab === 'staff' ? '#0F6E6E' : Colors.text.secondary}
            />
            <Text
              style={[
                styles.portalTabText,
                activeTab === 'staff' && styles.portalTabTextActive,
              ]}
            >
              Staff ({staffList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.portalTab, activeTab === 'doctors' && styles.portalTabActive]}
            onPress={() => setActiveTab('doctors')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="medkit-outline"
              size={16}
              color={activeTab === 'doctors' ? '#0F6E6E' : Colors.text.secondary}
            />
            <Text
              style={[
                styles.portalTabText,
                activeTab === 'doctors' && styles.portalTabTextActive,
              ]}
            >
              Doctors & Codes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.portalTab, activeTab === 'patients' && styles.portalTabActive]}
            onPress={() => setActiveTab('patients')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="folder-outline"
              size={16}
              color={activeTab === 'patients' ? '#0F6E6E' : Colors.text.secondary}
            />
            <Text
              style={[
                styles.portalTabText,
                activeTab === 'patients' && styles.portalTabTextActive,
              ]}
            >
              Patients ({hospitalPatients.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── TAB 1: STAFF & PERMISSIONS ── */}
        {activeTab === 'staff' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Hospital Staff Directory</Text>
                <Text style={styles.sectionSub}>Manage clinical and administrative staff roles</Text>
              </View>
              <TouchableOpacity
                style={styles.actionAddBtn}
                onPress={() => {
                  setStaffRole('nurse');
                  setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS['nurse']);
                  setIsAddStaffModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="add-outline" size={16} color="#FFFFFF" />
                <Text style={styles.actionAddBtnText}>Add Staff</Text>
              </TouchableOpacity>
            </View>

            {/* Doctor Account Restriction Banner */}
            <View style={styles.doctorNoticeCard}>
              <Ionicons name="information-circle-outline" size={18} color="#0F6E6E" />
              <Text style={styles.doctorNoticeText}>
                Notice: Doctor accounts cannot be created here. Doctors register independently with their MDCN medical credentials and connect to your hospital using 6-digit invite codes in the "Doctors & Codes" tab.
              </Text>
            </View>

            {/* Staff Members List */}
            {staffList.map((member) => (
              <Card key={member.id} style={styles.staffCard}>
                <View style={styles.staffCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.staffName}>{member.fullName}</Text>
                    <Text style={styles.staffContact}>
                      {member.email} • {member.phone}
                    </Text>
                  </View>
                  <View style={styles.roleChip}>
                    <Text style={styles.roleChipText}>{STAFF_ROLE_LABELS[member.role]}</Text>
                  </View>
                </View>

                <Text style={styles.staffDeptText}>
                  Department: {member.department} • Facility: {activeHospital.name}
                </Text>

                <Divider spacing={2} />

                <Text style={styles.permissionsLabel}>Active Permissions ({member.permissions.length}):</Text>
                <View style={styles.permissionChipsContainer}>
                  {member.permissions.map((pKey) => {
                    const def = ALL_PERMISSIONS.find((p) => p.key === pKey);
                    return (
                      <View key={pKey} style={styles.permissionChip}>
                        <Ionicons name="checkmark-outline" size={10} color="#0F6E6E" />
                        <Text style={styles.permissionChipText}>{def?.label || pKey}</Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.staffCardFooter}>
                  <Text style={styles.joinedDateText}>
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Remove Staff', `Remove ${member.fullName} from ${activeHospital.name}?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => {
                            removeStaff(member.id);
                            showSuccess('Staff Removed', `${member.fullName} has been unassigned.`);
                          },
                        },
                      ]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeStaffText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ── TAB 2: DOCTORS & 6-DIGIT CODES ── */}
        {activeTab === 'doctors' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Doctor Link Codes</Text>
                <Text style={styles.sectionSub}>Generate 6-digit codes to link licensed doctors</Text>
              </View>
              <TouchableOpacity
                style={styles.actionAddBtn}
                onPress={() => {
                  setNewlyGeneratedCode(null);
                  setIsDoctorCodeModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="keypad-outline" size={16} color="#FFFFFF" />
                <Text style={styles.actionAddBtnText}>Generate 6-Digit Code</Text>
              </TouchableOpacity>
            </View>

            {/* Active Invite Codes */}
            <Text style={styles.subSectionTitle}>Active Unused Codes ({inviteCodes.length})</Text>
            {inviteCodes.length === 0 ? (
              <Card style={styles.emptyNoticeCard}>
                <Text style={styles.emptyNoticeText}>
                  No active 6-digit invitation codes. Generate one above and share it with your doctor.
                </Text>
              </Card>
            ) : (
              inviteCodes.map((codeItem) => (
                <Card key={codeItem.code} style={styles.codeCard}>
                  <View style={styles.codeCardHeader}>
                    <View style={styles.codeDisplayBox}>
                      <Text style={styles.codeDisplayText}>{codeItem.code}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing[3] }}>
                      <Text style={styles.codeDeptText}>Department: {codeItem.department}</Text>
                      <Text style={styles.codeExpiryText}>
                        Expires: {new Date(codeItem.expiresAt).toLocaleString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyCodeBtn}
                      onPress={() => {
                        showSuccess('Code Ready', `Give 6-digit code ${codeItem.code} to the doctor.`);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="copy-outline" size={14} color="#0F6E6E" />
                      <Text style={styles.copyCodeBtnText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}

            {/* Currently Affiliated Doctors */}
            <Text style={[styles.subSectionTitle, { marginTop: Spacing[4] }]}>
              Linked Doctors ({linkedDoctors.length})
            </Text>
            {linkedDoctors.length === 0 ? (
              <Card style={styles.emptyNoticeCard}>
                <Text style={styles.emptyNoticeText}>
                  No doctors currently connected. When a doctor enters an invitation code in their app settings, they will appear here.
                </Text>
              </Card>
            ) : (
              linkedDoctors.map((docAff) => (
                <Card key={docAff.doctorId} style={styles.linkedDocCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={styles.linkedDocName}>Doctor ID: {docAff.doctorId}</Text>
                      <Text style={styles.linkedDocDept}>Department: {docAff.department}</Text>
                      <Text style={styles.linkedDocMeta}>
                        Linked on: {new Date(docAff.linkedAt).toLocaleDateString()} (Via code: {docAff.linkedViaCode})
                      </Text>
                    </View>
                    <View style={styles.docActiveBadge}>
                      <Ionicons name="checkmark-circle-outline" size={12} color="#0F6E6E" />
                      <Text style={styles.docActiveBadgeText}>Active Affiliation</Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ── TAB 3: PATIENT ROSTER ── */}
        {activeTab === 'patients' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Hospital Patient Roster</Text>
                <Text style={styles.sectionSub}>App registered users and physical intake records</Text>
              </View>
              <TouchableOpacity
                style={styles.actionAddBtn}
                onPress={() => setIsPatientModalOpen(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
                <Text style={styles.actionAddBtnText}>Intake Patient</Text>
              </TouchableOpacity>
            </View>

            {hospitalPatients.map((patient) => (
              <Card key={patient.id} style={styles.patientRecordCard}>
                <View style={styles.patientRecordHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientRecordName}>{patient.fullName}</Text>
                    <Text style={styles.patientRecordMeta}>
                      MRN: {patient.mrn} • Phone: {patient.phone}
                    </Text>
                  </View>
                  {patient.isAppUser ? (
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

                {!patient.isAppUser && (
                  <View style={styles.patientOfflineNotice}>
                    <Ionicons name="information-circle-outline" size={14} color="#B45309" />
                    <Text style={styles.patientOfflineNoticeText}>
                      Offline Record: Patient not registered on OmniPlus app. Attends physical clinic visits.
                    </Text>
                  </View>
                )}

                <Text style={styles.patientNotesText}>{patient.notes}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── ADD STAFF MODAL WITH AUTO-TICKED PERMISSIONS ── */}
      <AppModal
        visible={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        title="Add Hospital Staff Member"
        contentStyle={{ alignSelf: 'center' }}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setIsAddStaffModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Save Staff Member"
              onPress={handleSaveStaff}
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
            label="Full Name & Professional Title"
            hint="e.g. Sister Zainab Aliyu, RN"
            value={staffName}
            onChangeText={setStaffName}
            leftIcon="person-outline"
          />

          <Input
            label="Staff Official Email"
            hint="e.g. z.aliyu@hospital.org"
            value={staffEmail}
            onChangeText={setStaffEmail}
            keyboardType="email-address"
            leftIcon="mail-outline"
          />

          <Input
            label="Phone Number"
            hint="e.g. +234 802 345 6789"
            value={staffPhone}
            onChangeText={setStaffPhone}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />

          <Input
            label="Assigned Department / Ward"
            hint="e.g. Inpatient Ward A"
            value={staffDept}
            onChangeText={setStaffDept}
            leftIcon="business-outline"
          />

          {/* Role Selection Dropdown Buttons */}
          <Text style={styles.inputLabel}>Staff Role (Auto-configures default permissions)</Text>
          <View style={styles.roleSelectGrid}>
            {(['nurse', 'receptionist', 'pharmacist', 'lab_tech', 'billing_officer', 'records_officer'] as StaffRole[]).map(
              (roleKey) => {
                const isSelected = staffRole === roleKey;
                return (
                  <TouchableOpacity
                    key={roleKey}
                    style={[styles.roleSelectBtn, isSelected && styles.roleSelectBtnActive]}
                    onPress={() => handleRoleChange(roleKey)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.roleSelectBtnText,
                        isSelected && styles.roleSelectBtnTextActive,
                      ]}
                    >
                      {STAFF_ROLE_LABELS[roleKey]}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          {/* Granular Permissions Checkboxes */}
          <View style={styles.permissionsSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.inputLabel}>Role Permissions (Tick to modify)</Text>
              <Text style={styles.permissionCountText}>{selectedPermissions.length} granted</Text>
            </View>

            <View style={styles.permissionsList}>
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = selectedPermissions.includes(perm.key);
                return (
                  <TouchableOpacity
                    key={perm.key}
                    style={[styles.permissionRow, isChecked && styles.permissionRowChecked]}
                    onPress={() => handleTogglePermission(perm.key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkboxBox, isChecked && styles.checkboxBoxChecked]}>
                      {isChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing[2] }}>
                      <Text style={styles.permLabel}>{perm.label}</Text>
                      <Text style={styles.permDesc}>{perm.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </AppModal>

      {/* ── GENERATE DOCTOR 6-DIGIT CODE MODAL ── */}
      <AppModal
        visible={isDoctorCodeModalOpen}
        onClose={() => setIsDoctorCodeModalOpen(false)}
        title="Generate Doctor Link Code"
        contentStyle={{ alignSelf: 'center' }}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            <Button
              variant="outline"
              label="Close"
              onPress={() => setIsDoctorCodeModalOpen(false)}
              style={{ flex: 1 }}
            />
            {!newlyGeneratedCode && (
              <Button
                variant="primary"
                label="Generate Code"
                onPress={handleGenerateCode}
                style={{ flex: 1 }}
              />
            )}
          </View>
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalBody}
        >
          {newlyGeneratedCode ? (
            <View style={styles.codeGeneratedSuccessBox}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#0F6E6E" />
              <Text style={styles.codeGeneratedTitle}>6-Digit Doctor Code Created</Text>
              <View style={styles.bigCodeCard}>
                <Text style={styles.bigCodeText}>{newlyGeneratedCode}</Text>
              </View>
              <Text style={styles.codeInstructions}>
                Share this 6-digit code with the doctor. They should open OmniPlus, go to Profile Settings &gt; Hospital Affiliation, and enter this code to connect.
              </Text>
              <Text style={styles.codeNoticeSmall}>
                Valid for 48 hours. Can only be redeemed once by one doctor account.
              </Text>
            </View>
          ) : (
            <View style={{ gap: Spacing[3] }}>
              <Text style={styles.generateModalNotice}>
                Doctors register independently with their credentials. To affiliate a doctor with {activeHospital.name}, generate a temporary 6-digit security code.
              </Text>

              <Input
                label="Doctor's Department / Unit"
                hint="e.g. Cardiology, Pediatrics, General Medicine"
                value={doctorDeptInput}
                onChangeText={setDoctorDeptInput}
                leftIcon="business-outline"
                autoFocus
              />
            </View>
          )}
        </ScrollView>
      </AppModal>

      {/* ── INTAKE PATIENT MODAL ── */}
      <AppModal
        visible={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        title="Intake Hospital Patient"
        contentStyle={{ alignSelf: 'center' }}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setIsPatientModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Save Patient Record"
              onPress={handleSavePatient}
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
            label="Patient Full Name"
            hint="e.g. Ibrahim Abubakar"
            value={patFullName}
            onChangeText={setPatFullName}
            leftIcon="person-outline"
          />

          <Input
            label="Patient Phone Number"
            hint="e.g. +234 803 123 4567"
            value={patPhone}
            onChangeText={setPatPhone}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />

          <Input
            label="Email Address (Optional)"
            hint="e.g. patient@example.com"
            value={patEmail}
            onChangeText={setPatEmail}
            keyboardType="email-address"
            leftIcon="mail-outline"
          />

          <Input
            label="Hospital MRN / File Number"
            hint="Leave blank to auto-generate"
            value={patMrn}
            onChangeText={setPatMrn}
            leftIcon="barcode-outline"
          />

          <Input
            label="Department"
            hint="e.g. Cardiology"
            value={patDept}
            onChangeText={setPatDept}
            leftIcon="business-outline"
          />

          <TouchableOpacity
            style={[styles.appUserToggle, patIsAppUser && styles.appUserToggleActive]}
            onPress={() => setPatIsAppUser(!patIsAppUser)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkboxBox, patIsAppUser && styles.checkboxBoxChecked]}>
              {patIsAppUser && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <View style={{ flex: 1, marginLeft: Spacing[2] }}>
              <Text style={styles.appUserToggleTitle}>Patient is already registered on OmniPlus App</Text>
              <Text style={styles.appUserToggleSub}>
                If unchecked, patient will be marked as "Hospital Record Only" for in-hospital care.
              </Text>
            </View>
          </TouchableOpacity>
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
    gap: Spacing[4],
  },
  hospitalIdentityCard: {
    padding: Spacing[4],
    gap: Spacing[3],
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  hospitalHeaderRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  hospitalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E6F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalNameText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  hospitalLicenseText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  hospitalAddressText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 1,
  },
  lockedIdentityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  lockedIdentityText: {
    fontSize: 11,
    color: '#0F6E6E',
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
  },
  portalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  portalTabActive: {
    backgroundColor: '#E6F4F4',
  },
  portalTabText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  portalTabTextActive: {
    color: '#0F6E6E',
    fontWeight: FontWeight.bold,
  },
  sectionContainer: {
    gap: Spacing[3],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  subSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  actionAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F6E6E',
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionAddBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: '#FFFFFF',
  },
  doctorNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDFA',
    padding: Spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  doctorNoticeText: {
    fontSize: 12,
    color: '#0F6E6E',
    flex: 1,
    lineHeight: 16,
  },
  staffCard: {
    padding: Spacing[3],
    gap: Spacing[2],
  },
  staffCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  staffName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  staffContact: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  roleChip: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: '#3730A3',
  },
  staffDeptText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  permissionsLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  permissionChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  permissionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  permissionChipText: {
    fontSize: 10,
    color: '#0F6E6E',
  },
  staffCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  joinedDateText: {
    fontSize: 10,
    color: Colors.neutral[400],
  },
  removeStaffText: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: Colors.error.main,
  },
  emptyNoticeCard: {
    padding: Spacing[4],
    alignItems: 'center',
  },
  emptyNoticeText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  codeCard: {
    padding: Spacing[3],
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeDisplayBox: {
    backgroundColor: '#E6F4F4',
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  codeDisplayText: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: '#0F6E6E',
    letterSpacing: 2,
  },
  codeDeptText: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  codeExpiryText: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyCodeBtnText: {
    fontSize: 11,
    color: '#0F6E6E',
    fontWeight: FontWeight.medium,
  },
  linkedDocCard: {
    padding: Spacing[3],
  },
  linkedDocName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  linkedDocDept: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  linkedDocMeta: {
    fontSize: 10,
    color: Colors.neutral[400],
    marginTop: 1,
  },
  docActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  docActiveBadgeText: {
    fontSize: 11,
    color: '#0F6E6E',
    fontWeight: FontWeight.medium,
  },
  patientRecordCard: {
    padding: Spacing[3],
    gap: Spacing[2],
  },
  patientRecordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  patientRecordName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  patientRecordMeta: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
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
  patientOfflineNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    padding: Spacing[2],
    borderRadius: 6,
  },
  patientOfflineNoticeText: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
  },
  patientNotesText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  modalBody: {
    paddingVertical: Spacing[2],
    gap: Spacing[3],
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  roleSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleSelectBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  roleSelectBtnActive: {
    backgroundColor: '#E6F4F4',
    borderColor: '#0F6E6E',
  },
  roleSelectBtnText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  roleSelectBtnTextActive: {
    color: '#0F6E6E',
    fontWeight: FontWeight.bold,
  },
  permissionsSection: {
    marginTop: Spacing[2],
    gap: Spacing[2],
  },
  permissionCountText: {
    fontSize: 11,
    color: '#0F6E6E',
    fontWeight: FontWeight.bold,
  },
  permissionsList: {
    gap: 6,
    maxHeight: 220,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  permissionRowChecked: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#0F6E6E',
    borderColor: '#0F6E6E',
  },
  permLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  permDesc: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  codeGeneratedSuccessBox: {
    alignItems: 'center',
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  codeGeneratedTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  bigCodeCard: {
    backgroundColor: '#E6F4F4',
    borderWidth: 2,
    borderColor: '#0F6E6E',
    borderRadius: 8,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    marginVertical: Spacing[2],
  },
  bigCodeText: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: '#0F6E6E',
    letterSpacing: 6,
  },
  codeInstructions: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  codeNoticeSmall: {
    fontSize: 11,
    color: Colors.neutral[400],
    marginTop: 4,
  },
  generateModalNotice: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  appUserToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing[2],
  },
  appUserToggleActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  appUserToggleTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  appUserToggleSub: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
