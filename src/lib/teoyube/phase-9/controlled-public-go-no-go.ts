import {
  createPhase91Package,
  createPhase91PackageReport
} from "./phase-9-1-package";
import {
  createPhase92Package,
  createPhase92PackageReport
} from "./phase-9-2-package";
import {
  createPhase93Package,
  createPhase93PackageReport
} from "./phase-9-3-package";
import type {
  TeoyubeControlledPublicGoNoGoArea,
  TeoyubeControlledPublicGoNoGoBlocker,
  TeoyubeControlledPublicGoNoGoCheck,
  TeoyubeControlledPublicGoNoGoDecision,
  TeoyubeControlledPublicGoNoGoEvidence,
  TeoyubeControlledPublicGoNoGoNextAction,
  TeoyubeControlledPublicGoNoGoReport,
  TeoyubeControlledPublicGoNoGoRisk,
  TeoyubeControlledPublicGoNoGoStatus,
  TeoyubeControlledPublicGoNoGoWarning
} from "./controlled-public-go-no-go-contracts";

export type TeoyubeControlledPublicGoNoGoInput = Partial<{
  phase91PackageReport: ReturnType<typeof createPhase91PackageReport>;
  phase92PackageReport: ReturnType<typeof createPhase92PackageReport>;
  phase93PackageReport: ReturnType<typeof createPhase93PackageReport>;
  finalOwnerApproved: boolean;
  criticalPublicReleaseBlockers: number;
  readinessScoreBlocked: boolean;
  missingScriptureAnchors: boolean;
  missingExplanationTraces: boolean;
  unsafeFallback: boolean;
  missingConfidenceLabels: boolean;
  missingPrivacyConsent: boolean;
  missingSensitiveDataWarning: boolean;
  missingKnownLimitations: boolean;
  reviewOnlyContentVisible: boolean;
  disabledServiceEnabled: boolean;
  publicLaunchFromCode: boolean;
  automaticUserContactEnabled: boolean;
  automaticFeedbackCollectionEnabled: boolean;
  automaticPublicUrlFetchingEnabled: boolean;
  debugPayloadVisibleToNormalUsers: boolean;
  divineCertaintyLanguagePresent: boolean;
  professionalAdviceLanguagePresent: boolean;
  mobileBlocker: boolean;
  accessibilityBlocker: boolean;
}>;

export const CONTROLLED_PUBLIC_GO_NO_GO_AREAS: TeoyubeControlledPublicGoNoGoArea[] = [
  "public_release_preparation",
  "release_candidate_qa",
  "final_regression_qa",
  "readiness_score",
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
  "owner_approval",
  "operational_handoff"
];

function defaultReports(input: TeoyubeControlledPublicGoNoGoInput = {}) {
  const phase91PackageReport = input.phase91PackageReport || createPhase91PackageReport(createPhase91Package({ ownerReviewed: true }));
  const phase92PackageReport = input.phase92PackageReport || createPhase92PackageReport(createPhase92Package({ ownerReviewed: true }));
  const phase93PackageReport = input.phase93PackageReport || createPhase93PackageReport(createPhase93Package({ ownerReviewed: true }));
  return { phase91PackageReport, phase92PackageReport, phase93PackageReport };
}

function check(id: string, area: TeoyubeControlledPublicGoNoGoArea, label: string, passed: boolean, evidence: string): TeoyubeControlledPublicGoNoGoCheck {
  return { id, area, label, passed, required: true, evidence };
}

