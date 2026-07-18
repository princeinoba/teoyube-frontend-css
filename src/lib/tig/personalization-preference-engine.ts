import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationProfile,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";
import {
  TeoyubePreferenceHint,
  TeoyubePreferenceProfile,
  TeoyubePreferenceDecision,
  TeoyubePreferenceHintType
} from "./personalization-preference-contracts";
import { rankPreferenceHints } from "./personalization-preference-scoring";
import {
  validatePreferenceConsent,
  validatePreferenceHintsSafety
} from "./personalization-preference-safety";

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

function hintFromSignal(signal: TeoyubePersonalizationSignal): TeoyubePreferenceHint[] {
  const hints: TeoyubePreferenceHint[] = [];
  const base = {
    confidence: signal.confidenceScore ?? signal.weight,
    sourceSignalIds: [signal.id],
    softHintOnly: true as const,
    createdAt: now()
  };
  const add = (type: TeoyubePreferenceHintType, key: string, value: string, label: string) => {
    hints.push({
      id: createId("preference_hint"),
      type,
      key,
      value,
      label,
      explanation:
        "Derived from a sanitized structured signal as a soft preview hint.",
      ...base
    });
  };

  if (signal.selectedWordId) add("word_theme", `word:${signal.selectedWordId}`, signal.selectedWordId, signal.selectedWordId);
  if (signal.selectedClusterId) add("promise_cluster", `cluster:${signal.selectedClusterId}`, signal.selectedClusterId, signal.selectedClusterId);
  if (signal.selectedScriptureReference) {
    add("scripture_anchor", `scripture:${signal.selectedScriptureReference}`, signal.selectedScriptureReference, signal.selectedScriptureReference);
  }
  if (signal.surface) add("surface", `surface:${signal.surface}`, signal.surface, signal.surface);
  if (signal.selectedPrayerSequenceId) add("prayer_sequence", `prayer:${signal.selectedPrayerSequenceId}`, signal.selectedPrayerSequenceId, signal.selectedPrayerSequenceId);
  if (signal.selectedActionStepId) add("action_step", `action:${signal.selectedActionStepId}`, signal.selectedActionStepId, signal.selectedActionStepId);
  if (signal.journeyId) add("journey", `journey:${signal.journeyId}`, signal.journeyId, signal.journeyId);
  if (signal.callingId) add("calling", `calling:${signal.callingId}`, signal.callingId, signal.callingId);
  if (signal.fallbackUsed) add("fallback_reduction", "fallback:reduce", "fallback_frequency", "Reduce repeated fallback paths");

  return hints;
}

function mergeHints(hints: TeoyubePreferenceHint[]): TeoyubePreferenceHint[] {
  const merged = new Map<string, TeoyubePreferenceHint>();

  hints.forEach((hint) => {
    const existing = merged.get(hint.key);
    if (!existing) {
      merged.set(hint.key, hint);
      return;
    }
    merged.set(hint.key, {
      ...existing,
      confidence: Math.min(1, Math.max(existing.confidence, hint.confidence)),
      sourceSignalIds: [...new Set([...existing.sourceSignalIds, ...hint.sourceSignalIds])]
    });
  });

  return [...merged.values()];
}

export function createTeoyubePreferenceProfileFromSignals(params: {
  signals: TeoyubePersonalizationSignal[];
  consent?: Partial<TeoyubePersonalizationConsent>;
  userId?: string;
}): TeoyubePreferenceProfile {
  const consentStatus = validatePreferenceConsent(params.consent);
  const hints = consentStatus.allowed
    ? mergeHints(params.signals.flatMap(hintFromSignal))
    : [];

  return {
    id: createId("preference_profile"),
    userId: params.userId,
    consent: consentStatus.consent,
    hints,
    sourceSignalIds: params.signals.map((signal) => signal.id),
    dataStatus: "preview_only",
    updatedAt: now()
  };
}

export function createTeoyubePreferenceProfileFromPersonalizationProfile(
  profile: TeoyubePersonalizationProfile
): TeoyubePreferenceProfile {
  const hints = profile.preferences.map<TeoyubePreferenceHint>((preference) => ({
    id: createId("preference_hint"),
    type: preference.key.startsWith("surface:") ? "surface" : "word_theme",
    key: preference.key,
    value: String(preference.value),
    label: String(preference.value),
    confidence: preference.confidence,
    sourceSignalIds: [],
    softHintOnly: true,
    explanation:
      "Derived from an existing personalization profile preference as a soft preview hint.",
    createdAt: preference.updatedAt
  }));

  return {
    id: createId("preference_profile"),
    userId: profile.userId,
    consent: profile.consent,
    hints,
    sourceSignalIds: [],
    dataStatus: "preview_only",
    updatedAt: profile.updatedAt || now()
  };
}

export function deriveTeoyubePreferenceHints(
  profile: TeoyubePreferenceProfile,
  limit = 6
): TeoyubePreferenceHint[] {
  return rankPreferenceHints(profile.hints)
    .slice(0, limit)
    .map(({ preferenceScore: _preferenceScore, rank: _rank, ...hint }) => hint);
}

export function createTeoyubePreferenceDecision(
  profile: TeoyubePreferenceProfile,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePreferenceDecision {
  const hints = deriveTeoyubePreferenceHints(profile);
  const safety = validatePreferenceHintsSafety(hints, consent || profile.consent);
  const enabled = !safety.blocked;

  return {
    enabled,
    applied: false,
    previewOnly: true,
    hints: enabled ? hints : [],
    blockedReasons: safety.reasons,
    warnings: safety.warnings,
    explanation: enabled
      ? "Preference hints are available as soft preview guidance only."
      : "Preference hints are blocked by consent or safety rules.",
    createdAt: now()
  };
}
