import type { TeoyubeLimitedSoftLaunchDecision } from "./limited-soft-launch-execution-contracts";
import { createLimitedSoftLaunchCommunicationPacket } from "./limited-soft-launch-communication-packet";
import { createLimitedSoftLaunchDayRunbookReport } from "./limited-soft-launch-day-runbook";
import { createLimitedSoftLaunchEnvironmentSafetyReport } from "./limited-soft-launch-environment-safety";
import { createLimitedSoftLaunchExecutionReport } from "./limited-soft-launch-execution-plan";
import { createLimitedSoftLaunchFeedbackWorkflowReport } from "./limited-soft-launch-feedback-workflow";
import { createParticipantScopeReport } from "./limited-soft-launch-participant-scope";
import { createLimitedSoftLaunchSupportResponseReport } from "./limited-soft-launch-support-response";
import { createLimitedSoftLaunchSurfaceScopeReport } from "./limited-soft-launch-surface-scope";
import { runSoftLaunchCandidateConfirmationAudit } from "./soft-launch-candidate-confirmation-audit";

export type TeoyubeLimitedSoftLaunchGoNoGoPreparationInput = {
  softLaunchCandidateConfirmed?: boolean;
  ownerReviewAccepted?: boolean;
  participantScopeReady?: boolean;
  surfaceScopeReady?: boolean;
  environmentSafetyReady?: boolean;
  feedbackWorkflowReady?: boolean;
  supportRollbackReady?: boolean;
  launchDayRunbookReady?: boolean;
  communicationPacketReady?: boolean;
  externalAnalyticsDisabled?: boolean;
  productionPersistenceDisabled?: boolean;
  liveAiOrchestrationDisabled?: boolean;
  scriptureAnchoringRequired?: boolean;
  explanationPathRequired?: boolean;
  fallbackEnabled?: boolean;
  consentControlsEnabled?: boolean;
};

export type TeoyubeLimitedSoftLaunchGoNoGoPreparationReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeLimitedSoftLaunchDecision;
  checklist: Array<{ id: string; label: string; passed: boolean; details: string; safetyCritical: boolean }>;
  blockers: string[];
  warnings: string[];
  noLaunchPerformed: true;
  noUsersContacted: true;
  noPreviewUrlFetched: true;
  generatedAt: string;
};

function value(input: TeoyubeLimitedSoftLaunchGoNoGoPreparationInput, key: keyof TeoyubeLimitedSoftLaunchGoNoGoPreparationInput): boolean {
  return input[key] !== false;
}

export function createLimitedSoftLaunchGoNoGoChecklist(
  input: TeoyubeLimitedSoftLaunchGoNoGoPreparationInput = {}
): TeoyubeLimitedSoftLaunchGoNoGoPreparationReport["checklist"] {
  const candidateAudit = runSoftLaunchCandidateConfirmationAudit();
  const execution = createLimitedSoftLaunchExecutionReport();
  const participant = createParticipantScopeReport();
  const surface = createLimitedSoftLaunchSurfaceScopeReport();
  const environment = createLimitedSoftLaunchEnvironmentSafetyReport();
  const feedback = createLimitedSoftLaunchFeedbackWorkflowReport();
  const support = createLimitedSoftLaunchSupportResponseReport();
  const runbook = createLimitedSoftLaunchDayRunbookReport();
  const communication = createLimitedSoftLaunchCommunicationPacket();

  return [
    { id: "soft_launch_candidate_confirmation", label: "Soft launch candidate confirmation", passed: value(input, "softLaunchCandidateConfirmed") && candidateAudit.complete, details: "2.5 soft launch candidate confirmation is complete.", safetyCritical: true },
    { id: "owner_review", label: "Owner review", passed: input.ownerReviewAccepted === true, details: "Owner review is required before inviting real users.", safetyCritical: false },
    { id: "execution_plan", label: "Limited soft launch execution plan", passed: value(input, "participantScopeReady") && execution.ready, details: execution.decision, safetyCritical: true },
    { id: "participant_scope", label: "Participant scope", passed: value(input, "participantScopeReady") && participant.valid, details: `${participant.includedGroupCount} included group(s).`, safetyCritical: true },
    { id: "surface_scope", label: "Surface scope", passed: value(input, "surfaceScopeReady") && surface.valid, details: `${surface.includedSurfaceCount} included surface(s).`, safetyCritical: true },
    { id: "environment_safety", label: "Environment safety", passed: value(input, "environmentSafetyReady") && environment.valid, details: `${environment.blockerCount} blocker(s).`, safetyCritical: true },
    { id: "feedback_workflow", label: "Feedback workflow", passed: value(input, "feedbackWorkflowReady") && feedback.valid, details: "Manual and privacy-safe.", safetyCritical: true },
    { id: "support_rollback", label: "Support and rollback plan", passed: value(input, "supportRollbackReady") && support.valid, details: `${support.rollbackCriteria.length} rollback criteria.`, safetyCritical: true },
    { id: "launch_day_runbook", label: "Launch day runbook", passed: value(input, "launchDayRunbookReady") && runbook.valid, details: `${runbook.stepCount} step(s).`, safetyCritical: true },
    { id: "communication_packet", label: "Communication packet", passed: value(input, "communicationPacketReady") && !communication.messagesSent && !communication.usersContacted, details: "Draft only; no messages sent.", safetyCritical: false },
    { id: "no_external_analytics", label: "No external analytics", passed: value(input, "externalAnalyticsDisabled") && environment.externalAnalyticsDisabled, details: "External analytics remains disabled.", safetyCritical: true },
    { id: "no_production_persistence", label: "No production persistence", passed: value(input, "productionPersistenceDisabled") && environment.productionPersistenceDisabled, details: "Production persistence remains disabled.", safetyCritical: true },
    { id: "no_live_ai", label: "No live AI orchestration", passed: value(input, "liveAiOrchestrationDisabled") && environment.liveAiOrchestrationDisabled, details: "Live AI orchestration remains disabled.", safetyCritical: true },
    { id: "scripture_anchoring", label: "Scripture anchoring required", passed: value(input, "scriptureAnchoringRequired"), details: "Scripture anchoring remains required.", safetyCritical: true },
    { id: "explanation_paths", label: "Explanation paths required", passed: value(input, "explanationPathRequired"), details: "Explanation paths remain required.", safetyCritical: true },
    { id: "fallback_enabled", label: "Fallback enabled", passed: value(input, "fallbackEnabled"), details: "Fallback remains enabled.", safetyCritical: true },
    { id: "consent_controls", label: "Consent controls enabled", passed: value(input, "consentControlsEnabled"), details: "Consent controls remain enabled.", safetyCritical: true }
  ];
}

