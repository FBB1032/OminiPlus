import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';
import { usePatientHome } from '../../hooks/usePatient';
import { useAuth } from '../../hooks/useAuth';
import { useChronicDiseaseStore } from '../../store/chronicDiseaseStore';
import { aiApi } from '../../api/ai';
import { AIDisclaimerBanner } from '../../components/common/AIDisclaimerBanner';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  customComponent?: 'symptomCheckerBodyArea' | 'symptomCheckerSeverity' | 'symptomCheckerAssociated' | 'symptomCheckerResults' | 'aiDoctorRouting' | 'vitalsChartCard';
  customData?: any;
}

const TOP_DOCTORS_DATABASE = [
  {
    id: '1',
    name: 'Dr. Folake Ademola',
    specialty: 'Cardiologist',
    rating: 4.9,
    reviewsCount: 128,
    hospital: 'Omini Pulse Heart Center (Lagos)',
    experienceYears: 12,
    consultFee: 15000,
    topFeedback: 'Very thorough and explained cardiac vitals clearly.',
  },
  {
    id: '2',
    name: 'Dr. Tunde Adewale',
    specialty: 'Neurologist',
    rating: 4.8,
    reviewsCount: 96,
    hospital: 'Omini Pulse Neuroscience Institute (Abuja)',
    experienceYears: 15,
    consultFee: 20000,
    topFeedback: 'Got a proper diagnosis after years. Exceptional care.',
  },
  {
    id: '3',
    name: 'Dr. Amina Bello',
    specialty: 'Gastroenterologist',
    rating: 4.9,
    reviewsCount: 112,
    hospital: 'Lagos University Teaching Hospital (LUTH)',
    experienceYears: 10,
    consultFee: 18000,
    topFeedback: 'Gentle, attentive, and very detailed digestive treatment.',
  },
];

const SUGGESTIONS = [
  'Start Symptom Checker',
  'Scan Prescription / Lab Report (OCR)',
  'Recommend Top 3 Specialists for my symptoms',
  'Summarize my Medical Records & Vitals',
  'Set Medication Reminder',
  'Explain side effects of Metformin',
];

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
];

