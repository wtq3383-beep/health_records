/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Admin' | 'Member';

export type Relationship = 'Self' | 'Spouse' | 'Parent' | 'Child' | 'Other';

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  avatar: string;
  relationship: Relationship;
  role: Role;
  height: number; // cm
  weight: number; // kg
  bloodType: string;
  medicalHistory: string[];
  smokingHistory: 'never' | 'former' | 'active';
  drinkingHistory: 'never' | 'socially' | 'frequently';
  allergies: string[];
  status: 'active' | 'pending';
  joinedAt: string;
}

export interface HealthIndicator {
  id: string;
  name: string;      // e.g., "空腹血糖" (Blood Glucose), "收缩压" (Systolic BP)
  code: string;      // e.g., "glucose", "sbp", "dbp", "cholesterol", "uric_acid"
  value: number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low';
  refMin?: number;
  refMax?: number;
}

export interface HealthReport {
  id: string;
  memberId: string;
  title: string;
  date: string;       // YYYY-MM-DD
  institution: string; // 医院/体检中心
  summary: string;     // AI / 临床综合评语
  fileName: string;
  fileSize: string;
  encryptionType: 'AES-256-GCM' | 'RSA-2048';
  encryptedAt: string;
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  indicators: HealthIndicator[];
}

export interface Invitation {
  id: string;
  code: string;
  role: Role;
  expiresAt: string;
  createdTime: string;
  usedCount: number;
  invitationUrl: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  details: string;
  ip: string;
  status: 'success' | 'warning' | 'failed';
}

export interface PrivacyConfig {
  aesKeyLength: 256;
  clientSideEncryption: boolean;
  enableDoubleEncryption: boolean;
  autoLogOutMinutes: number;
  sharingScope: 'family_only' | 'private_selected' | 'only_me';
}
