import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { storageService } from '../../services/storageService';
import { STORAGE_KEYS } from '../../constants/config';
import { Divider, LoadingOverlay } from '../../components';
import { RoleLegalModal } from '../../components/legal/RoleLegalModal';

// ─── Language catalogue ───────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en',    label: 'English',              native: 'English',          tag: 'EN' },
  { code: 'yo',    label: 'Yoruba',               native: 'Yorùbá',           tag: 'YO' },
  { code: 'ha',    label: 'Hausa',                native: 'Hausa',            tag: 'HA' },
  { code: 'ig',    label: 'Igbo',                 native: 'Igbo',             tag: 'IG' },
  { code: 'pcm',   label: 'Nigerian Pidgin',      native: 'Naija',            tag: 'PCM' },
  { code: 'fr',    label: 'French',               native: 'Français',         tag: 'FR' },
  { code: 'ar',    label: 'Arabic',               native: 'العربية',          tag: 'AR' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const userRole: 'patient' | 'doctor' = user?.role === 'doctor' ? 'doctor' : 'patient';

  // ── Notification toggles ─────────────────────────────────────────────────
  const [pushNotifications,  setPushNotifications]  = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [biometrics,         setBiometrics]         = useState(false);

  // ── Appearance ───────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(false);

  // ── Language ─────────────────────────────────────────────────────────────
  const [selectedLang,   setSelectedLang]   = useState('en');
  const [langModalOpen,  setLangModalOpen]  = useState(false);

  // ── Legal / misc ─────────────────────────────────────────────────────────
  const [loading,         setLoading]         = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === selectedLang)!;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try { await authService.logout(); } catch { /* handled by authService */ }
          finally { setLoading(false); }
        },
      },
    ]);
  };

  const handlePreviewOnboarding = () => {
    Alert.alert(
      'Preview Onboarding',
      'This resets the onboarding flag and restarts the app flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset & Preview',
          onPress: async () => {
            await storageService.remove(STORAGE_KEYS.ONBOARDING_COMPLETE);
            await authService.logout();
          },
        },
      ]
    );
  };

  // ── Section renderer helpers ──────────────────────────────────────────────

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.groupTitle}>{title}</Text>
  );

  const RowSwitch = ({
    icon, iconColor, label, subtitle, value, onValueChange,
  }: {
    icon: string; iconColor: string; label: string; subtitle?: string;
    value: boolean; onValueChange: (v: boolean) => void;
  }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBg, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemLabel}>{label}</Text>
          {subtitle ? <Text style={styles.itemSub}>{subtitle}</Text> : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary[300] }}
        thumbColor={value ? Colors.primary[600] : Colors.neutral[300]}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );

  const RowLink = ({
    icon, iconColor, label, subtitle, value, onPress, danger,
  }: {
    icon: string; iconColor: string; label: string; subtitle?: string;
    value?: string; onPress: () => void; danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.itemRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBg, { backgroundColor: (danger ? '#EF4444' : iconColor) + '20' }]}>
          <Ionicons name={icon as any} size={20} color={danger ? '#EF4444' : iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemLabel, danger && { color: '#EF4444' }]}>{label}</Text>
          {subtitle ? <Text style={styles.itemSub}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color={Colors.neutral[400]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ════════ NOTIFICATIONS ════════ */}
        <View style={styles.groupContainer}>
          <SectionHeader title="Notifications" />
          <View style={styles.groupCard}>
            <RowSwitch
              icon="notifications-outline" iconColor="#3B82F6"
              label="Push Notifications"
              subtitle="In-app alerts for appointments and messages"
              value={pushNotifications} onValueChange={setPushNotifications}
            />
            <Divider spacing={0} />
            <RowSwitch
              icon="mail-outline" iconColor="#10B981"
              label="Email Notifications"
              subtitle="Booking confirmations and reminders"
              value={emailNotifications} onValueChange={setEmailNotifications}
            />
            <Divider spacing={0} />
            <RowSwitch
              icon="finger-print-outline" iconColor="#F59E0B"
              label="Face ID / Fingerprint"
              subtitle="Use biometrics to unlock the app"
              value={biometrics} onValueChange={setBiometrics}
            />
          </View>
        </View>

        {/* ════════ APPEARANCE ════════ */}
        <View style={styles.groupContainer}>
          <SectionHeader title="Appearance" />
          <View style={styles.groupCard}>
            <RowSwitch
              icon={darkMode ? 'moon' : 'sunny-outline'}
              iconColor={darkMode ? '#6366F1' : '#F59E0B'}
              label="Dark Mode"
              subtitle={darkMode ? 'Dark theme active' : 'Light theme active'}
              value={darkMode}
              onValueChange={(v) => {
                setDarkMode(v);
                // Wire into your ThemeContext here when ready
              }}
            />
          </View>
        </View>

        {/* ════════ LANGUAGE ════════ */}
        <View style={styles.groupContainer}>
          <SectionHeader title="Language" />
          <View style={styles.groupCard}>
            <RowLink
              icon="language-outline" iconColor="#0F6E6E"
              label="App Language"
              subtitle="Choose the language for the interface"
              value={`[${currentLang.tag}]  ${currentLang.label}`}
              onPress={() => setLangModalOpen(true)}
            />
          </View>
        </View>

        {/* ════════ SECURITY ════════ */}
        <View style={styles.groupContainer}>
          <SectionHeader title="Security" />
          <View style={styles.groupCard}>
            <RowLink
              icon="lock-closed-outline" iconColor="#7C3AED"
              label="Change Password"
              subtitle="Update your account password"
              onPress={() => navigation.navigate('ChangePassword')}
            />
          </View>
        </View>

        {/* ════════ SUPPORT & LEGAL ════════ */}
        <View style={styles.groupContainer}>
          <SectionHeader title="Support & Legal" />
          <View style={styles.groupCard}>
            <RowLink
              icon="help-circle-outline" iconColor="#8B5CF6"
              label="Help Center & Support"
              onPress={() => navigation.navigate('HelpCenter')}
            />
            <Divider spacing={0} />
            <RowLink
              icon="document-text-outline" iconColor="#EF4444"
              label={userRole === 'doctor' ? 'Provider Terms & 10% Fee Policy' : 'Patient Telehealth Terms'}
              onPress={() => setIsLegalModalOpen(true)}
            />
            <Divider spacing={0} />
            <RowLink
              icon="shield-checkmark-outline" iconColor="#EC4899"
              label="Privacy Policy (EHR Protection)"
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
          </View>
        </View>

        {/* ── Version info ── */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>OminiPulse v1.0.0</Text>
          <Text style={styles.userEmail}>Signed in as {user?.email}</Text>
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error.main} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ════════ LANGUAGE PICKER MODAL ════════ */}
      <Modal
        visible={langModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLangModalOpen(false)}
        statusBarTranslucent
      >
        <View style={styles.langOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setLangModalOpen(false)}
          />
          <View style={styles.langSheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            <Text style={styles.langSheetTitle}>Select Language</Text>
            <Text style={styles.langSheetSub}>
              Choose the language used throughout the app interface.
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.langList}
            >
              {LANGUAGES.map((lang, idx) => {
                const active = selectedLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langRow, active && styles.langRowActive]}
                    onPress={() => {
                      setSelectedLang(lang.code);
                      setLangModalOpen(false);
                      // Wire into i18n / locale context here when ready
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={{ width: 36, height: 26, borderRadius: 6, backgroundColor: active ? Colors.primary[100] : '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: active ? Colors.primary[700] : '#475569' }}>{lang.tag}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.langLabel, active && styles.langLabelActive]}>
                        {lang.label}
                      </Text>
                      {lang.native !== lang.label && (
                        <Text style={styles.langNative}>{lang.native}</Text>
                      )}
                    </View>
                    {active && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.primary[600]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.langCloseBtn}
              onPress={() => setLangModalOpen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.langCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <RoleLegalModal
        visible={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        role={userRole}
      />

      <LoadingOverlay visible={loading} message="Signing out…" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

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
  backBtn:     { padding: Spacing[1] },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  placeholder: { width: 24 },

  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[5],
    paddingBottom: Spacing[12],
  },

  // ── Groups ────────────────────────────────────────────────────────────────
  groupContainer: { gap: Spacing[2] },
  groupTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: Spacing[1],
  },
  groupCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.xs,
  },

  // ── Row base ──────────────────────────────────────────────────────────────
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    minHeight: 60,
    gap: Spacing[2],
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  itemSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexShrink: 0,
  },
  rowValue: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },

  // ── Version / sign-out ────────────────────────────────────────────────────
  versionContainer: { alignItems: 'center', gap: 4, marginTop: Spacing[4] },
  versionText: { fontSize: FontSize.xs, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  userEmail:   { fontSize: FontSize.xs, color: Colors.text.disabled },

  signOutBtn: {
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
    marginBottom: Spacing[6],
    ...Shadows.xs,
  },
  signOutText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.error.main },

  // ── Language modal ────────────────────────────────────────────────────────
  langOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  langSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '75%',
    ...Shadows.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing[3],
    marginBottom: Spacing[2],
  },
  langSheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: Spacing[5],
    marginTop: Spacing[1],
  },
  langSheetSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing[5],
    marginTop: 4,
    marginBottom: Spacing[3],
  },
  langList: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
    paddingBottom: Spacing[3],
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langRowActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[600],
  },
  langFlag: { fontSize: 24 },
  langLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  langLabelActive: { color: Colors.primary[700] ?? Colors.primary[600] },
  langNative: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  langCloseBtn: {
    marginHorizontal: Spacing[5],
    marginTop: Spacing[3],
    backgroundColor: Colors.primary[600],
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  langCloseBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
