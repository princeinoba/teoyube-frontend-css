import type {
  ScriptureNode,
  TIGAIRequest,
  TIGAIResponse,
  TIGConfidenceScore
} from "./types";

type ValidatableTIGAIResponse = Omit<TIGAIResponse, "actionStep" | "reflectionPrompt"> & {
  scriptures?: ScriptureNode[];
  confidence?: TIGConfidenceScore;
  prayer?: string;
  reflectionPrompt?: string | { prompt?: string };
  actionStep?: string | { action?: string };
};

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasPromptText(value: ValidatableTIGAIResponse["reflectionPrompt"]): boolean {
  if (typeof value === "string") return hasText(value);
  return hasText(value?.prompt);
}

function hasActionText(value: ValidatableTIGAIResponse["actionStep"]): boolean {
  if (typeof value === "string") return hasText(value);
  return hasText(value?.action);
}

export class TIGAIResponseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TIGAIResponseValidationError";
  }
}

export function validateTIGAIResponse(response: TIGAIResponse): TIGAIResponse {
  const candidate = response as unknown as ValidatableTIGAIResponse;

  if (!Array.isArray(candidate.scriptures) || candidate.scriptures.length < 1) {
    throw new TIGAIResponseValidationError(
      "TIG AI responses must include at least one ScriptureNode in scriptures."
    );
  }

  if (!hasText(candidate.aiMessage)) {
    throw new TIGAIResponseValidationError("TIG AI responses must include a non-empty aiMessage.");
  }

  if (!hasText(candidate.prayer)) {
    throw new TIGAIResponseValidationError("TIG AI responses must include a non-empty prayer.");
  }

  if (!hasPromptText(candidate.reflectionPrompt)) {
    throw new TIGAIResponseValidationError("TIG AI responses must include a non-empty reflectionPrompt.");
  }

  if (!hasActionText(candidate.actionStep)) {
    throw new TIGAIResponseValidationError("TIG AI responses must include a non-empty actionStep.");
  }

  if (!candidate.confidence) {
    throw new TIGAIResponseValidationError("TIG AI responses must include confidence.");
  }

  if (!hasText(candidate.generatedAt)) {
    throw new TIGAIResponseValidationError("TIG AI responses must include generatedAt.");
  }

  return response;
}

export function createFallbackConfidence(): TIGConfidenceScore {
  return {
    overall: 0.35,
    intentConfidence: 0.3,
    emotionConfidence: 0.3,
    promiseConfidence: 0.35,
    scriptureConfidence: 0.5,
    callingConfidence: 0.2,
    journeyConfidence: 0.25,
    explanation:
      "Fallback confidence was used because the AI response was generated without a full graph traversal."
  };
}

export function createScriptureAnchoredFallbackResponse(params: {
  request: TIGAIRequest;
  scripture: ScriptureNode;
}): TIGAIResponse {
  const confidence = createFallbackConfidence();
  const reflectionPrompt =
    "What truth does this Scripture reveal about God, and how can I respond today?";
  const actionStep =
    "Read the Scripture slowly and write down one word or promise that stands out.";

  const response = {
    requestId: params.request.id,
    mode: params.request.mode,
    detectedIntent: "seeking_scripture",
    detectedEmotions: [],
    detectedPromiseCategories: [],
    detectedCallingProfiles: [],
    scriptures: [params.scripture],
    scriptureNodes: [params.scripture],
    teoyubeWords: [],
    promiseClusters: [],
    journey: undefined,
    aiMessage:
      "This response is anchored in Scripture. Teoyube could not complete a full graph match yet, but this passage can still serve as a starting point for reflection.",
    prayer:
      "Father, guide me through Your Word and help me receive truth, wisdom, and strength from this Scripture.",
    reflectionPrompt,
    actionStep,
    confidence,
    confidenceScore: confidence,
    graphTrace: [],
    generatedAt: new Date().toISOString()
  } as unknown as TIGAIResponse;

  return validateTIGAIResponse(response);
}

export async function processTIGAIRequest(_request: TIGAIRequest): Promise<TIGAIResponse> {
  throw new Error(
    "TIG AI processing is not yet connected to live graph data. Use createScriptureAnchoredFallbackResponse with a ScriptureNode until graph traversal is connected."
  );
}
