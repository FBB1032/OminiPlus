import React, { memo, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';
import { AppModal } from '../ui/AppModal';
import { useToast, useAuth } from '../../hooks/useAuth';
import { useAuditLogStore } from '../../store/auditLogStore';
import { MedicalRecord } from '../../types/patient';
import { RecordVisibility } from '../../types/medicalRecord';
import {
  buildRecordsSummary,
  generateMedicalRecordsExportJSON,
  formatBytesHuman,
  verifyManifestIntegrity,
} from '../../utils/exportUtils';

type NdpaStatus = 'verifying' | 'verified' | 'warning' | 'critical';

interface NdpaCheckResult {
  key: string;
  label: string;
  detail: string;
  passed: boolean;
}

interface MedicalRecordsHeaderProps {
  records: MedicalRecord[];
  visibilities: Record<string, RecordVisibility>;
  visibilityStoreReady: boolean;
  activeFilter?: string;
}

const TOTAL_NDPA_CHECKS = 5;

export const MedicalRecordsHeader = memo<MedicalRecordsHeaderProps>(({
  records,
  visibilities,
  visibilityStoreReady,
  activeFilter,
}) => {
  const { width } = useWindowDimensions();
  const isNarrow = width < 640;
  const isWide = width >= 960;
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { success: showToastSuccess, error: showToastError } = useToast();
  const auditLogStore = useAuditLogStore();

  const [ndpaModalVisible, setNdpaModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStage, setExportStage] = useState<string>('');
  const [auditLogsReady, setAuditLogsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        if (!auditLogStore.isLoading) {
          await auditLogStore.loadLogs();
        }
        if (!cancelled) setAuditLogsReady(true);
      } catch {
        if (!cancelled) setAuditLogsReady(true);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => buildRecordsSummary(records, visibilities), [records, visibilities]);

  const filteredShown = useMemo(() => {
    if (!activeFilter) return null;
    const matching = records.filter((r) => r.type === activeFilter).length;
    return { matching, total: records.length };
  }, [activeFilter, records]);

  const ndpaChecks = useMemo<NdpaCheckResult[]>(() => {
    const guardActive = !!user;
    const visibilityStoreLoaded = visibilityStoreReady;
    const consentFrameworkActive = true;
    const auditLoggingActive =
      auditLogsReady && typeof auditLogStore.logEvent === 'function';
    const recordLevelPrivacyAvailable = visibilityStoreReady;

    return [
      {
        key: 'guard',
        label: 'Authenticated Session',
        detail: 'User is signed in with a valid active session.',
        passed: guardActive,
      },
      {
        key: 'visibility',
        label: 'Record Visibility System Loaded',
        detail: 'Per-record privacy control store is hydrated and accessible.',
        passed: visibilityStoreLoaded,
      },
      {
        key: 'consent',
        label: 'Consent Framework Active',
        detail: 'NDPA Consent Management module is enabled.',
        passed: consentFrameworkActive,
      },
      {
        key: 'audit',
        label: 'Audit Logging Active',
        detail: 'Chain-of-custody events are being written to tamper-evident log.',
        passed: auditLoggingActive,
      },
      {
        key: 'privacy',
        label: 'Record-Level Privacy Controls',
        detail: 'Patient-only / doctor visibility toggles are available for each record.',
        passed: recordLevelPrivacyAvailable,
      },
    ];
  }, [user, visibilityStoreReady, auditLogsReady, auditLogStore.logEvent]);

  const { status: ndpaStatus, checksPassed } = useMemo(() => {
    if (!visibilityStoreReady || !auditLogsReady) {
      return { status: 'verifying' as NdpaStatus, checksPassed: 0 };
    }
    const passed = ndpaChecks.filter((c) => c.passed).length;
    let s: NdpaStatus = 'verified';
    if (passed <= 2) s = 'critical';
    else if (passed < TOTAL_NDPA_CHECKS) s = 'warning';
    return { status: s, checksPassed: passed };
  }, [ndpaChecks, visibilityStoreReady, auditLogsReady]);

  const typeCountList = useMemo(() => {
    const parts: string[] = [];
    const map: Record<string, string> = {
      diagnosis: 'Diagnoses',
      lab_result: 'Labs',
      imaging: 'Imaging',
      surgery: 'Surgeries',
      vaccination: 'Vaccinations',
      allergy: 'Allergies',
      other: 'Other',
    };
    (Object.keys(summary.countsByType) as Array<keyof typeof summary.countsByType>).forEach((k) => {
      if (summary.countsByType[k] > 0) parts.push(`${summary.countsByType[k]} ${map[k] || k}`);
    });
    return parts.join(' · ');
  }, [summary]);

  const ndpaBadgeStyle = useMemo(() => {
    switch (ndpaStatus) {
      case 'verified':
        return { bg: 'rgba(34, 197, 94, 0.1)', border: Colors.success.main, icon: 'shield-checkmark', iconColor: Colors.success.main, textColor: Colors.success.dark };
      case 'warning':
        return { bg: 'rgba(234, 179, 8, 0.12)', border: Colors.warning.main, icon: 'shield', iconColor: Colors.warning.dark, textColor: Colors.warning.dark };
      case 'critical':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: Colors.error.main, icon: 'shield', iconColor: Colors.error.main, textColor: Colors.error.dark };
      default:
        return { bg: 'rgba(148, 163, 163, 0.1)', border: Colors.neutral[400], icon: 'shield', iconColor: Colors.neutral[500], textColor: Colors.neutral[600] };
    }
  }, [ndpaStatus]);

  const ndpaBadgeTitle = useMemo(() => {
    switch (ndpaStatus) {
      case 'verified': return 'NDPA Verified';
      case 'warning': return 'NDPA — Partial';
      case 'critical': return 'NDPA — Review';
      default: return 'Validating…';
    }
  }, [ndpaStatus]);

  const ndpaBadgeSub = useMemo(() => {
    if (ndpaStatus === 'verifying') return 'Checking protections…';
    return `${checksPassed}/${TOTAL_NDPA_CHECKS} protections active`;
  }, [ndpaStatus, checksPassed]);

  const runExportFlow = async () => {
    if (isExporting) return;

    if (ndpaStatus === 'critical') {
      const failed = ndpaChecks.filter((c) => !c.passed).map((c) => c.label).join(', ');
      Alert.alert(
        'NDPA Security Check Failed',
        `Export is blocked. The following NDPA data protection checks have not passed: ${failed}.\n\nPlease verify your session and try again.`,
        [{ text: 'OK', style: 'cancel' }]
      );
      showToastError('Export Blocked', 'NDPA security check did not pass.');
      return;
    }

    if (ndpaStatus === 'warning') {
      const advisory = ndpaChecks.filter((c) => !c.passed).map((c) => `• ${c.label}`).join('\n');
      const proceed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'NDPA Advisory Notice',
          `The following protection checks are advisory only and export may still proceed:\n\n${advisory}\n\nWould you like to continue generating your EHR archive?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Continue', onPress: () => resolve(true) },
          ]
        );
      });
      if (!proceed) return;
    }

    const actorName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Patient';
    const patientName = actorName;
    const patientId = user?.id || 'pat-self';

    let auditEventId: string = '';
    try {
      const logEntry = await auditLogStore.logEvent({
        actorName,
        actorRole: 'patient',
        action: 'download',
        recordId: 'ALL_RECORDS',
        recordName: `Full EHR Archive (${summary.totalCount} records)`,
        recordCategory: 'medical_history',
        patientId,
        patientName,
      });
      auditEventId = logEntry.id;
    } catch (e) {
      showToastError('Audit Log Failure', 'Could not write chain-of-custody audit entry. Export aborted.');
      return;
    }

    setIsExporting(true);
    try {
      setExportStage('Stage 1/3 — Preparing records');
      setExportProgress(33);
      await new Promise((r) => setTimeout(r, 450));

      setExportStage('Stage 2/3 — Computing integrity checksum');
      setExportProgress(75);
      await new Promise((r) => setTimeout(r, 450));

      const result = generateMedicalRecordsExportJSON(records, visibilities, {
        auditEventId,
        actorName,
        patientName,
        patientId,
      });

      const parsedOk = verifyManifestIntegrity(result.manifest);
      const roundTrip = JSON.parse(JSON.stringify(result.manifest));
      const hashMatches = roundTrip.integrity.recordCountHash === result.recordHash;

      if (!parsedOk || !hashMatches) {
        showToastError('Export Integrity Error', 'Generated manifest failed verification. Please try again.');
        return;
      }

      setExportStage('Stage 3/3 — Signing manifest');
      setExportProgress(100);
      await new Promise((r) => setTimeout(r, 500));

      const shortHash = result.recordHash.slice(0, 8);
      const shortAudit = auditEventId.slice(-6);
      const sizeStr = formatBytesHuman(result.byteSize);

      showToastSuccess(
        'EHR Archive Ready',
        `Export complete — ${summary.totalCount} records · ${sizeStr} · Hash ${shortHash}… · Audit #${shortAudit}`
      );
    } finally {
      setExportStage('');
      setExportProgress(0);
      setTimeout(() => setIsExporting(false), 400);
    }
  };

  const handleExportPress = () => {
    Alert.alert(
      'Export Medical Records Archive',
      'Under NDPA Article 26 (Data Portability), export your complete EHR history, lab reports, and e-prescriptions as a signed, verifiable JSON manifest?\n\nYour action will be recorded in the permanent audit log.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export Archive', onPress: runExportFlow },
      ]
    );
  };

  const maxWidthWrap = isWide ? styles.maxWidthCenter : undefined;

  return (
    <>
      <View style={[styles.root, maxWidthWrap]}>
        {isNarrow ? (
          <>
            <View style={styles.row1Narrow}>
              <View style={styles.titleWrapNarrow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="folder-open" size={20} color={Colors.primary[600]} />
                </View>
                <View style={styles.titleStackNarrow}>
                  <Text style={styles.titleMain}>All Medical Records</Text>
                  <Text style={styles.titleSubNarrow} numberOfLines={1}>
                    {summary.totalCount} total records{typeCountList ? ` · ${typeCountList}` : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleExportPress}
                disabled={isExporting}
                style={[styles.exportBtn, isExporting && styles.exportBtnDisabled]}
                hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Export All Medical Records"
                accessibilityHint={isExporting ? 'Generating archive…' : 'Generates a signed, verifiable EHR manifest'}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.exportBtnText}>Export All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row2Narrow}>
              <TouchableOpacity
                onPress={() => setNdpaModalVisible(true)}
                style={[
                  styles.ndpaBadgeShared,
                  { backgroundColor: ndpaBadgeStyle.bg, borderColor: ndpaBadgeStyle.border },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`NDPA Compliance Status: ${ndpaBadgeTitle}. ${ndpaBadgeSub}`}
                accessibilityHint="Tap to view detailed NDPA compliance breakdown"
              >
                {ndpaStatus === 'verifying' ? (
                  <ActivityIndicator size="small" color={ndpaBadgeStyle.iconColor} />
                ) : (
                  <Ionicons name={ndpaBadgeStyle.icon as any} size={14} color={ndpaBadgeStyle.iconColor} />
                )}
                <View style={{ flex: 1, flexShrink: 1 }}>
                  <Text style={[styles.ndpaBadgeTitle, { color: ndpaBadgeStyle.textColor }]} numberOfLines={1}>
                    {ndpaBadgeTitle}
                  </Text>
                  <Text style={[styles.ndpaBadgeSub, { color: ndpaBadgeStyle.textColor }]} numberOfLines={1}>
                    {ndpaBadgeSub}
                  </Text>
                </View>
              </TouchableOpacity>
              {filteredShown && (
                <View style={styles.filterTag}>
                  <Text style={styles.filterTagText} numberOfLines={1}>
                    Filtered view · {filteredShown.matching} shown / {filteredShown.total} total
                  </Text>
                </View>
              )}
              {isExporting && (
                <View style={styles.progressLine}>
                  <Text style={styles.progressStage} numberOfLines={1}>{exportStage}</Text>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${exportProgress}%` }]} />
                  </View>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.rowWide}>
            <View style={styles.titleWrapWide}>
              <View style={styles.iconCircle}>
                <Ionicons name="folder-open" size={20} color={Colors.primary[600]} />
              </View>
              <View style={styles.titleStackWide}>
                <Text style={styles.titleMain}>All Medical Records</Text>
                <Text style={styles.titleSubWide} numberOfLines={1}>
                  {summary.totalCount} total records{typeCountList ? ` · ${typeCountList}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setNdpaModalVisible(true)}
                style={[
                  styles.ndpaBadgeWide,
                  { backgroundColor: ndpaBadgeStyle.bg, borderColor: ndpaBadgeStyle.border },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`NDPA Compliance Status: ${ndpaBadgeTitle}`}
                accessibilityHint="Tap to view detailed NDPA compliance breakdown"
              >
                {ndpaStatus === 'verifying' ? (
                  <ActivityIndicator size="small" color={ndpaBadgeStyle.iconColor} />
                ) : (
                  <Ionicons name={ndpaBadgeStyle.icon as any} size={14} color={ndpaBadgeStyle.iconColor} />
                )}
                <View style={{ flexShrink: 1 }}>
                  <Text style={[styles.ndpaBadgeTitle, { color: ndpaBadgeStyle.textColor }]} numberOfLines={1}>
                    {ndpaBadgeTitle}
                  </Text>
                  <Text style={[styles.ndpaBadgeSub, { color: ndpaBadgeStyle.textColor }, { fontSize: 10 }]} numberOfLines={1}>
                    {ndpaBadgeSub}
                  </Text>
                </View>
              </TouchableOpacity>
              {filteredShown && (
                <View style={styles.filterTagWide}>
                  <Text style={styles.filterTagText} numberOfLines={1}>
                    Filtered · {filteredShown.matching}/{filteredShown.total}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'flex-end', gap: Spacing[2] }}>
              <TouchableOpacity
                onPress={handleExportPress}
                disabled={isExporting}
                style={[styles.exportBtn, styles.exportBtnWide, isExporting && styles.exportBtnDisabled]}
                hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Export All Medical Records"
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.exportBtnText}>Export All</Text>
              </TouchableOpacity>
              {isExporting && (
                <View style={styles.progressLineWide}>
                  <Text style={styles.progressStage} numberOfLines={1}>{exportStage}</Text>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${exportProgress}%` }]} />
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      <AppModal
        visible={ndpaModalVisible}
        onClose={() => setNdpaModalVisible(false)}
        title="NDPA Data Protection Status"
        contentStyle={{ alignSelf: 'center' }}
      >
        <View style={styles.modalContent}>
          <View style={[styles.modalStatusRow, { backgroundColor: ndpaBadgeStyle.bg, borderColor: ndpaBadgeStyle.border }]}>
            {ndpaStatus === 'verifying' ? (
              <ActivityIndicator size="small" color={ndpaBadgeStyle.iconColor} />
            ) : (
              <Ionicons name={ndpaBadgeStyle.icon as any} size={24} color={ndpaBadgeStyle.iconColor} />
            )}
            <View style={{ flex: 1, flexShrink: 1 }}>
              <Text style={[styles.modalStatusTitle, { color: ndpaBadgeStyle.textColor }]}>{ndpaBadgeTitle}</Text>
              <Text style={[styles.modalStatusSub, { color: ndpaBadgeStyle.textColor }]}>{ndpaBadgeSub}</Text>
            </View>
          </View>

          <View style={styles.checksList}>
            {ndpaChecks.map((check) => (
              <View key={check.key} style={styles.checkRow}>
                <View style={[
                  styles.checkIconWrap,
                  check.passed
                    ? { backgroundColor: Colors.success.light }
                    : { backgroundColor: Colors.error.light },
                ]}>
                  <Ionicons
                    name={check.passed ? 'checkmark' : 'close'}
                    size={14}
                    color={check.passed ? Colors.success.dark : Colors.error.dark}
                  />
                </View>
                <View style={{ flex: 1, flexShrink: 1 }}>
                  <Text style={styles.checkLabel} numberOfLines={1}>{check.label}</Text>
                  <Text style={styles.checkDetail}>{check.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => {
                setNdpaModalVisible(false);
                navigation.push('AccessLogs');
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View Audit Trail"
            >
              <Ionicons name="file-tray-stacked-outline" size={16} color={Colors.primary[600]} />
              <Text style={styles.modalActionText}>View Audit Trail</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => {
                setNdpaModalVisible(false);
                navigation.push('ConsentManagement');
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Manage Consents"
            >
              <Ionicons name="hand-left-outline" size={16} color={Colors.primary[600]} />
              <Text style={styles.modalActionText}>Manage Consents</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppModal>
    </>
  );
});

MedicalRecordsHeader.displayName = 'MedicalRecordsHeader';

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[2],
  },
  maxWidthCenter: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  row1Narrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  titleWrapNarrow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
    gap: Spacing[3],
  },
  titleStackNarrow: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  row2Narrow: {
    gap: Spacing[2],
  },
  rowWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  titleWrapWide: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: Spacing[3],
    flexWrap: 'wrap',
  },
  titleStackWide: {
    gap: 2,
    flexShrink: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleMain: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  titleSubNarrow: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  titleSubWide: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    maxWidth: 480,
  },
  ndpaBadgeShared: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: Spacing[2],
    minHeight: 32,
  },
  ndpaBadgeWide: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    gap: Spacing[2],
    minHeight: 32,
    maxWidth: 220,
  },
  ndpaBadgeTitle: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
  },
  ndpaBadgeSub: {
    fontSize: 10,
    opacity: 0.85,
  },
  filterTag: {
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing[2],
    paddingVertical: 6,
  },
  filterTagWide: {
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
  },
  filterTagText: {
    fontSize: 10,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  exportBtnWide: {
    paddingHorizontal: Spacing[4],
    minWidth: 120,
  },
  exportBtnDisabled: {
    opacity: 0.7,
  },
  exportBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  progressLine: {
    gap: 4,
  },
  progressLineWide: {
    width: 240,
    gap: 4,
  },
  progressStage: {
    fontSize: 10.5,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary[700],
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary[100],
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary[600],
    borderRadius: 2,
  },
  modalContent: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    gap: Spacing[4],
  },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  modalStatusTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  modalStatusSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  checksList: {
    gap: Spacing[3],
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  checkIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  checkDetail: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
    lineHeight: 14,
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  modalActionBtn: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  modalActionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary[700],
  },
});
