import TeoyubeCard from "@/components/TeoyubeCard";
import { createWordCardAdapterProps } from "@/lib/teoyube/adapters/word-card-adapter";

type WordCardProps = {
  word?: any;
  wordId?: string;
  engineContext?: ReturnType<typeof createWordCardAdapterProps>;
};

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean))];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function resolveWordLookup(word: any, wordId?: string): string {
  return wordId || word?.id || word?.word || word?.teoyubeWord || "Benor";
}

export default function WordCard({ word = {}, wordId, engineContext }: WordCardProps) {
  const engine = engineContext || createWordCardAdapterProps(resolveWordLookup(word, wordId));
  const displayWord = {
    ...engine.word,
    ...word,
    scriptureReferences: unique([
      ...asStringArray(word.scriptureReferences),
      ...asStringArray(word.scripture_sources),
      ...engine.context.scriptureAnchors
    ])
  };
  const references = displayWord.scriptureReferences || [];
  const promiseConnections = engine.context.promiseConnections || [];
  const explanationPath = engine.context.explanationPath || [];
  const title = displayWord.word || displayWord.teoyubeWord || engine.word.word || "Teoyube Word";

  return (
    <TeoyubeCard title={title}>
      <p>
        <strong>Meaning:</strong> {displayWord.meaning || "Meaning is not available yet."}
      </p>
      <p>
        <strong>Category:</strong> {displayWord.category || "Uncategorized"}
      </p>
      {(displayWord.promiseStatement || promiseConnections.length > 0) && (
        <p>
          <strong>Promise:</strong>{" "}
          {displayWord.promiseStatement || promiseConnections[0]?.declaration || "Promise connection is being reviewed."}
        </p>
      )}
      {references.length > 0 && (
        <p className="break-words">
          <strong>Scripture Anchors:</strong> {references.join(", ")}
        </p>
      )}
      {!references.length && (
        <p className="muted">
          Scripture anchor missing - this word should be reviewed before being treated as a recommendation.
        </p>
      )}
      {promiseConnections.length > 0 && (
        <p className="break-words">
          <strong>Promise Clusters:</strong>{" "}
          {promiseConnections.map((cluster) => cluster.title).join(", ")}
        </p>
      )}
      {explanationPath.length > 0 && (
        <p className="muted break-words">
          <strong>Explanation Path:</strong> {explanationPath.join(" ")}
        </p>
      )}
    </TeoyubeCard>
  );
}
