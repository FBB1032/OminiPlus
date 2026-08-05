export type ConsentScope = 'medical_history' | 'lab_report' | 'ai_analysis' | 'prescription_share';

export type ConsentStatus = 'granted' | 'revoked' | 'pending';

export interface ConsentGrant {
  id: string;
  scope: ConsentScope;
  title: string;
  description: string;
  targetId?: string; // Doctor ID or system module ID
  targetName: string; // e.g. "Dr. Musa Ahmed" or "AI Diagnostic Assistant"
  status: ConsentStatus;
  grantedAt: string;
  revokedAt?: string;
  expiresAt?: string;
}

export interface ConsentRequestPayload {
  scope: ConsentScope;
  targetId?: string;
  targetName: string;
}
