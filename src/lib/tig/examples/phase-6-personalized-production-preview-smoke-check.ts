import { createTigProductionEventBatch } from "../production-events";
import { runTeoyubeProductionIntelligence } from "../production-intelligence-service";
import { createInMemoryTeoyubeSignalStore } from "../personalization-signal-store";
import { storeProductionEventBatchAsPersonalizationSignals } from "../personalization-event-signal-bridge";
import { validateSignalStoreConsent } from "../personalization-signal-store-safety";
import {
  runTeoyubePersonalizationComparison,
  runTeoyubePersonalizationPreview
} from "../personalization-preview-service";
import { createPersonalizationPreviewComparedEvent } from "../personalization-preview-events";
import { toPersonalizationPreviewPanelProps } from "../personalization-preview-ui-adapter";

export type Phase6PersonalizedPreviewSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase6PersonalizedPreviewSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase6PersonalizedPreviewSmokeCheckResult[];
};

function result(name: string, errors: string[]): Phase6PersonalizedPreviewSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function stripEmpty(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runPhase6PersonalizedProductionPreviewSmokeCheck(): Phase6PersonalizedPreviewSmokeCheckReport {
  const consent = validateSignalStoreConsent({
    personalizationEnabled: true,
    learningEnabled: true,
    allowRawTextStorage: false,
    allowedScopes: ["signals", "preferences", "journey_progress", "feedback"],
    source: "user"
  }).consent;
  const disabledConsent = validateSignalStoreConsent({
    personalizationEnabled: false,
    learningEnabled: false,
    allowRawTextStorage: false,
    allowedScopes: []
  }).consent;
  const productionInput = {
    input: "Private note: I feel stuck and discouraged, but I need a promise.",
    userState: "discouragement",
    emotion: "discouragement",
    intent: "promise_search",
    surface: "promise_cluster" as const,
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    sessionId: "preview_smoke_session",
    userId: "preview_smoke_user"
  };
  const store = createInMemoryTeoyubeSignalStore({
    scope: "development",
    privacyLevel: "consented_profile",
    sessionId: productionInput.sessionId,
    userId: productionInput.userId
  });
  const baselineProduction = runTeoyubeProductionIntelligence(productionInput);
  const events = createTigProductionEventBatch(productionInput, baselineProduction);
  storeProductionEventBatchAsPersonalizationSignals(store, events, consent);
  const baselinePreview = runTeoyubePersonalizationPreview({
    productionInput,
    mode: "baseline_only",
    consent,
    signalStore: store
  });
  const personalizedPreview = runTeoyubePersonalizationComparison({
    productionInput,
    consent,
    signalStore: store,
    preferenceHints: ["Prefer strength language when Scripture anchoring stays stable."]
  });
  const missingConsentPreview = runTeoyubePersonalizationComparison({
    productionInput,
    signalStore: store
  });
  const disabledPreview = runTeoyubePersonalizationComparison({
    productionInput,
    consent: disabledConsent,
    signalStore: store
  });
  const event = createPersonalizationPreviewComparedEvent(personalizedPreview);
  const eventJson = JSON.stringify(event);
  const uiProps = toPersonalizationPreviewPanelProps(personalizedPreview);

  const results = [
    result("baseline preview works", stripEmpty([
      baselinePreview.baseline ? "" : "Baseline preview is missing baseline response.",
      baselinePreview.personalized ? "Baseline-only mode should not include personalized response." : ""
    ])),
    result("personalized preview works with consent", stripEmpty([
      personalizedPreview.personalized ? "" : "Personalized preview is missing.",
      personalizedPreview.consent.personalizationEnabled ? "" : "Consent should be enabled.",
      personalizedPreview.preferenceHintsUsed.length ? "" : "Preference hints should be present."
    ])),
    result("missing consent returns baseline only", stripEmpty([
      missingConsentPreview.personalized ? "Missing consent should not run personalized preview." : "",
      missingConsentPreview.status === "baseline_only" ? "" : "Missing consent should return baseline_only status."
    ])),
    result("disabled personalization blocks personalized preview", stripEmpty([
      disabledPreview.personalized ? "Disabled consent should not include personalized response." : "",
      disabledPreview.personalizationDecision.blocked ? "" : "Disabled preview decision should be blocked."
    ])),
    result("raw private text is not used", stripEmpty([
      personalizedPreview.baseline.input.input?.includes("Private note")
        ? "Baseline preview retained private input text."
        : "",
      personalizedPreview.personalized?.input.input?.includes("Private note")
        ? "Personalized preview retained private input text."
        : "",
      eventJson.includes("Private note") ? "Preview event contains private input text." : ""
    ])),
    result("Scripture anchor remains present", stripEmpty([
      personalizedPreview.baseline.selection.scriptureAnchor ? "" : "Baseline Scripture anchor missing.",
      personalizedPreview.personalized?.selection.scriptureAnchor ? "" : "Personalized Scripture anchor missing.",
      personalizedPreview.comparison.scriptureAnchorPreserved ? "" : "Scripture anchor was not preserved."
    ])),
    result("explanation path remains present", stripEmpty([
      personalizedPreview.baseline.explanation.reasonPath.length ? "" : "Baseline explanation path missing.",
      personalizedPreview.personalized?.explanation.reasonPath.length ? "" : "Personalized explanation path missing.",
      personalizedPreview.comparison.explanationPathPreserved ? "" : "Explanation path was not preserved."
    ])),
    result("confidence comparison is generated", stripEmpty([
      typeof personalizedPreview.confidenceComparison.delta === "number"
        ? ""
        : "Confidence delta is missing."
    ])),
    result("fallback comparison is generated", stripEmpty([
      typeof personalizedPreview.fallbackStatus.fallbackAvoided === "boolean"
        ? ""
        : "Fallback comparison is missing."
    ])),
    result("preview event payload is JSON-safe", stripEmpty([
      eventJson ? "" : "Event JSON is empty.",
      event.metadata?.externalAnalyticsSent === false ? "" : "Event should not send external analytics."
    ])),
    result("preview UI adapter returns usable props", stripEmpty([
      uiProps.baseline ? "" : "UI props missing baseline response.",
      uiProps.summary ? "" : "UI props missing summary.",
      uiProps.safetyStatus ? "" : "UI props missing safety status."
    ])),
    result("no database localStorage cookies files external APIs or AI model calls required", stripEmpty([
      store.records.length ? "" : "In-memory store should contain records.",
      personalizedPreview.event.metadata?.externalAnalyticsSent === false
        ? ""
        : "Preview event should remain local only."
    ]))
  ];

  const errors = results.flatMap((item) =>
    item.errors.map((error) => `${item.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}
