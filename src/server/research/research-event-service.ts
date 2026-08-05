import { createHash } from "node:crypto";
import type { PurposeId } from "../../domain/memory/memory-contracts";
import {
  ResearchBoundaryError,
  type DeleteResearchParticipantData,
  type RecordResearchEventCommand,
  type ResearchConsentReader,
  type ResearchDeletionResult,
  type ResearchEventRecord,
  type ResearchEventRecorder,
  type ResearchEventRepository,
  type ResearchOperationalEvent,
  type ResearchOperationalSink,
  type ResearchSessionEnvelopeVerifier
} from "../../domain/research/research-contracts";
import {
  getResearchEventDefinition,
  getResearchStudy
} from "../../domain/research/research-event-registry";
import { validateRecordResearchEventCommand } from "../../domain/research/research-event-validator";
import { calculateResearchEventHash } from "./research-event-integrity";
import type { ResearchRuntimeConfiguration } from "./research-runtime-config";

const baselinePurposes: readonly PurposeId[] = Object.freeze([
  "research_participation",
  "research_product_events"
]);

function deletionKey(studyId: string, participantId: string): string {
  return createHash("sha256").update(`${studyId}:${participantId}:research-delete`, "utf8").digest("hex");
}

export class ResearchEventService implements ResearchEventRecorder {
  constructor(
    private readonly configuration: ResearchRuntimeConfiguration,
    private readonly envelopeVerifier: ResearchSessionEnvelopeVerifier,
    private readonly consentReader: ResearchConsentReader,
    private readonly repository: ResearchEventRepository,
    private readonly operationalSink: ResearchOperationalSink,
    private readonly now: () => string
  ) {}

  private async emit(event: ResearchOperationalEvent): Promise<void> {
    try {
      await this.operationalSink.emit(event);
    } catch {
      // Operational telemetry is deliberately failure-isolated from research and product actions.
    }
  }

  private assertMode(): string {
    if (!this.configuration.enabled) throw new ResearchBoundaryError("research_mode_disabled");
    if (!this.configuration.studyId || !this.configuration.studyAllowed) {
      throw new ResearchBoundaryError("research_study_not_approved");
    }
    return this.configuration.studyId;
  }

  async record(commandInput: RecordResearchEventCommand): Promise<ResearchEventRecord> {
    const studyId = this.assertMode();
    const command = validateRecordResearchEventCommand(commandInput);
    const now = this.now();
    const session = this.envelopeVerifier.verify(command.envelopeToken, now);
    if (this.envelopeVerifier.isRevoked(session.envelopeId)) throw new ResearchBoundaryError("research_envelope_revoked");
    if (session.payload.studyId !== studyId) throw new ResearchBoundaryError("research_cross_study_envelope");
    const study = getResearchStudy(studyId);
    if (!study.allowedTaskIds.includes(command.taskId) || !session.payload.allowedTaskIds.includes(command.taskId)) {
      throw new ResearchBoundaryError("research_task_not_allowed");
    }
    if (Date.parse(command.timestamp) < Date.parse(session.payload.issuedAt) || Date.parse(command.timestamp) > Date.parse(session.payload.expiresAt)) {
      throw new ResearchBoundaryError("research_event_outside_session");
    }

    const definition = getResearchEventDefinition(command.eventName);
    const requiredPurposes = [...baselinePurposes, ...definition.additionalConsent];
    if (definition.group === "accessibility" && !session.payload.accessibilityObservationAllowed) {
      throw new ResearchBoundaryError("research_accessibility_consent_missing");
    }
    if (definition.additionalConsent.includes("research_optional_live_ai_task") && !session.payload.liveAiTaskAllowed) {
      throw new ResearchBoundaryError("research_live_ai_consent_missing");
    }

    const consentRecordIds: string[] = [];
    for (const purposeId of requiredPurposes) {
      const consent = await this.consentReader.getEffectiveConsent(session.payload.participantId, purposeId);
      if (!consent.granted || !consent.consentRecordId) {
        throw new ResearchBoundaryError(`research_consent_missing_${purposeId}`);
      }
      if (session.payload.consentRecordIds[purposeId] !== consent.consentRecordId) {
        throw new ResearchBoundaryError("research_consent_envelope_stale");
      }
      consentRecordIds.push(consent.consentRecordId);
    }

    const prior = (await this.repository.list({
      studyId,
      participantId: session.payload.participantId
    })).at(-1);
    const unsigned: Omit<ResearchEventRecord, "eventHash"> = Object.freeze({
      schemaVersion: "1.0.0",
      studyVersion: study.studyVersion,
      eventId: command.eventId,
      eventName: definition.name,
      eventVersion: definition.version,
      studyId,
      participantId: session.payload.participantId,
      sessionId: session.payload.sessionId,
      taskId: command.taskId,
      timestamp: command.timestamp,
      route: command.route,
      capability: command.capability,
      result: command.result,
      completionStatus: command.completionStatus,
      moderatorRescueCount: command.moderatorRescueCount,
      safeIssueCode: command.safeIssueCode,
      consentRecordIds: Object.freeze([...new Set(consentRecordIds)].sort()),
      sourceIds: Object.freeze([...command.sourceIds]),
      scenarioId: command.scenarioId,
      accessibilityMode: command.accessibilityMode,
      rating: command.rating,
      durationBucket: command.durationBucket,
      retentionClass: "formative_pilot_180_days",
      deletionKey: deletionKey(studyId, session.payload.participantId),
      cohort: session.payload.cohort,
      previousEventHash: prior?.eventHash ?? null
    });
    const record: ResearchEventRecord = Object.freeze({
      ...unsigned,
      eventHash: calculateResearchEventHash(unsigned)
    });
    await this.repository.append(record);
    await this.emit({
      name: "research_event_recorded",
      timestamp: now,
      studyAllowed: true,
      modeEnabled: true,
      safeCode: "research_event_recorded"
    });
    return record;
  }

