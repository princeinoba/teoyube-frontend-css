import { createPreviewDeploymentReadinessReport } from "./preview-deployment-readiness";
import type { TeoyubePreviewManualReviewItem, TeoyubePreviewRollbackPlan } from "./preview-deployment-contracts";

function reviewItem(id: string, label: string, details: string): TeoyubePreviewManualReviewItem {
  return {
    id,
    label,
    required: true,
    complete: false,
    details
  };
}

export function getPreviewRollbackPlan(): TeoyubePreviewRollbackPlan {
  return {
    id: "preview_rollback_manual_plan",
    label: "Preview Rollback and Manual Review Plan",
    rollbackTriggers: [
      "Build output fails or preview route rendering breaks.",
      "Scripture anchor, explanation path, or fallback behavior is missing.",
      "Consent controls are unavailable where personalization appears.",
      "Debug output or unsafe error state is visible to normal users.",
      "Mobile or accessibility review finds a launch-critical blocker."
    ],
    rollbackSteps: [
      "Stop sharing the preview URL.",
      "Disable the affected surface or revert to the previous safe commit.",
      "Document the blocker and required fix.",
      "Run launch smoke checks and manual review before trying again."
    ],
    manualReviewOwner: "Launch reviewer",
    notes: [
      "No provider rollback command is executed in this module.",
      "Provider-specific rollback stays manual until deployment execution is approved."
    ]
  };
}

export function getPreviewManualReviewChecklist(): TeoyubePreviewManualReviewItem[] {
  return [
    reviewItem("verify_build_output", "Verify build output", "Confirm local build output or documented build failure before preview deployment."),
    reviewItem("verify_environment_config", "Verify environment config", "Confirm safe preview placeholders and no real secrets."),
    reviewItem("verify_preview_target", "Verify preview deployment target", "Confirm target provider manually before deployment."),
    reviewItem("verify_no_external_analytics", "Verify no external analytics", "Confirm analytics sending remains disabled."),
    reviewItem("verify_no_production_persistence", "Verify no production persistence", "Confirm production database writes remain disabled."),
    reviewItem("verify_no_live_ai", "Verify no live AI orchestration", "Confirm live AI orchestration remains disabled."),
    reviewItem("verify_scripture_anchors", "Verify Scripture anchors", "Confirm usable responses remain Scripture anchored."),
    reviewItem("verify_explanation_paths", "Verify explanation paths", "Confirm recommendations remain explainable."),
    reviewItem("verify_fallback_behavior", "Verify fallback behavior", "Confirm safe fallback and offline behavior."),
    reviewItem("verify_consent_controls", "Verify consent controls", "Confirm consent controls appear where personalization appears."),
    reviewItem("verify_mobile_layout", "Verify mobile layout", "Confirm mobile-first layout behavior."),
    reviewItem("verify_accessibility_basics", "Verify accessibility basics", "Confirm keyboard, contrast, labels, and readable structure."),
    reviewItem("verify_safe_error_states", "Verify safe error states", "Confirm errors do not expose raw payloads or secrets."),
    reviewItem("verify_debug_hidden", "Verify debug UI hidden", "Confirm debug surfaces are not public."),
    reviewItem("verify_rollback_documented", "Verify rollback instructions", "Confirm rollback instructions are documented.")
  ];
}

export function getPreviewGoNoGoChecklist(): TeoyubePreviewManualReviewItem[] {
  return [
    ...getPreviewManualReviewChecklist(),
    reviewItem("confirm_manual_review_owner", "Confirm manual review owner", "Assign a human owner for preview deployment review."),
    reviewItem("confirm_preview_notes_ready", "Confirm preview notes ready", "Review release notes and known limitations before sharing.")
  ];
}

export function createPreviewManualReviewReport() {
  const checklist = getPreviewManualReviewChecklist();

  return {
    readyForManualReview: true,
    checklistCount: checklist.length,
    completedChecklistCount: checklist.filter((entry) => entry.complete).length,
    checklist,
    rollbackPlan: getPreviewRollbackPlan(),
    generatedAt: new Date().toISOString()
  };
}

export function createPreviewGoNoGoDecision() {
  const preview = createPreviewDeploymentReadinessReport();
  const checklist = getPreviewGoNoGoChecklist();
  const blocked = !preview.ready;

  return {
    decision: blocked ? "blocked" : "ready_for_preview_manual_review",
    ready: !blocked,
    checklistCount: checklist.length,
    manualItemsRemaining: checklist.filter((entry) => !entry.complete).length,
    notes: [
      "Go/no-go remains a manual review step.",
      "This module does not deploy or call provider APIs."
    ],
    generatedAt: new Date().toISOString()
  };
}

