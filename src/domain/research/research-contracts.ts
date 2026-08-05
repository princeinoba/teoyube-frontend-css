import type { PurposeId } from "../memory/memory-contracts";

export type ResearchStudyId = string;
export type ResearchParticipantId = string;
export type ResearchSessionId = string;
export type ResearchTaskId = string;
export type ResearchEventId = string;

export type ResearchCohort = "synthetic_ordinary" | "synthetic_expert" | "ordinary" | "expert";
export type ResearchResult = "success" | "partial" | "failure" | "withdrawn" | "stopped" | "not_applicable";
export type ResearchCompletionStatus = "started" | "completed" | "failed" | "withdrawn" | "deleted" | "stopped";
export type ResearchAccessibilityMode =
  | "not_volunteered"
  | "keyboard"
  | "screen_reader"
  | "zoom_reflow"
  | "reduced_motion"
  | "multiple";
export type ResearchDurationBucket = "under_30s" | "30s_to_2m" | "2m_to_5m" | "over_5m" | "not_measured";

export type ResearchEventRecord = Readonly<{
  schemaVersion: "1.0.0";
  studyVersion: string;
  eventId: ResearchEventId;
  eventName: string;
  eventVersion: string;
  studyId: ResearchStudyId;
  participantId: ResearchParticipantId;
  sessionId: ResearchSessionId;
  taskId: ResearchTaskId;
  timestamp: string;
  route: string;
  capability: string;
  result: ResearchResult;
  completionStatus: ResearchCompletionStatus;
  moderatorRescueCount: number;
  safeIssueCode: string | null;
  consentRecordIds: readonly string[];
  sourceIds: readonly string[];
  scenarioId: string;
  accessibilityMode: ResearchAccessibilityMode;
  rating: number | null;
  durationBucket: ResearchDurationBucket;
  retentionClass: "formative_pilot_180_days";
  deletionKey: string;
  cohort: ResearchCohort;
  previousEventHash: string | null;
  eventHash: string;
}>;

export type RecordResearchEventCommand = Readonly<{
  envelopeToken: string;
  eventId: ResearchEventId;
  eventName: string;
  taskId: ResearchTaskId;
  timestamp: string;
  route: string;
  capability: string;
  result: ResearchResult;
  completionStatus: ResearchCompletionStatus;
  moderatorRescueCount: number;
  safeIssueCode: string | null;
  sourceIds: readonly string[];
  scenarioId: string;
  accessibilityMode: ResearchAccessibilityMode;
  rating: number | null;
  durationBucket: ResearchDurationBucket;
}>;

export type ResearchSessionEnvelopePayload = Readonly<{
  schemaVersion: "1.0.0";
  studyId: ResearchStudyId;
  participantId: ResearchParticipantId;
  sessionId: ResearchSessionId;
  issuedAt: string;
  expiresAt: string;
  allowedTaskIds: readonly ResearchTaskId[];
  consentRecordIds: Readonly<Partial<Record<PurposeId, string>>>;
  recordingAllowed: boolean;
  liveAiTaskAllowed: boolean;
  accessibilityObservationAllowed: boolean;
  cohort: ResearchCohort;
  issuer: "teoyube-local-research-operator";
  keyId: string;
  nonce: string;
}>;

export type VerifiedResearchSession = Readonly<{
  payload: ResearchSessionEnvelopePayload;
  envelopeId: string;
}>;

export type ResearchConsentState = Readonly<{
  purposeId: PurposeId;
  granted: boolean;
  consentRecordId: string | null;
}>;

export interface ResearchConsentReader {
  getEffectiveConsent(participantId: ResearchParticipantId, purposeId: PurposeId): Promise<ResearchConsentState>;
}

export interface ResearchSessionEnvelopeVerifier {
  verify(token: string, now: string): VerifiedResearchSession;
  isRevoked(envelopeId: string): boolean;
}

export type ResearchEventQuery = Readonly<{
  studyId: ResearchStudyId;
  participantId?: ResearchParticipantId;
  sessionId?: ResearchSessionId;
}>;

export type DeleteResearchParticipantData = Readonly<{
  studyId: ResearchStudyId;
  participantId: ResearchParticipantId;
  deletionKey: string;
}>;

export type ResearchDeletionResult = Readonly<{
  studyId: ResearchStudyId;
  participantId: ResearchParticipantId;
  status: "complete";
  deletedEvents: number;
  deletedDerivatives: number;
  completedAt: string;
  idempotent: boolean;
  backupLimitation: "local_active_store_only";
}>;

export type ResearchDeletionReceipt = Readonly<{
  studyId: ResearchStudyId;
  deletionKeyHash: string;
  status: "complete";
  completedAt: string;
  backupLimitation: "local_active_store_only";
}>;

export type ResearchAggregateSummary = Readonly<{
  participantCount: number;
  sessionCount: number;
  taskCompletedCount: number;
  completionWithoutRescueCount: number;
  moderatorRescueCount: number;
  criticalMisunderstandingCount: number;
  sourceInspectionSuccessCount: number;
  scriptureInterpretationCorrectCount: number;
  callingBoundaryUnderstoodCount: number;
  testimonyFulfillmentBoundaryUnderstoodCount: number;
  memoryConsentUnderstoodCount: number;
  rejectUndoCount: number;
  fallbackUnderstoodCount: number;
  accessibilityBarriersByCategory: Readonly<Record<string, number>>;
  clarityRatings: readonly number[];
  trustRatings: readonly number[];
  safeIssueCounts: Readonly<Record<string, number>>;
  adverseEventCount: number;
}>;

export type ResearchStudyExport = Readonly<{
  schema: "teoyube-research-study-export";
  schemaVersion: "1.0.0";
  registryVersion: string;
  studyVersion: string;
  studyId: ResearchStudyId;
  generatedAt: string;
  cohort: "ordinary" | "expert" | "synthetic_ordinary" | "synthetic_expert";
  participantIds: readonly ResearchParticipantId[];
  deletionStatus: readonly ResearchDeletionReceipt[];
  events: readonly ResearchEventRecord[];
  aggregates: ResearchAggregateSummary;
}>;

export interface ResearchEventRecorder {
  record(command: RecordResearchEventCommand): Promise<ResearchEventRecord>;
  recordSafely(command: unknown): Promise<Readonly<{ recorded: boolean; safeCode: string }>>;
}

export interface ResearchEventRepository {
  append(record: ResearchEventRecord): Promise<void>;
  list(request: ResearchEventQuery): Promise<readonly ResearchEventRecord[]>;
  deleteParticipant(request: DeleteResearchParticipantData): Promise<ResearchDeletionResult>;
  listDeletions(studyId: ResearchStudyId): Promise<readonly ResearchDeletionReceipt[]>;
  exportStudy(studyId: ResearchStudyId, cohort: ResearchCohort, generatedAt: string): Promise<ResearchStudyExport>;
  deleteStudy(studyId: ResearchStudyId, completedAt: string): Promise<number>;
  deleteExpired(now: string): Promise<number>;
  verifyIntegrity(studyId: ResearchStudyId): Promise<boolean>;
}

export type ResearchOperationalEvent = Readonly<{
  name: "research_event_recorded" | "research_event_blocked" | "research_event_failed" | "research_participant_deleted";
  timestamp: string;
  studyAllowed: boolean;
  modeEnabled: boolean;
  safeCode: string;
}>;

export interface ResearchOperationalSink {
  emit(event: ResearchOperationalEvent): Promise<void>;
}

export class ResearchBoundaryError extends Error {
  constructor(public readonly safeCode: string) {
    super(safeCode);
    this.name = "ResearchBoundaryError";
  }
}
