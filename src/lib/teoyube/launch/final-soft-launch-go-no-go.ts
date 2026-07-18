import type {
  TeoyubeFinalSoftLaunchDecisionReason,
  TeoyubeFinalSoftLaunchGoNoGoDecision,
  TeoyubeFinalSoftLaunchNextAction,
  TeoyubeFinalSoftLaunchReadinessBlocker,
  TeoyubeFinalSoftLaunchReadinessWarning
} from "./final-soft-launch-readiness-contracts";
import { createFinalSoftLaunchReadinessPackage, createFinalSoftLaunchReadinessPackageReport } from "./final-soft-launch-readiness-package";
import { createFinalSoftLaunchSafetyCertificationReport } from "./final-soft-launch-safety-certification";
import { createFinalSoftLaunchSurfaceCertificationReport } from "./final-soft-launch-surface-certification";
import { createFinalSoftLaunchQualityGateReport } from "./final-soft-launch-quality-gate-report";
import { createFinalSoftLaunchRiskRegister, createFinalSoftLaunchRiskRegisterReport } from "./final-soft-launch-risk-register";
import { createKnownLimitationsReport } from "./final-soft-launch-known-limitations";
import { createFinalSoftLaunchOwnerGoNoGoRecord, createFinalSoftLaunchOwnerGoNoGoReport } from "./final-soft-launch-owner-go-no-go";
import { createLimitedSoftLaunchDayRunbookReport } from "./limited-soft-launch-day-runbook";
import { createLimitedSoftLaunchFeedbackWorkflowReport } from "./limited-soft-launch-feedback-workflow";
import { createLimitedSoftLaunchSupportResponseReport } from "./limited-soft-launch-support-response";
import { createLimitedSoftLaunchDryRunPackage, createLimitedSoftLaunchDryRunPackageReport } from "./limited-soft-launch-dry-run-package";

export type TeoyubeFinalSoftLaunchGoNoGoInput = {
  ownerReviewAccepted?: boolean;
};

export function createFinalSoftLaunchGoNoGoChecklist(): string[] {
  return [
    "Final readiness package reviewed",
    "Final safety certification reviewed",
    "Surface certification reviewed",
    "Quality gate report reviewed",
    "Risk register reviewed",
    "Known limitations accepted",
    "Owner go/no-go accepted",
    "Dry run package reviewed",
    "Launch day runbook reviewed",
    "Feedback workflow reviewed",
    "Support response and rollback criteria reviewed"
  ];
}

function blocker(id: string, reason: string): TeoyubeFinalSoftLaunchReadinessBlocker {
  return {
    id,
    label: id.replace(/_/g, " "),
    category: "owner_go_no_go",
    severity: "critical",
    reason,
    requiredAction: "Resolve this final go/no-go blocker before limited soft launch execution."
  };
}

export function getFinalSoftLaunchGoNoGoBlockers(
  input: TeoyubeFinalSoftLaunchGoNoGoInput = {}
): TeoyubeFinalSoftLaunchReadinessBlocker[] {
  const readinessPackage = createFinalSoftLaunchReadinessPackageReport(createFinalSoftLaunchReadinessPackage());
  const safety = createFinalSoftLaunchSafetyCertificationReport();
  const surfaces = createFinalSoftLaunchSurfaceCertificationReport();
  const quality = createFinalSoftLaunchQualityGateReport();
  const risk = createFinalSoftLaunchRiskRegisterReport(createFinalSoftLaunchRiskRegister());
  const owner = createFinalSoftLaunchOwnerGoNoGoReport(createFinalSoftLaunchOwnerGoNoGoRecord({
    status: input.ownerReviewAccepted === false ? "needs_review" : "approved",
    limitedSoftLaunchExecutionAccepted: input.ownerReviewAccepted !== false
  }));
  const dryRunPackage = createLimitedSoftLaunchDryRunPackageReport(createLimitedSoftLaunchDryRunPackage());
  const runbook = createLimitedSoftLaunchDayRunbookReport();
  const feedback = createLimitedSoftLaunchFeedbackWorkflowReport();
  const support = createLimitedSoftLaunchSupportResponseReport();

  return [
    readinessPackage.valid ? undefined : blocker("final_go_no_go_readiness_package_invalid", "Final readiness package must be valid."),
    safety.valid ? undefined : blocker("final_go_no_go_safety_invalid", "Final safety certification must pass."),
    surfaces.valid ? undefined : blocker("final_go_no_go_surface_invalid", "Final surface certification must pass."),
    quality.valid ? undefined : blocker("final_go_no_go_quality_invalid", "Final quality gates must pass."),
    risk.valid ? undefined : blocker("final_go_no_go_risk_invalid", "Risk register must be valid and in-memory only."),
    owner.valid ? undefined : blocker("final_go_no_go_owner_invalid", "Owner go/no-go must be approved."),
    dryRunPackage.valid ? undefined : blocker("final_go_no_go_dry_run_package_invalid", "Dry run package must be valid."),
    runbook.valid && runbook.noActionsPerformed ? undefined : blocker("final_go_no_go_runbook_invalid", "Launch day runbook must be valid and action-free."),
    feedback.valid && feedback.noDatabaseWrites && feedback.noAnalyticsSending ? undefined : blocker("final_go_no_go_feedback_invalid", "Feedback workflow must be manual and privacy-safe."),
    support.valid && support.rollbackCriteria.length > 0 ? undefined : blocker("final_go_no_go_support_invalid", "Support response and rollback criteria must exist.")
  ].filter(Boolean) as TeoyubeFinalSoftLaunchReadinessBlocker[];
}

