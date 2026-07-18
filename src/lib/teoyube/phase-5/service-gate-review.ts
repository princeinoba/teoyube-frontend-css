import type {
  TeoyubeServiceGateBlocker,
  TeoyubeServiceGateDecision,
  TeoyubeServiceGateKind,
  TeoyubeServiceGateReport,
  TeoyubeServiceGateRequirement,
  TeoyubeServiceGateReview,
  TeoyubeServiceGateRisk,
  TeoyubeServiceGateStatus,
  TeoyubeServiceGateWarning
} from "./service-gate-review-contracts";

function requirement(id: string, label: string, details: string): TeoyubeServiceGateRequirement {
  return { id, label, requiredBeforeFutureImplementation: true, complete: false, details };
}

function risk(kind: TeoyubeServiceGateKind, id: string, severity: TeoyubeServiceGateRisk["severity"], message: string, mitigation: string): TeoyubeServiceGateRisk {
  return { id, kind, severity, message, mitigation };
}

function review(
  kind: TeoyubeServiceGateKind,
  status: TeoyubeServiceGateStatus,
  decision: TeoyubeServiceGateDecision,
  whyNotEnabledYet: string,
  currentStepProhibition: string[],
  betaImpact = "No beta flow may require this service during Phase 5.1."
): TeoyubeServiceGateReview {
  return {
    kind,
    status,
    decision,
    currentStatus: status === "plan_only" ? "Plan-only and disconnected." : "Disabled and disconnected.",
    whyNotEnabledYet,
    futureImplementationRequirements: [
      "Owner approval is recorded.",
      "Privacy and consent review is complete.",
      "Security, secrets, abuse, and rollback review is complete.",
      "Cost and support load are accepted.",
      "Scripture anchors, explanation paths, confidence labels, and fallback safety remain intact."
    ],
    privacyReviewRequirements: [
      "Define consent copy and retention boundaries.",
      "Avoid raw sensitive prayer, calling, feedback, or personalization text unless future approval exists.",
      "Define deletion/export and redaction expectations."
    ],
    securityReviewRequirements: [
      "Define access control and least privilege.",
      "Protect secrets and provider tokens.",
      "Document rollback and abuse response."
    ],
    costReviewRequirements: [
      "Estimate provider pricing and rate limits.",
      "Define owner budget and failure behavior.",
      "Avoid cost-triggering calls during Phase 5.1."
    ],
    ownerApprovalRequirements: [
      "Owner accepts product need and operational burden.",
      "Owner accepts privacy/security/cost review.",
      "Owner accepts rollback plan before implementation."
    ],
    rollbackRequirements: [
      "Feature can be disabled without breaking safe render.",
      "Prior reviewed content state can be restored.",
      "Failure mode returns to read-only/in-memory fallback."
    ],
    dataProtectionRequirements: [
      "Minimize collected data.",
      "Sanitize and redact sensitive feedback before review.",
      "Do not log secrets or private spiritual content."
    ],
    betaImpact,
    currentStepProhibition,
    serviceConnected: false,
    futurePhaseOnly: true,
    requirements: [
      requirement("owner_review", "Owner approval", "Owner approval remains required before any future implementation."),
      requirement("privacy_review", "Privacy review", "Consent, retention, deletion/export, and sensitive-data boundaries remain required."),
      requirement("security_review", "Security review", "Access control, secrets, abuse controls, and rollback review remain required."),
      requirement("cost_review", "Cost review", "Provider pricing, limits, and owner budget remain required."),
      requirement("manual_qa_review", "Manual QA review", "Manual beta QA must prove safe fallbacks before any future service connection.")
    ],
    risks: [
      risk(kind, `${kind}_privacy_scope`, "medium", "Future service could expand data collection scope.", "Keep this gate disabled or plan-only until privacy review is complete."),
      risk(kind, `${kind}_beta_stability`, "medium", "Future service could introduce beta instability.", "Require rollback and no-service fallback before implementation.")
    ]
  };
}

export function reviewDatabasePersistenceGate(): TeoyubeServiceGateReview {
  return review("database_persistence", "disabled", "remain_disabled", "Persistence would introduce retention, deletion, consent, and sensitive-data obligations before beta QA is executed.", ["Do not connect a database.", "Do not add migrations.", "Do not persist sensitive user input."]);
}

export function reviewAdminAuthGate(): TeoyubeServiceGateReview {
  return review("admin_auth", "disabled", "remain_disabled", "Admin auth is unnecessary while the admin workflow remains a route-less prototype.", ["Do not add admin authentication.", "Do not add auth providers.", "Do not expose admin routes."]);
}

export function reviewAdminCmsGate(): TeoyubeServiceGateReview {
  return review("admin_cms", "disabled", "remain_disabled", "A production CMS requires reviewed content workflow, auth, audit log, rollback, and owner process that are not part of Phase 5.1.", ["Do not connect CMS.", "Do not create write APIs.", "Do not publish reviewed content automatically."]);
}

