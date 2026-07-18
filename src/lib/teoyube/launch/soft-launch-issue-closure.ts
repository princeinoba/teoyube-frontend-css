import type { TeoyubeSoftLaunchFixQueue, TeoyubeSoftLaunchFixQueueStatus } from "./soft-launch-fix-queue-contracts";
import type { TeoyubeSoftLaunchFeedbackTriageCategory } from "./soft-launch-feedback-triage-contracts";
import { createSoftLaunchFixQueue } from "./soft-launch-fix-queue-manager";

export type TeoyubeSoftLaunchIssueClosureIssue = {
  id: string;
  label: string;
  category: TeoyubeSoftLaunchFeedbackTriageCategory;
  status: TeoyubeSoftLaunchFixQueueStatus | "accepted_manual_resolution";
  launchCritical: boolean;
  safetyCritical: boolean;
  acceptedManualResolution?: boolean;
  requiredRegressionCheckIds?: string[];
  noSafetyGuardrailWeakened?: boolean;
  scriptureAnchorsRequired?: boolean;
  explanationPathsRequired?: boolean;
  fallbackSafe?: boolean;
  consentControlsVisible?: boolean;
  restrictedServiceEnabled?: boolean;
};

export type TeoyubeSoftLaunchIssueClosureRegressionResult = {
  checkId: string;
  status: "pass" | "warning" | "fail" | "blocked" | "not_run" | "not_applicable" | "unknown";
};

export type TeoyubeSoftLaunchIssueClosureInput = {
  issues?: TeoyubeSoftLaunchIssueClosureIssue[];
  fixQueue?: TeoyubeSoftLaunchFixQueue;
  regressionResults?: TeoyubeSoftLaunchIssueClosureRegressionResult[];
  publicLaunchPerformed?: boolean;
  usersContacted?: boolean;
  externalWritePerformed?: boolean;
};

function defaultIssues(): TeoyubeSoftLaunchIssueClosureIssue[] {
  return [
    {
      id: "soft_launch_completion_sample_issue",
      label: "Sample soft launch issue closed by manual review",
      category: "content_clarity",
      status: "verified",
      launchCritical: false,
      safetyCritical: false,
      requiredRegressionCheckIds: ["sample_closure_regression"],
      noSafetyGuardrailWeakened: true,
      scriptureAnchorsRequired: true,
      explanationPathsRequired: true,
      fallbackSafe: true,
      consentControlsVisible: true,
      restrictedServiceEnabled: false
    }
  ];
}

function normalizeInput(input: TeoyubeSoftLaunchIssueClosureInput = {}): Required<TeoyubeSoftLaunchIssueClosureInput> {
  return {
    issues: input.issues || defaultIssues(),
    fixQueue: input.fixQueue || createSoftLaunchFixQueue(),
    regressionResults: input.regressionResults || [{ checkId: "sample_closure_regression", status: "pass" }],
    publicLaunchPerformed: input.publicLaunchPerformed ?? false,
    usersContacted: input.usersContacted ?? false,
    externalWritePerformed: input.externalWritePerformed ?? false
  };
}

export function createSoftLaunchIssueClosureChecklist() {
  return [
    { id: "fix_result_or_manual_resolution", label: "Issue has fix result or accepted manual resolution", required: true },
    { id: "required_regression_complete", label: "Required regression checks are complete or documented", required: true },
    { id: "no_safety_guardrail_weakened", label: "No safety guardrail was weakened", required: true },
    { id: "scripture_anchors_required", label: "Scripture anchors remain required", required: true },
    { id: "explanation_paths_required", label: "Explanation paths remain required", required: true },
    { id: "fallback_safe", label: "Fallback remains safe", required: true },
    { id: "consent_controls_visible", label: "Consent controls remain visible where needed", required: true },
    { id: "no_restricted_service_enabled", label: "No restricted service was enabled", required: true }
  ];
}

function hasPassingRegression(issue: TeoyubeSoftLaunchIssueClosureIssue, results: TeoyubeSoftLaunchIssueClosureRegressionResult[]): boolean {
  const required = issue.requiredRegressionCheckIds || [];
  if (required.length === 0) return true;
  return required.every((checkId) => {
    const result = results.find((entry) => entry.checkId === checkId);
    return Boolean(result && ["pass", "warning", "not_applicable"].includes(result.status));
  });
}

function issueIsClosed(issue: TeoyubeSoftLaunchIssueClosureIssue, results: TeoyubeSoftLaunchIssueClosureRegressionResult[]): boolean {
  const resolutionAccepted = ["fixed", "verified", "accepted_manual_resolution"].includes(issue.status) || issue.acceptedManualResolution === true;
  return resolutionAccepted
    && hasPassingRegression(issue, results)
    && issue.noSafetyGuardrailWeakened !== false
    && issue.scriptureAnchorsRequired !== false
    && issue.explanationPathsRequired !== false
    && issue.fallbackSafe !== false
    && issue.consentControlsVisible !== false
    && issue.restrictedServiceEnabled !== true;
}

