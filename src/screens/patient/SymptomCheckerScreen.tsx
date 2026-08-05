import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Button, StepIndicator, BodyMap, AppModal } from '../../components';
import { AIDisclaimerBanner } from '../../components/common/AIDisclaimerBanner';
import { BodyPartId } from '../../components/ui/BodyMap';
import { PainLog } from '../../types';

const STEPS = ['Body Area', 'Severity', 'Results'];

const BODY_AREAS = [
  { id: 'head', name: 'Head & Neck', icon: 'egg-outline', color: '#3B82F6', bg: '#EFF6FF', spec: 'General Practitioner' },
  { id: 'chest', name: 'Chest & Cardio', icon: 'heart-outline', color: '#EF4444', bg: '#FEF2F2', spec: 'Cardiologist' },
  { id: 'abdomen', name: 'Abdomen/Stomach', icon: 'nutrition-outline', color: '#10B981', bg: '#ECFDF5', spec: 'Gastroenterologist' },
  { id: 'limbs', name: 'Arms & Legs', icon: 'body-outline', color: '#F59E0B', bg: '#FEF3C7', spec: 'Orthopedics' },
  { id: 'general', name: 'General/Fever', icon: 'thermometer-outline', color: '#EC4899', bg: '#FDF2F8', spec: 'General Practitioner' },
];

const ADDITIONAL_SYMPTOMS = [
  'Fever / Chills',
  'Dry Cough',
  'Fatigue / Tiredness',
  'Nausea / Vomiting',
  'Dizziness / Vertigo',
  'Sore Throat',
  'Shortness of Breath',
];