export function reviewFeedbackStorageGate(): TeoyubeServiceGateReview {
  return review("feedback_storage", "disabled", "remain_disabled", "Feedback storage is deferred until consent, redaction, retention, and support workflow are approved.", ["Do not store feedback.", "Do not collect feedback automatically.", "Do not contact beta users from code."]);
}

export function reviewAnalyticsGate(): TeoyubeServiceGateReview {
  return review("external_analytics", "disabled", "remain_disabled", "Analytics is deferred until consent, payload minimization, and spiritual-content tracking boundaries are approved.", ["Do not add analytics scripts.", "Do not send analytics events.", "Do not track prayer, calling, or spiritual content."]);
}

export function reviewMonitoringGate(): TeoyubeServiceGateReview {
  return review("production_monitoring", "plan_only", "plan_only", "Production monitoring remains useful but disconnected until provider, privacy, log-scrubbing, and cost reviews complete.", ["Do not connect monitoring providers.", "Do not send logs externally.", "Do not collect sensitive content."], "Manual beta QA may use local/manual observation only.");
}

export function reviewLiveAiGate(): TeoyubeServiceGateReview {
  return review("live_ai_orchestration", "disabled", "remain_disabled", "Live AI requires grounding, safety, fallback, cost, and privacy maturity beyond Phase 5.1.", ["Do not connect live AI.", "Do not call model APIs.", "Do not bypass TIG grounding, Scripture anchors, explanation paths, fallback, or confidence labels."]);
}

export function reviewEmailNotificationGate(): TeoyubeServiceGateReview {
  return review("email_notifications", "disabled", "remain_disabled", "Email and notifications require owner-approved communication workflow and consent boundaries.", ["Do not send email.", "Do not send notifications.", "Do not contact users from code."]);
}

function reviewFileStorageGate(): TeoyubeServiceGateReview {
  return review("file_storage", "disabled", "defer_to_future_phase", "File storage is not required for Phase 5.1 and could introduce sensitive upload retention risk.", ["Do not add file upload storage.", "Do not store screenshots or attachments automatically."]);
}

function reviewSearchIndexGate(): TeoyubeServiceGateReview {
  return review("search_index", "disabled", "defer_to_future_phase", "Search indexing is not required for controlled beta preparation.", ["Do not add search providers.", "Do not index feedback or spiritual content externally."]);
}

function reviewUserAccountsGate(): TeoyubeServiceGateReview {
  return review("user_accounts", "disabled", "remain_disabled", "User accounts are deferred until consent, deletion/export, auth, and privacy strategy exist.", ["Do not add user accounts.", "Do not create hidden personalization.", "Do not create account-based storage."]);
}

export function createServiceGateReview(): TeoyubeServiceGateReview[] {
  return [
    reviewDatabasePersistenceGate(),
    reviewAdminAuthGate(),
    reviewAdminCmsGate(),
    reviewFeedbackStorageGate(),
    reviewAnalyticsGate(),
    reviewMonitoringGate(),
    reviewLiveAiGate(),
    reviewEmailNotificationGate(),
    reviewFileStorageGate(),
    reviewSearchIndexGate(),
    reviewUserAccountsGate()
  ];
}

function getServiceGateBlockers(reviews: TeoyubeServiceGateReview[]): TeoyubeServiceGateBlocker[] {
  return reviews
    .filter((entry) => entry.serviceConnected || entry.status === "blocked")
    .map((entry) => ({
      id: `${entry.kind}_gate_blocker`,
      kind: entry.kind,
      message: `${entry.kind} is not safely disabled or plan-only.`,
      requiredAction: "Keep the service disconnected and future-phase-only before Phase 5.2."
    }));
}

function getServiceGateWarnings(reviews: TeoyubeServiceGateReview[]): TeoyubeServiceGateWarning[] {
  return reviews.flatMap((entry) =>
    entry.requirements
      .filter((requirementEntry) => requirementEntry.requiredBeforeFutureImplementation && !requirementEntry.complete)
      .map((requirementEntry) => ({
        id: `${entry.kind}_${requirementEntry.id}`,
        kind: entry.kind,
        message: `${entry.kind} remains gated; ${requirementEntry.label.toLowerCase()} is required before future implementation.`,
        recommendedAction: requirementEntry.details
      }))
  );
}

export function createServiceGateDecision(reviews: TeoyubeServiceGateReview[] = createServiceGateReview()): TeoyubeServiceGateDecision {
  const blockers = getServiceGateBlockers(reviews);
  if (blockers.length) return "blocked";
  return reviews.some((entry) => entry.decision === "plan_only") ? "plan_only" : "remain_disabled";
}

export function createServiceGateReviewReport(reviews: TeoyubeServiceGateReview[] = createServiceGateReview()): TeoyubeServiceGateReport {
  const blockers = getServiceGateBlockers(reviews);
  const warnings = getServiceGateWarnings(reviews);
  return {
    valid: blockers.length === 0,
    decision: createServiceGateDecision(reviews),
    reviews,
    blockers,
    warnings,
    serviceConnectedCount: reviews.filter((entry) => entry.serviceConnected).length,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
