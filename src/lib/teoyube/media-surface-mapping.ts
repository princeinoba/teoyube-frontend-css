export type TeoyubeMediaOrientation = "landscape" | "portrait" | "square" | "unknown";
export type TeoyubeMediaLength = "short" | "long" | "unknown";

export interface TeoyubeMediaManifestRecord {
  id: string;
  mediaKind: string;
  title: string;
  description?: string;
  bibleBook?: string;
  chapter?: number | null;
  verseStart?: number | null;
  verseEnd?: number | null;
  scriptureReferences?: string[];
  themes?: string[];
  teoyubeWordIds?: string[];
  promiseClusterIds?: string[];
  journeyIds?: string[];
  callingIds?: string[];
  prayerSequenceIds?: string[];
  tags?: string[];
  shortOrLong?: TeoyubeMediaLength;
  orientation?: TeoyubeMediaOrientation;
  durationSeconds?: number | null;
  hasAudio?: boolean | null;
  recommendedSurfaces?: string[];
  reviewStatus?: string;
  safetyStatus?: string;
  imported?: boolean;
  sampleOnly?: boolean;
  [key: string]: unknown;
}

export interface TeoyubeMediaRecommendationContext {
  scriptureReference?: string;
  wordId?: string;
  promiseClusterId?: string;
  journeyId?: string;
  callingId?: string;
  surface?: string;
  mobile?: boolean;
}

export interface TeoyubeRankedMediaRecord {
  record: TeoyubeMediaManifestRecord;
  score: number;
  reasons: string[];
  autoplayAllowed: false;
  soundAutoplayAllowed: false;
}

function normalize(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseReference(reference: string): { book: string; chapter: number | null } {
  const match = String(reference || "").trim().match(/^((?:[1-3]\s*)?[A-Za-z][A-Za-z ]+)\s+(\d{1,3})/);
  return { book: normalize(match?.[1]), chapter: match ? Number(match[2]) : null };
}

function hasValue(values: string[] | undefined, target: string | undefined): boolean {
  const needle = normalize(target);
  return Boolean(needle && (values || []).some((value) => normalize(value) === needle));
}

function isReviewedRealRecord(record: TeoyubeMediaManifestRecord): boolean {
  return record.imported === true && record.sampleOnly !== true && !["rejected", "blocked"].includes(normalize(record.reviewStatus));
}

export function getRecommendedMediaSurfaces(record: TeoyubeMediaManifestRecord): string[] {
  const surfaces = new Set(record.recommendedSurfaces || []);
  surfaces.add("TeoyubeSearch");
  surfaces.add("Embedded Videos");
  if (record.scriptureReferences?.length) {
    surfaces.add("Today");
    surfaces.add("Canon");
    surfaces.add("Promise Table");
    surfaces.add("Lexicon");
  }
  if (["audio_led", "devotional"].includes(record.mediaKind)) {
    surfaces.add("Teo Guide");
    surfaces.add("Book of the Saint");
  }
  if (record.shortOrLong === "short") {
    surfaces.add("Calling Compass");
    surfaces.add("Testimony");
  }
  return [...surfaces];
}

export function scoreMediaForScripture(record: TeoyubeMediaManifestRecord, reference: string): number {
  const normalizedReference = normalize(reference);
  if (!normalizedReference) return 0;
  if ((record.scriptureReferences || []).some((item) => normalize(item) === normalizedReference)) return 100;
  const requested = parseReference(reference);
  if (requested.book && normalize(record.bibleBook) === requested.book && requested.chapter === record.chapter) return 70;
  if (requested.book && normalize(record.bibleBook) === requested.book) return 45;
  return 0;
}

export function scoreMediaForWord(record: TeoyubeMediaManifestRecord, wordId: string): number {
  return hasValue(record.teoyubeWordIds, wordId) ? 38 : 0;
}

export function scoreMediaForPromise(record: TeoyubeMediaManifestRecord, clusterId: string): number {
  return hasValue(record.promiseClusterIds, clusterId) ? 34 : 0;
}

export function scoreMediaForJourney(record: TeoyubeMediaManifestRecord, journeyId: string): number {
  return hasValue(record.journeyIds, journeyId) ? 30 : 0;
}

export function scoreMediaForCalling(record: TeoyubeMediaManifestRecord, callingId: string): number {
  return hasValue(record.callingIds, callingId) ? 28 : 0;
}

export function explainMediaRecommendation(
  record: TeoyubeMediaManifestRecord,
  context: TeoyubeMediaRecommendationContext
): string[] {
  const reasons: string[] = [];
  const scriptureScore = scoreMediaForScripture(record, context.scriptureReference || "");
  if (scriptureScore === 100) reasons.push("Direct Scripture reference match.");
  else if (scriptureScore === 70) reasons.push("Bible book and chapter match.");
  else if (scriptureScore === 45) reasons.push("Bible book match.");
  if (scoreMediaForWord(record, context.wordId || "")) reasons.push("Connected Teoyube word.");
  if (scoreMediaForPromise(record, context.promiseClusterId || "")) reasons.push("Connected promise cluster.");
  if (scoreMediaForJourney(record, context.journeyId || "")) reasons.push("Connected journey.");
  if (scoreMediaForCalling(record, context.callingId || "")) reasons.push("Connected cautious calling context.");
  if (context.mobile && record.orientation === "portrait") reasons.push("Portrait orientation suits a constrained mobile surface.");
  if (context.mobile && record.shortOrLong === "short") reasons.push("Short duration suits a mobile continuation surface.");
  if (context.surface && getRecommendedMediaSurfaces(record).includes(context.surface)) reasons.push(`Manifest recommends ${context.surface}.`);
  if (record.shortOrLong === "long") reasons.push("Long-form media requires an explicit play action and must not auto-play.");
  return reasons.length ? reasons : ["No strong contextual match; editorial review is required."];
}

export function rankMediaForCurrentContext(
  records: TeoyubeMediaManifestRecord[],
  context: TeoyubeMediaRecommendationContext
): TeoyubeRankedMediaRecord[] {
  return records
    .filter(isReviewedRealRecord)
    .map((record) => {
      let score = 0;
      score += scoreMediaForScripture(record, context.scriptureReference || "");
      score += scoreMediaForWord(record, context.wordId || "");
      score += scoreMediaForPromise(record, context.promiseClusterId || "");
      score += scoreMediaForJourney(record, context.journeyId || "");
      score += scoreMediaForCalling(record, context.callingId || "");
      if (context.mobile && record.orientation === "portrait") score += 10;
      if (context.mobile && record.shortOrLong === "short") score += 8;
      if (context.surface && getRecommendedMediaSurfaces(record).includes(context.surface)) score += 12;
      return {
        record,
        score,
        reasons: explainMediaRecommendation(record, context),
        autoplayAllowed: false as const,
        soundAutoplayAllowed: false as const
      };
    })
    .sort((left, right) => right.score - left.score || left.record.title.localeCompare(right.record.title));
}
