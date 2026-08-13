import "server-only";

import type {
  HybridRetrievalResult,
  HybridSourceResult,
} from "../../domain/retrieval/retrieval-contracts";
import type {
  ScriptureCitation,
  ScriptureReference,
} from "../../domain/scripture/scripture-repository";
import { canonicalScriptureRepository } from "../scripture/canonical-scripture-repository";

export type ServerOwnedCitationEvidence = Readonly<{
  id: string;
  canonicalLabel: string;
  translation: "WEB";
  corpusVersion: string;
  exactText: string;
  sourceVersion: string;
  trustLevel: string;
}>;

export type ServerOwnedCitationResolution = Readonly<{
  evidence: readonly ServerOwnedCitationEvidence[];
  normalizedRequiredCitationIds: readonly string[];
  invalidRequiredCitationCount: number;
}>;

function referenceIdentity(reference: ScriptureReference): string | undefined {
  if (reference.verseStart === undefined) return undefined;
  const book = reference.book.toLowerCase().replace(/\s+/g, "-");
  let identity = `web:${book}.${reference.chapterStart}.${reference.verseStart}`;
  if (reference.verseEnd !== undefined) {
    const chapterEnd = reference.chapterEnd || reference.chapterStart;
    identity += chapterEnd === reference.chapterStart
      ? `-${reference.verseEnd}`
      : `-${chapterEnd}.${reference.verseEnd}`;
  }
  return identity;
}

function parsedIdentity(value: string): Readonly<{
  id: string;
  reference: ScriptureReference;
}> | undefined {
  const normalized = value.normalize("NFKC").trim();
  const web = /^web:([a-z0-9-]+)\.(\d{1,3})\.(\d{1,3})(?:-(?:(\d{1,3})\.)?(\d{1,3}))?$/i.exec(
    normalized,
  );
  let label = normalized.replace(/^canonical:/i, "");
  if (web) {
    const book = web[1].replace(/-/g, " ");
    label = `${book} ${web[2]}:${web[3]}`;
    if (web[5]) label += web[4] ? `-${web[4]}:${web[5]}` : `-${web[5]}`;
  } else if (/^web:/i.test(normalized)) {
    return undefined;
  }
  const parsed = canonicalScriptureRepository
    .parseReferences(label)
    .find((item) => item.valid);
  if (!parsed?.valid || parsed.reference.verseStart === undefined) return undefined;
  const id = referenceIdentity(parsed.reference);
  return id ? Object.freeze({ id, reference: parsed.reference }) : undefined;
}

export function normalizePreviewCitationIdentity(
  value: string,
): string | undefined {
  return parsedIdentity(value)?.id;
}

async function hydrateReference(
  identity: Readonly<{ id: string; reference: ScriptureReference }>,
  sourceVersion: string,
  trustLevel: string,
): Promise<ServerOwnedCitationEvidence | undefined> {
  const passage = await canonicalScriptureRepository.getByReference(
    identity.reference,
    { translationId: "engwebp" },
  );
  if (!passage || passage.displayPolicy !== "FULL_TEXT_ALLOWED") return undefined;
  const exactText = passage.verses.map((verse) => verse.text).join(" ");
  const validation = await canonicalScriptureRepository.validateCitation(
    passage.citation,
    exactText,
  );
  if (!validation.valid || validation.exactTextMatch !== true) return undefined;
  const normalizedId = referenceIdentity(passage.citation.reference);
  if (!normalizedId || normalizedId !== identity.id) return undefined;
  return Object.freeze({
    id: normalizedId,
    canonicalLabel: passage.citation.canonicalLabel,
    translation: "WEB" as const,
    corpusVersion: passage.citation.corpusVersion,
    exactText,
    sourceVersion,
    trustLevel,
  });
}

function sourceCitationIdentities(
  source: HybridSourceResult,
): readonly Readonly<{
  id: string;
  reference: ScriptureReference;
  citation: ScriptureCitation;
}>[] {
  if (
    !source.documentId.startsWith("web:") &&
    !source.documentId.startsWith("canonical:")
  ) return Object.freeze([]);
  const documentIdentity = normalizePreviewCitationIdentity(source.documentId);
  const citations = [
    ...(source.canonicalReference ? [source.canonicalReference] : []),
    ...source.scriptureCitations,
  ];
  const seen = new Set<string>();
  return Object.freeze(
    citations.flatMap((citation) => {
      if (citation.translationId !== "engwebp") return [];
      const id = referenceIdentity(citation.reference);
      if (!id || seen.has(id)) return [];
      if (!documentIdentity || documentIdentity !== id) {
        return [];
      }
      seen.add(id);
      return [Object.freeze({ id, reference: citation.reference, citation })];
    }),
  );
}

export async function resolveServerOwnedCitationEvidence(
  result: HybridRetrievalResult,
  requiredCitationIds: readonly string[],
): Promise<ServerOwnedCitationResolution> {
  const required = requiredCitationIds.map(parsedIdentity);
  const invalidRequiredCitationCount = required.filter(
    (item) => item === undefined,
  ).length;
  const normalizedRequiredCitationIds = Object.freeze([
    ...new Set(
      required
        .filter((item): item is NonNullable<typeof item> => item !== undefined)
        .map((item) => item.id),
    ),
  ]);
  const evidence: ServerOwnedCitationEvidence[] = [];
  const seen = new Set<string>();
  const add = (item: ServerOwnedCitationEvidence | undefined) => {
    if (!item || seen.has(item.id) || evidence.length >= 5) return;
    seen.add(item.id);
    evidence.push(item);
  };

  // Locked fixture requirements are server-owned exact-retrieval targets. They
  // are resolved and validated before generation; model output cannot add one.
  for (const identity of required) {
    if (!identity) continue;
    add(await hydrateReference(identity, "server-exact-web", "CANONICAL_SCRIPTURE"));
  }
  for (const source of result.sources) {
    for (const identity of sourceCitationIdentities(source)) {
      add(await hydrateReference(identity, source.sourceVersion, source.trustLevel));
    }
  }
  return Object.freeze({
    evidence: Object.freeze(evidence),
    normalizedRequiredCitationIds,
    invalidRequiredCitationCount,
  });
}
