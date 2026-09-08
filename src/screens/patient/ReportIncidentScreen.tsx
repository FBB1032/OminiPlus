import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../../theme';
import { useToast } from '../../hooks/useAuth';
import { useIncidentStore } from '../../store/incidentStore';
import { useAuditLogStore } from '../../store/auditLogStore';

const INCIDENT_CATEGORIES = [
  { id: 'malpractice', label: 'Medical Malpractice & Negligence', icon: 'alert-circle' },
  { id: 'conduct', label: 'Inappropriate / Unprofessional Conduct', icon: 'warning' },
  { id: 'credentials', label: 'Fraudulent Credentials / License Issue', icon: 'ribbon' },
  { id: 'prescription', label: 'Prescription Error / Wrong Dosage', icon: 'document-text' },
  { id: 'billing', label: 'Billing or Financial Misconduct', icon: 'card' },
];

const SEVERITY_LEVELS = [
  { id: 'critical', label: 'Critical Emergency (High Risk)', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'high', label: 'High Violation', color: '#EA580C', bg: '#FFEDD5' },
  { id: 'medium', label: 'Medium Severity', color: '#D97706', bg: '#FEF3C7' },
  { id: 'low', label: 'Minor Concern', color: '#475569', bg: '#F1F5F9' },
];

export default function ReportIncidentScreen({ navigation, route }: any) {
  const { success: toastSuccess, error: toastError } = useToast();
  const { reports, addReport, loadReports } = useIncidentStore();

  const [activeTab, setActiveTab] = useState<'file' | 'history'>('file');

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const initialDoctorName = route?.params?.doctorName || 'Dr. Babajide Alabi';
  const [accusedDoctor, setAccusedDoctor] = useState(initialDoctorName);
  const [consultationId, setConsultationId] = useState(route?.params?.appointmentId || 'APT-2026-8841');
  const [selectedCategory, setSelectedCategory] = useState('malpractice');
  const [selectedSeverity, setSelectedSeverity] = useState('high');
  const [incidentDate, setIncidentDate] = useState('2026-06-04');
  const [narrative, setNarrative] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([
    'prescription_error_photo.jpg',
    'chat_transcript_proof.pdf',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStatementConfirmed, setIsStatementConfirmed] = useState(false);

  // Add Evidence File (Mock Upload)
  const handleAddEvidence = () => {
    Alert.alert(
      'Attach Evidence',
      'Select file type to attach to your official complaint:',
      [
        {
          text: 'Upload Chat Transcript',
          onPress: () => {
            setAttachedFiles([...attachedFiles, `consultation_log_${Date.now().toString().slice(-4)}.pdf`]);
            toastSuccess('Evidence Attached', 'Chat transcript PDF attached.');
          },
        },
        {
          text: 'Upload Screenshot / Photo',
          onPress: () => {
            setAttachedFiles([...attachedFiles, `evidence_photo_${Date.now().toString().slice(-4)}.jpg`]);
            toastSuccess('Evidence Attached', 'Screenshot attached.');
          },
        },
        {
          text: 'Upload Audio Recording',
          onPress: () => {
            setAttachedFiles([...attachedFiles, `voice_note_${Date.now().toString().slice(-4)}.mp3`]);
            toastSuccess('Evidence Attached', 'Audio transcript attached.');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Remove Evidence
  const handleRemoveEvidence = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  // Submit Incident Report
  const handleSubmit = async () => {
    if (!accusedDoctor.trim()) {
      toastError('Missing Doctor', 'Please enter the name of the accused provider.');
      return;
    }
    if (!narrative.trim() || narrative.length < 20) {
      toastError('Detailed Narrative Required', 'Please provide a detailed description of the incident (at least 20 characters).');
      return;
    }
    if (!isStatementConfirmed) {
      toastError('Confirmation Required', 'Please confirm that your statement and uploaded evidence are true.');
      return;
    }

    setIsSubmitting(true);

    const catObj = INCIDENT_CATEGORIES.find((c) => c.id === selectedCategory);
    const sevObj = SEVERITY_LEVELS.find((s) => s.id === selectedSeverity);

    try {
      const newReport = await addReport({
        doctorName: accusedDoctor.trim(),
        consultationId: consultationId.trim(),
        category: selectedCategory,
        categoryLabel: catObj?.label || selectedCategory,
        severity: selectedSeverity,
        severityLabel: sevObj?.label || selectedSeverity,
        incidentDate,
        narrative: narrative.trim(),
        attachedFiles,
      });

      // Audit Log for clinical compliance
      await useAuditLogStore.getState().logEvent({
        patientId: 'p-1',
        patientName: 'Patient User',
        actorId: 'p-1',
        actorName: 'Patient User',
        actorRole: 'patient',
        actorTitle: 'Patient Malpractice Reporting',
        action: 'edit',
        recordId: newReport.id,
        recordName: `Incident: ${newReport.doctorName} (${catObj?.label})`,
        recordCategory: 'medical_history',
      });

      setIsSubmitting(false);
      setNarrative('');
      setIsStatementConfirmed(false);
      toastSuccess('Report Filed', `Complaint ${newReport.id} is registered with the Medical Disciplinary Board.`);
      setActiveTab('history');
    } catch {
      setIsSubmitting(false);
      toastError('Submission Error', 'Failed to file report. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Incident & Disciplinary</Text>
          <Text style={styles.headerSubtitle}>Official Clinical Governance & Audit</Text>
        </View>
        <View style={styles.shieldHeaderIcon}>
          <Ionicons name="shield-checkmark" size={20} color="#DC2626" />
        </View>
      </View>

      {/* ── Tab Switcher ──────────────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'file' && styles.tabBtnActive]}
          onPress={() => setActiveTab('file')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={activeTab === 'file' ? '#DC2626' : '#64748B'}
          />
          <Text style={[styles.tabBtnText, activeTab === 'file' && styles.tabBtnTextActive]}>
            File New Complaint
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="albums-outline"
            size={16}
            color={activeTab === 'history' ? '#DC2626' : '#64748B'}
          />
          <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>
            My Case Files ({reports.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'file' ? (
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Banner Notice */}
          <View style={styles.noticeBanner}>
            <Ionicons name="information-circle" size={20} color="#DC2626" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeBannerTitle}>Confidential & Legally Audited Submission</Text>
              <Text style={styles.noticeBannerText}>
                Your report and attached evidence will be reviewed by the Omini Pulse Medical Board. If severe, the accused doctor may be temporarily or permanently suspended pending formal board audit.
              </Text>
            </View>
          </View>

          {/* Form Card 1: Provider & Session */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Accused Provider & Session</Text>
            
            <Text style={styles.fieldLabel}>Accused Doctor / Healthcare Provider</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person" size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="e.g. Dr. Tunde Alao"
                value={accusedDoctor}
                onChangeText={setAccusedDoctor}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Related Consultation / Appointment ID</Text>
            <View style={styles.inputBox}>
              <Ionicons name="barcode" size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="e.g. APT-2026-8841"
                value={consultationId}
                onChangeText={setConsultationId}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Approximate Date of Incident</Text>
            <View style={styles.inputBox}>
              <Ionicons name="calendar" size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={incidentDate}
                onChangeText={setIncidentDate}
              />
            </View>
          </View>

          {/* Form Card 2: Incident Classification */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>2. Violation Category</Text>
            <Text style={styles.fieldSub}>Select the primary nature of the professional violation:</Text>
            <View style={{ gap: 8 }}>
              {INCIDENT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryOption, isSelected && styles.categoryOptionActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.categoryIconCircle, isSelected && styles.categoryIconCircleActive]}>
                      <Ionicons
                        name={cat.icon as any}
                        size={16}
                        color={isSelected ? '#FFFFFF' : '#64748B'}
                      />
                    </View>
                    <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Form Card 3: Severity Assessment */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>3. Reported Severity Level</Text>
            <Text style={styles.fieldSub}>Indicate patient impact or clinical risk observed:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SEVERITY_LEVELS.map((sev) => {
                const isSelected = selectedSeverity === sev.id;
                return (
                  <TouchableOpacity
                    key={sev.id}
                    style={[
                      styles.severityPill,
                      { backgroundColor: isSelected ? sev.bg : '#F1F5F9', borderColor: isSelected ? sev.color : '#E2E8F0', borderWidth: 1 },
                    ]}
                    onPress={() => setSelectedSeverity(sev.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.severityPillText, { color: isSelected ? sev.color : '#475569' }]}>
                      {sev.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Form Card 4: Factual Narrative */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>4. Factual Narrative Statement</Text>
            <Text style={styles.fieldSub}>
              Provide a clear, chronological account of the incident. Include specifics such as dosage, verbal remarks, or failure of care:
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Detailed chronological statement (minimum 20 characters)..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={narrative}
              onChangeText={setNarrative}
            />
          </View>

          {/* Form Card 5: Evidence & Attachments */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={styles.sectionTitle}>5. Evidence Files ({attachedFiles.length})</Text>
              <TouchableOpacity style={styles.addEvidenceBtn} onPress={handleAddEvidence} activeOpacity={0.8}>
                <Ionicons name="cloud-upload" size={14} color={Colors.primary[700]} />
                <Text style={styles.addEvidenceBtnText}>+ Add Evidence</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldSub}>
              Attach supporting evidence (photos, screenshots, chat logs, prescription documents, audio transcripts).
            </Text>

            <View style={{ gap: 8, marginTop: 10 }}>
              {attachedFiles.length === 0 ? (
                <View style={styles.emptyEvidenceBox}>
                  <Ionicons name="document-attach-outline" size={28} color="#94A3B8" />
                  <Text style={styles.emptyEvidenceText}>No evidence attached yet. Tap "+ Add Evidence" above.</Text>
                </View>
              ) : (
                attachedFiles.map((file, idx) => (
                  <View key={idx} style={styles.fileItemRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={styles.fileTypeBadge}>
                        <Ionicons
                          name={file.endsWith('.pdf') ? 'document' : file.endsWith('.mp3') ? 'mic' : 'image'}
                          size={16}
                          color="#2563EB"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fileNameText} numberOfLines={1}>{file}</Text>
                        <Text style={styles.fileSizeText}>Verified Evidence Attachment • Ready for Board Audit</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveEvidence(idx)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Confirmation Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsStatementConfirmed(!isStatementConfirmed)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isStatementConfirmed && styles.checkboxChecked]}>
              {isStatementConfirmed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>
              I solemnly affirm that the statement and uploaded evidence provided above are accurate and truthful under medical reporting guidelines.
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Submit Formal Complaint</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Oversight Tracking Notice */}
          <View style={styles.historyNoticeBanner}>
            <Ionicons name="shield-checkmark" size={22} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={styles.historyNoticeTitle}>Medical Board Oversight Tracking</Text>
              <Text style={styles.historyNoticeText}>
                All submitted incident reports are assigned an official docket ID and reviewed by the MDCN-aligned disciplinary committee.
              </Text>
            </View>
          </View>

          {reports.length === 0 ? (
            <View style={styles.emptyHistoryBox}>
              <Ionicons name="folder-open-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyHistoryTitle}>No Case Files Found</Text>
              <Text style={styles.emptyHistorySubtitle}>You have not filed any professional complaints.</Text>
              <TouchableOpacity style={styles.startFilingBtn} onPress={() => setActiveTab('file')}>
                <Text style={styles.startFilingBtnText}>File a Complaint</Text>
              </TouchableOpacity>
            </View>
          ) : (
            reports.map((item) => (
              <View key={item.id} style={styles.reportCaseCard}>
                <View style={styles.caseCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.caseId}>{item.id}</Text>
                    <Text style={styles.caseDate}>
                      Filed {new Date(item.filedAt || Date.now()).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={[
                    styles.caseStatusChip,
                    item.status === 'Resolved' ? styles.statusResolved :
                    item.status === 'Escalated to MDCN' ? styles.statusEscalated :
                    item.status === 'Investigating' ? styles.statusInvestigating : styles.statusReview
                  ]}>
                    <Text style={[
                      styles.caseStatusText,
                      item.status === 'Resolved' ? styles.statusTextResolved :
                      item.status === 'Escalated to MDCN' ? styles.statusTextEscalated :
                      item.status === 'Investigating' ? styles.statusTextInvestigating : styles.statusTextReview
                    ]}>{item.status || 'Under Review'}</Text>
                  </View>
                </View>

                <View style={styles.caseDetailRow}>
                  <Ionicons name="person-circle-outline" size={18} color="#475569" />
                  <Text style={styles.caseDocText}>{item.doctorName}</Text>
                  <Text style={styles.caseAptText}>• Session {item.consultationId}</Text>
                </View>

                <View style={styles.caseCategoryRow}>
                  <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                  <Text style={styles.caseCategoryText}>{item.categoryLabel}</Text>
                  <View style={[styles.severityMiniBadge, { backgroundColor: item.severity === 'critical' ? '#FEE2E2' : '#FFEDD5' }]}>
                    <Text style={[styles.severityMiniText, { color: item.severity === 'critical' ? '#DC2626' : '#EA580C' }]}>{item.severityLabel}</Text>
                  </View>
                </View>

                <Text style={styles.caseNarrative} numberOfLines={3}>{item.narrative}</Text>

                {item.attachedFiles && item.attachedFiles.length > 0 && (
                  <View style={styles.caseAttachmentsRow}>
                    <Ionicons name="attach" size={14} color="#64748B" />
                    <Text style={styles.caseAttachmentsText}>{item.attachedFiles.length} evidence file(s) attached</Text>
                  </View>
                )}

                <View style={styles.caseFooter}>
                  <View style={styles.caseAuditBadge}>
                    <Ionicons name="lock-closed" size={12} color="#0D9488" />
                    <Text style={styles.caseAuditText}>Cryptographically Audited</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  shieldHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: Spacing[4],
    gap: 16,
  },
  noticeBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
  },
  noticeBannerTitle: {
    fontSize: 12.5,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
    marginBottom: 2,
  },
  noticeBannerText: {
    fontSize: 11.5,
    color: '#991B1B',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    color: '#334155',
    marginBottom: 4,
  },
  fieldSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  categoryOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary[500],
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconCircleActive: {
    backgroundColor: Colors.primary[600],
  },
  categoryLabel: {
    fontSize: 12.5,
    fontWeight: FontWeight.medium,
    color: '#334155',
  },
  categoryLabelActive: {
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  severityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityPillText: {
    fontSize: 11.5,
    fontWeight: FontWeight.bold,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 110,
  },
  addEvidenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addEvidenceBtnText: {
    fontSize: 11.5,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  emptyEvidenceBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 10,
    gap: 6,
  },
  emptyEvidenceText: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  fileItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  fileTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileNameText: {
    fontSize: 12.5,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  fileSizeText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    ...Shadows.md,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: Spacing[4],
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#DC2626',
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: FontWeight.medium,
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#DC2626',
    fontWeight: FontWeight.bold,
  },
  historyNoticeBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  historyNoticeTitle: {
    fontSize: 12.5,
    fontWeight: FontWeight.bold,
    color: '#0F766E',
    marginBottom: 2,
  },
  historyNoticeText: {
    fontSize: 11.5,
    color: '#115E59',
    lineHeight: 16,
  },
  emptyHistoryBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyHistoryTitle: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: '#334155',
  },
  emptyHistorySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
  },
  startFilingBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  startFilingBtnText: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    fontSize: 12.5,
  },
  reportCaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
    gap: 10,
  },
  caseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caseId: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  caseDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  caseStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusReview: {
    backgroundColor: '#FEF3C7',
  },
  statusInvestigating: {
    backgroundColor: '#EFF6FF',
  },
  statusEscalated: {
    backgroundColor: '#FEE2E2',
  },
  statusResolved: {
    backgroundColor: '#ECFDF5',
  },
  caseStatusText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
  },
  statusTextReview: {
    color: '#D97706',
  },
  statusTextInvestigating: {
    color: '#2563EB',
  },
  statusTextEscalated: {
    color: '#DC2626',
  },
  statusTextResolved: {
    color: '#059669',
  },
  caseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  caseDocText: {
    fontSize: 13,
    fontWeight: FontWeight.semiBold,
    color: '#1E293B',
  },
  caseAptText: {
    fontSize: 12,
    color: '#64748B',
  },
  caseCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  caseCategoryText: {
    fontSize: 12,
    fontWeight: FontWeight.medium,
    color: '#DC2626',
  },
  severityMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityMiniText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  caseNarrative: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
  },
  caseAttachmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  caseAttachmentsText: {
    fontSize: 11,
    color: '#64748B',
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  caseAuditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  caseAuditText: {
    fontSize: 10,
    fontWeight: FontWeight.semiBold,
    color: '#0F766E',
  },
});
