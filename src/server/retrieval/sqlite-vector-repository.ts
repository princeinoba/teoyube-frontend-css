import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  DeleteConsentVectorsRequest,
  DeleteUserVectorsRequest,
  DeleteVectorsBySourceRequest,
  RetrievalDocumentMetadata,
  RetrievalPartition,
  VectorCompactionResult,
  VectorDeletionResult,
  VectorIndexInfo,
  VectorRecord,
  VectorRepository,
  VectorSearchRequest,
  VectorSearchResult,
  VectorUpsertResult
} from "../../domain/retrieval/retrieval-contracts";
import { validateRetrievalMetadata } from "../../domain/retrieval/retrieval-policy";
import {
  decryptMemoryContent,
  encryptMemoryContent,
  type EncryptedPayload,
  type EncryptionKeyRing
} from "../memory/encryption";
import { RETRIEVAL_LIMITS } from "./retrieval-config";

type SqlValue = null | number | bigint | string | Uint8Array;
type Row = Record<string, SqlValue>;

function text(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new Error(`Stored vector ${key} is invalid.`);
  return value;
}

function optionalText(row: Row, key: string): string | undefined {
  const value = row[key];
  return typeof value === "string" ? value : undefined;
}

function integer(row: Row, key: string): number {
  const value = row[key];
  if (typeof value !== "number" && typeof value !== "bigint") {
    throw new Error(`Stored vector ${key} is invalid.`);
  }
  return Number(value);
}

function parseStringArray(value: string): readonly string[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new Error("Stored vector authorization metadata is invalid.");
  }
  return Object.freeze([...parsed]);
}

function parseMetadata(value: string): RetrievalDocumentMetadata {
  const parsed = JSON.parse(value) as RetrievalDocumentMetadata;
  const validation = validateRetrievalMetadata(parsed);
  if (!validation.valid) throw new Error("Stored vector metadata failed validation.");
  return Object.freeze(parsed);
}

function vectorBlob(vector: readonly number[]): Uint8Array {
  const values = Float32Array.from(vector);
  return new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
}

function vectorFromBlob(value: SqlValue, dimension: number): Float32Array {
  if (!(value instanceof Uint8Array) || value.byteLength !== dimension * 4) {
    throw new Error("Stored vector bytes do not match the recorded dimension.");
  }
  if (value.byteOffset % 4 === 0) return new Float32Array(value.buffer, value.byteOffset, dimension);
  const copied = Uint8Array.from(value);
  return new Float32Array(copied.buffer);
}

function squaredNorm(values: ArrayLike<number>): number {
  let total = 0;
  for (let index = 0; index < values.length; index += 1) total += values[index] * values[index];
  return total;
}

function cosine(left: ArrayLike<number>, right: ArrayLike<number>, leftNorm = squaredNorm(left)): number {
  if (left.length !== right.length || left.length === 0) return -1;
  let dot = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    rightNorm += right[index] * right[index];
  }
  if (leftNorm === 0 || rightNorm === 0) return -1;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

function userAad(userId: string, recordId: string, indexVersion: string): string {
  return `teoyube-retrieval:v1:${userId}:${recordId}:${indexVersion}`;
}

function completed(deleted: number, invalidated: number, now: string): VectorDeletionResult {
  return Object.freeze({
    deleted,
    invalidated,
    completedAt: now,
    retryableFailures: Object.freeze([])
  });
}

export type ReusableVector = Readonly<{
  id: string;
  normalizedContentHash: string;
  vector: readonly number[];
}>;

export class SqliteVectorRepository implements VectorRepository {
  readonly #database: DatabaseSync;
  readonly #location: string;
  readonly #keyRing?: EncryptionKeyRing;

