import type {
  TeoyubeLockedServiceKind,
  TeoyubeLockedServiceRequirement,
  TeoyubeLockedServiceReview,
  TeoyubeLockedServiceRisk,
  TeoyubeServiceDecisionLockBlocker,
  TeoyubeServiceDecisionLockDecision,
  TeoyubeServiceDecisionLockReport,
  TeoyubeServiceDecisionLockStatus,
  TeoyubeServiceDecisionLockWarning
} from "./service-decision-lock-contracts";

function requirement(id: string, label: string, details: string): TeoyubeLockedServiceRequirement {
  return { id, label, requiredBeforeFutureImplementation: true, complete: false, details };
}

function risk(id: string, severity: TeoyubeLockedServiceRisk["severity"], message: string, mitigation: string): TeoyubeLockedServiceRisk {
  return { id, severity, message, mitigation };
}

function lock(
  kind: TeoyubeLockedServiceKind,
  status: TeoyubeServiceDecisionLockStatus,
  whyDisabled: string,
  mustNotHappenInCurrentCode: string[]
): TeoyubeLockedServiceReview {
  return {
    kind,
    status,
    whyDisabled,
    futurePhaseOnly: true,
    serviceConnected: false,
    requiredOwnerReview: true,
    requiredPrivacyReview: true,
    requiredSecurityReview: true,
    requiredCostReview: true,
    rollbackRequirements: [
      "Provider can be disabled without blocking Scripture-anchored fallback.",
      "Content can return to prior reviewed state.",
      "Failure mode returns safe in-memory or read-only behavior."
    ],
    dataProtectionRequirements: [
      "Minimize data collection.",
      "Avoid raw sensitive prayer, calling, personalization, or feedback text unless future consent and privacy review approve it.",
      "Do not put secrets or private text into logs.",
      "Keep content review data separate from private user records."
    ],
    mustNotHappenInCurrentCode,
    requirements: [
      requirement("owner_review", "Owner review", "Owner must explicitly approve this service in a future phase."),
      requirement("privacy_review", "Privacy review", "Review consent, retention, deletion, export, and sensitive data boundaries."),
      requirement("security_review", "Security review", "Review access control, secrets, abuse controls, and rollback."),
      requirement("cost_review", "Cost review", "Review provider pricing, limits, alerting, and owner budget."),
      requirement("fallback_review", "Fallback review", "Scripture anchors, explanation paths, confidence labels, and fallback safety must remain intact.")
    ],
    risks: [
      risk(`${kind}_privacy_risk`, "medium", "Future service connection may create new privacy obligations.", "Keep locked until privacy review is complete."),
      risk(`${kind}_scope_risk`, "medium", "Future service connection may expand product scope before beta readiness.", "Keep future-phase-only until owner approval.")
    ]
  };
}

export function lockDatabasePersistenceDecision(): TeoyubeLockedServiceReview {
  return lock("database_persistence", "locked_disabled", "Persistence remains disabled until data model, consent, deletion/export, security, rollback, and cost are reviewed.", ["Do not connect a database.", "Do not add migrations.", "Do not persist sensitive user input."]);
}

export function lockAdminAuthDecision(): TeoyubeLockedServiceReview {
  return lock("admin_auth", "locked_disabled", "Admin auth remains disabled until an owner-approved admin workflow requires protected access.", ["Do not add admin authentication.", "Do not add auth providers.", "Do not expose admin routes publicly."]);
}

export function lockAdminCmsDecision(): TeoyubeLockedServiceReview {
  return lock("admin_cms", "locked_disabled", "CMS remains disabled until reviewed content workflow, auth, audit log, rollback, and ownership are approved.", ["Do not connect CMS.", "Do not create write APIs.", "Do not publish drafts automatically."]);
}

export function lockFeedbackStorageDecision(): TeoyubeLockedServiceReview {
  return lock("feedback_storage", "locked_disabled", "Feedback storage remains disabled until consent, retention, sensitive-data handling, and support workflow are approved.", ["Do not store feedback.", "Do not collect feedback automatically.", "Do not contact users from code."]);
}

export function lockAnalyticsDecision(): TeoyubeLockedServiceReview {
  return lock("external_analytics", "locked_disabled", "Analytics remains disabled until consent, payload minimization, and spiritual-content boundaries are approved.", ["Do not add analytics scripts.", "Do not send analytics events.", "Do not track prayer, calling, or spiritual content."]);
}

