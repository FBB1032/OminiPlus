import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card } from '../../components';
import { useAuditLogStore } from '../../store/auditLogStore';
import { AuditLogEntry, AuditAction } from '../../types/auditLog';

const ACTION_FILTERS: { label: string; value: AuditAction | 'all' }[] = [
  { label: 'All Actions', value: 'all' },
  { label: 'Views', value: 'view' },
  { label: 'Downloads', value: 'download' },
  { label: 'Edits', value: 'edit' },
  { label: 'Deletions', value: 'delete' },
];

export default function AccessLogsScreen({ navigation }: any) {
  const { logs, loadLogs } = useAuditLogStore();
  const [selectedFilter, setSelectedFilter] = useState<AuditAction | 'all'>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (selectedFilter === 'all') return true;
    return log.action === selectedFilter;
  });

  const getActionBadgeColor = (action: AuditAction) => {
    switch (action) {
      case 'view':
        return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', label: 'Viewed' };
      case 'download':
        return { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857', label: 'Downloaded' };
      case 'edit':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'Edited' };
      case 'delete':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', label: 'Deleted' };
      case 'share':
        return { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9', label: 'Shared' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Who Viewed My Records</Text>
        <TouchableOpacity onPress={loadLogs} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color={Colors.secondary[600]} />
        </TouchableOpacity>
      </View>

      {/* Security Transparency Guarantee Banner */}
      <View style={styles.securityBanner}>
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={20} color="#065F46" />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.securityTitle}>Unalterable Security Audit Trail</Text>
          <Text style={styles.securityText}>
            Administrators and doctors cannot view, download, or edit your medical records without generating a permanent audit log entry.
          </Text>
        </View>
      </View>

      {/* Action Filters */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {ACTION_FILTERS.map((f) => {
            const isSelected = selectedFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setSelectedFilter(f.value)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Audit Log Timeline */}
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: AuditLogEntry }) => {
          const actionStyle = getActionBadgeColor(item.action);
          const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <Card style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={styles.actorRow}>
                  <View style={[styles.actorAvatar, { backgroundColor: item.actorRole === 'admin' ? '#FEF2F2' : '#EFF6FF' }]}>
                    <Ionicons
                      name={
                        item.actorRole === 'doctor'
                          ? 'medical'
                          : item.actorRole === 'admin'
                          ? 'shield-checkmark'
                          : item.actorRole === 'system_ai'
                          ? 'hardware-chip'
                          : 'person'
                      }
                      size={18}
                      color={item.actorRole === 'admin' ? '#DC2626' : Colors.primary[600]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actorName}>{item.actorName}</Text>
                    <Text style={styles.actorTitle}>{item.actorTitle || item.actorRole}</Text>
                  </View>
                </View>

                {/* Action Badge */}
                <View style={[styles.actionBadge, { backgroundColor: actionStyle.bg, borderColor: actionStyle.border }]}>
                  <Text style={[styles.actionBadgeText, { color: actionStyle.text }]}>{actionStyle.label}</Text>
                </View>
              </View>

              {/* Record Details */}
              <View style={styles.recordBox}>
                <Ionicons name="document-attach-outline" size={18} color={Colors.text.secondary} />
                <Text style={styles.recordName} numberOfLines={1}>
                  {item.recordName}
                </Text>
              </View>

              {/* Timestamp & Metadata */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
                  <Text style={styles.metaText}>{formattedDate}</Text>
                </View>
                {item.device && (
                  <View style={styles.metaItem}>
                    <Ionicons name="desktop-outline" size={14} color={Colors.text.secondary} />
                    <Text style={styles.metaText}>{item.device}</Text>
                  </View>
                )}
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color={Colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No Audit Records Found</Text>
            <Text style={styles.emptySubtitle}>No matching access events for the selected filter.</Text>
          </View>
        }
      />
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
    padding: Spacing[1],
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  refreshBtn: {
    padding: Spacing[1],
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing[3],
    marginHorizontal: Spacing[4],
    marginTop: Spacing[3],
    gap: Spacing[3],
  },
  lockBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#065F46',
    textTransform: 'uppercase',
  },
  securityText: {
    fontSize: FontSize.xs,
    color: '#047857',
    lineHeight: 16,
  },
  filterWrapper: {
    paddingVertical: Spacing[3],
  },
  filterContainer: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
  },
  filterChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  filterText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
  listContent: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
    gap: Spacing[3],
  },
  logCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  actorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actorName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  actorTitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  actionBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
  },
  recordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing[3],
    borderRadius: 8,
    gap: Spacing[2],
  },
  recordName: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[1],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
    gap: Spacing[2],
  },
  emptyTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
});
