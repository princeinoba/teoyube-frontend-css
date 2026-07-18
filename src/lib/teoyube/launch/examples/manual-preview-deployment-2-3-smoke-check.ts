import { createManualPreviewFixPlan, createManualPreviewFixPlans } from "../manual-preview-fix-plan-generator";
import { createFixPlanSafetyReport, validateManualPreviewFixPlanSafety } from "../manual-preview-fix-plan-safety";
import { createFixImplementationReadinessReport } from "../manual-preview-fix-implementation-readiness";
import {
  classifyManualPreviewIssue,
  isLaunchCriticalManualPreviewIssue
} from "../manual-preview-issue-classifier";
import {
  createManualPreviewIssueOwnerReviewChecklist,
  createManualPreviewIssueOwnerReviewRecord,
  createManualPreviewIssueOwnerReviewReport
} from "../manual-preview-issue-owner-review";
import {
  addIssueToResolutionTracker,
  attachFixPlanToIssue,
  createManualPreviewIssueResolutionReport,
  createManualPreviewIssueResolutionTracker,
  getUnresolvedManualPreviewBlockers
} from "../manual-preview-issue-resolution-tracker";
import { runManualPreviewIssueTriageAudit } from "../manual-preview-issue-triage-audit";
import { createManualPreviewIssueTriageReport } from "../manual-preview-issue-triage-engine";
import { createRegressionCheckReport, getRegressionChecksForIssue } from "../manual-preview-regression-check-mapper";
import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueFixPlan
} from "../manual-preview-issue-triage-contracts";

export type ManualPreviewDeployment23SmokeCheckReport = {
  valid: boolean;
  errors: string[];
  noActualDeploymentPerformed: true;
  noPreviewUrlFetched: true;
  noFixesApplied: true;
  noDatabaseRequired: true;
  noExternalApisRequired: true;
  noAnalyticsProviderRequired: true;
  noServiceWorkerRequired: true;
  noBrowserStorageRequired: true;
  noFileWritesRequired: true;
  generatedAt: string;
};

function sampleIssues(): TeoyubeManualPreviewIssue[] {
  return [
    {
      id: "smoke_missing_scripture_anchor",
      title: "Missing Scripture anchor in TIG response",
      details: "The response displayed a prayer without Scripture anchor evidence.",
      source: "postdeployment_qa",
      surface: "tig_response_panel"
    },
    {
      id: "smoke_consent_missing",
      title: "Consent controls missing where personalization appears",
      details: "Personalized preview is visible but the consent controls are missing.",
      source: "consent_privacy_verification",
      surface: "personalization_preview_panel"
    }
  ];
}

function createUnsafeFixPlan(): TeoyubeManualPreviewIssueFixPlan {
  const base = createManualPreviewFixPlan(sampleIssues()[0]);
  return {
    ...base,
    id: "unsafe_fix_plan",
    recommendedFixSummary: "Remove Scripture anchor and enable external analytics to simplify the response.",
    safeImplementationNotes: ["Hide the explanation path and connect database writes."]
  };
}

function assert(condition: boolean, message: string): string {
  return condition ? "" : message;
}

export function runManualPreviewDeployment23SmokeCheck(): ManualPreviewDeployment23SmokeCheckReport {
  const issues = sampleIssues();
  const classification = issues.map(classifyManualPreviewIssue);
  const triage = createManualPreviewIssueTriageReport(issues);
  const fixPlans = createManualPreviewFixPlans(issues);
  const safety = createFixPlanSafetyReport(fixPlans);
  const unsafeSafety = validateManualPreviewFixPlanSafety(createUnsafeFixPlan());
  const regression = createRegressionCheckReport(fixPlans);
  const ownerReviewChecklist = createManualPreviewIssueOwnerReviewChecklist();
  const ownerReview = createManualPreviewIssueOwnerReviewReport(createManualPreviewIssueOwnerReviewRecord({
    criticalBlockersReviewed: true,
    scriptureAnchorIssuesReviewed: true,
    explanationPathIssuesReviewed: true,
    fallbackSafetyIssuesReviewed: true,
    consentPrivacyIssuesReviewed: true,
    mobileAccessibilityIssuesReviewed: true,
    fixPrioritiesAccepted: true,
    deferredIssuesAccepted: true,
    softLaunchBlockerListAccepted: true,
    nextFixStepApproved: true
  }));
  let tracker = createManualPreviewIssueResolutionTracker();
  issues.forEach((issue) => {
    tracker = addIssueToResolutionTracker(tracker, issue);
  });
  fixPlans.forEach((fixPlan) => {
    tracker = attachFixPlanToIssue(tracker, fixPlan.issueId, fixPlan);
  });
  const resolution = createManualPreviewIssueResolutionReport(tracker);
  const readiness = createFixImplementationReadinessReport(fixPlans);
  const audit = runManualPreviewIssueTriageAudit();
  const errors = [
    assert(classification.length === issues.length, "Issue classifier should classify all sample issues."),
    assert(isLaunchCriticalManualPreviewIssue(issues[0]), "Missing Scripture anchor should be launch-critical."),
    assert(triage.issueCount === issues.length && triage.blockerCount >= 1, "Triage report should include structured blockers."),
    assert(fixPlans.length === issues.length, "Fix plan generator should create a plan for each issue."),
    assert(safety.valid, "Safe generated fix plans should pass safety validation."),
    assert(!unsafeSafety.valid && unsafeSafety.blockers.length >= 2, "Unsafe fix plan should be blocked by safety validation."),
    assert(getRegressionChecksForIssue(issues[0]).length > 0 && regression.checkCount >= fixPlans.length, "Regression checks should be mapped."),
    assert(tracker.inMemoryOnly && !tracker.databaseWritten && !tracker.analyticsSent && !tracker.filesWritten && !tracker.externalServicesCalled, "Resolution tracker should remain in-memory only."),
    assert(getUnresolvedManualPreviewBlockers(tracker).length >= 1 && resolution.noExternalWrite, "Resolution report should expose unresolved blockers without external writes."),
    assert(["ready_after_owner_review", "ready_for_safe_fixes", "blocked"].includes(readiness.decision), "Fix implementation readiness should return a structured decision."),
    assert(ownerReviewChecklist.length >= 10 && ownerReview.valid, "Owner review checklist should exist and accepted sample should validate."),
    assert(audit.complete && audit.completionPercentage === 100, "Manual Preview Deployment 2.3 audit should be complete.")
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noPreviewUrlFetched: true,
    noFixesApplied: true,
    noDatabaseRequired: true,
    noExternalApisRequired: true,
    noAnalyticsProviderRequired: true,
    noServiceWorkerRequired: true,
    noBrowserStorageRequired: true,
    noFileWritesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
