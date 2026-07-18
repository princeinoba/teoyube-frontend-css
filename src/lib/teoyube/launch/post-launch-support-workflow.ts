import type {
  TeoyubePostLaunchOperationsBlocker,
  TeoyubePostLaunchOperationsDecision,
  TeoyubePostLaunchOperationsWarning,
  TeoyubePostLaunchSupportStep
} from "./post-launch-operations-contracts";

export type TeoyubePostLaunchSupportWorkflowInput = {
  usersContacted?: boolean;
  messagesSent?: boolean;
  ticketsPersisted?: boolean;
  databaseWritten?: boolean;
  analyticsSent?: boolean;
  externalServicesCalled?: boolean;
  publicUrlFetched?: boolean;
  feedbackCollectedAutomatically?: boolean;
  rawSensitiveTextStored?: boolean;
  hiddenPersonalizationCreated?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  ownerReviewAvailable?: boolean;
  publicLaunchRecorded?: boolean;
};

export type TeoyubePostLaunchSupportWorkflow = Required<TeoyubePostLaunchSupportWorkflowInput> & {
  id: string;
  label: string;
  steps: TeoyubePostLaunchSupportStep[];
  manualOnly: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function getPostLaunchSupportWorkflowChecklist(): TeoyubePostLaunchSupportStep[] {
  return [
    { id: "support_manual_intake", label: "Manual support intake path exists", category: "technical", required: true, complete: true, manualOnly: true },
    { id: "support_sensitive_info_warning", label: "Sensitive information warning remains visible", category: "privacy", required: true, complete: true, manualOnly: true },
    { id: "support_privacy_terms_consent_routing", label: "Privacy, terms, and consent issues route to owner review", category: "consent", required: true, complete: true, manualOnly: true },
    { id: "support_scripture_anchor_escalation", label: "Scripture anchor issues escalate as public-safety issues", category: "scripture_anchor", required: true, complete: true, manualOnly: true },
    { id: "support_explanation_path_escalation", label: "Explanation path issues escalate as public-safety issues", category: "explanation_path", required: true, complete: true, manualOnly: true },
    { id: "support_fallback_escalation", label: "Fallback issues escalate as public-safety issues", category: "fallback", required: true, complete: true, manualOnly: true },
    { id: "support_mobile_accessibility_routing", label: "Mobile and accessibility issues route to QA", category: "accessibility", required: true, complete: true, manualOnly: true },
    { id: "support_ai_personalization_routing", label: "AI Companion and personalization issues route to safety review", category: "ai_companion", required: true, complete: true, manualOnly: true },
    { id: "support_no_automatic_contact", label: "No automatic user contact", category: "privacy", required: true, complete: true, manualOnly: true },
    { id: "support_no_external_ticketing", label: "No external ticketing provider connected", category: "technical", required: true, complete: true, manualOnly: true }
  ];
}

export function createPostLaunchSupportWorkflow(
  input: TeoyubePostLaunchSupportWorkflowInput = {}
): TeoyubePostLaunchSupportWorkflow {
  return {
    id: "post_launch_support_workflow_7_1",
    label: "Post-Launch Operations 7.1 Support Workflow",
    steps: getPostLaunchSupportWorkflowChecklist(),
    usersContacted: input.usersContacted ?? false,
    messagesSent: input.messagesSent ?? false,
    ticketsPersisted: input.ticketsPersisted ?? false,
    databaseWritten: input.databaseWritten ?? false,
    analyticsSent: input.analyticsSent ?? false,
    externalServicesCalled: input.externalServicesCalled ?? false,
    publicUrlFetched: input.publicUrlFetched ?? false,
    feedbackCollectedAutomatically: input.feedbackCollectedAutomatically ?? false,
    rawSensitiveTextStored: input.rawSensitiveTextStored ?? false,
    hiddenPersonalizationCreated: input.hiddenPersonalizationCreated ?? false,
    liveAiOrchestrationEnabled: input.liveAiOrchestrationEnabled ?? false,
    ownerReviewAvailable: input.ownerReviewAvailable ?? true,
    publicLaunchRecorded: input.publicLaunchRecorded ?? false,
    manualOnly: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPostLaunchSupportWorkflowBlockers(
  workflow: TeoyubePostLaunchSupportWorkflow = createPostLaunchSupportWorkflow()
): TeoyubePostLaunchOperationsBlocker[] {
  return [
    !workflow.ownerReviewAvailable ? { id: "post_launch_support_owner_review_missing", label: "Owner review", reason: "Support workflow requires owner review.", requiredAction: "Complete owner review before using support workflow.", riskLevel: "high" as const } : undefined,
    workflow.usersContacted || workflow.messagesSent ? { id: "post_launch_support_users_contacted", label: "Users contacted", reason: "7.1 must not contact users or send messages from code.", requiredAction: "Keep support contact manual and outside code.", riskLevel: "critical" as const } : undefined,
    workflow.ticketsPersisted || workflow.databaseWritten ? { id: "post_launch_support_persistence", label: "Support persistence", reason: "7.1 must not write tickets or production persistence.", requiredAction: "Keep support workflow in memory/manual docs only.", riskLevel: "critical" as const } : undefined,
    workflow.analyticsSent ? { id: "post_launch_support_analytics", label: "Support analytics", reason: "7.1 must not send analytics.", requiredAction: "Keep analytics disabled.", riskLevel: "critical" as const } : undefined,
    workflow.externalServicesCalled ? { id: "post_launch_support_external_services", label: "External support service", reason: "7.1 must not connect external support providers.", requiredAction: "Move provider selection to a later explicit approval.", riskLevel: "critical" as const } : undefined,
    workflow.publicUrlFetched ? { id: "post_launch_support_public_url", label: "Public URL fetched", reason: "Support workflow must not fetch public URLs.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined,
    workflow.feedbackCollectedAutomatically ? { id: "post_launch_support_auto_feedback", label: "Automatic feedback collection", reason: "Support workflow must not collect feedback automatically.", requiredAction: "Use manually entered sanitized notes only.", riskLevel: "critical" as const } : undefined,
    workflow.rawSensitiveTextStored ? { id: "post_launch_support_raw_sensitive_text", label: "Raw sensitive text", reason: "Support workflow must not store raw sensitive text.", requiredAction: "Use redacted summaries only.", riskLevel: "critical" as const } : undefined,
    workflow.hiddenPersonalizationCreated ? { id: "post_launch_support_hidden_personalization", label: "Hidden personalization", reason: "Support workflow must not create hidden personalization.", requiredAction: "Keep personalization visible and consent-aware.", riskLevel: "critical" as const } : undefined,
    workflow.liveAiOrchestrationEnabled ? { id: "post_launch_support_live_ai", label: "Live AI orchestration", reason: "Support workflow must not enable live AI orchestration.", requiredAction: "Keep live AI disabled.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as TeoyubePostLaunchOperationsBlocker[];
}

export function getPostLaunchSupportWorkflowWarnings(
  workflow: TeoyubePostLaunchSupportWorkflow = createPostLaunchSupportWorkflow()
): TeoyubePostLaunchOperationsWarning[] {
  return [
    !workflow.publicLaunchRecorded ? {
      id: "post_launch_support_no_public_launch_record",
      label: "No real public launch record",
      message: "Support workflow is structural unless real public launch support activity is recorded manually.",
      recommendedAction: "Use owner-reviewed notes for any real public support outcomes.",
      riskLevel: "medium" as const
    } : undefined
  ].filter(Boolean) as TeoyubePostLaunchOperationsWarning[];
}

export function createPostLaunchSupportWorkflowDecision(
  workflow: TeoyubePostLaunchSupportWorkflow = createPostLaunchSupportWorkflow()
): TeoyubePostLaunchOperationsDecision {
  const blockers = getPostLaunchSupportWorkflowBlockers(workflow);
  if (blockers.length > 0) return "needs_support_workflow_review";
  if (!workflow.publicLaunchRecorded) return "not_applicable_no_public_launch_recorded";
  return "ready_for_public_monitoring_support_growth";
}

export function createPostLaunchSupportWorkflowReport(
  workflow: TeoyubePostLaunchSupportWorkflow = createPostLaunchSupportWorkflow()
) {
  const blockers = getPostLaunchSupportWorkflowBlockers(workflow);
  const warnings = getPostLaunchSupportWorkflowWarnings(workflow);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createPostLaunchSupportWorkflowDecision(workflow),
    workflow,
    steps: workflow.steps,
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    sanitizedOnly: !workflow.rawSensitiveTextStored,
    noUsersContacted: true,
    noMessagesSent: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noDatabaseWritten: true,
    noAnalyticsSent: true,
    noExternalServicesCalled: true,
    noLiveAiOrchestrationEnabled: true,
    noHiddenPersonalizationCreated: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
