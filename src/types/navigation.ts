import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ─── Auth Stack ─────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string; mode: 'reset' | 'verify' };
  ResetPasswordSuccess: { email: string };
  ResetPassword: { email: string };
  PendingApproval: undefined;
};

// ─── Doctor Tabs ─────────────────────────────────────────────────────────────
export type DoctorTabParamList = {
  DoctorHome: undefined;
  DoctorAppointments: undefined;
  DoctorPatients: undefined;
  DoctorProfile: undefined;
};

// ─── Doctor Stack ─────────────────────────────────────────────────────────────
export type DoctorStackParamList = {
  DoctorTabs: NavigatorScreenParams<DoctorTabParamList>;
  PatientDetail: { patientId: string };
  Prescription: { appointmentId: string; patientId: string; mode: 'create' | 'view'; prescriptionId?: string };
  DoctorAvailability: undefined;
  Notifications: undefined;
  Settings: undefined;
  ProfileEdit: undefined;
  ConsultationChat: { appointmentId: string };
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
  SuspendedAccount: undefined;
  DoctorTerms: undefined;
  BloodDonors: undefined;
};

// ─── Patient Tabs ─────────────────────────────────────────────────────────────
export type PatientTabParamList = {
  PatientHome: undefined;
  PatientAppointments: undefined;
  PatientAI: { startSymptomChecker?: boolean } | undefined;
  PatientRecords: undefined;
  PatientProfile: undefined;
};

// ─── Patient Stack ─────────────────────────────────────────────────────────────
export type PatientStackParamList = {
  PatientTabs: NavigatorScreenParams<PatientTabParamList>;
  BookAppointment: { doctorId?: string };
  DoctorProfile: { doctorId: string };
  PrescriptionHistory: { prescriptionId?: string } | undefined;
  MedicationReminders: undefined;
  VideoConsultation: { appointmentId: string; doctorName: string };
  Pharmacy: undefined;
  Hospitals: undefined;
  BloodDonors: { initialBloodGroup?: string } | undefined;
  ReportIncident: { doctorId?: string; doctorName?: string; appointmentId?: string } | undefined;
  Notifications: undefined;
  Settings: undefined;
  ProfileEdit: undefined;
  Premium: undefined;
  ConsultationChat: { appointmentId: string };
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
  ConsentManagement: undefined;
  AccessLogs: undefined;
  ChronicDisease: { initialTab?: 'hypertension' | 'diabetes' | 'asthma' | 'pregnancy' } | undefined;
  DeviceCompatibility: undefined;
  WearableSync: undefined;
  AIHealthInsights: undefined;
  Specialists: { specialty?: string } | undefined;
};

// ─── Root Navigator ─────────────────────────────────────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Doctor: NavigatorScreenParams<DoctorStackParamList>;
  Patient: NavigatorScreenParams<PatientStackParamList>;
};

// ─── Screen Props Helpers ────────────────────────────────────────────────────
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type DoctorScreenProps<T extends keyof DoctorStackParamList> = NativeStackScreenProps<DoctorStackParamList, T>;
export type PatientScreenProps<T extends keyof PatientStackParamList> = NativeStackScreenProps<PatientStackParamList, T>;
export type DoctorTabScreenProps<T extends keyof DoctorTabParamList> = BottomTabScreenProps<DoctorTabParamList, T>;
export type PatientTabScreenProps<T extends keyof PatientTabParamList> = BottomTabScreenProps<PatientTabParamList, T>;
