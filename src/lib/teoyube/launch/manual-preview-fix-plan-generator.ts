import {
  classifyManualPreviewIssue,
  isSoftLaunchBlockingIssue
} from "./manual-preview-issue-classifier";
import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueCategory,
  TeoyubeManualPreviewIssueFixPlan,
  TeoyubeManualPreviewIssueFixStep,
  TeoyubeManualPreviewIssueRegressionCheck,
  TeoyubeManualPreviewIssueSeverity
} from "./manual-preview-issue-triage-contracts";

type CategoryFixTemplate = {
  summary: string;
  notes: string[];
  checks: TeoyubeManualPreviewIssueRegressionCheck[];
};

function now(): string {
  return new Date().toISOString();
}

function id(prefix: string, issueId: string): string {
  return `${prefix}_${issueId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function check(
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
    details: `Run or review ${verificationModule} after the fix.`
  };
}

const CATEGORY_FIX_PLANS: Record<TeoyubeManualPreviewIssueCategory, CategoryFixTemplate> = {
  build: {
    summary: "Fix the build or compile failure with the smallest local code change, then rerun build verification.",
    notes: ["Do not change deployment providers while fixing build issues.", "Keep the fix local and reversible."],
    checks: [check("build", "build_verification", "Build verification passes", "build-verification-runner")]
  },
  environment: {
    summary: "Restore preview-safe environment flags and keep analytics, persistence, and live AI disabled.",
    notes: ["Do not write real secret values into files.", "Review environment safety before any provider dashboard change."],
    checks: [check("environment", "environment_safety", "Environment safety audit passes", "launch-environment-safety-audit")]
  },
  route: {
    summary: "Restore the affected route so it renders without crash, blank state, or missing fallback.",
    notes: ["Keep route changes scoped to the affected surface.", "Verify fallback rendering remains Scripture-anchored."],
    checks: [check("route", "route_build", "Route build readiness passes", "route-build-readiness")]
  },
  mobile_ui: {
    summary: "Patch the layout with responsive stacking, wrapping, spacing, and touch-safe controls.",
    notes: ["Avoid hiding launch-critical content on mobile.", "Scripture anchors and explanation paths must remain visible or reachable."],
    checks: [check("mobile_ui", "mobile_accessibility", "Mobile and accessibility verification passes", "manual-preview-mobile-accessibility-verification")]
  },
  accessibility: {
    summary: "Fix the accessibility blocker with semantic labels, keyboard access, focus handling, and sufficient contrast.",
    notes: ["Do not replace text with unlabeled icons.", "Keep controls keyboard reachable."],
    checks: [check("accessibility", "accessibility_audit", "Accessibility audit passes", "launch-accessibility-audit")]
  },
  tig_response: {
    summary: "Restore TIG response completeness, including Scripture, prayer, reflection, action, confidence, and explanation path.",
    notes: ["Do not weaken Scripture anchoring.", "Keep confidence bounded between 0 and 1."],
    checks: [check("tig_response", "tig_production_qa", "TIG production QA passes", "launch-tig-production-qa")]
  },
  scripture_anchor: {
    summary: "Restore Scripture evidence and verify that the TIG explanation path references the Scripture anchor.",
    notes: ["Every usable TIG response must include at least one Scripture anchor.", "Do not replace Scripture with emotion-only language."],
    checks: [check("scripture_anchor", "scripture_explanation", "Scripture and explanation verification passes", "manual-preview-scripture-explanation-verification")]
  },
  explanation_path: {
    summary: "Ensure the production response includes a traceable explanation path from user input to Scripture-backed output.",
    notes: ["Decision trace and graph trace should remain inspectable.", "Do not hide explanation paths for normal users when they are needed for trust."],
    checks: [check("explanation_path", "tig_production_qa", "TIG production QA explanation path passes", "launch-tig-production-qa")]
  },
  fallback: {
    summary: "Replace unsafe or empty fallback behavior with a Scripture-anchored safe fallback.",
    notes: ["Fallbacks must be non-empty, pastoral, bounded, and Scripture-anchored.", "Do not claim divine certainty."],
    checks: [check("fallback", "fallback_offline", "Fallback and offline verification passes", "manual-preview-fallback-offline-verification")]
  },
  confidence: {
    summary: "Restore confidence labels and keep confidence values bounded without overstating certainty.",
    notes: ["Confidence must not imply divine certainty.", "Use plain confidence labels and explanations."],
    checks: [check("confidence", "tig_confidence", "TIG confidence QA passes", "launch-tig-production-qa")]
  },
  consent: {
    summary: "Restore consent controls or disable personalization preview on the affected surface.",
    notes: ["Personalization must be visible, consent-aware, and reversible.", "Keep personalization explicit and user-controlled."],
    checks: [check("consent", "consent_privacy", "Consent and privacy verification passes", "manual-preview-consent-privacy-verification")]
  },
  feedback_controls: {
    summary: "Restore feedback controls without sending analytics or storing raw sensitive text.",
    notes: ["Feedback remains local/manual at this stage.", "External analytics remains disabled."],
    checks: [check("feedback_controls", "feedback_safety", "Feedback safety rules pass", "soft-launch-feedback-safety")]
  },
  personalization: {
    summary: "Keep personalization preview explicit, consent-aware, and reversible, or disable it on the affected surface.",
    notes: ["Memory remains visible and reversible.", "Only privacy-safe personalization summaries are allowed."],
    checks: [check("personalization", "personalization_qa", "Personalization QA passes", "launch-personalization-qa")]
  },
  offline: {
    summary: "Restore offline/read-only fallback behavior without service workers or persistent sensitive storage.",
    notes: ["Offline fallback must remain Scripture-anchored.", "Do not add service workers in this phase."],
    checks: [check("offline", "fallback_offline", "Fallback and offline verification passes", "manual-preview-fallback-offline-verification")]
  },
  privacy: {
    summary: "Remove exposed raw sensitive text and keep privacy-safe summaries only.",
    notes: ["Store only privacy-safe summaries.", "Keep debug and private payloads out of normal UI."],
    checks: [check("privacy", "final_safety", "Final safety certification passes", "final-launch-safety-certification")]
  },
  debug_safety: {
    summary: "Hide debug payloads behind explicit developer-only controls such as showDebugInfo.",
    notes: ["Normal users must not see debug payloads.", "Keep stack traces, graph internals, secrets, and raw text out of normal UI."],
    checks: [check("debug_safety", "launch_safety", "Launch safety review passes", "launch-safety-review")]
  },
  security: {
    summary: "Remove any exposed secret-looking data and restore safe environment boundaries.",
    notes: ["Never write real secrets into source files.", "Review public environment variables for secret-like names or values."],
    checks: [check("security", "environment_safety", "Environment safety audit passes", "launch-environment-safety-audit")]
  },
  content_clarity: {
    summary: "Clarify the affected copy without changing Scripture anchors, theology, or launch-critical behavior.",
    notes: ["Keep language pastoral and bounded.", "Do not add certainty claims."],
    checks: [check("content_clarity", "surface_review", "Surface review passes", "launch-surface-readiness-report", false)]
  },
  performance: {
    summary: "Reduce render cost or payload size while preserving Scripture, explanation, and fallback visibility.",
    notes: ["Do not remove launch-critical content to improve performance.", "Prefer deferring heavy graph visuals over removing response text."],
    checks: [check("performance", "performance_budget", "Performance readiness passes", "performance-budget", false)]
  },
  unknown: {
    summary: "Clarify the issue manually, classify it, then create a category-specific safe fix plan.",
    notes: ["Do not apply automatic fixes to unknown issues.", "Escalate to owner review before implementation."],
    checks: [check("unknown", "manual_review", "Manual owner review is complete", "manual-preview-issue-owner-review", false)]
  }
};

export function getFixPlanForIssueCategory(category: TeoyubeManualPreviewIssueCategory): CategoryFixTemplate {
  return CATEGORY_FIX_PLANS[category] || CATEGORY_FIX_PLANS.unknown;
}

export function getRecommendedFixPriority(issue: TeoyubeManualPreviewIssue): number {
  return classifyManualPreviewIssue(issue).priority;
}

export function getFixPlanRegressionChecks(issue: TeoyubeManualPreviewIssue): TeoyubeManualPreviewIssueRegressionCheck[] {
  const category = classifyManualPreviewIssue(issue).category;
  return getFixPlanForIssueCategory(category).checks;
}

function riskLevelFromSeverity(severity: TeoyubeManualPreviewIssueSeverity): Exclude<TeoyubeManualPreviewIssueSeverity, "unknown"> {
  return severity === "critical" || severity === "high" || severity === "medium" || severity === "low"
    ? severity
    : "medium";
}

function launchImpactFromSeverity(severity: TeoyubeManualPreviewIssueSeverity): TeoyubeManualPreviewIssueFixPlan["launchImpact"] {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function defaultSteps(issue: TeoyubeManualPreviewIssue, category: TeoyubeManualPreviewIssueCategory): TeoyubeManualPreviewIssueFixStep[] {
  return [
    {
      id: id("review_issue", issue.id),
      label: "Review issue evidence",
      details: "Confirm the issue, affected surface, and launch impact before changing code.",
      required: true,
      owner: "manual_reviewer",
      status: "planned"
    },
    {
      id: id("apply_safe_fix", issue.id),
      label: "Apply smallest safe fix",
      details: `Apply the scoped ${category} fix without changing launch architecture or provider connections.`,
      required: true,
      owner: "developer",
      status: "planned"
    },
    {
      id: id("run_regression_checks", issue.id),
      label: "Run regression checks",
      details: "Run mapped regression checks and preserve the result for owner review.",
      required: true,
      owner: "qa",
      status: "planned"
    }
  ];
}

export function createManualPreviewFixPlan(issue: TeoyubeManualPreviewIssue): TeoyubeManualPreviewIssueFixPlan {
  const triage = classifyManualPreviewIssue(issue);
  const template = getFixPlanForIssueCategory(triage.category);
  const softLaunchBlocker = isSoftLaunchBlockingIssue(triage.normalizedIssue);
  const ownerReviewRequired = softLaunchBlocker || triage.safetyCritical || triage.severity === "critical";

  return {
    id: id("manual_preview_fix_plan", issue.id),
    issueId: issue.id,
    issueCategory: triage.category,
    severity: triage.severity,
    affectedSurface: issue.surface,
    recommendedFixSummary: template.summary,
    safeImplementationNotes: template.notes,
    steps: defaultSteps(issue, triage.category),
    riskLevel: riskLevelFromSeverity(triage.severity),
    regressionChecks: template.checks,
    ownerReviewRequired,
    launchImpact: launchImpactFromSeverity(triage.severity),
    softLaunchBlocker,
    status: ownerReviewRequired ? "ready_for_owner_review" : "ready_for_safe_fix",
    createdAt: now()
  };
}

export function createManualPreviewFixPlans(issues: TeoyubeManualPreviewIssue[]): TeoyubeManualPreviewIssueFixPlan[] {
  return issues
    .map(createManualPreviewFixPlan)
    .sort((a, b) => getRecommendedFixPriority({
      id: b.issueId,
      title: b.recommendedFixSummary,
      details: b.safeImplementationNotes.join(" "),
      category: b.issueCategory,
      severity: b.severity,
      surface: b.affectedSurface
    }) - getRecommendedFixPriority({
      id: a.issueId,
      title: a.recommendedFixSummary,
      details: a.safeImplementationNotes.join(" "),
      category: a.issueCategory,
      severity: a.severity,
      surface: a.affectedSurface
    }));
}

export function createManualPreviewFixPlanReport(issues: TeoyubeManualPreviewIssue[]) {
  const fixPlans = createManualPreviewFixPlans(issues);

  return {
    valid: true,
    issueCount: issues.length,
    fixPlanCount: fixPlans.length,
    ownerReviewRequiredCount: fixPlans.filter((plan) => plan.ownerReviewRequired).length,
    softLaunchBlockerCount: fixPlans.filter((plan) => plan.softLaunchBlocker).length,
    fixPlans,
    noFixesApplied: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
