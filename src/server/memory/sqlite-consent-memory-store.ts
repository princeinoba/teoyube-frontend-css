import { createHash, randomBytes, randomUUID } from "node:crypto";
import type {
  ConsentEvent,
  ConsentGrant,
  ConsentLedger,
  ConsentRecordId,
  ConsentStatus,
  DeleteMemoryCommand,
  DeletionResult,
  GrantConsentCommand,
  MemoryQuery,
  MemoryAccessDescriptor,
  MemoryRepository,
  NewUserMemoryRecord,
  PurposeId,
  RevocationResult,
  RevokeConsentCommand,
  UpdateMemoryCommand,
  UserDataExport,
  UserId,
  UserMemoryRecord
} from "../../domain/memory/memory-contracts";
import { decryptMemoryContent, encryptMemoryContent, type EncryptionKeyRing } from "./encryption";
import type { TeoyubeDatabase } from "./sqlite-database";
import { withImmediateTransaction } from "./sqlite-database";

type Row = Record<string, null | number | bigint | string | Uint8Array>;

function text(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new Error("Stored record is invalid.");
  return value;
}

function optionalText(row: Row, key: string): string | undefined {
  const value = row[key];
  return typeof value === "string" ? value : undefined;
}

function integer(row: Row, key: string): number {
  const value = row[key];
  if (typeof value !== "number" && typeof value !== "bigint") throw new Error("Stored record is invalid.");
  return Number(value);
}

function parseObject(value: string): Readonly<Record<string, unknown>> {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Stored record is invalid.");
  return Object.freeze(parsed as Record<string, unknown>);
}

function parseStringArray(value: string): readonly string[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) throw new Error("Stored record is invalid.");
  return Object.freeze([...parsed]);
}

function aad(userId: string, memoryId: string, purposeId: string): string {
  return `teoyube-memory:v1:${userId}:${memoryId}:${purposeId}`;
}

export class SqliteConsentMemoryStore implements ConsentLedger, MemoryRepository {
  constructor(
    private readonly database: TeoyubeDatabase,
    private readonly keyRing: EncryptionKeyRing,
    private readonly createId: () => string = randomUUID,
    private readonly createNonce: () => Uint8Array = () => randomBytes(12)
  ) {}

  private projection(userId: UserId, purposeId: PurposeId): Row | undefined {
    return this.database.prepare("SELECT * FROM consent_projection WHERE user_id = ? AND purpose_id = ?").get(userId, purposeId);
  }

