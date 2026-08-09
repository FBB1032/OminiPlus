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

// ─── Types ────────────────────────────────────────────────────────────────────

type RowItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  onPress: () => void;
  danger?: boolean;
};

type Section = {
  header: string;
  headerIcon?: keyof typeof Ionicons.glyphMap;
  items?: RowItem[];
  embedded?: 'medical_history' | 'contact_details';
};

// ─── Screen ───────────────────────────────────────────────────────────────────

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

  // ─── Sections ───────────────────────────────────────────────────────────

  const sections: Section[] = [
    {
      header: 'Account',
      headerIcon: 'person-circle-outline',
      items: [
        {
          icon: 'create-outline',
          label: 'Edit Profile',
          subtitle: 'Update your name, photo, and details',
          onPress: () => navigation.navigate('ProfileEdit'),
        },
        {
          icon: 'document-text-outline',
          label: 'Prescription History',
          subtitle: 'View all prescriptions issued to you',
          onPress: () => navigation.navigate('PrescriptionHistory'),
        },
        {
          icon: 'lock-closed-outline',
          label: 'Consent Management',
          subtitle: 'Control who can access your records',
          onPress: () => navigation.navigate('ConsentManagement'),
        },
      ],
    },
    {
      header: 'Contact Details',
      headerIcon: 'call-outline',
      embedded: 'contact_details',
    },
    {
      header: 'Medical Profile',
      headerIcon: 'medkit-outline',
      embedded: 'medical_history',
    },
    {
      header: 'Health & Records',
      headerIcon: 'heart-outline',
      items: [
        {
          icon: 'fitness-outline',
          label: 'Chronic Disease Tracker',
          subtitle: 'Hypertension, Diabetes, Asthma & more',
          onPress: () => navigation.navigate('ChronicDisease'),
        },
        {
          icon: 'alarm-outline',
          label: 'Medication Reminders',
          subtitle: 'Set alerts for your medications',
          onPress: () => navigation.navigate('MedicationReminders'),
        },
        {
          icon: 'eye-outline',
          label: 'Who Viewed My Records',
          subtitle: 'Audit log of record access',
          onPress: () => navigation.navigate('AccessLogs'),
        },
      ],
    },
    {
      header: 'Privacy & Data',
      headerIcon: 'shield-checkmark-outline',
      items: [
        {
          icon: 'download-outline',
          label: 'Download My Data (PDF)',
          subtitle: 'Export your full health records — NDPA compliant',
          onPress: () =>
            Alert.alert(
              'Download My Data',
              'A PDF copy of your health records, appointments, and prescriptions will be sent to your registered email within 24 hours (NDPA compliant).',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Request Export',
                  onPress: () =>
                    Alert.alert('Export Requested', 'Your data export has been queued. Check your email within 24 hours.'),
                },
              ]
            ),
        },
      ],
    },
    {
      header: 'Security',
      headerIcon: 'lock-closed-outline',
      items: [
        {
          icon: 'key-outline',
          label: 'Change Password',
          subtitle: 'Update your account password',
          onPress: () => navigation.navigate('ChangePassword'),
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          subtitle: 'Manage alerts and reminders',
          onPress: () => navigation.navigate('Notifications'),
        },
        {
          icon: 'settings-outline',
          label: 'App Settings',
          subtitle: 'Language, theme, biometrics',
          onPress: () => navigation.navigate('Settings'),
        },
      ],
    },
  ];

  // ─── Medical history embedded card ──────────────────────────────────────

  const renderMedicalCard = () => {
    const bmiInfo = (() => {
      if (!user?.height || !user?.weight) return null;
      const val = parseFloat((user.weight / Math.pow(user.height / 100, 2)).toFixed(1));
      let label = 'Normal'; let color = '#10B981';
      if (val < 18.5)               { label = 'Underweight'; color = '#3B82F6'; }
      else if (val >= 25 && val < 30){ label = 'Overweight';  color = '#F59E0B'; }
      else if (val >= 30)            { label = 'Obese';        color = '#EF4444'; }
      return { val, label, color };
    })();

    const rows = [
      { label: 'Age',         value: user?.age        ? `${user.age} yrs`    : '—' },
      { label: 'Height',      value: user?.height     ? `${user.height} cm`  : '—' },
      { label: 'Weight',      value: user?.weight     ? `${user.weight} kg`  : '—' },
      {
        label: 'BMI',
        value: bmiInfo
          ? <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: bmiInfo.color }}>{bmiInfo.val} <Text style={{ fontWeight: FontWeight.medium, fontSize: 11, color: bmiInfo.color }}>({bmiInfo.label})</Text></Text>
          : '—',
      },
      { label: 'Blood Group', value: user?.bloodGroup || '—' },
      { label: 'Genotype',    value: user?.genotype   || '—' },
    ];

    return (
      <View style={styles.infoCard}>
        {rows.map((row, idx) => (
          <View key={row.label}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              {typeof row.value === 'string'
                ? <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
                : <View style={{ alignItems: 'flex-end' }}>{row.value}</View>
              }
            </View>
            {idx < rows.length - 1 && <Divider spacing={3} />}
          </View>
        ))}
        <TouchableOpacity
          style={styles.infoEditBtn}
          onPress={() => navigation.navigate('ProfileEdit')}
          activeOpacity={0.75}
        >
          <Ionicons name="create-outline" size={13} color={Colors.secondary[600]} />
          <Text style={styles.infoEditBtnText}>Update Medical Info</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Contact details embedded card ──────────────────────────────────────

  const renderContactCard = () => (
    <View style={styles.infoCard}>
      <View style={styles.infoRow}>
        <View style={styles.infoLabelRow}>
          <Ionicons name="mail-outline" size={15} color={Colors.text.secondary} />
          <Text style={styles.infoLabelIcon}>Email</Text>
        </View>
        <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
          {user?.email || '—'}
        </Text>
      </View>
      <Divider spacing={3} />
      <View style={styles.infoRow}>
        <View style={styles.infoLabelRow}>
          <Ionicons name="call-outline" size={15} color={Colors.text.secondary} />
          <Text style={styles.infoLabelIcon}>Phone</Text>
        </View>
        <Text style={styles.infoValue} numberOfLines={1}>
          {user?.phone || 'Not set'}
        </Text>
      </View>
    </View>
  );

  // ─── Single action row ───────────────────────────────────────────────────

  const renderRow = (item: RowItem, isLast: boolean) => (
    <View key={item.label}>
      <TouchableOpacity
        style={styles.actionRow}
        activeOpacity={0.7}
        onPress={item.onPress}
        hitSlop={{ top: 4, bottom: 4 }}
        accessibilityRole="button"
        accessibilityLabel={item.label}
      >
        <View style={[styles.actionIconWrap, item.danger && { backgroundColor: '#FEF2F2' }]}>
          <Ionicons
            name={item.icon}
            size={20}
            color={item.danger ? '#EF4444' : Colors.secondary[600]}
          />
        </View>
        <View style={styles.actionTextCol}>
          <Text style={[styles.actionLabel, item.danger && { color: '#EF4444' }]} numberOfLines={1}>
            {item.label}
          </Text>
          {item.subtitle && (
            <Text style={styles.actionSub} numberOfLines={1}>{item.subtitle}</Text>
          )}
        </View>
        {item.badge && (
          <View style={[styles.actionBadge, { backgroundColor: item.badgeColor ?? Colors.primary[600] }]}>
            <Text style={styles.actionBadgeText}>{item.badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={Colors.neutral[400]} style={{ flexShrink: 0 }} />
      </TouchableOpacity>
      {!isLast && <Divider spacing={0} />}
    </View>
  );

  // ─── Render ──────────────────────────────────────────────────────────────

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
        <View style={isTablet ? styles.tabletWrap : undefined}>

          {/* ── Hero card ── */}
          <View style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={{ position: 'relative' }}>
                <Avatar
                  name={`${user?.firstName} ${user?.lastName}`}
                  uri={user?.avatarUrl}
                  size="lg"
                  gender={user?.gender}
                />
                {/* edit badge */}
                <TouchableOpacity
                  style={styles.avatarEditBadge}
                  onPress={() => navigation.navigate('ProfileEdit')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={11} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.heroText}>
                <Text style={styles.heroName} numberOfLines={1}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.heroEmail} numberOfLines={1} ellipsizeMode="middle">
                  {user?.email}
                </Text>
                {!!user?.phone && (
                  <View style={styles.heroPhoneRow}>
                    <Ionicons name="call-outline" size={12} color={Colors.text.secondary} />
                    <Text style={styles.heroPhone} numberOfLines={1}>{user.phone}</Text>
                  </View>
                )}

                {/* Health summary pills */}
                <View style={styles.heroPills}>
                  {user?.bloodGroup && (
                    <View style={styles.heroPill}>
                      <Ionicons name="water" size={10} color="#EF4444" />
                      <Text style={styles.heroPillText}>{user.bloodGroup}</Text>
                    </View>
                  )}
                  {user?.genotype && (
                    <View style={styles.heroPill}>
                      <Ionicons name="git-network-outline" size={10} color="#7C3AED" />
                      <Text style={styles.heroPillText}>{user.genotype}</Text>
                    </View>
                  )}
                  {user?.age && (
                    <View style={styles.heroPill}>
                      <Ionicons name="person-outline" size={10} color="#0F6E6E" />
                      <Text style={styles.heroPillText}>{user.age} yrs</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* ── Sections ── */}
          {sections.map((section) => (
            <View key={section.header} style={styles.sectionContainer}>
              <View style={styles.sectionTitleRow}>
                {section.headerIcon && (
                  <Ionicons name={section.headerIcon} size={13} color={Colors.text.secondary} />
                )}
                <Text style={styles.sectionTitle}>{section.header.toUpperCase()}</Text>
              </View>

              {section.embedded === 'medical_history' && renderMedicalCard()}
              {section.embedded === 'contact_details' && renderContactCard()}

              {section.items && (
                <View style={styles.actionsCard}>
                  {section.items.map((item, idx) =>
                    renderRow(item, idx === section.items!.length - 1)
                  )}
                </View>
              )}
            </View>
          ))}

          {/* ── Emergency card ── */}
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <View style={styles.emergencyIconWrap}>
                <Ionicons name="call" size={18} color="#EF4444" />
              </View>
              <Text style={styles.emergencyTitle}>Emergency Contact</Text>
            </View>
            <Text style={styles.emergencyText}>
              For immediate medical emergencies, call <Text style={{ fontWeight: FontWeight.bold }}>112</Text> or your local emergency number. OminiPulse is not a substitute for emergency services.
            </Text>
          </View>

          {/* ── Log out ── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Log Out"
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error.main} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topHeader: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  topHeaderTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },

  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[6],
    paddingBottom: Spacing[12],
  },
  tabletWrap: { width: '100%', maxWidth: 720, alignSelf: 'center' },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    ...Shadows.sm,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: Colors.secondary[600],
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  heroText: { flex: 1, flexShrink: 1, gap: 3 },
  heroName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  heroEmail: { fontSize: FontSize.sm, color: Colors.text.secondary, flexShrink: 1 },
  heroPhoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroPhone: { fontSize: FontSize.xs, color: Colors.text.secondary },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing[1] },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroPillText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.text.primary },

  // ── Sections ──────────────────────────────────────────────────────────────
  sectionContainer: { gap: Spacing[3] },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingLeft: Spacing[1],
    marginTop: Spacing[3],
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    letterSpacing: 0.6,
  },

  // ── Action rows ───────────────────────────────────────────────────────────
  actionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionTextCol: { flex: 1, flexShrink: 1, gap: 1 },
  actionLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  actionSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    flexShrink: 1,
  },
  actionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    flexShrink: 0,
  },
  actionBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: '#FFFFFF' },

  // ── Info cards (embedded) ─────────────────────────────────────────────────
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    ...Shadows.xs,
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
    flexShrink: 0,
  },
  infoLabelIcon: { fontSize: FontSize.sm, color: Colors.text.secondary },
  infoLabel:     { fontSize: FontSize.sm, color: Colors.text.secondary, flexShrink: 0 },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
  infoEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    backgroundColor: Colors.secondary[50] ?? '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.secondary[100] ?? '#BFDBFE',
  },
  infoEditBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.secondary[600],
  },

  // ── Emergency card ────────────────────────────────────────────────────────
  emergencyCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: Spacing[4],
    gap: Spacing[2],
  },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  emergencyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#92400E' },
  emergencyText:  { fontSize: FontSize.xs, color: '#B45309', lineHeight: 18 },

  // ── Log out ───────────────────────────────────────────────────────────────
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
    ...Shadows.xs,
  },
  logoutText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.error.main },
});
