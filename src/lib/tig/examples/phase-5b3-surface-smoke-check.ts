import type {
  TigProductionInput,
  TigProductionResponse,
  TigProductionSurface
} from "../production-response-contracts";
import { validateTigProductionResponseShape } from "../production-response-validation";
import {
  createAiCompanionTigProductionInput,
  createCallingCompassTigProductionInput,
  createCanonTigProductionInput,
  createDailyWordTigProductionInput,
  createOnboardingTigProductionInput,
  createPrayerTigProductionInput,
  createPromiseClusterTigProductionInput,
  createUnknownSurfaceTigProductionInput,
  type TigProductionSurfaceAdapterParams
} from "../production-surface-adapters";
import { runTigProductionForSurface } from "../production-surface-runner";

export type TigSurfaceSmokeCheckResult = {
  surface: TigProductionSurface;
  valid: boolean;
  errors: string[];
  missingEmotionValid: boolean;
  confidenceLabel?: string;
  fallbackUsed?: boolean;
  safetyStatus?: string;
  selectedScripture?: string;
  explanationPathLength?: number;
};

export type TigSurfaceSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: TigSurfaceSmokeCheckResult[];
};

type SurfaceCase = {
  surface: TigProductionSurface;
  createInput: (params?: TigProductionSurfaceAdapterParams) => TigProductionInput;
  params: TigProductionSurfaceAdapterParams;
};

const SURFACE_CASES: SurfaceCase[] = [
  {
    surface: "canon",
    createInput: createCanonTigProductionInput,
    params: {
      input: "Show a Teoyube canon connection for purpose.",
      userState: "exploring canon",
      emotion: "waiting",
      selectedWordId: "word_purpose",
      selectedClusterId: "cluster_purpose_in_delay"
    }
  },
  {
    surface: "daily_word",
    createInput: createDailyWordTigProductionInput,
    params: {
      input: "Give me a daily word for hope.",
      userState: "daily encouragement",
      emotion: "waiting",
      selectedWordId: "word_hope",
      selectedClusterId: "cluster_strength_in_waiting"
    }
  },
  {
    surface: "prayer",
    createInput: createPrayerTigProductionInput,
    params: {
      input: "Help me pray through discouragement.",
      userState: "discouragement",
      emotion: "discouragement",
      selectedWordId: "word_faithful",
      selectedClusterId: "cluster_hope_in_discouragement"
    }
  },
  {
    surface: "calling_compass",
    createInput: createCallingCompassTigProductionInput,
    params: {
      input: "Help me discern calling.",
      userState: "purpose and calling clarity",
      emotion: "uncertainty",
      selectedWordId: "word_calling",
      selectedClusterId: "cluster_guidance_for_next_step"
    }
  },
  {
    surface: "promise_cluster",
    createInput: createPromiseClusterTigProductionInput,
    params: {
      input: "I feel stuck and need strength from Scripture.",
      userState: "discouragement",
      emotion: "discouragement",
      selectedWordId: "word_strength",
      selectedClusterId: "cluster_strength_in_waiting"
    }
  },
  {
    surface: "ai_companion",
    createInput: createAiCompanionTigProductionInput,
    params: {
      input: "I am afraid to start what God called me to do.",
      userState: "fear",
      emotion: "fear",
      selectedWordId: "word_courage",
      selectedClusterId: "cluster_courage_through_presence"
    }
  },
  {
    surface: "onboarding",
    createInput: createOnboardingTigProductionInput,
    params: {
      input: "Teach me how Teoyube connects my words to Scripture.",
      userState: "new to Scripture Intelligence",
      emotion: "waiting",
      selectedWordId: "word_purpose",
      selectedClusterId: "cluster_purpose_in_delay"
    }
  },
  {
    surface: "unknown",
    createInput: createUnknownSurfaceTigProductionInput,
    params: {
      input: "I need Scripture-grounded encouragement.",
      userState: "needing encouragement",
      emotion: "waiting",
      selectedWordId: "word_hope",
      selectedClusterId: "cluster_strength_in_waiting"
    }
  }
];

function validateSurfaceResponse(response: TigProductionResponse): string[] {
  const errors: string[] = [];
  const shape = validateTigProductionResponseShape(response);

  if (!shape.valid) {
    errors.push(`Missing fields: ${shape.missingFields.join(", ")}`);
  }

  if (!response.selection.scriptureAnchor || !response.explanation.scriptureEvidence.length) {
    errors.push("Response is missing a Scripture anchor or Scripture evidence.");
  }

  if (!response.explanation.reasonPath.length) {
    errors.push("Response is missing an explanation path.");
  }

  if (!response.confidence.label) {
    errors.push("Response is missing a confidence label.");
  }

  if (!response.fallback || typeof response.fallback.used !== "boolean") {
    errors.push("Response is missing fallback status.");
  }

  if (!response.safety || !response.safety.status) {
    errors.push("Response is missing safety status.");
  }

  if (!response.event || !response.event.eventName) {
    errors.push("Response is missing event payload.");
  }

  if (!response.selection.nodes.length || !response.explanation.summary) {
    errors.push("Response returned an empty production selection.");
  }

  return errors;
}

function runSurfaceCase(surfaceCase: SurfaceCase): TigSurfaceSmokeCheckResult {
  const errors: string[] = [];
  let response: TigProductionResponse | undefined;
  let missingEmotionResponse: TigProductionResponse | undefined;

  try {
    response = runTigProductionForSurface(surfaceCase.createInput(surfaceCase.params));
    errors.push(...validateSurfaceResponse(response));
  } catch (error) {
    errors.push(
      error instanceof Error
        ? `Surface crashed: ${error.message}`
        : "Surface crashed with an unknown error."
    );
  }

  try {
    const { emotion: _emotion, ...paramsWithoutEmotion } = surfaceCase.params;
    missingEmotionResponse = runTigProductionForSurface(
      surfaceCase.createInput(paramsWithoutEmotion)
    );
  } catch (error) {
    errors.push(
      error instanceof Error
        ? `Missing-emotion run crashed: ${error.message}`
        : "Missing-emotion run crashed with an unknown error."
    );
  }

  const missingEmotionErrors = missingEmotionResponse
    ? validateSurfaceResponse(missingEmotionResponse)
    : ["Missing-emotion response was not produced."];

  errors.push(...missingEmotionErrors.map((error) => `Missing emotion: ${error}`));

  return {
    surface: surfaceCase.surface,
    valid: errors.length === 0,
    errors,
    missingEmotionValid: missingEmotionErrors.length === 0,
    confidenceLabel: response?.confidence.label,
    fallbackUsed: response?.fallback.used,
    safetyStatus: response?.safety.status,
    selectedScripture: response?.selection.scriptureAnchor?.label,
    explanationPathLength: response?.explanation.reasonPath.length
  };
}

export function runPhase5B3SurfaceSmokeCheck(): TigSurfaceSmokeCheckReport {
  const results = SURFACE_CASES.map(runSurfaceCase);
  const errors = results.flatMap((result) =>
    result.errors.map((error) => `${result.surface}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}
