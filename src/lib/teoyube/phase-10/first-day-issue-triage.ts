import type {
  TeoyubeFirstDayIssue,
  TeoyubeFirstDayIssueArea,
  TeoyubeFirstDayIssueSeverity,
  TeoyubeFirstDayIssueSource,
  TeoyubeFirstDayIssueStatus,
  TeoyubeFirstDayIssueTriageBlocker,
  TeoyubeFirstDayIssueTriageDecision,
  TeoyubeFirstDayIssueTriageReport,
  TeoyubeFirstDayIssueTriageResult,
  TeoyubeFirstDayIssueTriageWarning
} from "./first-day-issue-triage-contracts";

export type TeoyubeFirstDayIssueInput = Partial<{
  id: string;
  source: TeoyubeFirstDayIssueSource;
  area: TeoyubeFirstDayIssueArea;
  status: TeoyubeFirstDayIssueStatus;
  summary: string;
  affectedRouteOrSurface: string;
  appDoesNotLoad: boolean;
  privateDataExposed: boolean;
  secretExposed: boolean;
  mainRouteCrashes: boolean;
  dangerouslyMisleadingSpiritualContent: boolean;
  coreExperienceUnusable: boolean;
  tigResponsePanelFails: boolean;
  canonPageUnusable: boolean;
  callingCompassPageUnusable: boolean;
  aiResponseFailsRepeatedlyIfEnabled: boolean;
  feedbackIntakeBreaks: boolean;
  mobileLayoutBlocksCoreUse: boolean;
  minorLayoutIssue: boolean;
  typo: boolean;
  oneCardMisaligned: boolean;
  nonCriticalImageCropIssue: boolean;
  userConfusionInOneSection: boolean;
  slowLoadingButUsable: boolean;
  cosmeticIssue: boolean;
  wordingImprovement: boolean;
  optionalEnhancementRequest: boolean;
  futureFeatureIdea: boolean;
  preferenceBasedUiFeedback: boolean;
  notes: string[];
}>;

function inferSeverity(input: TeoyubeFirstDayIssueInput = {}): TeoyubeFirstDayIssueSeverity {
  if (
    input.appDoesNotLoad ||
    input.privateDataExposed ||
    input.secretExposed ||
    input.mainRouteCrashes ||
    input.dangerouslyMisleadingSpiritualContent ||
    input.coreExperienceUnusable
  ) return "severity_1_critical";
  if (
    input.tigResponsePanelFails ||
    input.canonPageUnusable ||
    input.callingCompassPageUnusable ||
    input.aiResponseFailsRepeatedlyIfEnabled ||
    input.feedbackIntakeBreaks ||
    input.mobileLayoutBlocksCoreUse
  ) return "severity_2_high";
  if (
    input.minorLayoutIssue ||
    input.typo ||
    input.oneCardMisaligned ||
    input.nonCriticalImageCropIssue ||
    input.userConfusionInOneSection ||
    input.slowLoadingButUsable
  ) return "severity_3_medium";
  return "severity_4_low";
}

function inferArea(input: TeoyubeFirstDayIssueInput, severity: TeoyubeFirstDayIssueSeverity): TeoyubeFirstDayIssueArea {
  if (input.area) return input.area;
  if (input.appDoesNotLoad) return "app_load";
  if (input.mainRouteCrashes) return "route_crash";
  if (input.privateDataExposed) return "private_data_exposure";
  if (input.secretExposed) return "secret_exposure";
  if (input.dangerouslyMisleadingSpiritualContent) return "spiritual_safety";
  if (input.tigResponsePanelFails) return "tig_failure";
  if (input.canonPageUnusable) return "canon_failure";
  if (input.callingCompassPageUnusable) return "calling_compass_failure";
  if (input.feedbackIntakeBreaks) return "feedback_failure";
  if (input.mobileLayoutBlocksCoreUse) return "mobile_blocker";
  if (input.typo) return "content_typo";
  if (input.minorLayoutIssue || input.oneCardMisaligned || input.nonCriticalImageCropIssue) return "minor_layout";
  if (severity === "severity_4_low") return "future_enhancement";
  return "unknown";
}

