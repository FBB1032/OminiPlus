import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Avatar, Card, Divider, AppModal, Input, Button } from '../../components';
import { useToast } from '../../hooks/useAuth';

export default function DoctorProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [consultationFee, setConsultationFee] = useState('150.00');
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeInput, setFeeInput] = useState('');

  const [bio, setBio] = useState('');
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [bioInput, setBioInput] = useState('');

  const handleOpenBioEdit = () => {
    setBioInput(bio);
    setIsBioModalOpen(true);
  };

  const handleSaveBio = () => {
    setBio(bioInput.trim());
    setIsBioModalOpen(false);
    showSuccess('Bio Updated', 'Your professional bio has been saved.');
  };

  const handleOpenFeeEdit = () => {
    setFeeInput(consultationFee);
    setIsFeeModalOpen(true);
  };

  const handleSaveFee = () => {
    const val = parseFloat(feeInput);
    if (isNaN(val) || val < 0) {
      showError('Invalid Amount', 'Please enter a valid consultation fee.');
      return;
    }
    setConsultationFee(val.toFixed(2));
    setIsFeeModalOpen(false);
    showSuccess('Fee Updated', `Consultation fee set to $${val.toFixed(2)}`);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => authService.logout() },
    ]);
  };

  const actionItems = [
    {
      icon: 'calendar-outline',
      label: 'Manage Availability',
      onPress: () => navigation.navigate('DoctorAvailability'),
    },
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      onPress: () => navigation.navigate('ProfileEdit'),
    },
    {
      icon: 'settings-outline',
      label: 'App Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Doctor Identity Card */}
        <Card style={styles.profileCard}>
          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('ProfileEdit')}
            activeOpacity={0.85}
          >
            <View style={{ position: 'relative' }}>
              <Avatar
                name={`${user?.firstName} ${user?.lastName}`}
                uri={user?.avatarUrl}
                size="lg"
                gender={user?.gender}
              />
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: -4,
                backgroundColor: '#0F6E6E',
                width: 22,
                height: 22,
                borderRadius: 11,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#ffffff',
              }}>
                <Ionicons name="camera" size={11} color="#ffffff" />
              </View>
            </View>
            <Text style={styles.doctorName}>
              Dr. {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.specialization}>Cardiology Specialist</Text>
          </TouchableOpacity>

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaValue}>12+</Text>
              <Text style={styles.metaLabel}>Years Exp</Text>
            </View>
            <Divider vertical spacing={4} />
            <View style={styles.metaCol}>
              <Text style={styles.metaValue}>4.9</Text>
              <Text style={styles.metaLabel}>Rating</Text>
            </View>
            <Divider vertical spacing={4} />
            <View style={styles.metaCol}>
              <Text style={styles.metaValue}>1.2k</Text>
              <Text style={styles.metaLabel}>Patients</Text>
            </View>
          </View>
        </Card>

        {/* Professional Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License Number</Text>
              <Text style={styles.infoValue}>LIC-98754-C3</Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Primary Clinic</Text>
              <Text style={styles.infoValue}>Metro Heart & Health Center</Text>
            </View>
            <Divider spacing={3} />

            {/* Editable Consultation Fee Row */}
            <TouchableOpacity
              style={styles.infoRow}
              onPress={handleOpenFeeEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.infoLabel}>Consultation Fee</Text>
              <View style={styles.feeValueRow}>
                <Text style={styles.feeValue}>${consultationFee} / visit</Text>
                <View style={styles.editBadge}>
                  <Ionicons name="create-outline" size={13} color={Colors.primary[600]} />
                  <Text style={styles.editBadgeText}>Edit</Text>
                </View>
              </View>
            </TouchableOpacity>

            <Divider spacing={3} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            {user?.phone ? (
              <>
                <Divider spacing={3} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Professional Bio</Text>
          <View style={styles.infoCard}>
            {bio ? (
              <Text style={styles.bioText}>{bio}</Text>
            ) : (
              <Text style={styles.bioPlaceholder}>
                You haven't added a bio yet. Let patients know about your background, approach, and expertise.
              </Text>
            )}
            <TouchableOpacity
              style={styles.bioEditBtn}
              onPress={handleOpenBioEdit}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={14} color={Colors.primary[600]} />
              <Text style={styles.bioEditBtnText}>{bio ? 'Edit Bio' : 'Add Bio'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action List */}
        <View style={styles.sectionContainer}>
          <View style={styles.actionsCard}>
            {actionItems.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={item.onPress}
                >
                  <View style={styles.actionLeft}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.primary[600]} />
                    <Text style={styles.actionLabel}>{item.label}</Text>
                    {(item as any).badge && (
                      <View style={styles.actionBadge}>
                        <Text style={styles.actionBadgeText}>{(item as any).badge}</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.neutral[400]} />
                </TouchableOpacity>
                {index < actionItems.length - 1 && <Divider spacing={0} />}
              </View>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error.main} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Consultation Fee Modal */}
      <AppModal
        visible={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        title="Set Consultation Fee"
        contentStyle={{ alignSelf: 'center' }}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setIsFeeModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Save Fee"
              onPress={handleSaveFee}
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBody}>
            <View style={styles.feePreviewBanner}>
              <Ionicons name="cash-outline" size={24} color={Colors.primary[600]} />
              <View>
                <Text style={styles.feePreviewLabel}>Current Fee</Text>
                <Text style={styles.feePreviewValue}>${consultationFee} / visit</Text>
              </View>
            </View>
            <Text style={styles.modalHint}>
              Enter your consultation fee in USD. This will be shown to patients when booking an appointment.
            </Text>
            <Input
              label="New Fee (USD)"
              placeholder="e.g. 150.00"
              value={feeInput}
              onChangeText={setFeeInput}
              keyboardType="decimal-pad"
              leftIcon="cash-outline"
              autoFocus
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={true}
            />
          </View>
        </TouchableWithoutFeedback>
      </AppModal>

      {/* Bio Edit Modal */}
      <AppModal
        visible={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        title="Professional Bio"
        contentStyle={{ alignSelf: 'center' }}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setIsBioModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Save Bio"
              onPress={handleSaveBio}
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBody}>
            <Text style={styles.modalHint}>
              Write a short professional bio that will be visible to patients on your profile. Describe your expertise, approach, and experience.
            </Text>
            <View style={styles.bioTextAreaWrapper}>
              <Input
                placeholder="e.g. I am a board-certified cardiologist with 12+ years of experience specialising in..."
                value={bioInput}
                onChangeText={setBioInput}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={styles.bioTextArea}
                autoFocus
              />
            </View>
            <Text style={styles.bioCharCount}>{bioInput.length} / 500 characters</Text>
          </View>
        </TouchableWithoutFeedback>
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
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[5],
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing[6],
    paddingHorizontal: Spacing[4],
  },
  doctorName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing[3],
  },
  specialization: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.semiBold,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[5],
    width: '100%',
    justifyContent: 'space-evenly',
  },
  metaCol: {
    alignItems: 'center',
  },
  metaValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  metaLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  sectionContainer: {
    gap: Spacing[2],
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    paddingLeft: Spacing[1],
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    ...Shadows.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  feeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  feeValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary[100] ?? '#BFDBFE',
  },
  editBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  actionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  actionLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.error.main,
    borderRadius: 16,
    height: 52,
    marginTop: Spacing[2],
    marginBottom: Spacing[8],
    ...Shadows.xs,
  },
  logoutText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.error.main,
  },
  modalBody: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  feePreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.primary[50],
    borderRadius: 14,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.primary[100] ?? '#BFDBFE',
  },
  feePreviewLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  feePreviewValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700] ?? Colors.primary[600],
    marginTop: 2,
  },
  modalHint: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  actionBadge: {
    backgroundColor: Colors.primary[600],
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: Spacing[2],
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bioText: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: Spacing[3],
  },
  bioPlaceholder: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 21,
    fontStyle: 'italic',
    marginBottom: Spacing[3],
  },
  bioEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[3],
    borderRadius: 8,
    backgroundColor: Colors.primary[50] ?? '#EFF6FF',
    borderWidth: 1,
    borderColor: Colors.primary[100] ?? '#BFDBFE',
  },
  bioEditBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary[600],
  },
  bioTextAreaWrapper: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  bioTextArea: {
    height: 140,
    paddingTop: Spacing[3],
    paddingHorizontal: Spacing[3],
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  bioCharCount: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'right',
    marginTop: -Spacing[1],
  },
});
