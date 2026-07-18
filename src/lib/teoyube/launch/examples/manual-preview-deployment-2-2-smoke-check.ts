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

export type ManualPreviewDeployment22SmokeCheckResult = {
  valid: boolean;
  errors: string[];
  noActualDeploymentPerformed: boolean;
  noUrlFetched: boolean;
  noDatabaseRequired: boolean;
  noExternalApisRequired: boolean;
  noAnalyticsProviderRequired: boolean;
  noServiceWorkerRequired: boolean;
  noBrowserStorageRequired: boolean;
  noFileWritesRequired: boolean;
  generatedAt: string;
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runManualPreviewDeployment22SmokeCheck(): ManualPreviewDeployment22SmokeCheckResult {
  const urlRecord = createManualPreviewUrlRecord({
    previewUrl: "https://teoyube-preview.vercel.app",
    provider: "vercel",
    environmentProfile: "preview",
    reviewedManually: true
  });
  const urlReport = createManualPreviewUrlVerificationReport(urlRecord);
  let qaRun = createManualPreviewPostDeploymentQaRun({ previewUrlRecord: urlRecord });
  qaRun = recordManualPreviewSurfaceQaResult(qaRun, "tig_response_panel", {
    checkId: "tig_response_panel_scripture_anchor_is_visible_or_accessible",
    status: "pass",
    notes: "Manual smoke pass.",
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
    notes: "Manual smoke warning.",
    blocker: false,
    warning: true,
    mobileResult: "warning",
    accessibilityResult: "pass"
  });
  const qaReport = createManualPreviewPostDeploymentQaReport(qaRun);
  const surfaceChecklist = createManualPreviewSurfaceChecklistReport();
  const missingScriptureReport = createPreviewScriptureExplanationReport([
    {
      id: "missing_anchor",
      surface: "promise_cluster",
      scriptureAnchorVisible: false,
      explanationPathVisible: true,
      divineCertaintyClaimed: false
    }
  ]);
  const consentPrivacy = createPreviewConsentPrivacyReport([
    {
      id: "privacy_pass",
      surface: "personalization_preview_panel",
      personalizationConsentAware: true,
      consentControlsAvailable: true,
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
      id: "mobile_pass",
      surface: "mobile_navigation",
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
      id: "fallback_pass",
      surface: "offline_fallback",
      fallbackResponseNonEmpty: true,
      fallbackScriptureAnchored: true,
      fallbackIncludesExplanationPath: true,
      fallbackConfidenceNotOverstated: true,
      offlineSafeFallbackAvailable: true,
      noLiveAiRequired: true,
      noDatabaseRequired: true,
      noExternalAnalyticsRequired: true,
      notes: "Fallback is safe."
    }
  ]);
  const unsafeFallback = createPreviewFallbackOfflineReport([
    {
      id: "fallback_missing_scripture",
      surface: "error_fallback_states",
      fallbackResponseNonEmpty: true,
      fallbackScriptureAnchored: false,
      fallbackIncludesExplanationPath: true,
      fallbackConfidenceNotOverstated: true,
      offlineSafeFallbackAvailable: true,
      noLiveAiRequired: true,
      noDatabaseRequired: true,
      noExternalAnalyticsRequired: true
    }
  ]);
  const bridge = createPostDeploymentIssueBridgeReport(createPreviewDeploymentIssueLog(), qaRun);
  const audit = runManualPreviewPostDeploymentQaAudit();

  const errors = clean([
    urlReport.valid && urlReport.noUrlFetched ? "" : "URL verification should be valid and must not fetch the URL.",
    qaRun.inMemoryOnly && !qaRun.databaseWritten && !qaRun.analyticsSent && !qaRun.externalServicesCalled && !qaRun.filesWritten
      ? ""
      : "Postdeployment QA run should remain in-memory only.",
    qaReport.noUrlFetched && qaReport.noExternalWrite ? "" : "QA report should not fetch URLs or write externally.",
    surfaceChecklist.valid && surfaceChecklist.surfaceCount >= 15 ? "" : "Surface checklist should cover all required preview surfaces.",
    missingScriptureReport.blockers.length > 0 ? "" : "Scripture/explanation verification should treat missing anchors as blockers.",
    consentPrivacy.valid && consentPrivacy.analyticsDisabled && consentPrivacy.persistenceDisabled && consentPrivacy.liveAiDisabled
      ? ""
      : "Consent/privacy verification should keep analytics, persistence, and live AI disabled.",
    mobileAccessibility.valid && mobileAccessibility.viewportPlan.length >= 4 ? "" : "Mobile/accessibility verification should return a structured report.",
    fallbackOffline.valid && fallbackOffline.noLiveAiRequired && fallbackOffline.noDatabaseRequired && fallbackOffline.noExternalAnalyticsRequired
      ? ""
      : "Fallback/offline verification should not require external systems.",
    unsafeFallback.blockers.length > 0 ? "" : "Fallback/offline verification should require Scripture-anchored fallback.",
    bridge.inMemoryOnly && !bridge.analyticsSent && !bridge.databaseWritten && !bridge.filesWritten && bridge.issueCountCreated > 0
      ? ""
      : "Issue bridge should work in memory only and convert warnings.",
    audit.complete && audit.completionPercentage === 100 ? "" : "Postdeployment QA audit should be complete.",
    audit.nextStep === "Manual Preview Deployment Execution 2.3 - Preview Issue Triage & Fix Plan"
      ? ""
      : "Audit should point to 2.3."
  ]);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noUrlFetched: true,
    noDatabaseRequired: true,
    noExternalApisRequired: true,
    noAnalyticsProviderRequired: true,
    noServiceWorkerRequired: true,
    noBrowserStorageRequired: true,
    noFileWritesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