  private appendConsentEventInTransaction(userId: UserId, command: GrantConsentCommand | RevokeConsentCommand, action: "grant" | "revoke" | "expire", now: string): ConsentGrant {
      const prior = this.projection(userId, command.purposeId);
      const priorStatus = prior ? text(prior, "status") as ConsentStatus : null;
      const sequenceRow = this.database.prepare("SELECT COALESCE(MAX(sequence), 0) AS sequence FROM consent_events WHERE user_id = ? AND purpose_id = ?").get(userId, command.purposeId);
      const sequence = sequenceRow ? integer(sequenceRow, "sequence") + 1 : 1;
      const id = this.createId();
      const scope = "scope" in command ? Object.freeze([...new Set(command.scope)]) : Object.freeze([] as string[]);
      const status: ConsentStatus = action === "grant" ? "granted" : action === "revoke" ? "revoked" : "expired";
      const expiresAt = "expiresAt" in command ? command.expiresAt : undefined;
      const previousHashRow = this.database.prepare("SELECT integrity_hash FROM consent_events WHERE user_id = ? AND purpose_id = ? ORDER BY sequence DESC LIMIT 1").get(userId, command.purposeId);
      const previousHash = previousHashRow ? text(previousHashRow, "integrity_hash") : "genesis";
      const integrityHash = createHash("sha256").update(JSON.stringify({ previousHash, id, userId, purposeId: command.purposeId, scope, action, policyVersion: command.policyVersion, now, source: command.source, priorStatus, status, sequence })).digest("hex");
      this.database.prepare("INSERT INTO consent_events(id,user_id,purpose_id,scope_json,action,policy_version,occurred_at,source,prior_status,resulting_status,sequence,integrity_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
        .run(id, userId, command.purposeId, JSON.stringify(scope), action, command.policyVersion, now, command.source, priorStatus, status, sequence, integrityHash);
      this.database.prepare("INSERT INTO consent_projection(user_id,purpose_id,event_id,status,scope_json,policy_version,source,granted_at,revoked_at,expires_at,version,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id,purpose_id) DO UPDATE SET event_id=excluded.event_id,status=excluded.status,scope_json=excluded.scope_json,policy_version=excluded.policy_version,source=excluded.source,granted_at=excluded.granted_at,revoked_at=excluded.revoked_at,expires_at=excluded.expires_at,version=excluded.version,updated_at=excluded.updated_at")
        .run(userId, command.purposeId, id, status, JSON.stringify(scope), command.policyVersion, command.source, status === "granted" ? now : null, status === "revoked" ? now : null, expiresAt || null, prior ? integer(prior, "version") + 1 : 1, now);
    return this.toGrant(this.projection(userId, command.purposeId)!);
  }

  async grant(userId: UserId, command: GrantConsentCommand, now: string): Promise<ConsentGrant> {
    if (!command.scope.length) throw new Error("Consent scope cannot be empty.");
    return withImmediateTransaction(this.database, () => this.appendConsentEventInTransaction(userId, command, "grant", now));
  }

  async revoke(userId: UserId, command: RevokeConsentCommand, now: string): Promise<ConsentGrant> {
    return withImmediateTransaction(this.database, () => this.appendConsentEventInTransaction(userId, command, "revoke", now));
  }

  async expire(userId: UserId, purposeId: PurposeId, policyVersion: string, now: string): Promise<ConsentGrant> {
    return withImmediateTransaction(this.database, () => this.appendConsentEventInTransaction(userId, { purposeId, policyVersion, source: "user_ui" }, "expire", now));
  }

  async getEffective(userId: UserId, purposeId: PurposeId, now: string): Promise<ConsentGrant | null> {
    const row = this.projection(userId, purposeId);
    if (!row) return null;
    const grant = this.toGrant(row);
    if (grant.status !== "granted") return grant;
    if (grant.expiresAt && grant.expiresAt <= now) {
      return withImmediateTransaction(this.database, () => {
        const expired = this.appendConsentEventInTransaction(userId, { purposeId, policyVersion: grant.policyVersion, source: "user_ui" }, "expire", now);
        this.revokeByConsentSync(userId, expired.id, now);
        return expired;
      });
    }
    return grant;
  }

  enforceRetention(now: string, batchSize = 250): Readonly<{ expiredConsents: number; expiredMemories: number; ciphertextDeleted: number; expiredSessions: number }> {
    return withImmediateTransaction(this.database, () => {
      const limit = Math.min(Math.max(batchSize, 1), 250);
      const expiredProjections = this.database.prepare("SELECT user_id,purpose_id,policy_version FROM consent_projection WHERE status='granted' AND expires_at IS NOT NULL AND expires_at<=? ORDER BY expires_at LIMIT ?").all(now, limit);
      let consentCiphertextDeleted = 0;
      for (const projection of expiredProjections) {
        const expired = this.appendConsentEventInTransaction(text(projection, "user_id"), { purposeId: text(projection, "purpose_id") as PurposeId, policyVersion: text(projection, "policy_version"), source: "user_ui" }, "expire", now);
        consentCiphertextDeleted += this.revokeByConsentSync(text(projection, "user_id"), expired.id, now).ciphertextDeleted;
      }
      const expiredRows = this.database.prepare("SELECT id,CASE WHEN ciphertext IS NOT NULL THEN 1 ELSE 0 END AS encrypted FROM memories WHERE status='active' AND expires_at IS NOT NULL AND expires_at<=? ORDER BY expires_at LIMIT ?").all(now, limit);
      for (const row of expiredRows) {
        this.database.prepare("UPDATE memories SET status='expired',content_json='{}',ciphertext=NULL,nonce=NULL,auth_tag=NULL,key_version=NULL,updated_at=?,version=version+1,sensitivity=CASE WHEN sensitivity='sensitive_spiritual' THEN 'structured_spiritual' ELSE sensitivity END WHERE id=? AND status='active'").run(now, text(row, "id"));
      }
      const sessions = this.database.prepare("DELETE FROM sessions WHERE expires_at<=? OR invalidated_at IS NOT NULL").run(now);
      return Object.freeze({ expiredConsents: expiredProjections.length, expiredMemories: expiredRows.length, ciphertextDeleted: consentCiphertextDeleted + expiredRows.reduce((count, row) => count + integer(row, "encrypted"), 0), expiredSessions: Number(sessions.changes) });
    });
  }

  async history(userId: UserId, limit = 100): Promise<readonly ConsentEvent[]> {
    return Object.freeze(this.database.prepare("SELECT * FROM consent_events WHERE user_id = ? ORDER BY occurred_at DESC, sequence DESC LIMIT ?").all(userId, Math.min(Math.max(limit, 1), 100)).map((row) => this.toConsentEvent(row)));
  }

  private toGrant(row: Row): ConsentGrant {
    const status = text(row, "status") as ConsentStatus;
    return Object.freeze({ id: text(row, "event_id"), userId: text(row, "user_id"), purposeId: text(row, "purpose_id") as PurposeId, scope: parseStringArray(text(row, "scope_json")), status, policyVersion: text(row, "policy_version"), grantedAt: optionalText(row, "granted_at"), revokedAt: optionalText(row, "revoked_at"), expiresAt: optionalText(row, "expires_at"), source: text(row, "source") as ConsentGrant["source"], version: integer(row, "version") });
  }

  private toConsentEvent(row: Row): ConsentEvent {
    return Object.freeze({ id: text(row, "id"), userId: text(row, "user_id"), purposeId: text(row, "purpose_id") as PurposeId, scope: parseStringArray(text(row, "scope_json")), action: text(row, "action") as ConsentEvent["action"], policyVersion: text(row, "policy_version"), occurredAt: text(row, "occurred_at"), source: text(row, "source") as ConsentEvent["source"], priorEffectiveState: optionalText(row, "prior_status") as ConsentStatus | undefined || null, resultingEffectiveState: text(row, "resulting_status") as ConsentStatus, sequence: integer(row, "sequence"), integrityHash: text(row, "integrity_hash") });
  }

  async create(userId: UserId, record: NewUserMemoryRecord, consentRecordId: ConsentRecordId, now: string): Promise<UserMemoryRecord> {
    const existing = this.database.prepare("SELECT * FROM memories WHERE user_id = ? AND idempotency_key = ?").get(userId, record.idempotencyKey);
    if (existing) return this.toMemory(existing);
    const id = this.createId();
    const encrypted = record.sensitivity === "sensitive_spiritual" ? encryptMemoryContent(record.content, aad(userId, id, record.purposeId), this.keyRing, this.createNonce()) : null;
    this.database.prepare("INSERT INTO memories(id,user_id,idempotency_key,layer,sensitivity,purpose_id,consent_record_id,provenance_json,content_json,ciphertext,nonce,auth_tag,key_version,user_approved,status,created_at,updated_at,expires_at,version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)")
      .run(id, userId, record.idempotencyKey, record.layer, record.sensitivity, record.purposeId, consentRecordId, JSON.stringify(record.provenance), encrypted ? null : JSON.stringify(record.content), encrypted?.ciphertext || null, encrypted?.nonce || null, encrypted?.authTag || null, encrypted?.keyVersion || null, record.userApproved ? 1 : 0, "active", now, now, record.expiresAt || null);
    return this.toMemory(this.database.prepare("SELECT * FROM memories WHERE id = ? AND user_id = ?").get(id, userId)!);
  }

  async getById(userId: UserId, id: string): Promise<UserMemoryRecord | null> {
    const row = this.database.prepare("SELECT * FROM memories WHERE id = ? AND user_id = ?").get(id, userId);
    return row ? this.toMemory(row) : null;
  }

  async getAccessDescriptor(userId: UserId, id: string): Promise<MemoryAccessDescriptor | null> {
    const row = this.database.prepare("SELECT id,purpose_id,sensitivity,status,version FROM memories WHERE id=? AND user_id=?").get(id, userId);
    return row ? this.toAccessDescriptor(row) : null;
  }

  async listAccessDescriptors(userId: UserId, query: MemoryQuery): Promise<readonly MemoryAccessDescriptor[]> {
    const clauses = ["user_id = ?"];
    const values: Array<string | number> = [userId];
    if (query.layer) { clauses.push("layer = ?"); values.push(query.layer); }
    if (query.purposeId) { clauses.push("purpose_id = ?"); values.push(query.purposeId); }
    clauses.push("status = ?"); values.push(query.status || "active");
    values.push(Math.min(Math.max(query.limit || 50, 1), 100), Math.max(query.offset || 0, 0));
    return Object.freeze(this.database.prepare(`SELECT id,purpose_id,sensitivity,status,version FROM memories WHERE ${clauses.join(" AND ")} ORDER BY updated_at DESC LIMIT ? OFFSET ?`).all(...values).map((row) => this.toAccessDescriptor(row)));
  }

  async list(userId: UserId, query: MemoryQuery): Promise<readonly UserMemoryRecord[]> {
    const clauses = ["user_id = ?"];
    const values: Array<string | number> = [userId];
    if (query.layer) { clauses.push("layer = ?"); values.push(query.layer); }
    if (query.purposeId) { clauses.push("purpose_id = ?"); values.push(query.purposeId); }
    clauses.push("status = ?"); values.push(query.status || "active");
    values.push(Math.min(Math.max(query.limit || 50, 1), 100), Math.max(query.offset || 0, 0));
    return Object.freeze(this.database.prepare(`SELECT * FROM memories WHERE ${clauses.join(" AND ")} ORDER BY updated_at DESC LIMIT ? OFFSET ?`).all(...values).map((row) => this.toMemory(row)));
  }

  async update(userId: UserId, command: UpdateMemoryCommand, now: string): Promise<UserMemoryRecord> {
    const current = this.database.prepare("SELECT * FROM memories WHERE id = ? AND user_id = ? AND status = 'active'").get(command.id, userId);
    if (!current) throw new Error("Memory record is unavailable.");
    if (integer(current, "version") !== command.expectedVersion) throw new Error("Memory record version conflict.");
    const sensitivity = text(current, "sensitivity");
    const purposeId = text(current, "purpose_id");
    const encrypted = sensitivity === "sensitive_spiritual" ? encryptMemoryContent(command.content, aad(userId, command.id, purposeId), this.keyRing, this.createNonce()) : null;
    const result = this.database.prepare("UPDATE memories SET content_json=?,ciphertext=?,nonce=?,auth_tag=?,key_version=?,user_approved=?,updated_at=?,version=version+1 WHERE id=? AND user_id=? AND version=? AND status='active'")
      .run(encrypted ? null : JSON.stringify(command.content), encrypted?.ciphertext || null, encrypted?.nonce || null, encrypted?.authTag || null, encrypted?.keyVersion || null, command.userApproved ? 1 : 0, now, command.id, userId, command.expectedVersion);
    if (Number(result.changes) !== 1) throw new Error("Memory record version conflict.");
    return this.toMemory(this.database.prepare("SELECT * FROM memories WHERE id = ? AND user_id = ?").get(command.id, userId)!);
  }

  private revokeByConsentSync(userId: UserId, consentRecordId: ConsentRecordId, now: string): RevocationResult {
    const event = this.database.prepare("SELECT purpose_id FROM consent_events WHERE id=? AND user_id=?").get(consentRecordId, userId);
    if (!event) return Object.freeze({ consentRecordId, revokedRecords: 0, ciphertextDeleted: 0, derivativesDeleted: 0, completedAt: now });
    const purposeId = text(event, "purpose_id");
    const counts = this.database.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN ciphertext IS NOT NULL THEN 1 ELSE 0 END) AS encrypted FROM memories WHERE user_id=? AND purpose_id=? AND status='active'").get(userId, purposeId)!;
    this.database.prepare("UPDATE memories SET status='revoked',content_json='{}',ciphertext=NULL,nonce=NULL,auth_tag=NULL,key_version=NULL,updated_at=?,version=version+1,sensitivity=CASE WHEN sensitivity='sensitive_spiritual' THEN 'structured_spiritual' ELSE sensitivity END WHERE user_id=? AND purpose_id=? AND status='active'").run(now, userId, purposeId);
    return Object.freeze({ consentRecordId, revokedRecords: integer(counts, "total"), ciphertextDeleted: Number(counts.encrypted || 0), derivativesDeleted: 0, completedAt: now });
  }

