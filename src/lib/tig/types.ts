// Teoyube Intelligence Graph (TIG)
// Phase 5B.1 production type foundation.

// ---------------------------------------------------------------------------
// Shared Utility Types
// ---------------------------------------------------------------------------

export type TIGID = string;
export type ISODateString = string;
export type TIGScore = number;

export type TIGLevel =
  | "FOUNDATION"
  | "GROWTH"
  | "MATURITY"
  | "LEADERSHIP"
  | "MULTIPLICATION";

export type TIGDirection = "DIRECTED" | "BIDIRECTIONAL";

export type TIGLanguage =
  | "en"
  | "es"
  | "fr"
  | "pt"
  | "sw"
  | "multi";

export type TIGSourceStatus =
  | "SEED"
  | "CURATED"
  | "VERIFIED"
  | "AI_ASSISTED"
  | "DEPRECATED";

export type TIGAudience =
  | "SEEKER"
  | "NEW_BELIEVER"
  | "DISCIPLE"
  | "LEADER"
  | "INTERCESSOR"
  | "GENERAL";

export type TIGTestament = "OLD" | "NEW";

export type TIGScriptureGenre =
  | "LAW"
  | "HISTORY"
  | "WISDOM"
  | "POETRY"
  | "PROPHETIC"
  | "GOSPEL"
  | "EPISTLE"
  | "APOCALYPTIC";

export type TIGGrammarRole =
  | "NOUN"
  | "VERB"
  | "ADJECTIVE"
  | "ADVERB"
  | "DECLARATION"
  | "QUESTION"
  | "PRAYER"
  | "SYMBOL";

export type TIGDurationUnit = "minutes" | "days" | "weeks" | "months";

export interface TIGDuration {
  value: number;
  unit: TIGDurationUnit;
}

export interface TIGVisualMetadata {
  icon?: string;
  symbol?: string;
  color?: string;
  imageUrl?: string;
  gradient?: string;
}

// ---------------------------------------------------------------------------
// Node Types
// ---------------------------------------------------------------------------

export type TIGNodeType =
  | "SCRIPTURE"
  | "TEOYUBE_WORD"
  | "PROMISE_CATEGORY"
  | "PROMISE_CLUSTER"
  | "EMOTION_PROFILE"
  | "CALLING_PROFILE"
  | "KINGDOM_PATH"
  | "PRAYER_SEQUENCE"
  | "JOURNEY"
  | "REFLECTION_PROMPT"
  | "ACTION_STEP"
  | "GROWTH_MILESTONE"
  | "AI_RESPONSE_PATTERN";