export function getLimitedSoftLaunchGoNoGoPreparationBlockers(
  input: TeoyubeLimitedSoftLaunchGoNoGoPreparationInput = {}
): string[] {
  return createLimitedSoftLaunchGoNoGoChecklist(input)
    .filter((entry) => !entry.passed && entry.safetyCritical)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getLimitedSoftLaunchGoNoGoPreparationWarnings(
  input: TeoyubeLimitedSoftLaunchGoNoGoPreparationInput = {}
): string[] {
  return createLimitedSoftLaunchGoNoGoChecklist(input)
    .filter((entry) => !entry.passed && !entry.safetyCritical)
    .map((entry) => `${entry.label}: ${entry.details}`)
    .concat(["Go/no-go preparation performs no launch and contacts no users."]);
}

export function createLimitedSoftLaunchGoNoGoPreparationDecision(
  input: TeoyubeLimitedSoftLaunchGoNoGoPreparationInput = {}
): TeoyubeLimitedSoftLaunchDecision {
  const blockers = getLimitedSoftLaunchGoNoGoPreparationBlockers(input);
  const warnings = getLimitedSoftLaunchGoNoGoPreparationWarnings(input);

  if (blockers.some((entry) => entry.toLowerCase().includes("candidate") || entry.toLowerCase().includes("preview"))) return "needs_preview_recheck";
  if (blockers.some((entry) => /environment|analytics|persistence|live ai|scripture|explanation|fallback|consent/i.test(entry))) return "needs_safety_review";
  if (blockers.some((entry) => /surface|runbook|feedback|support/i.test(entry))) return "needs_qa_review";
  if (blockers.length > 0) return "blocked";
  if (warnings.some((entry) => entry.toLowerCase().includes("owner"))) return "ready_after_owner_review";
  return "ready_for_limited_soft_launch_plan_review";
}

export function evaluateLimitedSoftLaunchGoNoGoPreparation(
  input: TeoyubeLimitedSoftLaunchGoNoGoPreparationInput = {}
): TeoyubeLimitedSoftLaunchDecision {
  return createLimitedSoftLaunchGoNoGoPreparationDecision(input);
}

export function createLimitedSoftLaunchGoNoGoPreparationReport(
  input: TeoyubeLimitedSoftLaunchGoNoGoPreparationInput = {}
): TeoyubeLimitedSoftLaunchGoNoGoPreparationReport {
  const blockers = getLimitedSoftLaunchGoNoGoPreparationBlockers(input);
  const warnings = getLimitedSoftLaunchGoNoGoPreparationWarnings(input);
  const decision = createLimitedSoftLaunchGoNoGoPreparationDecision(input);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision,
    checklist: createLimitedSoftLaunchGoNoGoChecklist(input),
    blockers,
    warnings,
    noLaunchPerformed: true,
    noUsersContacted: true,
    noPreviewUrlFetched: true,
    generatedAt: new Date().toISOString()
  };
}
