import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { EmptyState, SkeletonNotificationList } from '../../components';

type NotificationType =
  | 'appointment_reminder'
  | 'prescription_ready'
  | 'payout_credited'
  | 'verification_status'
  | 'general';

interface TypeConfig {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const typeConfigs: Record<NotificationType, TypeConfig> = {
  appointment_reminder: {
    icon: 'calendar-outline',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  prescription_ready: {
    icon: 'medkit-outline',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  payout_credited: {
    icon: 'cash-outline',
    color: '#16A34A',
    bgColor: '#F0FDF4',
  },
  verification_status: {
    icon: 'shield-checkmark-outline',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
  general: {
    icon: 'notifications-outline',
    color: '#6B7280',
    bgColor: '#F9FAFB',
  },
};

const MOCK_PATIENT_NOTIFICATIONS = [
  {
    id: 'p-notif-1',
    type: 'appointment_reminder',
    title: 'Upcoming Video Consultation',
    body: 'Your appointment with Dr. Sarah Jenkins starts in 15 minutes. Prepare your health history notes.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
  },
  {
    id: 'p-notif-2',
    type: 'prescription_ready',
    title: 'New E-Prescription Issued',
    body: 'Dr. Sarah Jenkins issued a digitally signed E-Prescription. Tap to view and find nearby pharmacies.',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isRead: false,
  },
  {
    id: 'p-notif-3',
    type: 'general',
    title: 'GPS Pharmacy Radar Active',
    body: '3 certified open partner pharmacies detected near your current location.',
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    isRead: true,
  },
];

const MOCK_DOCTOR_NOTIFICATIONS = [
  {
    id: 'd-notif-1',
    type: 'appointment_reminder',
    title: 'New Appointment Booking',
    body: 'Patient Chidi Okafor booked a 30-minute Cardiology Video Consultation for today at 3:00 PM.',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    isRead: false,
  },
  {
    id: 'd-notif-2',
    type: 'payout_credited',
    title: 'Net Payout Disbursed (₦13,500)',
    body: 'Your 90% net earnings (₦13,500) for completed consultation #AP-8842 have been credited to your payout bank account.',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isRead: false,
  },
  {
    id: 'd-notif-3',
    type: 'verification_status',
    title: 'MDCN Practitioner Credential Verified',
    body: 'Your Medical license credentials (MDCN #LIC-98754) have been verified by Compliance Officers.',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    isRead: true,
  },
];

export default function NotificationsScreen({ navigation }: any) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const initial = useMemo(() => {
    return isDoctor ? MOCK_DOCTOR_NOTIFICATIONS : MOCK_PATIENT_NOTIFICATIONS;
  }, [isDoctor]);

  const [notifications, setNotifications] = useState(initial);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const config = typeConfigs[item.type as NotificationType] || typeConfigs.general;

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => markAsRead(item.id)}
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, !item.isRead && styles.unreadText]}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>
            {isDoctor ? 'Doctor Notifications' : 'Patient Notifications'}
          </Text>
          <Text style={styles.headerSub}>
            {isDoctor ? 'Appointments, Payouts & MDCN Verification' : 'Consultations, E-Prescriptions & Vitals Alerts'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            style={styles.readAllBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.readAllText}>Read All</Text>
          </TouchableOpacity>
        )}
      </View>

      {!notifications || notifications.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="All caught up!"
          subtitle={`No ${isDoctor ? 'Doctor' : 'Patient'} notifications right now.`}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
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
  headerSub: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  readAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  readAllText: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary[700],
  },
  listContainer: {
    padding: Spacing[4],
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing[4],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    ...Shadows.xs,
  },
  unreadCard: {
    borderColor: Colors.primary[300],
    backgroundColor: '#FAFAFA',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    flex: 1,
  },
  unreadText: {
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
    marginLeft: 6,
  },
  body: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 17,
  },
  time: {
    fontSize: 10.5,
    color: Colors.text.disabled,
    marginTop: 2,
  },
  separator: {
    height: 10,
  },
});