export interface TIGNode {
  id: TIGID;
  type: TIGNodeType;
  slug: string;
  title: string;
  description: string;
  summary: string;
  tags: string[];
  aliases: string[];
  scriptureReferences: string[];
  level: TIGLevel;
  language: TIGLanguage;
  audience: TIGAudience[];
  theologicalWeight: TIGScore;
  pastoralSensitivity: TIGScore;
  confidenceScore: TIGScore;
  sourceStatus: TIGSourceStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ScriptureNode extends TIGNode {
  type: "SCRIPTURE";
  reference: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  text: string;
  translation: string;
  themes: string[];
  promises: TIGID[];
  emotions: TIGID[];
  callings: TIGID[];
  teoyubeWords: TIGID[];
  kingdomPaths: TIGID[];
  journeys: TIGID[];
  canonicalImportance: TIGScore;
  directPromise: boolean;
  instructionBased: boolean;
  warningBased: boolean;
  propheticBased: boolean;
  wisdomBased: boolean;
  covenantBased: boolean;
  testament: TIGTestament;
  genre: TIGScriptureGenre;
  crossReferences: string[];
}

export interface TeoyubeWordNode extends TIGNode {
  type: "TEOYUBE_WORD";
  word: string;
  rank: number;
  promiseClusterIds: TIGID[];
  grammarRole: TIGGrammarRole;
  symbols: string[];
  visualMetadata: TIGVisualMetadata;
  pronunciation?: string;
  rootMeaning?: string;
}

export interface PromiseCategoryNode extends TIGNode {
  type: "PROMISE_CATEGORY";
  categoryKey: string;
  anchorScriptureIds: TIGID[];
  relatedEmotionIds: TIGID[];
  relatedCallingIds: TIGID[];
}

export interface PromiseClusterNode extends TIGNode {
  type: "PROMISE_CLUSTER";
  categoryIds: TIGID[];
  anchorScriptureIds: TIGID[];
  teoyubeWordIds: TIGID[];
  declaration: string;
  activationPrompts: string[];
}

export interface EmotionProfileNode extends TIGNode {
  type: "EMOTION_PROFILE";
  emotionKey: string;
  userPhrases: string[];
  phraseMatchers: string[];
  pastoralFrame: string;
  truthBoundary: "CLASSIFIES_STATE_DOES_NOT_DEFINE_TRUTH";
  recommendedPromiseCategoryIds: TIGID[];
  recommendedScriptureIds: TIGID[];
}

export interface CallingProfileNode extends TIGNode {
  type: "CALLING_PROFILE";
  callingKey: string;
  archetypes: string[];
  gifts: string[];
  strengths: string[];
  challenges: string[];
  biblicalExamples: string[];
  growthPath: TIGID[];
  anchorScriptureIds: TIGID[];
}

export interface KingdomPathNode extends TIGNode {
  type: "KINGDOM_PATH";
  pathKey: string;
  stageIds: TIGID[];
  promiseCategoryIds: TIGID[];
  callingProfileIds: TIGID[];
}

export interface PrayerSequenceNode extends TIGNode {
  type: "PRAYER_SEQUENCE";
  sequenceKey: string;
  steps: string[];
  openingScriptureId: TIGID;
  anchorScriptureIds: TIGID[];
  promiseCategoryIds: TIGID[];
  closingDeclaration: string;
}

export interface JourneyStage {
  id: TIGID;
  title: string;
  summary: string;
  order: number;
  scriptureIds: TIGID[];
  promiseCategoryIds: TIGID[];
  reflectionPromptIds: TIGID[];
  actionStepIds: TIGID[];
  milestoneIds: TIGID[];
}

export interface JourneyNode extends TIGNode {
  type: "JOURNEY";
  journeyKey: string;
  fromState: string;
  toState: string;
  stages: JourneyStage[];
  relatedScriptureIds: TIGID[];
  relatedPromiseCategoryIds: TIGID[];
  relatedEmotionIds: TIGID[];
  relatedCallingIds: TIGID[];
  relatedTeoyubeWordIds: TIGID[];
  milestoneIds: TIGID[];
  estimatedDuration: TIGDuration;
}

export interface ReflectionPromptNode extends TIGNode {
  type: "REFLECTION_PROMPT";
  prompt: string;
  followUpQuestions: string[];
  scriptureAnchorIds: TIGID[];
  emotionIds: TIGID[];
  journeyIds: TIGID[];
}

export interface ActionStepNode extends TIGNode {
  type: "ACTION_STEP";
  action: string;
  difficulty: "GENTLE" | "MODERATE" | "STRETCH";
  scriptureAnchorIds: TIGID[];
  promiseCategoryIds: TIGID[];
  expectedFruit: string[];
}

export interface GrowthMilestoneNode extends TIGNode {
  type: "GROWTH_MILESTONE";
  milestoneKey: string;
  evidenceMarkers: string[];
  scriptureAnchorIds: TIGID[];
  unlocksJourneyIds: TIGID[];
  unlocksActionStepIds: TIGID[];
}

export interface AIResponsePatternNode extends TIGNode {
  type: "AI_RESPONSE_PATTERN";
  mode: TIGAIMode;
  tone: "PASTORAL" | "TEACHING" | "ENCOURAGING" | "DIRECTIVE" | "REFLECTIVE";
  requiredScriptureAnchorCount: number;
  template: string;
  guardrails: string[];
}

export type AnyTIGNode =
  | ScriptureNode
  | TeoyubeWordNode
  | PromiseCategoryNode
  | PromiseClusterNode
  | EmotionProfileNode
  | CallingProfileNode
  | KingdomPathNode
  | PrayerSequenceNode
  | JourneyNode
  | ReflectionPromptNode
  | ActionStepNode
  | GrowthMilestoneNode
  | AIResponsePatternNode;

// ---------------------------------------------------------------------------
// Relationship Types
// ---------------------------------------------------------------------------

export type TIGRelationshipType =
  | "CONNECTS_TO"
  | "FULFILLS"
  | "REVEALS"
  | "STRENGTHENS"
  | "HEALS"
  | "GUIDES"
  | "LEADS_TO"
  | "PRECEDES"
  | "FOLLOWS"
  | "SUPPORTS"
  | "ILLUSTRATES"
  | "WARNS_AGAINST"
  | "ACTIVATES"
  | "ANCHORS"
  | "GENERATES"
  | "BELONGS_TO"
  | "MATCHES_INTENT"
  | "MATCHES_EMOTION"
  | "MATCHES_CALLING";

export interface TIGRelationship {
  id: TIGID;
  sourceNodeId: TIGID;
  targetNodeId: TIGID;
  sourceNodeType: TIGNodeType;
  targetNodeType: TIGNodeType;
  type: TIGRelationshipType;
  strength: TIGScore;
  confidenceScore: TIGScore;
  reason: string;
  scriptureBasis: TIGID[];
  direction: TIGDirection;
  tags: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Ranking Types
// ---------------------------------------------------------------------------

export interface TIGRankingInput {
  intentScore: TIGScore;
  emotionScore: TIGScore;
  promiseScore: TIGScore;
  scriptureRelevance: TIGScore;
  callingRelevance: TIGScore;
  journeyRelevance: TIGScore;
  userHistoryRelevance: TIGScore;
  theologicalWeight: TIGScore;
  pastoralSensitivity: TIGScore;
}

export interface TIGRankingWeights {
  intentScore: TIGScore;
  emotionScore: TIGScore;
  promiseScore: TIGScore;
  scriptureRelevance: TIGScore;
  callingRelevance: TIGScore;
  journeyRelevance: TIGScore;
  userHistoryRelevance: TIGScore;
  theologicalWeight: TIGScore;
  pastoralSensitivity: TIGScore;
}

export interface TIGRankedNode<TNode extends AnyTIGNode = AnyTIGNode> {
  node: TNode;
  rank: TIGScore;
  rankingInput: TIGRankingInput;
  reasons: string[];
}

// ---------------------------------------------------------------------------
// Confidence Types
// ---------------------------------------------------------------------------

export interface TIGConfidenceScore {
  overall: TIGScore;
  intentConfidence: TIGScore;
  emotionConfidence: TIGScore;
  promiseConfidence: TIGScore;
  scriptureConfidence: TIGScore;
  callingConfidence: TIGScore;
  journeyConfidence: TIGScore;
  explanation: string;
}

export interface TIGConfidenceInput {
  intentConfidence: TIGScore;
  emotionConfidence: TIGScore;
  promiseConfidence: TIGScore;
  scriptureConfidence: TIGScore;
  callingConfidence: TIGScore;
  journeyConfidence: TIGScore;
  explanation?: string;
}

// ---------------------------------------------------------------------------
// Traversal Types
// ---------------------------------------------------------------------------

export interface TIGTraversalOptions {
  startNodeIds: TIGID[];
  maxDepth: number;
  allowedRelationshipTypes?: TIGRelationshipType[];
  allowedNodeTypes?: TIGNodeType[];
  minStrength?: TIGScore;
  minConfidence?: TIGScore;
  includeBidirectional?: boolean;
}

export interface TIGTraversalPath {
  nodes: TIGID[];
  relationships: TIGID[];
  depth: number;
  score: TIGScore;
  reasons: string[];
}

export interface TIGTraversalResult<TNode extends AnyTIGNode = AnyTIGNode> {
  startNodeIds: TIGID[];
  rankedNodes: TIGRankedNode<TNode>[];
  paths: TIGTraversalPath[];
  visitedNodeIds: TIGID[];
  generatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Detection Types
// ---------------------------------------------------------------------------

export type TIGIntent =
  | "DAILY_WORD"
  | "PROMISE_SEARCH"
  | "CALLING_DISCERNMENT"
  | "PRAYER_REQUEST"
  | "JOURNAL_REFLECTION"
  | "GROWTH_GUIDANCE"
  | "SCRIPTURE_EXPLANATION"
  | "AI_COMPANION";

export interface TIGIntentDetectionResult {
  intent: TIGIntent;
  confidence: TIGScore;
  matchedPhrases: string[];
  supportingNodeIds: TIGID[];
}

export interface TIGPromiseDetectionResult {
  promiseCategoryIds: TIGID[];
  promiseClusterIds: TIGID[];
  confidence: TIGScore;
  matchedTerms: string[];
  scriptureAnchorIds: TIGID[];
}

export interface TIGCallingDetectionResult {
  callingProfileIds: TIGID[];
  confidence: TIGScore;
  matchedGifts: string[];
  matchedArchetypes: string[];
  scriptureAnchorIds: TIGID[];
}

export interface TIGEmotionDetectionResult {
  emotionProfileIds: TIGID[];
  confidence: TIGScore;
  matchedPhrases: string[];
  pastoralSensitivity: TIGScore;
  truthBoundary: "EMOTIONS_CLASSIFY_STATE_NOT_TRUTH";
}

// ---------------------------------------------------------------------------
// AI Interface Types
// ---------------------------------------------------------------------------

export type TIGDecisionSummaryItem = {
  label: string;
  value: string;
  nodeId?: string;
  nodeType?: TIGNodeType;
  explanation: string;
  confidence?: TIGScore;
};

export type TIGDecisionSummary = {
  title: string;
  input?: string;
  items: TIGDecisionSummaryItem[];
  overallExplanation: string;
};

export type TIGAIMode =
  | "daily_word"
  | "promise_search"
  | "calling_compass"
  | "prayer"
  | "journal"
  | "growth_journey"
  | "ai_companion";

export interface TIGAIContext {
  userId?: TIGID;
  language: TIGLanguage;
  audience: TIGAudience;
  currentJourneyId?: TIGID;
  activeCallingProfileIds?: TIGID[];
  recentEmotionProfileIds?: TIGID[];
  recentNodeIds?: TIGID[];
  userHistory?: UserGraphHistory;
}

export interface TIGAIRequest {
  id: TIGID;
  mode: TIGAIMode;
  input: string;
  context: TIGAIContext;
  requestedAt: ISODateString;
}

export interface TIGAIResponse {
  requestId: TIGID;
  mode: TIGAIMode;
  detectedIntent: TIGIntentDetectionResult;
  detectedEmotions: TIGEmotionDetectionResult;
  detectedPromiseCategories: TIGPromiseDetectionResult;
  detectedCallingProfiles: TIGCallingDetectionResult;
  scriptureNodes: ScriptureNode[];
  teoyubeWords: TeoyubeWordNode[];
  promiseClusters: PromiseClusterNode[];
  journey?: JourneyNode;
  aiMessage: string;
  prayer?: string;
  reflectionPrompt?: ReflectionPromptNode;
  actionStep?: ActionStepNode;
  confidenceScore: TIGConfidenceScore;
  graphTrace: TIGTraversalPath[];
  decisionSummary?: TIGDecisionSummary;
  generatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// User Growth Tracking Types
// ---------------------------------------------------------------------------

export interface UserJourneyState {
  userId: TIGID;
  journeyId: TIGID;
  currentStageId: TIGID;
  completedStageIds: TIGID[];
  completedMilestoneIds: TIGID[];
  activeActionStepIds: TIGID[];
  startedAt: ISODateString;
  lastAdvancedAt?: ISODateString;
  updatedAt: ISODateString;
}

export interface UserGraphHistory {
  userId: TIGID;
  viewedNodeIds: TIGID[];
  savedNodeIds: TIGID[];
  completedActionStepIds: TIGID[];
  completedJourneyIds: TIGID[];
  prayerSequenceIds: TIGID[];
  reflectionPromptIds: TIGID[];
  emotionHistory: Array<{
    emotionProfileId: TIGID;
    confidence: TIGScore;
    detectedAt: ISODateString;
  }>;
  intentHistory: Array<{
    intent: TIGIntent;
    confidence: TIGScore;
    detectedAt: ISODateString;
  }>;
  lastInteractionAt: ISODateString;
}
