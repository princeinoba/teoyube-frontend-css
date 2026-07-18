import type {
  TeoyubeSoftLaunchFeedbackCategory,
  TeoyubeSoftLaunchFeedbackItem,
  TeoyubeSoftLaunchFeedbackTriageDecision
} from "./soft-launch-feedback-contracts";

export type TeoyubeSoftLaunchIssueResponse = {
  category: TeoyubeSoftLaunchFeedbackCategory;
  defaultDecision: TeoyubeSoftLaunchFeedbackTriageDecision;
  recommendedActions: string[];
};

export function getSoftLaunchIssueResponsePlan(): TeoyubeSoftLaunchIssueResponse[] {
  return [
    {
      category: "scripture",
      defaultDecision: "scripture_content_review_required",
      recommendedActions: ["Pause affected response surface.", "Review Scripture anchor.", "Fix before wider sharing."]
    },
    {
      category: "explanation",
      defaultDecision: "scripture_content_review_required",
      recommendedActions: ["Restore explanation path.", "Document as launch-critical until fixed."]
    },
    {
      category: "fallback",
      defaultDecision: "safety_review_required",
      recommendedActions: ["Review fallback copy.", "Rollback unsafe fallback if needed."]
    },
    {
      category: "consent",
      defaultDecision: "consent_review_required",
      recommendedActions: ["Pause personalization surfaces.", "Restore consent controls before sharing."]
    },
    {
      category: "mobile",
      defaultDecision: "fix_before_wider_sharing",
      recommendedActions: ["Document affected viewport.", "Fix before wider sharing."]
    },
    {
      category: "accessibility",
      defaultDecision: "accessibility_review_required",
      recommendedActions: ["Review keyboard, labels, touch targets, and contrast.", "Fix launch-critical blockers."]
    },
    {
      category: "privacy",
      defaultDecision: "pause_soft_launch",
      recommendedActions: ["Pause feedback intake if raw sensitive text is stored.", "Redact notes and review privacy controls."]
    },
    {
      category: "unknown",
      defaultDecision: "document_known_limitation",
      recommendedActions: ["Document manually.", "Monitor for repeat reports."]
    }
  ];
}

export function getIssueResponsePlanByCategory(category: TeoyubeSoftLaunchFeedbackCategory): TeoyubeSoftLaunchIssueResponse {
  return getSoftLaunchIssueResponsePlan().find((plan) => plan.category === category) ||
    getSoftLaunchIssueResponsePlan().find((plan) => plan.category === "unknown") as TeoyubeSoftLaunchIssueResponse;
}

export function createIssueResponseRecommendation(issue: TeoyubeSoftLaunchFeedbackItem) {
  const plan = getIssueResponsePlanByCategory(issue.category);
  const decision: TeoyubeSoftLaunchFeedbackTriageDecision =
    issue.severity === "critical"
      ? "pause_soft_launch"
      : issue.severity === "high"
        ? "fix_before_wider_sharing"
        : plan.defaultDecision;

  return {
    issueId: issue.id,
    category: issue.category,
    decision,
    recommendedActions: plan.recommendedActions,
    codeChangesPerformed: false,
    generatedAt: new Date().toISOString()
  };
}

export function getSoftLaunchPauseCriteria(): string[] {
  return [
    "Missing Scripture anchors",
    "Missing explanation paths",
    "Unsafe fallback behavior",
    "Consent control problems",
    "Exposed debug data",
    "Critical mobile or accessibility blockers",
    "Privacy concern involving raw sensitive text"
  ];
}

export function getSoftLaunchRollbackCriteriaFromIssues(issues: TeoyubeSoftLaunchFeedbackItem[]): string[] {
  return issues
    .filter((issue) => issue.severity === "critical" || issue.category === "scripture" || issue.category === "fallback" || issue.category === "consent" || issue.category === "privacy")
    .map((issue) => `Rollback review required for ${issue.category}: ${issue.summary}`);
}

export function createSoftLaunchIssueResponseReport(issues: TeoyubeSoftLaunchFeedbackItem[]) {
  const recommendations = issues.map(createIssueResponseRecommendation);
  const rollbackCriteria = getSoftLaunchRollbackCriteriaFromIssues(issues);

  return {
    issueCount: issues.length,
    recommendations,
    pauseCriteria: getSoftLaunchPauseCriteria(),
    rollbackCriteria,
    shouldPause: recommendations.some((entry) => entry.decision === "pause_soft_launch"),
    shouldRollback: rollbackCriteria.length > 0,
    codeChangesPerformed: false,
    generatedAt: new Date().toISOString()
  };
}
