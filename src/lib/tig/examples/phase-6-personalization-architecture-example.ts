import {
  createTeoyubeLearningSignal,
  createTeoyubeLearningSummary,
  groupLearningSignalsByPattern
} from "../ai-learning-architecture";
import {
  createPersonalizationContext,
  getPersonalizedTigRecommendationHints,
  runTeoyubePersonalizationPreview
} from "../personalization-engine";
import {
  validatePersonalizationConsent,
  sanitizePersonalizationSignal
} from "../personalization-safety";
import {
  createSignalFromProductionInput,
  createSignalFromProductionResponse,
  createSignalFromSurfaceEvent
} from "../personalization-signals";
import {
  createPersonalizationAwareEvent,
  createPersonalizedProductionExplanation,
  runPersonalizedTeoyubeProductionPreview
} from "../personalized-production-bridge";
import { runPrayerTigProduction } from "../production-surface-runner";

export function runPhase6PersonalizationArchitectureExample() {
  const productionInput = {
    input: "I keep coming back to prayer for courage and calling.",
    userState: "seeking courage and calling clarity",
    emotion: "fear",
    intent: "seeking_calling",
    surface: "prayer" as const,
    selectedWordId: "word_courage",
    selectedClusterId: "cluster_courage_through_presence"
  };
  const productionResponse = runPrayerTigProduction(productionInput);
  const consent = validatePersonalizationConsent({
    personalizationEnabled: true,
    learningEnabled: true,
    allowRawTextStorage: false,
    allowedScopes: ["signals", "preferences", "journey_progress", "feedback"],
    source: "user",
    updatedAt: new Date().toISOString()
  });
  const inputSignal = createSignalFromProductionInput(productionInput);
  const responseSignal = createSignalFromProductionResponse(productionResponse);
  const eventSignal = createSignalFromSurfaceEvent(productionResponse.event);
  const sanitizedSignals = [inputSignal, responseSignal, eventSignal].map(
    sanitizePersonalizationSignal
  );
  const learningSignal = createTeoyubeLearningSignal(productionInput, productionResponse);
  const groupedLearningSignals = groupLearningSignalsByPattern(sanitizedSignals);
  const learningSummary = createTeoyubeLearningSummary(sanitizedSignals);
  const personalizationContext = createPersonalizationContext({
    input: productionInput,
    consent,
    signals: sanitizedSignals,
    learningSignals: [learningSignal]
  });
  const personalizationPreview = runTeoyubePersonalizationPreview(
    productionInput,
    personalizationContext
  );
  const personalizationHints = getPersonalizedTigRecommendationHints(personalizationContext);
  const personalizationExplanation = createPersonalizedProductionExplanation(
    productionResponse,
    personalizationPreview.decision
  );
  const personalizationAwareEvent = createPersonalizationAwareEvent(
    productionInput,
    productionResponse,
    personalizationPreview.decision
  );
  const bridgedPreview = runPersonalizedTeoyubeProductionPreview(
    productionInput,
    personalizationContext
  );

  return {
    productionInput,
    productionResponse,
    consent,
    signals: sanitizedSignals,
    learningSignal,
    groupedLearningSignals,
    learningSummary,
    personalizationContext,
    personalizationHints,
    personalizationPreview,
    personalizationExplanation,
    personalizationAwareEvent,
    bridgedPreview
  };
}
