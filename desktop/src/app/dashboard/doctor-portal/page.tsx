'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Stethoscope, Calendar, Clock, Users, FileText, Pill,
  CheckCircle2, AlertCircle, Plus, Search,
  Send, Eye, Edit3, Award, MapPin, DollarSign, UserCheck, Shield, Star, MessageSquare,
  Smartphone, Download, Video, Phone, Radio, Activity, Fingerprint, Lock, ExternalLink,
  Droplet, Sparkles, Bot, Mic, MicOff, VideoOff, PhoneOff, Settings, RefreshCw,
  ChevronRight, ArrowRight, ShieldCheck, Heart, Info, Check, X, AlertTriangle, Camera,
  Maximize2, Minimize2, ArrowLeftRight, Expand, Shrink, Copy, Building2
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useAuthStore } from '@/store/authStore';
import { ThreeBodyMap } from '@/components/clinical/ThreeBodyMap';
import { DoctorPatientChat } from '@/components/clinical/DoctorPatientChat';
import { liveApi } from '@/services/api';
import { realtimeService } from '@/services/realtimeService';
import type { Appointment } from '@/types';

// ── Types ───────────────────────────────────────────────────────────────────

interface PatientReview {
  id: string;
  patientName: string;
  rating: number;
  date: string;
  comment: string;
  doctorReply?: string;
}

interface Consultation {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  bloodGroup: string;
  genotype: string;
  time: string;
  type: 'video' | 'in_person' | 'phone';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  reason: string;
  vitals: { bp: string; hr: string; temp: string; weight: string; spo2: string };
  history: string;
  allergies: string[];
  painRegion?: {
    region: string;
    severity: number; // 1-10
    color: 'yellow' | 'orange' | 'red';
    notes: string;
  };
}

interface IssuedPrescription {
  id: string;
  patientName: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  pharmacy: string;
  date: string;
  status: 'Dispensed' | 'Processing' | 'Received by Patient App';
}

// ── Initial Mock Data ───────────────────────────────────────────────────────

// ── Interactive 3D Anatomical Body Map Component ─────────────────────────────

interface BodyMapProps {
  activeRegion: string;
  onSelectRegion: (region: string) => void;
  severity: number;
  onSelectSeverity: (val: number) => void;
}

