import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card } from '../../components';
import { usePatientHome } from '../../hooks/usePatient';
import { useAuth } from '../../hooks/useAuth';

// ─── Insight Types ─────────────────────────────────────────────────────────

interface HealthInsight {
  id: string;
  category: 'vitals' | 'medication' | 'chronic' | 'lifestyle' | 'triage';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  detail: string;
  action?: string;
  icon: string;
}

// ─── AI Engine (deterministic based on vitals) ─────────────────────────────

function generateInsights(vitals: any): HealthInsight[] {
  const insights: HealthInsight[] = [];

  // Blood pressure analysis
  if (vitals?.bloodPressure) {
    const parts = vitals.bloodPressure.split('/');
    const sys = parseInt(parts[0], 10);
    const dia = parseInt(parts[1], 10);

    if (sys >= 140 || dia >= 90) {
      insights.push({
        id: 'bp-high',
        category: 'vitals',
        severity: 'critical',
        title: 'Elevated Blood Pressure Detected',
        detail: `Your BP reading of ${vitals.bloodPressure} mmHg exceeds normal range (< 120/80 mmHg). Sustained hypertension increases risk of stroke and heart disease. Consider scheduling a Cardiology consultation.`,
        action: 'Book Cardiologist',
        icon: 'heart',
      });
    } else if (sys >= 130 || dia >= 85) {
      insights.push({
        id: 'bp-elevated',
        category: 'vitals',
        severity: 'warning',
        title: 'Blood Pressure in High-Normal Range',
        detail: `Your BP of ${vitals.bloodPressure} mmHg is in the high-normal zone. Reducing sodium intake, maintaining healthy weight, and daily exercise can help normalize readings.`,
        icon: 'heart-outline',
      });
    } else {
      insights.push({
        id: 'bp-good',
        category: 'vitals',
        severity: 'info',
        title: 'Blood Pressure is Normal',
        detail: `Great — your BP of ${vitals.bloodPressure} mmHg is within the healthy range. Keep maintaining a balanced lifestyle to sustain this.`,
        icon: 'checkmark-circle-outline',
      });
    }
  }

  // Heart rate analysis
  if (vitals?.heartRate) {
    const hr = parseInt(vitals.heartRate, 10);
    if (hr > 100) {
      insights.push({
        id: 'hr-high',
        category: 'vitals',
        severity: 'warning',
        title: 'Resting Heart Rate Slightly Elevated',
        detail: `Your resting HR of ${hr} bpm is above the normal range (60–100 bpm). This can indicate stress, dehydration, or early cardiovascular strain. Ensure adequate hydration.`,
        icon: 'pulse',
      });
    } else if (hr < 55) {
      insights.push({
        id: 'hr-low',
        category: 'vitals',
        severity: 'info',
        title: 'Low Resting Heart Rate (Athletic Pattern)',
        detail: `Your HR of ${hr} bpm is below average but can be normal for active individuals. If accompanied by dizziness or fatigue, consult a doctor.`,
        icon: 'pulse-outline',
      });
    }
  }

  // Medication adherence insight
  insights.push({
    id: 'med-adherence',
    category: 'medication',
    severity: 'info',
    title: 'Medication Adherence Reminder',
    detail: 'Consistent medication adherence is critical for chronic disease management. Patients who miss more than 20% of doses see a 38% increase in hospitalization. Your OminiPulse reminders are active.',
    action: 'View Reminders',
    icon: 'medical',
  });

  // Lifestyle insight
  insights.push({
    id: 'lifestyle-1',
    category: 'lifestyle',
    severity: 'info',
    title: 'Weekly Physical Activity',
    detail: 'The WHO recommends 150–300 min of moderate aerobic activity per week. Regular activity reduces cardiovascular risk by up to 35%. Consider syncing a fitness tracker for automated activity logging.',
    action: 'Sync Wearable',
    icon: 'fitness',
  });

  // Document scan insight
  insights.push({
    id: 'doc-summary',
    category: 'triage',
    severity: 'info',
    title: 'Scan & Summarize Lab Reports',
    detail: 'Upload recent lab reports or scan a prescription using the AI Camera (OCR). OminiPulse will extract key values, flag abnormal findings, and cross-reference with your EHR.',
    action: 'Open AI Assistant',
    icon: 'scan',
  });

  return insights;
}

// ─── Severity Styles ─────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<
  'info' | 'warning' | 'critical',
  { bg: string; border: string; icon: string; label: string }
