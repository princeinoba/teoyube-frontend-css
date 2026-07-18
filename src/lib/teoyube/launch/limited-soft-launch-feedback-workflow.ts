export type TeoyubeLimitedSoftLaunchFeedbackCategory =
  | "scripture_anchor_issue"
  | "explanation_path_issue"
  | "fallback_issue"
  | "consent_issue"
  | "mobile_accessibility_issue"
  | "clarity_feedback"
  | "positive_feedback"
  | "feature_request"
  | "privacy_concern"
  | "unknown";

export type TeoyubeLimitedSoftLaunchFeedbackWorkflow = {
  id: string;
  label: string;
  categories: TeoyubeLimitedSoftLaunchFeedbackCategory[];
  checklist: string[];
  privacyRules: string[];
  manualOnly: true;
  analyticsSent: false;
  databaseWritten: false;
  rawSensitiveTextStoredByDefault: false;
  realFeedbackCollected: false;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchFeedbackWorkflowReport = {
  valid: boolean;
  workflow: TeoyubeLimitedSoftLaunchFeedbackWorkflow;
  categoryCount: number;
  checklistCount: number;
  privacyRuleCount: number;
  blockers: string[];
  warnings: string[];
  inMemoryOnly: true;
  noAnalyticsSending: true;
  noDatabaseWrites: true;
  noRawSensitiveTextStorage: true;
  generatedAt: string;
};

export function getLimitedSoftLaunchFeedbackCategories(): TeoyubeLimitedSoftLaunchFeedbackCategory[] {
  return [
    "scripture_anchor_issue",
    "explanation_path_issue",
    "fallback_issue",
    "consent_issue",
    "mobile_accessibility_issue",
    "clarity_feedback",
    "positive_feedback",
    "feature_request",
    "privacy_concern"
  ];
}

export function getLimitedSoftLaunchFeedbackChecklist(): string[] {
  return [
    "Use manual feedback collection only.",
    "Record surface-specific feedback.",
    "Treat missing Scripture anchors as launch-critical.",
    "Treat missing explanation paths as launch-critical.",
    "Treat unsafe fallbacks as launch-critical.",
    "Treat missing consent controls as launch-critical.",
    "Review mobile and accessibility blockers daily.",
    "Keep notes redacted and avoid raw sensitive text.",
    "Do not send analytics.",
    "Do not write feedback to a production database."
  ];
}

export function getLimitedSoftLaunchFeedbackPrivacyRules(): string[] {
  return [
    "Do not request sensitive personal information.",
    "Do not store raw sensitive text by default.",
    "Use redacted notes for manual review.",
    "Do not create hidden personalization from feedback.",
    "Do not send feedback to analytics.",
    "Do not write feedback to production persistence.",
    "Escalate privacy concerns to owner review before continuing."
  ];
}

export function createLimitedSoftLaunchFeedbackWorkflow(): TeoyubeLimitedSoftLaunchFeedbackWorkflow {
  return {
    id: "limited_soft_launch_feedback_workflow",
    label: "Limited Soft Launch Manual Feedback Workflow",
    categories: getLimitedSoftLaunchFeedbackCategories(),
    checklist: getLimitedSoftLaunchFeedbackChecklist(),
    privacyRules: getLimitedSoftLaunchFeedbackPrivacyRules(),
    manualOnly: true,
    analyticsSent: false,
    databaseWritten: false,
    rawSensitiveTextStoredByDefault: false,
    realFeedbackCollected: false,
    generatedAt: new Date().toISOString()
  };
}

export function createLimitedSoftLaunchFeedbackWorkflowReport(): TeoyubeLimitedSoftLaunchFeedbackWorkflowReport {
  const workflow = createLimitedSoftLaunchFeedbackWorkflow();
  const blockers = [
    workflow.manualOnly ? "" : "Feedback workflow must remain manual only.",
    workflow.analyticsSent ? "Feedback workflow must not send analytics." : "",
    workflow.databaseWritten ? "Feedback workflow must not write to a database." : "",
    workflow.rawSensitiveTextStoredByDefault ? "Feedback workflow must not store raw sensitive text by default." : "",
    workflow.realFeedbackCollected ? "This preparation step must not collect real feedback." : ""
  ].filter(Boolean);

  return {
    valid: blockers.length === 0,
    workflow,
    categoryCount: workflow.categories.length,
    checklistCount: workflow.checklist.length,
    privacyRuleCount: workflow.privacyRules.length,
    blockers,
    warnings: ["This workflow is a preparation artifact only; real feedback collection starts only after owner approval."],
    inMemoryOnly: true,
    noAnalyticsSending: true,
    noDatabaseWrites: true,
    noRawSensitiveTextStorage: true,
    generatedAt: new Date().toISOString()
  };
}
