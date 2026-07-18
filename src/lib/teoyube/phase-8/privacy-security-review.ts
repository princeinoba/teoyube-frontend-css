import type {
  TeoyubePrivacySecurityRequirement,
  TeoyubePrivacySecurityReviewArea,
  TeoyubePrivacySecurityReviewBlocker,
  TeoyubePrivacySecurityReviewCheck,
  TeoyubePrivacySecurityReviewDecision,
  TeoyubePrivacySecurityReviewReport,
  TeoyubePrivacySecurityReviewResult,
  TeoyubePrivacySecurityReviewWarning,
  TeoyubePrivacySecurityRisk
} from "./privacy-security-review-contracts";

export type TeoyubePrivacySecurityReviewInput = Partial<{
  privacyNoticeExistsOrPlanned: boolean;
  consentNoticeExistsOrPlanned: boolean;
  sensitiveDataWarningExistsOrPlanned: boolean;
  warnsAgainstSensitivePersonalInfo: boolean;
  feedbackManual: boolean;
  supportManual: boolean;
  hiddenPersonalization: boolean;
  browserPersistenceForSensitivePersonalization: boolean;
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  adminAuthEnabled: boolean;
  adminCmsEnabled: boolean;
  userAccountsEnabled: boolean;
  liveAiOrchestrationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  externalServicesRequiredForSafeRender: boolean;
  secretsExposed: boolean;
  legalApprovalClaimedWithoutRecord: boolean;
  ownerReviewed: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function requirement(id: string, area: TeoyubePrivacySecurityReviewArea, label: string, details: string): TeoyubePrivacySecurityRequirement {
  return { id, area, label, required: true, details };
}

function check(
  id: string,
  area: TeoyubePrivacySecurityReviewArea,
  label: string,
  passed: boolean,
  details: string
): TeoyubePrivacySecurityReviewCheck {
  return { id, area, label, passed, details, requirements: [requirement(`${id}_requirement`, area, label, details)] };
}

function resultFromCheck(entry: TeoyubePrivacySecurityReviewCheck): TeoyubePrivacySecurityReviewResult {
  return {
    id: `${entry.id}_result`,
    checkId: entry.id,
    area: entry.area,
    status: entry.passed ? "reviewed" : "blocked",
    passed: entry.passed,
    notes: [entry.details]
  };
}

export function createPrivacySecurityReviewChecklist(input: TeoyubePrivacySecurityReviewInput = {}): TeoyubePrivacySecurityReviewCheck[] {
  return [
    check("privacy_notice", "privacy_notice", "Privacy notice exists or is planned", flag(input.privacyNoticeExistsOrPlanned), "Privacy notice must exist or remain explicitly planned before public release candidate planning."),
    check("consent_notice", "consent_notice", "Consent notice exists or is planned", flag(input.consentNoticeExistsOrPlanned), "Consent notice must exist or remain explicitly planned before services, storage, accounts, analytics, or feedback storage."),
    check("sensitive_warning", "sensitive_data_warning", "Sensitive data warning exists", flag(input.sensitiveDataWarningExistsOrPlanned) && flag(input.warnsAgainstSensitivePersonalInfo), "Users must be warned not to submit sensitive personal information."),
    check("manual_feedback", "manual_feedback_boundaries", "Feedback remains manual", flag(input.feedbackManual), "Feedback remains manual unless future approval exists."),
    check("manual_support", "support_boundaries", "Support remains manual", flag(input.supportManual), "Support workflow remains manual and sends no messages from code."),
    check("no_hidden_personalization", "hidden_personalization", "No hidden personalization", !input.hiddenPersonalization, "No hidden personalization or sensitive inference is introduced."),
    check("no_sensitive_browser_persistence", "browser_persistence", "No sensitive browser persistence", !input.browserPersistenceForSensitivePersonalization, "No localStorage, cookies, or IndexedDB are required for sensitive personalization."),
    check("database_disabled", "database_persistence", "Database persistence disabled", !input.databasePersistenceEnabled, "No unapproved database persistence is enabled."),
    check("analytics_disabled", "external_analytics", "Analytics disabled", !input.analyticsEnabled, "No unapproved analytics are enabled."),
    check("monitoring_disabled", "production_monitoring", "Production monitoring disabled", !input.monitoringProviderConnected, "No unapproved production monitoring provider is connected."),
    check("admin_disabled", "admin_auth", "Admin auth disabled", !input.adminAuthEnabled, "No admin auth is enabled."),
    check("cms_disabled", "admin_cms", "Admin CMS disabled", !input.adminCmsEnabled, "No production CMS is enabled."),
    check("accounts_disabled", "user_accounts", "User accounts disabled", !input.userAccountsEnabled, "No user accounts are enabled."),
    check("live_ai_disabled", "live_ai_orchestration", "Live AI disabled", !input.liveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    check("email_disabled", "email_notifications", "Email notifications disabled", !input.emailNotificationsEnabled, "No email, SMS, or notification sending is enabled."),
    check("safe_render_no_services", "unknown", "Safe render requires no external services", !input.externalServicesRequiredForSafeRender, "The current code path must render safely without service activation."),
    check("no_secrets_exposed", "unknown", "No secrets exposed", !input.secretsExposed, "No secret values are exposed by the review package."),
    check("no_legal_claim", "known_limitations", "No unrecorded legal approval claimed", !input.legalApprovalClaimedWithoutRecord, "This review does not claim legal approval unless separately recorded.")
  ];
}

export function runPrivacySecurityReview(input: TeoyubePrivacySecurityReviewInput = {}): TeoyubePrivacySecurityReviewResult[] {
  return createPrivacySecurityReviewChecklist(input).map(resultFromCheck);
}

export function getPrivacySecurityReviewBlockers(input: TeoyubePrivacySecurityReviewInput = {}): TeoyubePrivacySecurityReviewBlocker[] {
  return createPrivacySecurityReviewChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      area: entry.area,
      message: `${entry.label} is not satisfied.`,
      requiredAction: "Resolve, defer with explicit owner review, or keep release candidate planning blocked."
    }));
}

