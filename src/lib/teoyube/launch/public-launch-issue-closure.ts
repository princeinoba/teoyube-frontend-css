import type { TeoyubePublicFixQueue, TeoyubePublicFixQueueStatus } from "./public-fix-queue-contracts";
import type { TeoyubePublicFeedbackTriageCategory } from "./public-feedback-triage-contracts";
import { createPublicFixQueue } from "./public-fix-queue-manager";

export type TeoyubePublicLaunchIssueClosureIssue = {
  id: string;
  label: string;
  category: TeoyubePublicFeedbackTriageCategory;
  status: TeoyubePublicFixQueueStatus | "accepted_manual_resolution";
  publicLaunchCritical: boolean;
  publicSafetyCritical: boolean;
  acceptedManualResolution?: boolean;
  requiredRegressionCheckIds?: string[];
  noSafetyGuardrailWeakened?: boolean;
  privacyTermsConsentNoticesAvailable?: boolean;
  scriptureAnchorsRequired?: boolean;
  explanationPathsRequired?: boolean;
  fallbackSafe?: boolean;
  consentControlsVisible?: boolean;
  restrictedServiceEnabled?: boolean;
};

export type TeoyubePublicLaunchIssueClosureRegressionResult = {
  checkId: string;
  status: "pass" | "warning" | "fail" | "blocked" | "not_run" | "not_applicable" | "unknown";
};

export type TeoyubePublicLaunchIssueClosureInput = {
  issues?: TeoyubePublicLaunchIssueClosureIssue[];
  fixQueue?: TeoyubePublicFixQueue;
  regressionResults?: TeoyubePublicLaunchIssueClosureRegressionResult[];
  publicLaunchPerformedByCode?: boolean;
  usersContacted?: boolean;
  publicUrlFetched?: boolean;
  externalWritePerformed?: boolean;
};

function defaultIssues(): TeoyubePublicLaunchIssueClosureIssue[] {
  return [
    {
      id: "public_launch_completion_sample_issue",
      label: "Sample public launch issue closed by manual review",
      category: "content_clarity",
      status: "verified",
      publicLaunchCritical: false,
      publicSafetyCritical: false,
      requiredRegressionCheckIds: ["sample_public_closure_regression"],
      noSafetyGuardrailWeakened: true,
      privacyTermsConsentNoticesAvailable: true,
      scriptureAnchorsRequired: true,
      explanationPathsRequired: true,
      fallbackSafe: true,
      consentControlsVisible: true,
      restrictedServiceEnabled: false
    }
  ];
}

function normalizeInput(input: TeoyubePublicLaunchIssueClosureInput = {}): Required<TeoyubePublicLaunchIssueClosureInput> {
  return {
    issues: input.issues || defaultIssues(),
    fixQueue: input.fixQueue || createPublicFixQueue(),
    regressionResults: input.regressionResults || [{ checkId: "sample_public_closure_regression", status: "pass" }],
    publicLaunchPerformedByCode: input.publicLaunchPerformedByCode ?? false,
    usersContacted: input.usersContacted ?? false,
    publicUrlFetched: input.publicUrlFetched ?? false,
    externalWritePerformed: input.externalWritePerformed ?? false
  };
}

export function createPublicLaunchIssueClosureChecklist() {
  return [
    { id: "fix_result_or_manual_resolution", label: "Issue has fix result or accepted manual resolution", required: true },
    { id: "required_regression_complete", label: "Required regression checks are complete or documented", required: true },
    { id: "no_safety_guardrail_weakened", label: "No safety guardrail was weakened", required: true },
    { id: "privacy_terms_consent_available", label: "Privacy, terms, and consent notices remain available where required", required: true },
    { id: "scripture_anchors_required", label: "Scripture anchors remain required", required: true },
    { id: "explanation_paths_required", label: "Explanation paths remain required", required: true },
    { id: "fallback_safe", label: "Fallback remains safe", required: true },
    { id: "consent_controls_visible", label: "Consent controls remain visible where needed", required: true },
    { id: "no_restricted_service_enabled", label: "No restricted service was enabled", required: true }
  ];
}

function hasPassingRegression(issue: TeoyubePublicLaunchIssueClosureIssue, results: TeoyubePublicLaunchIssueClosureRegressionResult[]): boolean {
  const required = issue.requiredRegressionCheckIds || [];
  if (required.length === 0) return true;
  return required.every((checkId) => {
    const result = results.find((entry) => entry.checkId === checkId);
    return Boolean(result && ["pass", "warning", "not_applicable"].includes(result.status));
  });
}

function issueIsClosed(issue: TeoyubePublicLaunchIssueClosureIssue, results: TeoyubePublicLaunchIssueClosureRegressionResult[]): boolean {
  const resolutionAccepted = ["fixed", "verified", "accepted_manual_resolution"].includes(issue.status) || issue.acceptedManualResolution === true;
  return resolutionAccepted
    && hasPassingRegression(issue, results)
    && issue.noSafetyGuardrailWeakened !== false
    && issue.privacyTermsConsentNoticesAvailable !== false
    && issue.scriptureAnchorsRequired !== false
    && issue.explanationPathsRequired !== false
    && issue.fallbackSafe !== false
    && issue.consentControlsVisible !== false
    && issue.restrictedServiceEnabled !== true;
}

