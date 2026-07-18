import type { TeoyubePostDeploymentQaSurface } from "./manual-preview-postdeployment-qa-contracts";
import { MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES } from "./manual-preview-surface-postdeployment-checks";
import type {
  TeoyubeManualPreviewRecheckItem,
  TeoyubeManualPreviewRecheckScope
} from "./manual-preview-recheck-contracts";

function item(
  id: string,
  label: string,
  scope: TeoyubeManualPreviewRecheckScope,
  details: string,
  launchCritical = true,
  surface?: TeoyubePostDeploymentQaSurface
): TeoyubeManualPreviewRecheckItem {
  return {
    id,
    label,
    scope,
    surface,
    required: true,
    launchCritical,
    details
  };
}

export function getManualPreviewSurfaceRecheckItems(surface: TeoyubePostDeploymentQaSurface): TeoyubeManualPreviewRecheckItem[] {
  return [
    item(`${surface}_loads`, `${surface}: surface still loads`, "surface_qa", "Confirm the surface renders without a crash or blank state.", true, surface),
    item(`${surface}_scripture_anchor`, `${surface}: Scripture anchors remain visible`, "scripture_explanation", "Confirm Scripture references or anchors remain visible where applicable.", true, surface),
    item(`${surface}_explanation_path`, `${surface}: explanation path remains visible`, "scripture_explanation", "Confirm the user can understand why content was selected.", true, surface),
    item(`${surface}_fallback`, `${surface}: fallback behavior remains safe`, "fallback_offline", "Confirm empty/error/offline states remain safe and non-empty.", true, surface),
    item(`${surface}_confidence`, `${surface}: confidence label remains clear`, "surface_qa", "Confirm confidence labels remain bounded where applicable.", false, surface),
    item(`${surface}_consent`, `${surface}: consent controls remain available`, "consent_privacy", "Confirm consent controls remain available where personalization or feedback appears.", true, surface),
    item(`${surface}_mobile`, `${surface}: mobile layout remains usable`, "mobile_accessibility", "Confirm mobile viewport use remains readable and operable.", true, surface),
    item(`${surface}_accessibility`, `${surface}: accessibility basics remain acceptable`, "mobile_accessibility", "Confirm labels, focus, keyboard access, and contrast basics.", true, surface),
    item(`${surface}_debug_hidden`, `${surface}: debug UI remains hidden`, "provider_boundary", "Confirm normal users do not see debug internals.", true, surface)
  ];
}

export function getManualPreviewSafetyRecheckItems(): TeoyubeManualPreviewRecheckItem[] {
  return [
    item("recheck_scripture_anchors_visible", "Scripture anchors remain visible", "scripture_explanation", "Every usable TIG response remains Scripture anchored."),
    item("recheck_explanation_paths_visible", "Explanation paths remain visible", "scripture_explanation", "Decision trace or explanation path remains visible or accessible."),
    item("recheck_fallback_safe", "Fallback behavior remains safe", "fallback_offline", "Fallbacks remain non-empty, bounded, and safe."),
    item("recheck_confidence_clear", "Confidence labels remain clear", "surface_qa", "Confidence labels remain bounded and do not claim certainty.", false),
    item("recheck_consent_controls", "Consent controls remain available", "consent_privacy", "Consent controls remain visible where needed."),
    item("recheck_feedback_controls", "Feedback controls remain usable", "soft_launch_readiness", "Feedback controls remain manual and understandable.", false),
    item("recheck_offline_fallback", "Offline fallback remains safe", "fallback_offline", "Offline/read-only fallback remains safe without service workers."),
    item("recheck_debug_hidden", "Debug UI remains hidden from normal users", "provider_boundary", "Debug payloads stay hidden from normal users."),
    item("recheck_no_external_analytics", "No external analytics sending is enabled", "provider_boundary", "External analytics remains disabled."),
    item("recheck_no_production_persistence", "No production persistence is enabled", "provider_boundary", "Production database persistence remains disabled."),
    item("recheck_no_live_ai", "No live AI orchestration is enabled", "provider_boundary", "Live AI orchestration remains disabled."),
    item("recheck_no_sensitive_storage", "No raw sensitive text storage is introduced", "consent_privacy", "Raw sensitive personalization or journal text is not stored by this step.")
  ];
}

export function getManualPreviewRegressionRecheckItems(): TeoyubeManualPreviewRecheckItem[] {
  return [
    item("recheck_critical_issues_resolved_or_documented", "Previously triaged critical issues are resolved or documented", "issue_resolution", "Critical issues must be resolved or visibly documented before candidate confirmation."),
    item("recheck_safe_fixes_regression_checked", "Safe fixes were regression-checked", "regression", "Applied safe fixes must have mapped regression checks passed or documented."),
    item("recheck_unresolved_blockers_visible", "Unresolved blockers are visible", "issue_resolution", "Unresolved blockers must remain visible for owner review."),
    item("recheck_safe_fix_results_reviewed", "Safe fix results reviewed", "safe_fix", "Safe fix result records should be reviewed manually.")
  ];
}

export function getManualPreviewCriticalRecheckItems(): TeoyubeManualPreviewRecheckItem[] {
  return getManualPreviewRecheckChecklist().filter((entry) => entry.launchCritical);
}

export function getManualPreviewRecheckChecklist(): TeoyubeManualPreviewRecheckItem[] {
  return [
    ...getManualPreviewRegressionRecheckItems(),
    ...getManualPreviewSafetyRecheckItems(),
    ...MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES.flatMap(getManualPreviewSurfaceRecheckItems)
  ];
}

export function createManualPreviewRecheckChecklistReport() {
  const checklist = getManualPreviewRecheckChecklist();

  return {
    valid: checklist.length > 0 && MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES.every((surface) =>
      checklist.some((entry) => entry.surface === surface)
    ),
    itemCount: checklist.length,
    criticalItemCount: getManualPreviewCriticalRecheckItems().length,
    safetyItemCount: getManualPreviewSafetyRecheckItems().length,
    regressionItemCount: getManualPreviewRegressionRecheckItems().length,
    surfaceCount: MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES.length,
    checklist,
    generatedAt: new Date().toISOString()
  };
}