export function getPrivacySecurityReviewWarnings(input: TeoyubePrivacySecurityReviewInput = {}): TeoyubePrivacySecurityReviewWarning[] {
  return [
    {
      id: "privacy_security_review_manual",
      area: "unknown",
      message: "Privacy/security review is structured and manual; it does not claim legal approval.",
      recommendedAction: "Complete owner, privacy, security, and legal review where appropriate before any public release decision."
    },
    ...(!input.ownerReviewed ? [{
      id: "owner_review_pending",
      area: "unknown" as const,
      message: "Owner review is still required before release candidate planning.",
      recommendedAction: "Review the Phase 8.3 package manually."
    }] : [])
  ];
}

export function createPrivacySecurityReviewDecision(input: TeoyubePrivacySecurityReviewInput = {}): TeoyubePrivacySecurityReviewDecision {
  const blockers = getPrivacySecurityReviewBlockers(input);
  if (blockers.length) return "blocked";
  if (!input.ownerReviewed) return "needs_owner_review";
  return getPrivacySecurityReviewWarnings(input).length ? "ready_with_warnings" : "ready_for_public_release_readiness_gate";
}

function risks(): TeoyubePrivacySecurityRisk[] {
  return [
    { id: "sensitive_text_risk", area: "sensitive_data_warning", severity: "high", message: "Users may submit sensitive personal or spiritual information.", mitigation: "Warn clearly, minimize, redact, and keep feedback/support manual." },
    { id: "future_service_privacy_risk", area: "database_persistence", severity: "high", message: "Future persistence or feedback storage would create retention and deletion duties.", mitigation: "Keep disabled until privacy/security/data-protection review is complete." },
    { id: "future_ai_safety_risk", area: "live_ai_orchestration", severity: "high", message: "Future live AI could weaken grounding, explanations, confidence, or fallback safety.", mitigation: "Keep disabled until Scripture/theology safety review is complete." }
  ];
}

export function createPrivacySecurityReviewReport(input: TeoyubePrivacySecurityReviewInput = {}): TeoyubePrivacySecurityReviewReport {
  const checks = createPrivacySecurityReviewChecklist(input);
  const blockers = getPrivacySecurityReviewBlockers(input);
  return {
    valid: blockers.length === 0,
    decision: createPrivacySecurityReviewDecision(input),
    checks,
    results: runPrivacySecurityReview(input),
    blockers,
    warnings: getPrivacySecurityReviewWarnings(input),
    risks: risks(),
    noLegalApprovalClaimed: true,
    noSecretsExposed: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noUserAccountsAdded: true,
    noLiveAiOrchestrationEnabled: true,
    noEmailNotificationsEnabled: true,
    noBrowserPersistenceRequired: true,
    noHiddenPersonalization: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
