import type {
  TeoyubeServiceReadinessBlocker,
  TeoyubeServiceReadinessDecision,
  TeoyubeServiceReadinessKind,
  TeoyubeServiceReadinessReport,
  TeoyubeServiceReadinessRequirement,
  TeoyubeServiceReadinessReview,
  TeoyubeServiceReadinessRisk,
  TeoyubeServiceReadinessStatus,
  TeoyubeServiceReadinessWarning
} from "./service-readiness-review-contracts";

function requirement(id: string, label: string, details: string, complete = false): TeoyubeServiceReadinessRequirement {
  return { id, label, required: true, complete, details };
}

function risk(id: string, severity: TeoyubeServiceReadinessRisk["severity"], message: string, mitigation: string): TeoyubeServiceReadinessRisk {
  return { id, severity, message, mitigation };
}

function review(
  kind: TeoyubeServiceReadinessKind,
  status: TeoyubeServiceReadinessStatus,
  whyUsefulLater: string,
  mustNotHappenYet: string[]
): TeoyubeServiceReadinessReview {
  return {
    kind,
    status,
    whyUsefulLater,
    requirements: [
      requirement("privacy_review", "Privacy review", "Review data categories, consent, retention, deletion, export, and sensitive content handling."),
      requirement("security_review", "Security review", "Review auth, authorization, secrets, abuse controls, auditability, and rollback."),
      requirement("cost_review", "Cost review", "Review provider costs, limits, alerts, failure modes, and owner budget approval."),
      requirement("owner_approval", "Owner approval", "Owner must explicitly approve any future service connection."),
      requirement("fallback_review", "Fallback review", "Scripture anchors, explanation paths, confidence labels, and fallback safety must remain intact.")
    ],
    risks: [
      risk(`${kind}_privacy_scope`, "medium", "Service could expand Teoyube data handling responsibilities.", "Keep service disabled until privacy review is complete."),
      risk(`${kind}_operational_scope`, "medium", "Service could create operational obligations before beta readiness is proven.", "Keep Phase 4.5 plan-only and in-memory.")
    ],
    dataProtectionRequirements: [
      "Minimize stored data.",
      "Do not store sensitive prayer, calling, or personalization text without explicit consent and privacy review.",
      "Separate content-review data from private user records.",
      "Avoid secrets, credentials, or raw private text in logs."
    ],
    rollbackRequirements: [
      "Provider can be disabled without breaking Scripture-anchored fallback.",
      "Content changes can roll back to a prior reviewed version.",
      "Failure mode returns safe read-only or in-memory behavior."
    ],
    mustNotHappenYet,
    serviceConnected: false
  };
}

export function reviewDatabasePersistenceReadiness(): TeoyubeServiceReadinessReview {
  return review("database_persistence", "disabled", "May later support reviewed content workflow, owner-approved feedback records, or user-owned saved state.", ["Do not connect a database.", "Do not create migrations.", "Do not persist sensitive user input."]);
}

export function reviewAdminAuthReadiness(): TeoyubeServiceReadinessReview {
  return review("admin_auth", "disabled", "May later protect an owner/reviewer workflow.", ["Do not add admin authentication.", "Do not add user accounts.", "Do not expose admin routes publicly."]);
}

export function reviewAdminCmsReadiness(): TeoyubeServiceReadinessReview {
  return review("admin_cms", "disabled", "May later help manage reviewed words, Promise Clusters, Scripture anchors, prayers, callings, and copy.", ["Do not connect a CMS.", "Do not create write APIs.", "Do not publish drafts automatically."]);
}

export function reviewFeedbackStorageReadiness(): TeoyubeServiceReadinessReview {
  return review("feedback_storage", "disabled", "May later support beta feedback triage and improvement loops.", ["Do not store feedback.", "Do not collect sensitive feedback automatically.", "Do not contact users."]);
}

export function reviewAnalyticsReadiness(): TeoyubeServiceReadinessReview {
  return review("external_analytics", "disabled", "May later help understand beta usability after privacy review.", ["Do not add analytics scripts.", "Do not send events.", "Do not track spiritual, prayer, or calling content."]);
}

export function reviewMonitoringReadiness(): TeoyubeServiceReadinessReview {
  return review("production_monitoring", "plan_only", "May later help detect runtime errors during beta.", ["Do not connect monitoring providers.", "Do not send logs externally.", "Do not collect sensitive content."]);
}

export function reviewLiveAiReadiness(): TeoyubeServiceReadinessReview {
  return review("live_ai_orchestration", "disabled", "May later support dynamic responses after grounding, safety, cost, and owner review mature.", ["Do not connect live AI.", "Do not call model APIs.", "Do not bypass TIG grounding, Scripture anchors, explanation paths, fallback, or confidence labels."]);
}

export function reviewEmailNotificationReadiness(): TeoyubeServiceReadinessReview {
  return review("email_notifications", "disabled", "May later support owner-approved beta communications.", ["Do not send email.", "Do not send notifications.", "Do not contact users automatically."]);
}

export function createServiceReadinessReview(): TeoyubeServiceReadinessReview[] {
  return [
    reviewDatabasePersistenceReadiness(),
    reviewAdminAuthReadiness(),
    reviewAdminCmsReadiness(),
    reviewFeedbackStorageReadiness(),
    reviewAnalyticsReadiness(),
    reviewMonitoringReadiness(),
    reviewLiveAiReadiness(),
    reviewEmailNotificationReadiness()
  ];
}

export function createServiceReadinessDecision(reviews: TeoyubeServiceReadinessReview[] = createServiceReadinessReview()): TeoyubeServiceReadinessDecision {
  if (reviews.some((entry) => entry.serviceConnected || entry.status === "blocked")) return "blocked";
  if (reviews.every((entry) => entry.status === "approved_for_future_phase")) return "approved_for_future_phase";
  if (reviews.some((entry) => entry.status === "plan_only")) return "plan_only_with_reviews_required";
  return "all_services_disabled";
}

function blockersForReviews(reviews: TeoyubeServiceReadinessReview[]): TeoyubeServiceReadinessBlocker[] {
  return reviews
    .filter((entry) => entry.serviceConnected)
    .map((entry) => ({
      id: `${entry.kind}_connected`,
      kind: entry.kind,
      message: `${entry.kind} must remain disconnected in Phase 4.5.`,
      requiredAction: "Disconnect the service and keep readiness review plan-only."
    }));
}

function warningsForReviews(reviews: TeoyubeServiceReadinessReview[]): TeoyubeServiceReadinessWarning[] {
  return reviews.flatMap((entry) =>
    entry.requirements
      .filter((requirementEntry) => requirementEntry.required && !requirementEntry.complete)
      .map((requirementEntry) => ({
        id: `${entry.kind}_${requirementEntry.id}`,
        kind: entry.kind,
        message: `${entry.kind} requires ${requirementEntry.label.toLowerCase()} before implementation.`,
        recommendedAction: requirementEntry.details
      }))
  );
}

export function createServiceReadinessReviewReport(
  reviews: TeoyubeServiceReadinessReview[] = createServiceReadinessReview()
): TeoyubeServiceReadinessReport {
  const blockers = blockersForReviews(reviews);
  const warnings = warningsForReviews(reviews);
  return {
    valid: blockers.length === 0,
    decision: createServiceReadinessDecision(reviews),
    reviews,
    blockers,
    warnings,
    serviceConnectedCount: reviews.filter((entry) => entry.serviceConnected).length,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noEmailsOrNotificationsSent: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
