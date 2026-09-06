import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [tempSeverity, setTempSeverity] = useState<number>(2);
  const [tempNotes, setTempNotes] = useState('');
  const [isSeverityModalOpen, setIsSeverityModalOpen] = useState(false);

  const handleSelectPart = (partId: BodyPartId) => {
    setActivePart(partId);
    const existing = painLogs.find((l) => l.bodyPartId === partId);
    if (existing) {
      setTempSeverity(existing.severity);
      setTempNotes(existing.notes || '');
    } else {
      // Default to 2 (Mild - Yellow) so it immediately shows Yellow on first tap
      const initialSev = 2;
      setTempSeverity(initialSev);
      setTempNotes('');
      setPainLogs((prev) => [...prev, { bodyPartId: partId, severity: initialSev, notes: '' }]);
    }
    // Open the direct number picker modal right in the user's face!
    setIsSeverityModalOpen(true);
  };

  const handleSetPartSeverity = (severity: number) => {
    if (!activePart) return;
    setTempSeverity(severity);
    setPainLogs((prev) => {
      const idx = prev.findIndex((l) => l.bodyPartId === activePart);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], severity };
        return copy;
      }
      return [...prev, { bodyPartId: activePart, severity, notes: tempNotes }];
    });
  };

  const handleRemovePart = (partId: BodyPartId) => {
    setPainLogs((prev) => prev.filter((l) => l.bodyPartId !== partId));
    if (activePart === partId) {
      setActivePart(null);
    }
  };

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
              selectedPartId={activePart}
              onPartPress={handleSelectPart}
            />

            {/* Instant Pain Level Selector for Selected Region */}
            {activePart ? (
              <View style={styles.inlinePainCard}>
                <View style={styles.inlinePainHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Ionicons name="finger-print" size={16} color="#0F6E6E" />
                    <Text style={styles.inlinePainTitle}>
                      {activePart.toUpperCase().replace('_', ' ')}
                    </Text>
                    <View
                      style={[
                        styles.inlineSeverityPill,
                        {
                          backgroundColor:
                            tempSeverity >= 7 ? '#FEF2F2' : tempSeverity >= 4 ? '#FFF7ED' : '#FEFCE8',
                          borderColor:
                            tempSeverity >= 7 ? '#EF4444' : tempSeverity >= 4 ? '#F97316' : '#EAB308',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.inlineSeverityPillText,
                          {
                            color:
                              tempSeverity >= 7 ? '#EF4444' : tempSeverity >= 4 ? '#C2410C' : '#A16207',
                          },
                        ]}
                      >
                        {tempSeverity}/10 •{' '}
                        {tempSeverity >= 7 ? 'Severe (Red)' : tempSeverity >= 4 ? 'Moderate (Orange)' : 'Mild (Yellow)'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleRemovePart(activePart)}
                    style={styles.removePartBtn}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                    <Text style={styles.removePartBtnText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                {/* 1 to 10 Color-Coded Number Buttons */}
                <Text style={styles.numberRowLabel}>Tap number to set pain intensity (colors region):</Text>
                <View style={styles.numberRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = tempSeverity === num;
                    const numColor = num >= 7 ? '#EF4444' : num >= 4 ? '#F97316' : '#EAB308';
                    return (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.inlineNumBtn,
                          { borderColor: numColor },
                          isSelected && { backgroundColor: numColor },
                        ]}
                        onPress={() => handleSetPartSeverity(num)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.inlineNumText,
                            { color: isSelected ? '#FFFFFF' : numColor },
                          ]}
                        >
                          {num}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Severity Guide Legend */}
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
                    <Text style={styles.legendText}>1–3 Mild (Yellow)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                    <Text style={styles.legendText}>4–6 Moderate (Orange)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>7–10 Severe (Red)</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.tapPromptCard}>
                <Ionicons name="hand-left-outline" size={18} color="#0F6E6E" />
                <Text style={styles.tapPromptText}>
                  Tap any body region above to set its pain level (1-10) and watch it glow Yellow, Orange, or Red.
                </Text>
              </View>
            )}

            {painLogs.length > 0 ? (
              <View style={styles.loggedList}>
                <Text style={styles.loggedHeader}>Logged Pain Regions:</Text>
                {painLogs.map((log) => (
                  <View key={log.bodyPartId} style={styles.loggedItem}>
                    <View style={styles.loggedTextWrap}>
                      <View style={styles.loggedNameRow}>
                        <View style={[styles.severityDot, {
                          backgroundColor: log.severity >= 7 ? '#EF4444' : log.severity >= 4 ? '#F97316' : '#EAB308'
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
                    if (level <= 3) return '#EAB308';
                    if (level <= 6) return '#F97316';
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
                onPress={() => {
                  const symptomList = selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None selected';
                  const triageSummary = `Triage Findings: ${result.diagnosis} (${result.level} - Pain ${painLevel}/10). Symptoms: ${symptomList}. Notes: ${notes || 'None'}`;
                  navigation.navigate('BookAppointment', {
                    specialization: result.spec,
                    prefilledReason: triageSummary,
                    painLogs,
                  });
                }}
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

      {/* Direct Interactive Pain Severity Dialog */}
      <AppModal
        visible={isSeverityModalOpen && Boolean(activePart)}
        onClose={() => setIsSeverityModalOpen(false)}
        title={activePart ? `Rate Pain: ${activePart.toUpperCase().replace('_', ' ')}` : 'Rate Pain'}
        contentStyle={{ maxWidth: 360, alignSelf: 'center' }}
      >
        <View style={styles.modalBody}>
          <Text style={styles.modalSubtitle}>
            Tap a number (1–10) to map your pain level and color this region on the 3D Body Map:
          </Text>

          {/* Dynamic Color Banner */}
          <View
            style={[
              styles.modalSeverityBanner,
              {
                backgroundColor:
                  tempSeverity >= 7 ? '#FEF2F2' : tempSeverity >= 4 ? '#FFF7ED' : '#FEFCE8',
                borderColor:
                  tempSeverity >= 7 ? '#EF4444' : tempSeverity >= 4 ? '#F97316' : '#EAB308',
              },
            ]}
          >
            <View
              style={[
                styles.modalSeverityDot,
                {
                  backgroundColor:
                    tempSeverity >= 7 ? '#EF4444' : tempSeverity >= 4 ? '#F97316' : '#EAB308',
                },
              ]}
            />
            <Text
              style={[
                styles.modalSeverityTitle,
                {
                  color:
                    tempSeverity >= 7 ? '#DC2626' : tempSeverity >= 4 ? '#C2410C' : '#A16207',
                },
              ]}
            >
              Level {tempSeverity}/10 •{' '}
              {tempSeverity >= 7
                ? 'Severe (Red)'
                : tempSeverity >= 4
                ? 'Moderate (Orange)'
                : 'Mild (Yellow)'}
            </Text>
          </View>

          {/* 1 - 10 Quick Select Grid / Row */}
          <View style={styles.modalGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isSelected = tempSeverity === num;
              const numColor = num >= 7 ? '#EF4444' : num >= 4 ? '#F97316' : '#EAB308';
              return (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.modalNumBtn,
                    { borderColor: numColor },
                    isSelected && { backgroundColor: numColor },
                  ]}
                  onPress={() => handleSetPartSeverity(num)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalNumText,
                      { color: isSelected ? '#FFFFFF' : numColor },
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Color Scale Legend */}
          <View style={styles.modalLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
              <Text style={styles.legendText}>1–3 Mild (Yellow)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
              <Text style={styles.legendText}>4–6 Moderate (Orange)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>7–10 Severe (Red)</Text>
            </View>
          </View>

          {/* Notes Input */}
          <Text style={styles.notesLabel}>Optional Notes (e.g. throbbing, sharp, constant):</Text>
          <TextInput
            style={styles.modalNotesInput}
            placeholder="Describe the sensation..."
            placeholderTextColor="#94A3B8"
            value={tempNotes}
            onChangeText={(text) => {
              setTempNotes(text);
              if (activePart) {
                setPainLogs((prev) =>
                  prev.map((l) => (l.bodyPartId === activePart ? { ...l, notes: text } : l))
                );
              }
            }}
          />

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <Button
              label={`Save & View on Map (${tempSeverity}/10)`}
              onPress={() => setIsSeverityModalOpen(false)}
              variant="primary"
              style={{ flex: 1 }}
            />
            {activePart && (
              <TouchableOpacity
                style={styles.modalClearBtn}
                onPress={() => {
                  handleRemovePart(activePart);
                  setIsSeverityModalOpen(false);
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.modalClearBtnText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
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
  // Inline Instant Pain Level Selector Styles
  inlinePainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing[4],
    marginTop: Spacing[3],
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
    gap: 10,
  },
  inlinePainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlinePainTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  inlineSeverityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  inlineSeverityPillText: {
    fontSize: 10.5,
    fontWeight: FontWeight.bold,
  },
  removePartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  removePartBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#EF4444',
  },
  numberRowLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  inlineNumBtn: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  inlineNumText: {
    fontSize: 12,
    fontWeight: '800',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  tapPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 12,
    padding: Spacing[3],
    marginTop: Spacing[3],
  },
  tapPromptText: {
    flex: 1,
    fontSize: 11.5,
    color: '#0F766E',
    lineHeight: 16,
  },
  modalBody: {
    padding: Spacing[4],
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 19,
    marginBottom: Spacing[3],
  },
  modalSeverityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: Spacing[4],
  },
  modalSeverityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalSeverityTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  modalNumBtn: {
    width: 54,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    ...Shadows.xs,
  },
  modalNumText: {
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  modalLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    marginBottom: Spacing[4],
  },
  notesLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  modalNotesInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    backgroundColor: '#F8FAFC',
    marginBottom: Spacing[4],
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalClearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  modalClearBtnText: {
    color: '#EF4444',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});
