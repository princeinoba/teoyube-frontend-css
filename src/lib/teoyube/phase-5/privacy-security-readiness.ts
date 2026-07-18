export type TeoyubePrivacySecurityReadinessInput = {
  sensitiveInfoWarningVisible?: boolean;
  rawSensitiveTextPersisted?: boolean;
  hiddenPersonalizationExists?: boolean;
  consentPrivacyNoticesVisible?: boolean;
  databasePersistenceEnabled?: boolean;
  analyticsEnabled?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  adminAuthAdded?: boolean;
  cmsConnected?: boolean;
  feedbackStorageEnabled?: boolean;
  secretsExposed?: boolean;
  externalServicesRequired?: boolean;
};

export type TeoyubePrivacySecurityReadinessCheck = {
  id: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubePrivacySecurityReadinessDecision =
  | "privacy_security_ready_for_manual_beta_qa"
  | "ready_with_warnings"
  | "blocked";

export type TeoyubePrivacySecurityReadinessReport = {
  valid: boolean;
  decision: TeoyubePrivacySecurityReadinessDecision;
  checks: TeoyubePrivacySecurityReadinessCheck[];
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, label: string, passed: boolean, details: string): TeoyubePrivacySecurityReadinessCheck {
  return { id, label, passed, details };
}

export function createPrivacySecurityReadinessChecklist(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessCheck[] {
  return [
    validateBetaPrivacyReadiness(input),
    validateBetaSecurityReadiness(input),
    validateSensitiveDataBoundaries(input),
    validateNoHiddenPersonalization(input),
    validateNoUnapprovedPersistence(input),
    validateNoUnapprovedAnalytics(input),
    validateNoLiveAiOrchestration(input),
    check("admin_auth_cms_disabled", "Admin auth and CMS remain disabled", !input.adminAuthAdded && !input.cmsConnected, "Admin auth and CMS are not part of Phase 5.1."),
    check("feedback_storage_disabled", "Feedback storage remains disabled", !input.feedbackStorageEnabled, "Feedback storage requires future approval."),
    check("no_secrets_exposed", "No secrets are exposed", !input.secretsExposed, "Secrets must not be printed, stored in docs, or sent externally."),
    check("no_external_services_required", "No external services are required for safe render", !input.externalServicesRequired, "Safe render must work without providers.")
  ];
}

export function validateBetaPrivacyReadiness(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessCheck {
  return check("privacy_notice_visible", "Privacy/consent notices are visible", input.consentPrivacyNoticesVisible !== false, "Sensitive-input surfaces must show privacy and consent boundaries.");
}

export function validateBetaSecurityReadiness(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessCheck {
  return check("security_boundaries_ready", "Security boundaries are ready for manual QA", !input.secretsExposed && !input.externalServicesRequired, "No secrets are exposed and no provider is required for Phase 5.1.");
}

export function validateSensitiveDataBoundaries(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessCheck {
  return check("sensitive_data_boundaries", "Sensitive data boundaries are explicit", input.sensitiveInfoWarningVisible !== false && !input.rawSensitiveTextPersisted, "Users are warned not to submit sensitive personal information and raw sensitive text is not persisted by default.");
}

export function validateNoHiddenPersonalization(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessCheck {
  return check("no_hidden_personalization", "No hidden personalization exists", !input.hiddenPersonalizationExists, "Personalization must remain transparent, consent-aware, and non-persistent in Phase 5.1.");
}

export function validateNoUnapprovedPersistence(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessCheck {
  return check("no_unapproved_persistence", "Unapproved database persistence remains disabled", !input.databasePersistenceEnabled, "Database persistence requires future owner/privacy/security/cost review.");
}

export function validateNoUnapprovedAnalytics(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessCheck {
  return check("no_unapproved_analytics", "Unapproved analytics remain disabled", !input.analyticsEnabled, "Analytics requires future consent and payload-minimization review.");
}

export function validateNoLiveAiOrchestration(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessCheck {
  return check("no_live_ai_orchestration", "Live AI remains disabled", !input.liveAiOrchestrationEnabled, "Live AI orchestration is not connected for Phase 5.1.");
}

export function createPrivacySecurityReadinessDecision(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessDecision {
  const checks = createPrivacySecurityReadinessChecklist(input);
  if (checks.some((entry) => !entry.passed)) return "blocked";
  return "privacy_security_ready_for_manual_beta_qa";
}

export function createPrivacySecurityReadinessReport(input: TeoyubePrivacySecurityReadinessInput = {}): TeoyubePrivacySecurityReadinessReport {
  const checks = createPrivacySecurityReadinessChecklist(input);
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.label}: ${entry.details}`);
  const warnings = [
    "Manual privacy/security owner review remains required before real beta execution.",
    "Sensitive feedback handling must remain manual, sanitized, and redacted."
  ];
  return {
    valid: blockers.length === 0,
    decision: createPrivacySecurityReadinessDecision(input),
    checks,
    blockers,
    warnings,
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