function decisionForSeverity(severity: TeoyubeFirstDayIssueSeverity, input: TeoyubeFirstDayIssueInput): TeoyubeFirstDayIssueTriageDecision {
  if (severity === "severity_1_critical") return input.privateDataExposed || input.secretExposed || input.appDoesNotLoad ? "rollback" : "pause";
  if (severity === "severity_2_high") return "fix_before_continue";
  if (severity === "severity_3_medium") return "add_to_safe_fix_queue";
  return "defer_to_backlog";
}

function statusForDecision(decision: TeoyubeFirstDayIssueTriageDecision): TeoyubeFirstDayIssueStatus {
  if (decision === "rollback") return "rollback_required";
  if (decision === "pause") return "confirmed";
  if (decision === "fix_before_continue") return "safe_fix_requested";
  if (decision === "add_to_safe_fix_queue") return "safe_fix_requested";
  if (decision === "defer_to_backlog") return "deferred";
  return "reviewing";
}

export function createFirstDayIssue(input: TeoyubeFirstDayIssueInput = {}): TeoyubeFirstDayIssue {
  const severity = inferSeverity(input);
  const decision = decisionForSeverity(severity, input);
  return {
    id: input.id || `first_day_issue_${Date.now()}`,
    source: input.source || "unknown",
    area: inferArea(input, severity),
    severity,
    status: input.status || statusForDecision(decision),
    summary: input.summary || "Manual first-day issue placeholder.",
    affectedRouteOrSurface: input.affectedRouteOrSurface,
    scriptureSafetyConcern: Boolean(input.dangerouslyMisleadingSpiritualContent),
    privateOrSecretExposure: Boolean(input.privateDataExposed || input.secretExposed),
    notes: input.notes || []
  };
}

export function triageFirstDayIssue(input: TeoyubeFirstDayIssueInput = {}): TeoyubeFirstDayIssueTriageResult {
  const issue = createFirstDayIssue(input);
  const decision = decisionForSeverity(issue.severity, input);
  return {
    issue,
    decision,
    rationale: issue.severity === "severity_1_critical"
      ? "Critical first-day issue requires immediate pause or rollback review."
      : issue.severity === "severity_2_high"
        ? "High first-day issue requires a safe fix before wider release continues."
        : issue.severity === "severity_3_medium"
          ? "Medium first-day issue should enter safe-fix queue or stabilization backlog."
          : "Low first-day issue should be deferred to backlog or first-week review.",
    safeFixCandidate: issue.severity === "severity_2_high" || issue.severity === "severity_3_medium",
    rollbackReviewRequired: decision === "rollback"
  };
}

export function recordFirstDayIssueTriageResult(results: TeoyubeFirstDayIssueTriageResult[], result: TeoyubeFirstDayIssueTriageResult): TeoyubeFirstDayIssueTriageResult[] {
  return [...results.filter((entry) => entry.issue.id !== result.issue.id), result];
}

export function createFirstDayIssueTriageDecision(input: TeoyubeFirstDayIssueInput = {}): TeoyubeFirstDayIssueTriageDecision {
  return triageFirstDayIssue(input).decision;
}

export function getFirstDayIssueTriageBlockers(input: TeoyubeFirstDayIssueInput = {}): TeoyubeFirstDayIssueTriageBlocker[] {
  const result = triageFirstDayIssue(input);
  return result.issue.severity === "severity_1_critical"
    ? [{ id: `${result.issue.id}_critical`, issueId: result.issue.id, message: result.issue.summary }]
    : [];
}

export function getFirstDayIssueTriageWarnings(input: TeoyubeFirstDayIssueInput = {}): TeoyubeFirstDayIssueTriageWarning[] {
  const result = triageFirstDayIssue(input);
  if (result.issue.severity === "severity_2_high") return [{ id: `${result.issue.id}_high`, issueId: result.issue.id, message: "Pause wider release and fix before continuing." }];
  if (result.issue.severity === "severity_3_medium") return [{ id: `${result.issue.id}_medium`, issueId: result.issue.id, message: "Add to safe-fix queue or stabilization backlog." }];
  return [{ id: `${result.issue.id}_low`, issueId: result.issue.id, message: "Defer to backlog or first-week review." }];
}

export function createFirstDayIssueTriageReport(input: TeoyubeFirstDayIssueInput = {}): TeoyubeFirstDayIssueTriageReport {
  const blockers = getFirstDayIssueTriageBlockers(input);
  return {
    valid: blockers.length === 0,
    result: triageFirstDayIssue(input),
    blockers,
    warnings: getFirstDayIssueTriageWarnings(input),
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
