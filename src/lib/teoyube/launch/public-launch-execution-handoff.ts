import { createFinalProductionServiceDecisionReport } from "./final-production-service-decision";
import { createFinalPublicGoNoGoReport } from "./final-public-go-no-go";
import { createFinalPublicLaunchPackage, createFinalPublicLaunchPackageReport } from "./final-public-launch-package";
import { createFinalPublicOwnerGoNoGoRecord, createFinalPublicOwnerGoNoGoReport } from "./final-public-owner-go-no-go";
import type { TeoyubeFinalPublicLaunchBlocker, TeoyubeFinalPublicLaunchWarning } from "./final-public-go-no-go-contracts";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";

export type TeoyubePublicLaunchExecutionHandoffInput = {
  ownerReviewAccepted?: boolean;
  publicLaunchPerformed?: boolean;
  usersContacted?: boolean;
  feedbackCollectedAutomatically?: boolean;
};

export function getPublicLaunchExecutionHandoffChecklist() {
  return [
    "Public launch execution checklist prepared",
    "Public release notes prepared",
    "Production service status included",
    "Known limitations included",
    "Owner decision record included",
    "Privacy/legal review status included",
    "Public QA status included",
    "Rollback plan included",
    "Support plan included",
    "Next action checklist included"
  ];
}

function blocker(id: string, reason: string): TeoyubeFinalPublicLaunchBlocker {
  return { id, label: id.replace(/_/g, " "), category: "unknown", riskLevel: "critical", reason, requiredAction: "Resolve public launch execution handoff blocker before continuing to 6.1." };
}

export function createPublicLaunchExecutionHandoff(input: TeoyubePublicLaunchExecutionHandoffInput = {}) {
  return {
    id: "public_launch_execution_handoff_5_4",
    label: "Public Launch Execution Handoff",
    publicLaunchExecutionChecklist: getPublicLaunchExecutionHandoffChecklist(),
    publicReleaseNotes: [
      "Teoyube is Scripture-anchored, confidence-aware, fallback-safe, consent-aware, and privacy-protective.",
      "Production persistence, external analytics, and live AI remain disabled unless explicitly reviewed later."
    ],
    productionServiceStatus: createFinalProductionServiceDecisionReport(),
    knownLimitations: createPublicLaunchKnownLimitationsReport(),
    ownerDecisionRecord: createFinalPublicOwnerGoNoGoReport(createFinalPublicOwnerGoNoGoRecord({ accepted: input.ownerReviewAccepted !== false })),
    privacyLegalReviewStatus: "draft_copy_ready_no_legal_final_claim" as const,
    publicQaStatus: "final_public_surface_qa_ready" as const,
    rollbackPlan: ["Pause public execution", "Preserve Scripture/fallback paths", "Review owner decision", "Document issue manually"],
    supportPlan: ["Manual issue intake", "Sensitive information warning", "Escalate safety/privacy issues", "No automatic feedback collection"],
    nextActionChecklist: ["Open Public Launch Execution 6.1", "Confirm owner approval", "Run final manual checks", "Use controlled activation checklist"],
    manualOnly: true,
    inMemoryOnly: true,
    executed: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    generatedAt: new Date().toISOString()
  };
}

export function getPublicLaunchExecutionHandoffBlockers(input: TeoyubePublicLaunchExecutionHandoffInput = {}): TeoyubeFinalPublicLaunchBlocker[] {
  const goNoGo = createFinalPublicGoNoGoReport({ ownerReviewAccepted: input.ownerReviewAccepted });
  const pkg = createFinalPublicLaunchPackageReport(createFinalPublicLaunchPackage());
  return [
    ...goNoGo.blockers,
    ...pkg.blockers,
    input.publicLaunchPerformed ? blocker("public_launch_handoff_launch_performed", "Execution handoff must not publicly launch Teoyube.") : undefined,
    input.usersContacted ? blocker("public_launch_handoff_users_contacted", "Execution handoff must not contact users.") : undefined,
    input.feedbackCollectedAutomatically ? blocker("public_launch_handoff_feedback_collected", "Execution handoff must not collect feedback automatically.") : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
}

export function getPublicLaunchExecutionHandoffWarnings(): TeoyubeFinalPublicLaunchWarning[] {
  return [
    { id: "public_launch_handoff_not_executed", label: "Handoff not executed", category: "unknown", riskLevel: "medium", message: "This handoff prepares the next stage but does not execute public launch.", recommendedAction: "Use Public Launch Execution 6.1 for controlled activation checklist." }
  ];
}

export function createPublicLaunchExecutionHandoffReport(input: TeoyubePublicLaunchExecutionHandoffInput = {}) {
  const blockers = getPublicLaunchExecutionHandoffBlockers(input);
  const handoff = createPublicLaunchExecutionHandoff(input);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    handoff,
    blockers,
    warnings: getPublicLaunchExecutionHandoffWarnings(),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    nextStep: "Public Launch Execution 6.1 - Controlled Public Launch Activation Checklist" as const,
    generatedAt: new Date().toISOString()
  };
}
