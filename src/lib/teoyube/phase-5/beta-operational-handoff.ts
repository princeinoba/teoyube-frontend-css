import {
  createControlledBetaGoNoGoReport,
  type TeoyubeControlledBetaGoNoGoInput
} from "./controlled-beta-go-no-go";
import {
  createBetaReadinessEvidenceReport,
  type TeoyubeBetaReadinessEvidenceInput
} from "./beta-readiness-evidence-summary";
import {
  createBetaLaunchBoundaryReport,
  type TeoyubeBetaLaunchBoundaryInput
} from "./beta-launch-boundary-validator";
import {
  createControlledBetaOwnerApprovalRecord,
  createControlledBetaOwnerApprovalReport
} from "./controlled-beta-owner-approval";
import type { TeoyubeControlledBetaOwnerApprovalRecord } from "./controlled-beta-owner-approval-contracts";
import {
  createControlledBetaPauseRollbackReport,
  type TeoyubeControlledBetaPauseRollbackInput
} from "./beta-pause-rollback-criteria";
import { createControlledBetaKnownLimitationsReport } from "./beta-known-limitations";
import type {
  TeoyubeBetaOperationalHandoffArea,
  TeoyubeBetaOperationalHandoffBlocker,
  TeoyubeBetaOperationalHandoffDecision,
  TeoyubeBetaOperationalHandoffItem,
  TeoyubeBetaOperationalHandoffReport,
  TeoyubeBetaOperationalHandoffStatus,
  TeoyubeBetaOperationalHandoffWarning
} from "./beta-operational-handoff-contracts";

export type TeoyubeBetaOperationalHandoffInput = {
  goNoGoInput?: TeoyubeControlledBetaGoNoGoInput;
  evidenceInput?: TeoyubeBetaReadinessEvidenceInput;
  boundaryInput?: TeoyubeBetaLaunchBoundaryInput;
  ownerApprovalRecord?: TeoyubeControlledBetaOwnerApprovalRecord;
  pauseRollbackInput?: TeoyubeControlledBetaPauseRollbackInput;
};