export function createControlledPublicGoNoGoChecklist(input: TeoyubeControlledPublicGoNoGoInput = {}): TeoyubeControlledPublicGoNoGoCheck[] {
  const reports = defaultReports(input);
  const ownerApproved = input.finalOwnerApproved ?? true;
  return [
    check("phase_9_1_preparation", "public_release_preparation", "Phase 9.1 preparation package reviewed", reports.phase91PackageReport.valid, "Phase 9.1 package report is valid."),
    check("phase_9_2_release_candidate_qa", "release_candidate_qa", "Phase 9.2 release candidate QA reviewed", reports.phase92PackageReport.valid, "Phase 9.2 package report is valid."),
    check("phase_9_3_final_regression", "final_regression_qa", "Phase 9.3 final regression reviewed", reports.phase93PackageReport.valid, "Phase 9.3 package report is valid."),
    check("readiness_score", "readiness_score", "Public go/no-go readiness score is not blocked", reports.phase93PackageReport.readinessScoreBand !== "blocked" && !input.readinessScoreBlocked, "Phase 9.3 readiness score is available."),
    check("privacy_consent", "privacy_consent", "Privacy and consent remain visible", !input.missingPrivacyConsent, "Privacy and consent boundaries are protected."),
    check("sensitive_data_warning", "sensitive_data_warning", "Sensitive data warning remains visible", !input.missingSensitiveDataWarning, "Sensitive data warning is required before public execution planning."),
    check("known_limitations", "known_limitations", "Known limitations remain visible", !input.missingKnownLimitations, "Known limitations are part of final public readiness."),
    check("scripture_anchor", "scripture_anchor", "Scripture anchors remain available", !input.missingScriptureAnchors, "Recommendation surfaces preserve Scripture anchors."),
    check("explanation_trace", "explanation_trace", "Explanation traces remain available", !input.missingExplanationTraces, "Recommendation surfaces preserve explanation traces."),
    check("fallback", "fallback", "Fallback remains safe", !input.unsafeFallback, "Fallback states stay non-crashing and humble."),
    check("confidence_label", "confidence_label", "Confidence labels remain visible", !input.missingConfidenceLabels, "Confidence labels remain available where required."),
    check("reviewed_content_gate", "reviewed_content_gate", "Reviewed content gate remains active", !input.reviewOnlyContentVisible, "Review-only content is not published into live flows."),
    check("service_disabled_state", "service_disabled_state", "Disabled services remain disabled", !input.disabledServiceEnabled, "Database, analytics, monitoring provider, admin auth, CMS, accounts, live AI, and notifications remain disabled."),
    check("manual_monitoring", "manual_monitoring", "Manual monitoring boundary remains intact", !input.automaticPublicUrlFetchingEnabled, "No public URL fetching occurs automatically."),
    check("support_readiness", "support_readiness", "Support remains manual", !input.automaticUserContactEnabled, "No users are contacted from code."),
    check("feedback_readiness", "feedback_readiness", "Feedback remains manual", !input.automaticFeedbackCollectionEnabled, "No feedback is collected automatically."),
    check("mobile", "mobile", "Mobile blockers absent", !input.mobileBlocker, "Mobile readiness remains acceptable for execution planning."),
    check("accessibility", "accessibility", "Accessibility blockers absent", !input.accessibilityBlocker, "Accessibility basics remain acceptable for execution planning."),
    check("owner_approval", "owner_approval", "Final owner approval recorded", ownerApproved, "Final owner approval is a structured manual record."),
    check("operational_handoff", "operational_handoff", "Operational handoff can proceed", true, "Operational handoff is documentation and decision support only.")
  ];
}

export function getControlledPublicGoNoGoBlockers(input: TeoyubeControlledPublicGoNoGoInput = {}): TeoyubeControlledPublicGoNoGoBlocker[] {
  const reports = defaultReports(input);
  const checklistBlockers = createControlledPublicGoNoGoChecklist(input)
    .filter((entry) => entry.required && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: `${entry.label}: ${entry.evidence}` }));
  return [
    ...reports.phase91PackageReport.blockers.map((message) => ({ id: "phase_9_1_blocker", area: "public_release_preparation" as const, message })),
    ...reports.phase92PackageReport.blockers.map((message) => ({ id: "phase_9_2_blocker", area: "release_candidate_qa" as const, message })),
    ...reports.phase93PackageReport.blockers.map((message) => ({ id: "phase_9_3_blocker", area: "final_regression_qa" as const, message })),
    ...((input.criticalPublicReleaseBlockers || 0) > 0 ? [{ id: "critical_public_release_blockers", area: "unknown" as const, message: `${input.criticalPublicReleaseBlockers} critical public release blocker(s) remain.` }] : []),
    ...(input.publicLaunchFromCode ? [{ id: "public_launch_from_code", area: "public_release_preparation" as const, message: "Public launch from code blocks controlled go/no-go." }] : []),
    ...(input.debugPayloadVisibleToNormalUsers ? [{ id: "debug_payload_visible", area: "public_copy" as const, message: "Debug payload visible to normal users blocks public go/no-go." }] : []),
    ...(input.divineCertaintyLanguagePresent ? [{ id: "divine_certainty_language", area: "public_copy" as const, message: "Divine-certainty language blocks public go/no-go." }] : []),
    ...(input.professionalAdviceLanguagePresent ? [{ id: "professional_advice_language", area: "public_copy" as const, message: "Professional-advice language blocks public go/no-go." }] : []),
    ...checklistBlockers
  ];
}

export function getControlledPublicGoNoGoWarnings(input: TeoyubeControlledPublicGoNoGoInput = {}): TeoyubeControlledPublicGoNoGoWarning[] {
  const reports = defaultReports(input);
  return [
    ...reports.phase91PackageReport.warnings.map((message) => ({ id: "phase_9_1_warning", area: "public_release_preparation" as const, message })),
    ...reports.phase92PackageReport.warnings.map((message) => ({ id: "phase_9_2_warning", area: "release_candidate_qa" as const, message })),
    ...reports.phase93PackageReport.warnings.map((message) => ({ id: "phase_9_3_warning", area: "final_regression_qa" as const, message })),
    { id: "manual_go_no_go_warning", area: "owner_approval", message: "Controlled public go/no-go is a manual decision aid and does not launch publicly." }
  ];
}

