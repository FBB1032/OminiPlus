import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Avatar, Card, Divider } from '../../components';

type SectionItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

type Section = {
  header: string;
  items?: SectionItem[];
  embedded?: 'medical_history' | 'contact_details';
};

export default function PatientProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => authService.logout() },
    ]);
  };

  const openAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const sections: Section[] = [
    {
      header: 'Account',
      items: [
        { icon: 'person-outline',        label: 'Manage Profile',        onPress: () => navigation.navigate('ProfileEdit') },
        { icon: 'newspaper-outline',     label: 'Personal Information',  onPress: () => navigation.navigate('ProfileEdit') },
        { icon: 'document-text-outline', label: 'Prescription History',  onPress: () => navigation.navigate('PrescriptionHistory') },
        { icon: 'lock-closed-outline',   label: 'Consent Management',    onPress: () => navigation.navigate('ConsentManagement') },
      ],
    },
    {
      header: 'Contact Details',
      embedded: 'contact_details',
    },
    {
      header: 'Medical History',
      embedded: 'medical_history',
    },
    {
      header: 'Health & Records',
      items: [
        { icon: 'fitness-outline',       label: 'Chronic Disease Tracker',       onPress: () => navigation.navigate('ChronicDisease') },
        { icon: 'alarm-outline',         label: 'Medication Reminders',          onPress: () => navigation.navigate('MedicationReminders') },
        { icon: 'eye-outline',           label: 'Who Viewed My Records',         onPress: () => navigation.navigate('AccessLogs') },
        { icon: 'watch-outline',         label: 'Wearables & Health Devices',    onPress: () => navigation.navigate('WearableSync') },
        { icon: 'hardware-chip-outline', label: 'Device Compatibility List',     onPress: () => navigation.navigate('DeviceCompatibility') },
      ],
    },
    {
      header: 'Preferences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications',          onPress: () => navigation.navigate('Notifications') },
        { icon: 'language-outline',      label: 'Language Settings',      onPress: () => openAlert('Coming Soon', 'Language settings will be available in a future update.') },
        { icon: 'sunny-outline',         label: 'Theme (Light / Dark)',   onPress: () => openAlert('Coming Soon', 'Theme preferences will be available in a future update.') },
        { icon: 'settings-outline',      label: 'App Settings',           onPress: () => navigation.navigate('Settings') },
      ],
    },
    {
      header: 'Security',
      items: [
        { icon: 'lock-closed',           label: 'Change Password',        onPress: () => openAlert('Change Password', 'To change your password, please use the "Forgot Password" flow on the login screen.') },
      ],
    },
  ];

  // ─── Medical History Info Card ───────────────────────────────────────────
  const renderMedicalHistoryCard = () => {
    const bmiInfo = (() => {
      if (!user?.height || !user?.weight) return null;
      const bmiVal = parseFloat((user.weight / Math.pow(user.height / 100, 2)).toFixed(1));
      let category = 'Normal';
      let color = '#10B981';
      if (bmiVal < 18.5) { category = 'Underweight'; color = '#3B82F6'; }
      else if (bmiVal >= 25 && bmiVal < 30) { category = 'Overweight'; color = '#F59E0B'; }
      else if (bmiVal >= 30) { category = 'Obese'; color = '#EF4444'; }
      return { bmiVal, category, color };
    })();

    const rows: { label: string; value: React.ReactNode }[] = [
      { label: 'Age',           value: user?.age ? `${user.age} y/o` : 'Not Set' },
      { label: 'Height',        value: user?.height ? `${user.height} cm` : 'Not Set' },
      { label: 'Weight',        value: user?.weight ? `${user.weight} kg` : 'Not Set' },
      {
        label: 'BMI',
        value: bmiInfo
          ? (<Text style={[styles.bmiValue, { color: bmiInfo.color }]}>{bmiInfo.bmiVal} ({bmiInfo.category})</Text>)
          : 'Not Set',
      },
      { label: 'Blood Group',   value: user?.bloodGroup || 'Not Set' },
      { label: 'Genotype',      value: user?.genotype || 'Not Set' },
    ];

    return (
      <View style={styles.infoCard}>
        {rows.map((row, idx) => (
          <View key={row.label}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={[styles.infoValue, idx === 3 ? undefined : undefined]} numberOfLines={1}>
                {typeof row.value === 'string' ? row.value : row.value}
              </Text>
            </View>
            {idx < rows.length - 1 && <Divider spacing={3} />}
          </View>
        ))}
      </View>
    );
  };

  // ─── Contact Details Embedded Block ──────────────────────────────────────
  const renderContactDetailsCard = () => (
    <View style={styles.infoCard}>
      <View style={styles.infoRow}>
        <View style={styles.infoLabelRow}>
          <Ionicons name="mail-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.infoLabelIcon}>Email</Text>
        </View>
        <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
          {user?.email || 'Not Set'}
        </Text>
      </View>
      <Divider spacing={3} />
      <View style={styles.infoRow}>
        <View style={styles.infoLabelRow}>
          <Ionicons name="call-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.infoLabelIcon}>Phone</Text>
        </View>
        <Text style={styles.infoValue} numberOfLines={1}>
          {user?.phone || 'Not set in profile'}
        </Text>
      </View>
    </View>
  );

  // ─── Render Row (single list item) ───────────────────────────────────────
  const renderSectionItem = (item: SectionItem) => (
    <TouchableOpacity
      style={styles.actionRow}
      activeOpacity={0.7}
      onPress={item.onPress}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <View style={styles.actionLeft}>
        <View style={styles.actionIconWrap}>
          <Ionicons name={item.icon} size={20} color={Colors.secondary[600]} />
        </View>
        <Text style={styles.actionLabel} numberOfLines={1}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.neutral[400]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[isTablet && styles.tabletMaxWrap]}>

          {/* ────── Hero: Avatar + Name/Email/Phone ────────────────────────── */}
          <Card style={[styles.profileCard, styles.cardClip]}>
            <View style={styles.heroRow}>
              <Avatar
                name={`${user?.firstName} ${user?.lastName}`}
                uri={user?.avatarUrl}
                size="lg"
                gender={user?.gender}
              />
              <View style={styles.heroText}>
                <Text style={styles.patientName} numberOfLines={1}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.patientEmail} numberOfLines={1} ellipsizeMode="middle">
                  {user?.email}
                </Text>
                {!!user?.phone && (
                  <View style={styles.phoneRow}>
                    <Ionicons name="call-outline" size={12} color={Colors.text.secondary} />
                    <Text style={styles.patientPhone} numberOfLines={1}>
                      {user.phone}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>

          {/* ────── Sections Loop ───────────────────────────────────────────── */}
          {sections.map((section, sIdx) => (
            <View key={`${section.header}-${sIdx}`} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{section.header.toUpperCase()}</Text>
              {section.embedded === 'medical_history' && renderMedicalHistoryCard()}
              {section.embedded === 'contact_details' && renderContactDetailsCard()}
              {section.items && (
                <View style={[styles.actionsCard, styles.cardClip]}>
                  {section.items.map((item, idx) => (
                    <View key={item.label}>
                      {renderSectionItem(item)}
                      {idx < section.items!.length - 1 && <Divider spacing={0} />}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* ────── Emergency Help Card ─────────────────────────────────────── */}
          <Card style={[styles.helpCard, styles.cardClip]}>
            <View style={styles.helpHeader}>
              <Ionicons name="call" size={20} color={Colors.secondary[600]} />
              <Text style={styles.helpTitle}>Emergency Contact Support</Text>
            </View>
            <Text style={styles.helpText}>
              If you need immediate medical attention or have a medical emergency, please call 112 or your local emergency number immediately.
            </Text>
          </Card>

          {/* ────── Logout ──────────────────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Log Out"
            hitSlop={{ top: 4, bottom: 4 }}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error.main} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  topHeaderTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[5],
    paddingBottom: Spacing[10],
  },
  tabletMaxWrap: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  cardClip: {
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
  },
  profileCard: {
    paddingVertical: Spacing[5],
    paddingHorizontal: Spacing[4],
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  heroText: {
    flex: 1,
    flexShrink: 1,
    gap: 4,
  },
  patientName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  patientEmail: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    flexShrink: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: 2,
  },
  patientPhone: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    flexShrink: 1,
  },
  sectionContainer: {
    gap: Spacing[2],
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    letterSpacing: 0.5,
    paddingLeft: Spacing[1],
  },
  actionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
    flexShrink: 1,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  helpCard: {
    padding: Spacing[4],
    gap: Spacing[2],
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  helpTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  helpText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
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
    minHeight: 52,
    marginTop: Spacing[2],
    marginBottom: Spacing[2],
    ...Shadows.xs,
  },
  logoutText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.error.main,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    overflow: 'hidden',
    ...Shadows.xs,
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    gap: Spacing[3],
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flex: 0.7,
  },
  infoLabelIcon: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    flexShrink: 1,
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
  bmiValue: {
    fontSize: FontSize.sm,
    fontWeight: 'bold',
  },
});
