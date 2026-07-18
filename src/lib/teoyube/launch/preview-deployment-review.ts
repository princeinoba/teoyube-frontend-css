import type {
  TeoyubePreviewDeploymentReviewChecklistItem,
  TeoyubePreviewDeploymentReviewDecision,
  TeoyubePreviewDeploymentReviewFinding,
  TeoyubePreviewDeploymentReviewInput,
  TeoyubePreviewDeploymentReviewReport,
  TeoyubePreviewDeploymentReviewRisk,
  TeoyubePreviewDeploymentReviewStatus
} from "./preview-deployment-review-contracts";

function value(input: TeoyubePreviewDeploymentReviewInput, key: keyof TeoyubePreviewDeploymentReviewInput): boolean {
  return input[key] !== false;
}

function item(
  id: string,
  label: string,
  passed: boolean,
  details: string,
  safetyCritical = false
): TeoyubePreviewDeploymentReviewChecklistItem {
  return {
    id,
    label,
    required: true,
    status: passed ? "pass" : safetyCritical ? "blocked" : "needs_review",
    passed,
    details,
    safetyCritical
  };
}

export function createPreviewDeploymentReviewChecklist(
  input: TeoyubePreviewDeploymentReviewInput = {}
): TeoyubePreviewDeploymentReviewChecklistItem[] {
  return [
    item("preview_url_captured", "Preview URL manually captured if deployment occurred", !input.deploymentOccurred || input.previewUrlCaptured === true, "Capture the preview URL manually after deployment."),
    item("environment_documented", "Preview environment profile documented", value(input, "previewEnvironmentDocumented"), "Document the safe preview environment profile."),
    item("target_documented", "Deployment target documented", value(input, "deploymentTargetDocumented"), "Document the selected deployment target."),
    item("build_documented", "Build verification status documented", value(input, "buildVerificationDocumented"), "Record build verification outcome."),
    item("postcheck_documented", "Post-check status documented", value(input, "postCheckDocumented"), "Record post-preview QA checks."),
    item("issue_log_reviewed", "Issue log reviewed", value(input, "issueLogReviewed"), "Review preview issue log."),
    item("rollback_available", "Rollback plan available", value(input, "rollbackPlanAvailable"), "Keep rollback plan available."),
    item("scripture_visible", "Scripture anchors visible", value(input, "scriptureAnchorsVisible"), "Scripture anchors must remain visible.", true),
    item("explanation_visible", "Explanation paths visible", value(input, "explanationPathsVisible"), "Explanation paths must remain visible.", true),
    item("fallback_safe", "Fallback behavior safe", value(input, "fallbackBehaviorSafe"), "Fallback behavior must remain safe.", true),
    item("confidence_visible", "Confidence labels visible where applicable", value(input, "confidenceLabelsVisible"), "Confidence labels should remain visible."),
    item("consent_available", "Consent controls available", value(input, "consentControlsAvailable"), "Consent controls must remain available.", true),
    item("feedback_available", "Feedback controls available where applicable", value(input, "feedbackControlsAvailable"), "Feedback controls should remain available."),
    item("mobile_usable", "Mobile layout usable", value(input, "mobileLayoutUsable"), "Mobile layout must remain usable."),
    item("accessibility_reviewed", "Accessibility basics reviewed", value(input, "accessibilityBasicsReviewed"), "Accessibility basics should be reviewed."),
    item("debug_hidden", "Debug UI hidden from normal users", value(input, "debugUiHidden"), "Debug UI must remain hidden.", true),
    item("analytics_not_sending", "External analytics not sending", value(input, "externalAnalyticsNotSending"), "External analytics must not send.", true),
    item("persistence_disabled", "Production persistence disabled", value(input, "productionPersistenceDisabled"), "Production persistence must remain disabled.", true),
    item("live_ai_disabled", "Live AI orchestration disabled", value(input, "liveAiDisabled"), "Live AI orchestration must remain disabled.", true),
    item("raw_text_disabled", "Raw sensitive text storage disabled", value(input, "rawTextStorageDisabled"), "Raw sensitive text storage must remain disabled.", true),
    item("offline_safe", "Offline fallback remains safe", value(input, "offlineFallbackSafe"), "Offline fallback should remain safe.")
  ];
}

export function getPreviewDeploymentReviewFindings(
  report: TeoyubePreviewDeploymentReviewReport
): TeoyubePreviewDeploymentReviewFinding[] {
  return report.findings;
}

export function getPreviewDeploymentReviewBlockers(report: TeoyubePreviewDeploymentReviewReport): TeoyubePreviewDeploymentReviewFinding[] {
  return report.findings.filter((finding) => finding.status === "blocked" || finding.status === "fail");
}

export function getPreviewDeploymentReviewWarnings(report: TeoyubePreviewDeploymentReviewReport): TeoyubePreviewDeploymentReviewFinding[] {
  return report.findings.filter((finding) => finding.status === "warning" || finding.status === "needs_review");
}

export function createPreviewDeploymentReviewDecision(
  report: TeoyubePreviewDeploymentReviewReport
): TeoyubePreviewDeploymentReviewDecision {
  const blockers = getPreviewDeploymentReviewBlockers(report);

  if (blockers.some((entry) => entry.id.includes("scripture") || entry.id.includes("explanation") || entry.id.includes("fallback") || entry.id.includes("consent"))) {
    return "needs_safety_fix";
  }
  if (blockers.length > 0) {
    return "blocked";
  }

  return report.warningCount > 0 ? "ready_after_manual_review" : "ready_for_soft_launch_review";
}

export function runPreviewDeploymentReview(input: TeoyubePreviewDeploymentReviewInput = {}) {
  const checklist = createPreviewDeploymentReviewChecklist(input);
  const findings: TeoyubePreviewDeploymentReviewFinding[] = checklist
    .filter((entry) => !entry.passed)
    .map((entry) => ({
      id: entry.id,
      status: entry.status,
      message: `${entry.label} needs review.`,
      recommendedAction: entry.details
    }));
  const risks: TeoyubePreviewDeploymentReviewRisk[] = [
    {
      id: "manual_review_pending",
      severity: "medium",
      label: "Manual review pending",
      mitigation: "Complete manual preview review before soft-launch candidacy."
    }
  ];
  const blockerCount = findings.filter((entry) => entry.status === "blocked" || entry.status === "fail").length;
  const warningCount = findings.filter((entry) => entry.status === "warning" || entry.status === "needs_review").length;
  const status: TeoyubePreviewDeploymentReviewStatus = blockerCount ? "blocked" : warningCount ? "warning" : "pass";
  const partial = {
    valid: blockerCount === 0,
    decision: "unknown" as TeoyubePreviewDeploymentReviewDecision,
    checklist,
    findings,
    risks,
    status,
    checklistCount: checklist.length,
    passedChecklistCount: checklist.filter((entry) => entry.passed).length,
    blockerCount,
    warningCount,
    generatedAt: new Date().toISOString()
  };

  return {
    ...partial,
    decision: createPreviewDeploymentReviewDecision(partial)
  };
}

export function createPreviewDeploymentReviewReport(input: TeoyubePreviewDeploymentReviewInput = {}): TeoyubePreviewDeploymentReviewReport {
  return runPreviewDeploymentReview(input);
}

