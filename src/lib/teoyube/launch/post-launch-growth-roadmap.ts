import type {
  TeoyubePostLaunchGrowthRoadmapItem,
  TeoyubePostLaunchOperationsBlocker,
  TeoyubePostLaunchOperationsDecision,
  TeoyubePostLaunchOperationsWarning
} from "./post-launch-operations-contracts";

export type TeoyubePostLaunchGrowthRoadmapInput = {
  analyticsConnected?: boolean;
  persistenceConnected?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  monitoringProviderConnected?: boolean;
  externalServicesCalled?: boolean;
  serviceWorkerRegistered?: boolean;
  usersContacted?: boolean;
  feedbackCollectedAutomatically?: boolean;
  rawSensitiveTextStored?: boolean;
  hiddenPersonalizationCreated?: boolean;
  ownerReviewAvailable?: boolean;
  publicLaunchRecorded?: boolean;
};

export type TeoyubePostLaunchGrowthRoadmap = Required<TeoyubePostLaunchGrowthRoadmapInput> & {
  id: string;
  label: string;
  items: TeoyubePostLaunchGrowthRoadmapItem[];
  manualOnly: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function getPostLaunchGrowthRoadmapItems(): TeoyubePostLaunchGrowthRoadmapItem[] {
  return [
    { id: "growth_public_monitoring_cadence", label: "Tune public monitoring cadence from owner-reviewed notes", category: "monitoring", priority: "now", ownerReviewRequired: true, requiresSeparateServiceApproval: false },
    { id: "growth_support_response_playbook", label: "Refine support response playbook", category: "support", priority: "now", ownerReviewRequired: true, requiresSeparateServiceApproval: false },
    { id: "growth_content_clarity_improvements", label: "Prioritize content clarity improvements", category: "content_clarity", priority: "next", ownerReviewRequired: true, requiresSeparateServiceApproval: false },
    { id: "growth_mobile_accessibility_polish", label: "Plan mobile and accessibility polish", category: "mobile", priority: "next", ownerReviewRequired: true, requiresSeparateServiceApproval: false },
    { id: "growth_scripture_explanation_quality", label: "Improve Scripture anchor and explanation path quality", category: "scripture_anchor", priority: "next", ownerReviewRequired: true, requiresSeparateServiceApproval: false },
    { id: "growth_fallback_confidence_review", label: "Review fallback and confidence messaging", category: "fallback", priority: "next", ownerReviewRequired: true, requiresSeparateServiceApproval: false },
    { id: "growth_personalization_consent_review", label: "Review consent-aware personalization improvements", category: "personalization", priority: "later", ownerReviewRequired: true, requiresSeparateServiceApproval: false },
    { id: "growth_persistence_decision_point", label: "Evaluate production persistence only after explicit privacy/storage approval", category: "production_services", priority: "later", ownerReviewRequired: true, requiresSeparateServiceApproval: true },
    { id: "growth_analytics_decision_point", label: "Evaluate external analytics only after consent and payload review", category: "production_services", priority: "later", ownerReviewRequired: true, requiresSeparateServiceApproval: true },
    { id: "growth_live_ai_decision_point", label: "Evaluate live AI only after grounding, safety, fallback, and owner review", category: "ai_companion", priority: "later", ownerReviewRequired: true, requiresSeparateServiceApproval: true }
  ];
}

export function createPostLaunchGrowthRoadmap(
  input: TeoyubePostLaunchGrowthRoadmapInput = {}
): TeoyubePostLaunchGrowthRoadmap {
  return {
    id: "post_launch_growth_roadmap_7_1",
    label: "Post-Launch Operations 7.1 Growth Roadmap",
    items: getPostLaunchGrowthRoadmapItems(),
    analyticsConnected: input.analyticsConnected ?? false,
    persistenceConnected: input.persistenceConnected ?? false,
    liveAiOrchestrationEnabled: input.liveAiOrchestrationEnabled ?? false,
    monitoringProviderConnected: input.monitoringProviderConnected ?? false,
    externalServicesCalled: input.externalServicesCalled ?? false,
    serviceWorkerRegistered: input.serviceWorkerRegistered ?? false,
    usersContacted: input.usersContacted ?? false,
    feedbackCollectedAutomatically: input.feedbackCollectedAutomatically ?? false,
    rawSensitiveTextStored: input.rawSensitiveTextStored ?? false,
    hiddenPersonalizationCreated: input.hiddenPersonalizationCreated ?? false,
    ownerReviewAvailable: input.ownerReviewAvailable ?? true,
    publicLaunchRecorded: input.publicLaunchRecorded ?? false,
    manualOnly: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPostLaunchGrowthRoadmapBlockers(
  roadmap: TeoyubePostLaunchGrowthRoadmap = createPostLaunchGrowthRoadmap()
): TeoyubePostLaunchOperationsBlocker[] {
  return [
    !roadmap.ownerReviewAvailable ? { id: "post_launch_growth_owner_review_missing", label: "Owner review", reason: "Growth roadmap requires owner review.", requiredAction: "Complete owner review before using the roadmap.", riskLevel: "high" as const } : undefined,
    roadmap.analyticsConnected ? { id: "post_launch_growth_analytics_connected", label: "Analytics connected", reason: "7.1 must not connect external analytics.", requiredAction: "Keep analytics as a future explicit decision.", riskLevel: "critical" as const } : undefined,
    roadmap.persistenceConnected ? { id: "post_launch_growth_persistence_connected", label: "Persistence connected", reason: "7.1 must not connect production persistence.", requiredAction: "Keep persistence as a future explicit decision.", riskLevel: "critical" as const } : undefined,
    roadmap.liveAiOrchestrationEnabled ? { id: "post_launch_growth_live_ai_enabled", label: "Live AI orchestration", reason: "7.1 must not enable live AI orchestration.", requiredAction: "Keep live AI as a future explicit decision.", riskLevel: "critical" as const } : undefined,
    roadmap.monitoringProviderConnected || roadmap.externalServicesCalled ? { id: "post_launch_growth_external_services", label: "External service connected", reason: "7.1 must not connect monitoring or production providers.", requiredAction: "Move provider choices to later approval.", riskLevel: "critical" as const } : undefined,
    roadmap.serviceWorkerRegistered ? { id: "post_launch_growth_service_worker", label: "Service worker registered", reason: "7.1 must not add service workers.", requiredAction: "Remove service worker work from 7.1.", riskLevel: "critical" as const } : undefined,
    roadmap.usersContacted ? { id: "post_launch_growth_users_contacted", label: "Users contacted", reason: "7.1 must not contact users from code.", requiredAction: "Keep outreach manual and outside code.", riskLevel: "critical" as const } : undefined,
    roadmap.feedbackCollectedAutomatically ? { id: "post_launch_growth_feedback_auto_collected", label: "Feedback collected automatically", reason: "7.1 must not collect feedback automatically.", requiredAction: "Use manual feedback inputs only.", riskLevel: "critical" as const } : undefined,
    roadmap.rawSensitiveTextStored ? { id: "post_launch_growth_raw_sensitive_text", label: "Raw sensitive text", reason: "7.1 must not store raw sensitive text.", requiredAction: "Use sanitized planning notes only.", riskLevel: "critical" as const } : undefined,
    roadmap.hiddenPersonalizationCreated ? { id: "post_launch_growth_hidden_personalization", label: "Hidden personalization", reason: "7.1 must not create hidden personalization.", requiredAction: "Keep personalization visible and consent-aware.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as TeoyubePostLaunchOperationsBlocker[];
}

export function getPostLaunchGrowthRoadmapWarnings(
  roadmap: TeoyubePostLaunchGrowthRoadmap = createPostLaunchGrowthRoadmap()
): TeoyubePostLaunchOperationsWarning[] {
  return [
    !roadmap.publicLaunchRecorded ? {
      id: "post_launch_growth_no_public_launch_record",
      label: "No real public launch record",
      message: "Growth roadmap is structural unless real public launch outcomes were recorded manually.",
      recommendedAction: "Treat growth priorities as planning inputs until real owner-reviewed launch data exists.",
      riskLevel: "medium" as const
    } : undefined
  ].filter(Boolean) as TeoyubePostLaunchOperationsWarning[];
}

export function createPostLaunchGrowthRoadmapDecision(
  roadmap: TeoyubePostLaunchGrowthRoadmap = createPostLaunchGrowthRoadmap()
): TeoyubePostLaunchOperationsDecision {
  const blockers = getPostLaunchGrowthRoadmapBlockers(roadmap);
  if (blockers.length > 0) return "needs_growth_roadmap_review";
  if (!roadmap.publicLaunchRecorded) return "not_applicable_no_public_launch_recorded";
  return "ready_for_public_monitoring_support_growth";
}

export function createPostLaunchGrowthRoadmapReport(
  roadmap: TeoyubePostLaunchGrowthRoadmap = createPostLaunchGrowthRoadmap()
) {
  const blockers = getPostLaunchGrowthRoadmapBlockers(roadmap);
  const warnings = getPostLaunchGrowthRoadmapWarnings(roadmap);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createPostLaunchGrowthRoadmapDecision(roadmap),
    roadmap,
    items: roadmap.items,
    decisionPointCount: roadmap.items.filter((item) => item.requiresSeparateServiceApproval).length,
    blockers,
    warnings,
    scriptureAnchoringRequired: true,
    explanationPathsRequired: true,
    fallbackEnabled: true,
    consentAwarePersonalizationRequired: true,
    manualOnly: true,
    inMemoryOnly: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noProductionPersistenceEnabled: true,
    noExternalAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noMonitoringProviderConnected: true,
    noServiceWorkerRegistered: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
