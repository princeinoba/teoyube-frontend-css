import type {
  TeoyubePublicReleaseReadinessArea,
  TeoyubePublicReleaseReadinessBlocker,
  TeoyubePublicReleaseReadinessCheck,
  TeoyubePublicReleaseReadinessDecision,
  TeoyubePublicReleaseReadinessReport,
  TeoyubePublicReleaseReadinessRisk,
  TeoyubePublicReleaseReadinessWarning
} from "./public-release-readiness-gate-contracts";

export type TeoyubePublicReleaseReadinessGateInput = Partial<{
  productHardeningPackageExists: boolean;
  mobileAccessibilityPassExists: boolean;
  performanceReviewExists: boolean;
  privacySecurityReviewExists: boolean;
  serviceDecisionPackageExists: boolean;
  serviceDecisionLocksValid: boolean;
  publicCopyReviewExists: boolean;
  knownLimitationsExist: boolean;
  supportWorkflowManual: boolean;
  feedbackBoundariesManual: boolean;
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsVisible: boolean;
  reviewedContentGateActive: boolean;
  disabledServiceStateExplicit: boolean;
  ownerReviewPathExists: boolean;
  publicLaunchPerformedByCode: boolean;
  externalServiceRequired: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, area: TeoyubePublicReleaseReadinessArea, label: string, passed: boolean, details: string): TeoyubePublicReleaseReadinessCheck {
  return { id, area, label, passed, details, evidence: [{ id: `${id}_evidence`, area, label, details }] };
}

export function createPublicReleaseReadinessGateChecklist(input: TeoyubePublicReleaseReadinessGateInput = {}): TeoyubePublicReleaseReadinessCheck[] {
  return [
    check("product_hardening_package", "product_hardening", "Product hardening package exists", flag(input.productHardeningPackageExists), "Phase 8.2 product hardening package is available."),
    check("mobile_accessibility_pass", "mobile_accessibility", "Mobile/accessibility pass exists", flag(input.mobileAccessibilityPassExists), "Mobile/accessibility hardening review is available."),
    check("performance_review", "performance_review", "Performance review exists", flag(input.performanceReviewExists), "Manual/static performance review is available."),
    check("privacy_security_review", "privacy_security", "Privacy/security review exists", flag(input.privacySecurityReviewExists), "Phase 8.3 privacy/security review exists."),
    check("service_decision_package", "controlled_service_decisions", "Service decision package exists", flag(input.serviceDecisionPackageExists), "Controlled service decision package exists."),
    check("service_decision_locks", "service_disabled_state", "Service decision locks valid", flag(input.serviceDecisionLocksValid), "Service decision lock validator keeps services disabled."),
    check("public_copy_review", "public_copy", "Public copy review exists", flag(input.publicCopyReviewExists), "Consent/public copy review exists."),
    check("known_limitations", "known_limitations", "Known limitations exist", flag(input.knownLimitationsExist), "Known limitations are available."),
    check("manual_support", "support_workflow", "Support workflow remains manual", flag(input.supportWorkflowManual), "Support remains manual."),
    check("manual_feedback", "manual_feedback_boundaries", "Feedback boundaries remain manual", flag(input.feedbackBoundariesManual), "Feedback remains manual."),
    check("scripture_anchor", "scripture_anchor", "Scripture anchors visible", flag(input.scriptureAnchorsVisible), "Scripture anchors remain visible."),
    check("explanation_trace", "explanation_trace", "Explanation traces visible", flag(input.explanationTracesVisible), "Explanation traces remain visible."),
    check("fallback_safe", "fallback", "Fallback safe", flag(input.fallbackSafe), "Fallback remains safe and non-empty."),
    check("confidence_visible", "confidence_label", "Confidence labels visible", flag(input.confidenceLabelsVisible), "Confidence labels remain humble and visible."),
    check("reviewed_content_gate", "reviewed_content_gate", "Reviewed content gate active", flag(input.reviewedContentGateActive), "Review-only content remains gated."),
    check("disabled_service_state", "service_disabled_state", "Disabled service state explicit", flag(input.disabledServiceStateExplicit), "Disabled service state remains explicit."),
    check("owner_review_path", "owner_review", "Owner review path exists", flag(input.ownerReviewPathExists), "Owner review path exists."),
    check("no_public_launch_from_code", "unknown", "No public launch from code", !input.publicLaunchPerformedByCode, "Phase 8.3 does not launch publicly."),
    check("no_external_service_required", "controlled_service_decisions", "No external service required", !input.externalServiceRequired, "No external service is required for safe render.")
  ];
}