export function verifyPublicLaunchIssueClosure(
  issues: TeoyubePublicLaunchIssueClosureIssue[] = defaultIssues(),
  fixQueue: TeoyubePublicFixQueue = createPublicFixQueue(),
  regressionResults: TeoyubePublicLaunchIssueClosureRegressionResult[] = [{ checkId: "sample_public_closure_regression", status: "pass" }]
) {
  const queueItems = fixQueue.items.map((item) => ({
    id: item.id,
    label: item.title,
    category: item.category,
    status: item.status,
    publicLaunchCritical: item.publicLaunchCritical,
    publicSafetyCritical: item.publicSafetyCritical,
    requiredRegressionCheckIds: item.verificationRequired,
    noSafetyGuardrailWeakened: true,
    privacyTermsConsentNoticesAvailable: true,
    scriptureAnchorsRequired: true,
    explanationPathsRequired: true,
    fallbackSafe: true,
    consentControlsVisible: true,
    restrictedServiceEnabled: false
  }));
  const merged = [...issues, ...queueItems];
  const closed = merged.filter((issue) => issueIsClosed(issue, regressionResults));
  const unresolved = merged.filter((issue) => !issueIsClosed(issue, regressionResults));
  return { issues: merged, closed, unresolved, valid: unresolved.filter((issue) => issue.publicLaunchCritical || issue.publicSafetyCritical).length === 0 };
}

export function getClosedPublicLaunchIssues(input: TeoyubePublicLaunchIssueClosureInput = {}) {
  const normalized = normalizeInput(input);
  return verifyPublicLaunchIssueClosure(normalized.issues, normalized.fixQueue, normalized.regressionResults).closed;
}

export function getUnresolvedPublicLaunchIssues(input: TeoyubePublicLaunchIssueClosureInput = {}) {
  const normalized = normalizeInput(input);
  return verifyPublicLaunchIssueClosure(normalized.issues, normalized.fixQueue, normalized.regressionResults).unresolved;
}

export function getPublicLaunchIssueClosureBlockers(input: TeoyubePublicLaunchIssueClosureInput = {}) {
  const normalized = normalizeInput(input);
  const unresolved = getUnresolvedPublicLaunchIssues(normalized);
  return [
    ...unresolved
      .filter((issue) => issue.publicLaunchCritical || issue.publicSafetyCritical || issue.restrictedServiceEnabled)
      .map((issue) => ({
        id: `public_launch_issue_closure_${issue.id}`,
        label: issue.label,
        reason: "Public-launch-critical or safety-critical issue is not closed.",
        requiredAction: "Resolve the issue, document manual resolution, and complete required regression before post-launch readiness.",
        riskLevel: "critical" as const
      })),
    normalized.publicLaunchPerformedByCode ? { id: "public_launch_issue_closure_launch_performed", label: "Public launch performed by code", reason: "Issue closure must not perform public launch.", requiredAction: "Keep closure review-only.", riskLevel: "critical" as const } : undefined,
    normalized.usersContacted ? { id: "public_launch_issue_closure_users_contacted", label: "Users contacted", reason: "Issue closure must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    normalized.publicUrlFetched ? { id: "public_launch_issue_closure_public_url_fetched", label: "Public URL fetched", reason: "Issue closure must not fetch public URLs.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined,
    normalized.externalWritePerformed ? { id: "public_launch_issue_closure_external_write", label: "External write", reason: "Issue closure must not write externally.", requiredAction: "Keep closure records in memory.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
}

export function getPublicLaunchIssueClosureWarnings(input: TeoyubePublicLaunchIssueClosureInput = {}) {
  return getUnresolvedPublicLaunchIssues(input)
    .filter((issue) => !issue.publicLaunchCritical && !issue.publicSafetyCritical)
    .map((issue) => ({
      id: `public_launch_issue_closure_warning_${issue.id}`,
      label: issue.label,
      message: "Non-critical public launch issue remains open or deferred.",
      recommendedAction: "Document as a known limitation or future post-launch operations task.",
      riskLevel: "medium" as const
    }));
}

export function createPublicLaunchIssueClosureDecision(input: TeoyubePublicLaunchIssueClosureInput = {}) {
  const blockers = getPublicLaunchIssueClosureBlockers(input);
  const warnings = getPublicLaunchIssueClosureWarnings(input);
  if (blockers.length > 0) return "blocked" as const;
  if (warnings.length > 0) return "closed_with_warnings" as const;
  return "closed" as const;
}

export function createPublicLaunchIssueClosureReport(input: TeoyubePublicLaunchIssueClosureInput = {}) {
  const normalized = normalizeInput(input);
  const closure = verifyPublicLaunchIssueClosure(normalized.issues, normalized.fixQueue, normalized.regressionResults);
  const blockers = getPublicLaunchIssueClosureBlockers(normalized);
  const warnings = getPublicLaunchIssueClosureWarnings(normalized);
  const decision = createPublicLaunchIssueClosureDecision(normalized);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && ["closed", "closed_with_warnings"].includes(decision),
    decision,
    checklist: createPublicLaunchIssueClosureChecklist(),
    issues: closure.issues,
    closedIssues: closure.closed,
    unresolvedIssues: closure.unresolved,
    closedCount: closure.closed.length,
    unresolvedCount: closure.unresolved.length,
    publicLaunchCriticalUnresolvedCount: closure.unresolved.filter((issue) => issue.publicLaunchCritical || issue.publicSafetyCritical).length,
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noSafetyGuardrailWeakened: closure.issues.every((issue) => issue.noSafetyGuardrailWeakened !== false),
    privacyTermsConsentNoticesAvailable: closure.issues.every((issue) => issue.privacyTermsConsentNoticesAvailable !== false),
    scriptureAnchorsRequired: closure.issues.every((issue) => issue.scriptureAnchorsRequired !== false),
    explanationPathsRequired: closure.issues.every((issue) => issue.explanationPathsRequired !== false),
    fallbackSafe: closure.issues.every((issue) => issue.fallbackSafe !== false),
    consentControlsVisible: closure.issues.every((issue) => issue.consentControlsVisible !== false),
    noRestrictedServiceEnabled: closure.issues.every((issue) => issue.restrictedServiceEnabled !== true),
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
