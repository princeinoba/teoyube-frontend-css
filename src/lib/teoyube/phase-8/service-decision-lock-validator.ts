export type TeoyubeServiceDecisionLockInput = Partial<{
  reassessmentEnabledServices: boolean;
  allDecisionsExplicit: boolean;
  serviceRequiredForSafeRender: boolean;
  hiddenServiceDependencyIntroduced: boolean;
  futureEligibilityTreatedAsActivation: boolean;
  ownerReviewRequired: boolean;
  privacyReviewRequired: boolean;
  securityReviewRequired: boolean;
  costReviewRequired: boolean;
  databaseEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringEnabled: boolean;
  adminAuthEnabled: boolean;
  cmsEnabled: boolean;
  feedbackStorageEnabled: boolean;
  userAccountsEnabled: boolean;
  liveAiEnabled: boolean;
  emailEnabled: boolean;
}>;

export type TeoyubeServiceDecisionLockValidationReport = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  noServicesEnabled: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function validateDatabaseDecisionLock(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.databaseEnabled;
}

export function validateAnalyticsDecisionLock(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.analyticsEnabled;
}

export function validateMonitoringDecisionLock(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.monitoringEnabled;
}

export function validateAdminAuthDecisionLock(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.adminAuthEnabled;
}

export function validateCmsDecisionLock(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.cmsEnabled;
}

export function validateFeedbackStorageDecisionLock(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.feedbackStorageEnabled;
}

export function validateUserAccountsDecisionLock(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.userAccountsEnabled;
}

export function validateLiveAiDecisionLock(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.liveAiEnabled;
}

export function validateEmailDecisionLock(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.emailEnabled;
}

export function validateServiceDecisionLocks(input: TeoyubeServiceDecisionLockInput = {}): boolean {
  return !input.reassessmentEnabledServices &&
    flag(input.allDecisionsExplicit) &&
    !input.serviceRequiredForSafeRender &&
    !input.hiddenServiceDependencyIntroduced &&
    !input.futureEligibilityTreatedAsActivation &&
    flag(input.ownerReviewRequired) &&
    flag(input.privacyReviewRequired) &&
    flag(input.securityReviewRequired) &&
    flag(input.costReviewRequired) &&
    validateDatabaseDecisionLock(input) &&
    validateAnalyticsDecisionLock(input) &&
    validateMonitoringDecisionLock(input) &&
    validateAdminAuthDecisionLock(input) &&
    validateCmsDecisionLock(input) &&
    validateFeedbackStorageDecisionLock(input) &&
    validateUserAccountsDecisionLock(input) &&
    validateLiveAiDecisionLock(input) &&
    validateEmailDecisionLock(input);
}

export function createServiceDecisionLockValidationReport(input: TeoyubeServiceDecisionLockInput = {}): TeoyubeServiceDecisionLockValidationReport {
  const checks = [
    { id: "reassessment_did_not_enable_services", passed: !input.reassessmentEnabledServices, details: "Reassessment did not enable services." },
    { id: "all_decisions_explicit", passed: flag(input.allDecisionsExplicit), details: "All service decisions are explicit." },
    { id: "no_service_required_for_safe_render", passed: !input.serviceRequiredForSafeRender, details: "No service is required for safe render." },
    { id: "no_hidden_service_dependency", passed: !input.hiddenServiceDependencyIntroduced, details: "No hidden service dependency was introduced." },
    { id: "future_eligibility_not_activation", passed: !input.futureEligibilityTreatedAsActivation, details: "Future eligibility does not mean current activation." },
    { id: "owner_privacy_security_cost_required", passed: flag(input.ownerReviewRequired) && flag(input.privacyReviewRequired) && flag(input.securityReviewRequired) && flag(input.costReviewRequired), details: "Owner, privacy, security, and cost review remain required." },
    { id: "database_lock", passed: validateDatabaseDecisionLock(input), details: "Database persistence remains disabled." },
    { id: "analytics_lock", passed: validateAnalyticsDecisionLock(input), details: "Analytics remain disabled." },
    { id: "monitoring_lock", passed: validateMonitoringDecisionLock(input), details: "Monitoring provider remains disabled/plan-only." },
    { id: "admin_auth_lock", passed: validateAdminAuthDecisionLock(input), details: "Admin auth remains disabled." },
    { id: "cms_lock", passed: validateCmsDecisionLock(input), details: "CMS remains disabled." },
    { id: "feedback_storage_lock", passed: validateFeedbackStorageDecisionLock(input), details: "Feedback storage remains disabled." },
    { id: "user_accounts_lock", passed: validateUserAccountsDecisionLock(input), details: "User accounts remain disabled." },
    { id: "live_ai_lock", passed: validateLiveAiDecisionLock(input), details: "Live AI remains disabled." },
    { id: "email_lock", passed: validateEmailDecisionLock(input), details: "Email/SMS/notifications remain disabled." }
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0 && validateServiceDecisionLocks(input),
    checks,
    blockers,
    warnings: ["Service decision locks are planning-only and do not connect services."],
    noServicesEnabled: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