export type TeoyubeBetaOperationalHandoff = {
  id: string;
  goNoGoReport: ReturnType<typeof createControlledBetaGoNoGoReport>;
  evidenceReport: ReturnType<typeof createBetaReadinessEvidenceReport>;
  launchBoundaryReport: ReturnType<typeof createBetaLaunchBoundaryReport>;
  ownerApprovalReport: ReturnType<typeof createControlledBetaOwnerApprovalReport>;
  pauseRollbackReport: ReturnType<typeof createControlledBetaPauseRollbackReport>;
  knownLimitationsReport: ReturnType<typeof createControlledBetaKnownLimitationsReport>;
  items: TeoyubeBetaOperationalHandoffItem[];
  remainingRisks: string[];
  nextActionChecklist: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noNotificationsSent: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function blocker(id: string, area: TeoyubeBetaOperationalHandoffArea, message: string, requiredAction: string): TeoyubeBetaOperationalHandoffBlocker {
  return { id, area, message, requiredAction };
}

function warning(id: string, area: TeoyubeBetaOperationalHandoffArea, message: string, recommendedAction: string): TeoyubeBetaOperationalHandoffWarning {
  return { id, area, message, recommendedAction };
}

function item(input: {
  id: string;
  area: TeoyubeBetaOperationalHandoffArea;
  label: string;
  complete: boolean;
  details: string;
  warnings?: TeoyubeBetaOperationalHandoffWarning[];
  failureMessage?: string;
  requiredAction?: string;
}): TeoyubeBetaOperationalHandoffItem {
  return {
    id: input.id,
    area: input.area,
    label: input.label,
    complete: input.complete,
    details: input.details,
    blockers: input.complete ? [] : [blocker(`${input.id}_blocker`, input.area, input.failureMessage || `${input.label} is incomplete.`, input.requiredAction || "Complete this handoff item before controlled beta execution planning.")],
    warnings: input.warnings || []
  };
}

function createReports(input: TeoyubeBetaOperationalHandoffInput = {}) {
  const goNoGoReport = createControlledBetaGoNoGoReport(input.goNoGoInput);
  const evidenceReport = createBetaReadinessEvidenceReport(input.evidenceInput);
  const launchBoundaryReport = createBetaLaunchBoundaryReport(input.boundaryInput);
  const ownerApprovalRecord = input.ownerApprovalRecord || createControlledBetaOwnerApprovalRecord();
  const ownerApprovalReport = createControlledBetaOwnerApprovalReport(ownerApprovalRecord);
  const pauseRollbackReport = createControlledBetaPauseRollbackReport(input.pauseRollbackInput);
  const knownLimitationsReport = createControlledBetaKnownLimitationsReport();
  return {
    goNoGoReport,
    evidenceReport,
    launchBoundaryReport,
    ownerApprovalReport,
    pauseRollbackReport,
    knownLimitationsReport
  };
}

export function createBetaOperationalHandoffChecklist(input: TeoyubeBetaOperationalHandoffInput = {}): TeoyubeBetaOperationalHandoffItem[] {
  const reports = createReports(input);
  return [
    item({
      id: "go_no_go_decision",
      area: "owner_review",
      label: "Controlled beta go/no-go decision included",
      complete: reports.goNoGoReport.valid,
      details: `Decision: ${reports.goNoGoReport.decision}.`,
      warnings: reports.goNoGoReport.warnings.map((entry) => warning(entry.id, "owner_review", entry.message, entry.recommendedAction))
    }),
    item({
      id: "owner_approval_status",
      area: "owner_review",
      label: "Owner approval status included",
      complete: reports.ownerApprovalReport.valid,
      details: `Owner approval decision: ${reports.ownerApprovalReport.decision}.`,
      warnings: reports.ownerApprovalReport.warnings.map((entry) => warning(entry.id, "owner_review", entry.message, entry.recommendedAction))
    }),
    item({
      id: "manual_qa_evidence",
      area: "manual_qa_evidence",
      label: "Manual QA evidence included",
      complete: reports.evidenceReport.valid,
      details: `Readiness score before remediation: ${reports.evidenceReport.summary.readinessScoreBeforeRemediation}; post-remediation score: ${reports.evidenceReport.summary.postRemediationReadinessScore}.`
    }),
    item({
      id: "issue_intake_plan",
      area: "issue_intake",
      label: "Issue intake plan included",
      complete: reports.evidenceReport.summary.preparationEvidence.some((entry) => entry.id === "issue_intake_plan" && entry.status !== "blocked"),
      details: "Manual issue intake categories are included; no automatic collection or user contact is performed."
    }),
    item({
      id: "feedback_boundaries",
      area: "feedback_boundaries",
      label: "Feedback boundaries included",
      complete: reports.evidenceReport.summary.preparationEvidence.some((entry) => entry.id === "feedback_readiness_plan" && entry.status !== "blocked"),
      details: "Feedback remains manual-only unless future approval exists."
    }),
    item({
      id: "pause_criteria",
      area: "pause_criteria",
      label: "Pause criteria included",
      complete: reports.pauseRollbackReport.pauseCriteria.length > 0,
      details: `${reports.pauseRollbackReport.pauseCriteria.length} pause criterion/criteria defined.`
    }),
    item({
      id: "rollback_criteria",
      area: "rollback_criteria",
      label: "Rollback review criteria included",
      complete: reports.pauseRollbackReport.rollbackCriteria.length > 0,
      details: `${reports.pauseRollbackReport.rollbackCriteria.length} rollback review criterion/criteria defined.`
    }),
    item({
      id: "support_workflow",
      area: "support_workflow",
      label: "Support workflow remains manual",
      complete: true,
      details: "Support workflow is an operational handoff note only; it sends no notifications and contacts no users."
    }),
    item({
      id: "service_disabled_state",
      area: "service_disabled_state",
      label: "Disabled service state confirmed",
      complete: reports.launchBoundaryReport.valid && reports.evidenceReport.summary.disabledServiceConfirmed,
      details: "Services remain disabled or plan-only, and safe render does not require external providers."
    }),
    item({
      id: "privacy_security_boundaries",
      area: "privacy_security",
      label: "Privacy/security boundaries included",
      complete: reports.evidenceReport.summary.privacyConsentConfirmed && reports.launchBoundaryReport.noBrowserPersistenceRequired,
      details: "Consent/privacy boundaries and no-browser-persistence posture are included."
    }),
    item({
      id: "scripture_explanation_fallback",
      area: "scripture_explanation_fallback",
      label: "Scripture/explanation/fallback status included",
      complete: reports.evidenceReport.summary.scriptureExplanationFallbackConfirmed,
      details: "Scripture anchors, explanation traces, fallback safety, confidence labels, and bounded language are represented."
    }),
    item({
      id: "mobile_accessibility",
      area: "mobile_accessibility",
      label: "Mobile/accessibility status included",
      complete: reports.evidenceReport.summary.mobileAccessibilityConfirmed,
      details: "Mobile and accessibility regression evidence is included."
    }),
    item({
      id: "known_limitations",
      area: "known_limitations",
      label: "Known limitations included",
      complete: reports.knownLimitationsReport.limitations.length >= 10,
      details: reports.knownLimitationsReport.notice
    }),
    item({
      id: "next_phase_plan",
      area: "next_phase_plan",
      label: "Next Phase 5 plan included",
      complete: true,
      details: "Next step is Phase 5.5 - Phase 5 Completion Review, Beta Readiness Lock & Phase 6 Roadmap."
    })
  ];
}

export function createBetaOperationalHandoff(input: TeoyubeBetaOperationalHandoffInput = {}): TeoyubeBetaOperationalHandoff {
  const reports = createReports(input);
  const items = createBetaOperationalHandoffChecklist(input);
  return {
    id: "phase_5_4_beta_operational_handoff",
    ...reports,
    items,
    remainingRisks: [
      ...reports.goNoGoReport.risks.map((entry) => entry.message),
      ...reports.evidenceReport.warnings,
      ...reports.ownerApprovalReport.warnings.map((entry) => entry.message)
    ],
    nextActionChecklist: [
      "Owner reviews Phase 5.4 go/no-go package manually.",
      "Owner accepts, warns, or blocks controlled beta execution planning.",
      "Keep all services disabled unless future approval exists.",
      "Use manual issue intake and manual feedback handling only.",
      "Proceed to Phase 5.5 completion review and beta readiness lock."
    ],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noNotificationsSent: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getBetaOperationalHandoffBlockers(input: TeoyubeBetaOperationalHandoffInput = {}): TeoyubeBetaOperationalHandoffBlocker[] {
  return createBetaOperationalHandoffChecklist(input).flatMap((entry) => entry.blockers);
}

export function getBetaOperationalHandoffWarnings(input: TeoyubeBetaOperationalHandoffInput = {}): TeoyubeBetaOperationalHandoffWarning[] {
  return createBetaOperationalHandoffChecklist(input).flatMap((entry) => entry.warnings);
}

export function createBetaOperationalHandoffDecision(input: TeoyubeBetaOperationalHandoffInput = {}): TeoyubeBetaOperationalHandoffDecision {
  const blockers = getBetaOperationalHandoffBlockers(input);
  const warnings = getBetaOperationalHandoffWarnings(input);
  if (blockers.length) return "handoff_blocked";
  return warnings.length ? "handoff_ready_with_warnings" : "handoff_ready";
}

function statusFromDecision(decision: TeoyubeBetaOperationalHandoffDecision): TeoyubeBetaOperationalHandoffStatus {
  if (decision === "handoff_ready") return "ready";
  if (decision === "handoff_ready_with_warnings") return "ready_with_warnings";
  if (decision === "handoff_blocked") return "blocked";
  return "unknown";
}

export function createBetaOperationalHandoffReport(input: TeoyubeBetaOperationalHandoffInput = {}): TeoyubeBetaOperationalHandoffReport {
  const items = createBetaOperationalHandoffChecklist(input);
  const blockers = items.flatMap((entry) => entry.blockers);
  const warnings = items.flatMap((entry) => entry.warnings);
  const decision = createBetaOperationalHandoffDecision(input);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    items,
    blockers,
    warnings,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noNotificationsSent: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
