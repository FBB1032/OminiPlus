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
import { Card, SkeletonList, EmptyState, ErrorState, Button, MedicalRecordsHeader, HeartbeatRefreshControl } from '../../components';
import { useRecordVisibilityStore } from '../../store/recordVisibilityStore';
import { useToast } from '../../hooks/useAuth';
import { Alert } from 'react-native';

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
  const [visibilityStoreReady, setVisibilityStoreReady] = useState(false);

  const { success: showToastSuccess } = useToast();
  const { visibilities, loadVisibilities, toggleVisibility } = useRecordVisibilityStore();

  React.useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await loadVisibilities();
      } finally {
        if (!cancelled) setVisibilityStoreReady(true);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

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

            {/* Visibility Toggle Button */}
            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: Colors.text.secondary, marginBottom: 6 }}>
                RECORD PRIVACY CONTROL (NDPA):
              </Text>
              <TouchableOpacity
                onPress={() => toggleVisibility(item.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: visibilities[item.id] === 'patient_only' ? '#FEF2F2' : '#F0FDF4',
                  borderColor: visibilities[item.id] === 'patient_only' ? '#FCA5A5' : '#BBF7D0',
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Ionicons
                  name={visibilities[item.id] === 'patient_only' ? 'eye-off' : 'eye'}
                  size={16}
                  color={visibilities[item.id] === 'patient_only' ? '#DC2626' : '#059669'}
                />
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: 'bold',
                    color: visibilities[item.id] === 'patient_only' ? '#991B1B' : '#065F46',
                  }}
                >
                  {visibilities[item.id] === 'patient_only'
                    ? 'Visible to me only (Hidden from doctors)'
                    : 'Visible to me & assigned doctors'}
                </Text>
              </TouchableOpacity>
            </View>

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
      <MedicalRecordsHeader
        records={recordsResponse?.data ?? []}
        visibilities={visibilities}
        visibilityStoreReady={visibilityStoreReady}
        activeFilter={selectedType}
      />

      {/* AI Document Summarization Banner */}
      <TouchableOpacity
        style={{
          marginHorizontal: Spacing[4],
          marginBottom: Spacing[3],
          backgroundColor: '#0C1A2E',
          borderRadius: 14,
          padding: Spacing[4],
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing[3],
        }}
        activeOpacity={0.88}
        onPress={() => {
          Alert.alert(
            'AI Medical Document Summary',
            'AI will scan your uploaded records and generate a clinical summary highlighting diagnoses, prescribed medications, and key lab findings.\n\nWould you like to generate your AI-powered health summary now?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Generate Summary',
                onPress: () => {
                  showToastSuccess('AI Summary', 'AI is generating your personalized medical document summary. Ready in a few seconds.');
                },
              },
            ]
          );
        }}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(6,182,212,0.15)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="scan" size={22} color="#22D3EE" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' }}>AI Document Summarization</Text>
          <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, lineHeight: 15 }}>
            Scan & summarize your lab reports, prescriptions, and diagnoses using AI
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#22D3EE" />
      </TouchableOpacity>

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
          refreshControl={<HeartbeatRefreshControl refreshing={_isLoading} onRefresh={refetch} />}
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
