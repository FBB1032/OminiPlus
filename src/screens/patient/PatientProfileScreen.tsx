import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Avatar, Card, Divider } from '../../components';

export default function PatientProfileScreen({ navigation }: any) {
  const { user } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => authService.logout() },
    ]);
  };

  const actionItems = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      onPress: () => navigation.navigate('ProfileEdit'),
    },
    {
      icon: 'document-text-outline',
      label: 'Prescription History',
      onPress: () => navigation.navigate('PrescriptionHistory'),
    },
    {
      icon: 'alarm-outline',
      label: 'Medication Reminders',
      onPress: () => navigation.navigate('MedicationReminders'),
    },
    {
      icon: 'fitness-outline',
      label: 'Chronic Disease Tracker',
      onPress: () => navigation.navigate('ChronicDisease'),
    },
    {
      icon: 'lock-closed-outline',
      label: 'Consent Management',
      onPress: () => navigation.navigate('ConsentManagement'),
    },
    {
      icon: 'watch-outline',
      label: 'Wearables & Health Devices',
      onPress: () => navigation.navigate('WearableSync'),
    },
    {
      icon: 'hardware-chip-outline',
      label: 'Device Compatibility List',
      onPress: () => navigation.navigate('DeviceCompatibility'),
    },
    {
      icon: 'eye-outline',
      label: 'Who Viewed My Records',
      onPress: () => navigation.navigate('AccessLogs'),
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
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
        {/* Patient card */}
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
            <Text style={styles.patientName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.patientEmail}>{user?.email}</Text>
          </TouchableOpacity>
        </Card>

        {/* Health Information Card */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>
                {user?.age ? `${user.age} y/o` : 'Not Set'}
              </Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>
                {user?.height ? `${user.height} cm` : 'Not Set'}
              </Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>
                {user?.weight ? `${user.weight} kg` : 'Not Set'}
              </Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>BMI</Text>
              {(() => {
                if (!user?.height || !user?.weight) {
                  return <Text style={styles.infoValue}>Not Set</Text>;
                }
                const bmiVal = parseFloat((user.weight / Math.pow(user.height / 100, 2)).toFixed(1));
                let category = 'Normal';
                let color = '#10B981';
                if (bmiVal < 18.5) {
                  category = 'Underweight';
                  color = '#3B82F6';
                } else if (bmiVal >= 25 && bmiVal < 30) {
                  category = 'Overweight';
                  color = '#F59E0B';
                } else if (bmiVal >= 30) {
                  category = 'Obese';
                  color = '#EF4444';
                }
                return (
                  <Text style={[styles.infoValue, { color, fontWeight: 'bold' }]}>
                    {bmiVal} ({category})
                  </Text>
                );
              })()}
            </View>
            <Divider spacing={3} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Blood Group</Text>
              <Text style={styles.infoValue}>{user?.bloodGroup || 'Not Set'}</Text>
            </View>
            <Divider spacing={3} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Genotype</Text>
              <Text style={styles.infoValue}>{user?.genotype || 'Not Set'}</Text>
            </View>
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
                    <Ionicons name={item.icon as any} size={20} color={Colors.secondary[600]} />
                    <Text style={styles.actionLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.neutral[400]} />
                </TouchableOpacity>
                {index < actionItems.length - 1 && <Divider spacing={0} />}
              </View>
            ))}
          </View>
        </View>

        {/* Help card */}
        <Card style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <Ionicons name="call" size={20} color={Colors.secondary[600]} />
            <Text style={styles.helpTitle}>Emergency Contact Support</Text>
          </View>
          <Text style={styles.helpText}>
            If you need immediate medical attention or have a medical emergency, please call 911 or your local emergency number immediately.
          </Text>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error.main} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  patientName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing[3],
  },
  patientEmail: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  sectionContainer: {
    gap: Spacing[2],
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
  helpCard: {
    padding: Spacing[4],
    gap: Spacing[2],
    borderColor: Colors.border,
    borderWidth: 1,
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
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
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
});
