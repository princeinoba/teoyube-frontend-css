import type {
  AnyTIGNode,
  TIGRankedNode,
  TIGRankingInput,
  TIGRankingWeights,
  TIGScore
} from "./types";

export const DEFAULT_TIG_RANKING_WEIGHTS: TIGRankingWeights = {
  intentScore: 0.18,
  emotionScore: 0.16,
  promiseScore: 0.18,
  scriptureRelevance: 0.18,
  callingRelevance: 0.08,
  journeyRelevance: 0.08,
  userHistoryRelevance: 0.04,
  theologicalWeight: 0.07,
  pastoralSensitivity: 0.03
};

type RankableTIGNodeInput<TNode extends AnyTIGNode> = {
  node: TNode;
  input: TIGRankingInput;
  matchedRelationshipIds?: string[];
  matchedReasons?: string[];
};

type RankedTIGNodeWithScore<TNode extends AnyTIGNode> = TIGRankedNode<TNode> & {
  score: TIGScore;
  matchedRelationshipIds?: string[];
  matchedReasons?: string[];
};

export function clampTIGScore(score: number): TIGScore {
  if (!Number.isFinite(score)) return 0;
  return Math.min(1, Math.max(0, score));
}

export function calculateTIGRank(
  input: TIGRankingInput,
  weights: TIGRankingWeights = DEFAULT_TIG_RANKING_WEIGHTS
): TIGScore {
  const score =
    clampTIGScore(input.intentScore) * weights.intentScore +
    clampTIGScore(input.emotionScore) * weights.emotionScore +
    clampTIGScore(input.promiseScore) * weights.promiseScore +
    clampTIGScore(input.scriptureRelevance) * weights.scriptureRelevance +
    clampTIGScore(input.callingRelevance) * weights.callingRelevance +
    clampTIGScore(input.journeyRelevance) * weights.journeyRelevance +
    clampTIGScore(input.userHistoryRelevance) * weights.userHistoryRelevance +
    clampTIGScore(input.theologicalWeight) * weights.theologicalWeight +
    clampTIGScore(input.pastoralSensitivity) * weights.pastoralSensitivity;

  return clampTIGScore(score);
}

export function rankTIGNodes<TNode extends AnyTIGNode>(
  nodes: Array<RankableTIGNodeInput<TNode>>
): TIGRankedNode<TNode>[] {
  const ranked: Array<RankedTIGNodeWithScore<TNode>> = nodes
    .map((entry) => {
      const score = calculateTIGRank(entry.input);

      return {
        node: entry.node,
        rank: 0,
        score,
        rankingInput: entry.input,
        reasons: entry.matchedReasons || [],
        matchedRelationshipIds: entry.matchedRelationshipIds,
        matchedReasons: entry.matchedReasons
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  return ranked;
}

export function mergeTIGRankingInput(base: Partial<TIGRankingInput>): TIGRankingInput {
  return {
    intentScore: clampTIGScore(base.intentScore ?? 0),
    emotionScore: clampTIGScore(base.emotionScore ?? 0),
    promiseScore: clampTIGScore(base.promiseScore ?? 0),
    scriptureRelevance: clampTIGScore(base.scriptureRelevance ?? 0),
    callingRelevance: clampTIGScore(base.callingRelevance ?? 0),
    journeyRelevance: clampTIGScore(base.journeyRelevance ?? 0),
    userHistoryRelevance: clampTIGScore(base.userHistoryRelevance ?? 0),
    theologicalWeight: clampTIGScore(base.theologicalWeight ?? 0.5),
    pastoralSensitivity: clampTIGScore(base.pastoralSensitivity ?? 0.5)
  };
}

export function normalizeTIGScore(value: number, max = 1): TIGScore {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return clampTIGScore(value / max);
}
