export type RelationshipType = 'self' | 'spouse' | 'child' | 'parent';

export interface FamilyMemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  relationship: RelationshipType;
  relationshipLabel: string; // e.g. "Self", "Wife", "Son", "Father"
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  avatarUrl?: string;
  bloodGroup?: string;
  genotype?: string;
  chronicConditions?: string[];
  isPrimary: boolean;
  createdAt: string;
}