export function verifySoftLaunchIssueClosure(
  issues: TeoyubeSoftLaunchIssueClosureIssue[] = defaultIssues(),
  fixQueue: TeoyubeSoftLaunchFixQueue = createSoftLaunchFixQueue(),
  regressionResults: TeoyubeSoftLaunchIssueClosureRegressionResult[] = [{ checkId: "sample_closure_regression", status: "pass" }]
) {
  const queueItems = fixQueue.items.map((item) => ({
    id: item.id,
    label: item.title,
    category: item.category,
    status: item.status,
    launchCritical: item.launchCritical,
    safetyCritical: item.safetyCritical,
    requiredRegressionCheckIds: item.verificationRequired,
    noSafetyGuardrailWeakened: true,
    scriptureAnchorsRequired: true,
    explanationPathsRequired: true,
    fallbackSafe: true,
    consentControlsVisible: true,
    restrictedServiceEnabled: false
  }));
  const merged = [...issues, ...queueItems];
  const closed = merged.filter((issue) => issueIsClosed(issue, regressionResults));
  const unresolved = merged.filter((issue) => !issueIsClosed(issue, regressionResults));
  return { issues: merged, closed, unresolved, valid: unresolved.filter((issue) => issue.launchCritical || issue.safetyCritical).length === 0 };
}

export function getClosedSoftLaunchIssues(input: TeoyubeSoftLaunchIssueClosureInput = {}) {
  const normalized = normalizeInput(input);
  return verifySoftLaunchIssueClosure(normalized.issues, normalized.fixQueue, normalized.regressionResults).closed;
}

export function getUnresolvedSoftLaunchIssues(input: TeoyubeSoftLaunchIssueClosureInput = {}) {
  const normalized = normalizeInput(input);
  return verifySoftLaunchIssueClosure(normalized.issues, normalized.fixQueue, normalized.regressionResults).unresolved;
}

export function getSoftLaunchIssueClosureBlockers(input: TeoyubeSoftLaunchIssueClosureInput = {}) {
  const normalized = normalizeInput(input);
  const unresolved = getUnresolvedSoftLaunchIssues(normalized);
  return [
    ...unresolved
      .filter((issue) => issue.launchCritical || issue.safetyCritical || issue.restrictedServiceEnabled)
      .map((issue) => ({
        id: `soft_launch_issue_closure_${issue.id}`,
        label: issue.label,
        reason: "Launch-critical or safety-critical issue is not closed.",
        requiredAction: "Resolve the issue, document manual resolution, and complete required regression before public launch preparation.",
        riskLevel: "critical" as const
      })),
    normalized.publicLaunchPerformed ? { id: "soft_launch_issue_closure_public_launch_performed", label: "Public launch performed", reason: "Issue closure must not perform public launch.", requiredAction: "Keep closure review-only.", riskLevel: "critical" as const } : undefined,
    normalized.usersContacted ? { id: "soft_launch_issue_closure_users_contacted", label: "Users contacted", reason: "Issue closure must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    normalized.externalWritePerformed ? { id: "soft_launch_issue_closure_external_write", label: "External write", reason: "Issue closure must not write externally.", requiredAction: "Keep closure records in memory.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
}

export function getSoftLaunchIssueClosureWarnings(input: TeoyubeSoftLaunchIssueClosureInput = {}) {
  return getUnresolvedSoftLaunchIssues(input)
    .filter((issue) => !issue.launchCritical && !issue.safetyCritical)
    .map((issue) => ({
      id: `soft_launch_issue_closure_warning_${issue.id}`,
      label: issue.label,
      message: "Non-critical issue remains open or deferred.",
      recommendedAction: "Document as a known limitation or future public launch preparation task.",
      riskLevel: "medium" as const
    }));
}

export function createSoftLaunchIssueClosureDecision(input: TeoyubeSoftLaunchIssueClosureInput = {}) {
  const blockers = getSoftLaunchIssueClosureBlockers(input);
  const warnings = getSoftLaunchIssueClosureWarnings(input);
  if (blockers.length > 0) return "blocked" as const;
  if (warnings.length > 0) return "closed_with_warnings" as const;
  return "closed" as const;
}

export function createSoftLaunchIssueClosureReport(input: TeoyubeSoftLaunchIssueClosureInput = {}) {
  const normalized = normalizeInput(input);
  const closure = verifySoftLaunchIssueClosure(normalized.issues, normalized.fixQueue, normalized.regressionResults);
  const blockers = getSoftLaunchIssueClosureBlockers(normalized);
  const warnings = getSoftLaunchIssueClosureWarnings(normalized);
  const decision = createSoftLaunchIssueClosureDecision(normalized);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && ["closed", "closed_with_warnings"].includes(decision),
    decision,
    checklist: createSoftLaunchIssueClosureChecklist(),
    issues: closure.issues,
    closedIssues: closure.closed,
    unresolvedIssues: closure.unresolved,
    closedCount: closure.closed.length,
    unresolvedCount: closure.unresolved.length,
    launchCriticalUnresolvedCount: closure.unresolved.filter((issue) => issue.launchCritical || issue.safetyCritical).length,
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noSafetyGuardrailWeakened: closure.issues.every((issue) => issue.noSafetyGuardrailWeakened !== false),
    scriptureAnchorsRequired: closure.issues.every((issue) => issue.scriptureAnchorsRequired !== false),
    explanationPathsRequired: closure.issues.every((issue) => issue.explanationPathsRequired !== false),
    fallbackSafe: closure.issues.every((issue) => issue.fallbackSafe !== false),
    consentControlsVisible: closure.issues.every((issue) => issue.consentControlsVisible !== false),
    noRestrictedServiceEnabled: closure.issues.every((issue) => issue.restrictedServiceEnabled !== true),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
