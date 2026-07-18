export type TeoyubePrivacySecurityFollowUpChecklistItem = {
  id: string;
  area: "privacy" | "security" | "sensitive_data" | "consent" | "future_service";
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubePrivacySecurityFollowUpReport = {
  valid: boolean;
  checklist: TeoyubePrivacySecurityFollowUpChecklistItem[];
  blockers: string[];
  warnings: string[];
  noLegalApprovalClaimed: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noHiddenPersonalization: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePrivacySecurityFollowUpInput = Partial<{
  includeFutureServiceRequirements: boolean;
}>;

function item(id: string, area: TeoyubePrivacySecurityFollowUpChecklistItem["area"], label: string, details: string): TeoyubePrivacySecurityFollowUpChecklistItem {
  return { id, area, label, required: true, details };
}

export function getPrivacyFollowUpChecklist(): TeoyubePrivacySecurityFollowUpChecklistItem[] {
  return [
    item("privacy_notice_review", "privacy", "Privacy notice review", "Review privacy notices for future Phase 8 service or release planning."),
    item("manual_feedback_privacy_rules", "privacy", "Manual feedback privacy rules", "Continue redaction, minimization, no automatic storage, and no raw sensitive text retention."),
    item("no_hidden_personalization", "privacy", "No hidden personalization", "Keep personalization explicit, consent-aware, and non-persistent unless future review approves otherwise.")
  ];
}

export function getSecurityFollowUpChecklist(): TeoyubePrivacySecurityFollowUpChecklistItem[] {
  return [
    item("service_security_review", "security", "Future service security review", "Review auth, authorization, secrets, logs, abuse cases, and rollback before any service connection."),
    item("admin_boundary_review", "security", "Admin boundary review", "Admin auth and CMS remain disabled until security and owner review."),
    item("debug_payload_review", "security", "Debug payload review", "Normal user surfaces must not expose debug-only payloads.")
  ];
}

export function getSensitiveDataBoundaryChecklist(): TeoyubePrivacySecurityFollowUpChecklistItem[] {
  return [
    item("sensitive_data_warning_review", "sensitive_data", "Sensitive data warning review", "Review support/feedback copy for sensitive personal and spiritual information warnings."),
    item("retention_deletion_review", "sensitive_data", "Retention/deletion review", "Future persistence must define retention, deletion, export, and minimization boundaries.")
  ];
}

export function getConsentReviewChecklist(): TeoyubePrivacySecurityFollowUpChecklistItem[] {
  return [
    item("consent_copy_review", "consent", "Consent copy review", "Review consent copy before any future service, storage, analytics, or user account flow."),
    item("owner_legal_review_needed", "consent", "Owner/legal review needed where appropriate", "Do not claim legal approval; identify where owner/legal review may be needed.")
  ];
}

export function getFutureServicePrivacyRequirements(): TeoyubePrivacySecurityFollowUpChecklistItem[] {
  return [
    item("future_service_privacy_requirements", "future_service", "Future service privacy requirements", "Require privacy review for persistence, analytics, monitoring, auth, CMS, accounts, feedback storage, notifications, and live AI.")
  ];
}

export function getFutureServiceSecurityRequirements(): TeoyubePrivacySecurityFollowUpChecklistItem[] {
  return [
    item("future_service_security_requirements", "future_service", "Future service security requirements", "Require security review, rollback, access controls, secrets handling, and auditability before future service implementation.")
  ];
}

export function createPrivacySecurityFollowUpPlan(input: TeoyubePrivacySecurityFollowUpInput = {}): TeoyubePrivacySecurityFollowUpChecklistItem[] {
  const includeFutureServiceRequirements = input.includeFutureServiceRequirements ?? true;
  return [
    ...getPrivacyFollowUpChecklist(),
    ...getSecurityFollowUpChecklist(),
    ...getSensitiveDataBoundaryChecklist(),
    ...getConsentReviewChecklist(),
    ...(includeFutureServiceRequirements ? getFutureServicePrivacyRequirements() : []),
    ...(includeFutureServiceRequirements ? getFutureServiceSecurityRequirements() : [])
  ];
}

export function createPrivacySecurityFollowUpReport(input: TeoyubePrivacySecurityFollowUpInput = {}): TeoyubePrivacySecurityFollowUpReport {
  const checklist = createPrivacySecurityFollowUpPlan(input);
  return {
    valid: checklist.length > 0,
    checklist,
    blockers: checklist.length ? [] : ["Privacy/security follow-up checklist is empty."],
    warnings: ["This is planning support only and does not make legal approval claims."],
    noLegalApprovalClaimed: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noHiddenPersonalization: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
