import { createManualPreviewFixPlans } from "../manual-preview-fix-plan-generator";
import { createFixPlanSafetyReport } from "../manual-preview-fix-plan-safety";
import {
  createFixImplementationReadinessReport
} from "../manual-preview-fix-implementation-readiness";
import { createManualPreviewIssueClassificationReport } from "../manual-preview-issue-classifier";
import {
  createManualPreviewIssueOwnerReviewRecord,
  createManualPreviewIssueOwnerReviewReport
} from "../manual-preview-issue-owner-review";
import {
  addIssueToResolutionTracker,
  attachFixPlanToIssue,
  createManualPreviewIssueResolutionReport,
  createManualPreviewIssueResolutionTracker
} from "../manual-preview-issue-resolution-tracker";
import { runManualPreviewIssueTriageAudit } from "../manual-preview-issue-triage-audit";
import { createManualPreviewIssueTriageReport } from "../manual-preview-issue-triage-engine";
import { createRegressionCheckReport } from "../manual-preview-regression-check-mapper";
import type { TeoyubeManualPreviewIssue } from "../manual-preview-issue-triage-contracts";

export function createManualPreviewDeployment23SampleIssues(): TeoyubeManualPreviewIssue[] {
  return [
    {
      id: "sample_missing_scripture_anchor",
      title: "TIG response is missing Scripture anchor",
      details: "The Promise Search response rendered prayer and action text without a visible Scripture reference.",
      category: "scripture_anchor",
      severity: "critical",
      source: "postdeployment_qa",
      surface: "tig_response_panel",
      recommendedAction: "Restore Scripture evidence and verify the explanation path."
    },
    {
      id: "sample_mobile_overflow",
      title: "Mobile layout overflow on graph preview",
      details: "The graph preview labels overflow on a narrow viewport.",
      category: "mobile_ui",
      severity: "high",
      source: "mobile_accessibility_verification",
      surface: "tig_graph_preview",
      recommendedAction: "Patch layout with responsive wrapping and rerun mobile QA."
    },
    {
      id: "sample_content_clarity",
      title: "Reflection copy is unclear",
      details: "The reflection prompt needs clearer wording but still includes Scripture and fallback behavior.",
      category: "content_clarity",
      severity: "low",
      source: "manual_owner_review",
      surface: "tig_response_panel",
      deferrable: true
    }
  ];
}

export function runManualPreviewDeployment23Example() {
  const issues = createManualPreviewDeployment23SampleIssues();
  const classification = createManualPreviewIssueClassificationReport(issues);
  const triage = createManualPreviewIssueTriageReport(issues);
  const fixPlans = createManualPreviewFixPlans(issues);
  const safety = createFixPlanSafetyReport(fixPlans);
  const regression = createRegressionCheckReport(fixPlans);
  const readiness = createFixImplementationReadinessReport(fixPlans);
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
    nextFixStepApproved: true,
    notes: "Sample owner review accepts the safe fix plan order for Manual Preview Deployment 2.3."
  }));
  let tracker = createManualPreviewIssueResolutionTracker();
  issues.forEach((issue) => {
    tracker = addIssueToResolutionTracker(tracker, issue);
  });
  fixPlans.forEach((fixPlan) => {
    tracker = attachFixPlanToIssue(tracker, fixPlan.issueId, fixPlan);
  });
  const resolution = createManualPreviewIssueResolutionReport(tracker);
  const audit = runManualPreviewIssueTriageAudit();

  return {
    issues,
    classification,
    triage,
    fixPlans,
    safety,
    regression,
    tracker,
    resolution,
    readiness,
    ownerReview,
    audit,
    noActualDeploymentPerformed: true,
    noPreviewUrlFetched: true,
    noFixesApplied: true,
    noExternalServicesCalled: true,
    generatedAt: new Date().toISOString()
  };
}
