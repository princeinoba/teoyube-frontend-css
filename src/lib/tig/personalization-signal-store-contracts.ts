import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";
import type { TigConfidenceLabel } from "./intelligence-confidence";
import type { TigProductionSurface } from "./production-response-contracts";

export type TeoyubeSignalPrivacyLevel =
  | "anonymous"
  | "session_only"
  | "consented_profile"
  | "disabled";

export type TeoyubeSignalStoreScope =
  | "session"
  | "surface"
  | "profile_preview"
  | "development"
  | "unknown";

export type TeoyubeSignalStoreStatus =
  | "ready"
  | "disabled"
  | "readonly"
  | "error";

export type TeoyubeSignalRetentionPolicy = {
  id: string;
  privacyLevel: TeoyubeSignalPrivacyLevel;
  maxSignalCount: number;
  maxAgeDays?: number;
  allowSessionOnly: boolean;
  allowConsentedProfile: boolean;
  allowedScopes: TeoyubeSignalStoreScope[];
  deleteExpired: boolean;
  createdAt: string;
};

export type TeoyubeSignalStoreRecord = {
  id: string;
  signal: TeoyubePersonalizationSignal;
  privacyLevel: TeoyubeSignalPrivacyLevel;
  scope: TeoyubeSignalStoreScope;
  sessionId?: string;
  userId?: string;
  consented: boolean;
  sanitized: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
};

export type TeoyubeSignalStoreQuery = {
  ids?: string[];
  surfaces?: TigProductionSurface[];
  emotionTags?: string[];
  intents?: string[];
  selectedWordIds?: string[];
  selectedClusterIds?: string[];
  selectedScriptureReferences?: string[];
  fallbackUsed?: boolean;
  confidenceLabels?: TigConfidenceLabel[];
  privacyLevels?: TeoyubeSignalPrivacyLevel[];
  scopes?: TeoyubeSignalStoreScope[];
  sessionId?: string;
  userId?: string;
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
};

export type TeoyubeSignalStoreResult<TData> = {
  success: boolean;
  status: TeoyubeSignalStoreStatus;
  data: TData;
  errors: string[];
  warnings: string[];
};

export type TeoyubeSignalStoreWriteResult = TeoyubeSignalStoreResult<{
  accepted: number;
  rejected: number;
  records: TeoyubeSignalStoreRecord[];
}>;

export type TeoyubeSignalStoreSummary = {
  status: TeoyubeSignalStoreStatus;
  recordCount: number;
  privacyCounts: Record<TeoyubeSignalPrivacyLevel, number>;
  scopeCounts: Record<TeoyubeSignalStoreScope, number>;
  surfaceCounts: Record<string, number>;
  emotionCounts: Record<string, number>;
  wordCounts: Record<string, number>;
  clusterCounts: Record<string, number>;
  fallbackCount: number;
  oldestRecordAt?: string;
  newestRecordAt?: string;
  retentionPolicy: TeoyubeSignalRetentionPolicy;
};

export type TeoyubeSignalDeletionRequest = {
  ids?: string[];
  query?: TeoyubeSignalStoreQuery;
  scope?: TeoyubeSignalStoreScope;
  sessionId?: string;
  userId?: string;
  reason?: string;
};

export type TeoyubeSignalExportRequest = {
  query?: TeoyubeSignalStoreQuery;
  includeMetadata?: boolean;
  includeRawText?: false;
  requestedAt?: string;
};

export type TeoyubeSignalStoreAdapter = {
  status: TeoyubeSignalStoreStatus;
  scope: TeoyubeSignalStoreScope;
  privacyLevel: TeoyubeSignalPrivacyLevel;
  retentionPolicy: TeoyubeSignalRetentionPolicy;
  records: TeoyubeSignalStoreRecord[];
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

export type TeoyubeSignalStoreOptions = {
  status?: TeoyubeSignalStoreStatus;
  scope?: TeoyubeSignalStoreScope;
  privacyLevel?: TeoyubeSignalPrivacyLevel;
  retentionPolicy?: Partial<TeoyubeSignalRetentionPolicy>;
  sessionId?: string;
  userId?: string;
  consent?: Partial<TeoyubePersonalizationConsent>;
  metadata?: Record<string, unknown>;
};
