import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  EmbeddingBudget,
  RetrievalDocumentMetadata,
  RetrievalPartition,
  VectorRecord
} from "../../domain/retrieval/retrieval-contracts";
import { RETRIEVAL_PARTITIONS } from "../../domain/retrieval/retrieval-contracts";
import { hashNormalizedContent, sha256, stableJson } from "./content-hashing";
import type { EmbeddingGateway } from "../../domain/retrieval/retrieval-contracts";
import { buildPublicRetrievalInventory, type PublicRetrievalInventory } from "./public-source-inventory";
import {
  EMBEDDING_ADAPTER_VERSION,
  EMBEDDING_MODELS,
  PROMPT_20_BUDGETS,
  RETRIEVAL_LIMITS
} from "./retrieval-config";
import { SqliteVectorRepository } from "./sqlite-vector-repository";

export const PUBLIC_RETRIEVAL_PARTITIONS = Object.freeze(
  RETRIEVAL_PARTITIONS.filter(
    (partition): partition is RetrievalPartition =>
      !["journal_summaries", "testimonies", "journey_history", "calling_evidence"].includes(partition)
  )
);

type IndexCheckpoint = Readonly<{
  schemaVersion: 1;
  indexVersion: string;
  inventoryHash: string;
  nextOffset: number;
  inputTokens: number;
  spentCostUsd: number;
  providerCalls: number;
  cacheHits: number;
  startedAt: string;
  updatedAt: string;
  status: "in_progress" | "complete";
}>;

type IndexAudit = Readonly<{
  schemaVersion: 1;
  completedFullPublicIndexes: number;
  indexVersions: readonly string[];
  updatedAt: string;
}>;

export type PublicIndexEstimate = Readonly<{
  model: string;
  dimension: number;
  totalChunks: number;
  totalEstimatedTokens: number;
  estimatedCostUsd: number;
  conservativeCostUsd: number;
  maximumApprovedCostUsd: number;
  estimatedVectorBytes: number;
  withinCostBudget: boolean;
  withinActiveIndexSizeLimit: boolean;
}>;

export type PublicIndexResult = Readonly<{
  status: "complete";
  indexVersion: string;
  chunks: number;
  inputTokens: number;
  spentCostUsd: number;
  providerCalls: number;
  cacheHits: number;
  databaseBytes: number;
  manifestPath: string;
}>;

export type PublicIndexPipelineOptions = Readonly<{
  rootDirectory?: string;
  now?: () => string;
}>;

