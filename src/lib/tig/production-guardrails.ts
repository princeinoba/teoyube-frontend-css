import type {
  TigProductionResponse,
  TigProductionSafetyStatus
} from "./production-response-contracts";
import type { TigRecommendationPath } from "./intelligence-graph-engine";
import { selectBestTigPath } from "./intelligence-graph-engine";

const ACTIVE_GUARDRAILS = [
  "Every production recommendation must include Scripture evidence.",
  "Every production recommendation must include an explanation path.",
  "Action steps must be safe, gentle, and non-harmful.",
  "Spiritual guidance must be framed as encouragement, not coercion.",
  "Output must not make medical, legal, financial, or emergency claims.",
  "Confidence must not be overstated.",
  "Output must not claim divine certainty."
];

const HARMFUL_ACTION_TERMS = [
  "hurt yourself",
  "harm yourself",
  "self-harm",
  "suicide",
  "violence",
  "attack",
  "revenge"
];

const CLAIM_CONTEXT_TERMS = [
  "diagnose",
  "prescribe",
  "medical advice",
  "legal advice",
  "investment advice",
  "guaranteed return",
  "emergency response"
];

const DIVINE_CERTAINTY_TERMS = [
  "god told you",
  "god guarantees",
  "this will definitely happen",
  "you must obey this exact step",
  "divine certainty"
];

const SANITIZED_CERTAINTY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/god told you/gi, "this may be prayerfully considered"],
  [/god guarantees/gi, "Scripture points us to God's faithfulness"],
  [/this will definitely happen/gi, "this should be held with prayer and wisdom"],
  [/you must obey this exact step/gi, "consider this as a gentle next step"],
  [/divine certainty/gi, "Scripture-grounded encouragement"]
];

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function includesAnyTerm(text: string, terms: string[]): boolean {
  const normalized = normalizeText(text);
  return terms.some((term) => normalized.includes(term));
}

function sanitizeText(value: string): string {
  return SANITIZED_CERTAINTY_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value
  );
}

function getActionText(response: TigProductionResponse): string {
  const action = response.selection.actionStep;
  if (!action) return "";

  const actionText = action.metadata.actionText;
  return [
    action.label,
    action.description,
    typeof actionText === "string" ? actionText : ""
  ].join(" ");
}

function getUserFacingText(response: TigProductionResponse): string {
  return [
    response.explanation.summary,
    ...response.explanation.reasonPath,
    response.selection.teoyubeWord?.label,
    response.selection.promiseCluster?.label,
    response.selection.scriptureAnchor?.label,
    response.selection.prayerSequence?.label,
    response.selection.actionStep?.label
  ]
    .filter(Boolean)
    .join(" ");
}

function isPromiseConnectedToScripture(response: TigProductionResponse): boolean {
  const promise = response.selection.promiseCluster;
  const scripture = response.selection.scriptureAnchor;
  if (!promise || !scripture) return false;

  const scriptureValues = [
    scripture.id,
    scripture.label,
    ...scripture.scriptureRefs
  ].map(normalizeText);

  if (
    promise.scriptureRefs.some((reference) =>
      scriptureValues.some((value) => value.includes(normalizeText(reference)))
    )
  ) {
    return true;
  }

  return response.selection.edges.some((edge) => {
    const connectsNodes =
      [edge.source, edge.target].includes(promise.id) &&
      [edge.source, edge.target].includes(scripture.id);
    const hasScriptureEvidence = edge.evidence.some((evidence) =>
      scriptureValues.some((value) => value.includes(normalizeText(evidence)))
    );

    return connectsNodes || hasScriptureEvidence;
  });
}

function isPrayerConnectedToPath(response: TigProductionResponse): boolean {
  const prayer = response.selection.prayerSequence;
  if (!prayer) return false;

  const appearsInPath = response.explanation.reasonPath.some((reason) =>
    normalizeText(reason).includes(normalizeText(prayer.label))
  );
  const connectedByEdge = response.selection.edges.some((edge) =>
    [edge.source, edge.target].includes(prayer.id)
  );
  const selectedNode = response.selection.nodes.some((node) => node.id === prayer.id);

  return selectedNode && (appearsInPath || connectedByEdge);
}

