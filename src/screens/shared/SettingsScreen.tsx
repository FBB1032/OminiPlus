import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { storageService } from '../../services/storageService';
import { STORAGE_KEYS } from '../../constants/config';
import { Divider, Button, LoadingOverlay } from '../../components';
import { RoleLegalModal } from '../../components/legal/RoleLegalModal';

export default function SettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  const userRole: 'patient' | 'doctor' = user?.role === 'doctor' ? 'doctor' : 'patient';

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await authService.logout();
          } catch {
            // handle error
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handlePreviewOnboarding = () => {
    Alert.alert(
      'Preview Onboarding',
      'This will reset the onboarding flag and restart the app flow. You will be taken to the onboarding screen.',
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

  const settingsItems = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          iconColor: '#3B82F6',
          label: 'Push Notifications',
          value: pushNotifications,
          onValueChange: setPushNotifications,
          type: 'switch',
        },
        {
          icon: 'mail-outline',
          iconColor: '#10B981',
          label: 'Email Notifications',
          value: emailNotifications,
          onValueChange: setEmailNotifications,
          type: 'switch',
        },
        {
          icon: 'finger-print-outline',
          iconColor: '#F59E0B',
          label: 'Face ID / Fingerprint',
          value: biometrics,
          onValueChange: setBiometrics,
          type: 'switch',
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          icon: 'help-circle-outline',
          iconColor: '#8B5CF6',
          label: 'Help Center & Support Desk',
          type: 'link',
          onPress: () => navigation.navigate('HelpCenter'),
        },
        {
          icon: 'document-text-outline',
          iconColor: '#EF4444',
          label: userRole === 'doctor' ? 'Provider Terms & 10% Fee Policy' : 'Patient Telehealth Terms',
          type: 'link',
          onPress: () => setIsLegalModalOpen(true),
        },
        {
          icon: 'shield-checkmark-outline',
          iconColor: '#EC4899',
          label: 'Privacy Policy (EHR Protection)',
          type: 'link',
          onPress: () => navigation.navigate('PrivacyPolicy'),
        },
      ],
    },
  ];

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Support & Legal Section */}
        {settingsItems.map((group, groupIdx) => (
          <View key={groupIdx} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, itemIdx) => {
                const itemAny = item as any;
                return (
                  <View key={itemIdx}>
                    <View style={styles.itemRow}>
                      <View style={styles.itemLeft}>
                        <View style={[styles.iconBg, { backgroundColor: item.iconColor + '15' }]}>
                          <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                        </View>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                      </View>

                      {item.type === 'switch' ? (
                        <Switch
                          value={itemAny.value}
                          onValueChange={itemAny.onValueChange}
                          trackColor={{ false: Colors.border, true: Colors.primary[300] }}
                          thumbColor={itemAny.value ? Colors.primary[600] : Colors.neutral[300]}
                          ios_backgroundColor={Colors.border}
                        />
                      ) : (
                        <TouchableOpacity onPress={itemAny.onPress} style={styles.itemRightBtn}>
                          <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
                        </TouchableOpacity>
                      )}
                    </View>
                    {itemIdx < group.items.length - 1 && <Divider spacing={0} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Omini Pulse v1.0.0</Text>
          <Text style={styles.userEmail}>Logged in as: {user?.email} ({userRole})</Text>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error.main} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Role-Based Legal Terms & Policy Modal */}
      <RoleLegalModal
        visible={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        role={userRole}
      />

      <LoadingOverlay visible={loading} message="Signing out..." />
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
    gap: Spacing[5],
  },
  groupContainer: {
    gap: Spacing[2],
  },
  groupTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: FontSize.base,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
  },
  itemRightBtn: {
    padding: Spacing[1],
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: Spacing[6],
    gap: 4,
  },
  versionText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  userEmail: {
    fontSize: FontSize.xs,
    color: Colors.text.disabled,
  },
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
    marginTop: Spacing[4],
    marginBottom: Spacing[8],
    ...Shadows.xs,
  },
  signOutText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.error.main,
  },
  devSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 1,
  },
});