function writeJson(location: string, value: unknown): void {
  mkdirSync(path.dirname(location), { recursive: true });
  writeFileSync(location, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readJson<T>(location: string): T | null {
  return existsSync(location) ? (JSON.parse(readFileSync(location, "utf8")) as T) : null;
}

function indexPaths(root: string): Readonly<{
  root: string;
  checkpoint: string;
  audit: string;
  inventory: string;
  estimate: string;
  manifest: string;
}> {
  const directory = path.join(root, ".var", "retrieval");
  return Object.freeze({
    root: directory,
    checkpoint: path.join(directory, "public-index-checkpoint.json"),
    audit: path.join(directory, "public-index-audit.json"),
    inventory: path.join(directory, "public-inventory.json"),
    estimate: path.join(directory, "public-estimate.json"),
    manifest: path.join(directory, "public-index-manifest.json")
  });
}

function inventorySummary(inventory: PublicRetrievalInventory): unknown {
  return Object.freeze({
    ...inventory,
    chunks: undefined,
    chunkContentIncluded: false,
    chunkIdsHash: sha256(inventory.chunks.map((chunk) => chunk.chunkId).join("\n"))
  });
}

function inventoryHash(inventory: PublicRetrievalInventory): string {
  return sha256(
    stableJson({
      indexVersion: inventory.indexVersion,
      chunkIds: inventory.chunks.map((chunk) => chunk.chunkId),
      contentHashes: inventory.chunks.map((chunk) => chunk.contentHash)
    })
  );
}

export class PublicIndexPipeline {
  readonly #root: string;
  readonly #now: () => string;

  constructor(options: PublicIndexPipelineOptions = {}) {
    this.#root = options.rootDirectory || process.cwd();
    this.#now = options.now || (() => new Date().toISOString());
  }

  inventory(): PublicRetrievalInventory {
    const inventory = buildPublicRetrievalInventory(
      EMBEDDING_MODELS.default.id,
      EMBEDDING_MODELS.default.dimension,
      this.#now()
    );
    writeJson(indexPaths(this.#root).inventory, inventorySummary(inventory));
    return inventory;
  }

  estimate(inventory = this.inventory()): PublicIndexEstimate {
    const estimatedCostUsd =
      (inventory.totalEstimatedTokens / 1_000_000) *
      EMBEDDING_MODELS.default.pricePerMillionInputTokensUsd;
    const conservativeCostUsd = estimatedCostUsd * 1.2;
    const estimatedVectorBytes =
      inventory.totalChunks * EMBEDDING_MODELS.default.dimension * 4;
    const estimate = Object.freeze({
      model: EMBEDDING_MODELS.default.id,
      dimension: EMBEDDING_MODELS.default.dimension,
      totalChunks: inventory.totalChunks,
      totalEstimatedTokens: inventory.totalEstimatedTokens,
      estimatedCostUsd,
      conservativeCostUsd,
      maximumApprovedCostUsd: PROMPT_20_BUDGETS.publicIndexUsd,
      estimatedVectorBytes,
      withinCostBudget: conservativeCostUsd <= PROMPT_20_BUDGETS.publicIndexUsd,
      withinActiveIndexSizeLimit: estimatedVectorBytes <= RETRIEVAL_LIMITS.activePublicIndexBytes
    });
    writeJson(indexPaths(this.#root).estimate, estimate);
    return estimate;
  }

  async build(
    repository: SqliteVectorRepository,
    gateway: EmbeddingGateway,
    authorized: boolean
  ): Promise<PublicIndexResult> {
    if (!authorized) {
      throw new Error("Public indexing requires the current Prompt 20 owner authorization signal.");
    }
    const paths = indexPaths(this.#root);
    const inventory = this.inventory();
    const estimate = this.estimate(inventory);
    if (!estimate.withinCostBudget || !estimate.withinActiveIndexSizeLimit) {
      throw new Error("The public index estimate exceeds an owner-approved cost or size limit.");
    }
    const hash = inventoryHash(inventory);
    const existingCheckpoint = readJson<IndexCheckpoint>(paths.checkpoint);
    const audit =
      readJson<IndexAudit>(paths.audit) ||
      Object.freeze({
        schemaVersion: 1 as const,
        completedFullPublicIndexes: 0,
        indexVersions: Object.freeze([]),
        updatedAt: this.#now()
      });
    if (
      audit.completedFullPublicIndexes >= PROMPT_20_BUDGETS.automaticFullPublicReindexes &&
      !audit.indexVersions.includes(inventory.indexVersion)
    ) {
      throw new Error("The single approved automatic full public index has already been used.");
    }
    if (
      existingCheckpoint &&
      (existingCheckpoint.indexVersion !== inventory.indexVersion ||
        existingCheckpoint.inventoryHash !== hash) &&
      existingCheckpoint.status !== "complete"
    ) {
      throw new Error("The resumable checkpoint belongs to a different public inventory.");
    }
    let checkpoint: IndexCheckpoint =
      existingCheckpoint?.indexVersion === inventory.indexVersion
        ? existingCheckpoint
        : Object.freeze({
            schemaVersion: 1,
            indexVersion: inventory.indexVersion,
            inventoryHash: hash,
            nextOffset: 0,
            inputTokens: 0,
            spentCostUsd: 0,
            providerCalls: 0,
            cacheHits: 0,
            startedAt: this.#now(),
            updatedAt: this.#now(),
            status: "in_progress"
          });
    if (checkpoint.status === "complete") {
      return this.verify(repository, inventory);
    }
    const reusable = await repository.findReusableVectors(
      inventory.chunks.map((chunk) => chunk.chunkId),
      inventory.model,
      inventory.dimension,
      EMBEDDING_ADAPTER_VERSION
    );
    let offset = checkpoint.nextOffset;
    while (offset < inventory.chunks.length) {
      let batchTokens = 0;
      let end = offset;
      while (
        end < inventory.chunks.length &&
        end - offset < RETRIEVAL_LIMITS.maximumBatchInputs
      ) {
        const nextTokens = inventory.chunks[end].tokenCount;
        if (
          end > offset &&
          batchTokens + nextTokens > RETRIEVAL_LIMITS.maximumBatchEstimatedTokens
        ) {
          break;
        }
        batchTokens += nextTokens;
        end += 1;
      }
      const batch = inventory.chunks.slice(offset, end);
      const missing = batch.filter((chunk) => {
        const cached = reusable.get(chunk.chunkId);
        return !cached || cached.normalizedContentHash !== chunk.contentHash;
      });
      let vectorById = new Map<string, readonly number[]>();
      let usage: Readonly<{
        inputTokens: number;
        estimatedCostUsd: number;
        providerCalls: number;
        cacheHits: number;
      }> = Object.freeze({
        inputTokens: 0,
        estimatedCostUsd: 0,
        providerCalls: 0,
        cacheHits: batch.length - missing.length
      });
      for (const chunk of batch) {
        const cached = reusable.get(chunk.chunkId);
        if (cached?.normalizedContentHash === chunk.contentHash) {
          vectorById.set(chunk.chunkId, cached.vector);
        }
      }
      if (missing.length) {
        const budget: EmbeddingBudget = Object.freeze({
          purpose: "document_indexing",
          maximumInputTokens: Math.max(
            estimate.totalEstimatedTokens * 2,
            estimate.totalEstimatedTokens + 10_000
          ),
          maximumCostUsd: PROMPT_20_BUDGETS.publicIndexUsd,
          spentCostUsd: checkpoint.spentCostUsd,
          pricePerMillionInputTokensUsd:
            EMBEDDING_MODELS.default.pricePerMillionInputTokensUsd
        });
        const embedded = await gateway.embedDocuments({
          inputs: Object.freeze(
            missing.map((chunk) =>
              Object.freeze({
                id: chunk.chunkId,
                content: chunk.content,
                normalizedContentHash: hashNormalizedContent(chunk.content),
                sourceVersion: chunk.sourceVersion,
                chunkerVersion: chunk.chunkerVersion,
                sensitivity: chunk.sensitivity
              })
            )
          ),
          model: inventory.model,
          dimension: inventory.dimension,
          budget
        });
        vectorById = new Map([
          ...vectorById.entries(),
          ...embedded.results.map((result) => [result.id, result.vector] as const)
        ]);
        usage = Object.freeze({
          inputTokens: embedded.usage.inputTokens,
          estimatedCostUsd: embedded.usage.estimatedCostUsd,
          providerCalls: embedded.usage.providerCalls,
          cacheHits: batch.length - missing.length
        });
      }
      const records = batch.map((chunk): VectorRecord => {
        const vector = vectorById.get(chunk.chunkId);
        if (!vector) throw new Error("An expected vector was not available after embedding.");
        const metadata: RetrievalDocumentMetadata = Object.freeze({
          documentId: chunk.documentId,
          partition: chunk.partition,
          trustLevel: chunk.trustLevel,
          sourceId: chunk.sourceId,
          sourceVersion: chunk.sourceVersion,
          sourceChecksum: chunk.sourceChecksum,
          chunkerVersion: chunk.chunkerVersion,
          embeddingProvider: "openai",
          embeddingModel: inventory.model,
          embeddingDimension: inventory.dimension,
          embeddingAdapterVersion: EMBEDDING_ADAPTER_VERSION,
          indexedAt: checkpoint.startedAt,
          language: chunk.language,
          scriptureCitations: chunk.scriptureCitations,
          sensitivity: chunk.sensitivity
        });
        return Object.freeze({
          id: chunk.chunkId,
          indexVersion: inventory.indexVersion,
          vector,
          normalizedContentHash: chunk.contentHash,
          metadata,
          title: chunk.title,
          chunkRole: chunk.chunkRole,
          ordinal: chunk.ordinal,
          tokenCount: chunk.tokenCount,
          matchedTextHash: chunk.contentHash,
          content: chunk.content
        });
      });
      for (const partition of PUBLIC_RETRIEVAL_PARTITIONS) {
        const partitionRecords = records.filter(
          (record) => record.metadata.partition === partition
        );
        if (partitionRecords.length) await repository.upsert(partition, partitionRecords);
      }
      checkpoint = Object.freeze({
        ...checkpoint,
        nextOffset: Math.min(offset + batch.length, inventory.chunks.length),
        inputTokens: checkpoint.inputTokens + usage.inputTokens,
        spentCostUsd: checkpoint.spentCostUsd + usage.estimatedCostUsd,
        providerCalls: checkpoint.providerCalls + usage.providerCalls,
        cacheHits: checkpoint.cacheHits + usage.cacheHits,
        updatedAt: this.#now(),
        status: "in_progress"
      });
      if (checkpoint.spentCostUsd > PROMPT_20_BUDGETS.publicIndexUsd) {
        throw new Error("The cumulative public index cost exceeded its hard budget.");
      }
      writeJson(paths.checkpoint, checkpoint);
      offset = end;
    }
    await repository.activateIndex(
      inventory.indexVersion,
      PUBLIC_RETRIEVAL_PARTITIONS,
      this.#now()
    );
    checkpoint = Object.freeze({
      ...checkpoint,
      status: "complete",
      updatedAt: this.#now()
    });
    writeJson(paths.checkpoint, checkpoint);
    if (!audit.indexVersions.includes(inventory.indexVersion)) {
      writeJson(
        paths.audit,
        Object.freeze({
          schemaVersion: 1,
          completedFullPublicIndexes: audit.completedFullPublicIndexes + 1,
          indexVersions: Object.freeze([...audit.indexVersions, inventory.indexVersion]),
          updatedAt: this.#now()
        })
      );
    }
    return this.verify(repository, inventory);
  }

  async verify(
    repository: SqliteVectorRepository,
    inventory = this.inventory()
  ): Promise<PublicIndexResult> {
    const paths = indexPaths(this.#root);
    const checkpoint = readJson<IndexCheckpoint>(paths.checkpoint);
    if (
      !checkpoint ||
      checkpoint.status !== "complete" ||
      checkpoint.indexVersion !== inventory.indexVersion ||
      checkpoint.nextOffset !== inventory.totalChunks
    ) {
      throw new Error("The public index checkpoint is incomplete or does not match the inventory.");
    }
    let recordCount = 0;
    for (const partition of PUBLIC_RETRIEVAL_PARTITIONS) {
      const info = await repository.getIndexInfo(partition);
      if (
        info.activeIndexVersion !== inventory.indexVersion ||
        info.embeddingModel !== inventory.model ||
        info.dimension !== inventory.dimension
      ) {
        throw new Error(`Active public index metadata is invalid for ${partition}.`);
      }
      recordCount += info.recordCount;
    }
    if (recordCount !== inventory.totalChunks) {
      throw new Error(
        `The active public index has ${recordCount} records; expected ${inventory.totalChunks}.`
      );
    }
    const databasePath = path.join(paths.root, "retrieval.sqlite");
    const databaseBytes = existsSync(databasePath) ? statSync(databasePath).size : 0;
    if (databaseBytes > RETRIEVAL_LIMITS.activePublicIndexBytes) {
      throw new Error("The active public index exceeds the 600 MB hard limit.");
    }
    const manifest = Object.freeze({
      schemaVersion: 1,
      inventoryVersion: inventory.inventoryVersion,
      indexVersion: inventory.indexVersion,
      model: inventory.model,
      returnedDimension: inventory.dimension,
      embeddingAdapterVersion: inventory.embeddingAdapterVersion,
      chunkerVersion: inventory.chunkerVersion,
      compositeSourceHash: inventory.compositeSourceHash,
      generatedAt: checkpoint.startedAt,
      verifiedAt: this.#now(),
      totalChunks: inventory.totalChunks,
      sourceCount: inventory.sources.length,
      sourceHashes: inventory.sources.map((source) =>
        Object.freeze({
          sourceId: source.sourceId,
          sourceVersion: source.sourceVersion,
          sourceChecksum: source.sourceChecksum
        })
      ),
      usage: Object.freeze({
        inputTokens: checkpoint.inputTokens,
        spentCostUsd: checkpoint.spentCostUsd,
        providerCalls: checkpoint.providerCalls,
        cacheHits: checkpoint.cacheHits
      }),
      databaseBytes,
      rawUserTextEmbedded: false,
      userVectorsIncluded: false,
      providerHostedVectorStoreUsed: false
    });
    writeJson(paths.manifest, manifest);
    return Object.freeze({
      status: "complete",
      indexVersion: inventory.indexVersion,
      chunks: recordCount,
      inputTokens: checkpoint.inputTokens,
      spentCostUsd: checkpoint.spentCostUsd,
      providerCalls: checkpoint.providerCalls,
      cacheHits: checkpoint.cacheHits,
      databaseBytes,
      manifestPath: paths.manifest
    });
  }

  async rollback(repository: SqliteVectorRepository): Promise<void> {
    const checkpoint = readJson<IndexCheckpoint>(indexPaths(this.#root).checkpoint);
    if (!checkpoint) throw new Error("No public index checkpoint is available to roll back.");
    await repository.rollbackIndex(
      checkpoint.indexVersion,
      PUBLIC_RETRIEVAL_PARTITIONS,
      this.#now()
    );
  }
}
