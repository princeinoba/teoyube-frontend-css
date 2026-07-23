import type {
  HybridRetrievalResult,
  RetrievalAuthorization,
  RetrievalPartition
} from "../../domain/retrieval/retrieval-contracts";

export const CROSS_MODULE_RETRIEVAL_SURFACES = Object.freeze([
  "search",
  "promise_search",
  "today_journey",
  "prayer",
  "calling",
  "lexicon",
  "testimony_book",
  "teo_guide",
  "product_help"
] as const);

export type CrossModuleRetrievalSurface =
  (typeof CROSS_MODULE_RETRIEVAL_SURFACES)[number];

export type CrossModuleRetrievalInput = Readonly<{
  query: string;
  exactReferenceHint?: string;
  authorization?: RetrievalAuthorization;
  safetyMode?: "standard" | "sensitive" | "critical";
  now: string;
  activeIndexVersion: string;
  vectorEnabled: boolean;
  journeySourceIds?: readonly string[];
}>;

export type CrossModuleRetrievalPolicy = Readonly<{
  surface: CrossModuleRetrievalSurface;
  intent: string;
  partitions: readonly RetrievalPartition[];
}>;

export type CrossModuleRetrievalOutput = Readonly<{
  surface: CrossModuleRetrievalSurface;
  result: HybridRetrievalResult;
  stateMutation: false;
  visibleCopyChanged: false;
  defaultViewChanged: false;
}>;
