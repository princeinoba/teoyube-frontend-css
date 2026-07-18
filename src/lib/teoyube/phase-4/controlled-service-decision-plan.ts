import type {
  TeoyubeControlledServiceDecision,
  TeoyubeControlledServiceDecisionReport,
  TeoyubeControlledServiceKind,
  TeoyubeControlledServiceRequirement,
  TeoyubeControlledServiceRisk
} from "./controlled-service-decision-contracts";

function requirement(id: string, label: string, details: string): TeoyubeControlledServiceRequirement {
  return { id, label, requiredBeforeImplementation: true, details };
}

function risk(id: string, severity: TeoyubeControlledServiceRisk["severity"], message: string, mitigation: string): TeoyubeControlledServiceRisk {
  return { id, severity, message, mitigation };
}

function decision(
  kind: TeoyubeControlledServiceKind,
  whyNeededLater: string,
  mustNotDoYet: string[]
): TeoyubeControlledServiceDecision {
  return {
    kind,
    status: kind === "admin_content_workflow" ? "plan_only" : "disabled",
    whyNeededLater,
    privacyReviewRequired: "Review data categories, consent copy, retention, deletion, export, and user expectations before implementation.",
    securityReviewRequired: "Review auth, authorization, least privilege, secrets, auditability, abuse controls, and rollback before implementation.",
    costReviewRequired: "Review provider pricing, usage caps, alerting, and owner budget approval before implementation.",
    ownerApprovalRequired: "Owner must explicitly approve this service in a future phase before any provider is connected.",
    requirements: [
      requirement("owner_decision", "Owner decision", "A written owner go/no-go decision is required."),
      requirement("privacy_review", "Privacy review", "Consent, retention, and sensitive-data handling must be reviewed."),
      requirement("security_review", "Security review", "Access, secrets, abuse, and rollback controls must be reviewed."),
      requirement("cost_review", "Cost review", "Costs, limits, and failure modes must be reviewed."),
      requirement("fallback_review", "Fallback review", "Scripture anchors, explanation traces, confidence labels, and fallback safety must remain intact.")
    ],
    risks: [
      risk(`${kind}_privacy_risk`, "medium", "Service use could introduce new data handling responsibilities.", "Require privacy review and consent before implementation."),
      risk(`${kind}_scope_risk`, "medium", "Service use could expand product scope before UX/content quality is ready.", "Keep Phase 4.1 plan-only and defer implementation.")
    ],
    mustNotDoYet,
    serviceConnected: false
  };
}

export function getDatabasePersistenceDecisionPlan(): TeoyubeControlledServiceDecision {
  return decision("database_persistence", "May later support user-owned saved journeys, admin content workflows, or reviewed feedback records.", ["Do not connect a database.", "Do not persist sensitive prayer, calling, or personalization input.", "Do not add migrations or ORM setup in Phase 4.1."]);
}

export function getAnalyticsDecisionPlan(): TeoyubeControlledServiceDecision {
  return decision("external_analytics", "May later help understand public beta usability and surface health.", ["Do not add analytics scripts.", "Do not send event payloads.", "Do not track sensitive spiritual or prayer content."]);
}

export function getMonitoringDecisionPlan(): TeoyubeControlledServiceDecision {
  return decision("production_monitoring", "May later help detect runtime errors and public beta health issues.", ["Do not connect monitoring providers.", "Do not send logs externally.", "Do not collect sensitive content."]);
}

export function getAdminContentWorkflowDecisionPlan(): TeoyubeControlledServiceDecision {
  return decision("admin_content_workflow", "May later support reviewed updates to words, Promise Clusters, Scripture anchors, calling paths, and prayer sequences.", ["Do not add admin authentication.", "Do not add CMS tooling.", "Do not add write APIs in Phase 4.1."]);
}

export function getFeedbackStorageDecisionPlan(): TeoyubeControlledServiceDecision {
  return decision("feedback_storage", "May later support structured beta feedback and improvement loops.", ["Do not store feedback externally.", "Do not contact users automatically.", "Do not collect sensitive feedback without consent."]);
}

export function getLiveAiDecisionPlan(): TeoyubeControlledServiceDecision {
  return decision("live_ai_orchestration", "May later support dynamic responses after grounding, safety, fallback, and owner review are mature.", ["Do not connect live AI.", "Do not call model APIs.", "Do not bypass TIG grounding, Scripture anchors, explanation traces, fallback, or confidence labels."]);
}

export function createControlledServiceDecisionPlan(): TeoyubeControlledServiceDecision[] {
  return [
    getDatabasePersistenceDecisionPlan(),
    getAnalyticsDecisionPlan(),
    getMonitoringDecisionPlan(),
    getAdminContentWorkflowDecisionPlan(),
    getFeedbackStorageDecisionPlan(),
    {
      ...decision("user_accounts", "May later support user-owned settings and saved progress with explicit consent.", ["Do not add user accounts.", "Do not add auth providers.", "Do not create hidden personalization."]),
      status: "disabled"
    },
    getLiveAiDecisionPlan()
  ];
}

export function createControlledServiceDecisionReport(): TeoyubeControlledServiceDecisionReport {
  const decisions = createControlledServiceDecisionPlan();
  const connected = decisions.filter((entry) => entry.serviceConnected);
  const blockers = connected.map((entry) => `${entry.kind} must remain disconnected in Phase 4.1.`);
  const warnings = decisions.map((entry) => `${entry.kind} is ${entry.status}; future implementation requires owner/privacy/security/cost review.`);

  return {
    valid: blockers.length === 0,
    decisions,
    blockers,
    warnings,
    noServicesConnected: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
