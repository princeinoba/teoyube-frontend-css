import { createHash } from "node:crypto";
import { MEMORY_PURPOSE_REGISTRY, validateConsentScopes, validateMemoryPurpose } from "../../../domain/memory/data-classification-registry";
import type {
  ConsentGrant,
  ConsentLedger,
  DeleteMemoryCommand,
  DeletionResult,
  GrantConsentCommand,
  MemoryQuery,
  MemoryRepository,
  NewUserMemoryRecord,
  PurposeId,
  RevokeConsentCommand,
  RevocationResult,
  UpdateMemoryCommand,
  UserDataExport,
  UserMemoryRecord
} from "../../../domain/memory/memory-contracts";
import type { AuthorizationContext } from "../../../domain/identity/identity-contracts";
import type { PrivacySafeEventSink } from "../../../server/observability/privacy-safe-events";
import { nullPrivacySafeEventSink } from "../../../server/observability/privacy-safe-events";

export const MEMORY_LIMITS = Object.freeze({
  listPageSize: 100,
  exportRecords: 5000,
  exportBytes: 2 * 1024 * 1024,
  sensitiveTextBytes: 20 * 1024,
  episodicRecords: 500,
  consentHistory: 100,
  deletionBatch: 250,
  apiBodyBytes: 64 * 1024,
  requestsPerMinute: 60,
  concurrentExportsPerUser: 1
});

type AtomicRevocationStore = Readonly<{
  revokeConsentAndMemory(userId: string, command: RevokeConsentCommand, now: string): Readonly<{ consent: ConsentGrant; revocation: RevocationResult }>;
}>;

const FORBIDDEN_SYSTEM_FACT_KEYS = Object.freeze([
  "callingIsFact", "divineDirectionIsCertain", "promiseFulfilled", "testimonyPublished", "spiritualWorth", "godActionDeclared"
]);

function safeSubjectHash(userId: string): string {
  return createHash("sha256").update("teoyube-operations").update(userId).digest("hex").slice(0, 16);
}

function hasForbiddenConclusion(record: NewUserMemoryRecord): boolean {
  return record.provenance.createdBy === "deterministic_system"
    && FORBIDDEN_SYSTEM_FACT_KEYS.some((key) => record.content[key] === true);
}

export class UserMemoryService {
  private readonly exporting = new Set<string>();

  constructor(
    private readonly repository: MemoryRepository,
    private readonly consent: ConsentLedger,
    private readonly atomicRevocation: AtomicRevocationStore,
    private readonly events: PrivacySafeEventSink = nullPrivacySafeEventSink,
    private readonly clock: () => string = () => new Date().toISOString()
  ) {}

  async grantConsent(context: AuthorizationContext, command: GrantConsentCommand): Promise<ConsentGrant> {
    if (!validateConsentScopes(command.purposeId, command.scope)) throw new Error("Consent scope is invalid for this purpose.");
    const granted = await this.consent.grant(context.user.id, command, this.clock());
    this.events.emit({ name: "consent_granted", occurredAt: this.clock(), subjectHash: safeSubjectHash(context.user.id), purposeId: command.purposeId, result: "allowed" });
    return granted;
  }

  async revokeConsent(context: AuthorizationContext, command: RevokeConsentCommand): Promise<Readonly<{ consent: ConsentGrant; revocation: RevocationResult }>> {
    const result = this.atomicRevocation.revokeConsentAndMemory(context.user.id, command, this.clock());
    this.events.emit({ name: "consent_revoked", occurredAt: this.clock(), subjectHash: safeSubjectHash(context.user.id), purposeId: command.purposeId, result: "complete", count: result.revocation.revokedRecords });
    return result;
  }

  async effectiveConsent(context: AuthorizationContext, purposeId: PurposeId): Promise<ConsentGrant | null> {
    return this.consent.getEffective(context.user.id, purposeId, this.clock());
  }

  async consentHistory(context: AuthorizationContext): Promise<Awaited<ReturnType<ConsentLedger["history"]>>> {
    return this.consent.history(context.user.id, MEMORY_LIMITS.consentHistory);
  }

  private async requireConsent(context: AuthorizationContext, purposeId: PurposeId, scope: "read" | "write" | "export" | "delete"): Promise<ConsentGrant> {
    const effective = await this.consent.getEffective(context.user.id, purposeId, this.clock());
    if (!effective || effective.status !== "granted" || (!effective.scope.includes(`memory:${scope}`) && !effective.scope.includes("memory:*"))) {
      this.events.emit({ name: "authorization_denied", occurredAt: this.clock(), subjectHash: safeSubjectHash(context.user.id), purposeId, result: "denied" });
      throw new Error("The required purpose-specific consent is not effective.");
    }
    return effective;
  }