export function evaluatePublicReleaseReadinessGate(input: TeoyubePublicReleaseReadinessGateInput = {}): TeoyubePublicReleaseReadinessCheck[] {
  return createPublicReleaseReadinessGateChecklist(input);
}

export function getPublicReleaseReadinessGateBlockers(input: TeoyubePublicReleaseReadinessGateInput = {}): TeoyubePublicReleaseReadinessBlocker[] {
  return createPublicReleaseReadinessGateChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: `${entry.label} is incomplete.`, requiredAction: "Resolve before public release candidate planning." }));
}

export function getPublicReleaseReadinessGateWarnings(input: TeoyubePublicReleaseReadinessGateInput = {}): TeoyubePublicReleaseReadinessWarning[] {
  return [
    { id: "readiness_gate_planning_only", area: "unknown", message: "Readiness gate is planning-only and performs no public launch.", recommendedAction: "Use Phase 8.4 for release candidate planning only after owner review." },
    ...(!input.ownerReviewPathExists ? [{ id: "owner_review_warning", area: "owner_review" as const, message: "Owner review path should be confirmed.", recommendedAction: "Review Phase 8.3 package manually." }] : [])
  ];
}

export function getPublicReleaseReadinessGateRisks(): TeoyubePublicReleaseReadinessRisk[] {
  return [
    { id: "public_release_privacy_risk", area: "privacy_security", severity: "high", message: "Public release can increase sensitive-data and consent risk.", mitigation: "Keep services disabled and complete privacy/security review before release decisions." },
    { id: "service_activation_risk", area: "controlled_service_decisions", severity: "high", message: "Future service activation can create persistence, analytics, monitoring, or AI safety risk.", mitigation: "Require owner/privacy/security/cost/rollback gates." },
    { id: "spiritual_guidance_risk", area: "scripture_anchor", severity: "medium", message: "Public guidance must not overclaim divine certainty.", mitigation: "Preserve Scripture anchors, explanations, confidence labels, and fallback boundaries." }
  ];
}

export function getPublicReleaseReadinessGateNextActions(input: TeoyubePublicReleaseReadinessGateInput = {}): string[] {
  return getPublicReleaseReadinessGateBlockers(input).length
    ? ["Resolve readiness blockers before Phase 8.4."]
    : ["Proceed to Phase 8.4 public release candidate planning without activating services."];
}

export function createPublicReleaseReadinessGateDecision(input: TeoyubePublicReleaseReadinessGateInput = {}): TeoyubePublicReleaseReadinessDecision {
  const blockers = getPublicReleaseReadinessGateBlockers(input);
  if (blockers.some((entry) => entry.area === "product_hardening" || entry.area === "mobile_accessibility" || entry.area === "performance_review")) return "needs_product_hardening";
  if (blockers.some((entry) => entry.area === "privacy_security" || entry.area === "public_copy" || entry.area === "known_limitations")) return "needs_privacy_security_review";
  if (blockers.some((entry) => entry.area === "controlled_service_decisions" || entry.area === "service_disabled_state")) return "needs_service_decision_review";
  if (blockers.some((entry) => entry.area === "owner_review")) return "needs_owner_review";
  if (blockers.length) return "blocked";
  return getPublicReleaseReadinessGateWarnings(input).length ? "ready_with_warnings" : "ready_for_public_release_candidate_planning";
}

export function createPublicReleaseReadinessGateReport(input: TeoyubePublicReleaseReadinessGateInput = {}): TeoyubePublicReleaseReadinessReport {
  const blockers = getPublicReleaseReadinessGateBlockers(input);
  const warnings = getPublicReleaseReadinessGateWarnings(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decision: createPublicReleaseReadinessGateDecision(input),
    checks: evaluatePublicReleaseReadinessGate(input),
    blockers,
    warnings,
    risks: getPublicReleaseReadinessGateRisks(),
    nextActions: getPublicReleaseReadinessGateNextActions(input),
    noPublicLaunchPerformed: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
