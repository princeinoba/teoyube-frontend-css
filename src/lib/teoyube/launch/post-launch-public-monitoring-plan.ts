import { createPostLaunchReadinessPackage, createPostLaunchReadinessPackageReport } from "./post-launch-readiness-package";
import { runPublicLaunchCompletionAudit } from "./public-launch-completion-audit";
import type {
  TeoyubePostLaunchMonitoringItem,
  TeoyubePostLaunchOperationsBlocker,
  TeoyubePostLaunchOperationsCheck,
  TeoyubePostLaunchOperationsDecision,
  TeoyubePostLaunchOperationsWarning
} from "./post-launch-operations-contracts";

export type TeoyubePostLaunchPublicMonitoringPlanInput = {
  publicUrlFetched?: boolean;
  monitoringProviderConnected?: boolean;
  analyticsSent?: boolean;
  databaseWritten?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  serviceWorkerRegistered?: boolean;
  usersContacted?: boolean;
  feedbackCollectedAutomatically?: boolean;
  rawSensitiveTextStored?: boolean;
  hiddenPersonalizationCreated?: boolean;
  ownerReviewAvailable?: boolean;
  publicLaunchRecorded?: boolean;
};

export type TeoyubePostLaunchPublicMonitoringPlan = Required<TeoyubePostLaunchPublicMonitoringPlanInput> & {
  id: string;
  label: string;
  checklist: TeoyubePostLaunchOperationsCheck[];
  monitoringItems: TeoyubePostLaunchMonitoringItem[];
  manualOnly: true;
  inMemoryOnly: true;
  monitoringPerformedByCode: false;
  generatedAt: string;
};

function check(id: string, label: string, details: string): TeoyubePostLaunchOperationsCheck {
  return { id, label, required: true, complete: true, details, riskLevel: "high" };
}

export function getPostLaunchPublicMonitoringChecklist(): TeoyubePostLaunchOperationsCheck[] {
  return [
    check("public_launch_completion_audit_reviewed", "Public launch completion audit reviewed", "Public Launch Execution 6.5 completion audit is available before monitoring planning."),
    check("post_launch_readiness_package_reviewed", "Post-launch readiness package reviewed", "Post-launch readiness package is available before monitoring planning."),
    check("public_surface_health_manual_review", "Public surface health manual review planned", "Surface health review remains manual and does not fetch public URLs."),
    check("scripture_anchor_watch_planned", "Scripture anchor watch planned", "Scripture anchors remain required in public monitoring review."),
    check("explanation_path_watch_planned", "Explanation path watch planned", "Explanation paths remain required in public monitoring review."),
    check("fallback_confidence_watch_planned", "Fallback and confidence watch planned", "Fallback remains enabled and confidence remains bounded."),
    check("privacy_terms_consent_watch_planned", "Privacy, terms, and consent watch planned", "Public notices and consent controls remain visible."),
    check("manual_feedback_review_planned", "Manual feedback review planned", "Feedback review remains manual, sanitized, and owner-reviewed."),
    check("mobile_accessibility_review_planned", "Mobile and accessibility review planned", "Mobile and accessibility public checks remain owner-reviewable."),
    check("production_service_status_review_planned", "Production service status review planned", "Persistence, analytics, monitoring providers, and live AI remain explicit future decisions.")
  ];
}

export function getPostLaunchPublicMonitoringItems(): TeoyubePostLaunchMonitoringItem[] {
  return [
    { id: "monitor_public_surface_health", label: "Review public surface health manually", area: "public_surface_health", cadence: "daily", owner: "qa", manualOnly: true, required: true },
    { id: "monitor_scripture_anchors", label: "Review Scripture anchoring", area: "scripture_anchor", cadence: "daily", owner: "owner", manualOnly: true, required: true },
    { id: "monitor_explanation_paths", label: "Review explanation paths", area: "explanation_path", cadence: "daily", owner: "qa", manualOnly: true, required: true },
    { id: "monitor_fallback_confidence", label: "Review fallback and confidence behavior", area: "fallback", cadence: "daily", owner: "qa", manualOnly: true, required: true },
    { id: "monitor_privacy_terms_consent", label: "Review privacy, terms, and consent notices", area: "privacy_terms_consent", cadence: "weekly", owner: "privacy", manualOnly: true, required: true },
    { id: "monitor_manual_feedback", label: "Review sanitized manual feedback", area: "manual_feedback", cadence: "daily", owner: "support", manualOnly: true, required: true },
    { id: "monitor_mobile_accessibility", label: "Review mobile and accessibility notes", area: "mobile", cadence: "weekly", owner: "qa", manualOnly: true, required: true },
    { id: "monitor_production_services", label: "Review production service decision status", area: "production_services", cadence: "owner_review", owner: "owner", manualOnly: true, required: true }
  ];
}

