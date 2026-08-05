export type RecordVisibility = 'all' | 'patient_only';

export interface MedicalRecordVisibilityItem {
  recordId: string;
  visibility: RecordVisibility;
  updatedAt: string;
}
