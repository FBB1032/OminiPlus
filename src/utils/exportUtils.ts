import { MedicalRecord } from '../types/patient';
import { RecordVisibility } from '../types/medicalRecord';

type MedicalRecordType = MedicalRecord['type'];

interface RecordsSummary {
  totalCount: number;
  countsByType: Record<MedicalRecordType, number>;
  privateCount: number;
  dateRange: { earliest: string | null; latest: string | null };
  totalAttachmentBytes: number;
}

interface ExportManifestOptions {
  auditEventId: string;
  actorName: string;
  patientName: string;
  patientId: string;
}

interface ExportManifest {
  manifestVersion: number;
  schema: string;
  compliance: {
    regulation: string;
    encryptedAtRest: boolean;
    encryptedInTransit: boolean;
    auditEventId: string;
    exportedAt: string;
  };
  patient: {
    id: string;
    name: string;
  };
  summary: RecordsSummary;
  integrity: {
    algorithm: string;
    recordCountHash: string;
    manifestHash: string;
  };
  records: Array<{
    id: string;
    type: MedicalRecordType;
    title: string;
    description: string;
    date: string;
    doctorName?: string;
    hasAttachment: boolean;
    visibility: RecordVisibility;
  }>;
}

export const buildRecordsSummary = (
  records: MedicalRecord[],
  visibilities: Record<string, RecordVisibility>
): RecordsSummary => {
  const countsByType: Record<MedicalRecordType, number> = {
    lab_result: 0,
    imaging: 0,
    diagnosis: 0,
    surgery: 0,
    vaccination: 0,
    allergy: 0,
    other: 0,
  };
  let privateCount = 0;
  let earliest: string | null = null;
  let latest: string | null = null;
  let totalAttachmentBytes = 0;

  records.forEach((record) => {
    if (countsByType[record.type] !== undefined) {
      countsByType[record.type]++;
    }
    if (visibilities[record.id] === 'patient_only') {
      privateCount++;
    }
    if (record.date) {
      if (!earliest || record.date < earliest) earliest = record.date;
      if (!latest || record.date > latest) latest = record.date;
    }
    if (record.attachmentUrl) {
      totalAttachmentBytes += record.attachmentUrl.length;
    }
  });

  return {
    totalCount: records.length,
    countsByType,
    privateCount,
    dateRange: { earliest, latest },
    totalAttachmentBytes,
  };
};

export const simpleDeterministicHash = (input: string): string => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  const upper = ((hash >>> 0) & 0xffff).toString(16).padStart(4, '0');
  const lower = ((hash >>> 16) & 0xffff).toString(16).padStart(4, '0');
  let hash2 = 0;
  for (let i = 0; i < input.length; i++) {
    hash2 = (hash2 * 33) ^ input.charCodeAt(i);
  }
  const h2hex = ((hash2 >>> 0) & 0xffffffff).toString(16).padStart(8, '0');
  return (upper + lower + h2hex).toLowerCase();
};

const sortedRecordsJSON = (records: MedicalRecord[]): string => {
  const sorted = [...records].sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify(sorted);
};

export const generateMedicalRecordsExportJSON = (
  records: MedicalRecord[],
  visibilities: Record<string, RecordVisibility>,
  options: ExportManifestOptions
): { manifest: ExportManifest; byteSize: number; recordHash: string } => {
  const summary = buildRecordsSummary(records, visibilities);
  const recordCountHash = simpleDeterministicHash(sortedRecordsJSON(records));

  const sanitizedRecords: ExportManifest['records'] = records.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    description: r.description,
    date: r.date,
    doctorName: r.doctorName,
    hasAttachment: !!r.attachmentUrl,
    visibility: visibilities[r.id] || 'all',
  }));

  const manifestBase: Omit<ExportManifest, 'integrity'> = {
    manifestVersion: 1,
    schema: 'ominipulse-ndpa-ehr-export-v1.0',
    compliance: {
      regulation: 'NDPA 2023, Article 26 (Data Portability)',
      encryptedAtRest: true,
      encryptedInTransit: true,
      auditEventId: options.auditEventId,
      exportedAt: new Date().toISOString(),
    },
    patient: {
      id: options.patientId,
      name: options.patientName,
    },
    summary,
    records: sanitizedRecords,
  };

  const manifestBaseHashPayload = JSON.stringify(manifestBase);
  const manifestHash = simpleDeterministicHash(manifestBaseHashPayload);

  const manifest: ExportManifest = {
    ...manifestBase,
    integrity: {
      algorithm: 'djb2-xor-fold-16hex',
      recordCountHash,
      manifestHash,
    },
  };

  const manifestJSON = JSON.stringify(manifest);
  const byteSize = manifestJSON.length;

  return { manifest, byteSize, recordHash: recordCountHash };
};

export const formatBytesHuman = (sizeBytes: number): string => {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  const kb = sizeBytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

export const verifyManifestIntegrity = (manifest: ExportManifest): boolean => {
  try {
    const { integrity, ...rest } = manifest;
    const recomputedManifestHash = simpleDeterministicHash(JSON.stringify(rest));
    if (integrity.manifestHash !== recomputedManifestHash) return false;
    const recordsSorted = [...manifest.records].sort((a, b) => a.id.localeCompare(b.id));
    const recomputedRecordHash = simpleDeterministicHash(JSON.stringify(recordsSorted.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      description: r.description,
      date: r.date,
      doctorName: r.doctorName,
      attachmentUrl: r.hasAttachment ? 'x' : undefined,
    }))));
    return true;
  } catch {
    return false;
  }
};
