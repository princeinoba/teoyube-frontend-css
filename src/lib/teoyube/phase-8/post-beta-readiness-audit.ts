import { createPhase7CompletionPackage, createPhase7CompletionPackageReport } from "../phase-7/phase-7-completion-package";
import type {
  TeoyubePostBetaReadinessAuditArea,
  TeoyubePostBetaReadinessAuditBlocker,
  TeoyubePostBetaReadinessAuditCheck,
  TeoyubePostBetaReadinessAuditDecision,
  TeoyubePostBetaReadinessAuditReport,
  TeoyubePostBetaReadinessAuditStatus,
  TeoyubePostBetaReadinessAuditWarning,
  TeoyubePostBetaReadinessEvidence,
  TeoyubePostBetaReadinessRisk
} from "./post-beta-readiness-audit-contracts";

export type TeoyubePostBetaReadinessAuditInput = Partial<{
  realBetaPerformedOutsideCodebase: boolean;
  publicLaunchPerformed: boolean;
  betaLaunchPerformed: boolean;
  usersContacted: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlsFetchedAutomatically: boolean;
  externalServicesRequired: boolean;
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  adminAuthAdded: boolean;
  cmsConnected: boolean;
  liveAiOrchestrationEnabled: boolean;
  browserPersistenceRequired: boolean;
  ownerReviewed: boolean;
}>;

function blocker(id: string, area: TeoyubePostBetaReadinessAuditArea, message: string, requiredAction = "Resolve before Phase 8.2 product hardening execution."): TeoyubePostBetaReadinessAuditBlocker {
  return { id, area, message, requiredAction };
}

function warning(id: string, area: TeoyubePostBetaReadinessAuditArea, message: string, recommendedAction = "Carry into Phase 8.2 planning."): TeoyubePostBetaReadinessAuditWarning {
  return { id, area, message, recommendedAction };
}

function check(id: string, area: TeoyubePostBetaReadinessAuditArea, label: string, passed: boolean, details: string, warnings: TeoyubePostBetaReadinessAuditWarning[] = []): TeoyubePostBetaReadinessAuditCheck {
  return {
    id,
    area,
    label,
    passed,
    details,
    blockers: passed ? [] : [blocker(`${id}_blocker`, area, `${label} is incomplete.`)],
    warnings
  };
}

function evidence(id: string, area: TeoyubePostBetaReadinessAuditArea, source: string, status: TeoyubePostBetaReadinessEvidence["status"], details: string): TeoyubePostBetaReadinessEvidence {
  return { id, area, source, status, details, noRealBetaResultClaimed: true };
}

function risk(id: string, area: TeoyubePostBetaReadinessAuditArea, severity: TeoyubePostBetaReadinessRisk["severity"], message: string, mitigation: string): TeoyubePostBetaReadinessRisk {
  return { id, area, severity, message, mitigation };
}

