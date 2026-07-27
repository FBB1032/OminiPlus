import React, { useState } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useMedicalRecords } from '../../hooks/usePatient';
import { Card, SkeletonList, EmptyState, ErrorState } from '../../components';

const FILTER_TYPES = [
  { label: 'All', value: undefined },
  { label: 'Diagnoses', value: 'diagnosis' },
  { label: 'Labs', value: 'lab_result' },
  { label: 'Imaging', value: 'imaging' },
  { label: 'Other', value: 'other' },
];

export default function MedicalRecordsScreen() {
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: recordsResponse, isLoading: _isLoading, isError, refetch } = useMedicalRecords();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);

  const handleDownloadAttachment = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  // Filter items locally based on type
  const filteredRecords = React.useMemo(() => {
    if (!recordsResponse || !recordsResponse.data) return [];
    
    return recordsResponse.data.filter((record) => {
      return selectedType ? record.type === selectedType : true;
    });
  }, [recordsResponse, selectedType]);

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return { name: 'pulse-outline', color: '#EF4444', bgColor: '#FEF2F2' };
      case 'lab_result':
        return { name: 'beaker-outline', color: '#3B82F6', bgColor: '#EFF6FF' };
      case 'imaging':
        return { name: 'scan-outline', color: '#8B5CF6', bgColor: '#F5F3FF' };
      case 'surgery':
        return { name: 'bandage-outline', color: '#EC4899', bgColor: '#FDF2F8' };
      case 'vaccination':
        return { name: 'shield-outline', color: '#10B981', bgColor: '#ECFDF5' };
      default:
        return { name: 'document-text-outline', color: '#6B7280', bgColor: '#F9FAFB' };
    }
  };

  const renderRecordItem = ({ item }: { item: any }) => {
    const isExpanded = expandedId === item.id;
    const dateStr = new Date(item.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const iconConfig = getRecordIcon(item.type);

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          style={styles.cardHeader}
        >
          <View style={[styles.iconBg, { backgroundColor: iconConfig.bgColor }]}>
            <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.recordTitle}>{item.title}</Text>
            <Text style={styles.recordMeta}>
              {dateStr} {item.doctorName ? `• Dr. ${item.doctorName}` : ''}
            </Text>
          </View>

          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.neutral[400]}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.cardBody}>
            <Text style={styles.descriptionLabel}>Notes / Description:</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>

            {item.attachmentUrl ? (
              <TouchableOpacity
                onPress={() => handleDownloadAttachment(item.attachmentUrl)}
                style={styles.attachmentBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="document-attach-outline" size={18} color={Colors.secondary[600]} />
                <Text style={styles.attachmentText}>View Attachment Document</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <View style={styles.hipaaBadge}>
          <Ionicons name="shield-checkmark" size={12} color="#10B981" />
          <Text style={styles.hipaaText}>HIPAA Secured</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          data={FILTER_TYPES}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const isActive = selectedType === item.value;
            return (
              <TouchableOpacity
                onPress={() => setSelectedType(item.value)}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {showSkeleton ? (
        <View style={styles.listContainer}>
          <SkeletonList count={5} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} message="Could not load records." />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon="folder-open-outline"
          title="No records found"
          subtitle={
            selectedType
              ? `You don't have any records matching this category.`
              : 'Your medical reports folder is empty.'
          }
        />
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderRecordItem}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  filterWrapper: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing[2],
  },
  filterContent: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
  },
  filterTab: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  filterLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  filterLabelActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
  listContainer: {
    padding: Spacing[4],
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing[3],
    ...Shadows.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hipaaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  hipaaText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing[3],
    gap: 2,
  },
  recordTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  recordMeta: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  cardBody: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing[3],
    marginTop: Spacing[3],
    gap: Spacing[2],
  },
  descriptionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  descriptionText: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  attachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[2],
    paddingVertical: Spacing[2],
  },
  attachmentText: {
    fontSize: FontSize.xs,
    color: Colors.secondary[600],
    fontWeight: FontWeight.bold,
  },
  separator: {
    height: Spacing[3],
  },
});
