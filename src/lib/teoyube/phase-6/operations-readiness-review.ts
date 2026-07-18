import type {
  TeoyubeOperationsReadinessArea,
  TeoyubeOperationsReadinessBlocker,
  TeoyubeOperationsReadinessCheck,
  TeoyubeOperationsReadinessDecision,
  TeoyubeOperationsReadinessReport,
  TeoyubeOperationsReadinessResult,
  TeoyubeOperationsReadinessStatus,
  TeoyubeOperationsReadinessWarning
} from "./operations-readiness-contracts";

export type TeoyubeOperationsReadinessInput = Partial<{
  participantWorkflowManual: boolean;
  communicationBoundariesClear: boolean;
  feedbackBoundariesManual: boolean;
  issueIntakeManualStructured: boolean;
  operationsChecklistAvailable: boolean;
  pauseRollbackCriteriaAvailable: boolean;
  knownLimitationsAvailable: boolean;
  ownerReviewPathExists: boolean;
  automaticUserContactExists: boolean;
  automaticFeedbackCollectionExists: boolean;
  externalServicesRequired: boolean;
  privacyConsentVisible: boolean;
  scriptureExplanationFallbackProtected: boolean;
  mobileAccessibilityReviewAvailable: boolean;
}>;

function check(id: string, area: TeoyubeOperationsReadinessArea, label: string, details: string): TeoyubeOperationsReadinessCheck {
  return { id, area, label, required: true, details };
}

function result(checkId: string, area: TeoyubeOperationsReadinessArea, passed: boolean, notes: string, warning = false): TeoyubeOperationsReadinessResult {
  return { id: `${checkId}_result`, area, checkId, passed, warning, notes };
}

export function createOperationsReadinessChecklist(): TeoyubeOperationsReadinessCheck[] {
  return [
    check("participant_workflow_manual", "participant_workflow", "Participant workflow is manual", "Participant identification and instruction remain outside code."),
    check("communication_boundaries_clear", "communication_boundaries", "Communication boundaries are clear", "Code does not send emails, SMS, notifications, analytics, or external messages."),
    check("feedback_boundaries_manual", "feedback_boundaries", "Feedback boundaries are manual", "Feedback is not collected automatically and sensitive text is not persisted."),
    check("issue_intake_manual_structured", "issue_intake", "Issue intake is manual and structured", "Issue categories, severity, blockers, and owner routing remain available."),
    check("operations_checklist_available", "operations_checklist", "Operations checklist is available", "Pre/during/post, pause, rollback, and owner-review checklists are available."),
    check("pause_rollback_available", "pause_rollback", "Pause/rollback criteria are available", "Pause and rollback are decision support only."),
    check("service_disabled_state_locked", "service_disabled_state", "Disabled-service state is locked", "No service provider is required or connected."),
    check("privacy_consent_visible", "privacy_consent", "Privacy/consent remains visible", "Privacy notices, consent boundaries, and sensitive-info warnings remain visible."),
    check("scripture_explanation_fallback_protected", "scripture_explanation_fallback", "Scripture/explanation/fallback remains protected", "Scripture anchors, explanation paths, safe fallbacks, and confidence labels remain visible."),
    check("mobile_accessibility_review_available", "mobile_accessibility", "Mobile/accessibility review is available", "Mobile, list fallback, readable labels, and accessibility basics have owner-review paths."),
    check("known_limitations_available", "known_limitations", "Known limitations are available", "Known limitations are available before controlled beta execution readiness review."),
    check("owner_review_path_exists", "owner_review", "Owner review path exists", "Owner review can accept, block, defer, or route items to Phase 6.4.")
  ];
}

