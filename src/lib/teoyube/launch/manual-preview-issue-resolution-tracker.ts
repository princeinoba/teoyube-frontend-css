import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueFixPlan,
  TeoyubeManualPreviewIssueStatus
} from "./manual-preview-issue-triage-contracts";
import { classifyManualPreviewIssue } from "./manual-preview-issue-classifier";

export type TeoyubeManualPreviewIssueVerification = {
  id: string;
  issueId: string;
  passed: boolean;
  summary: string;
  regressionCheckIds: string[];
  verifiedAt: string;
};

export type TeoyubeManualPreviewIssueResolutionTracker = {
  id: string;
  issues: TeoyubeManualPreviewIssue[];
  fixPlans: Record<string, TeoyubeManualPreviewIssueFixPlan>;
  verifications: TeoyubeManualPreviewIssueVerification[];
  inMemoryOnly: true;
  databaseWritten: false;
  analyticsSent: false;
  filesWritten: false;
  externalServicesCalled: false;
  createdAt: string;
  updatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

export function createManualPreviewIssueResolutionTracker(): TeoyubeManualPreviewIssueResolutionTracker {
  const createdAt = now();

  return {
    id: "manual_preview_issue_resolution_tracker",
    issues: [],
    fixPlans: {},
    verifications: [],
    inMemoryOnly: true,
    databaseWritten: false,
    analyticsSent: false,
    filesWritten: false,
    externalServicesCalled: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function addIssueToResolutionTracker(
  tracker: TeoyubeManualPreviewIssueResolutionTracker,
  issue: TeoyubeManualPreviewIssue
): TeoyubeManualPreviewIssueResolutionTracker {
  const normalized = classifyManualPreviewIssue(issue).normalizedIssue;
  const issues = tracker.issues.some((entry) => entry.id === normalized.id)
    ? tracker.issues.map((entry) => entry.id === normalized.id ? { ...entry, ...normalized, updatedAt: now() } : entry)
    : [...tracker.issues, { ...normalized, createdAt: normalized.createdAt || now(), updatedAt: now() }];

  return {
    ...tracker,
    issues,
    updatedAt: now()
  };
}

export function updateManualPreviewIssueStatus(
  tracker: TeoyubeManualPreviewIssueResolutionTracker,
  issueId: string,
  status: TeoyubeManualPreviewIssueStatus
): TeoyubeManualPreviewIssueResolutionTracker {
  return {
    ...tracker,
    issues: tracker.issues.map((issue) =>
      issue.id === issueId
        ? {
            ...issue,
            status,
            updatedAt: now()
          }
        : issue
    ),
    updatedAt: now()
  };
}

export function attachFixPlanToIssue(
  tracker: TeoyubeManualPreviewIssueResolutionTracker,
  issueId: string,
  fixPlan: TeoyubeManualPreviewIssueFixPlan
): TeoyubeManualPreviewIssueResolutionTracker {
  return {
    ...tracker,
    issues: tracker.issues.map((issue) =>
      issue.id === issueId
        ? {
            ...issue,
            status: issue.status === "verified" ? issue.status : "planned",
            updatedAt: now()
          }
        : issue
    ),
    fixPlans: {
      ...tracker.fixPlans,
      [issueId]: fixPlan
    },
    updatedAt: now()
  };
}

export function recordManualPreviewIssueVerification(
  tracker: TeoyubeManualPreviewIssueResolutionTracker,
  issueId: string,
  verification: Omit<TeoyubeManualPreviewIssueVerification, "id" | "issueId" | "verifiedAt"> & {
    id?: string;
    verifiedAt?: string;
  }
): TeoyubeManualPreviewIssueResolutionTracker {
  const normalized: TeoyubeManualPreviewIssueVerification = {
    id: verification.id || `manual_preview_issue_verification_${issueId}`,
    issueId,
    passed: verification.passed,
    summary: verification.summary,
    regressionCheckIds: verification.regressionCheckIds,
    verifiedAt: verification.verifiedAt || now()
  };

  return {
    ...tracker,
    issues: tracker.issues.map((issue) =>
      issue.id === issueId
        ? {
            ...issue,
            status: normalized.passed ? "verified" : "blocked",
            updatedAt: now()
          }
        : issue
    ),
    verifications: [
      ...tracker.verifications.filter((entry) => entry.id !== normalized.id),
      normalized
    ],
    updatedAt: now()
  };
}

export function getUnresolvedManualPreviewBlockers(
  tracker: TeoyubeManualPreviewIssueResolutionTracker
): TeoyubeManualPreviewIssue[] {
  return tracker.issues.filter((issue) => {
    const triage = classifyManualPreviewIssue(issue);
    return triage.softLaunchBlocking && issue.status !== "verified" && issue.status !== "fixed" && issue.status !== "wont_fix" && issue.status !== "deferred";
  });
}

export function summarizeManualPreviewIssueResolution(tracker: TeoyubeManualPreviewIssueResolutionTracker) {
  const unresolvedBlockers = getUnresolvedManualPreviewBlockers(tracker);

  return {
    issueCount: tracker.issues.length,
    plannedCount: tracker.issues.filter((issue) => issue.status === "planned").length,
    inProgressCount: tracker.issues.filter((issue) => issue.status === "in_progress").length,
    fixedCount: tracker.issues.filter((issue) => issue.status === "fixed").length,
    verifiedCount: tracker.issues.filter((issue) => issue.status === "verified").length,
    deferredCount: tracker.issues.filter((issue) => issue.status === "deferred").length,
    blockedCount: tracker.issues.filter((issue) => issue.status === "blocked").length,
    unresolvedBlockerCount: unresolvedBlockers.length,
    unresolvedBlockers,
    fixPlanCount: Object.keys(tracker.fixPlans).length,
    verificationCount: tracker.verifications.length,
    inMemoryOnly: tracker.inMemoryOnly,
    databaseWritten: tracker.databaseWritten,
    analyticsSent: tracker.analyticsSent,
    filesWritten: tracker.filesWritten,
    externalServicesCalled: tracker.externalServicesCalled,
    generatedAt: new Date().toISOString()
  };
}

export function createManualPreviewIssueResolutionReport(tracker: TeoyubeManualPreviewIssueResolutionTracker) {
  const summary = summarizeManualPreviewIssueResolution(tracker);

  return {
    readyForRegressionVerification: summary.unresolvedBlockerCount === 0 && summary.issueCount > 0,
    tracker,
    summary,
    noExternalWrite: tracker.inMemoryOnly && !tracker.databaseWritten && !tracker.analyticsSent && !tracker.filesWritten && !tracker.externalServicesCalled,
    generatedAt: new Date().toISOString()
  };
}