  async recordSafely(command: unknown): Promise<Readonly<{ recorded: boolean; safeCode: string }>> {
    if (!this.configuration.enabled) return Object.freeze({ recorded: false, safeCode: "research_mode_disabled" });
    try {
      await this.record(command as RecordResearchEventCommand);
      return Object.freeze({ recorded: true, safeCode: "research_event_recorded" });
    } catch (error) {
      const safeCode = error instanceof ResearchBoundaryError ? error.safeCode : "research_event_write_failed";
      await this.emit({
        name: error instanceof ResearchBoundaryError ? "research_event_blocked" : "research_event_failed",
        timestamp: this.now(),
        studyAllowed: this.configuration.studyAllowed,
        modeEnabled: this.configuration.enabled,
        safeCode
      });
      return Object.freeze({ recorded: false, safeCode });
    }
  }

  async listForEnvelope(token: string): Promise<readonly ResearchEventRecord[]> {
    const studyId = this.assertMode();
    const session = this.envelopeVerifier.verify(token, this.now());
    if (session.payload.studyId !== studyId) throw new ResearchBoundaryError("research_cross_study_envelope");
    return this.repository.list({ studyId, participantId: session.payload.participantId });
  }

  async deleteParticipant(token: string): Promise<ResearchDeletionResult> {
    const studyId = this.assertMode();
    const session = this.envelopeVerifier.verify(token, this.now());
    if (session.payload.studyId !== studyId) throw new ResearchBoundaryError("research_cross_study_envelope");
    const request: DeleteResearchParticipantData = Object.freeze({
      studyId,
      participantId: session.payload.participantId,
      deletionKey: deletionKey(studyId, session.payload.participantId)
    });
    const result = await this.repository.deleteParticipant(request);
    await this.emit({
      name: "research_participant_deleted",
      timestamp: result.completedAt,
      studyAllowed: true,
      modeEnabled: true,
      safeCode: "research_participant_deleted"
    });
    return result;
  }
}

export class InMemoryResearchOperationalSink implements ResearchOperationalSink {
  readonly events: ResearchOperationalEvent[] = [];
  async emit(event: ResearchOperationalEvent): Promise<void> {
    this.events.push(Object.freeze({ ...event }));
  }
}

export class NullResearchOperationalSink implements ResearchOperationalSink {
  async emit(): Promise<void> {}
}