export function getControlledPublicGoNoGoRisks(input: TeoyubeControlledPublicGoNoGoInput = {}): TeoyubeControlledPublicGoNoGoRisk[] {
  return [
    { id: "manual_monitoring_risk", area: "manual_monitoring", level: "medium", description: "Public execution planning still depends on manual monitoring discipline.", mitigation: "Carry Phase 9.2 manual monitoring plan into Phase 9.5." },
    { id: "support_capacity_risk", area: "support_readiness", level: "low", description: "Support remains manual until a future owner-approved service decision.", mitigation: "Keep feedback and support volume bounded during future planning." },
    ...(input.mobileBlocker || input.accessibilityBlocker ? [{ id: "mobile_accessibility_risk", area: "mobile" as const, level: "high" as const, description: "A mobile or accessibility blocker is present.", mitigation: "Pause execution planning until the blocker is resolved." }] : [])
  ];
}

export function getControlledPublicGoNoGoNextActions(input: TeoyubeControlledPublicGoNoGoInput = {}): TeoyubeControlledPublicGoNoGoNextAction[] {
  const blockers = getControlledPublicGoNoGoBlockers(input);
  return blockers.length
    ? blockers.map((entry) => ({ id: `resolve_${entry.id}`, label: `Resolve ${entry.area} blocker`, requiredBeforePhase95: true, details: entry.message }))
    : [
        { id: "proceed_phase_9_5", label: "Proceed to Phase 9.5 completion review", requiredBeforePhase95: false, details: "Use Phase 9.4 package for public readiness lock and Phase 10 roadmap planning." }
      ];
}

export function evaluateControlledPublicGoNoGo(input: TeoyubeControlledPublicGoNoGoInput = {}): TeoyubeControlledPublicGoNoGoStatus {
  const blockers = getControlledPublicGoNoGoBlockers(input);
  if (blockers.length) {
    if (blockers.some((entry) => entry.area === "owner_approval")) return "needs_owner_approval";
    if (blockers.some((entry) => entry.area === "privacy_consent" || entry.area === "sensitive_data_warning")) return "needs_final_remediation";
    return "blocked";
  }
  return getControlledPublicGoNoGoWarnings(input).length ? "ready_with_warnings" : "ready";
}

export function createControlledPublicGoNoGoDecision(input: TeoyubeControlledPublicGoNoGoInput = {}): TeoyubeControlledPublicGoNoGoDecision {
  const blockers = getControlledPublicGoNoGoBlockers(input);
  if (blockers.some((entry) => entry.area === "owner_approval")) return "needs_owner_approval";
  if (blockers.some((entry) => entry.area === "privacy_consent" || entry.area === "sensitive_data_warning")) return "needs_privacy_security_review";
  if (blockers.some((entry) => entry.area === "service_disabled_state")) return "needs_service_lock_review";
  if (blockers.some((entry) => entry.area === "final_regression_qa" || entry.area === "scripture_anchor" || entry.area === "explanation_trace" || entry.area === "fallback" || entry.area === "confidence_label" || entry.area === "reviewed_content_gate")) return "needs_final_remediation";
  if (blockers.length) return "no_go_blocked";
  return getControlledPublicGoNoGoWarnings(input).length ? "go_with_warnings" : "go_for_controlled_public_release_execution_planning";
}

export function createControlledPublicGoNoGoReport(input: TeoyubeControlledPublicGoNoGoInput = {}): TeoyubeControlledPublicGoNoGoReport {
  const blockers = getControlledPublicGoNoGoBlockers(input);
  const reports = defaultReports(input);
  const evidence: TeoyubeControlledPublicGoNoGoEvidence[] = [
    { id: "phase_9_1_evidence", area: "public_release_preparation", summary: reports.phase91PackageReport.decision, source: "phase-9-1-package.ts" },
    { id: "phase_9_2_evidence", area: "release_candidate_qa", summary: reports.phase92PackageReport.decision, source: "phase-9-2-package.ts" },
    { id: "phase_9_3_evidence", area: "final_regression_qa", summary: reports.phase93PackageReport.decision, source: "phase-9-3-package.ts" }
  ];
  return {
    valid: blockers.length === 0,
    status: evaluateControlledPublicGoNoGo(input),
    decision: createControlledPublicGoNoGoDecision(input),
    checks: createControlledPublicGoNoGoChecklist(input),
    blockers,
    warnings: getControlledPublicGoNoGoWarnings(input),
    risks: getControlledPublicGoNoGoRisks(input),
    evidence,
    nextActions: getControlledPublicGoNoGoNextActions(input),
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
