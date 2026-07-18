import type { TeoyubePersonalizationFeedback } from "./personalization-feedback-contracts";
import { sanitizePersonalizationFeedback } from "./personalization-feedback-engine";
import type { TeoyubePersonalizationConsent } from "./personalization-contracts";
import type {
  TeoyubePreferenceHint,
  TeoyubePreferenceProfile
} from "./personalization-preference-contracts";

function feedbackTarget(feedback: TeoyubePersonalizationFeedback): string | undefined {
  return feedback.target.id || feedback.target.label;
}

export function reducePreferenceHintFromFeedback(
  hint: TeoyubePreferenceHint,
  feedbackInput: Partial<TeoyubePersonalizationFeedback>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePreferenceHint {
  const feedback = sanitizePersonalizationFeedback(feedbackInput, consent);
  const target = feedbackTarget(feedback);
  const matches = target
    ? hint.key.includes(target) || hint.value === target || hint.label === target
    : true;

  if (!matches || !["less_like_this", "not_relevant", "dismiss_recommendation"].includes(feedback.type)) {
    return hint;
  }

  return {
    ...hint,
    confidence: Math.max(0, hint.confidence - 0.35),
    explanation: `${hint.explanation} Reduced by explicit user feedback.`
  };
}

export function applyFeedbackToPreferenceHints(
  hints: TeoyubePreferenceHint[],
  feedbackInput: Partial<TeoyubePersonalizationFeedback>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePreferenceHint[] {
  return hints
    .map((hint) => reducePreferenceHintFromFeedback(hint, feedbackInput, consent))
    .filter((hint) => hint.confidence > 0.2);
}

export function applyFeedbackToPreferenceProfile(
  profile: TeoyubePreferenceProfile,
  feedback: Partial<TeoyubePersonalizationFeedback>
): TeoyubePreferenceProfile {
  return {
    ...profile,
    hints: applyFeedbackToPreferenceHints(profile.hints, feedback, profile.consent),
    updatedAt: new Date().toISOString()
  };
}

export function createPreferenceFeedbackSummary(
  before: TeoyubePreferenceHint[],
  after: TeoyubePreferenceHint[]
): {
  beforeCount: number;
  afterCount: number;
  removedCount: number;
  explanation: string;
} {
  return {
    beforeCount: before.length,
    afterCount: after.length,
    removedCount: Math.max(0, before.length - after.length),
    explanation:
      "Preference feedback summary reflects explicit user control over soft preview hints."
  };
}
