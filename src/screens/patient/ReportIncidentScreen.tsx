import React, { useState } from 'react';
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

  const initialDoctorName = route?.params?.doctorName || 'Dr. Tunde Alao';
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
  const handleSubmit = () => {
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

    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Incident Report Filed',
        `Report #REP-${Math.floor(1000 + Math.random() * 9000)} has been logged and submitted to the Omini Pulse Medical Disciplinary Board for investigation.`,
        [
          {
            text: 'Return to Home',
            onPress: () => navigation.navigate('PatientTabs'),
          },
        ]
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>File Incident Report</Text>
          <Text style={styles.headerSubtitle}>Medical Disciplinary & Audit Submission</Text>
        </View>
        <View style={styles.shieldHeaderIcon}>
          <Ionicons name="shield-checkmark" size={20} color="#DC2626" />
        </View>
      </View>

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

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Consultation Session ID</Text>
              <View style={styles.inputBox}>
                <Ionicons name="barcode-outline" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="APT-2026-8841"
                  value={consultationId}
                  onChangeText={setConsultationId}
                />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Date of Incident</Text>
              <View style={styles.inputBox}>
                <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={incidentDate}
                  onChangeText={setIncidentDate}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Form Card 2: Incident Category & Severity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Incident Classification & Severity</Text>

          <Text style={styles.fieldLabel}>Incident Category</Text>
          <View style={{ gap: 8, marginTop: 4 }}>
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
                    <Ionicons name={cat.icon as any} size={16} color={isSelected ? '#FFFFFF' : '#475569'} />
                  </View>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Severity Level</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {SEVERITY_LEVELS.map((sev) => {
              const isSelected = selectedSeverity === sev.id;
              return (
                <TouchableOpacity
                  key={sev.id}
                  style={[
                    styles.severityPill,
                    { backgroundColor: isSelected ? sev.color : '#F1F5F9' },
                  ]}
                  onPress={() => setSelectedSeverity(sev.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.severityPillText, { color: isSelected ? '#FFFFFF' : '#475569' }]}>
                    {sev.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Form Card 3: Detailed Statement Narrative */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Detailed Incident Description</Text>
          <Text style={styles.fieldSub}>
            Describe what happened during the consultation, what the doctor said or did, and why this constitutes a violation.
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Provide a detailed chronological narrative of the event..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={narrative}
            onChangeText={setNarrative}
          />
        </View>

        {/* Form Card 4: Evidence Attachment Upload */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>4. Evidence Attachments ({attachedFiles.length})</Text>
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
});
