import kingdomArchetypesData from "../../../data/kingdomArchetypes.json";
import { detectCallingMatches, getScripturesFromCallings } from "../../tig/calling-compass";
import { TIG_CALLING_SEEDS } from "../../tig/seed/callings.seed";
import type { CallingProfileNode } from "../../tig/types";
import { findPromiseClustersByTheme, type TeoyubePromiseCluster } from "../promises/promise-engine";
import { findTeoyubeWordsByTheme, type TeoyubeVocabularyWord } from "../language/teoyube-language-engine";
import { validateTheologyBoundaries } from "../theology/theology-framework";

export type TeoyubeCallingArchetype = {
  id: string;
  name: string;
  category: string;
  teoyubeWord?: string;
  summary: string;
  scriptureReferences: string[];
  coreWords: string[];
  primaryCluster?: string;
  primaryPath?: string;
  gifts: string[];
  actionSteps: string[];
  source: "kingdom_archetype" | "tig_seed";
  raw: unknown;
};

export type TeoyubeCallingPath = {
  id: string;
  input: string;
  archetype: TeoyubeCallingArchetype;
  words: TeoyubeVocabularyWord[];
  promises: TeoyubePromiseCluster[];
  scriptureAnchors: string[];
  prayers: string[];
  actionSteps: string[];
  explanationPath: string[];
  confidenceLabel: "direct" | "thematic" | "fallback";
};

type RawArchetype = Record<string, unknown>;

const rawArchetypes = kingdomArchetypesData as RawArchetype[];

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function tokenize(value: string): string[] {
  return unique(normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2));
}

function normalizeRawArchetype(raw: RawArchetype): TeoyubeCallingArchetype {
  return {
    id: asString(raw.id, asString(raw.name)),
    name: asString(raw.name, "Calling Archetype"),
    category: asString(raw.category, asString(raw.primaryCluster, "Calling")),
    teoyubeWord: asString(raw.teoyubeWord),
    summary: asString(raw.identityStatement, asString(raw.manifestationGoal, "")),
    scriptureReferences: asStringArray(raw.scriptureReferences),
    coreWords: unique(asStringArray(raw.coreWords)),
    primaryCluster: asString(raw.primaryCluster),
    primaryPath: asString(raw.primaryPath),
    gifts: [],
    actionSteps: [],
    source: "kingdom_archetype",
    raw
  };
}

function normalizeTigCalling(calling: CallingProfileNode): TeoyubeCallingArchetype {
  return {
    id: calling.id,
    name: calling.title,
    category: calling.callingKey,
    summary: calling.summary,
    scriptureReferences: unique([...calling.scriptureReferences, ...calling.anchorScriptureIds]),
    coreWords: unique([...((calling as CallingProfileNode & { relatedWords?: string[] }).relatedWords || []), ...calling.tags]),
    primaryCluster: calling.tags[0],
    primaryPath: calling.growthPath[0],
    gifts: calling.gifts,
    actionSteps: (calling as CallingProfileNode & { relatedActionSteps?: string[] }).relatedActionSteps || [],
    source: "tig_seed",
    raw: calling
  };
}

export function getCallingArchetypes(): TeoyubeCallingArchetype[] {
  return [
    ...rawArchetypes.map(normalizeRawArchetype),
    ...TIG_CALLING_SEEDS.map(normalizeTigCalling)
  ];
}

export function findCallingArchetypeById(id: string): TeoyubeCallingArchetype | undefined {
  const normalizedId = normalize(id);
  return getCallingArchetypes().find((archetype) =>
    [archetype.id, archetype.name, archetype.category, archetype.teoyubeWord || ""].some((value) => normalize(value) === normalizedId)
  );
}

export function createCallingCompassContext(input: {
  query?: string;
  archetypeId?: string;
} = {}) {
  const query = input.query || input.archetypeId || "calling";
  const normalizedQuery = normalize(query);
  const queryTokens = tokenize(query);
  const archetype = input.archetypeId
    ? findCallingArchetypeById(input.archetypeId)
    : getCallingArchetypes()
      .map((entry) => {
        const searchable = [entry.name, entry.category, entry.summary, entry.teoyubeWord || "", ...entry.coreWords, ...entry.gifts]
          .join(" ")
          .toLowerCase();
        const score = [
          searchable.includes(normalizedQuery) ? 4 : 0,
          ...queryTokens.map((token) => searchable.includes(token) ? 1 : 0)
        ].reduce((total, value) => total + value, 0);
        return { entry, score };
      })
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.entry;
  const matchedTigCallings = detectCallingMatches(query);

  return {
    input: query,
    archetype: archetype || getCallingArchetypes()[0],
    matchedTigCallings,
    explanationPath: [
      `Matched calling context from existing kingdom archetypes and ${matchedTigCallings.length} TIG calling profile(s).`
    ]
  };
}

export function recommendCallingPath(input: {
  query?: string;
  archetypeId?: string;
} = {}): TeoyubeCallingPath {
  const context = createCallingCompassContext(input);
  const archetype = context.archetype;
  const tigScriptures = getScripturesFromCallings(context.matchedTigCallings);
  const scriptureAnchors = unique([
    ...archetype.scriptureReferences,
    ...tigScriptures.flatMap((scripture) => [scripture.reference, ...scripture.scriptureReferences])
  ]);
  const words = unique([archetype.teoyubeWord || "", ...archetype.coreWords, ...archetype.gifts])
    .flatMap(findTeoyubeWordsByTheme)
    .slice(0, 8);
  const promises = unique([archetype.primaryCluster || "", archetype.category, ...archetype.coreWords])
    .flatMap(findPromiseClustersByTheme)
    .slice(0, 6);

  return {
    id: `calling_path_${archetype.id}`,
    input: context.input,
    archetype,
    words,
    promises,
    scriptureAnchors: unique([...scriptureAnchors, ...promises.flatMap((cluster) => cluster.scriptureReferences)]),
    prayers: unique([
      archetype.primaryPath ? `Pray through the ${archetype.primaryPath} path with one faithful next step.` : "",
      ...promises.flatMap((cluster) => cluster.prayerSequence)
    ]),
    actionSteps: unique([
      ...archetype.actionSteps,
      "Name one gift, one burden, and one faithful action step.",
      "Review Scripture anchors before making a calling decision."
    ]),
    explanationPath: [
      ...context.explanationPath,
      `Selected ${archetype.name} from ${archetype.source}.`,
      `Connected ${words.length} word(s), ${promises.length} promise cluster(s), and ${scriptureAnchors.length} Scripture anchor(s).`
    ],
    confidenceLabel: context.matchedTigCallings.length ? "direct" : promises.length ? "thematic" : "fallback"
  };
}

export function explainCallingPath(path: TeoyubeCallingPath): string[] {
  return [
    ...path.explanationPath,
    "Calling recommendations are reflective and Scripture-anchored; they do not claim divine certainty.",
    "The engine prepares data for CompassExperience without embedding UI behavior."
  ];
}

export function validateCallingPathScriptureAnchoring(path: TeoyubeCallingPath) {
  return validateTheologyBoundaries({
    scriptureReferences: path.scriptureAnchors,
    explanationPath: explainCallingPath(path),
    text: `${path.archetype.name} ${path.archetype.summary}`
  });
}