  async create(context: AuthorizationContext, record: NewUserMemoryRecord): Promise<UserMemoryRecord> {
    if (!record.userApproved || !validateMemoryPurpose(record.layer, record.sensitivity, record.purposeId)) throw new Error("The memory write is not eligible for this purpose.");
    if (hasForbiddenConclusion(record)) throw new Error("Deterministic recommendations cannot be persisted as spiritual facts.");
    if (record.sensitivity === "sensitive_spiritual" && !record.explicitSensitiveContentApproval) throw new Error("Explicit sensitive-content approval is required.");
    const bytes = Buffer.byteLength(JSON.stringify(record.content));
    if (record.sensitivity === "sensitive_spiritual" && bytes > MEMORY_LIMITS.sensitiveTextBytes) throw new Error("Sensitive content exceeds the storage limit.");
    if (record.layer === "episodic") {
      const count = await this.repository.listAccessDescriptors(context.user.id, { layer: "episodic", limit: MEMORY_LIMITS.episodicRecords });
      if (count.length >= MEMORY_LIMITS.episodicRecords) throw new Error("The episodic memory limit has been reached.");
    }
    const grant = await this.requireConsent(context, record.purposeId, "write");
    const retentionDays = MEMORY_PURPOSE_REGISTRY[record.purposeId].retentionDays;
    const expiresAt = record.expiresAt || new Date(new Date(this.clock()).getTime() + retentionDays * 86_400_000).toISOString();
    const created = await this.repository.create(context.user.id, { ...record, expiresAt }, grant.id, this.clock());
    this.events.emit({ name: "memory_created_by_layer", occurredAt: this.clock(), subjectHash: safeSubjectHash(context.user.id), purposeId: record.purposeId, layer: record.layer, result: "complete", count: 1 });
    return created;
  }

  async list(context: AuthorizationContext, query: MemoryQuery): Promise<readonly UserMemoryRecord[]> {
    if (query.purposeId) await this.requireConsent(context, query.purposeId, "read");
    const descriptors = await this.repository.listAccessDescriptors(context.user.id, { ...query, limit: Math.min(query.limit || 50, MEMORY_LIMITS.listPageSize), status: "active" });
    const authorized: UserMemoryRecord[] = [];
    for (const descriptor of descriptors) {
      const effective = await this.consent.getEffective(context.user.id, descriptor.purposeId, this.clock());
      if (effective?.status === "granted" && (effective.scope.includes("memory:read") || effective.scope.includes("memory:*"))) {
        const record = await this.repository.getById(context.user.id, descriptor.id);
        if (record) authorized.push(record);
      }
    }
    return Object.freeze(authorized);
  }

  async update(context: AuthorizationContext, command: UpdateMemoryCommand): Promise<UserMemoryRecord> {
    const current = await this.repository.getAccessDescriptor(context.user.id, command.id);
    if (!current || current.status !== "active") throw new Error("Memory record is unavailable.");
    await this.requireConsent(context, current.purposeId, "write");
    if (current.sensitivity === "sensitive_spiritual" && Buffer.byteLength(JSON.stringify(command.content)) > MEMORY_LIMITS.sensitiveTextBytes) throw new Error("Sensitive content exceeds the storage limit.");
    return this.repository.update(context.user.id, command, this.clock());
  }

  async delete(context: AuthorizationContext, command: DeleteMemoryCommand): Promise<DeletionResult> {
    const result = await this.repository.delete(context.user.id, command, this.clock());
    this.events.emit({ name: "memory_deleted", occurredAt: this.clock(), subjectHash: safeSubjectHash(context.user.id), purposeId: command.purposeId, result: "complete", count: result.deletedRecords });
    return result;
  }

  async export(context: AuthorizationContext): Promise<UserDataExport> {
    if (this.exporting.has(context.user.id)) throw new Error("An export is already in progress.");
    this.exporting.add(context.user.id);
    this.events.emit({ name: "export_requested", occurredAt: this.clock(), subjectHash: safeSubjectHash(context.user.id), result: "allowed" });
    try {
      const allowed: PurposeId[] = [];
      for (const purpose of Object.keys(MEMORY_PURPOSE_REGISTRY) as PurposeId[]) {
        const effective = await this.consent.getEffective(context.user.id, purpose, this.clock());
        if (effective?.status === "granted" && (effective.scope.includes("memory:export") || effective.scope.includes("memory:*"))) allowed.push(purpose);
      }
      const result = await this.repository.export(context.user.id, this.clock(), allowed);
      const bytes = Buffer.byteLength(JSON.stringify(result));
      if (result.memories.length > MEMORY_LIMITS.exportRecords || bytes > MEMORY_LIMITS.exportBytes) throw new Error("The export exceeds the safe generation limit.");
      this.events.emit({ name: "export_completed", occurredAt: this.clock(), subjectHash: safeSubjectHash(context.user.id), result: "complete", count: result.memories.length });
      return result;
    } finally {
      this.exporting.delete(context.user.id);
    }
  }

  async deleteAccount(context: AuthorizationContext, idempotencyKey: string): Promise<DeletionResult> {
    const result = await this.repository.deleteAccount(context.user.id, idempotencyKey, this.clock());
    this.events.emit({ name: "deletion_completed", occurredAt: this.clock(), subjectHash: safeSubjectHash(context.user.id), result: "complete", count: result.deletedRecords });
    return result;
  }
}
