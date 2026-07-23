import type {
  HybridRetrievalResult,
  RetrievalContext
} from "../../domain/retrieval/retrieval-contracts";
import type { ScriptureRepository } from "../../domain/scripture/scripture-repository";
import { estimateTokens } from "./content-hashing";
import { RETRIEVAL_LIMITS } from "./retrieval-config";

function authority(
  trustLevel: HybridRetrievalResult["sources"][number]["trustLevel"]
): RetrievalContext["segments"][number]["authority"] {
  switch (trustLevel) {
    case "CANONICAL_SCRIPTURE":
      return "Scripture";
    case "REVIEWED_SCRIPTURE_CONTEXT":
      return "Reviewed context";
    case "SYSTEM_POLICY_REFERENCE":
      return "System policy";
    case "REVIEWED_PRODUCT_HELP":
      return "Product help";
    case "REVIEWED_TEOYUBE_CONTENT":
      return "Reviewed Teoyube content";
    default:
      return "User-approved record";
  }
}

export class RetrievalContextAssembler {
  constructor(private readonly scriptureRepository: ScriptureRepository) {}

  async assemble(
    result: HybridRetrievalResult,
    maximumTokens = RETRIEVAL_LIMITS.maximumContextTokens
  ): Promise<RetrievalContext> {
    const segments: RetrievalContext["segments"][number][] = [];
    let totalTokens = 0;
    for (const source of result.sources) {
      let content = source.content;
      let citation = source.canonicalReference;
      if (source.trustLevel === "CANONICAL_SCRIPTURE") {
        if (!citation) continue;
        const passage = await this.scriptureRepository.getByReference(citation.reference);
        if (!passage || passage.citation.validationStatus !== "validated") continue;
        content = passage.verses.map((verse) => verse.text).join(" ");
        citation = passage.citation;
      }
      const tokens = estimateTokens(content);
      if (tokens === 0 || totalTokens + tokens > maximumTokens) continue;
      totalTokens += tokens;
      segments.push(
        Object.freeze({
          sourceId: source.sourceId,
          recordId: source.recordId,
          authority: authority(source.trustLevel),
          content,
          sourceVersion: source.sourceVersion,
          ...(citation ? { scriptureCitation: citation } : {}),
          userOwned: source.userOwned
        })
      );
    }
    return Object.freeze({
      sourceIds: Object.freeze(segments.map((segment) => segment.sourceId)),
      segments: Object.freeze(segments),
      scriptureSources: Object.freeze(
        result.sources.filter((source) => source.trustLevel === "CANONICAL_SCRIPTURE")
      ),
      interpretiveSources: Object.freeze(
        result.sources.filter(
          (source) =>
            !source.userOwned && source.trustLevel !== "CANONICAL_SCRIPTURE"
        )
      ),
      userSources: Object.freeze(result.sources.filter((source) => source.userOwned)),
      totalTokens,
      limitations: Object.freeze([
        ...result.limitations,
        "Displayed Scripture content was re-fetched from the canonical WEB repository."
      ])
    });
  }
}
