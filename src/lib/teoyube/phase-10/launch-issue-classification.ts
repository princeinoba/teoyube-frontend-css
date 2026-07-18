import type {
  TeoyubeLaunchIssue,
  TeoyubeLaunchIssueArea,
  TeoyubeLaunchIssueClassificationReport,
  TeoyubeLaunchIssueClassificationResult,
  TeoyubeLaunchIssueDecision,
  TeoyubeLaunchIssueSeverity,
  TeoyubeLaunchIssueStatus
} from "./launch-issue-classification-contracts";

export type TeoyubeLaunchIssueClassificationInput = Partial<{
  id: string;
  area: TeoyubeLaunchIssueArea;
  status: TeoyubeLaunchIssueStatus;
  summary: string;
  routeOrSurface: string;
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

export function getLaunchIssueSeverity(input: TeoyubeLaunchIssueClassificationInput = {}): TeoyubeLaunchIssueSeverity {
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

function inferArea(input: TeoyubeLaunchIssueClassificationInput, severity: TeoyubeLaunchIssueSeverity): TeoyubeLaunchIssueArea {
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

export function getLaunchIssueDecision(input: TeoyubeLaunchIssueClassificationInput = {}): TeoyubeLaunchIssueDecision {
  const severity = getLaunchIssueSeverity(input);
  if (severity === "severity_1_critical") return input.secretExposed || input.privateDataExposed || input.appDoesNotLoad ? "rollback" : "pause";
  if (severity === "severity_2_high") return "fix_before_continue";
  if (severity === "severity_3_medium") return "defer_to_stabilization";
  return "defer_to_stabilization";
}

function statusForDecision(decision: TeoyubeLaunchIssueDecision): TeoyubeLaunchIssueStatus {
  if (decision === "rollback") return "rollback_required";
  if (decision === "pause") return "paused_release";
  if (decision === "fix_before_continue") return "fix_required";
  if (decision === "defer_to_stabilization") return "deferred";
  return "reviewing";
}

export function classifyLaunchIssue(input: TeoyubeLaunchIssueClassificationInput = {}): TeoyubeLaunchIssueClassificationResult {
  const severity = getLaunchIssueSeverity(input);
  const decision = getLaunchIssueDecision(input);
  const issue: TeoyubeLaunchIssue = {
    id: input.id || `launch_issue_${Date.now()}`,
    area: inferArea(input, severity),
    severity,
    status: input.status || statusForDecision(decision),
    summary: input.summary || "Manual launch issue classification placeholder.",
    routeOrSurface: input.routeOrSurface,
    scriptureSafetyConcern: Boolean(input.dangerouslyMisleadingSpiritualContent),
    privateOrSecretExposure: Boolean(input.privateDataExposed || input.secretExposed),
    notes: input.notes || []
  };
  return {
    issue,
    severity,
    decision,
    rationale: severity === "severity_1_critical"
      ? "Critical launch issue requires pause or rollback review."
      : severity === "severity_2_high"
        ? "High priority issue requires fix before wider release continues."
        : severity === "severity_3_medium"
          ? "Medium issue is logged for stabilization while core use remains possible."
          : "Low issue is deferred to backlog or stabilization review."
  };
}

export function getLaunchIssueBlockers(input: TeoyubeLaunchIssueClassificationInput = {}): string[] {
  const result = classifyLaunchIssue(input);
  return result.severity === "severity_1_critical" ? [`${result.issue.area}: ${result.issue.summary}`] : [];
}

export function getLaunchIssueWarnings(input: TeoyubeLaunchIssueClassificationInput = {}): string[] {
  const result = classifyLaunchIssue(input);
  if (result.severity === "severity_2_high") return [`${result.issue.area}: fix before continuing wider release.`];
  if (result.severity === "severity_3_medium") return [`${result.issue.area}: log for Phase 10.4 stabilization.`];
  return [`${result.issue.area}: defer to backlog or first-day review.`];
}

export function createLaunchIssueClassificationReport(input: TeoyubeLaunchIssueClassificationInput = {}): TeoyubeLaunchIssueClassificationReport {
  const blockers = getLaunchIssueBlockers(input);
  return {
    valid: blockers.length === 0,
    result: classifyLaunchIssue(input),
    blockers,
    warnings: getLaunchIssueWarnings(input),
    noExternalServicesRequired: true,
    noAutomaticUserContact: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
