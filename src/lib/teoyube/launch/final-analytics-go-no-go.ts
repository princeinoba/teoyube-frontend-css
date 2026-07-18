import type { TeoyubeFinalPublicGoNoGoCheck, TeoyubeFinalPublicLaunchBlocker, TeoyubeFinalPublicLaunchWarning } from "./final-public-go-no-go-contracts";
import { createAnalyticsConnectionDecisionReport, createPublicLaunchAnalyticsPlan } from "./public-launch-analytics-plan";

export type TeoyubeFinalAnalyticsDecision =
  | "disabled_for_public_launch"
  | "approved_for_later_setup"
  | "requires_consent_strategy"
  | "requires_privacy_review"
  | "requires_owner_review"
  | "blocked";

export type TeoyubeFinalAnalyticsInput = {
  analyticsConnected?: boolean;
  analyticsSent?: boolean;
  sdkInstalled?: boolean;
  approvedForPublicLaunch?: boolean;
  consentStrategyComplete?: boolean;
  privacyReviewComplete?: boolean;
  ownerReviewComplete?: boolean;
  rawSensitiveTextIncluded?: boolean;
};

function check(id: string, label: string, complete: boolean, details: string): TeoyubeFinalPublicGoNoGoCheck {
  return { id, label, category: "analytics", required: true, complete, status: complete ? "ready" : "blocked", launchCritical: true, details };
}

function blocker(id: string, reason: string): TeoyubeFinalPublicLaunchBlocker {
  return { id, label: id.replace(/_/g, " "), category: "analytics", riskLevel: "critical", reason, requiredAction: "Keep external analytics disabled until explicit consent, payload, privacy, and owner review." };
}

export function createFinalAnalyticsGoNoGoChecklist(input: TeoyubeFinalAnalyticsInput = {}): TeoyubeFinalPublicGoNoGoCheck[] {
  return [
    check("final_analytics_disabled", "External analytics disabled", !input.analyticsConnected, "5.4 must not connect analytics providers."),
    check("final_analytics_no_events_sent", "No analytics events sent", !input.analyticsSent, "5.4 must not send events externally."),
    check("final_analytics_no_sdk_installed", "No analytics SDK installed", !input.sdkInstalled, "Segment, PostHog, Google Analytics, Mixpanel, or other providers remain uninstalled by this step."),
    check("final_analytics_no_raw_sensitive_text", "No raw sensitive analytics payload", !input.rawSensitiveTextIncluded, "Analytics payload planning must exclude raw sensitive text.")
  ];
}

export function getFinalAnalyticsBlockers(input: TeoyubeFinalAnalyticsInput = {}): TeoyubeFinalPublicLaunchBlocker[] {
  return [
    input.analyticsConnected ? blocker("final_analytics_connected", "External analytics are connected.") : undefined,
    input.analyticsSent ? blocker("final_analytics_sent", "External analytics events were sent.") : undefined,
    input.sdkInstalled ? blocker("final_analytics_sdk_installed", "An analytics provider SDK was installed.") : undefined,
    input.rawSensitiveTextIncluded ? blocker("final_analytics_raw_sensitive_text", "Raw sensitive text is included in analytics payloads.") : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
}

export function getFinalAnalyticsWarnings(input: TeoyubeFinalAnalyticsInput = {}): TeoyubeFinalPublicLaunchWarning[] {
  return [
    {
      id: "final_analytics_deferred",
      label: "External analytics deferred",
      category: "analytics",
      riskLevel: "medium",
      message: input.approvedForPublicLaunch ? "Analytics were requested but remain deferred unless consent, privacy, and owner review are complete." : "External analytics remain disabled for public launch execution preparation.",
      recommendedAction: "Use a later explicit analytics setup step after payload minimization, consent, privacy, retention, and provider review."
    }
  ];
}

export function createFinalAnalyticsDecision(input: TeoyubeFinalAnalyticsInput = {}): TeoyubeFinalAnalyticsDecision {
  const blockers = getFinalAnalyticsBlockers(input);
  if (blockers.length > 0) return "blocked";
  if (input.approvedForPublicLaunch && !input.consentStrategyComplete) return "requires_consent_strategy";
  if (input.approvedForPublicLaunch && !input.privacyReviewComplete) return "requires_privacy_review";
  if (input.approvedForPublicLaunch && !input.ownerReviewComplete) return "requires_owner_review";
  if (input.approvedForPublicLaunch) return "approved_for_later_setup";
  return "disabled_for_public_launch";
}

export function evaluateFinalAnalyticsGoNoGo(input: TeoyubeFinalAnalyticsInput = {}) {
  const blockers = getFinalAnalyticsBlockers(input);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createFinalAnalyticsDecision(input),
    checklist: createFinalAnalyticsGoNoGoChecklist(input),
    blockers,
    warnings: getFinalAnalyticsWarnings(input)
  };
}

export function createFinalAnalyticsGoNoGoReport(input: TeoyubeFinalAnalyticsInput = {}) {
  const publicLaunchPlanReport = createAnalyticsConnectionDecisionReport(createPublicLaunchAnalyticsPlan());
  const evaluation = evaluateFinalAnalyticsGoNoGo(input);
  return {
    ...evaluation,
    publicLaunchPlanReport,
    noAnalyticsConnected: true,
    noAnalyticsSent: true,
    noSdkInstalled: true,
    noRawSensitiveTextIncluded: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