export default function SymptomCheckerScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form State
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [painLevel, setPainLevel] = useState<number>(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const [painLogs, setPainLogs] = useState<PainLog[]>([]);
  const [activePart, setActivePart] = useState<BodyPartId | null>(null);
  const [tempSeverity, setTempSeverity] = useState<number>(5);
  const [tempNotes, setTempNotes] = useState('');

  const handleContinue = () => {
    if (painLogs.length === 0) {
      Alert.alert('Selection Required', 'Please tap on the body map to select at least one region.');
      return;
    }
    const highestLog = painLogs.reduce((prev, current) => (prev.severity > current.severity) ? prev : current, painLogs[0]);
    // Map highest log to selectedArea format for the analyzer
    const areaMapping: Record<string, string> = {
      head: 'Head & Neck',
      neck: 'Head & Neck',
      chest: 'Chest & Cardio',
      abdomen: 'Abdomen/Stomach',
      left_arm: 'Arms & Legs',
      right_arm: 'Arms & Legs',
      left_leg: 'Arms & Legs',
      right_leg: 'Arms & Legs',
      back: 'Arms & Legs'
    };
    setSelectedArea({
      id: highestLog.bodyPartId,
      name: areaMapping[highestLog.bodyPartId] || 'General/Fever',
    });
    setPainLevel(highestLog.severity);
    setCurrentStep(1);
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const getDiagnosisResult = () => {
    if (!selectedArea) return { diagnosis: 'Unknown Condition', level: 'Mild', description: 'Unable to analyze.' };

    if (selectedArea.id === 'chest') {
      if (painLevel > 6) {
        return {
          diagnosis: 'Acute Chest Pain / Angina Risk',
          level: 'High Alert',
          color: '#DC2626',
          bg: '#FEF2F2',
          description: 'Chest discomfort accompanied by heavy pressure could indicate cardiovascular strain.',
          recommendation: 'Seek immediate medical attention. Please consult a Cardiologist as soon as possible.',
          spec: 'Cardiologist',
        };
      } else {
        return {
          diagnosis: 'Minor Chest Discomfort / Heartburn',
          level: 'Moderate',
          color: '#D97706',
          bg: '#FEF3C7',
          description: 'Mild pain or burning sensation in the chest area, possibly related to acidity or acid reflux.',
          recommendation: 'Monitor symptoms. Avoid heavy foods. Schedule a consultation if it persists.',
          spec: 'Cardiologist',
        };
      }
    }

    if (selectedArea.id === 'head') {
      if (selectedSymptoms.includes('Fever / Chills')) {
        return {
          diagnosis: 'Acute Sinusitis or Flu Infection',
          level: 'Moderate',
          color: '#D97706',
          bg: '#FEF3C7',
          description: 'Head congestion accompanied by fever is commonly caused by upper respiratory tract infections.',
          recommendation: 'Rest, hydrate, and book a consultation with a General Practitioner.',
          spec: 'General Practitioner',
        };
      } else {
        return {
          diagnosis: 'Tension / Migraine Headache',
          level: 'Mild',
          color: '#2563EB',
          bg: '#EFF6FF',
          description: 'Localized throbbing or pressure around the temples, neck, or forehead.',
          recommendation: 'Rest in a quiet room, avoid bright screens, and seek clinical advice.',
          spec: 'General Practitioner',
        };
      }
    }

    if (selectedArea.id === 'abdomen') {
      return {
        diagnosis: 'Gastrointestinal Dyspepsia',
        level: 'Moderate',
        color: '#D97706',
        bg: '#FEF3C7',
        description: 'Abdominal pain, bloating, or stomach ache possibly related to indigestion.',
        recommendation: 'Consult a Gastroenterologist for a digestive health evaluation.',
        spec: 'Gastroenterologist',
      };
    }

    if (selectedArea.id === 'limbs') {
      return {
        diagnosis: 'Musculoskeletal Strain',
        level: 'Mild',
        color: '#2563EB',
        bg: '#EFF6FF',
        description: 'Mild muscle soreness or ligament stress, likely related to physical exertion.',
        recommendation: 'Apply ice, rest the affected limb, and consult an Orthopedic doctor if pain worsens.',
        spec: 'Orthopedics',
      };
    }

    // General / Default
    return {
      diagnosis: 'Common Viral Infection / Fatigue',
      level: 'Mild',
      color: '#2563EB',
      bg: '#EFF6FF',
      description: 'Generalized fatigue or chills often associated with viral syndromes.',
      recommendation: 'Drink warm fluids, monitor temperature, and consult a General Practitioner.',
      spec: 'General Practitioner',
    };
  };

  const result = getDiagnosisResult();

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleAnalyzeSymptoms = () => {
    setCurrentStep(2);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Symptom Checker</Text>
        <View style={styles.placeholder} />
      </View>

      <AIDisclaimerBanner />

      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        style={styles.stepIndicator}
      />

      <View style={styles.container}>
        {/* Step 0: Select Body Area */}
        {currentStep === 0 && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            <Text style={styles.sectionTitle}>Interactive Pain Map</Text>
            <Text style={styles.sectionSubtitle}>
              Tap the relevant parts of the body outline (front or back view) to map your pain regions.
            </Text>

            <BodyMap
              painLogs={painLogs}
              interactive={true}
              onPartPress={(partId) => {
                const existing = painLogs.find((l) => l.bodyPartId === partId);
                setTempSeverity(existing ? existing.severity : 5);
                setTempNotes(existing?.notes || '');
                setActivePart(partId);
              }}
            />

            {painLogs.length > 0 ? (
              <View style={styles.loggedList}>
                <Text style={styles.loggedHeader}>Logged Pain Regions:</Text>
                {painLogs.map((log) => (
                  <View key={log.bodyPartId} style={styles.loggedItem}>
                    <View style={styles.loggedTextWrap}>
                      <View style={styles.loggedNameRow}>
                        <View style={[styles.severityDot, {
                          backgroundColor: log.severity >= 8 ? '#EF4444' : log.severity >= 4 ? '#F97316' : '#EAB308'
                        }]} />
                        <Text style={styles.loggedName}>{log.bodyPartId.toUpperCase().replace('_', ' ')} ({log.severity}/10)</Text>
                      </View>
                      {log.notes ? <Text style={styles.loggedNotes}>{log.notes}</Text> : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => setPainLogs(painLogs.filter((l) => l.bodyPartId !== log.bodyPartId))}
                      style={styles.trashBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error.main} />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <Button
                  label="Continue to Details"
                  onPress={handleContinue}
                  style={styles.continueBtn}
                />
              </View>
            ) : (
              <Text style={styles.noMedsText}>Please tap at least one body part above to log pain details.</Text>
            )}
          </ScrollView>
        )}

        {/* Step 1: Severity and Symptoms */}
        {currentStep === 1 && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Tell us more about it</Text>

            {/* Pain Intensity Scale */}
            <Card style={styles.card}>
              <Text style={styles.cardLabel}>Pain Severity: {painLevel} / 10</Text>
              <View style={styles.painScaleContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                  const isSelected = painLevel === level;
                  const getScaleColor = () => {
                    if (level <= 3) return '#10B981';
                    if (level <= 6) return '#F59E0B';
                    return '#EF4444';
                  };
                  return (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setPainLevel(level)}
                      style={[
                        styles.painScaleButton,
                        { borderColor: getScaleColor() },
                        isSelected && { backgroundColor: getScaleColor() },
                      ]}
                    >
                      <Text style={[styles.painScaleText, isSelected && { color: '#FFFFFF' }]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Checklist */}
            <Text style={styles.subTitle}>Any associated symptoms?</Text>
            <View style={styles.checkboxContainer}>
              {ADDITIONAL_SYMPTOMS.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <TouchableOpacity
                    key={symptom}
                    onPress={() => toggleSymptom(symptom)}
                    style={[styles.checkboxItem, isSelected && styles.checkboxItemActive]}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isSelected ? Colors.secondary[600] : Colors.neutral[400]}
                    />
                    <Text style={[styles.checkboxLabel, isSelected && styles.checkboxLabelActive]}>
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Notes */}
            <Text style={styles.subTitle}>Additional Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Describe symptoms, how long you have had them, or what triggers them..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.footerBtns}>
              <Button label="Analyze Symptoms" onPress={handleAnalyzeSymptoms} />
            </View>
          </ScrollView>
        )}

        {/* Step 2: Diagnostic Results */}
        {currentStep === 2 && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.resultHeader}>
              <Ionicons name="medical-sharp" size={42} color={result.color} />
              <Text style={styles.resultTitle}>Analysis Results</Text>
              <Text style={styles.resultSubtitle}>
                This is a mock triage assessment and is not a formal diagnosis.
              </Text>
            </View>

            <Card style={[styles.resultCard, { borderColor: result.color }]}>
              <View style={styles.resultCardHeader}>
                <Text style={styles.diagnosticMatchLabel}>Potential Cause</Text>
                <View style={[styles.badge, { backgroundColor: result.color }]}>
                  <Text style={styles.badgeText}>{result.level}</Text>
                </View>
              </View>
              <Text style={styles.diagnosisName}>{result.diagnosis}</Text>
              <Text style={styles.diagnosisDesc}>{result.description}</Text>
            </Card>

            <Card style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>Clinical Advisory</Text>
              <Text style={styles.recommendationText}>{result.recommendation}</Text>
            </Card>

            <View style={styles.footerBtns}>
              <Button
                label={`Book appointment with a ${result.spec}`}
                onPress={() => navigation.navigate('BookAppointment')}
              />
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSelectedArea(null);
                  setPainLevel(3);
                  setSelectedSymptoms([]);
                  setNotes('');
                  setCurrentStep(0);
                }}
              >
                <Text style={styles.resetBtnText}>Restart Analysis</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      <AppModal
        visible={activePart !== null}
        onClose={() => {
          setActivePart(null);
        }}
        title={`Pain Level: ${activePart ? activePart.toUpperCase().replace('_', ' ') : ''}`}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3], width: '100%' }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setActivePart(null)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Save Details"
              onPress={() => {
                if (activePart) {
                  const existingIdx = painLogs.findIndex(l => l.bodyPartId === activePart);
                  const updatedLogs = [...painLogs];
                  if (existingIdx > -1) {
                    updatedLogs[existingIdx] = {
                      bodyPartId: activePart,
                      severity: tempSeverity,
                      notes: tempNotes,
                    };
                  } else {
                    updatedLogs.push({
                      bodyPartId: activePart,
                      severity: tempSeverity,
                      notes: tempNotes,
                    });
                  }
                  setPainLogs(updatedLogs);
                  setActivePart(null);
                }
              }}
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <View style={styles.modalBody}>
          <Text style={styles.modalLabel}>Severity (1-10): {tempSeverity}</Text>
          <View style={styles.modalSeverityRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.severityBtn,
                  tempSeverity === num && styles.severityBtnActive,
                  tempSeverity === num && {
                    backgroundColor: num >= 8 ? '#EF4444' : num >= 4 ? '#F97316' : '#EAB308'
                  }
                ]}
                onPress={() => setTempSeverity(num)}
              >
                <Text style={[styles.severityBtnText, tempSeverity === num && styles.severityBtnTextActive]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.modalLabel}>Discomfort Notes</Text>
          <TextInput
            style={styles.modalInput}
            value={tempNotes}
            onChangeText={setTempNotes}
            placeholder="Describe the type of pain (e.g. throbbing, sharp, constant, etc.)"
            placeholderTextColor={Colors.text.disabled}
            multiline={true}
            numberOfLines={3}
          />
        </View>
      </AppModal>
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
  stepIndicator: {
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[4],
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing[4],
  },
  areaList: {
    gap: Spacing[3],
  },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  areaIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaInfo: {
    flex: 1,
    gap: 2,
  },
  areaName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  areaSpecText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  card: {
    padding: Spacing[4],
    marginBottom: Spacing[4],
  },
  cardLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing[3],
  },
  painScaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  painScaleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  painScaleText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
  },
  subTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing[3],
    marginBottom: Spacing[3],
  },
  checkboxContainer: {
    gap: Spacing[2],
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    gap: Spacing[2],
  },
  checkboxItemActive: {
    borderColor: Colors.secondary[600],
    backgroundColor: Colors.secondary[50],
  },
  checkboxLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
  },
  checkboxLabelActive: {
    fontWeight: FontWeight.semiBold,
    color: Colors.secondary[600],
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing[3],
    fontSize: FontSize.sm,
    height: 90,
    marginBottom: Spacing[6],
  },
  footerBtns: {
    marginTop: 'auto',
    paddingTop: Spacing[4],
    gap: Spacing[2],
  },
  resultHeader: {
    alignItems: 'center',
    gap: Spacing[2],
    marginVertical: Spacing[4],
  },
  resultTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  resultSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  resultCard: {
    borderWidth: 2,
    padding: Spacing[4],
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  resultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diagnosticMatchLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  diagnosisName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  diagnosisDesc: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  recommendationCard: {
    padding: Spacing[4],
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    gap: 4,
    marginBottom: Spacing[6],
  },
  recommendationTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  recommendationText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  resetBtnText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    fontWeight: FontWeight.semiBold,
  },
  warningCard: {
    padding: Spacing[4],
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    marginBottom: Spacing[4],
    gap: 6,
    borderRadius: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningTitle: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
    color: Colors.error.main,
    textTransform: 'uppercase',
  },
  warningText: {
    fontSize: FontSize.xs,
    color: '#991B1B',
    lineHeight: 18,
  },
  // Pain Map Log Styles
  loggedList: {
    width: '100%',
    marginTop: Spacing[4],
    gap: Spacing[3],
  },
  loggedHeader: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  loggedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing[4],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.xs,
  },
  loggedTextWrap: {
    flex: 1,
    gap: 4,
  },
  loggedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loggedName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  loggedNotes: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
    marginLeft: 18,
  },
  trashBtn: {
    padding: Spacing[1],
  },
  continueBtn: {
    marginTop: Spacing[4],
  },
  noMedsText: {
    fontSize: FontSize.xs,
    color: Colors.text.disabled,
    textAlign: 'center',
    marginVertical: Spacing[6],
  },
  // Modal Styles
  modalBody: {
    padding: Spacing[2],
    gap: Spacing[4],
  },
  modalLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  modalSeverityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  severityBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  severityBtnActive: {
    borderColor: 'transparent',
  },
  severityBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  severityBtnTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: Spacing[3],
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    textAlignVertical: 'top',
    height: 72,
  },
});
