import type { RetrievalPartition } from "../../domain/retrieval/retrieval-contracts";

export type RetrievalContentIntent = "SCRIPTURE" | "CANON" | "PROMISE" | "LEXICON" | "GENERAL";

export type QueryDispositionReason =
  | "accepted"
  | "out_of_domain_current_information"
  | "gibberish"
  | "insufficient_information"
  | "unsafe_instruction"
  | "private_content_request";

export type QueryDisposition = Readonly<{
  acceptedForRetrieval: boolean;
  reason: QueryDispositionReason;
}>;

export const VECTOR_SCORE_SEMANTICS = Object.freeze({
  rawCosineMinimum: 0.315,
  normalizedCosineMinimum: 0.657,
  lexicalMinimum: 0.15,
  fusedMinimum: 0.24,
  normalizedFormula: "(rawCosine + 1) / 2"
});

const DOMAIN_TERMS = new Set([
  "bible", "biblical", "canon", "calling", "christ", "faith", "forgive", "forgiveness",
  "god", "grace", "healing", "hope", "jesus", "lexicon", "lord", "mercy", "prayer",
  "promise", "purpose", "scripture", "spiritual", "teoyube", "theology", "verse", "web",
  "wisdom", "worship"
]);

const CURRENT_INFORMATION_TERMS = new Set([
  "current", "forecast", "live", "nearby", "price", "quote", "score", "stock", "temperature",
  "tonight", "weather"
]);

function tokens(value: string): readonly string[] {
  return Object.freeze(value.toLowerCase().match(/[a-z0-9]+/g) || []);
}

function hasAny(values: readonly string[], expected: ReadonlySet<string>): boolean {
  return values.some((value) => expected.has(value));
}

function looksLikeGibberish(values: readonly string[]): boolean {
  if (!values.length) return true;
  const alphabetic = values.filter((value) => /[a-z]/.test(value));
  if (!alphabetic.length) return true;
  const malformed = alphabetic.filter(
    (value) => !/[aeiou]/.test(value) || /(.)\1\1/.test(value) || /^[^aeiou]{5,}$/i.test(value)
  );
  return malformed.length / alphabetic.length >= 0.4;
}

export function resolveRetrievalContentIntent(intent: string, query: string): RetrievalContentIntent {
  const normalizedIntent = intent.trim().toLowerCase();
  if (["canon", "calling", "prayer"].includes(normalizedIntent)) return "CANON";
  if (["scripture", "bible", "verse"].includes(normalizedIntent)) return "SCRIPTURE";
  if (["promise", "promise_theme"].includes(normalizedIntent)) return "PROMISE";
  if (["lexicon", "teoyube_word"].includes(normalizedIntent)) return "LEXICON";
  const normalizedQuery = query.toLowerCase();
  if (/\bcanon\b/.test(normalizedQuery)) return "CANON";
  if (/\b(lexicon|teoyube word)\b/.test(normalizedQuery)) return "LEXICON";
  if (/\b(promise cluster|promise theme)\b/.test(normalizedQuery)) return "PROMISE";
  if (/\b(web|scripture|bible|biblical|verse|passage)\b/.test(normalizedQuery)) return "SCRIPTURE";
  return "GENERAL";
}

export function deterministicQueryDisposition(query: string, intent: string): QueryDisposition {
  const normalized = query.trim().toLowerCase();
  const values = tokens(normalized);
  if (/\b(ignore|disregard|override|bypass)\b.{0,48}\b(safeguard|system|policy|instruction|authority)\b/.test(normalized)) {
    return Object.freeze({ acceptedForRetrieval: false, reason: "unsafe_instruction" });
  }
  if (/\b(private|hidden|another user|another person|account identifier|authentication record|research event|managed memory)\b/.test(normalized)) {
    return Object.freeze({ acceptedForRetrieval: false, reason: "private_content_request" });
  }
  if (values.length < 2 || normalized.length < 6) {
    return Object.freeze({ acceptedForRetrieval: false, reason: "insufficient_information" });
  }
  if (looksLikeGibberish(values)) {
    return Object.freeze({ acceptedForRetrieval: false, reason: "gibberish" });
  }
  const contentIntent = resolveRetrievalContentIntent(intent, query);
  const domainSignal = contentIntent !== "GENERAL" || hasAny(values, DOMAIN_TERMS);
  const currentInformation = hasAny(values, CURRENT_INFORMATION_TERMS) ||
    /\b(right now|next hour|open (?:at this moment|now)|exchange rate|share price|game result)\b/.test(normalized);
  if (!domainSignal && currentInformation) {
    return Object.freeze({ acceptedForRetrieval: false, reason: "out_of_domain_current_information" });
  }
  if (!domainSignal && /\b(unknown request|nonsemantic|tell me|something|anything)\b/.test(normalized)) {
    return Object.freeze({ acceptedForRetrieval: false, reason: "insufficient_information" });
  }
  return Object.freeze({ acceptedForRetrieval: true, reason: "accepted" });
}

export function documentContentType(documentId: string): Exclude<RetrievalContentIntent, "GENERAL"> | "OTHER" {
  if (documentId.startsWith("web:") || documentId.startsWith("web-context:")) return "SCRIPTURE";
  if (documentId.startsWith("canon:")) return "CANON";
  if (documentId.startsWith("promise:")) return "PROMISE";
  if (documentId.startsWith("lexicon:")) return "LEXICON";
  return "OTHER";
}

export function documentPrefixesForIntent(intent: RetrievalContentIntent): readonly string[] | undefined {
  switch (intent) {
    case "SCRIPTURE": return Object.freeze(["web:", "web-context:"]);
    case "CANON": return Object.freeze(["canon:"]);
    case "PROMISE": return Object.freeze(["promise:"]);
    case "LEXICON": return Object.freeze(["lexicon:"]);
    default: return undefined;
  }
}

export function partitionsForContentIntent(
  requested: readonly RetrievalPartition[],
  intent: RetrievalContentIntent
): readonly RetrievalPartition[] {
  const required: readonly RetrievalPartition[] | undefined =
    intent === "SCRIPTURE" ? Object.freeze(["canonical_scripture", "scripture_context"]) :
    intent === "CANON" ? Object.freeze(["scripture_context"]) :
    intent === "PROMISE" ? Object.freeze(["promise_clusters"]) :
    intent === "LEXICON" ? Object.freeze(["lexicon"]) : undefined;
  return required ? Object.freeze(requested.filter((partition) => required.includes(partition))) : requested;
}

export function candidateAcceptance(input: Readonly<{
  rawCosineSimilarity?: number;
  normalizedVectorScore: number;
  lexicalScore: number;
  fusedScore: number;
}>): Readonly<{ accepted: boolean; reason: string }> {
  const rawPass = typeof input.rawCosineSimilarity === "number" &&
    input.rawCosineSimilarity >= VECTOR_SCORE_SEMANTICS.rawCosineMinimum &&
    input.normalizedVectorScore >= VECTOR_SCORE_SEMANTICS.normalizedCosineMinimum;
  const lexicalPass = input.lexicalScore >= VECTOR_SCORE_SEMANTICS.lexicalMinimum;
  if (input.fusedScore < VECTOR_SCORE_SEMANTICS.fusedMinimum) {
    return Object.freeze({ accepted: false, reason: "fused_score_below_minimum" });
  }
  if (rawPass) return Object.freeze({ accepted: true, reason: "raw_and_normalized_similarity_pass" });
  if (lexicalPass) return Object.freeze({ accepted: true, reason: "lexical_evidence_pass" });
  return Object.freeze({ accepted: false, reason: "insufficient_relevance_evidence" });
}