export function createPostLaunchPublicMonitoringPlan(
  input: TeoyubePostLaunchPublicMonitoringPlanInput = {}
): TeoyubePostLaunchPublicMonitoringPlan {
  return {
    id: "post_launch_public_monitoring_plan_7_1",
    label: "Post-Launch Operations 7.1 Public Monitoring Plan",
    checklist: getPostLaunchPublicMonitoringChecklist(),
    monitoringItems: getPostLaunchPublicMonitoringItems(),
    publicUrlFetched: input.publicUrlFetched ?? false,
    monitoringProviderConnected: input.monitoringProviderConnected ?? false,
    analyticsSent: input.analyticsSent ?? false,
    databaseWritten: input.databaseWritten ?? false,
    liveAiOrchestrationEnabled: input.liveAiOrchestrationEnabled ?? false,
    serviceWorkerRegistered: input.serviceWorkerRegistered ?? false,
    usersContacted: input.usersContacted ?? false,
    feedbackCollectedAutomatically: input.feedbackCollectedAutomatically ?? false,
    rawSensitiveTextStored: input.rawSensitiveTextStored ?? false,
    hiddenPersonalizationCreated: input.hiddenPersonalizationCreated ?? false,
    ownerReviewAvailable: input.ownerReviewAvailable ?? true,
    publicLaunchRecorded: input.publicLaunchRecorded ?? false,
    manualOnly: true,
    inMemoryOnly: true,
    monitoringPerformedByCode: false,
    generatedAt: new Date().toISOString()
  };
}