  constructor(location: string, keyRing?: EncryptionKeyRing) {
    mkdirSync(dirname(location), { recursive: true });
    this.#location = location;
    this.#keyRing = keyRing;
    this.#database = new DatabaseSync(location, { enableForeignKeyConstraints: true });
    this.#database.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS retrieval_schema (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS vector_records (
        id TEXT NOT NULL,
        index_version TEXT NOT NULL,
        partition TEXT NOT NULL,
        trust_level TEXT NOT NULL,
        language TEXT NOT NULL,
        dimension INTEGER NOT NULL,
        embedding_model TEXT NOT NULL,
        embedding_adapter_version TEXT NOT NULL,
        normalized_content_hash TEXT NOT NULL,
        document_id TEXT NOT NULL,
        source_id TEXT NOT NULL,
        source_version TEXT NOT NULL,
        source_checksum TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        title TEXT NOT NULL,
        chunk_role TEXT NOT NULL,
        ordinal INTEGER NOT NULL,
        token_count INTEGER NOT NULL,
        matched_text_hash TEXT NOT NULL,
        content_text TEXT,
        vector_blob BLOB,
        encrypted_payload_json TEXT,
        user_id TEXT,
        consent_record_ids_json TEXT NOT NULL,
        purpose_ids_json TEXT NOT NULL,
        expires_at TEXT,
        deleted_at TEXT,
        active INTEGER NOT NULL DEFAULT 0,
        indexed_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY(id,index_version),
        CHECK (deleted_at IS NOT NULL
          OR (user_id IS NULL AND vector_blob IS NOT NULL AND encrypted_payload_json IS NULL)
          OR (user_id IS NOT NULL AND vector_blob IS NULL AND content_text IS NULL AND encrypted_payload_json IS NOT NULL))
      );
      CREATE INDEX IF NOT EXISTS vector_search_scope
        ON vector_records(index_version,partition,trust_level,language,active,user_id);
      CREATE INDEX IF NOT EXISTS vector_source_scope
        ON vector_records(source_id,source_version,user_id,active);
      CREATE INDEX IF NOT EXISTS vector_consent_scope
        ON vector_records(user_id,active);
      CREATE TABLE IF NOT EXISTS active_retrieval_indexes (
        partition TEXT PRIMARY KEY,
        index_version TEXT NOT NULL,
        activated_at TEXT NOT NULL
      );
      INSERT OR IGNORE INTO retrieval_schema(version,applied_at)
        VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
    `);
  }

  close(): void {
    this.#database.close();
  }

  async upsert(
    partition: RetrievalPartition,
    records: readonly VectorRecord[]
  ): Promise<VectorUpsertResult> {
    if (records.length === 0) {
      return Object.freeze({
        partition,
        inserted: 0,
        updated: 0,
        unchanged: 0,
        indexVersion: ""
      });
    }
    if (records.some((record) => record.metadata.partition !== partition)) {
      throw new Error("Vector records cannot cross partition boundaries.");
    }
    const indexVersions = new Set(records.map((record) => record.indexVersion));
    if (indexVersions.size !== 1) throw new Error("A vector upsert batch must use one index version.");
    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    this.#database.exec("BEGIN IMMEDIATE");
    try {
      for (const record of records) {
        const validation = validateRetrievalMetadata(record.metadata);
        if (!validation.valid) throw new Error(`Vector metadata is invalid: ${validation.errors.join("; ")}`);
        if (
          record.vector.length !== record.metadata.embeddingDimension ||
          record.vector.some((value) => !Number.isFinite(value))
        ) {
          throw new Error("Vector dimension or value is invalid.");
        }
        const existing = this.#database
          .prepare(
            "SELECT normalized_content_hash,embedding_model,embedding_adapter_version FROM vector_records WHERE id=? AND index_version=?"
          )
          .get(record.id, record.indexVersion);
        if (
          existing &&
          text(existing, "normalized_content_hash") === record.normalizedContentHash &&
          text(existing, "embedding_model") === record.metadata.embeddingModel &&
          text(existing, "embedding_adapter_version") === record.metadata.embeddingAdapterVersion
        ) {
          unchanged += 1;
          continue;
        }
        let contentText: string | null = record.content;
        let bytes: Uint8Array | null = vectorBlob(record.vector);
        let encryptedPayload: EncryptedPayload | null = null;
        if (record.metadata.userId) {
          if (!this.#keyRing) throw new Error("User-owned vectors require the Prompt 16 encryption key ring.");
          encryptedPayload = encryptMemoryContent(
            { vector: [...record.vector], content: record.content },
            userAad(record.metadata.userId, record.id, record.indexVersion),
            this.#keyRing,
            randomBytes(12)
          );
          contentText = null;
          bytes = null;
        }
        this.#database
          .prepare(`
            INSERT INTO vector_records(
              id,index_version,partition,trust_level,language,dimension,embedding_model,
              embedding_adapter_version,normalized_content_hash,document_id,source_id,
              source_version,source_checksum,metadata_json,title,chunk_role,ordinal,token_count,
              matched_text_hash,content_text,vector_blob,encrypted_payload_json,user_id,
              consent_record_ids_json,purpose_ids_json,expires_at,deleted_at,active,indexed_at,updated_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(id,index_version) DO UPDATE SET
              trust_level=excluded.trust_level,language=excluded.language,dimension=excluded.dimension,
              embedding_model=excluded.embedding_model,embedding_adapter_version=excluded.embedding_adapter_version,
              normalized_content_hash=excluded.normalized_content_hash,document_id=excluded.document_id,
              source_id=excluded.source_id,source_version=excluded.source_version,
              source_checksum=excluded.source_checksum,metadata_json=excluded.metadata_json,
              title=excluded.title,chunk_role=excluded.chunk_role,ordinal=excluded.ordinal,
              token_count=excluded.token_count,matched_text_hash=excluded.matched_text_hash,
              content_text=excluded.content_text,vector_blob=excluded.vector_blob,
              encrypted_payload_json=excluded.encrypted_payload_json,user_id=excluded.user_id,
              consent_record_ids_json=excluded.consent_record_ids_json,
              purpose_ids_json=excluded.purpose_ids_json,expires_at=excluded.expires_at,
              deleted_at=excluded.deleted_at,updated_at=excluded.updated_at
          `)
          .run(
            record.id,
            record.indexVersion,
            partition,
            record.metadata.trustLevel,
            record.metadata.language,
            record.metadata.embeddingDimension,
            record.metadata.embeddingModel,
            record.metadata.embeddingAdapterVersion,
            record.normalizedContentHash,
            record.metadata.documentId,
            record.metadata.sourceId,
            record.metadata.sourceVersion,
            record.metadata.sourceChecksum,
            JSON.stringify(record.metadata),
            record.title,
            record.chunkRole,
            record.ordinal,
            record.tokenCount,
            record.matchedTextHash,
            contentText,
            bytes,
            encryptedPayload ? JSON.stringify(encryptedPayload) : null,
            record.metadata.userId || null,
            JSON.stringify(record.metadata.consentRecordIds || []),
            JSON.stringify(record.metadata.purposeIds || []),
            record.metadata.expiresAt || null,
            record.metadata.deletedAt || null,
            0,
            record.metadata.indexedAt,
            record.metadata.indexedAt
          );
        if (existing) updated += 1;
        else inserted += 1;
      }
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
    return Object.freeze({
      partition,
      inserted,
      updated,
      unchanged,
      indexVersion: records[0].indexVersion
    });
  }

  async activateIndex(
    indexVersion: string,
    partitions: readonly RetrievalPartition[],
    activatedAt: string
  ): Promise<void> {
    this.#database.exec("BEGIN IMMEDIATE");
    try {
      for (const partition of partitions) {
        const count = this.#database
          .prepare("SELECT COUNT(*) AS total FROM vector_records WHERE partition=? AND index_version=?")
          .get(partition, indexVersion);
        if (!count || integer(count, "total") === 0) {
          throw new Error(`Cannot activate an empty retrieval partition: ${partition}.`);
        }
        this.#database.prepare("UPDATE vector_records SET active=0 WHERE partition=?").run(partition);
        this.#database
          .prepare("UPDATE vector_records SET active=1 WHERE partition=? AND index_version=? AND deleted_at IS NULL")
          .run(partition, indexVersion);
        this.#database
          .prepare(
            "INSERT INTO active_retrieval_indexes(partition,index_version,activated_at) VALUES (?,?,?) ON CONFLICT(partition) DO UPDATE SET index_version=excluded.index_version,activated_at=excluded.activated_at"
          )
          .run(partition, indexVersion, activatedAt);
      }
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  async rollbackIndex(
    indexVersion: string,
    partitions: readonly RetrievalPartition[],
    rolledBackAt: string
  ): Promise<void> {
    this.#database.exec("BEGIN IMMEDIATE");
    try {
      for (const partition of partitions) {
        this.#database
          .prepare("UPDATE vector_records SET active=0 WHERE partition=? AND index_version=?")
          .run(partition, indexVersion);
        const prior = this.#database
          .prepare(
            "SELECT index_version,MAX(indexed_at) AS indexed_at FROM vector_records WHERE partition=? AND index_version<>? AND deleted_at IS NULL GROUP BY index_version ORDER BY indexed_at DESC LIMIT 1"
          )
          .get(partition, indexVersion);
        if (prior) {
          const priorVersion = text(prior, "index_version");
          this.#database
            .prepare("UPDATE vector_records SET active=1 WHERE partition=? AND index_version=? AND deleted_at IS NULL")
            .run(partition, priorVersion);
          this.#database
            .prepare(
              "INSERT INTO active_retrieval_indexes(partition,index_version,activated_at) VALUES (?,?,?) ON CONFLICT(partition) DO UPDATE SET index_version=excluded.index_version,activated_at=excluded.activated_at"
            )
            .run(partition, priorVersion, rolledBackAt);
        } else {
          this.#database.prepare("DELETE FROM active_retrieval_indexes WHERE partition=?").run(partition);
        }
      }
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  async search(request: VectorSearchRequest): Promise<readonly VectorSearchResult[]> {
    if (
      request.partitions.length === 0 ||
      request.trustLevels.length === 0 ||
      request.queryVector.length === 0
    ) {
      return Object.freeze([]);
    }
    const partitionMarks = request.partitions.map(() => "?").join(",");
    const trustMarks = request.trustLevels.map(() => "?").join(",");
    const rows = this.#database
      .prepare(`
        SELECT * FROM vector_records
        WHERE active=1 AND deleted_at IS NULL AND index_version=? AND language=?
          AND partition IN (${partitionMarks}) AND trust_level IN (${trustMarks})
          AND (expires_at IS NULL OR expires_at>?)
          AND (user_id IS NULL OR user_id=?)
        LIMIT ?
      `)
      .all(
        request.activeIndexVersion,
        request.language,
        ...request.partitions,
        ...request.trustLevels,
        request.now,
        request.userId || "",
        RETRIEVAL_LIMITS.maximumCandidateRows
      );
    const scored: VectorSearchResult[] = [];
    const queryNorm = squaredNorm(request.queryVector);
    for (const row of rows) {
      const metadata = parseMetadata(text(row, "metadata_json"));
      if (
        request.documentIdPrefixes?.length &&
        !request.documentIdPrefixes.some((prefix) => metadata.documentId.startsWith(prefix))
      ) {
        continue;
      }
      const userId = optionalText(row, "user_id");
      const consentIds = parseStringArray(text(row, "consent_record_ids_json"));
      const purposeIds = parseStringArray(text(row, "purpose_ids_json"));
      if (userId) {
        if (
          userId !== request.userId ||
          !consentIds.every((id) => request.consentRecordIds?.includes(id)) ||
          !purposeIds.every((id) => request.purposeIds?.includes(id as never))
        ) {
          continue;
        }
      }
      const dimension = integer(row, "dimension");
      let vector: ArrayLike<number>;
      let content: string;
      if (userId) {
        if (!this.#keyRing) continue;
        const parsed = JSON.parse(text(row, "encrypted_payload_json")) as EncryptedPayload;
        const decrypted = decryptMemoryContent(
          parsed,
          userAad(userId, text(row, "id"), text(row, "index_version")),
          this.#keyRing
        );
        if (
          !Array.isArray(decrypted.vector) ||
          decrypted.vector.some((value) => typeof value !== "number") ||
          typeof decrypted.content !== "string"
        ) {
          continue;
        }
        vector = Object.freeze([...(decrypted.vector as number[])]);
        content = decrypted.content;
      } else {
        vector = vectorFromBlob(row.vector_blob, dimension);
        content = text(row, "content_text");
      }
      const score = cosine(request.queryVector, vector, queryNorm);
      if (score < -0.5) continue;
      scored.push(
        Object.freeze({
          recordId: text(row, "id"),
          score,
          metadata,
          title: text(row, "title"),
          chunkRole: text(row, "chunk_role"),
          ordinal: integer(row, "ordinal"),
          tokenCount: integer(row, "token_count"),
          content,
          indexVersion: text(row, "index_version")
        })
      );
    }
    return Object.freeze(
      scored
        .sort((left, right) => right.score - left.score || left.recordId.localeCompare(right.recordId))
        .slice(0, Math.min(Math.max(request.limit, 1), RETRIEVAL_LIMITS.maximumTopK))
    );
  }

  async findReusableVectors(
    ids: readonly string[],
    model: string,
    dimension: number,
    adapterVersion: string
  ): Promise<ReadonlyMap<string, ReusableVector>> {
    const result = new Map<string, ReusableVector>();
    if (!ids.length) return result;
    for (let offset = 0; offset < ids.length; offset += 500) {
      const batch = ids.slice(offset, offset + 500);
      const rows = this.#database
        .prepare(
          `SELECT id,normalized_content_hash,vector_blob,dimension FROM vector_records WHERE id IN (${batch
            .map(() => "?")
            .join(",")}) AND embedding_model=? AND dimension=? AND embedding_adapter_version=? AND user_id IS NULL AND deleted_at IS NULL ORDER BY indexed_at DESC`
        )
        .all(...batch, model, dimension, adapterVersion);
      for (const row of rows) {
        const id = text(row, "id");
        if (!result.has(id)) {
          result.set(
            id,
            Object.freeze({
              id,
              normalizedContentHash: text(row, "normalized_content_hash"),
              vector: Object.freeze(Array.from(vectorFromBlob(row.vector_blob, integer(row, "dimension"))))
            })
          );
        }
      }
    }
    return result;
  }

  #invalidateWhere(
    where: string,
    values: readonly (string | number)[],
    now: string
  ): VectorDeletionResult {
    const count = this.#database
      .prepare(`SELECT COUNT(*) AS total FROM vector_records WHERE ${where} AND deleted_at IS NULL`)
      .get(...values);
    const deleted = count ? integer(count, "total") : 0;
    const result = this.#database
      .prepare(
        `UPDATE vector_records SET active=0,deleted_at=?,content_text=NULL,vector_blob=NULL,encrypted_payload_json=NULL,updated_at=? WHERE ${where} AND deleted_at IS NULL`
      )
      .run(now, now, ...values);
    return completed(deleted, Number(result.changes), now);
  }

  async deleteBySource(request: DeleteVectorsBySourceRequest): Promise<VectorDeletionResult> {
    const clauses = ["source_id=?"];
    const values: string[] = [request.sourceId];
    if (request.sourceVersion) {
      clauses.push("source_version=?");
      values.push(request.sourceVersion);
    }
    if (request.userId) {
      clauses.push("user_id=?");
      values.push(request.userId);
    }
    return this.#invalidateWhere(clauses.join(" AND "), values, request.now);
  }

  async deleteByUser(request: DeleteUserVectorsRequest): Promise<VectorDeletionResult> {
    return this.#invalidateWhere("user_id=?", [request.userId], request.now);
  }

  async deleteByConsent(request: DeleteConsentVectorsRequest): Promise<VectorDeletionResult> {
    const rows = this.#database
      .prepare("SELECT id,index_version,consent_record_ids_json FROM vector_records WHERE user_id=? AND deleted_at IS NULL")
      .all(request.userId);
    const targets = rows.filter((row) =>
      parseStringArray(text(row, "consent_record_ids_json")).includes(request.consentRecordId)
    );
    for (const row of targets) {
      this.#invalidateWhere(
        "id=? AND index_version=? AND user_id=?",
        [text(row, "id"), text(row, "index_version"), request.userId],
        request.now
      );
    }
    return completed(targets.length, targets.length, request.now);
  }

  async compact(): Promise<VectorCompactionResult> {
    const before = existsSync(this.#location) ? statSync(this.#location).size : 0;
    const deleted = this.#database.prepare("DELETE FROM vector_records WHERE deleted_at IS NOT NULL").run();
    this.#database.exec("VACUUM");
    const after = existsSync(this.#location) ? statSync(this.#location).size : 0;
    return Object.freeze({
      removedRecords: Number(deleted.changes),
      bytesBefore: before,
      bytesAfter: after,
      completedAt: new Date().toISOString()
    });
  }

  async getIndexInfo(partition: RetrievalPartition): Promise<VectorIndexInfo> {
    const active = this.#database
      .prepare("SELECT index_version,activated_at FROM active_retrieval_indexes WHERE partition=?")
      .get(partition);
    const activeVersion = active ? text(active, "index_version") : null;
    const row = activeVersion
      ? this.#database
          .prepare(
            "SELECT COUNT(*) AS total,MAX(dimension) AS dimension,MAX(embedding_model) AS embedding_model,MAX(indexed_at) AS indexed_at FROM vector_records WHERE partition=? AND index_version=? AND active=1"
          )
          .get(partition, activeVersion)
      : undefined;
    const versions = this.#database
      .prepare("SELECT DISTINCT source_version FROM vector_records WHERE partition=? ORDER BY source_version")
      .all(partition)
      .map((item) => text(item, "source_version"));
    return Object.freeze({
      partition,
      activeIndexVersion: activeVersion,
      recordCount: row ? integer(row, "total") : 0,
      dimension:
        row && (typeof row.dimension === "number" || typeof row.dimension === "bigint")
          ? Number(row.dimension)
          : null,
      embeddingModel: row ? optionalText(row, "embedding_model") || null : null,
      sourceVersions: Object.freeze(versions),
      bytes: existsSync(this.#location) ? statSync(this.#location).size : 0,
      generatedAt: row ? optionalText(row, "indexed_at") || null : null
    });
  }
}
