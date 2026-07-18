export type TeoyubePublicPrivacyCopyStatus = "draft" | "ready_for_review" | "needs_review" | "approved_by_owner" | "approved_by_legal" | "blocked" | "unknown";

export type TeoyubePublicTermsCopyStatus = "draft" | "ready_for_review" | "needs_review" | "approved_by_owner" | "approved_by_legal" | "blocked" | "unknown";

export type TeoyubePublicConsentCopyStatus = "draft" | "ready_for_review" | "needs_review" | "approved_by_owner" | "blocked" | "unknown";

export type TeoyubePublicNoticeType =
  | "privacy_notice"
  | "terms_of_use"
  | "consent_notice"
  | "personalization_notice"
  | "feedback_notice"
  | "ai_notice"
  | "scripture_explanation_notice"
  | "sensitive_information_warning"
  | "public_launch_limitation_notice"
  | "unknown";

export type TeoyubePublicConsentSurface =
  | "onboarding"
  | "personalization_preview"
  | "consent_controls"
  | "feedback_controls"
  | "privacy_terms_surface"
  | "ai_companion"
  | "tig_response_panel"
  | "unknown";

export type TeoyubePublicCopyReviewStatus =
  | "draft"
  | "ready_for_owner_review"
  | "ready_for_legal_review"
  | "owner_accepted"
  | "legal_accepted"
  | "blocked"
  | "needs_revision"
  | "unknown";

export type TeoyubePublicQaStatus =
  | "pass"
  | "warning"
  | "fail"
  | "blocked"
  | "needs_review"
  | "not_tested"
  | "unknown";

export type TeoyubePublicPrivacyReviewItem = {
  id: string;
  noticeType: TeoyubePublicNoticeType;
  label: string;
  required: boolean;
  complete: boolean;
  status: TeoyubePublicPrivacyCopyStatus;
  requiresLegalReview: boolean;
};

export type TeoyubePublicTermsReviewItem = {
  id: string;
  noticeType: TeoyubePublicNoticeType;
  label: string;
  required: boolean;
  complete: boolean;
  status: TeoyubePublicTermsCopyStatus;
  requiresLegalReview: boolean;
};

export type TeoyubePublicConsentReviewItem = {
  id: string;
  noticeType: TeoyubePublicNoticeType;
  surface: TeoyubePublicConsentSurface;
  label: string;
  required: boolean;
  complete: boolean;
  status: TeoyubePublicConsentCopyStatus;
};

export type TeoyubePublicLegalReviewRequirement = {
  id: string;
  label: string;
  noticeType: TeoyubePublicNoticeType;
  requiredBeforePublicLaunch: boolean;
  satisfied: boolean;
  legalFinalApprovalClaimed: boolean;
};

export type TeoyubePublicCopyReviewReport = {
  valid: boolean;
  ready: boolean;
  status: TeoyubePublicCopyReviewStatus;
  privacyItems: TeoyubePublicPrivacyReviewItem[];
  termsItems: TeoyubePublicTermsReviewItem[];
  consentItems: TeoyubePublicConsentReviewItem[];
  legalReviewRequirements: TeoyubePublicLegalReviewRequirement[];
  blockers: Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
  warnings: Array<{ id: string; label: string; message: string; recommendedAction: string; riskLevel: "low" | "medium" | "high" }>;
  draftOnly: true;
  notLegalAdvice: true;
  noLegalFinalApprovalClaimed: boolean;
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubePublicQaChecklistItem = {
  id: string;
  label: string;
  status: TeoyubePublicQaStatus;
  required: boolean;
  launchCritical: boolean;
  details: string;
};

export type TeoyubePublicQaReport = {
  valid: boolean;
  ready: boolean;
  status: TeoyubePublicQaStatus;
  checklist: TeoyubePublicQaChecklistItem[];
  blockers: Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
  warnings: Array<{ id: string; label: string; message: string; recommendedAction: string; riskLevel: "low" | "medium" | "high" }>;
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noExternalWrite: true;
  generatedAt: string;
};
