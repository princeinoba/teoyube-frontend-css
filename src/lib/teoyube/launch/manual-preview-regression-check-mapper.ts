import { classifyManualPreviewIssue } from "./manual-preview-issue-classifier";
import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueCategory,
  TeoyubeManualPreviewIssueFixPlan,
  TeoyubeManualPreviewIssueRegressionCheck
} from "./manual-preview-issue-triage-contracts";

function regressionCheck(
  category: TeoyubeManualPreviewIssueCategory,
  idSuffix: string,
  label: string,
  verificationModule: string,
  launchCritical = true
): TeoyubeManualPreviewIssueRegressionCheck {
  return {
    id: `${category}_${idSuffix}`.replace(/[^a-zA-Z0-9_-]/g, "_"),
    label,
    category,
    required: true,
    launchCritical,
    verificationModule,
    details: `Verify this by running or manually reviewing ${verificationModule}.`
  };
}

const REGRESSION_CHECKS: Record<TeoyubeManualPreviewIssueCategory, TeoyubeManualPreviewIssueRegressionCheck[]> = {
  build: [regressionCheck("build", "build_verification", "Build verification passes", "build-verification-runner")],
  environment: [regressionCheck("environment", "environment_safety", "Environment safety audit passes", "launch-environment-safety-audit")],
  route: [regressionCheck("route", "route_build", "Route build readiness passes", "route-build-readiness")],
  mobile_ui: [regressionCheck("mobile_ui", "mobile_accessibility", "Mobile/accessibility verification passes", "manual-preview-mobile-accessibility-verification")],
  accessibility: [regressionCheck("accessibility", "accessibility_audit", "Accessibility audit passes", "launch-accessibility-audit")],
  tig_response: [regressionCheck("tig_response", "tig_production_qa", "TIG production QA passes", "launch-tig-production-qa")],
  scripture_anchor: [regressionCheck("scripture_anchor", "scripture_explanation", "Scripture/explanation verification passes", "manual-preview-scripture-explanation-verification")],
  explanation_path: [regressionCheck("explanation_path", "tig_production_qa", "TIG production QA explanation paths pass", "launch-tig-production-qa")],
  fallback: [regressionCheck("fallback", "fallback_offline", "Fallback/offline verification passes", "manual-preview-fallback-offline-verification")],
  confidence: [regressionCheck("confidence", "tig_confidence", "Confidence QA passes", "launch-tig-production-qa")],
  consent: [regressionCheck("consent", "consent_privacy", "Consent/privacy verification passes", "manual-preview-consent-privacy-verification")],
  feedback_controls: [regressionCheck("feedback_controls", "feedback_safety", "Feedback safety verification passes", "soft-launch-feedback-safety")],
  personalization: [regressionCheck("personalization", "personalization_qa", "Personalization QA passes", "launch-personalization-qa")],
  offline: [regressionCheck("offline", "fallback_offline", "Offline fallback verification passes", "manual-preview-fallback-offline-verification")],
  privacy: [regressionCheck("privacy", "final_safety", "Final safety certification passes", "final-launch-safety-certification")],
  debug_safety: [regressionCheck("debug_safety", "launch_safety", "Launch safety review passes", "launch-safety-review")],
  security: [regressionCheck("security", "environment_safety", "Environment safety audit passes", "launch-environment-safety-audit")],
  content_clarity: [regressionCheck("content_clarity", "surface_readiness", "Surface readiness review passes", "launch-surface-readiness-report", false)],
  performance: [regressionCheck("performance", "performance_budget", "Performance readiness review passes", "performance-budget", false)],
  unknown: [regressionCheck("unknown", "owner_review", "Owner review classifies issue", "manual-preview-issue-owner-review", false)]
};

export function getRegressionChecksForIssue(issue: TeoyubeManualPreviewIssue): TeoyubeManualPreviewIssueRegressionCheck[] {
  const category = classifyManualPreviewIssue(issue).category;
  return REGRESSION_CHECKS[category] || REGRESSION_CHECKS.unknown;
}

export function getRegressionChecksForFixPlan(fixPlan: TeoyubeManualPreviewIssueFixPlan): TeoyubeManualPreviewIssueRegressionCheck[] {
  return fixPlan.regressionChecks.length > 0
    ? fixPlan.regressionChecks
    : REGRESSION_CHECKS[fixPlan.issueCategory] || REGRESSION_CHECKS.unknown;
}

export function createRegressionCheckPlan(fixPlans: TeoyubeManualPreviewIssueFixPlan[]) {
  const checksByFixPlan = fixPlans.map((fixPlan) => ({
    fixPlanId: fixPlan.id,
    issueId: fixPlan.issueId,
    checks: getRegressionChecksForFixPlan(fixPlan)
  }));

  return {
    fixPlanCount: fixPlans.length,
    checkCount: checksByFixPlan.reduce((count, entry) => count + entry.checks.length, 0),
    checksByFixPlan,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function getCriticalRegressionChecks(fixPlans: TeoyubeManualPreviewIssueFixPlan[]): TeoyubeManualPreviewIssueRegressionCheck[] {
  const seen = new Set<string>();
  return fixPlans
    .flatMap(getRegressionChecksForFixPlan)
    .filter((check) => check.launchCritical)
    .filter((check) => {
      if (seen.has(check.id)) return false;
      seen.add(check.id);
      return true;
    });
}

export function createRegressionCheckReport(fixPlans: TeoyubeManualPreviewIssueFixPlan[]) {
  const plan = createRegressionCheckPlan(fixPlans);
  const criticalChecks = getCriticalRegressionChecks(fixPlans);

  return {
    valid: plan.checkCount >= fixPlans.length,
    ...plan,
    criticalCheckCount: criticalChecks.length,
    criticalChecks,
    noFixesApplied: true,
    noPreviewUrlFetched: true
  };
}
