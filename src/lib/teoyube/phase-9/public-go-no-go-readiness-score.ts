import type {
  TeoyubePublicGoNoGoReadinessScoreArea,
  TeoyubePublicGoNoGoReadinessScoreBand,
  TeoyubePublicGoNoGoReadinessScoreBlocker,
  TeoyubePublicGoNoGoReadinessScoreDecision,
  TeoyubePublicGoNoGoReadinessScoreInput,
  TeoyubePublicGoNoGoReadinessScoreReport,
  TeoyubePublicGoNoGoReadinessScoreResult,
  TeoyubePublicGoNoGoReadinessScoreWarning
} from "./public-go-no-go-readiness-score-contracts";

export const PUBLIC_GO_NO_GO_READINESS_SCORE_AREAS: TeoyubePublicGoNoGoReadinessScoreArea[] = [
  "release_candidate_qa",
  "fix_queue",
  "remediation",
  "final_regression_qa",
  "public_copy",
  "privacy_consent",
  "sensitive_data_warning",
  "known_limitations",
  "scripture_anchor",
  "explanation_trace",
  "fallback",
  "confidence_label",
  "reviewed_content_gate",
  "service_disabled_state",
  "support_readiness",
  "feedback_readiness",
  "issue_triage",
  "manual_monitoring",
  "mobile",
  "accessibility",
  "performance_manual",
  "owner_review"
];

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function hasCriticalBlocker(input: TeoyubePublicGoNoGoReadinessScoreInput = {}): boolean {
  return Boolean(
    (input.criticalBlockers || 0) > 0 ||
      input.missingScriptureAnchors ||
      input.missingExplanationTraces ||
      input.unsafeFallback ||
      input.missingPrivacyConsent ||
      input.missingSensitiveDataWarning ||
      input.reviewOnlyContentVisible ||
      input.disabledServiceEnabled ||
      input.publicLaunchFromCode ||
      input.automaticUserContactEnabled ||
      input.automaticFeedbackCollectionEnabled ||
      input.automaticPublicUrlFetchingEnabled ||
      input.databasePersistenceEnabled ||
      input.analyticsEnabled ||
      input.monitoringProviderConnected ||
      input.liveAiEnabled
  );
}