> = {
  info: { bg: '#EFF6FF', border: '#BFDBFE', icon: '#2563EB', label: 'Info' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', icon: '#D97706', label: 'Advisory' },
  critical: { bg: '#FEF2F2', border: '#FECACA', icon: '#DC2626', label: 'Attention' },
};

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function AIHealthInsightsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { data: homeData, isLoading } = usePatientHome();
  const [isGenerating, setIsGenerating] = useState(true);
  const [insights, setInsights] = useState<HealthInsight[]>([]);

  const vitals = (homeData as any)?.healthSummary;

  useEffect(() => {
    const timer = setTimeout(() => {
      const generated = generateInsights(vitals);
      setInsights(generated);
      setIsGenerating(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [vitals]);

  const handleAction = (action?: string) => {
    if (!action) return;
    if (action === 'Book Cardiologist') {
      navigation.navigate('BookAppointment', {});
    } else if (action === 'View Reminders') {
      navigation.navigate('MedicationReminders');
    } else if (action === 'Sync Wearable') {
      navigation.navigate('WearableSync');
    } else if (action === 'Open AI Assistant') {
      navigation.navigate('PatientTabs', { screen: 'PatientAI' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Health Insights</Text>
        <View style={styles.aiChip}>
          <Ionicons name="leaf" size={13} color={Colors.patient} />
          <Text style={styles.aiChipText}>AI</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Context Banner */}
        <Card style={styles.contextBanner}>
          <View style={styles.bannerRow}>
            <View style={styles.bannerIcon}>
              <Ionicons name="analytics" size={22} color="#2563EB" />
            </View>
            <View style={styles.bannerTexts}>
              <Text style={styles.bannerTitle}>Personalized Health Analysis</Text>
              <Text style={styles.bannerSub}>
                AI-generated insights based on your vitals, records, and prescription history.
              </Text>
              <Text style={styles.bannerDisclaimer}>
                Informational only. Does not replace advice from a licensed doctor.
              </Text>
            </View>
          </View>
        </Card>

        {/* Vitals Snapshot */}
        {vitals && (
          <Card style={styles.vitalsCard}>
            <Text style={styles.sectionLabel}>Your Current Vitals</Text>
            <View style={styles.vitalsRow}>
              {[
                { label: 'Blood Pressure', value: vitals.bloodPressure || '---', icon: 'heart' },
                { label: 'Heart Rate', value: vitals.heartRate ? `${vitals.heartRate} bpm` : '---', icon: 'pulse' },
                { label: 'Temperature', value: vitals.temperature ? `${vitals.temperature}C` : '---', icon: 'thermometer' },
                { label: 'SpO2', value: vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : '---', icon: 'water' },
              ].map((v) => (
                <View key={v.label} style={styles.vitalItem}>
                  <Ionicons name={v.icon as any} size={16} color={Colors.patient} />
                  <Text style={styles.vitalValue}>{v.value}</Text>
                  <Text style={styles.vitalLabel}>{v.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* AI Insight Cards */}
        {isGenerating || isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.patient} />
            <Text style={styles.loadingText}>AI is analyzing your health data...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionHeader}>{insights.length} AI-Generated Insights</Text>
            {insights.map((insight) => {
              const sev = SEVERITY_STYLES[insight.severity];
              return (
                <Card
                  key={insight.id}
                  style={[
                    styles.insightCard,
                    { backgroundColor: sev.bg, borderColor: sev.border, borderWidth: 1 },
                  ]}
                >
                  <View style={styles.insightHeader}>
                    <View style={[styles.insightIconBg, { backgroundColor: sev.border }]}>
                      <Ionicons name={insight.icon as any} size={18} color={sev.icon} />
                    </View>
                    <View style={styles.insightTitleRow}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <View style={[styles.sevBadge, { backgroundColor: sev.border }]}>
                        <Text style={[styles.sevBadgeText, { color: sev.icon }]}>{sev.label}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.insightDetail}>{insight.detail}</Text>
                  {insight.action && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: sev.icon }]}
                      onPress={() => handleAction(insight.action)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.actionBtnText, { color: sev.icon }]}>{insight.action}</Text>
                      <Ionicons name="arrow-forward" size={14} color={sev.icon} />
                    </TouchableOpacity>
                  )}
                </Card>
              );
            })}
          </>
        )}

        {/* Pre-Consultation Symptom Triage */}
        <Card style={styles.triageCard}>
          <View style={styles.triageRow}>
            <View style={styles.triageIconBg}>
              <Ionicons name="medkit" size={20} color="#10B981" />
            </View>
            <View style={styles.triageTexts}>
              <Text style={styles.triageTitle}>Before Your Next Consultation</Text>
              <Text style={styles.triageSub}>
                Run an AI Symptom Triage to help your doctor understand your condition before the appointment.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.triageBtn}
            onPress={() =>
              navigation.navigate('PatientTabs', {
                screen: 'PatientAI',
                params: { startSymptomChecker: true },
              })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="scan-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.triageBtnText}>Start Symptom Triage</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  backBtn: { padding: Spacing[1] },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.patient,
  },
  aiChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.patient },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing[4], paddingBottom: Spacing[8], gap: Spacing[4] },

  contextBanner: { borderRadius: 14, padding: Spacing[4] },
  bannerRow: { flexDirection: 'row', gap: Spacing[3] },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTexts: { flex: 1, gap: 4 },
  bannerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text.primary },
  bannerSub: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  bannerDisclaimer: { fontSize: FontSize.xs, color: Colors.text.secondary, fontStyle: 'italic', marginTop: 4 },

  vitalsCard: { borderRadius: 14, padding: Spacing[4] },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text.secondary, marginBottom: Spacing[3] },
  vitalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] },
  vitalItem: { flex: 1, minWidth: 70, alignItems: 'center', gap: 4 },
  vitalValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.primary },
  vitalLabel: { fontSize: FontSize.xs, color: Colors.text.secondary, textAlign: 'center' },

  loadingContainer: { alignItems: 'center', paddingVertical: Spacing[10], gap: Spacing[4] },
  loadingText: { fontSize: FontSize.sm, color: Colors.text.secondary, fontStyle: 'italic' },

  sectionHeader: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text.primary },

  insightCard: { borderRadius: 14, padding: Spacing[4], gap: Spacing[3] },
  insightHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  insightIconBg: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  insightTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  insightTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.primary, flex: 1 },
  sevBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  sevBadgeText: { fontSize: 10, fontWeight: FontWeight.bold },
  insightDetail: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },

  triageCard: { borderRadius: 14, padding: Spacing[4], gap: Spacing[3] },
  triageRow: { flexDirection: 'row', gap: Spacing[3] },
  triageIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  triageTexts: { flex: 1, gap: 4 },
  triageTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text.primary },
  triageSub: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  triageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
  },
  triageBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#FFFFFF' },
});
