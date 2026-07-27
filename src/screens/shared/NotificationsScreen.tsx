import React from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
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
import { useNotifications } from '../../hooks/usePatient';
import { EmptyState, ErrorState, Divider, SkeletonNotificationList } from '../../components';

type NotificationType = 'appointment_reminder' | 'prescription_ready' | 'result_ready' | 'general';

interface TypeConfig {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const typeConfigs: Record<NotificationType, TypeConfig> = {
  appointment_reminder: {
    icon: 'calendar-outline',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  prescription_ready: {
    icon: 'medkit-outline',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  result_ready: {
    icon: 'document-text-outline',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  general: {
    icon: 'notifications-outline',
    color: '#6B7280',
    bgColor: '#F9FAFB',
  },
};

export default function NotificationsScreen({ navigation }: any) {
  const { data: notifications, isLoading: _isLoading, isError, refetch } = useNotifications();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);

  const renderItem = ({ item }: { item: any }) => {
    const config = typeConfigs[item.type as NotificationType] || typeConfigs.general;
    
    return (
      <View style={[styles.notificationCard, !item.isRead && styles.unreadCard]}>
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
            {/* Display simple time or formatted date */}
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {showSkeleton ? (
        <SkeletonNotificationList />
      ) : isError ? (
        <ErrorState onRetry={refetch} message="Could not load notifications." />
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="All caught up!"
          subtitle="You don't have any notifications right now."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={_isLoading}
          onRefresh={refetch}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: Spacing[4],
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing[4],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
    ...Shadows.xs,
  },
  unreadCard: {
    borderColor: Colors.primary[200],
    backgroundColor: Colors.primary[50] + '40', // light tint
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
    flex: 1,
  },
  unreadText: {
    color: Colors.text.primary,
    fontWeight: FontWeight.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.text.disabled,
    marginTop: 4,
  },
  separator: {
    height: Spacing[3],
  },
});
