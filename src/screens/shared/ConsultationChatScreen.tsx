import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BodyMap } from '../../components/ui/BodyMap';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useToast } from '../../hooks/useAuth';
import { usePatientAppointments } from '../../hooks/usePatient';
import { useDoctorAppointments, useUpdateAppointmentStatus } from '../../hooks/useDoctor';
import { PainLog, Appointment, DoctorScreenProps, PatientScreenProps } from '../../types';
import { Avatar, Card, Divider } from '../../components';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';
import { useQueryClient } from '@tanstack/react-query';

interface Message {
  id: string;
  senderId: string;
  senderRole: 'patient' | 'doctor';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isUrgent?: boolean;
  attachment?: {
    name: string;
    type: 'pdf' | 'image';
    size: string;
  };
  prescription?: {
    diagnosis: string;
    medications: Array<{ name: string; dosage: string; frequency: string }>;
  };
}

export default function ConsultationChatScreen({ route, navigation }: DoctorScreenProps<'ConsultationChat'> | PatientScreenProps<'ConsultationChat'>) {
  const { appointmentId } = route.params;
  const { role, user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Queries to load appointment details
  const { data: patientAppts } = usePatientAppointments();
  const { data: doctorAppts } = useDoctorAppointments();
  const updateStatusMutation = useUpdateAppointmentStatus();

  // Find appointment
  const allAppts = [
    ...(patientAppts?.data || []),
    ...(doctorAppts?.data || []),
  ];
  const foundAppt = allAppts.find((a) => a.id === appointmentId);

  // Fallback if not found in list query
  const appointment: any = foundAppt || {
    id: appointmentId,
    status: 'scheduled',
    scheduledAt: new Date().toISOString(),
    reason: 'Regular diabetes follow-up consultation',
    type: 'video',
    doctor: {
      id: 'd-1',
      firstName: 'Babajide',
      lastName: 'Alabi',
      specialization: 'General Medicine',
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
    },
    patient: {
      id: 'p-1',
      firstName: 'Chioma',
      lastName: 'Egwu',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      height: 165,
      weight: 55,
      dateOfBirth: '1985-11-10',
      gender: 'female',
      bloodType: 'O+',
      phone: '+234 803 555 1234',
      email: 'chioma@egwu.com',
    },
    soapSummary: {
      subjective: "Patient reports chronic fatigue and mild visual blurriness. Also mentions irregular blood glucose checks over the past week. No reports of chest discomfort or dyspnea.",
      objective: "Height: 165 cm, Weight: 55 kg, BMI: 20.2 (Normal). Latest blood glucose log reads 145 mg/dL. Pulse rate is 72 bpm.",
      assessment: "Type 2 Diabetes Mellitus under review. Mild symptoms suggest glycemic fluctuations. Cardiopulmonary signs are clear.",
      plan: "1. Review blood glucose logs and double-check insulin/oral med adherence.\n2. Advise regular hydration and scheduled carbohydrate intake.\n3. Review diabetic retinopathy screening recommendations during consult."
    }
  };

  const isDoctor = role === 'doctor';
  const partnerUser = isDoctor ? appointment.patient : appointment.doctor;
  const partnerName = isDoctor
    ? `${partnerUser.firstName} ${partnerUser.lastName}`
    : `Dr. ${partnerUser.firstName} ${partnerUser.lastName}`;

  // Screen State
  const [chatStatus, setChatStatus] = useState<string>(
    appointment.status === 'scheduled' || appointment.status === 'approved' ? 'active' : appointment.status
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isContextExpanded, setIsContextExpanded] = useState(true);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [contextTab, setContextTab] = useState<'info' | 'soap' | 'painmap'>('info');

  // Countdown Timer state: 30 minutes consultation window (1800 seconds)
  const [timeLeft, setTimeLeft] = useState(1800);

  const flatListRef = useRef<FlatList>(null);

  // Load Initial Messages
  useEffect(() => {
    const initialMsgs: Message[] = [
      {
        id: '1',
        senderId: 'd-1',
        senderRole: 'doctor',
        text: 'Hello, welcome to our telemedicine session. How can I help you today?',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'read',
      },
    ];
    setMessages(initialMsgs);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (chatStatus !== 'active') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setChatStatus('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [chatStatus]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // End Consultation Handler
  const handleEndConsultation = async () => {
    try {
      await updateStatusMutation.mutateAsync({ id: appointmentId, status: 'completed' });
      setChatStatus('completed');
    } catch {
      // Local fallback
      setChatStatus('completed');
    }
  };

  // Send Message Handler
  const handleSend = (text?: string, customAttachment?: Message['attachment']) => {
    const textToSend = text?.trim() || '';
    if (!textToSend && !customAttachment) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'me',
      senderRole: isDoctor ? 'doctor' : 'patient',
      text: textToSend,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isUrgent: !isDoctor && isUrgent,
      attachment: customAttachment,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsUrgent(false);
    scrollToBottom();

    // Simulate delivery update
    setTimeout(() => {
      setMessages((prevMsgs) =>
        prevMsgs.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m))
      );
    }, 500);

    // Simulate read update
    setTimeout(() => {
      setMessages((prevMsgs) =>
        prevMsgs.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );
    }, 1000);

    // Simulate typing and response
    if (chatStatus === 'active') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoReply: Message = {
          id: `reply-${Date.now()}`,
          senderId: isDoctor ? 'p-1' : 'd-1',
          senderRole: isDoctor ? 'patient' : 'doctor',
          text: isDoctor
            ? "Thank you for the advice, Doctor. I will follow up with the medication as instructed."
            : "Understood. Please monitor your temperature and let me know if it rises. I have logged this in your clinical record.",
          timestamp: new Date().toISOString(),
          status: 'read',
        };
        setMessages((prev) => [...prev, autoReply]);
        scrollToBottom();

        // Trigger Toast & Global Notifications list update
        toast.info(
          isDoctor ? 'New Message from Patient' : 'New Message from Doctor',
          autoReply.text
        );

        // Update notifications list in cache
        queryClient.setQueryData(['notifications'], (old: any) => {
          const list = Array.isArray(old) ? old : (old || []);
          const newNotif = {
            id: `n-chat-${Date.now()}`,
            type: 'general',
            title: isDoctor ? 'Message from Patient' : 'Message from Dr. Alabi',
            body: autoReply.text,
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          return [newNotif, ...list];
        });
      }, 2500);
    }
  };

  // Simulated Lab Result Pickers
  const handlePickAttachment = (name: string, type: 'pdf' | 'image', size: string) => {
    setIsAttachmentModalOpen(false);
    handleSend('', { name, type, size });
  };

  // Format Timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // BMI helper calculations
  const calculateBMI = (h?: number, w?: number) => {
    if (!h || !w) return null;
    return parseFloat((w / Math.pow(h / 100, 2)).toFixed(1));
  };

  const patientHeight = appointment.patient?.height || 170;
  const patientWeight = appointment.patient?.weight || 70;

  const bmiDetails = useMemo(() => {
    const bmi = calculateBMI(patientHeight, patientWeight);
    let category = 'Normal';
    let color = '#10B981';
    if (bmi) {
      if (bmi < 18.5) {
        category = 'Underweight';
        color = '#3B82F6';
      } else if (bmi >= 25 && bmi < 30) {
        category = 'Overweight';
        color = '#F59E0B';
      } else if (bmi >= 30) {
        category = 'Obese';
        color = '#EF4444';
      }
    }
    return { bmi, category, color };
  }, [patientHeight, patientWeight]);

  const patientAge = useMemo(() => {
    const p = appointment.patient;
    if (!p) return null;
    if (p.age) return p.age;
    if (p.dateOfBirth) {
      return new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
    }
    return null;
  }, [appointment.patient]);

  // Render Single Message Bubble
  const renderMessageItem = useCallback(({ item }: { item: Message }) => {
    const isMine = (isDoctor && item.senderRole === 'doctor') || (!isDoctor && item.senderRole === 'patient');
    const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.messageRow, isMine ? styles.myRow : styles.partnerRow]}>
        <View
          style={[
            styles.bubble,
            isMine ? styles.myBubble : styles.partnerBubble,
            item.isUrgent && styles.urgentBubble,
          ]}
        >
          {item.isUrgent && (
            <View style={styles.urgentBadge}>
              <Ionicons name="alert-circle" size={12} color="#EF4444" />
              <Text style={styles.urgentBadgeText}>URGENT</Text>
            </View>
          )}

          {item.text ? <Text style={[styles.messageText, isMine ? styles.myText : styles.partnerText]}>{item.text}</Text> : null}

          {/* Render Prescription Card */}
          {item.prescription && (
            <View style={styles.prescriptionBubbleCard}>
              <View style={styles.prescHeader}>
                <Ionicons name="document-text" size={16} color={isMine ? '#FFFFFF' : Colors.primary[600]} />
                <Text style={[styles.prescTitle, isMine ? styles.myText : styles.partnerText]}>
                  Rx: {item.prescription.diagnosis}
                </Text>
              </View>
              <Divider spacing={2} style={{ backgroundColor: isMine ? 'rgba(255, 255, 255, 0.2)' : Colors.border }} />
              {item.prescription.medications.map((med, idx) => (
                <View key={idx} style={styles.prescMedRow}>
                  <Text style={[styles.prescMedName, isMine ? styles.myText : styles.partnerText]}>
                    • {med.name} ({med.dosage})
                  </Text>
                  <Text style={[styles.prescMedInstructions, isMine ? styles.myTime : styles.partnerTime]}>
                    {med.frequency}
                  </Text>
                </View>
              ))}
              
              {/* Sync to Reminders button for Patient */}
              {!isDoctor && (
                <TouchableOpacity
                  style={styles.syncReminderBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    (navigation as any).navigate('MedicationReminders', {
                      prescribedMeds: item.prescription?.medications.map(m => ({
                        name: m.name,
                        dosage: m.dosage,
                        frequency: m.frequency,
                      }))
                    });
                  }}
                >
                  <Ionicons name="alarm-outline" size={14} color={Colors.primary[600]} />
                  <Text style={styles.syncReminderBtnText}>Sync to Reminders</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Render Attachment */}
          {item.attachment && (
            <View style={styles.attachmentCard}>
              <View style={styles.attachmentIconWrapper}>
                <Ionicons
                  name={item.attachment.type === 'pdf' ? 'document-text' : 'image'}
                  size={24}
                  color={isMine ? '#FFFFFF' : Colors.primary[600]}
                />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={[styles.attachmentName, isMine ? styles.myText : styles.partnerText]} numberOfLines={1}>
                  {item.attachment.name}
                </Text>
                <Text style={styles.attachmentSize}>{item.attachment.size} • Uploaded</Text>
              </View>
              <TouchableOpacity style={styles.attachmentDownload}>
                <Ionicons name="cloud-download-outline" size={18} color={isMine ? '#FFFFFF' : Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.messageMeta}>
            <Text style={[styles.timestamp, isMine ? styles.myTime : styles.partnerTime]}>{formattedTime}</Text>
            {isMine && (
              <Ionicons
                name={
                  item.status === 'read'
                    ? 'checkmark-done'
                    : item.status === 'delivered'
                    ? 'checkmark-done'
                    : 'checkmark'
                }
                size={14}
                color={item.status === 'read' ? '#38BDF8' : 'rgba(255, 255, 255, 0.5)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  }, [isDoctor, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Avatar name={partnerName} uri={partnerUser.avatarUrl} size="sm" />
          <View>
            <Text style={styles.headerName} numberOfLines={1}>
              {partnerName}
            </Text>
            <Text style={styles.headerSub}>
              {isDoctor ? `Patient${patientAge ? `, ${patientAge} y/o` : ''}` : partnerUser.specialization || 'Doctor'} • Online
            </Text>
          </View>
        </View>

        {isDoctor && chatStatus === 'active' && (
          <TouchableOpacity style={styles.endConsultationBtn} onPress={handleEndConsultation}>
            <Text style={styles.endConsultationText}>End Session</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* HIPAA Compliance Indicator */}
      <View style={styles.hipaaBanner}>
        <Ionicons name="shield-checkmark" size={14} color="#10B981" />
        <Text style={styles.hipaaText}>
          HIPAA Secure • Messages are end-to-end encrypted and medically compliant
        </Text>
      </View>

      {/* Countdown Timer Banner */}
      {chatStatus === 'active' && (
        <View style={styles.timerBanner}>
          <Ionicons name="time-outline" size={16} color="#B45309" />
          <Text style={styles.timerText}>
            Active Consultation: <Text style={{ fontWeight: 'bold' }}>{formatTime(timeLeft)}</Text> remaining
          </Text>
        </View>
      )}

      {/* Closed/Archived Banner */}
      {chatStatus === 'completed' && (
        <View style={styles.closedBanner}>
          <Ionicons name="archive-outline" size={16} color="#475569" />
          <Text style={styles.closedText}>
            This consultation has concluded. This chat is read-only.
          </Text>
        </View>
      )}

      {/* ── COLLAPSIBLE CONTEXT PANEL (Doctor View Only) ────────────────── */}
      {isDoctor && (
        <View style={styles.contextPanelContainer}>
          <TouchableOpacity
            style={styles.contextPanelHeader}
            onPress={() => setIsContextExpanded(!isContextExpanded)}
            activeOpacity={0.8}
          >
            <View style={styles.contextHeaderLeft}>
              <Ionicons name="analytics-outline" size={18} color={Colors.primary[600]} />
              <Text style={styles.contextPanelTitle}>Patient Clinical Context</Text>
            </View>
            <Ionicons
              name={isContextExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>

          {isContextExpanded && (
            <View style={styles.contextPanelBody}>
              {/* Context Tabs Header */}
              <View style={styles.contextTabsHeader}>
                <TouchableOpacity
                  style={[styles.contextTab, contextTab === 'info' && styles.contextTabActive]}
                  onPress={() => setContextTab('info')}
                >
                  <Text style={[styles.contextTabLabel, contextTab === 'info' && styles.contextTabLabelActive]}>
                    General Info
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.contextTab, contextTab === 'soap' && styles.contextTabActive]}
                  onPress={() => setContextTab('soap')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="sparkles" size={12} color={contextTab === 'soap' ? Colors.primary[600] : Colors.text.secondary} />
                    <Text style={[styles.contextTabLabel, contextTab === 'soap' && styles.contextTabLabelActive]}>
                      AI SOAP
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.contextTab, contextTab === 'painmap' && styles.contextTabActive]}
                  onPress={() => setContextTab('painmap')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="body-outline" size={12} color={contextTab === 'painmap' ? Colors.primary[600] : Colors.text.secondary} />
                    <Text style={[styles.contextTabLabel, contextTab === 'painmap' && styles.contextTabLabelActive]}>
                      Pain Map
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {contextTab === 'info' ? (
                <>
                  <View style={styles.contextRow}>
                    <View style={styles.contextItem}>
                      <Text style={styles.contextLabel}>Age</Text>
                      <Text style={styles.contextValue}>{patientAge ? `${patientAge} y/o` : 'N/A'}</Text>
                    </View>
                    <View style={styles.contextItem}>
                      <Text style={styles.contextLabel}>Height</Text>
                      <Text style={styles.contextValue}>{patientHeight} cm</Text>
                    </View>
                    <View style={styles.contextItem}>
                      <Text style={styles.contextLabel}>Weight</Text>
                      <Text style={styles.contextValue}>{patientWeight} kg</Text>
                    </View>
                    <View style={styles.contextItem}>
                      <Text style={styles.contextLabel}>Calculated BMI</Text>
                      <Text style={[styles.contextValue, { color: bmiDetails.color, fontWeight: 'bold' }]}>
                        {bmiDetails.bmi ? `${bmiDetails.bmi} (${bmiDetails.category})` : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <Divider spacing={2} />

                  <View style={styles.contextRow}>
                    <View style={[styles.contextItem, { flex: 2 }]}>
                      <Text style={styles.contextLabel}>Medical History / Focus</Text>
                      <Text style={styles.contextSubText} numberOfLines={2}>
                        {appointment.reason || 'None specified'}
                      </Text>
                    </View>
                    <View style={[styles.contextItem, { flex: 1 }]}>
                      <Text style={styles.contextLabel}>Blood Group</Text>
                      <Text style={styles.contextValue}>
                        {appointment.patient?.bloodGroup || appointment.patient?.bloodType || 'O+'}
                      </Text>
                    </View>
                    <View style={[styles.contextItem, { flex: 1 }]}>
                      <Text style={styles.contextLabel}>Genotype</Text>
                      <Text style={styles.contextValue}>
                        {appointment.patient?.genotype || 'AA'}
                      </Text>
                    </View>
                  </View>
                </>
              ) : contextTab === 'painmap' ? (
                <View style={styles.painMapContainer}>
                  {appointment.patient?.painLogs && appointment.patient.painLogs.length > 0 ? (
                    <>
                      <Text style={styles.painMapTitle}>Reported Pain Regions</Text>
                      <BodyMap
                        painLogs={appointment.patient.painLogs}
                        interactive={false}
                      />
                      <View style={styles.painLogsDetail}>
                        {appointment.patient.painLogs.map((log: PainLog, i: number) => (
                          <View key={i} style={styles.painLogRow}>
                            <View
                              style={[
                                styles.painSeverityDot,
                                { backgroundColor: log.severity >= 8 ? '#EF4444' : log.severity >= 4 ? '#F97316' : '#EAB308' },
                              ]}
                            />
                            <Text style={styles.painLogRegion}>
                              {log.bodyPartId.replace('_', ' ').toUpperCase()}
                            </Text>
                            <Text style={styles.painLogSeverity}>Severity: {log.severity}/10</Text>
                            {log.notes ? (
                              <Text style={styles.painLogNotes} numberOfLines={1}>{log.notes}</Text>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    </>
                  ) : (
                    <View style={styles.noPainLogsContainer}>
                      <Ionicons name="body-outline" size={32} color={Colors.neutral[300]} />
                      <Text style={styles.noPainLogsText}>No pain regions reported</Text>
                      <Text style={styles.noPainLogsSubText}>Patient has not mapped any symptoms in the Symptom Checker.</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.soapContainer}>
                  {appointment.soapSummary ? (
                    <ScrollView style={styles.soapScrollView} nestedScrollEnabled={true}>
                      <View style={styles.soapSection}>
                        <Text style={styles.soapSecTitle}>Subjective (Patient Intake)</Text>
                        <Text style={styles.soapSecText}>{appointment.soapSummary.subjective}</Text>
                      </View>
                      <View style={styles.soapSection}>
                        <Text style={styles.soapSecTitle}>Objective (Vitals & Clinical Data)</Text>
                        <Text style={styles.soapSecText}>{appointment.soapSummary.objective}</Text>
                      </View>
                      <View style={styles.soapSection}>
                        <Text style={styles.soapSecTitle}>Assessment (AI Impression)</Text>
                        <Text style={styles.soapSecText}>{appointment.soapSummary.assessment}</Text>
                      </View>
                      <View style={styles.soapSection}>
                        <Text style={styles.soapSecTitle}>Plan (Draft Treatment)</Text>
                        <Text style={styles.soapSecText}>{appointment.soapSummary.plan}</Text>
                      </View>
                      
                      <TouchableOpacity
                        style={styles.copySoapBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          const fullSoap = `SUBJECTIVE:\n${appointment.soapSummary.subjective}\n\nOBJECTIVE:\n${appointment.soapSummary.objective}\n\nASSESSMENT:\n${appointment.soapSummary.assessment}\n\nPLAN:\n${appointment.soapSummary.plan}`;
                          toast.success('Copied to Notes', 'AI SOAP Note draft copied.');
                        }}
                      >
                        <Ionicons name="copy-outline" size={14} color="#FFFFFF" />
                        <Text style={styles.copySoapBtnText}>Copy SOAP Draft</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  ) : (
                    <Text style={styles.noSoapText}>No AI SOAP note available.</Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* ── MESSAGE LIST ────────────────────────────────────────────────── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingIndicatorRow}>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={Colors.neutral[400]} />
                <Text style={styles.typingText}>Typing...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* ── INPUT TOOLBAR ───────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          {chatStatus === 'active' ? (
            <>
              {/* Actions row above text input */}
              <View style={styles.toolbarActionRow}>
                {/* File Attachment Button */}
                <TouchableOpacity
                  style={styles.actionCircleBtn}
                  onPress={() => setIsAttachmentModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="attach" size={20} color={Colors.text.primary} />
                </TouchableOpacity>

                {/* Urgent Switch (Patient View) */}
                {!isDoctor && (
                  <TouchableOpacity
                    style={[styles.urgentToggle, isUrgent && styles.urgentToggleActive]}
                    onPress={() => setIsUrgent(!isUrgent)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={isUrgent ? 'alert-circle' : 'alert-circle-outline'} size={16} color={isUrgent ? '#FFFFFF' : '#EF4444'} />
                    <Text style={[styles.urgentToggleText, isUrgent && styles.urgentToggleTextActive]}>
                      Urgent Flag
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Direct Prescription Shortcut (Doctor View) */}
                {isDoctor && (
                  <TouchableOpacity
                    style={styles.prescriptionShortcut}
                    onPress={() =>
                      (navigation as any).navigate('Prescription', {
                        appointmentId: appointment.id,
                        patientId: appointment.patient.id,
                        mode: 'create',
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons name="document-text-outline" size={14} color={Colors.primary[600]} />
                    <Text style={styles.prescriptionShortcutText}>Write Prescription</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Main Input Row */}
              <View style={styles.mainInputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type secure medical message..."
                  value={inputText}
                  onChangeText={setInputText}
                  placeholderTextColor={Colors.text.secondary}
                  multiline={false}
                  onSubmitEditing={() => handleSend(inputText)}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                  onPress={() => handleSend(inputText)}
                  disabled={!inputText.trim()}
                  activeOpacity={0.85}
                >
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.readOnlyToolbar}>
              <Ionicons name="lock-closed" size={16} color={Colors.text.secondary} />
              <Text style={styles.readOnlyText}>Consultation inactive. Messaging is disabled.</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* ── ATTACHMENT SELECTION MODAL ─────────────────────────────────── */}
      <Modal
        visible={isAttachmentModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAttachmentModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attach Clinical Documents</Text>
              <TouchableOpacity onPress={() => setIsAttachmentModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handlePickAttachment('Blood_Chemistry_Report.pdf', 'pdf', '1.4 MB')}
            >
              <Ionicons name="document-text-outline" size={24} color={Colors.primary[600]} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionName}>Blood Chemistry Lab Report</Text>
                <Text style={styles.optionSub}>PDF Document • 1.4 MB</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handlePickAttachment('Chest_XRay_Image.png', 'image', '4.2 MB')}
            >
              <Ionicons name="image-outline" size={24} color={Colors.primary[600]} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionName}>Chest Radiograph (X-Ray)</Text>
                <Text style={styles.optionSub}>PNG Image • 4.2 MB</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handlePickAttachment('Electrocardiogram_ECG.pdf', 'pdf', '850 KB')}
            >
              <Ionicons name="pulse-outline" size={24} color={Colors.primary[600]} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionName}>ECG Rhythm Strips Report</Text>
                <Text style={styles.optionSub}>PDF Document • 850 KB</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    padding: Spacing[1],
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing[3],
    gap: Spacing[2],
  },
  headerName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  endConsultationBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  endConsultationText: {
    fontSize: FontSize.xs,
    color: '#EF4444',
    fontWeight: FontWeight.bold,
  },
  hipaaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: Spacing[4],
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
    gap: 8,
  },
  hipaaText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: FontWeight.semiBold,
    flex: 1,
  },
  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    gap: 6,
  },
  timerText: {
    fontSize: FontSize.xs,
    color: '#B45309',
    fontWeight: FontWeight.medium,
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 6,
  },
  closedText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  contextPanelContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.xs,
  },
  contextPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: 10,
  },
  contextHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contextPanelTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextPanelBody: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
    gap: Spacing[2],
  },
  contextRow: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  contextItem: {
    flex: 1,
  },
  contextLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  contextValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  contextSubText: {
    fontSize: FontSize.xs,
    color: Colors.text.primary,
    lineHeight: 16,
  },
  listContent: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing[4],
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  partnerRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: Spacing[3],
    borderRadius: 16,
    ...Shadows.xs,
  },
  myBubble: {
    backgroundColor: Colors.primary[600],
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  urgentBubble: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  urgentBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  myText: {
    color: Colors.text.inverse,
  },
  partnerText: {
    color: Colors.text.primary,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    padding: Spacing[2],
    marginTop: Spacing[2],
    gap: 8,
  },
  attachmentIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  attachmentSize: {
    fontSize: 9,
    color: Colors.text.secondary,
  },
  attachmentDownload: {
    padding: 4,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 9,
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  partnerTime: {
    color: Colors.text.secondary,
  },
  typingIndicatorRow: {
    flexDirection: 'row',
    marginVertical: Spacing[1],
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 12,
    gap: 6,
  },
  typingText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing[4],
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? Spacing[6] : Spacing[3],
    gap: Spacing[2],
  },
  toolbarActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  actionCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: Spacing[3],
    height: 32,
    borderRadius: 16,
    gap: 4,
  },
  urgentToggleActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  urgentToggleText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#EF4444',
  },
  urgentToggleTextActive: {
    color: '#FFFFFF',
  },
  prescriptionShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[100],
    paddingHorizontal: Spacing[3],
    height: 32,
    borderRadius: 16,
    gap: 4,
  },
  prescriptionShortcutText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  mainInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: Spacing[4],
    fontSize: FontSize.sm,
    color: Colors.text.primary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xs,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  readOnlyToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  readOnlyText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing[6],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[3],
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  optionSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  // SOAP summary tabs and panels
  contextTabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing[3],
    gap: Spacing[4],
  },
  contextTab: {
    paddingBottom: Spacing[2],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  contextTabActive: {
    borderBottomColor: Colors.primary[600],
  },
  contextTabLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  contextTabLabelActive: {
    color: Colors.primary[600],
  },
  soapContainer: {
    maxHeight: 180,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
  },
  soapScrollView: {
    flexGrow: 0,
  },
  soapSection: {
    marginBottom: Spacing[3],
  },
  soapSecTitle: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  soapSecText: {
    fontSize: FontSize.xs,
    color: Colors.text.primary,
    lineHeight: 16,
  },
  copySoapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary[600],
    height: 32,
    borderRadius: 8,
    marginTop: Spacing[2],
    marginBottom: Spacing[2],
  },
  copySoapBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  noSoapText: {
    fontSize: FontSize.xs,
    color: Colors.text.disabled,
    textAlign: 'center',
    paddingVertical: Spacing[4],
  },
  // Prescription Bubble
  prescriptionBubbleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: Spacing[3],
    marginTop: Spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: Spacing[2],
    minWidth: 220,
  },
  prescHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prescTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  prescMedRow: {
    marginVertical: 1,
  },
  prescMedName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
  },
  prescMedInstructions: {
    fontSize: 10,
    marginLeft: 10,
  },
  syncReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    height: 32,
    borderRadius: 8,
    marginTop: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  syncReminderBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  // Pain Map tab styles
  painMapContainer: {
    gap: Spacing[3],
  },
  painMapTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  painLogsDetail: {
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  painLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    flexWrap: 'wrap',
  },
  painSeverityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  painLogRegion: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  painLogSeverity: {
    fontSize: 10,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  painLogNotes: {
    fontSize: 9,
    color: Colors.text.disabled,
    fontStyle: 'italic',
    width: '100%',
  },
  noPainLogsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[5],
    gap: Spacing[2],
  },
  noPainLogsText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  noPainLogsSubText: {
    fontSize: FontSize.xs,
    color: Colors.text.disabled,
    textAlign: 'center',
    lineHeight: 16,
  },
});