export function calculatePublicGoNoGoReadinessScoreByArea(input: TeoyubePublicGoNoGoReadinessScoreInput = {}, area: TeoyubePublicGoNoGoReadinessScoreArea): TeoyubePublicGoNoGoReadinessScoreResult {
  const explicitScore = input.areaScores?.[area];
  let score = explicitScore ?? 100;
  const notes = [`${area} starts from ${score}.`];
  let blocker = false;

  if (area === "scripture_anchor" && input.missingScriptureAnchors) {
    score = 0;
    blocker = true;
    notes.push("Missing Scripture anchors block public go/no-go readiness.");
  }
  if (area === "explanation_trace" && input.missingExplanationTraces) {
    score = 0;
    blocker = true;
    notes.push("Missing explanation traces block public go/no-go readiness.");
  }
  if (area === "fallback" && input.unsafeFallback) {
    score = 0;
    blocker = true;
    notes.push("Unsafe fallback blocks public go/no-go readiness.");
  }
  if (area === "confidence_label" && input.missingConfidenceLabels) {
    score = Math.min(score, 65);
    notes.push("Missing confidence labels heavily penalize readiness.");
  }
  if (area === "privacy_consent" && input.missingPrivacyConsent) {
    score = 0;
    blocker = true;
    notes.push("Missing privacy/consent notice blocks readiness.");
  }
  if (area === "sensitive_data_warning" && input.missingSensitiveDataWarning) {
    score = 0;
    blocker = true;
    notes.push("Missing sensitive data warning blocks readiness.");
  }
  if (area === "known_limitations" && input.missingKnownLimitations) {
    score = Math.min(score, 45);
    blocker = true;
    notes.push("Missing known limitations blocks or heavily penalizes readiness.");
  }
  if (area === "reviewed_content_gate" && input.reviewOnlyContentVisible) {
    score = 0;
    blocker = true;
    notes.push("Review-only content appearing live blocks readiness.");
  }
  if (area === "service_disabled_state" && (input.disabledServiceEnabled || input.databasePersistenceEnabled || input.analyticsEnabled || input.monitoringProviderConnected || input.liveAiEnabled)) {
    score = 0;
    blocker = true;
    notes.push("Enabled disabled service blocks readiness.");
  }
  if (area === "manual_monitoring" && input.automaticPublicUrlFetchingEnabled) {
    score = 0;
    blocker = true;
    notes.push("Automatic public URL fetching blocks readiness.");
  }
  if (area === "feedback_readiness" && input.automaticFeedbackCollectionEnabled) {
    score = 0;
    blocker = true;
    notes.push("Automatic feedback collection blocks readiness.");
  }
  if (area === "support_readiness" && input.automaticUserContactEnabled) {
    score = 0;
    blocker = true;
    notes.push("Automatic user contact blocks readiness.");
  }
  if (area === "release_candidate_qa" && input.publicLaunchFromCode) {
    score = 0;
    blocker = true;
    notes.push("Public launch from code blocks readiness.");
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

export function calculatePublicGoNoGoReadinessScore(input: TeoyubePublicGoNoGoReadinessScoreInput = {}): number {
  if (hasCriticalBlocker(input)) return 0;
  const results = PUBLIC_GO_NO_GO_READINESS_SCORE_AREAS.map((area) => calculatePublicGoNoGoReadinessScoreByArea(input, area));
  return clampScore(results.reduce((sum, entry) => sum + entry.score, 0) / results.length);
}

export function getPublicGoNoGoReadinessScoreBand(score: number): TeoyubePublicGoNoGoReadinessScoreBand {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 50) return "needs_improvement";
  return "blocked";
}

export function getPublicGoNoGoReadinessScoreBlockers(input: TeoyubePublicGoNoGoReadinessScoreInput = {}): TeoyubePublicGoNoGoReadinessScoreBlocker[] {
  const blockers = PUBLIC_GO_NO_GO_READINESS_SCORE_AREAS
    .map((area) => calculatePublicGoNoGoReadinessScoreByArea(input, area))
    .filter((entry) => entry.blocker)
    .map((entry) => ({ id: `${entry.area}_go_no_go_blocker`, area: entry.area, message: entry.notes.join(" ") }));
  return [
    ...((input.criticalBlockers || 0) > 0 ? [{ id: "critical_go_no_go_blockers_present", area: "unknown" as const, message: `${input.criticalBlockers} critical blocker(s) are present.` }] : []),
    ...blockers
  ];
}

export function getPublicGoNoGoReadinessScoreWarnings(input: TeoyubePublicGoNoGoReadinessScoreInput = {}): TeoyubePublicGoNoGoReadinessScoreWarning[] {
  return [
    { id: "go_no_go_score_manual", area: "unknown", message: "Public go/no-go readiness score is an in-memory manual decision aid, not a launch action." },
    ...(input.missingConfidenceLabels ? [{ id: "confidence_label_warning", area: "confidence_label" as const, message: "Missing confidence labels heavily penalize readiness." }] : [])
  ];
}

export function createPublicGoNoGoReadinessScoreDecision(input: TeoyubePublicGoNoGoReadinessScoreInput = {}): TeoyubePublicGoNoGoReadinessScoreDecision {
  const blockers = getPublicGoNoGoReadinessScoreBlockers(input);
  if (blockers.length) return "blocked";
  const score = calculatePublicGoNoGoReadinessScore(input);
  if (score >= 90) return "ready_for_phase_9_4";
  if (score >= 75) return "ready_with_warnings";
  return "needs_improvement";
}

export function createPublicGoNoGoReadinessScoreReport(input: TeoyubePublicGoNoGoReadinessScoreInput = {}): TeoyubePublicGoNoGoReadinessScoreReport {
  const blockers = getPublicGoNoGoReadinessScoreBlockers(input);
  const score = blockers.length ? 0 : calculatePublicGoNoGoReadinessScore(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : getPublicGoNoGoReadinessScoreWarnings(input).length ? "scored_with_warnings" : "scored",
    score,
    band: blockers.length ? "blocked" : getPublicGoNoGoReadinessScoreBand(score),
    decision: createPublicGoNoGoReadinessScoreDecision(input),
    results: PUBLIC_GO_NO_GO_READINESS_SCORE_AREAS.map((area) => calculatePublicGoNoGoReadinessScoreByArea(input, area)),
    blockers,
    warnings: getPublicGoNoGoReadinessScoreWarnings(input),
    noPublicLaunchPerformed: true,
    noAutomaticUserContact: true,
    noAutomaticFeedbackCollection: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