export function validateOperationsParticipantWorkflow(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessResult {
  return result("participant_workflow_manual", "participant_workflow", input.participantWorkflowManual !== false && !input.automaticUserContactExists, "Participant workflow remains manual and code contacts nobody.");
}

export function validateOperationsCommunicationBoundaries(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessResult {
  return result("communication_boundaries_clear", "communication_boundaries", input.communicationBoundariesClear !== false && !input.automaticUserContactExists, "Communication boundaries remain clear and no messages are sent by code.");
}

export function validateOperationsFeedbackBoundaries(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessResult {
  return result("feedback_boundaries_manual", "feedback_boundaries", input.feedbackBoundariesManual !== false && !input.automaticFeedbackCollectionExists, "Feedback remains manual, simulated, and privacy-protective.");
}

export function validateOperationsIssueIntake(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessResult {
  return result("issue_intake_manual_structured", "issue_intake", input.issueIntakeManualStructured !== false, "Issue intake remains manual, categorized, and structured.");
}

export function validateOperationsPauseRollback(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessResult {
  return result("pause_rollback_available", "pause_rollback", input.pauseRollbackCriteriaAvailable !== false, "Pause/rollback criteria remain available as manual decision support.");
}

export function validateOperationsKnownLimitations(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessResult {
  return result("known_limitations_available", "known_limitations", input.knownLimitationsAvailable !== false, "Known limitations remain available.");
}

function allResults(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessResult[] {
  return [
    validateOperationsParticipantWorkflow(input),
    validateOperationsCommunicationBoundaries(input),
    validateOperationsFeedbackBoundaries(input),
    validateOperationsIssueIntake(input),
    result("operations_checklist_available", "operations_checklist", input.operationsChecklistAvailable !== false, "Operations checklist remains available."),
    validateOperationsPauseRollback(input),
    result("service_disabled_state_locked", "service_disabled_state", !input.externalServicesRequired, "No external services are required."),
    result("privacy_consent_visible", "privacy_consent", input.privacyConsentVisible !== false, "Privacy/consent notices remain visible."),
    result("scripture_explanation_fallback_protected", "scripture_explanation_fallback", input.scriptureExplanationFallbackProtected !== false, "Scripture anchors, explanation traces, fallback, and confidence boundaries remain protected."),
    result("mobile_accessibility_review_available", "mobile_accessibility", input.mobileAccessibilityReviewAvailable !== false, "Mobile/accessibility review remains available."),
    validateOperationsKnownLimitations(input),
    result("owner_review_path_exists", "owner_review", input.ownerReviewPathExists !== false, "Owner review path remains available.")
  ];
}

export function getOperationsReadinessBlockers(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessBlocker[] {
  return allResults(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({
      id: `${entry.checkId}_blocker`,
      area: entry.area,
      message: `${entry.notes} failed.`,
      requiredAction: "Restore manual, privacy-protective, service-disabled operations readiness before Phase 6.4."
    }));
}

export function getOperationsReadinessWarnings(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessWarning[] {
  return allResults(input)
    .filter((entry) => entry.warning)
    .map((entry) => ({
      id: `${entry.checkId}_warning`,
      area: entry.area,
      message: entry.notes,
      recommendedAction: "Review before Phase 6.4 owner lock."
    }));
}

export function createOperationsReadinessDecision(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessDecision {
  const blockers = getOperationsReadinessBlockers(input);
  const warnings = getOperationsReadinessWarnings(input);
  if (blockers.length) return "blocked";
  if (warnings.length) return "operations_ready_with_warnings";
  return "operations_ready";
}

function statusFromDecision(decision: TeoyubeOperationsReadinessDecision): TeoyubeOperationsReadinessStatus {
  if (decision === "operations_ready") return "ready";
  if (decision === "operations_ready_with_warnings") return "ready_with_warnings";
  if (decision === "owner_review_required") return "needs_owner_review";
  if (decision === "blocked") return "blocked";
  return "unknown";
}

export function createOperationsReadinessReport(input: TeoyubeOperationsReadinessInput = {}): TeoyubeOperationsReadinessReport {
  const decision = createOperationsReadinessDecision(input);
  return {
    valid: decision !== "blocked",
    status: statusFromDecision(decision),
    decision,
    checks: createOperationsReadinessChecklist(),
    results: allResults(input),
    blockers: getOperationsReadinessBlockers(input),
    warnings: getOperationsReadinessWarnings(input),
    manualOnly: true,
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
