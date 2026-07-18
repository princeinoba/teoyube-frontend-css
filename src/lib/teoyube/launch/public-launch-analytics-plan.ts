export type TeoyubePublicLaunchAnalyticsPlan = {
  id: string;
  label: string;
  eventCandidates: string[];
  providerOptions: string[];
  privacyRequirements: string[];
  consentRequirements: string[];
  analyticsConnected: false;
  analyticsSent: false;
  sdkInstalled: false;
  rawSensitiveTextIncluded: false;
};

export function getAnalyticsEventCandidatesForPublicLaunch(): string[] {
  return ["surface viewed", "production response created", "fallback used", "low confidence response", "consent updated", "feedback action selected", "manual issue reported"];
}

export function getAnalyticsProviderOptions(): string[] {
  return ["posthog", "segment", "google_analytics", "mixpanel", "custom", "none", "undecided"];
}

export function getAnalyticsPrivacyRequirements(): string[] {
  return ["Payload minimization", "No raw sensitive text", "No hidden personalization", "Privacy notice before connection", "Retention policy reviewed"];
}

export function getAnalyticsConsentRequirements(): string[] {
  return ["Consent strategy documented", "Opt-out path available", "Consent updates tracked safely", "No analytics before consent review"];
}

export function createPublicLaunchAnalyticsPlan(): TeoyubePublicLaunchAnalyticsPlan {
  return {
    id: "public_launch_analytics_plan_5_1",
    label: "Public Launch Analytics Connection Decision Plan",
    eventCandidates: getAnalyticsEventCandidatesForPublicLaunch(),
    providerOptions: getAnalyticsProviderOptions(),
    privacyRequirements: getAnalyticsPrivacyRequirements(),
    consentRequirements: getAnalyticsConsentRequirements(),
    analyticsConnected: false,
    analyticsSent: false,
    sdkInstalled: false,
    rawSensitiveTextIncluded: false
  };
}

export function validateAnalyticsConnectionReadiness(plan: TeoyubePublicLaunchAnalyticsPlan = createPublicLaunchAnalyticsPlan()) {
  const blockers = [
    plan.analyticsConnected ? { id: "analytics_plan_connected", label: plan.label, reason: "5.1 must not connect analytics.", requiredAction: "Remove analytics connection.", riskLevel: "critical" as const } : undefined,
    plan.analyticsSent ? { id: "analytics_plan_sent", label: plan.label, reason: "5.1 must not send analytics.", requiredAction: "Disable analytics sending.", riskLevel: "critical" as const } : undefined,
    plan.sdkInstalled ? { id: "analytics_plan_sdk", label: plan.label, reason: "5.1 must not install analytics SDKs.", requiredAction: "Keep provider options as planning only.", riskLevel: "high" as const } : undefined,
    plan.rawSensitiveTextIncluded ? { id: "analytics_plan_raw_text", label: plan.label, reason: "Analytics payloads must not include raw sensitive text.", requiredAction: "Remove raw sensitive text from event candidates.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers };
}

export function createAnalyticsConnectionDecisionReport(plan: TeoyubePublicLaunchAnalyticsPlan = createPublicLaunchAnalyticsPlan()) {
  const validation = validateAnalyticsConnectionReadiness(plan);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: validation.valid ? "defer_until_consent_strategy" as const : "blocked" as const,
    plan,
    blockers: validation.blockers,
    warnings: [{ id: "analytics_plan_deferred", label: plan.label, message: "External analytics remain deferred until consent, payload, and provider review.", recommendedAction: "Review during a later explicit service connection step.", riskLevel: "medium" as const }],
    noAnalyticsConnected: true,
    noAnalyticsSent: true,
    noSdkInstalled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
