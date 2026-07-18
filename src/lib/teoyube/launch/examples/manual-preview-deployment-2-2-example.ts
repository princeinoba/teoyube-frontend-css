import { createPreviewDeploymentIssueLog } from "../preview-deployment-issue-log";
import {
  createManualPreviewUrlRecord,
  createManualPreviewUrlVerificationReport
} from "../manual-preview-url-verification";
import {
  createManualPreviewPostDeploymentQaReport,
  createManualPreviewPostDeploymentQaRun,
  recordManualPreviewSurfaceQaResult
} from "../manual-preview-postdeployment-qa-runner";
import { createManualPreviewSurfaceChecklistReport } from "../manual-preview-surface-postdeployment-checks";
import { createPreviewScriptureExplanationReport } from "../manual-preview-scripture-explanation-verification";
import { createPreviewConsentPrivacyReport } from "../manual-preview-consent-privacy-verification";
import { createPreviewMobileAccessibilityReport } from "../manual-preview-mobile-accessibility-verification";
import { createPreviewFallbackOfflineReport } from "../manual-preview-fallback-offline-verification";
import { createPostDeploymentIssueBridgeReport } from "../manual-preview-postdeployment-issue-bridge";
import { runManualPreviewPostDeploymentQaAudit } from "../manual-preview-postdeployment-qa-audit";

export function createManualPreviewDeployment22Example() {
  const urlRecord = createManualPreviewUrlRecord({
    previewUrl: "https://teoyube-preview.vercel.app",
    provider: "vercel",
    environmentProfile: "preview",
    documentedForManualQa: true,
    reviewedManually: true
  });
  const urlVerification = createManualPreviewUrlVerificationReport(urlRecord);
  let qaRun = createManualPreviewPostDeploymentQaRun({ previewUrlRecord: urlRecord });

  qaRun = recordManualPreviewSurfaceQaResult(qaRun, "tig_response_panel", {
    checkId: "tig_response_panel_scripture_anchor_is_visible_or_accessible",
    status: "pass",
    notes: "Scripture anchor visible in manual preview review.",
    blocker: false,
    warning: false,
    scriptureAnchorResult: "pass",
    explanationPathResult: "pass",
    fallbackResult: "pass",
    confidenceLabelResult: "pass",
    consentResult: "pass",
    debugSafetyResult: "pass",
    privacyResult: "pass"
  });
  qaRun = recordManualPreviewSurfaceQaResult(qaRun, "tig_graph_preview", {
    checkId: "tig_graph_preview_mobile_layout_is_usable",
    status: "warning",
    notes: "Graph preview labels need one more manual mobile pass.",
    blocker: false,
    warning: true,
    mobileResult: "warning",
    accessibilityResult: "pass"
  });

  const qaReport = createManualPreviewPostDeploymentQaReport(qaRun);
  const surfaceChecklist = createManualPreviewSurfaceChecklistReport();
  const scriptureExplanation = createPreviewScriptureExplanationReport([
    {
      id: "scripture_tig_response_panel",
      surface: "tig_response_panel",
      scriptureAnchorVisible: true,
      explanationPathVisible: true,
      promiseHasScriptureSupport: true,
      prayerHasExplanationPath: true,
      actionStepHasExplanationPath: true,
      fallbackHasScriptureAnchoredExplanation: true,
      confidenceLabelHasReason: true,
      divineCertaintyClaimed: false,
      notes: "Scripture and explanation are visible."
    }
  ]);
  const consentPrivacy = createPreviewConsentPrivacyReport([
    {
      id: "privacy_personalization_panel",
      surface: "personalization_preview_panel",
      personalizationConsentAware: true,
      consentControlsAvailable: true,
      disableResetExportDeleteClear: true,
      rawTextStorageDisabled: true,
      hiddenPersonalizationAbsent: true,
      externalAnalyticsNotSending: true,
      productionPersistenceDisabled: true,
      liveAiOrchestrationDisabled: true,
      debugOutputHidden: true
    }
  ]);
  const mobileAccessibility = createPreviewMobileAccessibilityReport([
    {
      id: "mobile_tig_graph_preview",
      surface: "tig_graph_preview",
      viewport: "small_mobile",
      noMajorHorizontalOverflow: true,
      cardsStackCorrectly: true,
      scripturePrayerTextWraps: true,
      buttonsTouchFriendly: true,
      graphPreviewReadable: true,
      explanationPathReadable: true,
      consentFeedbackControlsUsable: true,
      debugHiddenByDefault: true,
      focusLabelBasicsAcceptable: true
    }
  ]);
  const fallbackOffline = createPreviewFallbackOfflineReport([
    {
      id: "fallback_ai_companion",
      surface: "ai_companion",
      fallbackResponseNonEmpty: true,
      fallbackScriptureAnchored: true,
      fallbackIncludesExplanationPath: true,
      fallbackConfidenceNotOverstated: true,
      offlineSafeFallbackAvailable: true,
      noLiveAiRequired: true,
      noDatabaseRequired: true,
      noExternalAnalyticsRequired: true,
      notes: "Safe fallback available without external services."
    }
  ]);
  const issueBridge = createPostDeploymentIssueBridgeReport(createPreviewDeploymentIssueLog(), qaRun);
  const audit = runManualPreviewPostDeploymentQaAudit();

  return {
    urlRecord,
    urlVerification,
    qaRun,
    qaReport,
    surfaceChecklist,
    scriptureExplanation,
    consentPrivacy,
    mobileAccessibility,
    fallbackOffline,
    issueBridge,
    audit,
    noActualDeploymentPerformed: true,
    noUrlFetched: true,
    generatedAt: new Date().toISOString()
  };
}