export function lockMonitoringDecision(): TeoyubeLockedServiceReview {
  return lock("production_monitoring", "locked_plan_only", "Monitoring remains plan-only until provider, privacy, log scrubbing, and cost reviews are complete.", ["Do not connect monitoring providers.", "Do not send logs externally.", "Do not collect sensitive content."]);
}

export function lockLiveAiDecision(): TeoyubeLockedServiceReview {
  return lock("live_ai_orchestration", "locked_disabled", "Live AI remains disabled until grounding, Scripture anchors, explanation traces, fallback safety, and cost controls are mature.", ["Do not connect live AI.", "Do not call model APIs.", "Do not bypass TIG grounding or fallback."]);
}

export function lockEmailNotificationDecision(): TeoyubeLockedServiceReview {
  return lock("email_notifications", "locked_disabled", "Email and notifications remain disabled until owner-approved beta communication workflows exist.", ["Do not send email.", "Do not send notifications.", "Do not contact users automatically."]);
}

function lockUserAccountsDecision(): TeoyubeLockedServiceReview {
  return lock("user_accounts", "locked_disabled", "User accounts remain disabled until privacy, auth, deletion/export, and consent strategy are approved.", ["Do not add user accounts.", "Do not add hidden personalization.", "Do not add account-based storage."]);
}

export function createServiceDecisionLock(): TeoyubeLockedServiceReview[] {
  return [
    lockDatabasePersistenceDecision(),
    lockAdminAuthDecision(),
    lockAdminCmsDecision(),
    lockFeedbackStorageDecision(),
    lockAnalyticsDecision(),
    lockMonitoringDecision(),
    lockLiveAiDecision(),
    lockEmailNotificationDecision(),
    lockUserAccountsDecision()
  ];
}

export function getServiceDecisionLockBlockers(input: TeoyubeLockedServiceReview[] = createServiceDecisionLock()): TeoyubeServiceDecisionLockBlocker[] {
  return input
    .filter((entry) => entry.serviceConnected || entry.status === "blocked")
    .map((entry) => ({
      id: `${entry.kind}_lock_blocker`,
      kind: entry.kind,
      message: `${entry.kind} is not safely locked disabled or plan-only.`,
      requiredAction: "Keep the service disconnected and future-phase-only."
    }));
}

export function getServiceDecisionLockWarnings(input: TeoyubeLockedServiceReview[] = createServiceDecisionLock()): TeoyubeServiceDecisionLockWarning[] {
  return input.flatMap((entry) =>
    entry.requirements
      .filter((requirementEntry) => requirementEntry.requiredBeforeFutureImplementation && !requirementEntry.complete)
      .map((requirementEntry) => ({
        id: `${entry.kind}_${requirementEntry.id}`,
        kind: entry.kind,
        message: `${entry.kind} is locked; ${requirementEntry.label.toLowerCase()} remains required before future implementation.`,
        recommendedAction: requirementEntry.details
      }))
  );
}

export function createServiceDecisionLockDecision(input: TeoyubeLockedServiceReview[] = createServiceDecisionLock()): TeoyubeServiceDecisionLockDecision {
  const blockers = getServiceDecisionLockBlockers(input);
  const warnings = getServiceDecisionLockWarnings(input);
  if (blockers.length) return "blocked";
  return warnings.length ? "service_decisions_locked_with_warnings" : "service_decisions_locked";
}

export function validateServiceDecisionLock(input: TeoyubeLockedServiceReview[] = createServiceDecisionLock()): TeoyubeServiceDecisionLockReport {
  return createServiceDecisionLockReport(input);
}

export function createServiceDecisionLockReport(input: TeoyubeLockedServiceReview[] = createServiceDecisionLock()): TeoyubeServiceDecisionLockReport {
  const blockers = getServiceDecisionLockBlockers(input);
  const warnings = getServiceDecisionLockWarnings(input);
  return {
    valid: blockers.length === 0,
    decision: createServiceDecisionLockDecision(input),
    locks: input,
    blockers,
    warnings,
    serviceConnectedCount: input.filter((entry) => entry.serviceConnected).length,
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