const getMedicalResponse = (query: string, vitals?: any): string => {
  const q = query.toLowerCase();

  // 1. Emergency Red Alert Protocol (Chest Pain, Myocardial Infarction, Acute Stroke, Respiratory Distress)
  if (
    q.includes('chest pain') ||
    q.includes('heart attack') ||
    q.includes('can\'t breathe') ||
    q.includes('cant breathe') ||
    q.includes('shortness of breath') ||
    q.includes('stroke') ||
    q.includes('unconscious') ||
    q.includes('crushing chest')
  ) {
    return (
      "**[CRITICAL EMERGENCY ALERT — IMMEDIATE ACTION REQUIRED]**\n\n" +
      "Your reported symptoms indicate an acute cardiovascular, neurological, or respiratory emergency that cannot wait for a routine chat.\n\n" +
      "**Immediate Emergency Steps:**\n" +
      "1. **Seek Emergency Care**: Call national emergency dispatch (112) or proceed to the nearest hospital emergency department immediately.\n" +
      "2. **Sit Upright**: Do not lie flat; sit upright in a comfortable position and loosen tight collar or waistbands.\n" +
      "3. **Chest Pressure**: If crushing pain is radiating to your left arm or jaw, and you have no known aspirin allergy or stomach ulcer, chew one 300mg soluble Aspirin tablet.\n" +
      "4. **Stroke Warning**: If experiencing facial droop, arm weakness, or slurred speech, note the exact time symptoms began. Rapid clinical thrombolysis within 3–4.5 hours is critical.\n" +
      "5. **Do Not Drive**: Have someone drive you or wait for an ambulance.\n\n" +
      "Tap 'Book Specialist' or visit our Emergency Blood / Hospital section if emergency admission is required."
    );
  }

  // 2. Sickle Cell Disorder — Vaso-Occlusive Pain Crisis Protocol
  if (
    q.includes('sickle cell') ||
    q.includes('crisis') ||
    q.includes('hbss') ||
    q.includes('bone pain') ||
    q.includes('sickling')
  ) {
    return (
      "**[SICKLE CELL VASO-OCCLUSIVE CRISIS PROTOCOL]**\n\n" +
      "Severe bone or joint pain in sickle cell disease indicates microvascular occlusion caused by sickled red blood cells:\n\n" +
      "• **Aggressive Hydration**: Drink 3 to 4 liters of warm water or oral rehydration solution today. Fluid expansion reduces blood viscosity and relieves sickling.\n" +
      "• **Warmth**: Keep affected joints and extremities warm with blankets or warm compresses. **Never apply ice or cold water**, as cold causes vasoconstriction and triggers further crisis.\n" +
      "• **Analgesia**: Take your prescribed pain management medication promptly (e.g. Paracetamol or prescribed NSAID for mild crisis; physician-directed analgesia for moderate to severe pain).\n" +
      "• **Red Flags for Emergency Admission**: Chest pain with fever or cough (Acute Chest Syndrome), breathlessness, severe pallor (aplastic/sequestration crisis), or unmanageable pain (>7/10) require immediate emergency department presentation.\n\n" +
      "Would you like to review emergency blood donors or schedule an urgent Hematologist consultation?"
    );
  }

  // 3. Febrile Illness — Malaria & Typhoid Protocol
  if (
    q.includes('malaria') ||
    q.includes('typhoid') ||
    q.includes('chills') ||
    q.includes('rigor') ||
    q.includes('fever and body pain')
  ) {
    return (
      "**[FEBRILE ILLNESS & MALARIA / TYPHOID ASSESSMENT]**\n\n" +
      "Cyclical fever, rigors (shivering), headaches, joint pains, and dark urine are hallmark symptoms of endemic malaria in Nigeria:\n\n" +
      "1. **Test Before Treating**: Always confirm with a Rapid Diagnostic Test (mRDT) or Thick Blood Film microscopy before taking antimalarial therapy.\n" +
      "2. **First-Line Regimen**: For confirmed uncomplicated Plasmodium falciparum, WHO and Nigerian FMOH guidelines recommend quality-assured Artemisinin-based Combination Therapy (ACT), such as Artemether-Lumefantrine taken with fatty food for optimal absorption.\n" +
      "3. **Symptom Control**: Paracetamol (500mg–1000mg up to 4 times daily) helps alleviate fever and joint aches. Drink at least 2.5–3L of fluids daily.\n" +
      "4. **Typhoid Cross-Screening**: If high remittent fever persists beyond 3–4 days despite antimalarials, a Widal test or blood culture is indicated to screen for Salmonella Typhi (Typhoid fever).\n\n" +
      "Please seek urgent clinical evaluation if you experience persistent vomiting, extreme jaundice (yellow eyes), or temperature above 39.5°C."
    );
  }

  // 4. Maternal Health & Preeclampsia Screening
  if (
    q.includes('pregnant') ||
    q.includes('pregnancy') ||
    q.includes('preeclampsia') ||
    q.includes('swollen feet') ||
    q.includes('blurred vision and pregnant')
  ) {
    return (
      "**[MATERNAL HEALTH & PREECLAMPSIA ADVISORY]**\n\n" +
      "In pregnancy (particularly past 20 weeks), sudden facial/hand edema accompanied by severe headache or visual blurring requires urgent obstetric evaluation:\n\n" +
      "• **Immediate Blood Pressure Check**: A reading of ≥140/90 mmHg with proteinuria may indicate preeclampsia, which requires close clinical monitoring to protect maternal and fetal safety.\n" +
      "• **Urinalysis**: Have a clinic test for urinary protein dipstick.\n" +
      "• **Medication Safety**: Avoid OTC NSAIDs (such as Ibuprofen or Aspirin) during pregnancy unless specifically prescribed by your Obstetrician.\n\n" +
      "Please contact your maternity care team or visit an antenatal clinic immediately if you have upper abdominal pain or sudden swelling."
    );
  }

  // 5. Live Vitals Cross-Referencing (Chronic Disease Store)
  const chronicState = useChronicDiseaseStore.getState();
  const latestBp = chronicState.bpReadings?.[0];
  const latestSugar = chronicState.sugarReadings?.[0];

  if (
    q.includes('blood pressure') ||
    q.includes('bp') ||
    q.includes('hypertension') ||
    q.includes('pressure')
  ) {
    let msg = "Hypertension management relies on consistent monitoring, medication adherence, and sodium restriction (<2g daily).\n\n";
    if (latestBp) {
      msg += `**Latest Logged Reading:**\n• **Blood Pressure**: ${latestBp.systolic}/${latestBp.diastolic} mmHg (${latestBp.category})\n• **Heart Rate**: ${latestBp.pulse || 72} bpm\n• **Logged**: ${new Date(latestBp.recordedAt).toLocaleDateString()} at ${new Date(latestBp.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n`;
      if (latestBp.systolic >= 140 || latestBp.diastolic >= 90) {
        msg += "[CLINICAL ADVISORY] Your last recorded reading falls within Stage 1/2 Hypertension. If you have headache or dizziness, take your prescribed antihypertensive medication (e.g. Amlodipine/Lisinopril) and rest.";
      } else {
        msg += "[TARGET ATTAINED] Your blood pressure is in an optimal target range. Continue healthy lifestyle habits and regular medication schedule.";
      }
    } else if (vitals?.bloodPressure) {
      msg += `Your profile records a resting blood pressure of ${vitals.bloodPressure} mmHg. Maintain low-sodium nutrition and regular cardiovascular exercise.`;
    }
    return msg;
  }

  if (
    q.includes('sugar') ||
    q.includes('diabetes') ||
    q.includes('glucose') ||
    q.includes('insulin')
  ) {
    let msg = "Glycemic control is essential for preventing microvascular diabetic complications.\n\n";
    if (latestSugar) {
      msg += `**Latest Glucose Reading:**\n• **Blood Sugar**: ${latestSugar.glucoseLevel} mg/dL (${latestSugar.type})\n• **Category**: ${latestSugar.category}\n• **Logged**: ${new Date(latestSugar.recordedAt).toLocaleDateString()}\n\n`;
      if (latestSugar.glucoseLevel > 180) {
        msg += "[HYPERGLYCEMIA ADVISORY] Your recorded glucose level indicates postprandial hyperglycemia. Check water intake, review meal carbohydrate portion, and ensure adherence to prescribed oral hypoglycemic agents (like Metformin).";
      } else if (latestSugar.glucoseLevel < 70) {
        msg += "**[HYPOGLYCEMIA ALERT]**: A reading below 70 mg/dL requires the 'Rule of 15': ingest 15 grams of fast-acting glucose (half cup fruit juice or 3 sugar cubes) and re-test in 15 minutes.";
      } else {
        msg += "[NORMAL RANGE] Your recorded blood sugar is within the clinically acceptable range.";
      }
    } else {
      msg += "Normal fasting blood glucose ranges between 70–100 mg/dL, and post-meal glucose should remain below 140 mg/dL for non-diabetic adults.";
    }
    return msg;
  }

  // 6. Common Symptoms (Headache, Fatigue, Cough)
  if (
    q.includes('headache') ||
    q.includes('migraine') ||
    q.includes('dizziness') ||
    q.includes('fever') ||
    q.includes('symptom')
  ) {
    let response =
      "A headache can arise from tension, dehydration, ocular strain, or blood pressure fluctuations. \n\n" +
      "**Clinical Guidance:**\n" +
      "• Rest in a quiet, darkened room and drink 500mL of water.\n" +
      "• If accompanied by high fever, stiff neck, or sudden onset thunderclap pain, seek urgent medical attention.\n" +
      "• Would you like to launch the 3D Body Map Symptom Checker for a structured clinical analysis?";
    if (latestBp) {
      response += `\n\n**Vitals Context**: Your latest recorded blood pressure is ${latestBp.systolic}/${latestBp.diastolic} mmHg.`;
    }
    return response;
  }

  // 7. Drug Information & Interactions
  if (q.includes('metformin') || q.includes('side effect') || q.includes('medication') || q.includes('lisinopril') || q.includes('amlodipine')) {
    let response =
      "**Clinical Medication Overview:**\n\n" +
      "• **Metformin**: An oral biguanide prescribed for Type 2 Diabetes. Improves insulin sensitivity and lowers hepatic glucose production. To prevent common GI side effects (bloating, nausea), always take it during or immediately after meals.\n" +
      "• **Lisinopril / Amlodipine**: Common first-line antihypertensive agents. A dry persistent cough is a recognized class side-effect of ACE inhibitors like Lisinopril, while ankle swelling (peripheral edema) can occur with calcium channel blockers like Amlodipine.\n\n" +
      "Always consult your doctor before modifying medication dosages or stopping prescriptions.";
    if (latestBp) {
      response += `\n\nYour recorded blood pressure is ${latestBp.systolic}/${latestBp.diastolic} mmHg.`;
    }
    return response;
  }

  if (q.includes('interaction') || q.includes('ibuprofen') || q.includes('aspirin')) {
    return (
      "**[DRUG INTERACTION ADVISORY: Ibuprofen + Aspirin]**\n\n" +
      "Combining Ibuprofen with Aspirin is clinically contraindicated in routine practice:\n" +
      "1. **Gastrointestinal Risk**: Both are non-steroidal anti-inflammatory drugs (NSAIDs). Simultaneous use significantly increases the risk of gastric mucosal ulceration, bleeding, and renal injury.\n" +
      "2. **Platelet Blunting**: Ibuprofen reversibly blocks platelet COX-1 and can interfere with low-dose Aspirin's irreversible cardioprotective anti-platelet effect.\n\n" +
      "If you take daily baby Aspirin for cardiovascular protection, discuss safer analgesic alternatives (such as Paracetamol) with your physician."
    );
  }

  // Default Assistant Introduction
  let baseMsg =
    "Hello! I am your Omini Pulse AI Clinical Assistant. I can help you with:\n" +
    "• Step-by-step Symptom Triage via 3D Body Map\n" +
    "• Medication explanations and drug-drug interactions\n" +
    "• Tracking your real-time Blood Pressure and Blood Glucose logs\n" +
    "• Direct specialist booking and emergency blood donor matching\n\n" +
    "How can I assist your health and wellness journey today?";

  if (latestBp || latestSugar) {
    baseMsg += "\n\n**Live Vitals Active**: ";
    if (latestBp) baseMsg += `BP: ${latestBp.systolic}/${latestBp.diastolic} mmHg (${latestBp.category}) `;
    if (latestSugar) baseMsg += `• Blood Sugar: ${latestSugar.glucoseLevel} mg/dL (${latestSugar.type})`;
  }

  return baseMsg;
};

