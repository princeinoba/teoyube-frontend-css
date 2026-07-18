import { createControlledPublicGoNoGoReport } from "./controlled-public-go-no-go";
import { createFinalPublicOwnerApprovalRecord, createFinalPublicOwnerApprovalReport } from "./final-public-owner-approval";
import type {
  TeoyubePublicOperationalHandoffBlocker,
  TeoyubePublicOperationalHandoffDecision,
  TeoyubePublicOperationalHandoffItem,
  TeoyubePublicOperationalHandoffReport,
  TeoyubePublicOperationalHandoffWarning
} from "./public-operational-handoff-contracts";
import { createPublicReadinessEvidenceReport } from "./public-readiness-evidence-summary";
import { createPublicReleaseBoundaryFinalReport } from "./public-release-boundary-final-confirmation";

export type TeoyubePublicOperationalHandoffInput = Partial<{
  readinessEvidenceReady: boolean;
  finalOwnerApprovalReady: boolean;
  manualMonitoringReady: boolean;
  manualSupportReady: boolean;
  manualFeedbackReady: boolean;
  issueTriageReady: boolean;
  pauseRollbackReady: boolean;
  servicesDisabled: boolean;
  privacyConsentReady: boolean;
  knownLimitationsReady: boolean;
  scriptureExplanationFallbackReady: boolean;
  mobileAccessibilityReady: boolean;
  remainingRisksAccepted: boolean;
  nextPhasePlanReady: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function item(id: string, area: TeoyubePublicOperationalHandoffItem["area"], label: string, ready: boolean, details: string): TeoyubePublicOperationalHandoffItem {
  return { id, area, label, ready, details };
}

export function createPublicOperationalHandoffChecklist(input: TeoyubePublicOperationalHandoffInput = {}): TeoyubePublicOperationalHandoffItem[] {
  return [
    item("readiness_evidence", "readiness_evidence", "Readiness evidence summary prepared", flag(input.readinessEvidenceReady), "Includes Phase 9.1, 9.2, and 9.3 evidence."),
    item("final_owner_approval", "final_owner_approval", "Final owner approval prepared", flag(input.finalOwnerApprovalReady), "Uses structured manual owner approval."),
    item("manual_monitoring", "manual_monitoring", "Manual monitoring plan ready", flag(input.manualMonitoringReady), "No automatic public URL fetching is performed."),
    item("manual_support", "manual_support", "Manual support plan ready", flag(input.manualSupportReady), "No automatic user contact is performed."),
    item("manual_feedback", "manual_feedback", "Manual feedback boundary ready", flag(input.manualFeedbackReady), "No automatic feedback collection is performed."),
    item("issue_triage", "issue_triage", "Issue triage plan ready", flag(input.issueTriageReady), "Issues remain manually triaged."),
    item("pause_rollback", "pause_rollback", "Pause/rollback criteria ready", flag(input.pauseRollbackReady), "Criteria are decision support only."),
    item("service_disabled_state", "service_disabled_state", "Service-disabled summary ready", flag(input.servicesDisabled), "Disabled services remain disabled."),
    item("privacy_consent", "privacy_consent", "Privacy/security summary ready", flag(input.privacyConsentReady), "Privacy, consent, and sensitive data warnings remain visible."),
    item("known_limitations", "known_limitations", "Known limitations ready", flag(input.knownLimitationsReady), "Known limitations remain explicit."),
    item("scripture_explanation_fallback", "scripture_explanation_fallback", "Scripture/explanation/fallback summary ready", flag(input.scriptureExplanationFallbackReady), "Scripture anchors, explanation traces, fallback, and confidence labels remain protected."),
    item("mobile_accessibility", "mobile_accessibility", "Mobile/accessibility summary ready", flag(input.mobileAccessibilityReady), "Mobile and accessibility basics remain ready for review."),
    item("remaining_risks", "remaining_risks", "Remaining risks accepted", flag(input.remainingRisksAccepted), "Remaining risks are documented for Phase 9.5."),
    item("next_phase_plan", "next_phase_plan", "Next action checklist ready", flag(input.nextPhasePlanReady), "Phase 9.5 completion review can use this handoff.")
  ];
}

export function createPublicOperationalHandoff(input: TeoyubePublicOperationalHandoffInput = {}) {
  return {
    controlledPublicGoNoGoReport: createControlledPublicGoNoGoReport(),
    finalOwnerApprovalReport: createFinalPublicOwnerApprovalReport(createFinalPublicOwnerApprovalRecord({ reviewed: true, nextPhaseAccepted: true })),
    publicReadinessEvidenceReport: createPublicReadinessEvidenceReport(),
    publicReleaseBoundaryReport: createPublicReleaseBoundaryFinalReport(),
    items: createPublicOperationalHandoffChecklist(input),
    remainingRisks: ["Manual support, manual feedback, and manual monitoring still require owner discipline during future execution planning."],
    knownLimitations: ["Services remain disabled unless future owner approval changes that boundary."],
    nextActionChecklist: ["Review Phase 9.4 package", "Proceed to Phase 9.5 completion review", "Do not launch from code"]
  };
}

export function getPublicOperationalHandoffBlockers(input: TeoyubePublicOperationalHandoffInput = {}): TeoyubePublicOperationalHandoffBlocker[] {
  return createPublicOperationalHandoffChecklist(input)
    .filter((entry) => !entry.ready)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: `${entry.label}: ${entry.details}` }));
}

export function getPublicOperationalHandoffWarnings(): TeoyubePublicOperationalHandoffWarning[] {
  return [
    { id: "manual_handoff_warning", area: "remaining_risks", message: "Operational handoff is manual and does not contact users, schedule actions, or send notifications." }
  ];
}

export function createPublicOperationalHandoffDecision(input: TeoyubePublicOperationalHandoffInput = {}): TeoyubePublicOperationalHandoffDecision {
  const blockers = getPublicOperationalHandoffBlockers(input);
  if (blockers.length) return "handoff_blocked";
  return getPublicOperationalHandoffWarnings().length ? "handoff_ready_with_warnings" : "handoff_ready_for_phase_9_5";
}

export function createPublicOperationalHandoffReport(input: TeoyubePublicOperationalHandoffInput = {}): TeoyubePublicOperationalHandoffReport {
  const blockers = getPublicOperationalHandoffBlockers(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : getPublicOperationalHandoffWarnings().length ? "ready_with_warnings" : "ready",
    decision: createPublicOperationalHandoffDecision(input),
    items: createPublicOperationalHandoffChecklist(input),
    blockers,
    warnings: getPublicOperationalHandoffWarnings(),
    noUsersContacted: true,
    noSchedulingPerformed: true,
    noNotificationsSent: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