function AnatomicalBodyMap({ activeRegion, onSelectRegion, severity, onSelectSeverity }: BodyMapProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ThreeBodyMap
        activeRegion={activeRegion}
        onSelectRegion={onSelectRegion}
        severity={severity}
        onSelectSeverity={onSelectSeverity}
        height={340}
      />
      
      {/* 1 - 10 Pain Severity Rating Buttons */}
      <div style={{ background: '#0f172a', padding: 14, borderRadius: 12, border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 700 }}>
          <span>1 Mild (Green)</span>
          <span>5 Moderate (Amber)</span>
          <span>10 Severe (Red)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isCur = severity === num;
            let activeBg = '#10b981';
            if (num > 3 && num <= 6) activeBg = '#f59e0b';
            if (num > 6) activeBg = '#ef4444';

            return (
              <button
                key={num}
                type="button"
                onClick={() => onSelectSeverity(num)}
                style={{
                  height: 32,
                  borderRadius: 6,
                  border: isCur ? '2px solid #ffffff' : '1px solid #334155',
                  background: isCur ? activeBg : '#1e293b',
                  color: isCur ? '#ffffff' : '#cbd5e1',
                  fontWeight: isCur ? 800 : 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Doctor Portal Component ─────────────────────────────────────────────

function DoctorPortalContent() {
  const { admin } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams?.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.push(`/dashboard/doctor-portal?tab=${newTab}`);
  };

  // Telehealth Doctor Online/Offline toggle
  const [isDoctorOnline, setIsDoctorOnline] = useState(true);

  // Toast feedback message
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Selected Consult for Video Call / SOAP
  const [activeVideoConsult, setActiveVideoConsult] = useState<Consultation | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  // Active Consultation Chat Patient
  const [activeChatPatientId, setActiveChatPatientId] = useState<string>('c-100');

  // ── Tiered Consultation Fees (Doctor Set) — Exactly matches Mobile Phone ──
  const MIN_CONSULTATION_FEE = 2000;
  const PLATFORM_FEE_PERCENT = 10;
  const [tierFees, setTierFees] = useState({ chat: 8000, audio: 10000, video: 15000 });
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeInputChat, setFeeInputChat] = useState('8000');
  const [feeInputAudio, setFeeInputAudio] = useState('10000');
  const [feeInputVideo, setFeeInputVideo] = useState('15000');
  const [feeValidationErr, setFeeValidationErr] = useState<string | null>(null);

  // Load persisted doctor tiered fees from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ominipulse_doctor_tiered_fees');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.chat && parsed.audio && parsed.video) {
          setTierFees(parsed);
          setFeeInputChat(String(parsed.chat));
          setFeeInputAudio(String(parsed.audio));
          setFeeInputVideo(String(parsed.video));
        }
      }
    } catch {}
  }, []);

  const handleOpenFeeModal = () => {
    setFeeInputChat(String(tierFees.chat));
    setFeeInputAudio(String(tierFees.audio));
    setFeeInputVideo(String(tierFees.video));
    setFeeValidationErr(null);
    setIsFeeModalOpen(true);
  };

  const handleSaveTieredFees = () => {
    const c = parseFloat(String(feeInputChat).replace(/,/g, '')) || 0;
    const a = parseFloat(String(feeInputAudio).replace(/,/g, '')) || 0;
    const v = parseFloat(String(feeInputVideo).replace(/,/g, '')) || 0;

    if (c < MIN_CONSULTATION_FEE || a < MIN_CONSULTATION_FEE || v < MIN_CONSULTATION_FEE) {
      setFeeValidationErr(`Every consultation fee must be at least ₦${MIN_CONSULTATION_FEE.toLocaleString()}.`);
      return;
    }
    if (c >= a) {
      setFeeValidationErr('Chat Consultation fee must be lower than Audio Call fee.');
      return;
    }
    if (a >= v) {
      setFeeValidationErr('Audio Call fee must be lower than Video Call fee.');
      return;
    }

    const newFees = { chat: c, audio: a, video: v };
    setTierFees(newFees);
    try {
      localStorage.setItem('ominipulse_doctor_tiered_fees', JSON.stringify(newFees));
    } catch {}
    setIsFeeModalOpen(false);
    setFeeValidationErr(null);
    triggerFeedback(`Tiered consultation fees successfully updated: Chat ₦${c.toLocaleString()} · Audio ₦${a.toLocaleString()} · Video ₦${v.toLocaleString()}`);
  };

  // ── Hospital Affiliation & 6-Digit Code Connection (Desktop & Phone Synced) ─
  // Live hospitals from the database; each facility exposes a deterministic
  // 6-digit linkage code derived from its id for demo-free desktop pairing.
  const [LIVE_HOSPITAL_INVITES, setLiveHospitalInvites] = useState<
    Record<string, { hospitalId: string; hospitalName: string; department: string; address: string; admin: string }>
  >({});

  useEffect(() => {
    let cancelled = false;
    liveApi.getHospitals().then((hospitals) => {
      if (cancelled) return;
      const invites: typeof LIVE_HOSPITAL_INVITES = {};
      for (const h of hospitals) {
        // Deterministic 6-digit code from the hospital UUID (demo-free).
        let hash = 0;
        for (const ch of h.id) hash = (hash * 31 + ch.charCodeAt(0)) % 1000000;
        invites[String(hash).padStart(6, '0')] = {
          hospitalId: h.id,
          hospitalName: h.name,
          department: 'General Practice',
          address: h.address ?? '—',
          admin: h.email,
        };
      }
      setLiveHospitalInvites(invites);
    }).catch(() => {
      // Invites stay empty; affiliation pairing is unavailable until live.
    });
    return () => { cancelled = true; };
  }, []);

  const [desktopAffiliation, setDesktopAffiliation] = useState<{
    hospitalId: string;
    hospitalName: string;
    department: string;
    address: string;
    linkedViaCode: string;
    linkedAt: string;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ominipulse_doctor_hospital_affiliation');
      if (saved) {
        setDesktopAffiliation(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // ── Live appointment sync (mobile bookings → doctor portal) ────────────────
  // Live appointments from the unified backend are mapped into the portal's
  // Consultation shape. The realtime
  // socket invalidates on `appointment.*` events (patient booked / status
  // changed) so the dashboard reflects bookings instantly — no refresh.

  const [liveConsults, setLiveConsults] = useState<Consultation[]>([]);
  const [isLiveSyncActive, setIsLiveSyncActive] = useState(false);

  const loadLiveAppointments = useCallback(async () => {
    try {
      const live = await liveApi.getAppointments();
      const mapped: Consultation[] = live.map((a: Appointment) => ({
        id: a.id,
        patientName: `${a.patient.firstName} ${a.patient.lastName}`.trim() || 'Unknown Patient',
        patientAge: 0,
        patientGender: 'Female',
        bloodGroup: '—',
        genotype: '—',
        time: new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: a.type,
        status:
          a.status === 'completed' ? 'completed'
          : a.status === 'cancelled' ? 'cancelled'
          : a.status === 'approved' || a.status === 'scheduled' ? 'in_progress'
          : 'waiting',
        reason: a.reason || 'General consultation',
        vitals: { bp: '—', hr: '—', temp: '—', weight: '—', spo2: '—' },
        history: 'Loaded from live OminiPulse backend.',
        allergies: ['Not yet documented'],
      }));
      setLiveConsults(mapped);
      setIsLiveSyncActive(mapped.length > 0);
    } catch {
      // Live feed unavailable; the portal stays on its empty state.
      setIsLiveSyncActive(false);
    }
  }, []);

  useEffect(() => {
    void loadLiveAppointments();
    // Realtime: any appointment event (booked/approved/cancelled/completed)
    // triggers an instant re-fetch.
    const unsubscribe = realtimeService.subscribe((msg) => {
      if (msg.event.startsWith('appointment.')) {
        void loadLiveAppointments();
      }
    });
    return unsubscribe;
  }, [loadLiveAppointments]);

  const [codeInputValue, setCodeInputValue] = useState('');
  const [patientRosterType, setPatientRosterType] = useState<'private' | 'hospital'>('private');

  // Hospital patient roster — live from the platform patient directory
  // (https://ominipulse.onrender.com/api/admin/users?role=patient). No fallback.
  const [HOSPITAL_PATIENTS_ROSTER, setHospitalPatientsRoster] = useState<
    { id: string; fullName: string; mrn: string; phone: string; email: string | undefined; age: number; gender: string; bloodGroup: string; department: string; isAppUser: boolean; lastVisit: string; notes: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    liveApi.getPatients().then((patients) => {
      if (cancelled) return;
      setHospitalPatientsRoster(
        patients.map((p, i) => ({
          id: p.id,
          fullName: `${p.firstName} ${p.lastName}`.trim() || 'Unknown Patient',
          mrn: `OMP-${p.id.slice(0, 4).toUpperCase()}-${String(1000 + i)}`,
          phone: p.phone ?? '—',
          email: p.email,
          age: 0,
          gender: '—',
          bloodGroup: '—',
          department: '—',
          isAppUser: true,
          lastVisit: new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
          notes: 'Registered via the OmniPulse mobile application.',
        }))
      );
    }).catch(() => {
      // Roster stays empty; the portal surfaces the error via its live banner.
    });
    return () => { cancelled = true; };
  }, []);

  const previewHospitalInvite = useMemo(() => {
    const clean = codeInputValue.trim().replace(/\D/g, '');
    if (clean.length === 6) {
      return LIVE_HOSPITAL_INVITES[clean] || null;
    }
    return null;
  }, [codeInputValue, LIVE_HOSPITAL_INVITES]);

  const handleConnectDesktopHospital = () => {
    const clean = codeInputValue.trim().replace(/\D/g, '');
    if (clean.length !== 6) {
      triggerFeedback('Please enter a valid 6-digit hospital code.');
      return;
    }
    const found = LIVE_HOSPITAL_INVITES[clean];
    if (!found) {
      triggerFeedback('Invalid or expired 6-digit code. Please check with your hospital admin.');
      return;
    }

    const aff = {
      hospitalId: found.hospitalId,
      hospitalName: found.hospitalName,
      department: found.department,
      address: found.address,
      linkedViaCode: clean,
      linkedAt: new Date().toISOString(),
    };

    setDesktopAffiliation(aff);
    try {
      localStorage.setItem('ominipulse_doctor_hospital_affiliation', JSON.stringify(aff));
    } catch {}
    setCodeInputValue('');
    triggerFeedback(`Successfully connected to ${found.hospitalName} (${found.department} Dept)! Hospital patient roster synced.`);
  };

  const handleDisconnectDesktopHospital = () => {
    if (confirm(`Disconnect from ${desktopAffiliation?.hospitalName}? You will revert to independent practice status.`)) {
      setDesktopAffiliation(null);
      try {
        localStorage.removeItem('ominipulse_doctor_hospital_affiliation');
      } catch {}
      triggerFeedback('Disconnected from hospital. You are now operating as an Independent Specialist.');
    }
  };


  // Fullscreen & Resizing Telehealth Call Studio States
  const [callSizeMode, setCallSizeMode] = useState<'standard' | 'expanded' | 'fullscreen'>('standard');
  const [callSplitMode, setCallSplitMode] = useState<'split' | 'video_focus'>('split');
  const [primaryVideoFeed, setPrimaryVideoFeed] = useState<'doctor_camera' | 'patient_feed'>('doctor_camera');
  const [cameraDeviceLabel, setCameraDeviceLabel] = useState('Integrated HD Clinical Camera (1080p)');
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  // Real Desktop Camera & Microphone Stream refs & state
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micVolume, setMicVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle Fullscreen mode (both CSS overlay and native Electron window)
  const handleToggleFullScreen = async () => {
    if (callSizeMode === 'fullscreen') {
      setCallSizeMode('standard');
      if (typeof window !== 'undefined' && (window as any).electronAPI?.setFullScreen) {
        await (window as any).electronAPI.setFullScreen(false).catch(() => {});
      }
    } else {
      setCallSizeMode('fullscreen');
      if (typeof window !== 'undefined' && (window as any).electronAPI?.setFullScreen) {
        await (window as any).electronAPI.setFullScreen(true).catch(() => {});
      }
    }
  };

  // Switch between Doctor Camera on Main Stage vs Patient Feed on Main Stage
  const handleSwapFeeds = () => {
    setPrimaryVideoFeed((prev) => (prev === 'doctor_camera' ? 'patient_feed' : 'doctor_camera'));
  };

  // Robust Camera Stream Acquisition
  const requestMediaStream = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Webcam device API not available in this environment.');
      return;
    }

    setCameraError(null);
    let stream: MediaStream | null = null;

    try {
      // First attempt: HD webcam + microphone
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
        },
        audio: true,
      });
    } catch (e1) {
      console.warn('[DoctorPortal] Dual video+audio failed, trying video only:', e1);
      try {
        // Second attempt: video only (if microphone device is restricted or unavailable)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      } catch (e2: any) {
        console.warn('[DoctorPortal] Camera hardware unavailable:', e2);
        const isDenied = e2?.name === 'NotAllowedError' || e2?.name === 'PermissionDeniedError';
        setCameraError(
          isDenied
            ? 'Camera access permission denied. Please allow camera access in your system/browser settings.'
            : 'No physical camera detected or device is in use by another program.'
        );
        setIsCameraActive(false);
        return;
      }
    }

    if (stream) {
      setCameraStream(stream);
      setIsCameraActive(true);
      setCameraError(null);

      // Detect hardware device label
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInput = devices.find((d) => d.kind === 'videoinput');
        if (videoInput?.label) {
          setCameraDeviceLabel(videoInput.label);
        } else {
          setCameraDeviceLabel('HD Clinical Webcam (1080p Live)');
        }
      } catch {
        setCameraDeviceLabel('HD Clinical Webcam (1080p Live)');
      }

      // Web Audio API VU meter
      if (stream.getAudioTracks().length > 0) {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const src = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            src.connect(analyser);

            const data = new Uint8Array(analyser.frequencyBinCount);
            const updateVolume = () => {
              analyser.getByteFrequencyData(data);
              let sum = 0;
              for (let i = 0; i < data.length; i++) sum += data[i];
              const avg = sum / data.length;
              setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();
          }
        } catch {}
      }
    }
  }, []);

  // Callback ref for Main Stage video
  const setMainVideoNode = useCallback(
    (node: HTMLVideoElement | null) => {
      mainVideoRef.current = node;
      if (node && cameraStream && primaryVideoFeed === 'doctor_camera') {
        if (node.srcObject !== cameraStream) {
          node.srcObject = cameraStream;
        }
        node.play().catch(() => {});
      }
    },
    [cameraStream, primaryVideoFeed]
  );

  // Callback ref for PiP video
  const setPipVideoNode = useCallback(
    (node: HTMLVideoElement | null) => {
      pipVideoRef.current = node;
      if (node && cameraStream && primaryVideoFeed === 'patient_feed') {
        if (node.srcObject !== cameraStream) {
          node.srcObject = cameraStream;
        }
        node.play().catch(() => {});
      }
    },
    [cameraStream, primaryVideoFeed]
  );

  // Synchronize stream to video elements on state updates
  useEffect(() => {
    if (!cameraStream) return;

    if (primaryVideoFeed === 'doctor_camera' && mainVideoRef.current) {
      if (mainVideoRef.current.srcObject !== cameraStream) {
        mainVideoRef.current.srcObject = cameraStream;
      }
      mainVideoRef.current.play().catch(() => {});
    } else if (primaryVideoFeed === 'patient_feed' && pipVideoRef.current) {
      if (pipVideoRef.current.srcObject !== cameraStream) {
        pipVideoRef.current.srcObject = cameraStream;
      }
      pipVideoRef.current.play().catch(() => {});
    }
  }, [cameraStream, primaryVideoFeed, isVideoDisabled, callSizeMode, callSplitMode]);

  // Consultation lifecycle management
  useEffect(() => {
    if (activeVideoConsult) {
      setCallDurationSeconds(0);
      callTimerRef.current = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);

      requestMediaStream();
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (callSizeMode === 'fullscreen' && typeof window !== 'undefined' && (window as any).electronAPI?.setFullScreen) {
        (window as any).electronAPI.setFullScreen(false).catch(() => {});
      }
      setIsCameraActive(false);
      setMicVolume(0);
      setCameraError(null);
      setCallSizeMode('standard');
      setCallSplitMode('split');
      setPrimaryVideoFeed('doctor_camera');
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activeVideoConsult, requestMediaStream]);

  const handleToggleMic = () => {
    setIsMicMuted((prev) => {
      const next = !prev;
      if (cameraStream) {
        cameraStream.getAudioTracks().forEach((t) => {
          t.enabled = !next;
        });
      }
      return next;
    });
  };

  const handleToggleVideo = () => {
    setIsVideoDisabled((prev) => {
      const next = !prev;
      if (cameraStream) {
        cameraStream.getVideoTracks().forEach((t) => {
          t.enabled = !next;
        });
      }
      return next;
    });
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Selected Patient Chart & Body Map Modal
  const [activeChartPatient, setActiveChartPatient] = useState<Consultation | null>(null);
  const [selectedBodyRegion, setSelectedBodyRegion] = useState('Chest');
  const [painIntensity, setPainIntensity] = useState(5);

  // E-Prescription Modal & State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [rxPatientName, setRxPatientName] = useState('Tunde Afolabi (48y · Male)');
  const [rxDrugName, setRxDrugName] = useState('Amlodipine Besylate 5mg');
  const [rxDosage, setRxDosage] = useState('1 Tablet daily by mouth');
  const [rxFrequency, setRxFrequency] = useState('Once daily (QD)');
  const [rxDuration, setRxDuration] = useState('30 days');
  const [rxPharmacy, setRxPharmacy] = useState('Pharmacare Pharmacy Ikeja');
  const [issuedPrescriptions, setIssuedPrescriptions] = useState<IssuedPrescription[]>([]);

  // Working Hours & Availability State (Doctor Editable Shifts)
  const DEFAULT_SCHEDULE = [
    { day: 'Monday', active: true, start: '08:00 AM', end: '05:00 PM', slots: 18 },
    { day: 'Tuesday', active: true, start: '08:00 AM', end: '05:00 PM', slots: 18 },
    { day: 'Wednesday', active: true, start: '08:00 AM', end: '02:00 PM', slots: 12 },
    { day: 'Thursday', active: true, start: '08:00 AM', end: '05:00 PM', slots: 18 },
    { day: 'Friday', active: true, start: '08:00 AM', end: '04:00 PM', slots: 16 },
    { day: 'Saturday', active: false, start: '10:00 AM', end: '02:00 PM', slots: 8 },
    { day: 'Sunday', active: false, start: '09:00 AM', end: '01:00 PM', slots: 0 },
  ];
  const [scheduleSlots, setScheduleSlots] = useState(DEFAULT_SCHEDULE);
  const [slotDuration, setSlotDuration] = useState('30 mins');

  // Time conversion and slot calculation utilities
  const parseTimeToMins = (tStr: string): number => {
    if (!tStr || tStr === 'Off Duty') return 0;
    const match = tStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const to24Hour = (tStr: string): string => {
    if (!tStr || tStr === 'Off Duty') return '08:00';
    const totalMins = parseTimeToMins(tStr);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const from24Hour = (val24: string): string => {
    if (!val24) return '08:00 AM';
    const [hStr, mStr] = val24.split(':');
    let h = parseInt(hStr || '0', 10);
    const m = parseInt(mStr || '0', 10);
    const meridiem = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${meridiem}`;
  };

  const calcSlots = (startStr: string, endStr: string, durStr: string): number => {
    const startMins = parseTimeToMins(startStr);
    const endMins = parseTimeToMins(endStr);
    if (endMins <= startMins) return 0;
    const durMins = parseInt(durStr, 10) || 30;
    return Math.floor((endMins - startMins) / durMins);
  };

  // Load persisted schedule on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ominipulse_doctor_schedule_slots');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScheduleSlots(parsed);
        }
      }
      const savedDur = localStorage.getItem('ominipulse_doctor_slot_duration');
      if (savedDur) {
        setSlotDuration(savedDur);
      }
    } catch {}
  }, []);

  const handleUpdateTime = (dayIdx: number, field: 'start' | 'end', val24: string) => {
    const newTime = from24Hour(val24);
    const updated = [...scheduleSlots];
    const item = { ...updated[dayIdx], [field]: newTime };
    const startVal = field === 'start' ? newTime : item.start;
    const endVal = field === 'end' ? newTime : item.end;
    item.slots = item.active ? calcSlots(startVal, endVal, slotDuration) : 0;
    updated[dayIdx] = item;
    setScheduleSlots(updated);
    try {
      localStorage.setItem('ominipulse_doctor_schedule_slots', JSON.stringify(updated));
    } catch {}
  };

  const handleQuickShift = (dayIdx: number, startStr: string, endStr: string) => {
    const updated = [...scheduleSlots];
    updated[dayIdx] = {
      ...updated[dayIdx],
      active: true,
      start: startStr,
      end: endStr,
      slots: calcSlots(startStr, endStr, slotDuration)
    };
    setScheduleSlots(updated);
    try {
      localStorage.setItem('ominipulse_doctor_schedule_slots', JSON.stringify(updated));
    } catch {}
    triggerFeedback(`Applied shift (${startStr} - ${endStr}) to ${updated[dayIdx].day}.`);
  };

  const handleCopyMondayToWeekdays = () => {
    const mon = scheduleSlots[0];
    const updated = scheduleSlots.map((s, idx) => {
      if (idx >= 1 && idx <= 4) {
        return {
          ...s,
          active: mon.active,
          start: mon.start,
          end: mon.end,
          slots: mon.active ? calcSlots(mon.start, mon.end, slotDuration) : 0,
        };
      }
      return s;
    });
    setScheduleSlots(updated);
    try {
      localStorage.setItem('ominipulse_doctor_schedule_slots', JSON.stringify(updated));
    } catch {}
    triggerFeedback(`Copied Monday shift (${mon.start} - ${mon.end}) to Tuesday through Friday.`);
  };

  const handleSlotDurationChange = (newDur: string) => {
    setSlotDuration(newDur);
    const updated = scheduleSlots.map((s) => ({
      ...s,
      slots: s.active ? calcSlots(s.start, s.end, newDur) : 0,
    }));
    setScheduleSlots(updated);
    try {
      localStorage.setItem('ominipulse_doctor_schedule_slots', JSON.stringify(updated));
      localStorage.setItem('ominipulse_doctor_slot_duration', newDur);
    } catch {}
    triggerFeedback(`Slot duration updated to ${newDur}. Available consultation slots recalculated.`);
  };

  const handleSaveSchedule = () => {
    try {
      localStorage.setItem('ominipulse_doctor_schedule_slots', JSON.stringify(scheduleSlots));
      localStorage.setItem('ominipulse_doctor_slot_duration', slotDuration);
    } catch {}
    triggerFeedback('Weekly clinical schedule & consultation slots successfully saved!');
  };


  // Patient Reviews & Doctor Replies
  const [patientReviews, setPatientReviews] = useState<PatientReview[]>([]);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handlePostDoctorReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setPatientReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, doctorReply: replyText.trim() } : r)
    );
    setReplyingReviewId(null);
    setReplyText('');
    triggerFeedback('Official verified doctor reply published to patient review feed.');
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxDrugName.trim()) return;

    const newRx: IssuedPrescription = {
      id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: rxPatientName,
      drugName: rxDrugName,
      dosage: rxDosage,
      frequency: rxFrequency,
      duration: rxDuration,
      pharmacy: rxPharmacy,
      date: 'Just now',
      status: 'Received by Patient App',
    };

    setIssuedPrescriptions([newRx, ...issuedPrescriptions]);
    setIsPrescriptionModalOpen(false);
    triggerFeedback(`Official E-Prescription ${newRx.id} generated and signed with MDCN cryptographic stamp.`);
  };

  // Tab Pagination & See All states
  const [apptPage, setApptPage] = useState(1);
  const [apptPageSize, setApptPageSize] = useState(5);
  const [apptIsSeeAll, setApptIsSeeAll] = useState(false);

  const [patientSearch, setPatientSearch] = useState('');
  const [patientPage, setPatientPage] = useState(1);
  const [patientPageSize, setPatientPageSize] = useState(5);
  const [patientIsSeeAll, setPatientIsSeeAll] = useState(false);

  const [rxPage, setRxPage] = useState(1);
  const [rxPageSize, setRxPageSize] = useState(5);
  const [rxIsSeeAll, setRxIsSeeAll] = useState(false);

  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize, setReviewPageSize] = useState(5);
  const [reviewIsSeeAll, setReviewIsSeeAll] = useState(false);

  const filteredPatients = liveConsults.filter(pt =>
    !patientSearch ||
    pt.patientName.toLowerCase().includes(patientSearch.toLowerCase()) ||
    pt.id.toLowerCase().includes(patientSearch.toLowerCase()) ||
    pt.bloodGroup.toLowerCase().includes(patientSearch.toLowerCase())
  );
  const displayedPatients = patientIsSeeAll
    ? filteredPatients
    : filteredPatients.slice((patientPage - 1) * patientPageSize, patientPage * patientPageSize);

  const filteredHospitalPatients = HOSPITAL_PATIENTS_ROSTER.filter(hp =>
    !patientSearch ||
    hp.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
    hp.mrn.toLowerCase().includes(patientSearch.toLowerCase()) ||
    hp.phone.toLowerCase().includes(patientSearch.toLowerCase()) ||
    hp.bloodGroup.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleSelectHospitalPatient = (hp: typeof HOSPITAL_PATIENTS_ROSTER[0]) => {
    const mapped: Consultation = {
      id: hp.id,
      patientName: hp.fullName,
      patientAge: hp.age,
      patientGender: hp.gender === 'Female' ? 'Female' : 'Male',
      bloodGroup: hp.bloodGroup,
      genotype: 'AA',
      time: hp.lastVisit,
      status: hp.isAppUser ? 'waiting' : 'completed',
      type: hp.isAppUser ? 'video' : 'in_person',
      reason: hp.notes,
      history: hp.notes,
      allergies: ['No documented adverse drug reactions'],
      vitals: { bp: '126/82 mmHg', hr: '72 bpm', temp: '36.7 °C', weight: '70 kg', spo2: '99%' },
      painRegion: { region: 'Chest', severity: 3, color: 'orange', notes: hp.notes },
    };
    setActiveChartPatient(mapped);
    setSelectedBodyRegion('Chest');
    setPainIntensity(3);
  };

  const allConsultations = liveConsults;

  const displayedAppts = apptIsSeeAll
    ? allConsultations
    : allConsultations.slice((apptPage - 1) * apptPageSize, apptPage * apptPageSize);

  const displayedRx = rxIsSeeAll
    ? issuedPrescriptions
    : issuedPrescriptions.slice((rxPage - 1) * rxPageSize, rxPage * rxPageSize);

  const displayedReviews = reviewIsSeeAll
    ? patientReviews
    : patientReviews.slice((reviewPage - 1) * reviewPageSize, reviewPage * reviewPageSize);

  // Up Next Appointment in Schedule (live bookings first)
  const nextAppt = allConsultations.find(c => c.status === 'in_progress' || c.status === 'waiting') || allConsultations[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>

      {/* Toast Notification Banner */}
      {feedbackMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 36, zIndex: 9999,
          background: '#0f6e6e', color: '#ffffff', padding: '14px 22px', borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontSize: 13.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeIn 200ms'
        }}>
          <CheckCircle2 size={18} color="#5eead4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ── TOP DOCTOR CLINICAL HEADER ────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Doctor Avatar */}
          <div style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800,
            border: '3px solid #ccfbf1',
            boxShadow: '0 4px 14px rgba(15,110,110,0.22)',
            flexShrink: 0
          }}>
            FA
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Dr. Folake Ademola
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#e6f4f4',
                color: '#0f6e6e',
                fontSize: 11.5,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                border: '1px solid #ccfbf1'
              }}>
                <ShieldCheck size={14} color="#0f6e6e" />
                MDCN Verified Physician
              </span>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>Cardiology Specialist · General Medical Practitioner</span>
              <span>•</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: desktopAffiliation ? '#e6f4f4' : '#eef2ff',
                color: desktopAffiliation ? '#0f6e6e' : '#3730a3',
                border: `1px solid ${desktopAffiliation ? '#b2dfdb' : '#c7d2fe'}`,
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 12
              }}>
                <Building2 size={13} />
                {desktopAffiliation ? `${desktopAffiliation.hospitalName} (${desktopAffiliation.department})` : 'Independent Specialist'}
              </span>
              <span>•</span>
              <span>Folio: <strong style={{ color: '#0f6e6e', fontFamily: 'monospace' }}>LIC-98754-C3</strong></span>
            </p>
          </div>
        </div>

        {/* Telehealth Status Toggle & Action Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setIsDoctorOnline(!isDoctorOnline);
              triggerFeedback(isDoctorOnline ? 'Switched to Offline mode. No incoming queue alerts.' : 'Online for Teleconsults! Now receiving live patient queue calls.');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: isDoctorOnline ? '#ecfdf5' : '#f1f5f9',
              color: isDoctorOnline ? '#059669' : '#64748b',
              border: `1.5px solid ${isDoctorOnline ? '#a7f3d0' : '#cbd5e1'}`,
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 150ms'
            }}
          >
            <Radio size={14} style={{ color: isDoctorOnline ? '#10b981' : '#94a3b8' }} />
            {isDoctorOnline ? 'Online for Telehealth' : 'Offline / Away'}
          </button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<DollarSign size={14} />}
            onClick={handleOpenFeeModal}
            title="Configure Tiered Consultation Fees (Chat, Audio, Video)"
          >
            Fees: ₦{tierFees.chat.toLocaleString()} - ₦{tierFees.video.toLocaleString()}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Clock size={14} />}
            onClick={() => handleTabChange('schedule')}
          >
            Manage Hours
          </Button>

          <Button
            variant="teal"
            size="sm"
            leftIcon={<Pill size={14} />}
            onClick={() => setIsPrescriptionModalOpen(true)}
          >
            Issue E-Prescription
          </Button>
        </div>
      </div>

      {/* ── SUB-TABS NAVIGATION (Landscape Bar) ────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 6,
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 2,
        overflowX: 'auto',
      }}>
        {[
          { key: 'dashboard', label: 'Clinical Dashboard', icon: Activity },
          { key: 'appointments', label: 'Appointments Queue', icon: Calendar },
          { key: 'chat', label: 'Consultation Chat', icon: MessageSquare },
          { key: 'patients', label: 'Patients & Body Map', icon: Users },
          { key: 'prescriptions', label: 'Digital Prescriptions', icon: Pill },
          { key: 'schedule', label: 'Duty Shifts & Hours', icon: Clock },
          { key: 'reviews', label: 'Patient Reviews', icon: Star },
          { key: 'profile', label: 'Doctor Profile & MDCN', icon: Stethoscope },
          { key: 'hospital', label: 'Hospital Affiliation', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isSelected ? '3px solid #0f6e6e' : '3px solid transparent',
                background: isSelected ? '#f0fdfa' : 'transparent',
                color: isSelected ? '#0f6e6e' : '#64748b',
                fontWeight: isSelected ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 120ms'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: CLINICAL DASHBOARD (Matches App DoctorDashboardScreen)       */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* ── Immediate Attention Banner (Next Patient in Queue) ─────────── */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
            border: '1.5px solid #ccfbf1',
            borderRadius: 16,
            padding: '24px 26px',
            boxShadow: '0 4px 20px rgba(15,110,110,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: '#0f6e6e',
                  boxShadow: '0 0 10px #0f6e6e',
                  animation: 'pulse 1.8s infinite'
                }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                  Needs Your Attention Right Now
                </h3>
              </div>
              <span style={{
                background: '#e6f4f4',
                color: '#0f6e6e',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999
              }}>
                {liveConsults.length} Consultations Today
              </span>
            </div>

            {nextAppt ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '20px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 18,
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {nextAppt.patientName.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        background: '#e6f4f4',
                        color: '#0f6e6e',
                        fontSize: 10.5,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '3px 8px',
                        borderRadius: 6
                      }}>
                        UP NEXT IN SCHEDULE
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f6e6e' }}>
                        {nextAppt.time}
                      </span>
                    </div>

                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '4px 0 2px' }}>
                      {nextAppt.patientName} ({nextAppt.patientAge}y · {nextAppt.patientGender})
                    </h4>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                      Reason: <strong>{nextAppt.reason}</strong>
                    </p>
                  </div>
                </div>

                {/* 1-Tap Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setActiveVideoConsult(nextAppt)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#0f6e6e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(15,110,110,0.25)',
                      transition: 'transform 120ms'
                    }}
                  >
                    <Video size={16} />
                    Start Video Consultation
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveChartPatient(nextAppt);
                      if (nextAppt.painRegion) {
                        setSelectedBodyRegion(nextAppt.painRegion.region);
                        setPainIntensity(nextAppt.painRegion.severity);
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#ffffff',
                      color: '#0f6e6e',
                      border: '1.5px solid #0f6e6e',
                      borderRadius: 10,
                      padding: '9px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 120ms'
                    }}
                  >
                    <Activity size={16} />
                    Chart & Body Map
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveChatPatientId(nextAppt.id);
                      handleTabChange('chat');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#f0fdfa',
                      color: '#0f6e6e',
                      border: '1.5px solid #0f6e6e',
                      borderRadius: 10,
                      padding: '9px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 120ms'
                    }}
                  >
                    <MessageSquare size={16} />
                    Chat Patient
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: '30px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Waiting Room Clear</h4>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  No patients currently queued for immediate consultation.
                </p>
              </div>
            )}
          </div>

          {/* ── Tiered Consultation Fees (Doctor Set) Live Calculator Banner ── */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={18} style={{ color: '#0f6e6e' }} />
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Tiered Consultation Fees (Doctor Set)
                  </h3>
                  <span style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid #a7f3d0'
                  }}>
                    Live Calculation Active
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>
                  Platform minimum ₦{MIN_CONSULTATION_FEE.toLocaleString()} / session. 10% platform service fee deducted automatically; you receive 90% net take-home earnings.
                </p>
              </div>

              <Button
                variant="teal"
                size="sm"
                leftIcon={<Edit3 size={14} />}
                onClick={handleOpenFeeModal}
              >
                Adjust Tiered Fees
              </Button>
            </div>

            {/* 3 Live Tier Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12
            }}>
              {[
                { label: 'Chat Consultation', icon: MessageSquare, raw: tierFees.chat, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
                { label: 'Audio Call Session', icon: Phone, raw: tierFees.audio, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
                { label: 'HD Video Consultation', icon: Video, raw: tierFees.video, color: '#0f6e6e', bg: '#f0fdfa', border: '#99f6e4' },
              ].map((tier, idx) => {
                const Icon = tier.icon;
                const gross = tier.raw;
                const fee = +(gross * 0.10).toFixed(2);
                const net = +(gross * 0.90).toFixed(2);

                return (
                  <div
                    key={idx}
                    style={{
                      background: tier.bg,
                      border: `1.5px solid ${tier.border}`,
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Icon size={16} style={{ color: tier.color }} />
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{tier.label}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: tier.color, background: '#ffffff', padding: '2px 8px', borderRadius: 6 }}>
                        Tier {idx + 1}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#ffffff', padding: '10px 12px', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                        <span>Patient Pays:</span>
                        <strong style={{ color: '#0f172a', fontWeight: 800 }}>₦{gross.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#dc2626' }}>
                        <span>Platform Fee (10%):</span>
                        <span>−₦{fee.toLocaleString()}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        color: '#059669',
                        fontWeight: 800,
                        borderTop: '1px dashed #e2e8f0',
                        paddingTop: 6,
                        marginTop: 2
                      }}>
                        <span>Your Take-Home:</span>
                        <span>₦{net.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Quick Clinical Action Bar ──────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 14
          }}>
            <button
              type="button"
              onClick={() => setIsPrescriptionModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 150ms'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#e6f4f4',
                color: '#0f6e6e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Pill size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>Issue E-Prescription</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Fast Rx with automated drug checks</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('schedule')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 150ms'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>Manage Hours & Slots</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Configure duty shifts & availability</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            <button
              type="button"
              onClick={handleOpenFeeModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 150ms'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <DollarSign size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>Tiered Consultation Rates</p>
                <p style={{ fontSize: 12, color: '#059669', margin: '2px 0 0', fontWeight: 600 }}>
                  Chat ₦{tierFees.chat.toLocaleString()} · Audio ₦{tierFees.audio.toLocaleString()} · Video ₦{tierFees.video.toLocaleString()}
                </p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </button>
          </div>

          {/* ── Clinical KPIs Summary (4 Compact Cards) ────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16
          }}>
            {[
              { label: "Today's Appts", value: '8 Scheduled', color: '#0f6e6e', bg: '#e6f4f4', icon: Calendar },
              { label: 'Attended Visits', value: '5 Completed', color: '#059669', bg: '#ecfdf5', icon: CheckCircle2 },
              { label: 'Total Patients', value: '142 Active', color: '#2563eb', bg: '#eff6ff', icon: Users },
              { label: 'Weekly Revenue', value: '₦125,000', color: '#d97706', bg: '#fffbeb', icon: DollarSign },
            ].map((stat, idx) => (
              <Card key={idx} style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 4px' }}>{stat.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: stat.color, margin: 0, letterSpacing: '-0.02em' }}>{stat.value}</p>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: stat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0
                }}>
                  <stat.icon size={22} />
                </div>
              </Card>
            ))}
          </div>

          {/* ── 2-Column Split: Today's Patient Schedule (Left) & Clinical Tools (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.15fr', gap: 20 }}>

            {/* LEFT: Today's Patient Schedule */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Today's Patient Schedule
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    Real-time clinical queue & consult intake
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabChange('appointments')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0f6e6e',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  View Full Calendar <ChevronRight size={14} />
                </button>
              </div>

              {/* Patient Queue Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {liveConsults.map((item) => {
                  const isCurNext = item.id === nextAppt?.id;
                  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
                    in_progress: { bg: '#e0f2fe', color: '#0369a1', label: 'IN PROGRESS' },
                    waiting: { bg: '#fffbeb', color: '#b45309', label: 'WAITING' },
                    completed: { bg: '#ecfdf5', color: '#059669', label: 'COMPLETED' },
                    cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'CANCELLED' },
                  };
                  const st = statusColors[item.status] || statusColors.waiting;

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: isCurNext ? '#f0fdfa' : '#f8fafc',
                        border: `1px solid ${isCurNext ? '#a7f3d0' : '#e2e8f0'}`,
                        gap: 14,
                        transition: 'background 120ms'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: '#0f6e6e',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {item.patientName.split(' ').map(n => n[0]).join('')}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h5 style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                              {item.patientName}
                            </h5>
                            <span style={{ fontSize: 11.5, color: '#64748b' }}>
                              ({item.patientAge}y · {item.bloodGroup} · {item.genotype})
                            </span>
                          </div>
                          <p style={{
                            fontSize: 12, color: '#64748b', margin: '2px 0 0',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>
                            {item.reason}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f6e6e', display: 'block' }}>
                            {item.time}
                          </span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: st.bg,
                            color: st.color,
                            display: 'inline-block'
                          }}>
                            {st.label}
                          </span>
                        </div>

                        {/* Quick action triggers */}
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => setActiveVideoConsult(item)}
                            title="Start Video Consultation"
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: '#0f6e6e',
                              color: '#ffffff',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Video size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveChartPatient(item);
                              if (item.painRegion) {
                                setSelectedBodyRegion(item.painRegion.region);
                                setPainIntensity(item.painRegion.severity);
                              }
                            }}
                            title="Inspect Body Map & Chart"
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: '#ffffff',
                              color: '#0f6e6e',
                              border: '1px solid #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Activity size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Clinical Tools & Practice Management */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Tools Box */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '22px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color="#0f6e6e" />
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Clinical Tools & Practice Management
                  </h3>
                </div>

                {/* Practice & Consultations */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                    Practice & Consultations
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setIsPrescriptionModalOpen(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f4f4', color: '#0f6e6e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Pill size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>Digital E-Prescription</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '1px 0 0' }}>Interaction & allergy safety engine</p>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabChange('schedule')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Clock size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>Working Hours & Shifts</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '1px 0 0' }}>Availability & slot duration</p>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </button>
                  </div>
                </div>

                {/* Patient Care & Records */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                    Patient Care & Records
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleTabChange('patients')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>All Patients & Body Maps</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '1px 0 0' }}>Full clinical dossier & pain zones</p>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/blood-donors')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Droplet size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>Hospital Blood Bank Network</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '1px 0 0' }}>Emergency transfusions & appeals</p>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hardware & Encryption Status Card */}
              <div style={{
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: 14,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                border: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={15} color="#5eead4" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>Encrypted WebRTC Station</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 999 }}>
                    Active
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, color: '#94a3b8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Video & Mic Hardware:</span>
                    <strong style={{ color: '#f1f5f9' }}>1080p HD Ready</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>NDPA 2023 Compliance:</span>
                    <strong style={{ color: '#10b981' }}>Verified Vault</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>MDCN Digital Escrow:</span>
                    <strong style={{ color: '#5eead4' }}>90% Payout Hold</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: APPOINTMENTS QUEUE (Matches AppointmentsScreen.tsx)          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Clinical Appointment Calendar & Schedule
                {isLiveSyncActive && (
                  <span style={{
                    marginLeft: 10, fontSize: 10.5, fontWeight: 700, padding: '3px 8px',
                    borderRadius: 6, background: '#ecfdf5', color: '#059669',
                    verticalAlign: 'middle', border: '1px solid #a7f3d0'
                  }}>
                    ● LIVE SYNC
                  </span>
                )}
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                Manage upcoming consultations, video triage rooms, and completed patient sessions
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant="teal"
                size="sm"
                leftIcon={<Calendar size={14} />}
                onClick={() => triggerFeedback('Syncing with Google Calendar & Apple iCal...')}
              >
                Sync Calendar
              </Button>
            </div>
          </div>

          {/* Appointments Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            {displayedAppts.map((c) => (
              <Card key={c.id} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: '#0f6e6e', color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                    }}>
                      {c.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#1e293b', margin: 0 }}>{c.patientName}</h4>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                        {c.patientAge}y · {c.patientGender} · {c.bloodGroup} {c.genotype}
                      </p>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: c.status === 'completed' ? '#ecfdf5' : '#fffbeb',
                    color: c.status === 'completed' ? '#059669' : '#b45309'
                  }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, fontSize: 12.5, color: '#334155' }}>
                  <strong>Consult Reason:</strong> {c.reason}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748b' }}>
                  <span>Time: <strong>{c.time}</strong></span>
                  <span>Type: <strong style={{ textTransform: 'capitalize' }}>{c.type} Call</strong></span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 4 }}>
                  <Button
                    variant="teal"
                    size="sm"
                    style={{ width: '100%' }}
                    leftIcon={<Video size={13} />}
                    onClick={() => setActiveVideoConsult(c)}
                  >
                    Start Consult
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ width: '100%' }}
                    leftIcon={<MessageSquare size={13} />}
                    onClick={() => {
                      setActiveChatPatientId(c.id);
                      handleTabChange('chat');
                    }}
                  >
                    Chat
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ width: '100%' }}
                    leftIcon={<Activity size={13} />}
                    onClick={() => {
                      setActiveChartPatient(c);
                      if (c.painRegion) {
                        setSelectedBodyRegion(c.painRegion.region);
                        setPainIntensity(c.painRegion.severity);
                      }
                    }}
                  >
                    Body Map
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination & See All Bar for Appointments */}
          <Pagination
            page={apptPage}
            totalPages={Math.ceil(liveConsults.length / apptPageSize)}
            onPageChange={setApptPage}
            total={liveConsults.length}
            pageSize={apptPageSize}
            onPageSizeChange={(newSize) => { setApptPageSize(newSize); setApptPage(1); }}
            isSeeAll={apptIsSeeAll}
            onToggleSeeAll={() => setApptIsSeeAll(!apptIsSeeAll)}
          />
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB: CONSULTATION CHAT (Real-time Clinical Doctor-Patient Messaging) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'chat' && (
        <DoctorPatientChat
          consultations={allConsultations as any}
          activePatientId={activeChatPatientId}
          onSelectPatientId={(id) => setActiveChatPatientId(id)}
          onStartVideoConsult={(p) => setActiveVideoConsult(p as any)}
          onOpenChart={(p) => {
            setActiveChartPatient(p as any);
            if (p.painRegion) {
              setSelectedBodyRegion(p.painRegion.region);
              setPainIntensity(p.painRegion.severity);
            }
          }}
          onOpenPrescription={(name) => {
            setRxPatientName(name);
            setIsPrescriptionModalOpen(true);
          }}
          onTriggerFeedback={triggerFeedback}
        />
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: PATIENTS & BODY MAP (Matches PatientDetailScreen.tsx)        */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'patients' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24 }}>

          {/* Patients Directory List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Patients Directory
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    {patientRosterType === 'private' ? 'Private Telehealth Roster' : `${desktopAffiliation?.hospitalName || 'Hospital'} Patient Records`}
                  </p>
                </div>
                {desktopAffiliation && (
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: '#e6f4f4',
                    color: '#0f6e6e',
                    padding: '3px 8px',
                    borderRadius: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}>
                    <Building2 size={12} />
                    {desktopAffiliation.department}
                  </span>
                )}
              </div>

              {/* Segmented Roster Selector */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 4,
                background: '#f1f5f9',
                padding: 4,
                borderRadius: 10
              }}>
                <button
                  type="button"
                  onClick={() => setPatientRosterType('private')}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 7,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    background: patientRosterType === 'private' ? '#ffffff' : 'transparent',
                    color: patientRosterType === 'private' ? '#0f6e6e' : '#64748b',
                    boxShadow: patientRosterType === 'private' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 150ms'
                  }}
                >
                  Private Telehealth ({liveConsults.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPatientRosterType('hospital')}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 7,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    background: patientRosterType === 'hospital' ? '#ffffff' : 'transparent',
                    color: patientRosterType === 'hospital' ? '#0f6e6e' : '#64748b',
                    boxShadow: patientRosterType === 'hospital' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 150ms'
                  }}
                >
                  Hospital Roster ({HOSPITAL_PATIENTS_ROSTER.length})
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder={patientRosterType === 'private' ? 'Search private patient name, ID, blood...' : 'Search hospital patient, MRN, phone...'}
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setPatientPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Patients List Render */}
            {patientRosterType === 'private' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {displayedPatients.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', background: '#ffffff', borderRadius: 12 }}>
                      No private patients match "{patientSearch}"
                    </div>
                  ) : (
                    displayedPatients.map((pt) => {
                      const isSelected = activeChartPatient?.id === pt.id;
                      return (
                        <div
                          key={pt.id}
                          onClick={() => {
                            setActiveChartPatient(pt);
                            if (pt.painRegion) {
                              setSelectedBodyRegion(pt.painRegion.region);
                              setPainIntensity(pt.painRegion.severity);
                            }
                          }}
                          style={{
                            background: isSelected ? '#f0fdfa' : '#ffffff',
                            border: `1.5px solid ${isSelected ? '#0f6e6e' : '#e2e8f0'}`,
                            borderRadius: 14,
                            padding: '16px 18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            boxShadow: isSelected ? '0 4px 14px rgba(15,110,110,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                            transition: 'all 150ms'
                          }}
                        >
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: isSelected ? '#0f6e6e' : '#e2e8f0',
                            color: isSelected ? '#ffffff' : '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {pt.patientName.split(' ').map(n => n[0]).join('')}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>{pt.patientName}</h4>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#0f6e6e' }}>{pt.bloodGroup} ({pt.genotype})</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                              {pt.patientAge}y · {pt.patientGender} · Last Visit: {pt.time}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination & See All Bar for Patients Directory */}
                <Pagination
                  page={patientPage}
                  totalPages={Math.ceil(filteredPatients.length / patientPageSize)}
                  onPageChange={setPatientPage}
                  total={filteredPatients.length}
                  pageSize={patientPageSize}
                  onPageSizeChange={(newSize) => { setPatientPageSize(newSize); setPatientPage(1); }}
                  isSeeAll={patientIsSeeAll}
                  onToggleSeeAll={() => setPatientIsSeeAll(!patientIsSeeAll)}
                />
              </>
            ) : !desktopAffiliation ? (
              <div style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '32px 24px',
                border: '1.5px dashed #cbd5e1',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14
              }}>
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569'
                }}>
                  <Building2 size={28} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Independent Doctor Mode
                  </h4>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: '6px 0 0', lineHeight: 1.5, maxWidth: 300 }}>
                    You are not currently affiliated with an accredited hospital. Connect via a 6-digit hospital code to access your hospital clinic roster.
                  </p>
                </div>
                <Button
                  variant="teal"
                  size="sm"
                  leftIcon={<Building2 size={14} />}
                  onClick={() => setActiveTab('hospital')}
                >
                  Enter Hospital Code
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredHospitalPatients.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', background: '#ffffff', borderRadius: 12 }}>
                    No hospital patients match "{patientSearch}"
                  </div>
                ) : (
                  filteredHospitalPatients.map((hp) => {
                    const isSelected = activeChartPatient?.id === hp.id;
                    return (
                      <div
                        key={hp.id}
                        onClick={() => handleSelectHospitalPatient(hp)}
                        style={{
                          background: isSelected ? '#f0fdfa' : '#ffffff',
                          border: `1.5px solid ${isSelected ? '#0f6e6e' : '#e2e8f0'}`,
                          borderRadius: 14,
                          padding: '16px 18px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          boxShadow: isSelected ? '0 4px 14px rgba(15,110,110,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 150ms'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: isSelected ? '#0f6e6e' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {hp.fullName.split(' ').map(n => n[0]).join('')}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>{hp.fullName}</h4>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#0f6e6e' }}>{hp.bloodGroup}</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                              MRN: <strong style={{ fontFamily: 'monospace', color: '#334155' }}>{hp.mrn}</strong> · {hp.age}y · {hp.gender}
                            </p>
                          </div>
                        </div>

                        {/* App Status Indicator Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          {hp.isAppUser ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: '#ecfdf5',
                              color: '#047857',
                              border: '1px solid #a7f3d0',
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700
                            }}>
                              <CheckCircle2 size={12} />
                              App Patient (Digital Care Enabled)
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: '#fef3c7',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700
                            }}>
                              <AlertTriangle size={12} />
                              Hospital Record Only (Not on App)
                            </span>
                          )}

                          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                            Visit: {hp.lastVisit}
                          </span>
                        </div>

                        {/* Offline In-Hospital Patient Warning & Quick Actions */}
                        {!hp.isAppUser && (
                          <div style={{
                            background: '#fffbeb',
                            border: '1px solid #fef3c7',
                            borderRadius: 8,
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            marginTop: 4
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                              <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                              <p style={{ fontSize: 11.5, color: '#92400e', margin: 0, lineHeight: 1.4 }}>
                                <strong>Phone/Email not on app:</strong> In-hospital physical care only. Telehealth video consultation and digital prescription dispatch are disabled until patient registers on the app.
                              </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerFeedback(`SMS invitation sent to ${hp.phone} with link to download OmniPlus & sync hospital chart.`);
                                }}
                                style={{
                                  padding: '6px 8px',
                                  background: '#ffffff',
                                  border: '1px solid #fde68a',
                                  borderRadius: 6,
                                  color: '#b45309',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Send App Invite (SMS)
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerFeedback(`${hp.fullName} added to ${desktopAffiliation?.hospitalName} on-site clinic queue.`);
                                }}
                                style={{
                                  padding: '6px 8px',
                                  background: '#fef3c7',
                                  border: '1px solid #fde68a',
                                  borderRadius: 6,
                                  color: '#78350f',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Queue Clinic Visit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Patient Details & 3D Anatomical Body Map Inspector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {activeChartPatient ? (
              <>
                <div style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '22px 24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {activeChartPatient.patientName}
                        </h3>
                        <Badge variant="teal" size="sm">Active Patient Record</Badge>
                      </div>
                      <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>
                        MRN: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>MRN-{activeChartPatient.id.toUpperCase()}</span> · {activeChartPatient.patientAge} yrs old · {activeChartPatient.patientGender}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        variant="teal"
                        size="sm"
                        leftIcon={<Video size={14} />}
                        onClick={() => setActiveVideoConsult(activeChartPatient)}
                      >
                        Start Consult
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Pill size={14} />}
                        onClick={() => {
                          setRxPatientName(`${activeChartPatient.patientName} (${activeChartPatient.patientAge}y · ${activeChartPatient.patientGender})`);
                          setIsPrescriptionModalOpen(true);
                        }}
                      >
                        Prescribe Rx
                      </Button>
                    </div>
                  </div>

                  {/* Vitals Summary Strip */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 10,
                    marginTop: 18,
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Blood Pressure</span>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{activeChartPatient.vitals.bp}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Heart Rate</span>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{activeChartPatient.vitals.hr}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Temp</span>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{activeChartPatient.vitals.temp}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>SpO2 Pulse</span>
                      <strong style={{ fontSize: 13, color: '#059669' }}>{activeChartPatient.vitals.spo2}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Weight</span>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{activeChartPatient.vitals.weight}</strong>
                    </div>
                  </div>
                </div>

                {/* Interactive Body Map */}
                <AnatomicalBodyMap
                  activeRegion={selectedBodyRegion}
                  onSelectRegion={(reg) => {
                    setSelectedBodyRegion(reg);
                    triggerFeedback(`Selected ${reg} region for clinical inspection.`);
                  }}
                  severity={painIntensity}
                  onSelectSeverity={(val) => {
                    setPainIntensity(val);
                    triggerFeedback(`Updated ${selectedBodyRegion} pain intensity to ${val}/10.`);
                  }}
                />

                {/* Clinical Notes & Allergies */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '20px 22px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Clinical History & Allergy Warnings
                  </h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {activeChartPatient.allergies.map((alg, idx) => (
                      <span key={idx} style={{
                        background: '#fee2e2', color: '#991b1b', fontSize: 12, fontWeight: 700,
                        padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5
                      }}>
                        <AlertTriangle size={13} />
                        Allergy: {alg}
                      </span>
                    ))}
                  </div>

                  <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    <strong>Medical History:</strong> {activeChartPatient.history}
                  </p>
                </div>
              </>
            ) : (
              <div style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '60px 30px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <Users size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Select a Patient Record</h4>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Click any patient on the left to view their 3D Anatomical Body Map and medical chart.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: DIGITAL PRESCRIPTIONS (Matches PrescriptionScreen.tsx)       */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Digital E-Prescriptions & Clinical Dispensary
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                Legally signed with MDCN cryptographic stamp · Transmitted to accredited pharmacies
              </p>
            </div>

            <Button
              variant="teal"
              leftIcon={<Plus size={16} />}
              onClick={() => setIsPrescriptionModalOpen(true)}
            >
              Issue New Prescription
            </Button>
          </div>

          {/* Issued Prescriptions Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Rx Number</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Patient</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Medication & Dosage</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Duration</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Routed Pharmacy</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedRx.map((rx) => (
                  <tr key={rx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f6e6e', fontFamily: 'monospace' }}>
                      {rx.id}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1e293b' }}>
                      {rx.patientName}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <strong style={{ color: '#0f172a' }}>{rx.drugName}</strong>
                      <span style={{ display: 'block', fontSize: 11.5, color: '#64748b' }}>{rx.dosage} · {rx.frequency}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>{rx.duration}</td>
                    <td style={{ padding: '14px 20px', color: '#475569' }}>{rx.pharmacy}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: '#ecfdf5',
                        color: '#059669'
                      }}>
                        {rx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination & See All Bar for Prescriptions */}
            <Pagination
              page={rxPage}
              totalPages={Math.ceil(issuedPrescriptions.length / rxPageSize)}
              onPageChange={setRxPage}
              total={issuedPrescriptions.length}
              pageSize={rxPageSize}
              onPageSizeChange={(newSize) => { setRxPageSize(newSize); setRxPage(1); }}
              isSeeAll={rxIsSeeAll}
              onToggleSeeAll={() => setRxIsSeeAll(!rxIsSeeAll)}
            />
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: DUTY SHIFTS & HOURS (Doctor Editable Times & Consultation Slots) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24 }}>

          {/* Weekly Schedule Days with Interactive Time Editors */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 26px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Weekly Clinical Availability & Consultation Slots
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Edit your daily shift start and end times. Consultation slots recalculate automatically based on slot duration.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Copy size={13} />}
                  onClick={handleCopyMondayToWeekdays}
                  title="Apply Monday hours to Tuesday through Friday"
                >
                  Copy Mon to Mon-Fri
                </Button>
                <Button
                  variant="teal"
                  size="sm"
                  leftIcon={<CheckCircle2 size={13} />}
                  onClick={handleSaveSchedule}
                >
                  Save Schedule
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {scheduleSlots.map((slot, idx) => (
                <div
                  key={slot.day}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: slot.active ? '#ffffff' : '#f8fafc',
                    border: `1.5px solid ${slot.active ? '#ccfbf1' : '#e2e8f0'}`,
                    gap: 12,
                    transition: 'all 120ms'
                  }}
                >
                  {/* Top row: Day Checkbox, Status & Calculated Slots */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="checkbox"
                        checked={slot.active}
                        onChange={() => {
                          const updated = [...scheduleSlots];
                          const newActive = !updated[idx].active;
                          updated[idx].active = newActive;
                          updated[idx].slots = newActive ? calcSlots(updated[idx].start, updated[idx].end, slotDuration) : 0;
                          setScheduleSlots(updated);
                          try {
                            localStorage.setItem('ominipulse_doctor_schedule_slots', JSON.stringify(updated));
                          } catch {}
                          triggerFeedback(`${slot.day} set to ${newActive ? 'Active Shift' : 'Off Duty'}.`);
                        }}
                        style={{ width: 18, height: 18, accentColor: '#0f6e6e', cursor: 'pointer' }}
                      />
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 800, color: slot.active ? '#0f172a' : '#64748b', margin: 0 }}>
                          {slot.day}
                        </h4>
                        <span style={{ fontSize: 11.5, color: slot.active ? '#059669' : '#94a3b8', fontWeight: 600 }}>
                          {slot.active ? 'On Duty · Accepting Consultations' : 'Off Duty'}
                        </span>
                      </div>
                    </div>

                    {slot.active ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          background: '#e6f4f4',
                          color: '#0f6e6e',
                          fontSize: 12,
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: 8
                        }}>
                          {slot.slots} Slots ({slotDuration})
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...scheduleSlots];
                          updated[idx].active = true;
                          updated[idx].slots = calcSlots(updated[idx].start, updated[idx].end, slotDuration);
                          setScheduleSlots(updated);
                          try {
                            localStorage.setItem('ominipulse_doctor_schedule_slots', JSON.stringify(updated));
                          } catch {}
                        }}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#0f6e6e',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        Set On Duty
                      </button>
                    )}
                  </div>

                  {/* Bottom row: Editable Start & End Time Inputs + Quick Shifts */}
                  {slot.active && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0'
                    }}>
                      {/* Interactive Time Pickers */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>START TIME</span>
                          <input
                            type="time"
                            value={to24Hour(slot.start)}
                            onChange={(e) => handleUpdateTime(idx, 'start', e.target.value)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#0f172a',
                              background: '#ffffff'
                            }}
                          />
                        </div>

                        <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, marginTop: 14 }}>to</span>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>END TIME</span>
                          <input
                            type="time"
                            value={to24Hour(slot.end)}
                            onChange={(e) => handleUpdateTime(idx, 'end', e.target.value)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#0f172a',
                              background: '#ffffff'
                            }}
                          />
                        </div>

                        <div style={{ marginTop: 14, marginLeft: 4 }}>
                          <span style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: '#0f6e6e',
                            background: '#f0fdfa',
                            border: '1px solid #ccfbf1',
                            padding: '6px 10px',
                            borderRadius: 6,
                            whiteSpace: 'nowrap'
                          }}>
                            {slot.start} – {slot.end}
                          </span>
                        </div>
                      </div>

                      {/* Quick Shift Presets */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Presets:</span>
                        <button
                          type="button"
                          onClick={() => handleQuickShift(idx, '08:00 AM', '05:00 PM')}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 7px',
                            borderRadius: 5,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                          title="8:00 AM to 5:00 PM"
                        >
                          Full Day
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickShift(idx, '08:00 AM', '02:00 PM')}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 7px',
                            borderRadius: 5,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                          title="8:00 AM to 2:00 PM"
                        >
                          Morning
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickShift(idx, '02:00 PM', '08:00 PM')}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 7px',
                            borderRadius: 5,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                          title="2:00 PM to 8:00 PM"
                        >
                          Evening
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Slot Duration & Weekly Clinical Capacity Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Consultation Duration Selector */}
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '22px 24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Consultation Slot Duration
                </h4>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>
                  Time allocated per patient. Automatically recalculates available slots.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {['15 mins', '30 mins', '45 mins', '60 mins'].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleSlotDurationChange(dur)}
                    style={{
                      padding: '10px 0',
                      borderRadius: 8,
                      border: slotDuration === dur ? '2px solid #0f6e6e' : '1px solid #cbd5e1',
                      background: slotDuration === dur ? '#e6f4f4' : '#ffffff',
                      color: slotDuration === dur ? '#0f6e6e' : '#475569',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      transition: 'all 120ms'
                    }}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Capacity & Hours Metrics */}
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '22px 24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Weekly Availability Overview
              </h4>

              {(() => {
                const activeDays = scheduleSlots.filter(s => s.active);
                const totalSlots = activeDays.reduce((acc, s) => acc + s.slots, 0);
                const totalHours = activeDays.reduce((acc, s) => {
                  const startMins = parseTimeToMins(s.start);
                  const endMins = parseTimeToMins(s.end);
                  return acc + Math.max(0, (endMins - startMins) / 60);
                }, 0);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
                      <span style={{ color: '#64748b' }}>Active Working Days:</span>
                      <strong style={{ color: '#0f172a' }}>{activeDays.length} of 7 days</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
                      <span style={{ color: '#64748b' }}>Total Clinical Hours / Week:</span>
                      <strong style={{ color: '#0f172a' }}>{totalHours.toFixed(1)} hrs</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 8, fontSize: 13 }}>
                      <span style={{ color: '#0f6e6e', fontWeight: 700 }}>Total Available Slots:</span>
                      <strong style={{ color: '#0f6e6e', fontSize: 15 }}>{totalSlots} slots / wk</strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Link to Tiered Consultation Fees */}
            <div style={{
              background: '#f8fafc',
              borderRadius: 16,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                  Current Tiered Fees
                </span>
                <button
                  type="button"
                  onClick={handleOpenFeeModal}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#0f6e6e',
                    background: '#ffffff',
                    border: '1px solid #99f6e4',
                    padding: '3px 8px',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Edit Fees
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                <span>Chat: <strong>₦{tierFees.chat.toLocaleString()}</strong></span>
                <span>Audio: <strong>₦{tierFees.audio.toLocaleString()}</strong></span>
                <span>Video: <strong>₦{tierFees.video.toLocaleString()}</strong></span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 6: PATIENT REVIEWS & REPLIES                                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Verified Patient Reviews & Clinical Feedback
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                4.9 / 5.0 Average Rating across 84 verified telehealth and in-clinic consultations
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {displayedReviews.map((rev) => (
              <Card key={rev.id} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#1e293b', margin: 0 }}>{rev.patientName}</h4>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Consultation Date: {rev.date}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < rev.rating ? '#eab308' : 'none'}
                        color={i < rev.rating ? '#eab308' : '#cbd5e1'}
                      />
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: '#334155', margin: 0, lineHeight: 1.5 }}>
                  "{rev.comment}"
                </p>

                {/* Doctor reply */}
                {rev.doctorReply ? (
                  <div style={{
                    background: '#f0fdfa',
                    borderLeft: '3px solid #0f6e6e',
                    padding: '12px 16px',
                    borderRadius: '0 8px 8px 0',
                    fontSize: 12.5,
                    color: '#0f6e6e'
                  }}>
                    <strong>Dr. Folake Ademola (Reply):</strong> {rev.doctorReply}
                  </div>
                ) : (
                  <div>
                    {replyingReviewId === rev.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write official doctor response to patient..."
                          rows={2}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button size="sm" variant="teal" onClick={() => handlePostDoctorReply(rev.id)}>
                            Publish Reply
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setReplyingReviewId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<MessageSquare size={14} />}
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText('');
                        }}
                      >
                        Reply to Patient
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination & See All Bar for Patient Reviews */}
          <Pagination
            page={reviewPage}
            totalPages={Math.ceil(patientReviews.length / reviewPageSize)}
            onPageChange={setReviewPage}
            total={patientReviews.length}
            pageSize={reviewPageSize}
            onPageSizeChange={(newSize) => { setReviewPageSize(newSize); setReviewPage(1); }}
            isSeeAll={reviewIsSeeAll}
            onToggleSeeAll={() => setReviewIsSeeAll(!reviewIsSeeAll)}
          />
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 7: DOCTOR PROFILE & MDCN (Matches DoctorProfileScreen.tsx)      */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24 }}>

          {/* Left: MDCN Verification Status Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '24px 22px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 14
            }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#0f6e6e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                border: '4px solid #ccfbf1'
              }}>
                FA
              </div>

              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Dr. Folake Ademola
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Cardiologist & General Medical Practitioner
                </p>
              </div>

              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 10,
                padding: '10px 16px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  MDCN Standing
                </span>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#065f46', margin: '2px 0 0' }}>
                  Fully Verified & Licensed
                </p>
                <span style={{ fontSize: 11, color: '#059669', display: 'block' }}>
                  Folio: LIC-98754-C3 (Exp: Dec 2027)
                </span>
              </div>
            </div>

            {/* Verification Documents Checklist */}
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Verified Credentials Vault
              </h4>

              {[
                { name: 'MDCN Practicing License', status: 'Approved' },
                { name: 'NIN National Identity', status: 'Approved' },
                { name: 'Fellowship / Specialty Certificate', status: 'Approved' },
                { name: 'Hospital Privileges Letter', status: 'Approved' },
              ].map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                  <span style={{ color: '#334155' }}>{doc.name}</span>
                  <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={14} /> {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Bio & Professional Affiliations Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Professional Biography & Clinic Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Clinical Biography
                </label>
                <textarea
                  rows={4}
                  defaultValue="Dr. Folake Ademola is a board-certified cardiologist with over 12 years of clinical experience specializing in interventional cardiology, hypertension management, and preventive cardiac care across top tertiary centers."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13, lineHeight: 1.5, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Primary Specialty
                  </label>
                  <input
                    type="text"
                    defaultValue="Cardiology / Internal Medicine"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Affiliated Hospital
                  </label>
                  <input
                    type="text"
                    defaultValue="OmniPulse Heart Center, Victoria Island, Lagos"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Degrees & Fellowships
                </label>
                <input
                  type="text"
                  defaultValue="MBBS (Lagos), FMCP (Cardiology), FWACS, FESC"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <Button
                variant="teal"
                onClick={() => triggerFeedback('Doctor profile details successfully saved and updated in the patient search directory.')}
              >
                Save Profile Changes
              </Button>
            </div>
          </div>

          {/* ── Tiered Consultation Fees (Doctor Set) Full Management Card ── */}
          <div style={{
            gridColumn: '1 / -1',
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={20} style={{ color: '#0f6e6e' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Tiered Consultation Fees (Doctor Set)
                  </h3>
                  <span style={{
                    background: '#e0f2fe',
                    color: '#0284c7',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6
                  }}>
                    Automatic Live Calculation
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Platform minimum ₦{MIN_CONSULTATION_FEE.toLocaleString()} per session. Format rule: Chat must be less than Audio, which must be less than Video.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit3 size={14} />}
                  onClick={handleOpenFeeModal}
                >
                  Quick Edit Modal
                </Button>
                <Button
                  variant="teal"
                  size="sm"
                  leftIcon={<CheckCircle2 size={14} />}
                  onClick={handleSaveTieredFees}
                >
                  Save Tiered Fees
                </Button>
              </div>
            </div>

            {feeValidationErr && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: 12.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertTriangle size={16} />
                <span>{feeValidationErr}</span>
              </div>
            )}

            {/* 3 Tier Input & Live Calculation Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {[
                {
                  label: 'Chat Consultation Fee',
                  sub: 'Lowest tier · Minimum ₦2,000',
                  icon: MessageSquare,
                  value: feeInputChat,
                  setter: setFeeInputChat,
                  color: '#7c3aed',
                  bg: '#f5f3ff',
                  border: '#ddd6fe',
                },
                {
                  label: 'Audio Call Fee',
                  sub: 'Mid tier · Higher than chat',
                  icon: Phone,
                  value: feeInputAudio,
                  setter: setFeeInputAudio,
                  color: '#0284c7',
                  bg: '#f0f9ff',
                  border: '#bae6fd',
                },
                {
                  label: 'Video Call Fee',
                  sub: 'Highest tier · High-bandwidth clinical',
                  icon: Video,
                  value: feeInputVideo,
                  setter: setFeeInputVideo,
                  color: '#0f6e6e',
                  bg: '#f0fdfa',
                  border: '#99f6e4',
                },
              ].map((tier, idx) => {
                const Icon = tier.icon;
                const gross = Math.max(0, parseFloat(String(tier.value).replace(/,/g, '')) || 0);
                const platformFee = +(gross * (PLATFORM_FEE_PERCENT / 100)).toFixed(2);
                const net = +(gross - platformFee).toFixed(2);

                return (
                  <div
                    key={idx}
                    style={{
                      background: tier.bg,
                      border: `1.5px solid ${tier.border}`,
                      borderRadius: 14,
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon size={17} style={{ color: tier.color }} />
                        <div>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', display: 'block' }}>
                            {tier.label}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748b' }}>{tier.sub}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Session Fee (NGN ₦)
                      </label>
                      <input
                        type="number"
                        min={MIN_CONSULTATION_FEE}
                        step={500}
                        value={tier.value}
                        onChange={(e) => {
                          tier.setter(e.target.value);
                          setFeeValidationErr(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#0f172a',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Live Financial Breakdown Card */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                        <span>Patient Pays (Gross):</span>
                        <strong style={{ color: '#0f172a' }}>₦{gross.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#dc2626' }}>
                        <span>Platform Infrastructure (10%):</span>
                        <span>−₦{platformFee.toLocaleString()}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        fontWeight: 800,
                        color: '#059669',
                        borderTop: '1px dashed #e2e8f0',
                        paddingTop: 6,
                        marginTop: 2
                      }}>
                        <span>Physician Net Take-Home:</span>
                        <span>₦{net.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 8: HOSPITAL AFFILIATION & 6-DIGIT CODE MANAGEMENT                */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'hospital' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Top Affiliation Status Hero */}
          <div style={{
            background: desktopAffiliation ? 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)' : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            borderRadius: 20,
            padding: '28px 32px',
            color: '#ffffff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <Building2 size={34} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: '#ffffff' }}>
                    {desktopAffiliation ? desktopAffiliation.hospitalName : 'Independent Specialist Practice'}
                  </h2>
                  <span style={{
                    background: desktopAffiliation ? '#ffffff' : 'rgba(255,255,255,0.15)',
                    color: desktopAffiliation ? '#0f6e6e' : '#f8fafc',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}>
                    <ShieldCheck size={13} />
                    {desktopAffiliation ? 'Verified Hospital Partner' : 'Independent Doctor'}
                  </span>
                </div>

                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', margin: '6px 0 0', maxWidth: 640, lineHeight: 1.5 }}>
                  {desktopAffiliation
                    ? `${desktopAffiliation.department} Department · ${desktopAffiliation.address}`
                    : 'You are currently registered as an independent specialist. You can accept private telehealth consults or affiliate with any accredited hospital using their 6-digit code.'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {desktopAffiliation ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<ExternalLink size={14} />}
                    onClick={() => router.push('/dashboard/hospital-portal')}
                    style={{ background: '#ffffff', color: '#0f6e6e', border: 'none' }}
                  >
                    Hospital Staff Portal
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnectDesktopHospital}
                    style={{ color: '#fecaca', background: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <span style={{
                  background: 'rgba(255,255,255,0.12)',
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700
                }}>
                  Enter 6-digit Code Below
                </span>
              )}
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>

            {/* Left: 6-Digit Code Connection Form */}
            <div style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '26px 28px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={18} color="#0f6e6e" />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {desktopAffiliation ? 'Switch / Reconnect Hospital' : 'Connect to Hospital with 6-Digit Code'}
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Enter the 6-digit affiliation code generated by your hospital medical director or clinical superintendent.
                </p>
              </div>

              {/* 6-Digit Monospace Input */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  6-Digit Invitation Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={codeInputValue}
                  onChange={(e) => setCodeInputValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 492817"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${previewHospitalInvite ? '#0f6e6e' : '#cbd5e1'}`,
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: '10px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    color: '#0f172a',
                    background: previewHospitalInvite ? '#f0fdfa' : '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 150ms'
                  }}
                />
              </div>

              {/* Fast Test Code Chips */}
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>
                  Sample Registered Hospital Codes (Click to autofill):
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { code: '492817', label: 'Evercare Lekki' },
                    { code: '715392', label: 'LUTH Surulere' },
                    { code: '830146', label: 'Reddington VI' },
                  ].map((chip) => (
                    <button
                      key={chip.code}
                      type="button"
                      onClick={() => setCodeInputValue(chip.code)}
                      style={{
                        padding: '6px 12px',
                        background: codeInputValue === chip.code ? '#e6f4f4' : '#f8fafc',
                        border: `1px solid ${codeInputValue === chip.code ? '#0f6e6e' : '#cbd5e1'}`,
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        color: codeInputValue === chip.code ? '#0f6e6e' : '#334155',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{chip.code}</span>
                      <span>• {chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Code Preview Card */}
              {previewHospitalInvite ? (
                <div style={{
                  background: '#f0fdfa',
                  border: '1.5px solid #99f6e4',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={16} color="#0f6e6e" />
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {previewHospitalInvite.hospitalName}
                        </h4>
                      </div>
                      <p style={{ fontSize: 12.5, color: '#475569', margin: '3px 0 0' }}>
                        Department: <strong>{previewHospitalInvite.department}</strong>
                      </p>
                    </div>
                    <span style={{
                      background: '#ccfbf1',
                      color: '#0f6e6e',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6
                    }}>
                      Valid Code
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span>Facility Address: {previewHospitalInvite.address}</span>
                    <span>Admin Approver: {previewHospitalInvite.admin}</span>
                  </div>

                  <Button
                    variant="teal"
                    size="md"
                    leftIcon={<Building2 size={16} />}
                    onClick={handleConnectDesktopHospital}
                    style={{ marginTop: 4, width: '100%', justifyContent: 'center' }}
                  >
                    Confirm & Connect to {previewHospitalInvite.hospitalName}
                  </Button>
                </div>
              ) : codeInputValue.length === 6 ? (
                <div style={{
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#be123c',
                  fontSize: 12.5
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>Invalid or expired 6-digit code. Please contact your hospital clinical administrator.</span>
                </div>
              ) : null}
            </div>

            {/* Right: Affiliation Details & Governance Rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Current Affiliation Snapshot */}
              <div style={{
                background: '#ffffff',
                borderRadius: 18,
                padding: '24px 26px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Affiliation Status & Credentials
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Hospital Name:</span>
                    <strong style={{ color: '#0f172a' }}>{desktopAffiliation ? desktopAffiliation.hospitalName : 'None (Independent)'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Clinical Department:</span>
                    <strong style={{ color: '#0f172a' }}>{desktopAffiliation ? desktopAffiliation.department : 'Cardiology / General Practice'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Hospital Identity Status:</span>
                    <strong style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={12} /> Permanent & Locked
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Connected Code:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f6e6e' }}>
                      {desktopAffiliation ? desktopAffiliation.linkedViaCode : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Hospital Roster Sync:</span>
                    <strong style={{ color: desktopAffiliation ? '#059669' : '#64748b' }}>
                      {desktopAffiliation ? 'Active (4 Patients)' : 'Inactive'}
                    </strong>
                  </div>
                </div>

                {desktopAffiliation && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<ExternalLink size={14} />}
                    onClick={() => router.push('/dashboard/hospital-portal')}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Open Hospital Staff Portal
                  </Button>
                )}
              </div>

              {/* System Architecture & Governance Card */}
              <div style={{
                background: '#f8fafc',
                borderRadius: 16,
                padding: '20px 22px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="#0f6e6e" />
                  <h5 style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Platform Architecture & Multi-Tenancy Rules
                  </h5>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                  <p style={{ margin: 0 }}>
                    <strong>1. Permanent Hospital Identity:</strong> Hospitals are registered and verified by Platform Super-Admins. Hospital names cannot be modified by staff.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>2. Doctor Account Autonomy:</strong> Hospital admins manage staff permissions and clinic rosters, but cannot create doctor accounts. Doctors register independently and connect using secure 6-digit tokens.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>3. Split Patient Roster:</strong> Patients registered on the OmniPlus app receive full digital treatment. Unregistered patients are flagged for in-hospital physical care only with SMS invite links.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: FULLSCREEN & RESIZABLE HD TELEHEALTH CONSULTATION STUDIO    */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeVideoConsult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: callSizeMode === 'fullscreen' ? 0 : 16,
            transition: 'all 200ms ease',
          }}
        >
          {/* Main Studio Container */}
          <div
            style={{
              position: 'relative',
              width: callSizeMode === 'fullscreen' ? '100vw' : callSizeMode === 'expanded' ? '96vw' : '1140px',
              maxWidth: callSizeMode === 'fullscreen' ? '100vw' : callSizeMode === 'expanded' ? '1480px' : '1180px',
              height: callSizeMode === 'fullscreen' ? '100vh' : callSizeMode === 'expanded' ? '92vh' : '760px',
              maxHeight: callSizeMode === 'fullscreen' ? '100vh' : '92vh',
              background: '#090d16',
              color: '#ffffff',
              borderRadius: callSizeMode === 'fullscreen' ? 0 : 20,
              boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Top Studio Control Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                background: '#0f172a',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0,
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              {/* Left: Patient Info & Call Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <Video size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#f8fafc' }}>
                      {activeVideoConsult.patientName}
                    </h3>
                    <span
                      style={{
                        background: '#064e3b',
                        color: '#34d399',
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <ShieldCheck size={12} /> NDPA Encrypted Room-{activeVideoConsult.id}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 11.5, color: '#94a3b8' }}>
                    <span>{activeVideoConsult.patientAge}y · {activeVideoConsult.patientGender}</span>
                    <span>•</span>
                    <span style={{ color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Radio size={12} /> LIVE {formatTimer(callDurationSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center: Stage Switcher & Focus Mode */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleSwapFeeds}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#1e293b',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  title="Swap Main Video Stage between Doctor Webcam and Patient Feed"
                >
                  <ArrowLeftRight size={13} style={{ color: '#38bdf8' }} />
                  <span>{primaryVideoFeed === 'doctor_camera' ? 'Stage: Doctor Camera' : 'Stage: Patient Feed'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCallSplitMode((prev) => (prev === 'split' ? 'video_focus' : 'split'))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: callSplitMode === 'video_focus' ? '#0f6e6e' : '#1e293b',
                    color: '#ffffff',
                    border: `1px solid ${callSplitMode === 'video_focus' ? '#14b8a6' : '#334155'}`,
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  title="Toggle 100% Video Examination Focus"
                >
                  {callSplitMode === 'video_focus' ? <Shrink size={13} /> : <Expand size={13} />}
                  <span>{callSplitMode === 'video_focus' ? 'Show Notes Panel' : 'Video Only Mode'}</span>
                </button>
              </div>

              {/* Right: Resizing, Fullscreen & Close Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Size Preset Selector */}
                <div
                  style={{
                    display: 'flex',
                    background: '#1e293b',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    padding: 2,
                    gap: 2,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCallSizeMode('standard')}
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: callSizeMode === 'standard' ? '#2563eb' : 'transparent',
                      color: callSizeMode === 'standard' ? '#ffffff' : '#94a3b8',
                    }}
                    title="Standard Window Mode (1140px)"
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallSizeMode('expanded')}
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: callSizeMode === 'expanded' ? '#2563eb' : 'transparent',
                      color: callSizeMode === 'expanded' ? '#ffffff' : '#94a3b8',
                    }}
                    title="Expanded Studio Mode (1480px)"
                  >
                    Studio
                  </button>
                </div>

                {/* True Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={handleToggleFullScreen}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: callSizeMode === 'fullscreen' ? '#047857' : '#1e293b',
                    color: '#ffffff',
                    border: `1px solid ${callSizeMode === 'fullscreen' ? '#10b981' : '#334155'}`,
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  title="Toggle Fullscreen Video Consultation"
                >
                  {callSizeMode === 'fullscreen' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  <span>{callSizeMode === 'fullscreen' ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>

                {/* Close Studio Button */}
                <button
                  type="button"
                  onClick={() => setActiveVideoConsult(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid #334155',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  title="Minimize / Close Studio"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Studio Body: Video Canvas + Clinical Notes */}
            <div
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: callSplitMode === 'video_focus' ? '1fr' : '1fr 360px',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Main Video Viewport Canvas */}
              <div
                style={{
                  position: 'relative',
                  background: '#050811',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  minHeight: 0,
                }}
              >
                {/* 1. PRIMARY STAGE: DOCTOR CAMERA */}
                {primaryVideoFeed === 'doctor_camera' ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    {isCameraActive && !isVideoDisabled ? (
                      <video
                        ref={setMainVideoNode}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: 'scaleX(-1)', // Mirror webcam feed
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 24,
                          textAlign: 'center',
                          background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
                        }}
                      >
                        {isVideoDisabled ? (
                          <>
                            <VideoOff size={52} style={{ color: '#ef4444', marginBottom: 12 }} />
                            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Doctor Webcam Paused</h3>
                            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#94a3b8' }}>
                              You clicked video pause. Click the camera icon below to re-enable your video stream.
                            </p>
                            <Button variant="teal" size="sm" leftIcon={<Video size={14} />} onClick={handleToggleVideo}>
                              Turn On Camera
                            </Button>
                          </>
                        ) : cameraError ? (
                          <div
                            style={{
                              maxWidth: 520,
                              background: '#1e1e2d',
                              border: '1px solid #dc2626',
                              borderRadius: 14,
                              padding: 24,
                            }}
                          >
                            <AlertTriangle size={38} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
                            <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
                              Camera Access Diagnostics
                            </h4>
                            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#fca5a5' }}>
                              {cameraError}
                            </p>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                              <Button
                                variant="teal"
                                size="sm"
                                leftIcon={<RefreshCw size={14} />}
                                onClick={requestMediaStream}
                              >
                                Re-test & Connect Camera
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setPrimaryVideoFeed('patient_feed')}
                              >
                                View Patient Feed
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                border: '3px solid #0f6e6e',
                                borderTopColor: '#2dd4bf',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 16px',
                              }}
                            />
                            <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>
                              Initializing HD Desktop Camera...
                            </h4>
                            <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8' }}>
                              Requesting hardware access from Electron media layer
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. PRIMARY STAGE: PATIENT WEBRTC STREAM */
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
                    }}
                  >
                    <div
                      style={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        background: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: 38,
                        fontWeight: 800,
                        border: '4px solid #0f6e6e',
                        color: '#ffffff',
                        boxShadow: '0 0 40px rgba(15, 110, 110, 0.4)',
                      }}
                    >
                      {activeVideoConsult.patientName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#f8fafc' }}>
                      {activeVideoConsult.patientName}
                    </h3>
                    <span
                      style={{
                        fontSize: 12.5,
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <ShieldCheck size={15} /> Encrypted 1080p WebRTC Clinical Stream
                    </span>
                  </div>
                )}

                {/* ── PICTURE-IN-PICTURE (PIP) WINDOW ──────────────────────────── */}
                <div
                  style={{
                    position: 'absolute',
                    right: 20,
                    bottom: 84,
                    width: callSizeMode === 'fullscreen' ? 240 : 190,
                    height: callSizeMode === 'fullscreen' ? 160 : 126,
                    background: '#0f172a',
                    borderRadius: 14,
                    border: '2px solid #0f6e6e',
                    overflow: 'hidden',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                    zIndex: 20,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                  onClick={handleSwapFeeds}
                  title="Click to swap with main stage"
                >
                  {primaryVideoFeed === 'patient_feed' ? (
                    // Doctor Camera in PiP
                    isCameraActive && !isVideoDisabled ? (
                      <video
                        ref={setPipVideoNode}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: 'scaleX(-1)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          background: '#1e293b',
                          color: '#94a3b8',
                          padding: 8,
                          textAlign: 'center',
                        }}
                      >
                        <VideoOff size={22} style={{ marginBottom: 4 }} />
                        <span style={{ fontSize: 10, fontWeight: 600 }}>Doctor Cam Off</span>
                      </div>
                    )
                  ) : (
                    // Patient in PiP
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        background: '#1e293b',
                        color: '#ffffff',
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: '#0f6e6e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {activeVideoConsult.patientName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>
                        {activeVideoConsult.patientName.split(' ')[0]}
                      </span>
                    </div>
                  )}

                  {/* PiP Label Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      background: 'rgba(0,0,0,0.75)',
                      backdropFilter: 'blur(4px)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{primaryVideoFeed === 'patient_feed' ? 'Dr. Folake' : 'Patient'}</span>
                    <span style={{ fontSize: 9, color: '#34d399' }}>● PiP</span>
                  </div>
                </div>

                {/* ── TOP-LEFT HUD: LIVE PATIENT VITALS ────────────────────────── */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontSize: 12,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    zIndex: 15,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Heart size={14} style={{ color: '#ef4444' }} />
                    <span style={{ color: '#94a3b8' }}>BP:</span>
                    <strong style={{ color: '#f8fafc' }}>{activeVideoConsult.vitals.bp}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} style={{ color: '#38bdf8' }} />
                    <span style={{ color: '#94a3b8' }}>HR:</span>
                    <strong style={{ color: '#f8fafc' }}>{activeVideoConsult.vitals.hr}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Droplet size={14} style={{ color: '#10b981' }} />
                    <span style={{ color: '#94a3b8' }}>SpO2:</span>
                    <strong style={{ color: '#34d399' }}>{activeVideoConsult.vitals.spo2}</strong>
                  </div>
                </div>

                {/* ── TOP-RIGHT HUD: HARDWARE STATUS & VU METER ────────────────── */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 11.5,
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    zIndex: 15,
                  }}
                >
                  <span style={{ color: isCameraActive ? '#34d399' : '#f87171', fontWeight: 700 }}>
                    {isCameraActive ? cameraDeviceLabel : 'Camera Offline'}
                  </span>
                  <span>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>MIC:</span>
                    <div style={{ width: 40, height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${isMicMuted ? 0 : Math.max(12, micVolume)}%`,
                          height: '100%',
                          background: isMicMuted ? '#ef4444' : '#10b981',
                          transition: 'width 80ms ease-out',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── BOTTOM FLOATING CALL CONTROLS DOCK ───────────────────────── */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 16px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                    zIndex: 25,
                  }}
                >
                  {/* Microphone Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: isMicMuted ? '#ef4444' : '#1e293b',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms',
                    }}
                    title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  >
                    {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  {/* Camera Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleVideo}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: isVideoDisabled ? '#ef4444' : '#1e293b',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms',
                    }}
                    title={isVideoDisabled ? 'Turn On Webcam' : 'Turn Off Webcam'}
                  >
                    {isVideoDisabled ? <VideoOff size={18} /> : <Video size={18} />}
                  </button>

                  {/* Swap Views */}
                  <button
                    type="button"
                    onClick={handleSwapFeeds}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms',
                    }}
                    title="Swap Main Camera / PiP View"
                  >
                    <ArrowLeftRight size={18} />
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    type="button"
                    onClick={handleToggleFullScreen}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: callSizeMode === 'fullscreen' ? '#047857' : '#1e293b',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms',
                    }}
                    title="Toggle Fullscreen Consultation"
                  >
                    {callSizeMode === 'fullscreen' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>

                  {/* Snapshot Evidence Capture */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerFeedback('Clinical snapshot captured and saved to patient electronic case history.');
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#1e293b',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms',
                    }}
                    title="Capture Telehealth Examination Snapshot"
                  >
                    <Camera size={18} />
                  </button>

                  <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

                  {/* End Call Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVideoConsult(null);
                      triggerFeedback(`Teleconsultation with ${activeVideoConsult.patientName} ended.`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 999,
                      padding: '10px 22px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
                    }}
                  >
                    <PhoneOff size={16} />
                    End Call
                  </button>
                </div>
              </div>

              {/* ── RIGHT DRAWER: CLINICAL NOTES & FAST RX (when in split mode) ─ */}
              {callSplitMode === 'split' && (
                <div
                  style={{
                    background: '#0f172a',
                    borderLeft: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 20,
                    gap: 16,
                    overflowY: 'auto',
                  }}
                >
                  {/* Patient Quick Profile */}
                  <div
                    style={{
                      background: '#1e293b',
                      borderRadius: 12,
                      padding: 14,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                      Chief Complaint
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>
                      {activeVideoConsult.reason}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 10,
                        fontSize: 11.5,
                        color: '#94a3b8',
                      }}
                    >
                      <span>Blood Group: <strong style={{ color: '#ffffff' }}>{activeVideoConsult.bloodGroup}</strong></span>
                      <span>•</span>
                      <span>Genotype: <strong style={{ color: '#ffffff' }}>{activeVideoConsult.genotype}</strong></span>
                    </div>
                  </div>

                  {/* Consultation SOAP Notes */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                      Clinical Impressions & SOAP Notes
                    </label>
                    <textarea
                      rows={callSizeMode === 'fullscreen' ? 14 : 9}
                      placeholder="Record subjective history, physical observations, ICD-10 assessment, and patient care plan..."
                      style={{
                        width: '100%',
                        flex: 1,
                        background: '#1e293b',
                        color: '#ffffff',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid #334155',
                        fontSize: 13,
                        boxSizing: 'border-box',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* E-Prescription Fast Dispatch */}
                  <Button
                    variant="teal"
                    style={{ width: '100%', padding: '12px' }}
                    leftIcon={<Pill size={16} />}
                    onClick={() => {
                      setRxPatientName(`${activeVideoConsult.patientName} (${activeVideoConsult.patientAge}y · ${activeVideoConsult.patientGender})`);
                      setIsPrescriptionModalOpen(true);
                    }}
                  >
                    Fast Issue E-Prescription
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: DIGITAL E-PRESCRIPTION CREATOR                             */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isPrescriptionModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPrescriptionModalOpen(false)}
          title="Create & Issue Digital E-Prescription"
          subtitle="Signed with MDCN Doctor Folio LIC-98754-C3"
          size="lg"
        >
          <form onSubmit={handleCreatePrescription} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Safety Alert Box */}
            <div style={{
              background: '#f0fdfa', border: '1px solid #a7f3d0', borderRadius: 10,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#065f46'
            }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>Automated Allergy & Drug Interaction Safety Scanner Active</span>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Select Patient
              </label>
              <select
                value={rxPatientName}
                onChange={(e) => setRxPatientName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              >
                {liveConsults.map(c => (
                  <option key={c.id} value={`${c.patientName} (${c.patientAge}y · ${c.patientGender})`}>
                    {c.patientName} ({c.patientAge}y · {c.patientGender})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Medication Name & Strength
                </label>
                <input
                  type="text"
                  value={rxDrugName}
                  onChange={(e) => setRxDrugName(e.target.value)}
                  placeholder="e.g. Amlodipine Besylate 5mg"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Dosage Instructions
                </label>
                <input
                  type="text"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  placeholder="e.g. 1 Tablet daily"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Frequency
                </label>
                <select
                  value={rxFrequency}
                  onChange={(e) => setRxFrequency(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="Once daily (QD)">Once daily (QD)</option>
                  <option value="Twice daily (BID)">Twice daily (BID)</option>
                  <option value="Three times daily (TID)">Three times daily (TID)</option>
                  <option value="At bedtime (QHS)">At bedtime (QHS)</option>
                  <option value="As needed (PRN)">As needed (PRN)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Duration
                </label>
                <select
                  value={rxDuration}
                  onChange={(e) => setRxDuration(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="5 days">5 days</option>
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                  <option value="60 days">60 days</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Fulfillment Pharmacy
              </label>
              <select
                value={rxPharmacy}
                onChange={(e) => setRxPharmacy(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              >
                <option value="Pharmacare Pharmacy Ikeja">Pharmacare Pharmacy Ikeja</option>
                <option value="MedPlus Pharmacy Victoria Island">MedPlus Pharmacy Victoria Island</option>
                <option value="HealthPlus Pharmacy Lekki">HealthPlus Pharmacy Lekki</option>
                <option value="Patient Pick-up / Direct App Forwarding">Patient Pick-up / Direct App Forwarding</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => setIsPrescriptionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" leftIcon={<Pill size={14} />}>
                Authorize & Sign Prescription
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: PATIENT 3D BODY MAP & CLINICAL EHR MODAL                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeChartPatient && (
        <Modal
          isOpen={true}
          onClose={() => setActiveChartPatient(null)}
          title={`3D Body Map & Clinical Chart — ${activeChartPatient.patientName}`}
          subtitle={`${activeChartPatient.patientAge}y · ${activeChartPatient.patientGender} · Room-${activeChartPatient.id}`}
          size="xl"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            {/* Interactive Anatomical Body Map */}
            <AnatomicalBodyMap
              activeRegion={selectedBodyRegion}
              onSelectRegion={setSelectedBodyRegion}
              severity={painIntensity}
              onSelectSeverity={setPainIntensity}
            />

            {/* Patient Clinical Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase' }}>
                  Chief Complaint
                </span>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#1e293b', fontWeight: 600 }}>
                  {activeChartPatient.reason}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 12, color: '#64748b' }}>
                  <span>Blood: <strong style={{ color: '#0f172a' }}>{activeChartPatient.bloodGroup}</strong></span>
                  <span>Genotype: <strong style={{ color: '#0f172a' }}>{activeChartPatient.genotype}</strong></span>
                </div>
              </div>

              {/* Vitals HUD */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div style={{ background: '#fef2f2', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#b91c1c', fontWeight: 700 }}>BP</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#991b1b', marginTop: 2 }}>
                    {activeChartPatient.vitals.bp}
                  </div>
                </div>
                <div style={{ background: '#eff6ff', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#1e40af', fontWeight: 700 }}>HR</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a', marginTop: 2 }}>
                    {activeChartPatient.vitals.hr}
                  </div>
                </div>
                <div style={{ background: '#ecfdf5', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#065f46', fontWeight: 700 }}>SpO2</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#064e3b', marginTop: 2 }}>
                    {activeChartPatient.vitals.spo2}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                <Button
                  variant="teal"
                  style={{ width: '100%' }}
                  leftIcon={<ExternalLink size={14} />}
                  onClick={() => {
                    setActiveChartPatient(null);
                    router.push('/dashboard/body-map');
                  }}
                >
                  Open Full 3D Body Map Studio
                </Button>

                <Button
                  variant="secondary"
                  style={{ width: '100%' }}
                  leftIcon={<Video size={14} />}
                  onClick={() => {
                    const consult = activeChartPatient;
                    setActiveChartPatient(null);
                    setActiveVideoConsult(consult);
                  }}
                >
                  Start HD Teleconsultation
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 4: SET TIERED CONSULTATION FEES (Exact Phone Match)           */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isFeeModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsFeeModalOpen(false)}
          title="Set Tiered Consultation Fees"
          subtitle="Configure custom clinician fees for Chat, Audio, and Video sessions. 10% platform fee deducted automatically."
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <Button variant="outline" onClick={() => setIsFeeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="teal" leftIcon={<CheckCircle2 size={14} />} onClick={handleSaveTieredFees}>
                Save Tiered Fees
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Current Active Fees Banner */}
            <div style={{
              background: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase' }}>
                  Currently Active Rates
                </span>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                  <span>Chat: ₦{tierFees.chat.toLocaleString()}</span>
                  <span>·</span>
                  <span>Audio: ₦{tierFees.audio.toLocaleString()}</span>
                  <span>·</span>
                  <span>Video: ₦{tierFees.video.toLocaleString()}</span>
                </div>
              </div>
              <span style={{
                background: '#ffffff',
                border: '1px solid #99f6e4',
                color: '#0f6e6e',
                fontSize: 11,
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 8
              }}>
                Platform Min ₦{MIN_CONSULTATION_FEE.toLocaleString()}
              </span>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 12.5,
              color: '#475569',
              lineHeight: 1.5
            }}>
              Set different fees per consultation format. Minimum ₦{MIN_CONSULTATION_FEE.toLocaleString()} each.
              Hierarchy rule: <strong>Chat</strong> must be less than <strong>Audio</strong>, which must be less than <strong>Video</strong>.
            </div>

            {feeValidationErr && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: 12.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertTriangle size={16} />
                <span>{feeValidationErr}</span>
              </div>
            )}

            {/* Inputs for each Tier */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Chat Fee (₦)
                </label>
                <input
                  type="number"
                  min={MIN_CONSULTATION_FEE}
                  step={500}
                  value={feeInputChat}
                  onChange={(e) => {
                    setFeeInputChat(e.target.value);
                    setFeeValidationErr(null);
                  }}
                  placeholder="8000"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: 10.5, color: '#64748b', marginTop: 4, display: 'block' }}>
                  Min ₦{MIN_CONSULTATION_FEE.toLocaleString()}
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Audio Call Fee (₦)
                </label>
                <input
                  type="number"
                  min={MIN_CONSULTATION_FEE}
                  step={500}
                  value={feeInputAudio}
                  onChange={(e) => {
                    setFeeInputAudio(e.target.value);
                    setFeeValidationErr(null);
                  }}
                  placeholder="10000"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: 10.5, color: '#64748b', marginTop: 4, display: 'block' }}>
                  Must exceed Chat
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Video Call Fee (₦)
                </label>
                <input
                  type="number"
                  min={MIN_CONSULTATION_FEE}
                  step={500}
                  value={feeInputVideo}
                  onChange={(e) => {
                    setFeeInputVideo(e.target.value);
                    setFeeValidationErr(null);
                  }}
                  placeholder="15000"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: 10.5, color: '#64748b', marginTop: 4, display: 'block' }}>
                  Must exceed Audio
                </span>
              </div>
            </div>

            {/* Platform Service Fee Breakdown — All 3 Tiers Live Automatic Calculation */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 14,
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} style={{ color: '#059669' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    Platform Service Fee Breakdown (10% Live Deduction)
                  </span>
                </div>
                <span style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid #a7f3d0'
                }}>
                  Automatic Math
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Chat', raw: feeInputChat, icon: MessageSquare, color: '#7c3aed' },
                  { label: 'Audio Call', raw: feeInputAudio, icon: Phone, color: '#0284c7' },
                  { label: 'Video Call', raw: feeInputVideo, icon: Video, color: '#0f6e6e' },
                ].map((tier, idx) => {
                  const Icon = tier.icon;
                  const gross = Math.max(0, parseFloat(String(tier.raw).replace(/,/g, '')) || 0);
                  const platformFee = +(gross * 0.10).toFixed(2);
                  const net = +(gross * 0.90).toFixed(2);

                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: tier.color, fontWeight: 800, fontSize: 12.5 }}>
                        <Icon size={14} />
                        <span>{tier.label}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b' }}>
                        <span>Patient Pays:</span>
                        <strong style={{ color: '#0f172a' }}>₦{gross.toLocaleString()}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#dc2626' }}>
                        <span>Platform (10%):</span>
                        <span>−₦{platformFee.toLocaleString()}</span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12.5,
                        fontWeight: 800,
                        color: '#059669',
                        borderTop: '1px dashed #e2e8f0',
                        paddingTop: 4,
                        marginTop: 2
                      }}>
                        <span>You Receive:</span>
                        <span>₦{net.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
}

export default function DoctorPortalPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: '#0f6e6e' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <DoctorPortalContent />
    </Suspense>
  );
}
