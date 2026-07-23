import { randomUUID } from "node:crypto";
import type {
  HybridRetrievalResult,
  RetrievalFeedbackSignal,
  RetrievalPartition
} from "../../domain/retrieval/retrieval-contracts";

export type RetrievalTelemetryEvent = Readonly<{
  name: "retrieval_completed" | "retrieval_failed" | "retrieval_feedback";
  occurredAt: string;
  requestId?: string;
  queryHash?: string;
  pathsUsed?: readonly ("exact" | "lexical" | "vector" | "tig")[];
  partitions?: readonly RetrievalPartition[];
  provider?: "openai" | "none";
  model?: string;
  indexVersion?: string;
  resultCount?: number;
  fallbackReason?: string;
  latencyBucketMs?: "under_50" | "under_250" | "under_1000" | "over_1000";
  feedbackKind?: RetrievalFeedbackSignal["kind"];
  rawContentStored: false;
}>;

export interface RetrievalTelemetrySink {
  emit(event: RetrievalTelemetryEvent): void;
}

function latencyBucket(
  milliseconds: number
): RetrievalTelemetryEvent["latencyBucketMs"] {
  if (milliseconds < 50) return "under_50";
  if (milliseconds < 250) return "under_250";
  if (milliseconds < 1000) return "under_1000";
  return "over_1000";
}

export function retrievalCompletedEvent(
  result: HybridRetrievalResult,
  partitions: readonly RetrievalPartition[],
  occurredAt: string
): RetrievalTelemetryEvent {
  return Object.freeze({
    name: "retrieval_completed",
    occurredAt,
    requestId: result.requestId,
    queryHash: result.queryHash,
    pathsUsed: result.pathsUsed,
    partitions: Object.freeze([...partitions]),
    provider: result.pathsUsed.includes("vector") ? "openai" : "none",
    model: result.pathsUsed.includes("vector") ? "text-embedding-3-small" : undefined,
    indexVersion: result.indexVersion,
    resultCount: result.sources.length,
    fallbackReason: result.fallback.reason,
    latencyBucketMs: latencyBucket(result.latencyMs),
    rawContentStored: false
  });
}

export class RetrievalFeedbackService {
  constructor(
    private readonly sink: RetrievalTelemetrySink,
    private readonly createId: () => string = randomUUID
  ) {}

  record(
    input: Omit<RetrievalFeedbackSignal, "id" | "userInitiated" | "freeTextStored">
  ): RetrievalFeedbackSignal {
    const signal = Object.freeze({
      ...input,
      id: this.createId(),
      userInitiated: true as const,
      freeTextStored: false as const
    });
    this.sink.emit(
      Object.freeze({
        name: "retrieval_feedback",
        occurredAt: signal.createdAt,
        requestId: signal.requestId,
        feedbackKind: signal.kind,
        rawContentStored: false
      })
    );
    return signal;
  }
}