export function getSafeGeneralEncouragementPath(): TigRecommendationPath {
  return selectBestTigPath({
    input:
      "I need safe Scripture-grounded encouragement, a prayer, and one gentle faithful next step.",
    mode: "promise_search",
    userState: "encouragement",
    emotionTags: ["discouragement", "waiting", "fear"]
  });
}

export function validateTigProductionSafety(
  response: TigProductionResponse
): TigProductionSafetyStatus {
  const warnings: string[] = [];
  const violations: string[] = [];

  if (!response.selection.scriptureAnchor || !response.explanation.scriptureEvidence.length) {
    violations.push("Production response is missing Scripture evidence.");
  }

  if (response.selection.promiseCluster && !isPromiseConnectedToScripture(response)) {
    violations.push("Selected promise cluster is not clearly connected to Scripture.");
  }

  if (response.selection.prayerSequence && !isPrayerConnectedToPath(response)) {
    violations.push("Selected prayer sequence is not clearly connected to the response path.");
  }

  if (!response.explanation.reasonPath.length) {
    violations.push("Production response is missing an explanation path.");
  }

  if (!response.selection.actionStep) {
    warnings.push("Production response is missing an action step.");
  }

  if (includesAnyTerm(getActionText(response), HARMFUL_ACTION_TERMS)) {
    violations.push("Production action step may be harmful or unsafe.");
  }

  if (includesAnyTerm(getUserFacingText(response), CLAIM_CONTEXT_TERMS)) {
    violations.push("Production output may contain medical, legal, financial, or emergency claims.");
  }

  if (includesAnyTerm(getUserFacingText(response), DIVINE_CERTAINTY_TERMS)) {
    violations.push("Production output may claim divine certainty.");
  }

  if (response.confidence.label === "strong" && response.confidence.score < 0.85) {
    warnings.push("Production confidence label overstates the numeric score.");
  }

  if (response.confidence.score < 0.45) {
    warnings.push("Production confidence is weak and should use fallback framing.");
  }

  if (response.confidence.score < 0.45 && !response.fallback.used) {
    warnings.push("Weak confidence should trigger a fallback path before display.");
  }

  const blocked = violations.length > 0;

  return {
    safe: !blocked,
    blocked,
    status: blocked ? "blocked" : warnings.length ? "warning" : "safe",
    warnings,
    violations,
    guardrails: ACTIVE_GUARDRAILS
  };
}

export function getTigProductionSafetyStatus(
  response: TigProductionResponse
): TigProductionSafetyStatus {
  return validateTigProductionSafety(response);
}

export function shouldBlockTigProductionResponse(response: TigProductionResponse): boolean {
  return validateTigProductionSafety(response).blocked;
}

export function sanitizeTigProductionResponse(
  response: TigProductionResponse
): TigProductionResponse {
  const safePath = getSafeGeneralEncouragementPath();
  const hasUnsafeAction = includesAnyTerm(getActionText(response), HARMFUL_ACTION_TERMS);
  const safeAction = hasUnsafeAction ? safePath.selectedNodes.actionStep : response.selection.actionStep;
  const warnings = [...response.explanation.warnings];

  if (hasUnsafeAction) {
    warnings.push("Unsafe action language was replaced with a safe Scripture-grounded action.");
  }

  return {
    ...response,
    selection: {
      ...response.selection,
      actionStep: safeAction,
      nodes:
        safeAction && !response.selection.nodes.some((node) => node.id === safeAction.id)
          ? [...response.selection.nodes, safeAction]
          : response.selection.nodes
    },
    explanation: {
      ...response.explanation,
      summary: sanitizeText(response.explanation.summary),
      reasonPath: response.explanation.reasonPath.map(sanitizeText),
      warnings
    }
  };
}
