import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Avatar, Card, Divider, AppModal, Input, Button, HospitalBadge } from '../../components';
import { useToast } from '../../hooks/useAuth';
import { useHospitalStore } from '../../store/hospitalStore';

export default function DoctorProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  // ── Tiered consultation fees (Chat < Audio < Video) ──────────────────────
  // Platform minimum ₦2,000 per session — enforced on save.
  const MIN_FEE = 2000;
  const [tierFees, setTierFees] = useState({ chat: 8000, audio: 10000, video: 15000 });
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeInputChat,  setFeeInputChat]  = useState('');
  const [feeInputAudio, setFeeInputAudio] = useState('');
  const [feeInputVideo, setFeeInputVideo] = useState('');

  // Bank Account State (Task 2)
  const [bankName, setBankName] = useState('Wema Bank');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState('Dr. Samuel Okon');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const [bankNameInput, setBankNameInput] = useState('');
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [accountNameInput, setAccountNameInput] = useState('');

  const [bio, setBio] = useState('');
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [bioInput, setBioInput] = useState('');

  // Platform Service Fee Calculator — uses chat tier as representative basis
  const PLATFORM_FEE_PERCENT = 10;
  const calcNet = (gross: number) => Math.max(0, gross - gross * (PLATFORM_FEE_PERCENT / 100));

  const handleOpenBioEdit = () => {
    setBioInput(bio);
    setIsBioModalOpen(true);
  };

  const handleSaveBio = () => {
    setBio(bioInput.trim());
    setIsBioModalOpen(false);
    showSuccess('Bio Updated', 'Your professional bio has been saved.');
  };

  const handleOpenAccountEdit = () => {
    setBankNameInput(bankName);
    setAccountNumberInput(accountNumber);
    setAccountNameInput(accountName);
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = () => {
    if (!bankNameInput.trim() || !accountNumberInput.trim() || !accountNameInput.trim()) {
      showError('Missing Details', 'Please enter bank name, account number, and account name.');
      return;
    }
    if (accountNumberInput.trim().length < 8) {
      showError('Invalid Account', 'Please enter a valid account number.');
      return;
    }
    setBankName(bankNameInput.trim());
    setAccountNumber(accountNumberInput.trim());
    setAccountName(accountNameInput.trim());
    setIsAccountModalOpen(false);
    showSuccess('Account Details Saved', 'Your payout bank account information has been saved.');
  };

  const handleOpenFeeEdit = () => {
    setFeeInputChat(tierFees.chat.toString());
    setFeeInputAudio(tierFees.audio.toString());
    setFeeInputVideo(tierFees.video.toString());
    setIsFeeModalOpen(true);
  };

  const handleSaveTieredFee = () => {
    const parsedChat = Math.max(0, parseFloat(feeInputChat.replace(/,/g, '')) || 0);
    const parsedAudio = Math.max(0, parseFloat(feeInputAudio.replace(/,/g, '')) || 0);
    const parsedVideo = Math.max(0, parseFloat(feeInputVideo.replace(/,/g, '')) || 0);

    // Enforce minimum fee floor
    if (parsedChat < MIN_FEE || parsedAudio < MIN_FEE || parsedVideo < MIN_FEE) {
      showError('Minimum Fee Required', `All tiers must be at least ₦${MIN_FEE.toLocaleString()}.`);
      return;
    }

    // Ensure tiered pricing: Chat < Audio < Video
    if (parsedChat >= parsedAudio || parsedAudio >= parsedVideo) {
      showError('Invalid Tier Pricing', 'Chat fee must be less than Audio, which must be less than Video.');
      return;
    }

    setTierFees({ chat: parsedChat, audio: parsedAudio, video: parsedVideo });
    setIsFeeModalOpen(false);
    showSuccess(
      'Tiered Fees Updated', 
      `Chat: ₦${parsedChat.toLocaleString()}, Audio: ₦${parsedAudio.toLocaleString()}, Video: ₦${parsedVideo.toLocaleString()}`
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => authService.logout() },
    ]);
  };

  // Hospital Affiliation State
  const doctorId = user?.id || 'current_doctor';
  const affiliation = useHospitalStore((s) => s.getDoctorAffiliation(doctorId));
  const { verifyAndLinkDoctorCode, disconnectHospital, inviteCodes } = useHospitalStore();
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [hospitalCodeInput, setHospitalCodeInput] = useState('');

  // Preview matching code
  const matchingInvite = React.useMemo(() => {
    const clean = hospitalCodeInput.trim().replace(/\D/g, '');
    if (clean.length === 6) {
      return inviteCodes.find((c) => c.code === clean && !c.isUsed);
    }
    return null;
  }, [hospitalCodeInput, inviteCodes]);

  const handleConnectHospital = () => {
    const clean = hospitalCodeInput.trim().replace(/\D/g, '');
    if (clean.length !== 6) {
      showError('Invalid Code', 'Please enter a valid 6-digit hospital code.');
      return;
    }

    const res = verifyAndLinkDoctorCode(clean, doctorId);
    if (res.success) {
      setIsHospitalModalOpen(false);
      setHospitalCodeInput('');
      showSuccess('Connected to Hospital', res.message);
    } else {
      showError('Connection Failed', res.message);
    }
  };

  const handleDisconnectHospital = () => {
    Alert.alert(
      'Disconnect Hospital',
      `Are you sure you want to disconnect from ${affiliation?.hospitalName}? You will revert to independent practice status.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            disconnectHospital(doctorId);
            showSuccess('Disconnected', 'You are now set as an Independent Specialist.');
          },
        },
      ]
    );
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
      icon: 'business-outline',
      label: 'Hospital Staff Portal',
      badge: affiliation ? 'Affiliated' : undefined,
      onPress: () => navigation.navigate('HospitalPortal'),
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Platform Admin - Hospitals',
      onPress: () => navigation.navigate('PlatformAdminHospital'),
    },
    {
      icon: 'key-outline',
      label: 'Change Password',
      onPress: () => navigation.navigate('ChangePassword'),
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
              <Text style={styles.metaValue}>12+ Yrs</Text>
              <Text style={styles.metaLabel}>Experience</Text>
            </View>
            <Divider vertical spacing={4} />
            <View style={styles.metaCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.metaValue}>4.9</Text>
              </View>
              <Text style={styles.metaLabel}>Avg Rating</Text>
            </View>
            <Divider vertical spacing={4} />
            <View style={styles.metaCol}>
              <Text style={styles.metaValue}>1.2k</Text>
              <Text style={styles.metaLabel}>Patients Treated</Text>
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

            {/* Editable Tiered Consultation Fees Row */}
            <TouchableOpacity
              style={styles.infoRow}
              onPress={handleOpenFeeEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.infoLabel}>Consultation Fees</Text>
              <View style={styles.feeValueRow}>
                <View style={styles.tierFeeSummary}>
                  <Text style={styles.feeValue}>
                    Chat: ₦{tierFees.chat.toLocaleString()}
                  </Text>
                  <Text style={styles.feeValue}>
                    Audio: ₦{tierFees.audio.toLocaleString()}
                  </Text>
                  <Text style={styles.feeValue}>
                    Video: ₦{tierFees.video.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.editBadge}>
                  <Ionicons name="create-outline" size={13} color={Colors.primary[600]} />
                  <Text style={styles.editBadgeText}>Edit</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Editable Payout Bank Account Row */}
            <Divider spacing={3} />
            <TouchableOpacity
              style={styles.infoRow}
              onPress={handleOpenAccountEdit}
              activeOpacity={0.7}
            >
              <Text style={[styles.infoLabel, { flexShrink: 0 }]}>Payout Account</Text>
              <View style={styles.feeValueRow}>
                <Text style={styles.feeValue} numberOfLines={1} ellipsizeMode="tail">
                  {bankName ? `${bankName} Account` : 'Set Account'}
                </Text>
                <View style={styles.editBadge}>
                  <Ionicons name="card-outline" size={13} color={Colors.primary[600]} />
                  <Text style={styles.editBadgeText}>{bankName ? 'Edit' : 'Set'}</Text>
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

        {/* Hospital Affiliation Section */}
        <View style={styles.sectionContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2] }}>
            <Text style={styles.sectionTitle}>Hospital Affiliation</Text>
            {affiliation ? (
              <TouchableOpacity onPress={handleDisconnectHospital} activeOpacity={0.7}>
                <Text style={{ fontSize: FontSize.xs, color: Colors.error.main, fontWeight: FontWeight.medium }}>
                  Disconnect
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.infoCard}>
            {affiliation ? (
              <View style={{ gap: Spacing[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <HospitalBadge hospitalName={affiliation.hospitalName} size="md" isVerified />
                  <View style={styles.activeTag}>
                    <Ionicons name="checkmark-circle-outline" size={13} color="#0F6E6E" />
                    <Text style={styles.activeTagText}>Affiliated</Text>
                  </View>
                </View>

                <View style={{ marginTop: 4 }}>
                  <Text style={styles.hospitalMetaLabel}>Department</Text>
                  <Text style={styles.hospitalMetaValue}>{affiliation.department}</Text>
                </View>

                <View>
                  <Text style={styles.hospitalMetaLabel}>Hospital Address</Text>
                  <Text style={styles.hospitalMetaValue}>{affiliation.hospitalAddress}</Text>
                </View>

                <View style={styles.hospitalSyncNotice}>
                  <Ionicons name="information-circle-outline" size={16} color="#0F6E6E" />
                  <Text style={styles.hospitalSyncText}>
                    Hospital patient records and department queue are synced with your doctor workspace.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ gap: Spacing[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <HospitalBadge isIndependent size="md" />
                  <View style={styles.independentTag}>
                    <Ionicons name="shield-outline" size={13} color="#4338CA" />
                    <Text style={styles.independentTagText}>Verified Credentials</Text>
                  </View>
                </View>
                <Text style={styles.independentDesc}>
                  You are currently practicing independently. Connect with your hospital anytime using the 6-digit code issued by your hospital administration.
                </Text>
                <TouchableOpacity
                  style={styles.connectHospitalBtn}
                  onPress={() => {
                    setHospitalCodeInput('');
                    setIsHospitalModalOpen(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="business-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.connectHospitalBtnText}>Connect with 6-Digit Code</Text>
                </TouchableOpacity>
              </View>
            )}
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

      {/* Edit Tiered Consultation Fees Modal */}
      <AppModal
        visible={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        title="Set Tiered Consultation Fees"
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
              label="Save Tiered Fees"
              onPress={handleSaveTieredFee}
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
          {/* Current fees banner */}
          <View style={styles.feePreviewBanner}>
            <Ionicons name="layers-outline" size={24} color={Colors.primary[600]} />
            <View>
              <Text style={styles.feePreviewLabel}>Current Tiered Fees</Text>
              <View style={styles.currentTiersRow}>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillLabel}>Chat</Text>
                  <Text style={styles.tierPillValue}>₦{tierFees.chat.toLocaleString()}</Text>
                </View>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillLabel}>Audio</Text>
                  <Text style={styles.tierPillValue}>₦{tierFees.audio.toLocaleString()}</Text>
                </View>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillLabel}>Video</Text>
                  <Text style={styles.tierPillValue}>₦{tierFees.video.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.modalHint}>
            Set different fees per format. Minimum ₦{MIN_FEE.toLocaleString()} each.
            Chat must be less than Audio, which must be less than Video.
          </Text>

          {/* Chat Fee */}
          <Input
            label="Chat Consultation Fee (NGN ₦)"
            hint={`Minimum ₦${MIN_FEE.toLocaleString()} — lowest tier`}
            value={feeInputChat}
            onChangeText={setFeeInputChat}
            keyboardType="numeric"
            leftIcon="chatbubble-outline"
            autoFocus
          />

          {/* Audio Fee */}
          <Input
            label="Audio Call Fee (NGN ₦)"
            hint={`Suggested ₦${(MIN_FEE + 1500).toLocaleString()} or more`}
            value={feeInputAudio}
            onChangeText={setFeeInputAudio}
            keyboardType="numeric"
            leftIcon="call-outline"
          />

          {/* Video Fee */}
          <Input
            label="Video Call Fee (NGN ₦)"
            hint={`Suggested ₦${(MIN_FEE + 3000).toLocaleString()} or more`}
            value={feeInputVideo}
            onChangeText={setFeeInputVideo}
            keyboardType="numeric"
            leftIcon="videocam-outline"
          />

          {/* Platform Service Fee Breakdown — all 3 tiers, live calc */}
          <View style={styles.feeBreakdownCard}>
            <View style={styles.feeHeader}>
              <Ionicons name="sparkles" size={16} color="#059669" />
              <Text style={styles.feeHeaderTitle}>Platform Service Fee Breakdown (10%)</Text>
              <View style={styles.feeBadge}>
                <Text style={styles.feeBadgeText}>Live</Text>
              </View>
            </View>

            {([
              { label: 'Chat', icon: 'chatbubble', raw: feeInputChat, color: '#7C3AED' },
              { label: 'Audio Call', icon: 'call', raw: feeInputAudio, color: '#2563EB' },
              { label: 'Video Call', icon: 'videocam', raw: feeInputVideo, color: '#DC2626' },
            ] as const).map((tier) => {
              const gross = Math.max(0, parseFloat((tier.raw as string).replace(/,/g, '')) || 0);
              const platformFee = +(gross * 0.10).toFixed(2);
              const net = +(gross * 0.90).toFixed(2);
              return (
                <View key={tier.label} style={styles.tierBreakdownRow}>
                  <View style={styles.tierBreakdownHeader}>
                    <Ionicons name={tier.icon as any} size={13} color={tier.color} />
                    <Text style={[styles.tierBreakdownLabel, { color: tier.color }]}>{tier.label}</Text>
                  </View>
                  <View style={styles.tierBreakdownMath}>
                    <View style={styles.feeMathRow}>
                      <Text style={styles.feeMathLabel}>Patient Pays:</Text>
                      <Text style={styles.feeMathValue}>₦{gross.toLocaleString()}</Text>
                    </View>
                    <View style={styles.feeMathRow}>
                      <Text style={styles.feeMathLabel}>Platform Fee (10%):</Text>
                      <Text style={[styles.feeMathValue, { color: '#DC2626' }]}>
                        −₦{platformFee.toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.feeMathRow, styles.netRow]}>
                      <Text style={styles.feeTakeHomeLabel}>You Receive:</Text>
                      <Text style={styles.feeTakeHomeAmount}>₦{net.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.feeDivider} />

            {/* Combined total */}
            <View style={styles.feeTakeHomeBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.feeTakeHomeLabel}>Total Net (all 3 tiers):</Text>
                <Text style={styles.feeTakeHomeSub}>If one of each format is booked</Text>
              </View>
              <Text style={styles.feeTakeHomeAmount}>
                ₦{(
                  (Math.max(0, parseFloat(feeInputChat.replace(/,/g, ''))  || 0) * 0.90) +
                  (Math.max(0, parseFloat(feeInputAudio.replace(/,/g, '')) || 0) * 0.90) +
                  (Math.max(0, parseFloat(feeInputVideo.replace(/,/g, '')) || 0) * 0.90)
                ).toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      </AppModal>

      {/* Set Payout Account Details Modal (Task 2) */}
      <AppModal
        visible={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Set Payout Account Details"
        contentStyle={{ alignSelf: 'center' }}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setIsAccountModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Save Account"
              onPress={handleSaveAccount}
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
          <View style={styles.feePreviewBanner}>
            <Ionicons name="card-outline" size={24} color={Colors.primary[600]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.feePreviewLabel}>Payout Bank Account</Text>
              <Text style={styles.modalHintText}>
                Your consultation fee earnings will be automatically disbursed to this account.
              </Text>
            </View>
          </View>

          <Input
            label="Bank Name"
            hint="e.g. Wema Bank, GTBank, Access Bank"
            value={bankNameInput}
            onChangeText={setBankNameInput}
            leftIcon="business-outline"
          />

          <Input
            label="Account Number"
            hint="10-digit NUBAN account number"
            value={accountNumberInput}
            onChangeText={setAccountNumberInput}
            keyboardType="numeric"
            maxLength={10}
            leftIcon="card-outline"
          />

          <Input
            label="Account Name / Beneficiary"
            hint="e.g. Dr. Samuel Okon"
            value={accountNameInput}
            onChangeText={setAccountNameInput}
            leftIcon="person-outline"
          />
        </ScrollView>
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
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalBody}
        >
          <Text style={styles.modalHint}>
            Write a short professional bio that will be visible to patients on your profile. Describe your expertise, approach, and experience.
          </Text>
          <View style={styles.bioTextAreaWrapper}>
            <Input
              label="Professional Bio"
              hint="Describe your expertise, approach, and clinical experience"
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
        </ScrollView>
      </AppModal>

      {/* 6-Digit Hospital Connection Modal */}
      <AppModal
        visible={isHospitalModalOpen}
        onClose={() => setIsHospitalModalOpen(false)}
        title="Connect to Hospital"
        contentStyle={{ alignSelf: 'center' }}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setIsHospitalModalOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Confirm & Connect"
              disabled={hospitalCodeInput.trim().replace(/\D/g, '').length !== 6}
              onPress={handleConnectHospital}
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
          <View style={styles.hospitalModalHeader}>
            <Ionicons name="business-outline" size={28} color="#0F6E6E" />
            <Text style={styles.hospitalModalTitle}>Enter 6-Digit Hospital Code</Text>
            <Text style={styles.hospitalModalSub}>
              Ask your hospital administrator for your temporary 6-digit affiliation code.
            </Text>
          </View>

          <Input
            label="6-Digit Affiliation Code"
            hint="Enter the 6 numbers e.g. 492817"
            value={hospitalCodeInput}
            onChangeText={(text) => setHospitalCodeInput(text.replace(/\D/g, '').slice(0, 6))}
            keyboardType="numeric"
            maxLength={6}
            leftIcon="keypad-outline"
            style={styles.codeLargeInput}
            autoFocus
          />

          {matchingInvite ? (
            <View style={styles.invitePreviewCard}>
              <View style={styles.invitePreviewHeader}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#0F6E6E" />
                <Text style={styles.invitePreviewStatus}>Valid Hospital Code Found</Text>
              </View>
              <Text style={styles.inviteHospitalName}>{matchingInvite.hospitalName}</Text>
              <Text style={styles.inviteDeptText}>Department: {matchingInvite.department}</Text>
              <Text style={styles.inviteAdminText}>Issued by: {matchingInvite.generatedByAdminName}</Text>
            </View>
          ) : hospitalCodeInput.trim().replace(/\D/g, '').length === 6 ? (
            <View style={styles.inviteInvalidCard}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.error.main} />
              <Text style={styles.inviteInvalidText}>
                No active hospital invitation found for code {hospitalCodeInput}. Please verify with your admin.
              </Text>
            </View>
          ) : (
            <View style={styles.demoCodesCard}>
              <Text style={styles.demoCodesTitle}>Sample Hospital Codes for Testing:</Text>
              <TouchableOpacity
                onPress={() => setHospitalCodeInput('492817')}
                style={styles.demoCodeItem}
              >
                <Text style={styles.demoCodeNumber}>492817</Text>
                <Text style={styles.demoCodeLabel}>Evercare Hospital Lekki (Cardiology)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setHospitalCodeInput('715392')}
                style={styles.demoCodeItem}
              >
                <Text style={styles.demoCodeNumber}>715392</Text>
                <Text style={styles.demoCodeLabel}>LUTH (Cardiology)</Text>
              </TouchableOpacity>
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    width: '100%',
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
  feeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    justifyContent: 'flex-end',
  },
  feeValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary[100] ?? '#BFDBFE',
    flexShrink: 0,
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
  tierFeeSummary: {
    flexDirection: 'column',
    gap: 2,
    alignItems: 'flex-end',
  },
  modalBody: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  currentTiersRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  tierPill: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[100] ?? '#BFDBFE',
    alignItems: 'center',
  },
  tierPillLabel: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tierPillValue: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginTop: 1,
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

  // Service Fee Breakdown Styles
  feeBreakdownCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: Spacing[3],
    gap: 8,
    marginTop: Spacing[2],
  },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  feeHeaderTitle: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#065F46',
    flex: 1,
  },
  feeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  feeBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#047857',
  },
  tierBreakdownRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: Spacing[3],
    gap: 4,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  tierBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  tierBreakdownLabel: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tierBreakdownMath: {
    gap: 2,
  },
  netRow: {
    marginTop: 2,
  },
  feeMathRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeMathLabel: {
    fontSize: 12,
    color: '#334155',
  },
  feeMathValue: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  feeDivider: {
    height: 1,
    backgroundColor: '#A7F3D0',
    marginVertical: 4,
  },
  feeTakeHomeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: Spacing[3],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  feeTakeHomeLabel: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#065F46',
  },
  feeTakeHomeSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  feeTakeHomeAmount: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
    color: '#047857',
  },
  modalHintText: {
    fontSize: 11,
    color: Colors.text.secondary,
    lineHeight: 15,
    marginTop: 2,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  activeTagText: {
    fontSize: FontSize.xs,
    color: '#0F6E6E',
    fontWeight: FontWeight.medium,
  },
  independentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  independentTagText: {
    fontSize: FontSize.xs,
    color: '#4338CA',
    fontWeight: FontWeight.medium,
  },
  hospitalMetaLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
    marginBottom: 1,
  },
  hospitalMetaValue: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: FontWeight.semiBold,
  },
  hospitalSyncNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDFA',
    padding: Spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginTop: 4,
  },
  hospitalSyncText: {
    fontSize: 12,
    color: '#0F6E6E',
    flex: 1,
    lineHeight: 16,
  },
  independentDesc: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  connectHospitalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F6E6E',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  connectHospitalBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  hospitalModalHeader: {
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  hospitalModalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing[2],
  },
  hospitalModalSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing[3],
  },
  codeLargeInput: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    letterSpacing: 4,
  },
  invitePreviewCard: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 8,
    padding: Spacing[3],
    marginTop: Spacing[3],
    gap: 3,
  },
  invitePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  invitePreviewStatus: {
    fontSize: 12,
    color: '#0F6E6E',
    fontWeight: FontWeight.bold,
  },
  inviteHospitalName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  inviteDeptText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  inviteAdminText: {
    fontSize: 11,
    color: Colors.neutral[400],
  },
  inviteInvalidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: Spacing[3],
    marginTop: Spacing[3],
  },
  inviteInvalidText: {
    fontSize: 12,
    color: Colors.error.main,
    flex: 1,
  },
  demoCodesCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: Spacing[3],
    marginTop: Spacing[3],
    gap: Spacing[2],
  },
  demoCodesTitle: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  demoCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  demoCodeNumber: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: FontWeight.bold,
    color: '#0F6E6E',
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  demoCodeLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    flex: 1,
  },
});