export function getPostLaunchPublicMonitoringBlockers(
  plan: TeoyubePostLaunchPublicMonitoringPlan = createPostLaunchPublicMonitoringPlan()
): TeoyubePostLaunchOperationsBlocker[] {
  return [
    !runPublicLaunchCompletionAudit().complete ? { id: "post_launch_monitoring_completion_audit_missing", label: "Public launch completion audit", reason: "Public launch completion audit must be complete before 7.1 monitoring planning.", requiredAction: "Complete Public Launch Execution 6.5 audit.", riskLevel: "critical" as const } : undefined,
    !createPostLaunchReadinessPackageReport(createPostLaunchReadinessPackage()).ready ? { id: "post_launch_monitoring_readiness_package_blocked", label: "Post-launch readiness package", reason: "Post-launch readiness package is blocked.", requiredAction: "Resolve readiness package blockers.", riskLevel: "critical" as const } : undefined,
    !plan.ownerReviewAvailable ? { id: "post_launch_monitoring_owner_review_missing", label: "Owner review", reason: "Owner review is required for public monitoring cadence.", requiredAction: "Complete owner review before using the plan.", riskLevel: "high" as const } : undefined,
    plan.publicUrlFetched ? { id: "post_launch_monitoring_public_url_fetched", label: "Public URL fetched", reason: "7.1 must not fetch public URLs from code.", requiredAction: "Keep public URL checks manual.", riskLevel: "critical" as const } : undefined,
    plan.monitoringProviderConnected ? { id: "post_launch_monitoring_provider_connected", label: "Monitoring provider connected", reason: "7.1 must not connect production monitoring providers.", requiredAction: "Move provider connection to a later explicit decision.", riskLevel: "critical" as const } : undefined,
    plan.analyticsSent ? { id: "post_launch_monitoring_analytics_sent", label: "Analytics sent", reason: "7.1 must not send external analytics.", requiredAction: "Keep analytics disabled.", riskLevel: "critical" as const } : undefined,
    plan.databaseWritten ? { id: "post_launch_monitoring_database_written", label: "Database written", reason: "7.1 must not write production persistence.", requiredAction: "Keep persistence disabled.", riskLevel: "critical" as const } : undefined,
    plan.liveAiOrchestrationEnabled ? { id: "post_launch_monitoring_live_ai_enabled", label: "Live AI enabled", reason: "7.1 must not enable live AI orchestration.", requiredAction: "Keep live AI disabled.", riskLevel: "critical" as const } : undefined,
    plan.serviceWorkerRegistered ? { id: "post_launch_monitoring_service_worker", label: "Service worker registered", reason: "7.1 must not add service workers.", requiredAction: "Remove service worker registration.", riskLevel: "critical" as const } : undefined,
    plan.usersContacted ? { id: "post_launch_monitoring_users_contacted", label: "Users contacted", reason: "7.1 must not contact users from code.", requiredAction: "Keep contact manual and outside code.", riskLevel: "critical" as const } : undefined,
    plan.feedbackCollectedAutomatically ? { id: "post_launch_monitoring_feedback_auto_collected", label: "Feedback collected automatically", reason: "7.1 must not collect feedback automatically.", requiredAction: "Use manual feedback review only.", riskLevel: "critical" as const } : undefined,
    plan.rawSensitiveTextStored ? { id: "post_launch_monitoring_raw_sensitive_text", label: "Raw sensitive text stored", reason: "7.1 must not store raw sensitive personalization or feedback text.", requiredAction: "Use sanitized notes only.", riskLevel: "critical" as const } : undefined,
    plan.hiddenPersonalizationCreated ? { id: "post_launch_monitoring_hidden_personalization", label: "Hidden personalization", reason: "7.1 must not create hidden personalization.", requiredAction: "Keep personalization visible and consent-aware.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as TeoyubePostLaunchOperationsBlocker[];
}

export function getPostLaunchPublicMonitoringWarnings(
  plan: TeoyubePostLaunchPublicMonitoringPlan = createPostLaunchPublicMonitoringPlan()
): TeoyubePostLaunchOperationsWarning[] {
  return [
    !plan.publicLaunchRecorded ? {
      id: "post_launch_monitoring_no_public_launch_record",
      label: "No real public launch record",
      message: "The 7.1 monitoring plan is structural unless a real public launch was recorded manually outside code.",
      recommendedAction: "Record real public launch outcomes only through owner-reviewed manual notes.",
      riskLevel: "medium" as const
    } : undefined
  ].filter(Boolean) as TeoyubePostLaunchOperationsWarning[];
}

export function createPostLaunchPublicMonitoringDecision(
  plan: TeoyubePostLaunchPublicMonitoringPlan = createPostLaunchPublicMonitoringPlan()
): TeoyubePostLaunchOperationsDecision {
  const blockers = getPostLaunchPublicMonitoringBlockers(plan);
  if (blockers.length > 0) return "needs_public_monitoring_review";
  if (!plan.publicLaunchRecorded) return "not_applicable_no_public_launch_recorded";
  if (getPostLaunchPublicMonitoringWarnings(plan).length > 0) return "ready_after_owner_review";
  return "ready_for_public_monitoring_support_growth";
}

export function createPostLaunchPublicMonitoringReport(
  plan: TeoyubePostLaunchPublicMonitoringPlan = createPostLaunchPublicMonitoringPlan()
) {
  const blockers = getPostLaunchPublicMonitoringBlockers(plan);
  const warnings = getPostLaunchPublicMonitoringWarnings(plan);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createPostLaunchPublicMonitoringDecision(plan),
    plan,
    checklist: plan.checklist,
    monitoringItems: plan.monitoringItems,
    blockers,
    warnings,
    scriptureAnchoringRequired: true,
    explanationPathsRequired: true,
    fallbackEnabled: true,
    confidenceBounded: true,
    consentControlsRequired: true,
    privacyTermsConsentNoticesRequired: true,
    manualOnly: true,
    inMemoryOnly: true,
    noMonitoringPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noProductionPersistenceEnabled: true,
    noExternalAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noServiceWorkerRegistered: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
