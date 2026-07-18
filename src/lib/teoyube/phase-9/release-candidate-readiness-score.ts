import type {
  TeoyubeReleaseCandidateReadinessScoreArea,
  TeoyubeReleaseCandidateReadinessScoreBand,
  TeoyubeReleaseCandidateReadinessScoreBlocker,
  TeoyubeReleaseCandidateReadinessScoreDecision,
  TeoyubeReleaseCandidateReadinessScoreInput,
  TeoyubeReleaseCandidateReadinessScoreReport,
  TeoyubeReleaseCandidateReadinessScoreResult,
  TeoyubeReleaseCandidateReadinessScoreWarning
} from "./release-candidate-readiness-score-contracts";

export const RELEASE_CANDIDATE_READINESS_SCORE_AREAS: TeoyubeReleaseCandidateReadinessScoreArea[] = [
  "public_candidate_qa",
  "manual_monitoring",
  "support_readiness",
  "feedback_readiness",
  "issue_triage",
  "scripture_anchor",
  "explanation_trace",
  "fallback",
  "confidence_label",
  "privacy_consent",
  "service_disabled_state",
  "reviewed_content_gate",
  "mobile",
  "accessibility",
  "known_limitations",
  "owner_review"
];

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function hasCriticalBlocker(input: TeoyubeReleaseCandidateReadinessScoreInput = {}): boolean {
  return Boolean(
    (input.criticalBlockers || 0) > 0 ||
      input.missingScriptureAnchors ||
      input.missingExplanationTraces ||
      input.unsafeFallback ||
      input.reviewOnlyContentVisible ||
      input.disabledServiceEnabled ||
      input.privacyConsentBlocker ||
      input.automaticFeedbackCollectionEnabled ||
      input.automaticUserContactEnabled
  );
}

export function calculateReleaseCandidateReadinessScoreByArea(input: TeoyubeReleaseCandidateReadinessScoreInput = {}, area: TeoyubeReleaseCandidateReadinessScoreArea): TeoyubeReleaseCandidateReadinessScoreResult {
  const explicitScore = input.areaScores?.[area];
  let score = explicitScore ?? 100;
  const notes: string[] = [`${area} starts from ${score}.`];
  let blocker = false;

  if (area === "scripture_anchor" && input.missingScriptureAnchors) {
    score = 0;
    blocker = true;
    notes.push("Missing Scripture anchors block public candidate readiness.");
  }
  if (area === "explanation_trace" && input.missingExplanationTraces) {
    score = 0;
    blocker = true;
    notes.push("Missing explanation traces block public candidate readiness.");
  }
  if (area === "fallback" && input.unsafeFallback) {
    score = 0;
    blocker = true;
    notes.push("Unsafe fallback blocks public candidate readiness.");
  }
  if (area === "confidence_label" && input.missingConfidenceLabels) {
    score = Math.min(score, 65);
    notes.push("Missing confidence labels heavily penalize readiness.");
  }
  if (area === "reviewed_content_gate" && input.reviewOnlyContentVisible) {
    score = 0;
    blocker = true;
    notes.push("Review-only content visible live blocks readiness.");
  }
  if (area === "service_disabled_state" && input.disabledServiceEnabled) {
    score = 0;
    blocker = true;
    notes.push("Enabled disabled service blocks readiness.");
  }
  if (area === "privacy_consent" && input.privacyConsentBlocker) {
    score = 0;
    blocker = true;
    notes.push("Privacy/consent blocker blocks readiness.");
  }
  if (area === "manual_monitoring" && input.automaticUserContactEnabled) {
    score = 0;
    blocker = true;
    notes.push("Automatic user contact blocks readiness.");
  }
  if (area === "feedback_readiness" && input.automaticFeedbackCollectionEnabled) {
    score = 0;
    blocker = true;
    notes.push("Automatic feedback collection blocks readiness.");
  }
  if (area === "mobile" && input.mobileBlocker) {
    score = Math.min(score, 49);
    blocker = true;
    notes.push("Critical mobile blocker blocks readiness.");
  }
  if (area === "accessibility" && input.accessibilityBlocker) {
    score = Math.min(score, 49);
    blocker = true;
    notes.push("Critical accessibility blocker blocks readiness.");
  }

  return { area, score: clampScore(score), blocker, notes };
}