  async revokeByConsent(userId: UserId, consentRecordId: ConsentRecordId, now: string): Promise<RevocationResult> {
    return this.revokeByConsentSync(userId, consentRecordId, now);
  }

  revokeConsentAndMemory(userId: UserId, command: RevokeConsentCommand, now: string): Readonly<{ consent: ConsentGrant; revocation: RevocationResult }> {
    return withImmediateTransaction(this.database, () => {
      const consent = this.appendConsentEventInTransaction(userId, command, "revoke", now);
      const revocation = this.revokeByConsentSync(userId, consent.id, now);
      return Object.freeze({ consent, revocation });
    });
  }

  async delete(userId: UserId, command: DeleteMemoryCommand, now: string): Promise<DeletionResult> {
    const existing = this.database.prepare("SELECT * FROM deletion_status WHERE user_id=? AND idempotency_key=?").get(userId, command.idempotencyKey);
    if (existing) return this.toDeletion(existing);
    return withImmediateTransaction(this.database, () => {
      const clauses = ["user_id=?", "status IN ('active','revoked','expired')"];
      const values: string[] = [userId];
      if (command.id) { clauses.push("id=?"); values.push(command.id); }
      if (command.purposeId) { clauses.push("purpose_id=?"); values.push(command.purposeId); }
      if (command.allSensitive) clauses.push("sensitivity='sensitive_spiritual'");
      const where = clauses.join(" AND ");
      const counts = this.database.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN ciphertext IS NOT NULL THEN 1 ELSE 0 END) AS encrypted FROM memories WHERE ${where}`).get(...values)!;
      this.database.prepare(`DELETE FROM memories WHERE ${where}`).run(...values);
      const requestId = this.createId();
      this.database.prepare("INSERT INTO deletion_status(request_id,user_id,idempotency_key,status,deleted_records,ciphertext_deleted,derivatives_deleted,completed_at) VALUES (?,?,?,?,?,?,?,?)").run(requestId, userId, command.idempotencyKey, "complete", integer(counts, "total"), Number(counts.encrypted || 0), 0, now);
      return this.toDeletion(this.database.prepare("SELECT * FROM deletion_status WHERE request_id=?").get(requestId)!);
    });
  }

  async export(userId: UserId, now: string, allowedPurposeIds: readonly PurposeId[]): Promise<UserDataExport> {
    const placeholders = allowedPurposeIds.map(() => "?").join(",");
    const memories = allowedPurposeIds.length
      ? Object.freeze(this.database.prepare(`SELECT * FROM memories WHERE user_id=? AND status='active' AND purpose_id IN (${placeholders}) ORDER BY updated_at DESC LIMIT 5000`).all(userId, ...allowedPurposeIds).map((row) => this.toMemory(row)))
      : Object.freeze([] as UserMemoryRecord[]);
    const consentHistory = await this.history(userId, 100);
    const deletionStatus = this.database.prepare("SELECT request_id,status,completed_at FROM deletion_status WHERE user_id=? ORDER BY completed_at DESC LIMIT 100").all(userId).map((row) => Object.freeze({ requestId: text(row, "request_id"), status: "complete" as const, completedAt: text(row, "completed_at") }));
    return Object.freeze({ schema: "teoyube-user-data-export", version: "1.0.0", generatedAt: now, userId, memories, consentHistory, deletionStatus: Object.freeze(deletionStatus) });
  }

  async deleteAccount(userId: UserId, idempotencyKey: string, now: string): Promise<DeletionResult> {
    const result = await this.delete(userId, { idempotencyKey }, now);
    withImmediateTransaction(this.database, () => {
      this.database.prepare("UPDATE users SET deleted_at=? WHERE id=? AND deleted_at IS NULL").run(now, userId);
      this.database.prepare("UPDATE sessions SET invalidated_at=? WHERE user_id=? AND invalidated_at IS NULL").run(now, userId);
      this.database.prepare("DELETE FROM consent_projection WHERE user_id=?").run(userId);
    });
    return result;
  }

  private toMemory(row: Row): UserMemoryRecord {
    const sensitivity = text(row, "sensitivity") as UserMemoryRecord["sensitivity"];
    const status = text(row, "status") as UserMemoryRecord["status"];
    const content = status !== "active" ? Object.freeze({ redacted: true }) : sensitivity === "sensitive_spiritual"
      ? decryptMemoryContent({ ciphertext: text(row, "ciphertext"), nonce: text(row, "nonce"), authTag: text(row, "auth_tag"), keyVersion: text(row, "key_version") }, aad(text(row, "user_id"), text(row, "id"), text(row, "purpose_id")), this.keyRing)
      : parseObject(text(row, "content_json"));
    return Object.freeze({ id: text(row, "id"), userId: text(row, "user_id"), layer: text(row, "layer") as UserMemoryRecord["layer"], sensitivity, purposeId: text(row, "purpose_id") as PurposeId, consentRecordId: text(row, "consent_record_id"), provenance: parseObject(text(row, "provenance_json")) as UserMemoryRecord["provenance"], content, userApproved: integer(row, "user_approved") === 1, status, createdAt: text(row, "created_at"), updatedAt: text(row, "updated_at"), expiresAt: optionalText(row, "expires_at"), version: integer(row, "version") });
  }

  private toAccessDescriptor(row: Row): MemoryAccessDescriptor {
    return Object.freeze({ id: text(row, "id"), purposeId: text(row, "purpose_id") as PurposeId, sensitivity: text(row, "sensitivity") as MemoryAccessDescriptor["sensitivity"], status: text(row, "status") as MemoryAccessDescriptor["status"], version: integer(row, "version") });
  }

  private toDeletion(row: Row): DeletionResult {
    return Object.freeze({ requestId: text(row, "request_id"), status: "complete", deletedRecords: integer(row, "deleted_records"), ciphertextDeleted: integer(row, "ciphertext_deleted"), derivativesDeleted: integer(row, "derivatives_deleted"), completedAt: text(row, "completed_at") });
  }
}
