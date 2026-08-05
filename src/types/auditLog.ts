export type AuditAction = 'view' | 'download' | 'edit' | 'delete' | 'share';

export type ActorRole = 'doctor' | 'admin' | 'patient' | 'system_ai';

export interface AuditLogEntry {
  id: string;
  patientId: string;
  patientName: string;
  actorId: string;
  actorName: string;
  actorRole: ActorRole;
  actorTitle?: string; // e.g. "Cardiologist", "System Administrator"
  action: AuditAction;
  recordId: string;
  recordName: string; // e.g. "Blood Test.pdf", "Prescription.pdf"
  recordCategory: 'lab_report' | 'prescription' | 'medical_history' | 'vitals' | 'ai_chat';
  timestamp: string; // ISO date string
  ipAddress?: string;
  location?: string;
  device?: string;
}
