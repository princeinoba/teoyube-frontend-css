import { createHash, randomBytes } from "node:crypto";
import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
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
import {
  decryptMemoryContent,
  encryptMemoryContent,
  type EncryptedPayload,
  type EncryptionKeyRing
} from "../memory/encryption";
import { aggregateResearchEvents } from "./research-aggregate";
import { verifyResearchEventHash } from "./research-event-integrity";

type StoredEncryptedResearchEvent = Readonly<{
  schema: "teoyube-encrypted-research-event";
  schemaVersion: "1.0.0";
  aad: string;
  encrypted: EncryptedPayload;
}>;

const safePathSegment = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function assertSegment(value: string): string {
  if (!safePathSegment.test(value)) throw new ResearchBoundaryError("research_storage_path_invalid");
  return value;
}

function asObject(record: ResearchEventRecord): Readonly<Record<string, unknown>> {
  return JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
}

export class EncryptedFileResearchEventRepository implements ResearchEventRepository {
  private readonly eventsRoot: string;
  private readonly exportsRoot: string;
  private readonly deletionsRoot: string;

  constructor(
    private readonly rootPath: string,
    private readonly keyRing: EncryptionKeyRing,
    private readonly now: () => string
  ) {
    const resolved = path.resolve(rootPath);
    this.eventsRoot = path.join(resolved, "events");
    this.exportsRoot = path.join(resolved, "exports");
    this.deletionsRoot = path.join(resolved, "deletions");
  }

  private participantDirectory(studyId: string, participantId: string): string {
    return path.join(this.eventsRoot, assertSegment(studyId), assertSegment(participantId));
  }

  private eventFile(record: Pick<ResearchEventRecord, "studyId" | "participantId" | "eventId">): string {
    return path.join(this.participantDirectory(record.studyId, record.participantId), `${assertSegment(record.eventId)}.enc.json`);
  }

  private deletionReceiptFile(studyId: string, deletionKey: string): string {
    const digest = createHash("sha256").update(deletionKey, "utf8").digest("hex");
    return path.join(this.deletionsRoot, assertSegment(studyId), `${digest}.json`);
  }

  async append(record: ResearchEventRecord): Promise<void> {
    validateResearchEventRecord(record);
    if (!verifyResearchEventHash(record)) throw new ResearchBoundaryError("research_event_hash_invalid");
    const target = this.eventFile(record);
    if (await exists(target)) throw new ResearchBoundaryError("research_event_duplicate");
    const prior = (await this.list({ studyId: record.studyId, participantId: record.participantId })).at(-1);
    if ((prior?.eventHash ?? null) !== record.previousEventHash) throw new ResearchBoundaryError("research_event_chain_invalid");

    const aad = `${record.studyId}:${record.participantId}:${record.eventId}`;
    const encrypted = encryptMemoryContent(asObject(record), aad, this.keyRing, randomBytes(12));
    const stored: StoredEncryptedResearchEvent = Object.freeze({
      schema: "teoyube-encrypted-research-event",
      schemaVersion: "1.0.0",
      aad,
      encrypted
    });
    await mkdir(path.dirname(target), { recursive: true });
    try {
      await writeFile(target, `${JSON.stringify(stored)}\n`, { encoding: "utf8", flag: "wx" });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new ResearchBoundaryError("research_event_duplicate");
      throw error;
    }
  }

  private async readParticipant(studyId: string, participantId: string): Promise<readonly ResearchEventRecord[]> {
    const directory = this.participantDirectory(studyId, participantId);
    if (!(await exists(directory))) return Object.freeze([]);
    const records: ResearchEventRecord[] = [];
    for (const fileName of (await readdir(directory)).filter((name) => name.endsWith(".enc.json")).sort()) {
      const stored = JSON.parse(await readFile(path.join(directory, fileName), "utf8")) as StoredEncryptedResearchEvent;
      if (stored.schema !== "teoyube-encrypted-research-event" || stored.schemaVersion !== "1.0.0") {
        throw new ResearchBoundaryError("research_storage_schema_invalid");
      }
      const decrypted = decryptMemoryContent(stored.encrypted, stored.aad, this.keyRing);
      records.push(validateResearchEventRecord(decrypted));
    }
    return Object.freeze(records.sort((left, right) => left.timestamp.localeCompare(right.timestamp) || left.eventId.localeCompare(right.eventId)));
  }

  async list(request: ResearchEventQuery): Promise<readonly ResearchEventRecord[]> {
    assertSegment(request.studyId);
    const participantIds = request.participantId
      ? [request.participantId]
      : (await exists(path.join(this.eventsRoot, request.studyId)))
        ? await readdir(path.join(this.eventsRoot, request.studyId))
        : [];
    const records: ResearchEventRecord[] = [];
    for (const participantId of participantIds.sort()) {
      records.push(...await this.readParticipant(request.studyId, participantId));
    }
    return Object.freeze(records.filter((event) => !request.sessionId || event.sessionId === request.sessionId));
  }

