import {
  createSupportIssueTriageReport
} from "./support-issue-triage";
import type { TeoyubeSupportIssue } from "./support-issue-triage-contracts";
import type { TeoyubePhase72QaCheck } from "./feedback-review-simulation-qa";

export type TeoyubeSupportWorkflowQaReport = {
  valid: boolean;
  checks: TeoyubePhase72QaCheck[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noDivineCertaintyClaimed: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase72QaCheck {
  return { id, passed, details };
}

function issuesFromInput(input?: TeoyubeSupportIssue[] | { issues?: TeoyubeSupportIssue[] }): TeoyubeSupportIssue[] {
  return Array.isArray(input) ? input : input?.issues || [];
}

export function validateSupportWorkflowBoundaries(input?: TeoyubeSupportIssue[] | { issues?: TeoyubeSupportIssue[] }): TeoyubePhase72QaCheck {
  const report = createSupportIssueTriageReport(issuesFromInput(input));
  return check("support_workflow_boundaries", report.manualOnly && report.inMemoryOnly && report.noExternalSend && report.noDatabasePersistenceEnabled, `Support triage decision: ${report.decision}.`);
}

export function validateSupportNoAutomaticContact(input?: TeoyubeSupportIssue[] | { issues?: TeoyubeSupportIssue[] }): TeoyubePhase72QaCheck {
  const report = createSupportIssueTriageReport(issuesFromInput(input));
  return check("support_no_automatic_contact", report.noUsersContacted && report.noAutomaticCollection && report.noPublicUrlsFetchedAutomatically, "No support messages are sent automatically, no feedback is collected automatically, and no public URLs are fetched automatically.");
}

export function validateSupportProfessionalAdviceBoundary(input?: TeoyubeSupportIssue[] | { issues?: TeoyubeSupportIssue[] }): TeoyubePhase72QaCheck {
  const issues = issuesFromInput(input);
  const professionalIssues = issues.filter((issue) => issue.category === "professional_advice_request");
  return check("support_professional_advice_boundary", professionalIssues.every((issue) => issue.status === "blocked" || issue.severity === "high" || issue.severity === "critical"), `${professionalIssues.length} professional-advice issue(s) routed to high/critical manual review.`);
}

export function validateSupportEmergencyEscalationBoundary(input?: TeoyubeSupportIssue[] | { issues?: TeoyubeSupportIssue[] }): TeoyubePhase72QaCheck {
  const issues = issuesFromInput(input);
  const crisisIssues = issues.filter((issue) => issue.category === "emergency_or_crisis");
  return check("support_emergency_escalation_boundary", crisisIssues.every((issue) => issue.status === "blocked" || issue.severity === "critical"), `${crisisIssues.length} emergency/crisis issue(s) routed to critical manual handling.`);
}

export function validateSupportScriptureExplanationBoundary(input?: TeoyubeSupportIssue[] | { issues?: TeoyubeSupportIssue[] }): TeoyubePhase72QaCheck {
  const issues = issuesFromInput(input);
  const scriptureOrExplanation = issues.filter((issue) => ["scripture_anchor_missing", "scripture_anchor_question", "explanation_trace_missing", "explanation_trace_question"].includes(issue.category));
  return check("support_scripture_explanation_boundary", scriptureOrExplanation.every((issue) => ["high", "medium", "critical"].includes(issue.severity)), `${scriptureOrExplanation.length} Scripture/explanation issue(s) remain visible for triage.`);
}

export function validateSupportPrivacyConsentBoundary(input?: TeoyubeSupportIssue[] | { issues?: TeoyubeSupportIssue[] }): TeoyubePhase72QaCheck {
  const report = createSupportIssueTriageReport(issuesFromInput(input));
  return check("support_privacy_consent_boundary", report.noDatabasePersistenceEnabled && report.noAnalyticsEnabled && report.noBrowserPersistenceRequired, "Privacy/consent boundaries preserve no persistence, no analytics, and no browser persistence.");
}

export function createSupportWorkflowQaReport(input?: TeoyubeSupportIssue[] | { issues?: TeoyubeSupportIssue[] }): TeoyubeSupportWorkflowQaReport {
  const checks = [
    validateSupportWorkflowBoundaries(input),
    validateSupportNoAutomaticContact(input),
    validateSupportProfessionalAdviceBoundary(input),
    validateSupportEmergencyEscalationBoundary(input),
    validateSupportScriptureExplanationBoundary(input),
    validateSupportPrivacyConsentBoundary(input)
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Support workflow QA produces manual recommendations only and sends nothing automatically."],
    manualOnly: true,
    inMemoryOnly: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noDivineCertaintyClaimed: true,
    generatedAt: new Date().toISOString()
  };
}