export default function AIChatScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { data: homeData } = usePatientHome();
  const vitals = homeData?.healthSummary;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const conversationIdRef = useRef<string | null>(null);

  // Symptom Checker State in Chat
  const [symptomFlowState, setSymptomFlowState] = useState<'idle' | 'body_area' | 'severity' | 'associated' | 'results'>('idle');
  const [symptomArea, setSymptomArea] = useState<any>(null);
  const [symptomPainLevel, setSymptomPainLevel] = useState<number>(3);
  const [symptomCheckedList, setSymptomCheckedList] = useState<string[]>([]);

  // Voice Mode States
  const [voiceStatus, setVoiceStatus] = useState<'listening' | 'speaking' | 'connecting' | 'idle'>('idle');
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  // Animations
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseAnim3 = useRef(new Animated.Value(1)).current;
  const opacityAnim1 = useRef(new Animated.Value(0.4)).current;
  const opacityAnim2 = useRef(new Animated.Value(0.3)).current;
  const opacityAnim3 = useRef(new Animated.Value(0.2)).current;

  // Typing indicator dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Visualizer frequency bars
  const barAnims = useRef(Array.from({ length: 9 }, () => new Animated.Value(15))).current;

  // Listen to route params from Home screen
  useEffect(() => {
    if (route.params?.startSymptomChecker) {
      navigation.navigate('SymptomChecker');
    }
  }, [route.params?.startSymptomChecker]);

  useEffect(() => {
    if (isTyping) {
      const animateDot = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: -8,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      };

      const a1 = animateDot(dot1, 0);
      const a2 = animateDot(dot2, 150);
      const a3 = animateDot(dot3, 300);

      a1.start();
      a2.start();
      a3.start();

      return () => {
        a1.stop();
        a2.stop();
        a3.stop();
        dot1.setValue(0);
        dot2.setValue(0);
        dot3.setValue(0);
      };
    }
  }, [isTyping]);

  // Voice mode pulsing sonar effect
  useEffect(() => {
    if (isVoiceMode && (voiceStatus === 'listening' || voiceStatus === 'speaking')) {
      const createPulse = (pulse: Animated.Value, opacity: Animated.Value, delay: number) => {
        pulse.setValue(1);
        opacity.setValue(0.5);
        
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(pulse, {
                toValue: 2.8,
                duration: 2000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
      };

      const p1 = createPulse(pulseAnim1, opacityAnim1, 0);
      const p2 = createPulse(pulseAnim2, opacityAnim2, 600);
      const p3 = createPulse(pulseAnim3, opacityAnim3, 1200);

      p1.start();
      p2.start();
      p3.start();

      // Start frequency bar animations
      const barTimings = barAnims.map((bar) => {
        const minVal = 10;
        const maxVal = voiceStatus === 'listening' ? 45 : 70;
        const duration = 150 + Math.random() * 250;
        
        const singleCycle = Animated.sequence([
          Animated.timing(bar, {
            toValue: minVal + Math.random() * (maxVal - minVal),
            duration,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 10 + Math.random() * 15,
            duration,
            easing: Easing.linear,
            useNativeDriver: false,
          })
        ]);

        return Animated.loop(singleCycle);
      });

      Animated.parallel(barTimings).start();

      return () => {
        p1.stop();
        p2.stop();
        p3.stop();
        barAnims.forEach(bar => bar.setValue(15));
      };
    }
  }, [isVoiceMode, voiceStatus]);

  const startSymptomCheckerFlow = () => {
    setSymptomFlowState('body_area');
    setSymptomArea(null);
    setSymptomPainLevel(3);
    setSymptomCheckedList([]);

    const welcomeMsg: Message = {
      id: `symptom-welcome-${Date.now()}`,
      text: "Let's start your AI Symptom Checker. First, where is the discomfort located? Select a primary area below:",
      isUser: false,
      timestamp: new Date(),
      customComponent: 'symptomCheckerBodyArea',
    };

    setMessages([welcomeMsg]);
  };

  const handleChatAreaSelect = (area: any) => {
    setSymptomArea(area);
    setSymptomFlowState('severity');

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      text: `${area.name}`,
      isUser: true,
      timestamp: new Date(),
    };

    const nextPrompt: Message = {
      id: `msg-${Date.now() + 1}`,
      text: `Got it, ${area.name}. Next, on a scale of 1 to 10, how severe is the pain or discomfort?`,
      isUser: false,
      timestamp: new Date(),
      customComponent: 'symptomCheckerSeverity',
    };

    setMessages((prev) => [...prev, userMsg, nextPrompt]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleChatSeveritySelect = (level: number) => {
    setSymptomPainLevel(level);
    setSymptomFlowState('associated');

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      text: `Pain Severity: ${level}/10`,
      isUser: true,
      timestamp: new Date(),
    };

    const nextPrompt: Message = {
      id: `msg-${Date.now() + 1}`,
      text: 'Almost done. Are you experiencing any of these associated symptoms? Select all that apply:',
      isUser: false,
      timestamp: new Date(),
      customComponent: 'symptomCheckerAssociated',
    };

    setMessages((prev) => [...prev, userMsg, nextPrompt]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleChatCheckboxToggle = (symptom: string) => {
    if (symptomCheckedList.includes(symptom)) {
      setSymptomCheckedList(symptomCheckedList.filter((s) => s !== symptom));
    } else {
      setSymptomCheckedList([...symptomCheckedList, symptom]);
    }
  };

  const handleChatSymptomsSubmit = () => {
    setSymptomFlowState('results');

    const userMsgText = symptomCheckedList.length > 0 
      ? `Selected: ${symptomCheckedList.join(', ')}` 
      : 'No other symptoms';

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      text: userMsgText,
      isUser: true,
      timestamp: new Date(),
    };

    setIsTyping(true);
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    setTimeout(() => {
      setIsTyping(false);
      const diagResult = calculateDiagnosis();
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        text: 'Here is your AI symptom analysis assessment:',
        isUser: false,
        timestamp: new Date(),
        customComponent: 'symptomCheckerResults',
        customData: diagResult,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  const calculateDiagnosis = () => {
    if (!symptomArea) return { diagnosis: 'Unknown Condition', level: 'Mild', color: '#3B82F6', description: 'N/A', recommendation: 'N/A', spec: 'GP' };

    if (symptomArea.id === 'chest') {
      if (symptomPainLevel > 6) {
        return {
          diagnosis: 'Acute Chest Pain / Angina Risk',
          level: 'High Alert',
          color: '#EF4444',
          description: 'Chest discomfort accompanied by heavy pressure could indicate cardiovascular strain.',
          recommendation: 'Seek medical attention immediately. Please consult a Cardiologist as soon as possible.',
          spec: 'Cardiologist',
        };
      } else {
        return {
          diagnosis: 'Minor Chest Discomfort / Heartburn',
          level: 'Moderate',
          color: '#F59E0B',
          description: 'Mild pain or burning sensation in the chest area, possibly related to acidity or acid reflux.',
          recommendation: 'Monitor symptoms. Avoid heavy foods. Schedule a consultation if it persists.',
          spec: 'Cardiologist',
        };
      }
    }

    if (symptomArea.id === 'head') {
      if (symptomCheckedList.includes('Fever / Chills')) {
        return {
          diagnosis: 'Acute Sinusitis or Flu Infection',
          level: 'Moderate',
          color: '#F59E0B',
          description: 'Head congestion accompanied by fever is commonly caused by upper respiratory tract infections.',
          recommendation: 'Rest, hydrate, and book a consultation with a General Practitioner.',
          spec: 'General Practitioner',
        };
      } else {
        return {
          diagnosis: 'Tension / Migraine Headache',
          level: 'Mild',
          color: '#3B82F6',
          description: 'Localized throbbing or pressure around the temples, neck, or forehead.',
          recommendation: 'Rest in a quiet room, avoid bright screens, and seek clinical advice.',
          spec: 'General Practitioner',
        };
      }
    }

    if (symptomArea.id === 'abdomen') {
      return {
        diagnosis: 'Gastrointestinal Dyspepsia',
        level: 'Moderate',
        color: '#F59E0B',
        description: 'Abdominal pain, bloating, or stomach ache possibly related to indigestion.',
        recommendation: 'Consult a Gastroenterologist for a digestive health evaluation.',
        spec: 'Gastroenterologist',
      };
    }

    if (symptomArea.id === 'limbs') {
      return {
        diagnosis: 'Musculoskeletal Strain',
        level: 'Mild',
        color: '#3B82F6',
        description: 'Mild muscle soreness or ligament stress, likely related to physical exertion.',
        recommendation: 'Apply ice, rest the affected limb, and consult an Orthopedic doctor if pain worsens.',
        spec: 'Orthopedics',
      };
    }

    return {
      diagnosis: 'Common Viral Infection / Fatigue',
      level: 'Mild',
      color: '#3B82F6',
      description: 'Generalized fatigue or chills often associated with viral syndromes.',
      recommendation: 'Drink warm fluids, monitor temperature, and consult a General Practitioner.',
      spec: 'General Practitioner',
    };
  };

  const handleTriggerDoctorRouting = (specialty?: string) => {
    setIsTyping(true);
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      text: `Yes, please search and route me to the top 3 doctors for ${specialty || 'my health complaint'}.`,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        text: `I have analyzed our verified provider network and routed you to the Top 3 highest-rated ${specialty || 'specialists'} based on verified patient reviews and feedback ratings:`,
        isUser: false,
        timestamp: new Date(),
        customComponent: 'aiDoctorRouting',
      };
      setMessages((prev) => [...prev, aiResponse]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1200);
  };

  const handleOCRScan = () => {
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      text: '[OCR Scan Uploaded] Prescription / Lab Report document image.',
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const ocrSummary = "I have analyzed your uploaded clinical document:\n\n• **Document**: Clinical E-Prescription & Lab Report\n• **Extracted Medications**: Amoxicillin 500mg (3x daily), Paracetamol 500mg (as needed)\n• **Extracted Findings**: Hemoglobin 13.5 g/dL and Fasting Glucose 95 mg/dL (both normal)\n\nAll extracted values have been cross-referenced with your EHR. Would you like me to schedule medication alarms for Amoxicillin?";
      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        text: ocrSummary,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    if (text.trim() === 'Start Symptom Checker' || text.toLowerCase().includes('symptom checker')) {
      navigation.navigate('SymptomChecker');
      setInputText('');
      return;
    }

    if (text.includes('OCR') || text.includes('Scan Prescription') || text.includes('Lab Report')) {
      handleOCRScan();
      setInputText('');
      return;
    }

    if (text.includes('Medication Reminder') || text.includes('Set Medication')) {
      navigation.navigate('MedicationReminders');
      setInputText('');
      return;
    }

    if (text.includes('Top 3 Specialists') || text.includes('Recommend Top 3')) {
      handleTriggerDoctorRouting('Cardiologist');
      setInputText('');
      return;
    }

    if (text.includes('Summarize') || text.includes('Medical Records')) {
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        text,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        const summaryText = `Here is a summary of your recent health profile and vitals:\n\n• **Blood Pressure**: ${vitals?.bloodPressure || '120/80'} mmHg (Optimal)\n• **Heart Rate**: ${vitals?.heartRate || '72'} bpm (Normal Sinus Rhythm)\n• **Active Prescriptions**: 2 medications logged\n• **Lab Tests**: All recent blood work within normal limits\n\nYour overall health index is strong. Here is your visual vitals snapshot:`;
        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          text: summaryText,
          isUser: false,
          timestamp: new Date(),
          customComponent: 'vitalsChartCard',
          customData: {
            bp: vitals?.bloodPressure || '120/80',
            hr: vitals?.heartRate || '72',
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1500);
      setInputText('');
      return;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Live AI assistant (https://ominipulse.onrender.com/api/ai/chat) with
    // the local rule-based response as offline fallback.
    const chatHistory = [...messages, userMsg]
      .filter((m) => !m.customComponent)
      .slice(-12)
      .map((m) => ({ role: m.isUser ? ('user' as const) : ('assistant' as const), content: m.text }));

    (async () => {
      let replyText: string;
      try {
        const result = await aiApi.chat(conversationIdRef.current, chatHistory);
        conversationIdRef.current = result.conversationId;
        replyText = result.reply;
      } catch {
        replyText = getMedicalResponse(text, vitals);
      }

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        text: replyText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    })();
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSend(suggestion);
  };

  const startVoiceMode = () => {
    setIsVoiceMode(true);
    setVoiceStatus('connecting');
    setVoiceTranscription('');
    setVoiceResponse('');

    setTimeout(() => {
      setVoiceStatus('listening');
      setVoiceTranscription('Tap center mic to speak your query...');
    }, 1500);
  };

  const handleVoiceMicTap = () => {
    if (voiceStatus === 'listening') {
      setVoiceStatus('connecting');
      setVoiceTranscription('Transcribing: "How can I lower my blood pressure naturally?"');

      setTimeout(() => {
        setVoiceStatus('speaking');
        setVoiceTranscription('"How can I lower my blood pressure naturally?"');
        
        const fullResponse = "To lower your blood pressure naturally: reduce sodium intake under 2,000 mg daily, adopt a heart-healthy diet, exercise 150 minutes per week, and practice deep breathing exercises daily. Since your BP vitals show prehypertension, this will be highly beneficial.";
        
        let currentText = '';
        const words = fullResponse.split(' ');
        let wordIndex = 0;
        
        const interval = setInterval(() => {
          if (wordIndex < words.length) {
            currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
            setVoiceResponse(currentText);
            wordIndex++;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setVoiceStatus('listening');
              setVoiceResponse('');
              setVoiceTranscription('Answered. Ask another query, or tap close.');
            }, 3000);
          }
        }, 180);
      }, 1800);
    }
  };

  const closeVoiceMode = () => {
    setIsVoiceMode(false);
    setVoiceStatus('idle');
  };

  const renderFormattedMessage = (text: string, isUser: boolean) => {
    if (isUser) {
      return <Text style={[styles.messageText, styles.userText]}>{text}</Text>;
    }

    // Split text by double newlines into distinct paragraphs
    const paragraphs = text.split('\n\n');

    return (
      <View style={styles.formattedContainer}>
        {paragraphs.map((para, pIdx) => {
          const lines = para.split('\n');
          return (
            <View key={pIdx} style={pIdx > 0 ? { marginTop: 8 } : undefined}>
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
                const cleanText = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : trimmed;

                // Split text by bold markers (**bold**)
                const parts = cleanText.split(/(\*\*.*?\*\*)/g);

                return (
                  <View
                    key={lIdx}
                    style={[
                      styles.formattedLine,
                      isBullet && styles.formattedBulletLine,
                      lIdx > 0 && !isBullet && { marginTop: 4 },
                    ]}
                  >
                    {isBullet && <View style={styles.formattedBulletDot} />}
                    <Text style={[styles.messageText, styles.aiText, { flex: 1, flexWrap: 'wrap' }]}>
                      {parts.map((part, partIdx) => {
                        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                          const boldContent = part.slice(2, -2);
                          return (
                            <Text key={partIdx} style={styles.boldText}>
                              {boldContent}
                            </Text>
                          );
                        }
                        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                          const italicContent = part.slice(1, -1);
                          return (
                            <Text key={partIdx} style={styles.italicText}>
                              {italicContent}
                            </Text>
                          );
                        }
                        return <Text key={partIdx}>{part}</Text>;
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const formattedTime = item.timestamp.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.messageRow, item.isUser ? styles.userRow : styles.aiRow]}>
        {!item.isUser && (
          <View style={styles.aiAvatarWrapper}>
            <View style={styles.aiAvatar}>
              <Ionicons name="leaf-outline" size={16} color="#FFFFFF" />
            </View>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            item.isUser ? styles.userBubble : styles.aiBubble,
            !item.isUser &&
              (item.text.length > 50 || Boolean(item.customComponent) || item.text.includes('\n')) &&
              styles.aiBubbleWide,
            item.customComponent === 'symptomCheckerResults' && { width: '92%', maxWidth: '92%' },
          ]}
        >
          {renderFormattedMessage(item.text, item.isUser)}

          {/* Inline Symptom Checker Area selection */}
          {item.customComponent === 'symptomCheckerBodyArea' && (
            <View style={styles.chatAreaList}>
              {BODY_AREAS.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  style={[styles.chatAreaCard, { backgroundColor: area.bg }]}
                  onPress={() => handleChatAreaSelect(area)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={area.icon as any} size={16} color={area.color} />
                  <Text style={[styles.chatAreaName, { color: area.color }]}>{area.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Inline Pain Scale selector */}
          {item.customComponent === 'symptomCheckerSeverity' && (
            <View style={styles.chatPainScaleContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                const getScaleColor = () => {
                  if (level <= 3) return '#10B981';
                  if (level <= 6) return '#F59E0B';
                  return '#EF4444';
                };
                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() => handleChatSeveritySelect(level)}
                    style={[styles.chatPainScaleButton, { backgroundColor: getScaleColor() }]}
                  >
                    <Text style={styles.chatPainScaleText}>{level}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Inline Associated Checklist */}
          {item.customComponent === 'symptomCheckerAssociated' && (
            <View style={styles.chatCheckboxContainer}>
              {ADDITIONAL_SYMPTOMS.map((symptom) => {
                const isSelected = symptomCheckedList.includes(symptom);
                return (
                  <TouchableOpacity
                    key={symptom}
                    onPress={() => handleChatCheckboxToggle(symptom)}
                    style={[styles.chatCheckboxItem, isSelected && styles.chatCheckboxItemActive]}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={16}
                      color={isSelected ? Colors.secondary[600] : Colors.neutral[400]}
                    />
                    <Text style={[styles.chatCheckboxLabel, isSelected && styles.chatCheckboxLabelActive]}>
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.chatSubmitBtn}
                onPress={handleChatSymptomsSubmit}
              >
                <Text style={styles.chatSubmitBtnText}>Submit Symptoms</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Inline Diagnostic Results */}
          {item.customComponent === 'symptomCheckerResults' && item.customData && (
            <View style={styles.chatResultsContainer}>
              <View style={[styles.chatResultCard, { borderColor: item.customData.color }]}>
                <View style={styles.chatResultHeader}>
                  <Text style={styles.chatResultDiagLabel}>Potential Cause</Text>
                  <View style={[styles.chatBadge, { backgroundColor: item.customData.color }]}>
                    <Text style={styles.chatBadgeText}>{item.customData.level}</Text>
                  </View>
                </View>
                <Text style={styles.chatResultDiagnosis}>{item.customData.diagnosis}</Text>
                <Text style={styles.chatResultDesc}>{item.customData.description}</Text>
              </View>
              <View style={styles.chatRecommendation}>
                <Text style={styles.chatRecommendationTitle}>Clinical Advisory</Text>
                <Text style={styles.chatRecommendationText}>{item.customData.recommendation}</Text>
              </View>
              <TouchableOpacity
                style={[styles.chatBookBtn, { backgroundColor: item.customData.color }]}
                onPress={() => handleTriggerDoctorRouting(item.customData.spec)}
              >
                <Ionicons name="compass-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.chatBookBtnText}>Route Me to Top 3 {item.customData.spec}s</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Inline AI Doctor Routing Recommendations */}
          {item.customComponent === 'aiDoctorRouting' && (
            <View style={{ gap: 10, marginTop: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A' }}>
                Top 3 Matched Specialists (Ranked by Patient Feedback):
              </Text>

              {TOP_DOCTORS_DATABASE.map((doc, idx) => (
                <View key={doc.id} style={{
                  backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12,
                  borderWidth: 1, borderColor: '#E2E8F0', gap: 8
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF',
                      alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DBEAFE'
                    }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#2563EB' }}>{doc.name[4]}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#0F172A' }}>{doc.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Ionicons name="star" size={11} color="#F59E0B" />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#D97706' }}>{doc.rating}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 11, color: '#64748B' }}>{doc.specialty} • {doc.hospital}</Text>
                    </View>
                  </View>

                  {/* Patient Feedback Snippet */}
                  <View style={{ backgroundColor: '#F8FAFC', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' }}>
                    <Text style={{ fontSize: 10.5, color: '#475569', fontStyle: 'italic' }}>
                      "{doc.topFeedback}"
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1, backgroundColor: '#2563EB', paddingVertical: 8, borderRadius: 8,
                        alignItems: 'center', justifyContent: 'center'
                      }}
                      onPress={() => navigation.navigate('BookAppointment', { doctorId: doc.id })}
                    >
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#FFFFFF' }}>Book Now (₦{doc.consultFee.toLocaleString()})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flex: 1, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1',
                        paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center'
                      }}
                      onPress={() => navigation.navigate('DoctorProfile', { doctorId: doc.id })}
                    >
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#334155' }}>View Profile & Reviews</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Inline Visual Vitals Snapshot & Metric Card */}
          {item.customComponent === 'vitalsChartCard' && (
            <View style={styles.chatVitalsCard}>
              <View style={styles.chatVitalsCardHeader}>
                <Ionicons name="stats-chart" size={15} color={Colors.patient} />
                <Text style={styles.chatVitalsCardTitle}>Vitals Snapshot & Metric Index</Text>
              </View>

              <View style={styles.chatVitalsGrid}>
                <View style={styles.chatVitalBox}>
                  <Text style={styles.chatVitalBoxLabel}>Blood Pressure</Text>
                  <Text style={styles.chatVitalBoxValue}>{item.customData?.bp || '120/80'}</Text>
                  <View style={[styles.chatVitalBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.chatVitalBadgeText, { color: '#059669' }]}>Optimal</Text>
                  </View>
                </View>

                <View style={styles.chatVitalBox}>
                  <Text style={styles.chatVitalBoxLabel}>Heart Rate</Text>
                  <Text style={styles.chatVitalBoxValue}>
                    {item.customData?.hr || '72'}{' '}
                    <Text style={{ fontSize: 9.5, fontWeight: 'normal', color: Colors.text.secondary }}>bpm</Text>
                  </Text>
                  <View style={[styles.chatVitalBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.chatVitalBadgeText, { color: '#059669' }]}>Normal</Text>
                  </View>
                </View>

                <View style={styles.chatVitalBox}>
                  <Text style={styles.chatVitalBoxLabel}>Health Index</Text>
                  <Text style={[styles.chatVitalBoxValue, { color: Colors.patient }]}>
                    94{' '}
                    <Text style={{ fontSize: 9.5, fontWeight: 'normal', color: Colors.text.secondary }}>/100</Text>
                  </Text>
                  <View style={[styles.chatVitalBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.chatVitalBadgeText, { color: '#2563EB' }]}>Strong</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.chatVitalsViewMoreBtn}
                onPress={() => navigation.navigate('MedicalRecords')}
                activeOpacity={0.8}
              >
                <Text style={styles.chatVitalsViewMoreText}>View Full Medical Records & Chart</Text>
                <Ionicons name="arrow-forward" size={12} color={Colors.patient} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.timestampText, item.isUser ? styles.userTime : styles.aiTime]}>
            {formattedTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Omini Pulse AI Assistant</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(15, 110, 110, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
            <Ionicons name="shield-checkmark" size={10} color="#0F6E6E" />
            <Text style={{ fontSize: 9, color: '#0F6E6E', fontWeight: 'bold' }}>NDPA</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Medical AI Companion • Online</Text>
      </View>

      {/* ── Legal Medical Disclaimer Banner ─────────────────────────────── */}
      <AIDisclaimerBanner />


      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.welcomeContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            <View style={styles.welcomeIconContainer}>
              <View style={styles.welcomeIconGlow} />
              <View style={styles.welcomeIconBg}>
                <Ionicons name="leaf-outline" size={48} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.welcomeTitle}>Omini Pulse AI Consult</Text>
            <Text style={styles.welcomeSubtitle}>
              Your intelligent clinical assistant. Get instant, clinical-grade guidance on symptoms, drug dosages, pill identification, and medical records.
            </Text>

            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.patient} />
              <Text style={styles.infoCardText}>
                Answers are backed by medical databases. Interactions are fully encrypted and private.
              </Text>
            </View>

            {/* Feeling Unwell / Symptom Checker Banner inside AI Assistant */}
            <TouchableOpacity
              style={styles.aiSymptomBanner}
              onPress={() => navigation.navigate('SymptomChecker')}
              activeOpacity={0.8}
            >
              <View style={styles.aiSymptomIconBg}>
                <Ionicons name="medical" size={20} color="#10B981" />
              </View>
              <View style={styles.aiSymptomTexts}>
                <Text style={styles.aiSymptomTitle}>Feeling unwell?</Text>
                <Text style={styles.aiSymptomSubtitle}>Start the AI Symptom Checker for analysis</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#10B981" />
            </TouchableOpacity>

            {/* Vitals reference */}
            {vitals && (() => {
              const height = user?.height || vitals.height || 170;
              const weight = user?.weight || vitals.weight || 70;
              const bmiVal = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
              return (
                <View style={styles.aiVitalsContainer}>
                  <Text style={styles.aiVitalsHeader}>Your Vitals Reference</Text>
                  <View style={styles.aiVitalsRow}>
                    <View style={styles.aiVitalItem}>
                      <Text style={styles.aiVitalVal}>{vitals.bloodPressure}</Text>
                      <Text style={styles.aiVitalLbl}>BP (mmHg)</Text>
                    </View>
                    <View style={styles.aiVitalItem}>
                      <Text style={styles.aiVitalVal}>{vitals.heartRate}</Text>
                      <Text style={styles.aiVitalLbl}>HR (bpm)</Text>
                    </View>
                    <View style={styles.aiVitalItem}>
                      <Text style={styles.aiVitalVal}>{weight}kg</Text>
                      <Text style={styles.aiVitalLbl}>Weight</Text>
                    </View>
                    <View style={styles.aiVitalItem}>
                      <Text style={styles.aiVitalVal}>{bmiVal}</Text>
                      <Text style={styles.aiVitalLbl}>BMI</Text>
                    </View>
                  </View>
                </View>
              );
            })()}

            <Text style={styles.suggestionsHeader}>Frequently Asked Questions</Text>
            <View style={styles.suggestionsGrid}>
              {SUGGESTIONS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.patient} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatListContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingRow}>
                  <View style={styles.aiAvatarWrapper}>
                    <View style={styles.aiAvatar}>
                      <Ionicons name="leaf-outline" size={16} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.typingBubble}>
                    <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
                    <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
                    <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Input Toolbar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.voiceBtn}
            onPress={startVoiceMode}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.voiceBtn, { backgroundColor: '#10B981', marginRight: 4 }]}
            onPress={handleOCRScan}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.inputFieldWrapper}>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              placeholder="Type message or medical query..."
              placeholderTextColor={Colors.text.secondary}
              value={inputText}
              onChangeText={setInputText}
              multiline={false}
              onSubmitEditing={() => handleSend(inputText)}
            />
            {inputText.trim().length > 0 && (
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => handleSend(inputText)}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={18} color={Colors.patient} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Voice Assistant Overlay */}
      {isVoiceMode && (
        <View style={styles.voiceOverlay}>
          <View style={styles.voiceHeader}>
            <TouchableOpacity style={styles.voiceCloseBtn} onPress={closeVoiceMode}>
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.voiceHeaderTitle}>Omini Pulse AI Voice</Text>
            <View style={styles.voiceHeaderRight}>
              <Ionicons name="volume-high" size={22} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.voiceBody}>
            <Text style={styles.voiceStatusText}>
              {voiceStatus === 'connecting' && 'INITIALIZING AI VOICE...'}
              {voiceStatus === 'listening' && 'LISTENING FOR AUDIO...'}
              {voiceStatus === 'speaking' && 'OMINI PULSE AI IS SPEAKING...'}
            </Text>

            <View style={styles.sonarContainer}>
              {(voiceStatus === 'listening' || voiceStatus === 'speaking') && (
                <>
                  <Animated.View
                    style={[
                      styles.sonarRing,
                      {
                        opacity: opacityAnim1,
                        transform: [{ scale: pulseAnim1 }],
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.sonarRing,
                      {
                        opacity: opacityAnim2,
                        transform: [{ scale: pulseAnim2 }],
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.sonarRing,
                      {
                        opacity: opacityAnim3,
                        transform: [{ scale: pulseAnim3 }],
                      },
                    ]}
                  />
                </>
              )}
              
              <TouchableOpacity
                style={[
                  styles.sonarCenter,
                  voiceStatus === 'speaking' && styles.sonarCenterSpeaking,
                  voiceStatus === 'connecting' && styles.sonarCenterConnecting,
                ]}
                onPress={handleVoiceMicTap}
                activeOpacity={0.9}
              >
                {voiceStatus === 'connecting' ? (
                  <Ionicons name="hourglass-outline" size={48} color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name={voiceStatus === 'speaking' ? 'volume-high-outline' : 'mic-outline'}
                    size={48}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.visualizer}>
              {barAnims.map((bar, i) => (
                <Animated.View
                  key={i}
                  style={[
                     styles.visualizerBar,
                    {
                      height: bar,
                      backgroundColor: voiceStatus === 'speaking' ? '#10B981' : Colors.patient,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.transcriptBox}>
              <ScrollView
                style={styles.transcriptScrollView}
                contentContainerStyle={styles.transcriptContent}
                ref={(ref) => ref?.scrollToEnd({ animated: true })}
              >
                {voiceTranscription ? (
                  <View style={styles.transUserRow}>
                    <Text style={styles.transUserLabel}>You</Text>
                    <Text style={styles.transUserText}>{voiceTranscription}</Text>
                  </View>
                ) : null}

                {voiceResponse ? (
                  <View style={styles.transAiRow}>
                    <Text style={styles.transAiLabel}>Omini Pulse AI</Text>
                    <Text style={styles.transAiText}>{voiceResponse}</Text>
                  </View>
                ) : null}
              </ScrollView>
            </View>
          </View>

          <View style={styles.voiceFooter}>
            <Text style={styles.voiceFooterText}>
              {voiceStatus === 'connecting' && 'Establishing secure encrypted audio bridge...'}
              {voiceStatus === 'listening' && 'Tap the microphone to simulate speaking a question.'}
              {voiceStatus === 'speaking' && 'Simulating text-to-speech rendering.'}
            </Text>
          </View>
        </View>
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
    paddingHorizontal: Spacing[6],
    paddingTop: Platform.OS === 'ios' ? Spacing[2] : Spacing[4],
    paddingBottom: Spacing[4],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    paddingLeft: 16,
  },
  keyboardView: {
    flex: 1,
  },
  welcomeContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[8],
  },
  welcomeIconContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  welcomeIconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
  welcomeIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.patient,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  welcomeTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  welcomeSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing[6],
    paddingHorizontal: Spacing[2],
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.1)',
    marginBottom: Spacing[8],
    width: '100%',
  },
  infoCardText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginLeft: Spacing[3],
    lineHeight: 18,
  },
  suggestionsHeader: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    alignSelf: 'flex-start',
    marginBottom: Spacing[3],
  },
  suggestionsGrid: {
    width: '100%',
    gap: Spacing[3],
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  suggestionText: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
    flex: 1,
    marginRight: Spacing[2],
  },
  chatListContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing[4],
    alignItems: 'flex-end',
    width: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiAvatarWrapper: {
    marginRight: Spacing[2],
    marginBottom: Spacing[1],
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.patient,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: 20,
    ...Shadows.sm,
  },
  userBubble: {
    backgroundColor: Colors.patient,
    borderBottomRightRadius: 4,
    maxWidth: '82%',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '88%',
  },
  aiBubbleWide: {
    flex: 1,
    maxWidth: '92%',
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: Colors.text.primary,
  },
  timestampText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTime: {
    color: Colors.text.secondary,
  },
  typingRow: {
    flexDirection: 'row',
    marginVertical: Spacing[2],
    alignItems: 'center',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 40,
    width: 70,
    justifyContent: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.text.secondary,
    marginHorizontal: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Platform.OS === 'ios' ? Spacing[6] : Spacing[4],
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  voiceBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.patient,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
    ...Shadows.md,
  },
  inputFieldWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    height: '100%',
    padding: 0,
  },
  sendBtn: {
    padding: Spacing[1],
    marginLeft: Spacing[2],
  },
  
  // Custom Chat Symptom Checker Styles
  chatAreaList: {
    marginTop: Spacing[3],
    gap: Spacing[2],
    width: '100%',
  },
  chatAreaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing[2],
  },
  chatAreaName: {
    fontSize: FontSize.sm,
    fontWeight: 'bold',
  },
  chatPainScaleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing[3],
    width: '100%',
  },
  chatPainScaleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPainScaleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chatCheckboxContainer: {
    marginTop: Spacing[3],
    gap: Spacing[2],
    width: '100%',
  },
  chatCheckboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[2],
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    gap: Spacing[2],
  },
  chatCheckboxItemActive: {
    borderColor: Colors.secondary[600],
    backgroundColor: Colors.secondary[50],
  },
  chatCheckboxLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.primary,
  },
  chatCheckboxLabelActive: {
    fontWeight: FontWeight.semiBold,
    color: Colors.secondary[600],
  },
  chatSubmitBtn: {
    backgroundColor: Colors.secondary[600],
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  chatSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: 'bold',
  },
  chatResultsContainer: {
    marginTop: Spacing[3],
    gap: Spacing[3],
    width: '100%',
  },
  chatResultCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: Spacing[3],
    gap: 2,
    backgroundColor: '#F8FAFC',
  },
  chatResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatResultDiagLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  chatBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  chatBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatResultDiagnosis: {
    fontSize: FontSize.sm,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  chatResultDesc: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
    marginTop: 2,
  },
  chatRecommendation: {
    gap: 2,
  },
  chatRecommendationTitle: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  chatRecommendationText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  chatBookBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  chatBookBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: 'bold',
  },

  // Voice Overlay styles
  voiceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    zIndex: 9999,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[6],
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing[6],
    paddingBottom: Spacing[4],
  },
  voiceCloseBtn: {
    padding: Spacing[1],
  },
  voiceHeaderTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  voiceHeaderRight: {
    padding: Spacing[1],
  },
  voiceBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[8],
  },
  voiceStatusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.patient,
    letterSpacing: 1.5,
    marginTop: Spacing[2],
  },
  sonarContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing[4],
  },
  sonarRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.patient,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  sonarCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.patient,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
    zIndex: 10,
    shadowColor: Colors.patient,
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  sonarCenterSpeaking: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  sonarCenterConnecting: {
    backgroundColor: '#475569',
    shadowColor: '#475569',
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    width: width * 0.8,
    gap: 6,
  },
  visualizerBar: {
    width: 6,
    borderRadius: 3,
    minHeight: 12,
  },
  transcriptBox: {
    width: width * 0.85,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  transcriptScrollView: {
    flex: 1,
  },
  transcriptContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  transUserRow: {
    marginBottom: Spacing[3],
  },
  transUserLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#94A3B8',
    marginBottom: 2,
  },
  transUserText: {
    fontSize: FontSize.sm,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  transAiRow: {
    marginBottom: Spacing[1],
  },
  transAiLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#10B981',
    marginBottom: 2,
  },
  transAiText: {
    fontSize: FontSize.sm,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    lineHeight: 20,
  },
  voiceFooter: {
    paddingBottom: Platform.OS === 'ios' ? 44 : Spacing[8],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
  },
  voiceFooterText: {
    fontSize: FontSize.xs,
    color: '#94A3B8',
    textAlign: 'center',
  },
  aiSymptomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: Spacing[4],
    width: '100%',
    ...Shadows.xs,
  },
  aiSymptomIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSymptomTexts: {
    flex: 1,
    marginLeft: Spacing[3],
    gap: 2,
  },
  aiSymptomTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#065F46',
  },
  aiSymptomSubtitle: {
    fontSize: 11,
    color: '#047857',
  },
  aiVitalsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: Spacing[4],
    width: '100%',
    ...Shadows.xs,
  },
  aiVitalsHeader: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#64748B',
    marginBottom: Spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiVitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiVitalItem: {
    alignItems: 'center',
    flex: 1,
  },
  aiVitalVal: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#1E293B',
  },
  aiVitalLbl: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  persistentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    gap: 8,
  },
  persistentBannerText: {
    fontSize: 10,
    color: '#991B1B',
    fontWeight: FontWeight.semiBold,
    flex: 1,
  },
  warningCard: {
    padding: Spacing[4],
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 16,
    width: '100%',
    marginBottom: Spacing[4],
    gap: 6,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
  warningText: {
    fontSize: FontSize.xs,
    color: '#991B1B',
    lineHeight: 18,
  },
  formattedContainer: {
    width: '100%',
  },
  formattedLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  formattedBulletLine: {
    paddingLeft: 2,
    marginTop: 3,
    marginBottom: 2,
  },
  formattedBulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.patient,
    marginTop: 7,
    marginRight: 7,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.text.primary,
  },
  italicText: {
    fontStyle: 'italic',
    color: Colors.text.secondary,
  },
  chatVitalsCard: {
    marginTop: 10,
    backgroundColor: '#FAFDFD',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6F4F1',
    width: '100%',
  },
  chatVitalsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  chatVitalsCardTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  chatVitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 10,
  },
  chatVitalBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  chatVitalBoxLabel: {
    fontSize: 9,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  chatVitalBoxValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  chatVitalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  chatVitalBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  chatVitalsViewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  chatVitalsViewMoreText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.patient,
  },
});