  async deleteParticipant(request: DeleteResearchParticipantData): Promise<ResearchDeletionResult> {
    const receiptFile = this.deletionReceiptFile(request.studyId, request.deletionKey);
    if (await exists(receiptFile)) {
      const receipt = JSON.parse(await readFile(receiptFile, "utf8")) as ResearchDeletionReceipt;
      return Object.freeze({
        studyId: request.studyId,
        participantId: request.participantId,
        status: "complete",
        deletedEvents: 0,
        deletedDerivatives: 0,
        completedAt: receipt.completedAt,
        idempotent: true,
        backupLimitation: "local_active_store_only"
      });
    }
    const records = await this.readParticipant(request.studyId, request.participantId);
    await rm(this.participantDirectory(request.studyId, request.participantId), { recursive: true, force: true });
    const completedAt = this.now();
    const receipt: ResearchDeletionReceipt = Object.freeze({
      studyId: request.studyId,
      deletionKeyHash: createHash("sha256").update(request.deletionKey, "utf8").digest("hex"),
      status: "complete",
      completedAt,
      backupLimitation: "local_active_store_only"
    });
    await mkdir(path.dirname(receiptFile), { recursive: true });
    await writeFile(receiptFile, `${JSON.stringify(receipt)}\n`, { encoding: "utf8", flag: "wx" });
    return Object.freeze({
      studyId: request.studyId,
      participantId: request.participantId,
      status: "complete",
      deletedEvents: records.length,
      deletedDerivatives: 0,
      completedAt,
      idempotent: false,
      backupLimitation: "local_active_store_only"
    });
  }

  async listDeletions(studyId: string): Promise<readonly ResearchDeletionReceipt[]> {
    const directory = path.join(this.deletionsRoot, assertSegment(studyId));
    if (!(await exists(directory))) return Object.freeze([]);
    const receipts: ResearchDeletionReceipt[] = [];
    for (const fileName of (await readdir(directory)).filter((name) => name.endsWith(".json")).sort()) {
      receipts.push(JSON.parse(await readFile(path.join(directory, fileName), "utf8")) as ResearchDeletionReceipt);
    }
    return Object.freeze(receipts);
  }

  async exportStudy(studyId: string, cohort: ResearchCohort, generatedAt: string): Promise<ResearchStudyExport> {
    const study = getResearchStudy(studyId);
    const events = (await this.list({ studyId })).filter((event) => event.cohort === cohort);
    return Object.freeze({
      schema: "teoyube-research-study-export",
      schemaVersion: "1.0.0",
      registryVersion: RESEARCH_EVENT_REGISTRY_VERSION,
      studyVersion: study.studyVersion,
      studyId,
      generatedAt,
      cohort,
      participantIds: Object.freeze([...new Set(events.map((event) => event.participantId))].sort()),
      deletionStatus: await this.listDeletions(studyId),
      events: Object.freeze([...events]),
      aggregates: aggregateResearchEvents(events)
    });
  }

  async deleteStudy(studyId: string): Promise<number> {
    const records = await this.list({ studyId });
    await rm(path.join(this.eventsRoot, assertSegment(studyId)), { recursive: true, force: true });
    await rm(path.join(this.exportsRoot, assertSegment(studyId)), { recursive: true, force: true });
    return records.length;
  }

  async deleteExpired(now: string): Promise<number> {
    if (!(await exists(this.eventsRoot))) return 0;
    let deleted = 0;
    const expiry = Date.parse(now) - 180 * 24 * 60 * 60 * 1000;
    for (const studyId of await readdir(this.eventsRoot)) {
      for (const participantId of await readdir(path.join(this.eventsRoot, studyId))) {
        for (const event of await this.readParticipant(studyId, participantId)) {
          if (Date.parse(event.timestamp) < expiry) {
            await rm(this.eventFile(event), { force: true });
            deleted += 1;
          }
        }
      }
    }
    return deleted;
  }

  async verifyIntegrity(studyId: string): Promise<boolean> {
    const records = await this.list({ studyId });
    const groups = new Map<string, ResearchEventRecord[]>();
    for (const event of records) {
      const key = `${event.studyId}:${event.participantId}`;
      groups.set(key, [...(groups.get(key) ?? []), event]);
    }
    for (const events of groups.values()) {
      let previous: string | null = null;
      for (const event of events) {
        if (!verifyResearchEventHash(event) || event.previousEventHash !== previous) return false;
        previous = event.eventHash;
      }
    }
    return true;
  }
}
