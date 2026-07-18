import type {
  TigProductionInput,
  TigProductionSurface
} from "./production-response-contracts";

export type TigProductionSurfaceAdapterParams = {
  input?: string;
  userState?: string;
  emotion?: string;
  intent?: string;
  selectedWordId?: string;
  selectedClusterId?: string;
  context?: Record<string, unknown>;
  sessionId?: string;
  userId?: string;
};

const SURFACE_DEFAULTS: Record<
  TigProductionSurface,
  {
    input: string;
    userState: string;
    emotion?: string;
    intent: string;
    selectedWordId?: string;
    selectedClusterId?: string;
  }
> = {
  canon: {
    input: "Show a Scripture-anchored Teoyube canon connection.",
    userState: "seeking Scripture-grounded promise language",
    emotion: "waiting",
    intent: "canon_scripture_connection",
    selectedWordId: "word_promise",
    selectedClusterId: "cluster_purpose_in_delay"
  },
  daily_word: {
    input: "Give me a daily word anchored in Scripture.",
    userState: "daily formation and encouragement",
    emotion: "waiting",
    intent: "daily_word",
    selectedWordId: "word_hope",
    selectedClusterId: "cluster_strength_in_waiting"
  },
  prayer: {
    input: "Help me pray through my current season.",
    userState: "needing Scripture-grounded prayer",
    emotion: "discouragement",
    intent: "seeking_prayer",
    selectedWordId: "word_faithful",
    selectedClusterId: "cluster_hope_in_discouragement"
  },
  calling_compass: {
    input: "Help me discern calling through Scripture and faithful action.",
    userState: "seeking purpose and calling clarity",
    emotion: "uncertainty",
    intent: "seeking_calling",
    selectedWordId: "word_calling",
    selectedClusterId: "cluster_guidance_for_next_step"
  },
  promise_cluster: {
    input: "Show a Scripture-backed promise cluster for this season.",
    userState: "needing a promise from Scripture",
    emotion: "discouragement",
    intent: "promise_cluster",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting"
  },
  ai_companion: {
    input: "Give me Scripture-grounded companion support without live AI orchestration.",
    userState: "needing encouragement and a next faithful step",
    emotion: "fear",
    intent: "ai_companion_support",
    selectedWordId: "word_courage",
    selectedClusterId: "cluster_courage_through_presence"
  },
  onboarding: {
    input: "Explain how Teoyube Scripture Intelligence connects my words to Scripture.",
    userState: "new to Scripture Intelligence",
    emotion: "waiting",
    intent: "onboarding_guidance",
    selectedWordId: "word_purpose",
    selectedClusterId: "cluster_purpose_in_delay"
  },
  unknown: {
    input: "I need Scripture-grounded encouragement.",
    userState: "needing Scripture-grounded encouragement",
    emotion: "waiting",
    intent: "seeking_scripture",
    selectedWordId: "word_hope",
    selectedClusterId: "cluster_strength_in_waiting"
  }
};

function cleanText(value?: string): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

function cleanContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;

  return Object.entries(context).reduce<Record<string, unknown>>((cleaned, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
    return cleaned;
  }, {});
}

function createSurfaceInput(
  surface: TigProductionSurface,
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionInput {
  const defaults = SURFACE_DEFAULTS[surface];
  const input = cleanText(params.input) || defaults.input;
  const userState = cleanText(params.userState) || cleanText(params.emotion) || defaults.userState;
  const emotion = cleanText(params.emotion) || defaults.emotion;
  const intent = cleanText(params.intent) || defaults.intent;

  return {
    input,
    userState,
    emotion,
    intent,
    selectedWordId: cleanText(params.selectedWordId) || defaults.selectedWordId,
    selectedClusterId: cleanText(params.selectedClusterId) || defaults.selectedClusterId,
    surface,
    context: cleanContext({
      surface,
      userState,
      emotion,
      intent,
      ...params.context
    }),
    sessionId: cleanText(params.sessionId),
    userId: cleanText(params.userId)
  };
}

export function createCanonTigProductionInput(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionInput {
  return createSurfaceInput("canon", params);
}

export function createDailyWordTigProductionInput(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionInput {
  return createSurfaceInput("daily_word", params);
}

export function createPrayerTigProductionInput(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionInput {
  return createSurfaceInput("prayer", params);
}

export function createCallingCompassTigProductionInput(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionInput {
  return createSurfaceInput("calling_compass", params);
}

export function createPromiseClusterTigProductionInput(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionInput {
  return createSurfaceInput("promise_cluster", params);
}

export function createAiCompanionTigProductionInput(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionInput {
  return createSurfaceInput("ai_companion", params);
}

export function createOnboardingTigProductionInput(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionInput {
  return createSurfaceInput("onboarding", params);
}

export function createUnknownSurfaceTigProductionInput(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionInput {
  return createSurfaceInput("unknown", params);
}
