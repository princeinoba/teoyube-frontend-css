import type { TeoyubeControlledLaunchActivationBlocker, TeoyubeControlledLaunchActivationCheck, TeoyubeControlledLaunchActivationWarning } from "./controlled-launch-activation-contracts";

export type TeoyubeControlledLaunchIssueIntakePlan = {
  id: string;
  label: string;
  checklist: TeoyubeControlledLaunchActivationCheck[];
  feedbackCollectedAutomatically: false;
  issuesSentExternally: false;
  databaseWritten: false;
  generatedAt: string;
};

function item(id: string, label: string): TeoyubeControlledLaunchActivationCheck {
  return { id, label, phase: "feedback_intake_readiness", required: true, complete: true, launchCritical: true, details: label };
}

function blocker(entry: TeoyubeControlledLaunchActivationCheck): TeoyubeControlledLaunchActivationBlocker {
  return { id: `issue_intake_${entry.id}`, label: entry.label, phase: "feedback_intake_readiness", severity: "critical", reason: entry.details, requiredAction: "Prepare this issue intake item before manual activation." };
}

export function getControlledLaunchIssueIntakeChecklist(): TeoyubeControlledLaunchActivationCheck[] {
  return [
    item("feedback_log_structure_exists", "Feedback log structure exists"),
    item("issue_triage_workflow_exists", "Issue triage workflow exists"),
    item("issue_categories_exist", "Issue categories exist"),
    item("scripture_anchor_issues_launch_critical", "Scripture anchor issues are launch-critical"),
    item("explanation_path_issues_launch_critical", "Explanation path issues are launch-critical"),
    item("fallback_issues_launch_critical", "Fallback issues are launch-critical"),
    item("consent_privacy_issues_launch_critical", "Consent/privacy issues are launch-critical"),
    item("mobile_accessibility_blockers_launch_critical", "Mobile/accessibility blockers are launch-critical"),
    item("no_feedback_collected_automatically", "No feedback is collected automatically"),
    item("no_issue_sent_externally", "No issue is sent externally"),
    item("no_database_writes", "No database writes are made")
  ];
}

export function createControlledLaunchIssueIntakePlan(input: Partial<TeoyubeControlledLaunchIssueIntakePlan> = {}): TeoyubeControlledLaunchIssueIntakePlan {
  return {
    id: input.id || "controlled_launch_issue_intake_4_1",
    label: input.label || "Controlled Launch Issue Intake Readiness",
    checklist: input.checklist || getControlledLaunchIssueIntakeChecklist(),
    feedbackCollectedAutomatically: false,
    issuesSentExternally: false,
    databaseWritten: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getControlledLaunchIssueIntakeBlockers(plan: TeoyubeControlledLaunchIssueIntakePlan): TeoyubeControlledLaunchActivationBlocker[] {
  return [
    ...plan.checklist.filter((entry) => entry.required && !entry.complete).map(blocker),
    plan.feedbackCollectedAutomatically ? { id: "issue_intake_feedback_auto_collected", label: "Feedback collected automatically", phase: "feedback_intake_readiness", severity: "critical", reason: "Issue intake must be manual only.", requiredAction: "Remove automatic feedback collection." } : undefined,
    plan.issuesSentExternally ? { id: "issue_intake_external_send", label: "Issue sent externally", phase: "feedback_intake_readiness", severity: "critical", reason: "Issues must not be sent externally by code.", requiredAction: "Keep issue intake local/manual." } : undefined,
    plan.databaseWritten ? { id: "issue_intake_database_write", label: "Database write", phase: "feedback_intake_readiness", severity: "critical", reason: "Issue intake readiness must not write databases.", requiredAction: "Keep readiness in memory." } : undefined
  ].filter(Boolean) as TeoyubeControlledLaunchActivationBlocker[];
}

export function getControlledLaunchIssueIntakeWarnings(): TeoyubeControlledLaunchActivationWarning[] {
  return [{ id: "issue_intake_manual_only", label: "Issue intake is manual only", phase: "feedback_intake_readiness", severity: "medium", message: "This confirms readiness but collects no real feedback.", recommendedAction: "Use manual feedback logs during the approved soft launch." }];
}

export function validateControlledLaunchIssueIntakeReadiness(plan: TeoyubeControlledLaunchIssueIntakePlan) {
  const blockers = getControlledLaunchIssueIntakeBlockers(plan);
  return { valid: blockers.length === 0, blockers, warnings: getControlledLaunchIssueIntakeWarnings() };
}

export function createControlledLaunchIssueIntakeReport(plan: TeoyubeControlledLaunchIssueIntakePlan = createControlledLaunchIssueIntakePlan()) {
  const validation = validateControlledLaunchIssueIntakeReadiness(plan);
  return { valid: validation.valid, ready: validation.valid, plan, checklistCount: plan.checklist.length, blockers: validation.blockers, warnings: validation.warnings, manualOnly: true, noFeedbackCollected: true, noExternalSend: true, noDatabaseWrites: true, generatedAt: new Date().toISOString() };
}
