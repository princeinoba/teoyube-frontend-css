import {
  ResearchBoundaryError,
  type DeleteResearchParticipantData,
  type ResearchCohort,
  type ResearchDeletionReceipt,
  type ResearchDeletionResult,
  type ResearchEventQuery,
  type ResearchEventRecord,
  type ResearchEventRepository,
  type ResearchStudyExport
} from "../../domain/research/research-contracts";
import { RESEARCH_EVENT_REGISTRY_VERSION, getResearchStudy } from "../../domain/research/research-event-registry";
import { validateResearchEventRecord } from "../../domain/research/research-event-validator";
import { aggregateResearchEvents } from "./research-aggregate";
import { verifyResearchEventHash } from "./research-event-integrity";

export class InMemoryResearchEventRepository implements ResearchEventRepository {
  private events: ResearchEventRecord[] = [];
  private readonly deletions = new Map<string, ResearchDeletionReceipt>();

  async append(record: ResearchEventRecord): Promise<void> {
    validateResearchEventRecord(record);
    if (!verifyResearchEventHash(record)) throw new ResearchBoundaryError("research_event_hash_invalid");
    if (this.events.some((event) => event.eventId === record.eventId)) {
      throw new ResearchBoundaryError("research_event_duplicate");
    }
    const prior = this.events
      .filter((event) => event.studyId === record.studyId && event.participantId === record.participantId)
      .at(-1);
    if ((prior?.eventHash ?? null) !== record.previousEventHash) {
      throw new ResearchBoundaryError("research_event_chain_invalid");
    }
    this.events.push(Object.freeze({ ...record }));
  }

  async list(request: ResearchEventQuery): Promise<readonly ResearchEventRecord[]> {
    return Object.freeze(this.events.filter((event) =>
      event.studyId === request.studyId
      && (!request.participantId || event.participantId === request.participantId)
      && (!request.sessionId || event.sessionId === request.sessionId)
    ));
  }

  async deleteParticipant(request: DeleteResearchParticipantData): Promise<ResearchDeletionResult> {
    const key = `${request.studyId}:${request.deletionKey}`;
    const priorReceipt = this.deletions.get(key);
    if (priorReceipt) {
      return Object.freeze({
        studyId: request.studyId,
        participantId: request.participantId,
        status: "complete",
        deletedEvents: 0,
        deletedDerivatives: 0,
        completedAt: priorReceipt.completedAt,
        idempotent: true,
        backupLimitation: "local_active_store_only"
      });
    }
    const before = this.events.length;
    this.events = this.events.filter((event) => !(event.studyId === request.studyId && event.participantId === request.participantId));
    const completedAt = new Date().toISOString();
    this.deletions.set(key, Object.freeze({
      studyId: request.studyId,
      deletionKeyHash: request.deletionKey,
      status: "complete",
      completedAt,
      backupLimitation: "local_active_store_only"
    }));
    return Object.freeze({
      studyId: request.studyId,
      participantId: request.participantId,
      status: "complete",
      deletedEvents: before - this.events.length,
      deletedDerivatives: 0,
      completedAt,
      idempotent: false,
      backupLimitation: "local_active_store_only"
    });
  }

  async listDeletions(studyId: string): Promise<readonly ResearchDeletionReceipt[]> {
    return Object.freeze([...this.deletions.values()].filter((receipt) => receipt.studyId === studyId));
  }

  async exportStudy(studyId: string, cohort: ResearchCohort, generatedAt: string): Promise<ResearchStudyExport> {
    const study = getResearchStudy(studyId);
    const events = this.events
      .filter((event) => event.studyId === studyId && event.cohort === cohort)
      .sort((left, right) => left.timestamp.localeCompare(right.timestamp) || left.eventId.localeCompare(right.eventId));
    const deletionStatus = await this.listDeletions(studyId);
    return Object.freeze({
      schema: "teoyube-research-study-export",
      schemaVersion: "1.0.0",
      registryVersion: RESEARCH_EVENT_REGISTRY_VERSION,
      studyVersion: study.studyVersion,
      studyId,
      generatedAt,
      cohort,
      participantIds: Object.freeze([...new Set(events.map((event) => event.participantId))].sort()),
      deletionStatus,
      events: Object.freeze(events),
      aggregates: aggregateResearchEvents(events)
    });
  }

  async deleteStudy(studyId: string): Promise<number> {
    const before = this.events.length;
    this.events = this.events.filter((event) => event.studyId !== studyId);
    return before - this.events.length;
  }

  async deleteExpired(now: string): Promise<number> {
    const before = this.events.length;
    const expiry = Date.parse(now) - 180 * 24 * 60 * 60 * 1000;
    this.events = this.events.filter((event) => Date.parse(event.timestamp) >= expiry);
    return before - this.events.length;
  }

  async verifyIntegrity(studyId: string): Promise<boolean> {
    const groups = new Map<string, ResearchEventRecord[]>();
    for (const event of this.events.filter((candidate) => candidate.studyId === studyId)) {
      const key = `${event.studyId}:${event.participantId}`;
      groups.set(key, [...(groups.get(key) ?? []), event]);
    }
    for (const events of groups.values()) {
      let prior: string | null = null;
      for (const event of events) {
        if (!verifyResearchEventHash(event) || event.previousEventHash !== prior) return false;
        prior = event.eventHash;
      }
    }
    return true;
  }
}
