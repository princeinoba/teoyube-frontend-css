import type { ScriptureCitation } from "../scripture/scripture-repository";

export type UserId = string;
export type MemoryId = string;
export type ConsentRecordId = string;
export type PurposeId =
  | "preference_continuity"
  | "journey_continuity"
  | "sensitive_spiritual_storage"
  | "testimony_book_continuity";

export type DataSensitivity =
  | "public"
  | "low"
  | "structured_spiritual"
  | "sensitive_spiritual"
  | "security_identity";

export type MemoryLayer = "session" | "episodic" | "semantic_preference" | "journey_state";
export type ConsentStatus = "granted" | "revoked" | "expired" | "not_required";
export type MemoryStatus = "active" | "revoked" | "deleted" | "expired";

export type MemoryProvenance = Readonly<{
  sourceType: "user_explicit" | "journey_transition" | "user_confirmed_summary" | "import";
  sourceId?: string;
  scriptureCitations?: readonly ScriptureCitation[];
  tigRecommendationId?: string;
  createdBy: "user" | "deterministic_system";
  tigExplanationReferences?: readonly string[];
  reversibleTransitionRevision?: number;
}>;

export type MemoryContent = Readonly<Record<string, unknown>>;

export type UserMemoryRecord = Readonly<{
  id: MemoryId;
  userId: UserId;
  layer: MemoryLayer;
  sensitivity: DataSensitivity;
  purposeId: PurposeId;
  consentRecordId?: ConsentRecordId;
  provenance: MemoryProvenance;
  content: MemoryContent;
  userApproved: boolean;
  status: MemoryStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  version: number;
}>;

export type NewUserMemoryRecord = Readonly<{
  idempotencyKey: string;
  layer: Exclude<MemoryLayer, "session">;
  sensitivity: Exclude<DataSensitivity, "public" | "security_identity">;
  purposeId: PurposeId;
  provenance: MemoryProvenance;
  content: MemoryContent;
  userApproved: boolean;
  explicitSensitiveContentApproval?: boolean;
  expiresAt?: string;
}>;

export type MemoryQuery = Readonly<{
  layer?: Exclude<MemoryLayer, "session">;
  purposeId?: PurposeId;
  status?: MemoryStatus;
  limit?: number;
  offset?: number;
}>;

export type MemoryAccessDescriptor = Readonly<{
  id: MemoryId;
  purposeId: PurposeId;
  sensitivity: DataSensitivity;
  status: MemoryStatus;
  version: number;
}>;

export type UpdateMemoryCommand = Readonly<{
  id: MemoryId;
  expectedVersion: number;
  content: MemoryContent;
  userApproved: boolean;
}>;

export type DeleteMemoryCommand = Readonly<{
  id?: MemoryId;
  purposeId?: PurposeId;
  allSensitive?: boolean;
  idempotencyKey: string;
}>;

export type RevocationResult = Readonly<{
  consentRecordId: ConsentRecordId;
  revokedRecords: number;
  ciphertextDeleted: number;
  derivativesDeleted: number;
  completedAt: string;
}>;

export type DeletionResult = Readonly<{
  requestId: string;
  status: "complete";
  deletedRecords: number;
  ciphertextDeleted: number;
  derivativesDeleted: number;
  completedAt: string;
}>;

export type ConsentGrant = Readonly<{
  id: ConsentRecordId;
  userId: UserId;
  purposeId: PurposeId;
  scope: readonly string[];
  status: ConsentStatus;
  policyVersion: string;
  grantedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
  source: "user_ui" | "import";
  version: number;
}>;

export type ConsentEvent = Readonly<{
  id: ConsentRecordId;
  userId: UserId;
  purposeId: PurposeId;
  scope: readonly string[];
  action: "grant" | "revoke" | "expire";
  policyVersion: string;
  occurredAt: string;
  source: "user_ui" | "import";
  priorEffectiveState: ConsentStatus | null;
  resultingEffectiveState: ConsentStatus;
  sequence: number;
  integrityHash: string;
}>;

export type GrantConsentCommand = Readonly<{
  purposeId: PurposeId;
  scope: readonly string[];
  policyVersion: string;
  expiresAt?: string;
  source: "user_ui" | "import";
}>;

export type RevokeConsentCommand = Readonly<{
  purposeId: PurposeId;
  policyVersion: string;
  source: "user_ui" | "import";
}>;

export type UserDataExport = Readonly<{
  schema: "teoyube-user-data-export";
  version: "1.0.0";
  generatedAt: string;
  userId: UserId;
  memories: readonly UserMemoryRecord[];
  consentHistory: readonly ConsentEvent[];
  deletionStatus: readonly Readonly<{ requestId: string; status: "complete"; completedAt: string }>[];
}>;

export interface MemoryRepository {
  create(userId: UserId, record: NewUserMemoryRecord, consentRecordId: ConsentRecordId, now: string): Promise<UserMemoryRecord>;
  getById(userId: UserId, id: MemoryId): Promise<UserMemoryRecord | null>;
  getAccessDescriptor(userId: UserId, id: MemoryId): Promise<MemoryAccessDescriptor | null>;
  listAccessDescriptors(userId: UserId, query: MemoryQuery): Promise<readonly MemoryAccessDescriptor[]>;
  list(userId: UserId, query: MemoryQuery): Promise<readonly UserMemoryRecord[]>;
  update(userId: UserId, command: UpdateMemoryCommand, now: string): Promise<UserMemoryRecord>;
  revokeByConsent(userId: UserId, consentRecordId: ConsentRecordId, now: string): Promise<RevocationResult>;
  delete(userId: UserId, command: DeleteMemoryCommand, now: string): Promise<DeletionResult>;
  export(userId: UserId, now: string, allowedPurposeIds: readonly PurposeId[]): Promise<UserDataExport>;
  deleteAccount(userId: UserId, idempotencyKey: string, now: string): Promise<DeletionResult>;
}

export interface ConsentLedger {
  grant(userId: UserId, command: GrantConsentCommand, now: string): Promise<ConsentGrant>;
  revoke(userId: UserId, command: RevokeConsentCommand, now: string): Promise<ConsentGrant>;
  expire(userId: UserId, purposeId: PurposeId, policyVersion: string, now: string): Promise<ConsentGrant>;
  getEffective(userId: UserId, purposeId: PurposeId, now: string): Promise<ConsentGrant | null>;
  history(userId: UserId, limit?: number): Promise<readonly ConsentEvent[]>;
}