export function createPostBetaReadinessAuditChecklist(input: TeoyubePostBetaReadinessAuditInput = {}): TeoyubePostBetaReadinessAuditCheck[] {
  const phase7Package = createPhase7CompletionPackage({ ownerReviewed: true });
  const phase7Report = createPhase7CompletionPackageReport(phase7Package);
  const operationsLock = phase7Package.operationsFinalLockReport;
  const serviceLock = phase7Package.finalPhase7ServiceDisabledLockReport;
  const evidenceArchive = phase7Package.phase7EvidenceArchiveReport;
  const featureInventory = phase7Package.featureInventory;
  const riskRegister = phase7Package.remainingRiskRegisterReport;
  return [
    check("phase_7_completion_review_exists", "phase_7_completion", "Phase 7 completion review exists", phase7Package.phase7CompletionReview.valid && phase7Package.phase7CompletionReview.inMemoryOnly, `Phase 7 completion package decision: ${phase7Report.decision}.`),
    check("final_operations_lock_exists", "operations_lock", "Final operations lock exists", operationsLock.valid && operationsLock.inMemoryOnly, `Operations lock decision: ${operationsLock.decision}.`),
    check("final_service_disabled_lock_exists", "service_disabled_lock", "Final service-disabled lock exists", serviceLock.valid && serviceLock.inMemoryOnly, `${serviceLock.lock.items.length} disabled-service decision(s) locked.`),
    check("phase_7_evidence_archive_exists", "phase_7_completion", "Phase 7 evidence archive exists", evidenceArchive.valid && evidenceArchive.inMemoryOnly, `${evidenceArchive.archive.items.length} evidence item(s) represented.`),
    check("phase_7_feature_inventory_exists", "phase_7_completion", "Phase 7 feature inventory exists", featureInventory.valid && featureInventory.inMemoryOnly, `${featureInventory.inventory.length} feature inventory item(s) represented.`),
    check("phase_7_remaining_risk_register_exists", "phase_7_completion", "Phase 7 remaining risk register exists", riskRegister.valid && riskRegister.inMemoryOnly, `${riskRegister.summary.total} remaining risk(s) represented.`),
    check("manual_operations_remain_manual", "operations_lock", "Controlled beta operations remain manual", operationsLock.noBetaLaunchPerformed && operationsLock.noUsersContacted && operationsLock.noExternalServicesRequired, "Phase 7 operations lock remains manual and service-disabled."),
    check("manual_feedback_review_remains_manual", "manual_feedback_review", "Manual feedback review remains manual", !input.feedbackCollectedAutomatically, "No feedback is collected automatically."),
    check("support_workflow_remains_manual", "support_workflow", "Support workflow remains manual", !input.usersContacted, "No support workflow contacts users by code."),
    check("issue_triage_remains_manual", "issue_triage", "Issue triage remains manual", !input.feedbackCollectedAutomatically, "Issue triage remains manual/in-memory."),
    check("product_stabilization_systems_exist", "product_stabilization", "Product stabilization systems exist", featureInventory.inventory.some((entry) => entry.id === "product_stabilization_pass_runner"), "Phase 7 product stabilization pass is inventoried."),
    check("regression_qa_systems_exist", "regression_qa", "Regression QA systems exist", featureInventory.inventory.some((entry) => entry.id === "stabilization_regression_qa"), "Phase 7 stabilization regression QA is inventoried."),
    check("services_remain_disabled", "service_disabled_lock", "Services remain disabled unless future approval exists", serviceLock.noDatabasePersistenceEnabled && serviceLock.noAnalyticsEnabled && serviceLock.noMonitoringProviderConnected && serviceLock.noLiveAiOrchestrationEnabled, "Service-disabled lock remains active."),
    check("scripture_anchors_visible", "scripture_anchor", "Scripture anchors remain visible", operationsLock.rules.some((entry) => entry.id === "scripture_anchors_visible" && entry.passed), "Scripture anchor lock remains represented."),
    check("explanation_traces_visible", "explanation_trace", "Explanation traces remain visible", operationsLock.rules.some((entry) => entry.id === "explanation_traces_visible" && entry.passed), "Explanation trace lock remains represented."),
    check("fallback_safe", "fallback", "Fallback remains safe", operationsLock.rules.some((entry) => entry.id === "fallback_safe" && entry.passed), "Fallback safety lock remains represented."),
    check("confidence_labels_visible", "confidence_label", "Confidence labels remain visible", operationsLock.rules.some((entry) => entry.id === "confidence_labels_visible" && entry.passed), "Confidence label lock remains represented."),
    check("privacy_consent_visible", "privacy_consent", "Privacy/consent notices remain visible", operationsLock.rules.some((entry) => entry.id === "privacy_consent_visible" && entry.passed), "Privacy/consent lock remains represented."),
    check("known_limitations_available", "known_limitations", "Known limitations remain available", operationsLock.rules.some((entry) => entry.id === "known_limitations_available" && entry.passed), "Known limitations lock remains represented."),
    check("mobile_accessibility_needs_visible", "mobile_accessibility", "Mobile/accessibility hardening needs are visible", riskRegister.register.risks.some((entry) => entry.area === "accessibility" || entry.area === "mobile"), "Mobile/accessibility follow-up risk remains visible."),
    check("performance_needs_visible", "performance", "Performance hardening needs are visible", true, "Phase 8.1 creates a performance hardening plan without external monitoring."),
    check("no_public_launch_by_code", "public_release_preparation", "No public launch is performed by code", !input.publicLaunchPerformed, "Phase 8.1 does not launch publicly."),
    check("no_beta_launch_by_code", "public_release_preparation", "No beta launch is performed by code", !input.betaLaunchPerformed, "Phase 8.1 does not launch beta."),
    check("no_users_contacted_by_code", "support_workflow", "No users are contacted by code", !input.usersContacted, "Phase 8.1 does not contact users."),
    check("no_feedback_auto_collection", "manual_feedback_review", "No feedback is collected automatically", !input.feedbackCollectedAutomatically, "Phase 8.1 does not collect feedback automatically."),
    check("no_public_urls_fetched", "public_release_preparation", "No public URLs are fetched automatically", !input.publicUrlsFetchedAutomatically, "Phase 8.1 does not fetch public URLs."),
    check("no_external_services_required", "service_disabled_lock", "No external services are required", !input.externalServicesRequired && !input.databasePersistenceEnabled && !input.analyticsEnabled && !input.monitoringProviderConnected && !input.adminAuthAdded && !input.cmsConnected && !input.liveAiOrchestrationEnabled, "No external service is required or connected."),
    check("no_browser_persistence_required", "privacy_consent", "No browser persistence is required", !input.browserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required."),
    check("real_beta_results_not_claimed", "phase_7_completion", "No real beta results are claimed by code", !input.realBetaPerformedOutsideCodebase, "Phase 8.1 treats post-beta readiness as a planning structure unless owner supplies external beta evidence.", [warning("planning_only_post_beta", "phase_7_completion", "No real beta was verified inside the codebase; reports remain readiness planning artifacts.")])
  ];
}

export function runPostBetaReadinessAudit(input: TeoyubePostBetaReadinessAuditInput = {}): TeoyubePostBetaReadinessAuditCheck[] {
  return createPostBetaReadinessAuditChecklist(input);
}

export function getPostBetaReadinessAuditBlockers(input: TeoyubePostBetaReadinessAuditInput = {}): TeoyubePostBetaReadinessAuditBlocker[] {
  return createPostBetaReadinessAuditChecklist(input).flatMap((entry) => entry.blockers);
}

export function getPostBetaReadinessAuditWarnings(input: TeoyubePostBetaReadinessAuditInput = {}): TeoyubePostBetaReadinessAuditWarning[] {
  return createPostBetaReadinessAuditChecklist(input).flatMap((entry) => entry.warnings);
}

export function createPostBetaReadinessAuditDecision(input: TeoyubePostBetaReadinessAuditInput = {}): TeoyubePostBetaReadinessAuditDecision {
  const blockers = getPostBetaReadinessAuditBlockers(input);
  const warnings = getPostBetaReadinessAuditWarnings(input);
  if (blockers.some((entry) => ["operations_lock", "manual_feedback_review", "support_workflow", "issue_triage"].includes(entry.area))) return "needs_operations_review";
  if (blockers.some((entry) => entry.area === "service_disabled_lock")) return "needs_service_reassessment_review";
  if (blockers.some((entry) => entry.area === "privacy_consent")) return "needs_privacy_security_review";
  if (blockers.length) return "blocked";
  return warnings.length ? "ready_with_warnings" : "ready_for_product_hardening_planning";
}

function statusFromDecision(decision: TeoyubePostBetaReadinessAuditDecision, warningCount: number): TeoyubePostBetaReadinessAuditStatus {
  if (decision === "ready_for_product_hardening_planning") return "ready";
  if (decision === "ready_with_warnings" || warningCount) return "ready_with_warnings";
  if (decision === "needs_owner_review" || decision === "needs_operations_review" || decision === "needs_service_reassessment_review" || decision === "needs_privacy_security_review") return "needs_review";
  if (decision === "blocked") return "blocked";
  return "unknown";
}

export function createPostBetaReadinessAuditReport(input: TeoyubePostBetaReadinessAuditInput = {}): TeoyubePostBetaReadinessAuditReport {
  const checks = createPostBetaReadinessAuditChecklist(input);
  const blockers = getPostBetaReadinessAuditBlockers(input);
  const warnings = getPostBetaReadinessAuditWarnings(input);
  const decision = createPostBetaReadinessAuditDecision(input);
  const evidenceItems = [
    evidence("phase_7_completion_package", "phase_7_completion", "phase-7-completion-package.ts", "available", "Phase 7 completion package exists as in-memory evidence."),
    evidence("phase_7_operations_lock", "operations_lock", "controlled-beta-operations-final-lock.ts", "available", "Final operations lock exists."),
    evidence("phase_7_service_lock", "service_disabled_lock", "final-phase-7-service-disabled-lock.ts", "available", "Final service-disabled lock exists."),
    evidence("post_beta_results", "phase_7_completion", "owner/manual external process", input.realBetaPerformedOutsideCodebase ? "warning" : "planning_only", input.realBetaPerformedOutsideCodebase ? "Owner may attach external beta evidence manually; code does not verify or store it." : "No real beta results are claimed by this codebase.")
  ];
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision, warnings.length),
    decision,
    checks,
    evidence: evidenceItems,
    risks: [
      risk("post_beta_planning_vs_results", "phase_7_completion", "medium", "Post-beta readiness can be mistaken for actual beta results.", "Keep wording explicit: this codebase provides readiness planning unless external owner evidence is supplied."),
      risk("service_reassessment_pressure", "service_disabled_lock", "high", "Service reassessment can pressure premature persistence, analytics, monitoring, auth, CMS, accounts, notifications, or live AI.", "Keep services disabled until owner/privacy/security/cost/rollback/data-protection review is complete.")
    ],
    blockers,
    warnings,
    noRealBetaResultsClaimed: true,
    noPublicLaunchPerformed: true,
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
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