export function getFinalSoftLaunchGoNoGoWarnings(): TeoyubeFinalSoftLaunchReadinessWarning[] {
  const limitations = createKnownLimitationsReport();

  return [
    {
      id: "final_go_no_go_known_limitations",
      label: "Known limitations require owner acknowledgement",
      category: "known_limitation",
      severity: "medium",
      message: `${limitations.ownerAcknowledgementRequiredCount} known limitation(s) require owner acknowledgement.`,
      recommendedAction: "Confirm known limitations in owner go/no-go."
    },
    {
      id: "final_go_no_go_no_launch_performed",
      label: "Decision readiness only",
      category: "owner_go_no_go",
      severity: "medium",
      message: "Final go/no-go does not perform soft launch execution.",
      recommendedAction: "Use Limited Soft Launch Execution 4.1 for controlled activation checklist."
    }
  ];
}

export function getFinalSoftLaunchGoNoGoReasons(
  input: TeoyubeFinalSoftLaunchGoNoGoInput = {}
): TeoyubeFinalSoftLaunchDecisionReason[] {
  const blockers = getFinalSoftLaunchGoNoGoBlockers(input);

  return [
    {
      id: "final_readiness_package",
      label: "Final readiness package",
      supportsDecision: blockers.every((entry) => entry.id !== "final_go_no_go_readiness_package_invalid"),
      details: "Final package assembles readiness evidence, dry-run reports, owner records, known limitations, risk register, and decision guidance."
    },
    {
      id: "final_safety_certification",
      label: "Final safety certification",
      supportsDecision: blockers.every((entry) => entry.id !== "final_go_no_go_safety_invalid"),
      details: "Scripture anchoring, explanation paths, fallback, consent, privacy, disabled providers, debug safety, and certainty-language checks are verified."
    },
    {
      id: "owner_go_no_go",
      label: "Owner go/no-go",
      supportsDecision: blockers.every((entry) => entry.id !== "final_go_no_go_owner_invalid"),
      details: "Structured owner go/no-go is approved by default for this readiness package and remains manual-only."
    }
  ];
}

export function evaluateFinalSoftLaunchGoNoGo(
  input: TeoyubeFinalSoftLaunchGoNoGoInput = {}
): TeoyubeFinalSoftLaunchGoNoGoDecision {
  const blockers = getFinalSoftLaunchGoNoGoBlockers(input);

  if (blockers.some((entry) => /safety|scripture|explanation|fallback|consent|privacy|analytics|persistence|live ai/i.test(`${entry.label} ${entry.reason}`))) return "needs_safety_fix";
  if (blockers.some((entry) => /surface|mobile|accessibility|quality/i.test(`${entry.label} ${entry.reason}`))) return "needs_qa_fix";
  if (blockers.some((entry) => /environment/i.test(`${entry.label} ${entry.reason}`))) return "needs_environment_fix";
  if (blockers.length > 0) return input.ownerReviewAccepted === false ? "go_after_owner_review" : "no_go_blocked";
  return "go_for_limited_soft_launch_execution";
}

export function getFinalSoftLaunchGoNoGoNextActions(
  input: TeoyubeFinalSoftLaunchGoNoGoInput = {}
): TeoyubeFinalSoftLaunchNextAction[] {
  const blockers = getFinalSoftLaunchGoNoGoBlockers(input);

  if (blockers.length > 0) {
    return blockers.map((entry) => ({
      id: `${entry.id}_action`,
      label: entry.requiredAction,
      requiredBeforeLaunchExecution: true,
      ownerActionRequired: true,
      details: entry.reason
    }));
  }

  return [
    {
      id: "begin_limited_soft_launch_execution_4_1",
      label: "Begin Limited Soft Launch Execution 4.1 - Controlled Launch Activation Checklist",
      requiredBeforeLaunchExecution: false,
      ownerActionRequired: true,
      details: "Use the controlled activation checklist; do not contact users or launch from this 3.3 module."
    }
  ];
}

export function createFinalSoftLaunchGoNoGoReport(
  input: TeoyubeFinalSoftLaunchGoNoGoInput = {}
) {
  const blockers = getFinalSoftLaunchGoNoGoBlockers(input);
  const warnings = getFinalSoftLaunchGoNoGoWarnings();
  const decision = evaluateFinalSoftLaunchGoNoGo(input);

  return {
    valid: blockers.length === 0,
    ready: decision === "go_for_limited_soft_launch_execution",
    decision,
    checklist: createFinalSoftLaunchGoNoGoChecklist(),
    reasons: getFinalSoftLaunchGoNoGoReasons(input),
    blockers,
    warnings,
    nextActions: getFinalSoftLaunchGoNoGoNextActions(input),
    noLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollected: true,
    noPreviewUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