export function calculateReleaseCandidateReadinessScore(input: TeoyubeReleaseCandidateReadinessScoreInput = {}): number {
  if (hasCriticalBlocker(input)) return 0;
  const results = RELEASE_CANDIDATE_READINESS_SCORE_AREAS.map((area) => calculateReleaseCandidateReadinessScoreByArea(input, area));
  const total = results.reduce((sum, entry) => sum + entry.score, 0);
  return clampScore(total / results.length);
}

export function getReleaseCandidateReadinessScoreBand(score: number): TeoyubeReleaseCandidateReadinessScoreBand {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 50) return "needs_improvement";
  return "blocked";
}

export function getReleaseCandidateReadinessScoreBlockers(input: TeoyubeReleaseCandidateReadinessScoreInput = {}): TeoyubeReleaseCandidateReadinessScoreBlocker[] {
  const resultBlockers = RELEASE_CANDIDATE_READINESS_SCORE_AREAS
    .map((area) => calculateReleaseCandidateReadinessScoreByArea(input, area))
    .filter((entry) => entry.blocker)
    .map((entry) => ({ id: `${entry.area}_score_blocker`, area: entry.area, message: entry.notes.join(" ") }));
  return [
    ...((input.criticalBlockers || 0) > 0 ? [{ id: "critical_blockers_present", area: "unknown" as const, message: `${input.criticalBlockers} critical blocker(s) are present.` }] : []),
    ...resultBlockers
  ];
}

export function getReleaseCandidateReadinessScoreWarnings(input: TeoyubeReleaseCandidateReadinessScoreInput = {}): TeoyubeReleaseCandidateReadinessScoreWarning[] {
  return [
    { id: "readiness_score_manual", area: "unknown", message: "Readiness score is an in-memory manual decision aid and not a public go/no-go by itself." },
    ...(input.missingConfidenceLabels ? [{ id: "confidence_label_penalty", area: "confidence_label" as const, message: "Missing confidence labels heavily penalize readiness." }] : [])
  ];
}

export function createReleaseCandidateReadinessScoreDecision(input: TeoyubeReleaseCandidateReadinessScoreInput = {}): TeoyubeReleaseCandidateReadinessScoreDecision {
  const blockers = getReleaseCandidateReadinessScoreBlockers(input);
  if (blockers.length) return "blocked";
  const score = calculateReleaseCandidateReadinessScore(input);
  if (score >= 90) return "ready_for_phase_9_3";
  if (score >= 75) return "ready_with_warnings";
  return "needs_improvement";
}

export function createReleaseCandidateReadinessScoreReport(input: TeoyubeReleaseCandidateReadinessScoreInput = {}): TeoyubeReleaseCandidateReadinessScoreReport {
  const results = RELEASE_CANDIDATE_READINESS_SCORE_AREAS.map((area) => calculateReleaseCandidateReadinessScoreByArea(input, area));
  const blockers = getReleaseCandidateReadinessScoreBlockers(input);
  const score = blockers.length ? 0 : calculateReleaseCandidateReadinessScore(input);
  const band = blockers.length ? "blocked" : getReleaseCandidateReadinessScoreBand(score);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : getReleaseCandidateReadinessScoreWarnings(input).length ? "scored_with_warnings" : "scored",
    score,
    band,
    decision: createReleaseCandidateReadinessScoreDecision(input),
    results,
    blockers,
    warnings: getReleaseCandidateReadinessScoreWarnings(input),
    noPublicLaunchPerformed: true,
    noAutomaticUserContact: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
