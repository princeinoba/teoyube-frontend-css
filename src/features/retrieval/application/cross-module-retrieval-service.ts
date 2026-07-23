import type { HybridRetriever } from "../../../domain/retrieval/retrieval-contracts";
import type { RetrievalPartition } from "../../../domain/retrieval/retrieval-contracts";
import type {
  CrossModuleRetrievalInput,
  CrossModuleRetrievalOutput,
  CrossModuleRetrievalPolicy,
  CrossModuleRetrievalSurface
} from "../contracts";

function partitions(...values: RetrievalPartition[]): readonly RetrievalPartition[] {
  return Object.freeze(values);
}

export const CROSS_MODULE_RETRIEVAL_POLICIES: Readonly<
  Record<CrossModuleRetrievalSurface, CrossModuleRetrievalPolicy>
> = Object.freeze({
  search: Object.freeze({
    surface: "search",
    intent: "multi_category_search",
    partitions: partitions(
      "canonical_scripture",
      "scripture_context",
      "promise_clusters",
      "lexicon",
      "prayer_resources",
      "theology_safety",
      "testimonies",
      "calling_evidence"
    )
  }),
  promise_search: Object.freeze({
    surface: "promise_search",
    intent: "promise_search",
    partitions: partitions(
      "canonical_scripture",
      "scripture_context",
      "promise_clusters"
    )
  }),
  today_journey: Object.freeze({
    surface: "today_journey",
    intent: "daily_journey",
    partitions: partitions(
      "canonical_scripture",
      "promise_clusters",
      "prayer_resources",
      "journey_history",
      "calling_evidence"
    )
  }),
  prayer: Object.freeze({
    surface: "prayer",
    intent: "prayer",
    partitions: partitions(
      "canonical_scripture",
      "scripture_context",
      "prayer_resources"
    )
  }),
  calling: Object.freeze({
    surface: "calling",
    intent: "calling",
    partitions: partitions(
      "canonical_scripture",
      "promise_clusters",
      "calling_evidence",
      "journey_history"
    )
  }),
  lexicon: Object.freeze({
    surface: "lexicon",
    intent: "teoyube_word",
    partitions: partitions(
      "canonical_scripture",
      "scripture_context",
      "lexicon"
    )
  }),
  testimony_book: Object.freeze({
    surface: "testimony_book",
    intent: "testimony",
    partitions: partitions(
      "canonical_scripture",
      "testimonies",
      "journey_history"
    )
  }),
  teo_guide: Object.freeze({
    surface: "teo_guide",
    intent: "guided_retrieval",
    partitions: partitions(
      "canonical_scripture",
      "scripture_context",
      "promise_clusters",
      "lexicon",
      "prayer_resources",
      "theology_safety",
      "journal_summaries",
      "testimonies",
      "journey_history",
      "calling_evidence",
      "product_help"
    )
  }),
  product_help: Object.freeze({
    surface: "product_help",
    intent: "product_help",
    partitions: partitions("theology_safety", "product_help")
  })
});

export class CrossModuleRetrievalService {
  constructor(private readonly retriever: HybridRetriever) {}

  async retrieve(
    surface: CrossModuleRetrievalSurface,
    input: CrossModuleRetrievalInput
  ): Promise<CrossModuleRetrievalOutput> {
    const policy = CROSS_MODULE_RETRIEVAL_POLICIES[surface];
    const result = await this.retriever.retrieve({
      query: input.query,
      intent: policy.intent,
      safetyMode: input.safetyMode || "standard",
      allowedPartitions: policy.partitions,
      language: "en-US",
      topK: 10,
      enableVector: input.vectorEnabled,
      activeIndexVersion: input.activeIndexVersion,
      executionKind: "user_query",
      ...(input.authorization ? { authorization: input.authorization } : {}),
      ...(input.exactReferenceHint
        ? { exactReferenceHint: input.exactReferenceHint }
        : {}),
      ...(input.journeySourceIds
        ? { currentJourneySourceIds: input.journeySourceIds }
        : {}),
      now: input.now
    });
    return Object.freeze({
      surface,
      result,
      stateMutation: false,
      visibleCopyChanged: false,
      defaultViewChanged: false
    });
  }
}
