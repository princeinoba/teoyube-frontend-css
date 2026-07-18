export type TeoyubePublicTrustReviewStatus =
  | "not_started"
  | "reviewing"
  | "trusted_for_limited_release"
  | "trusted_with_conditions"
  | "needs_revision"
  | "blocked"
  | "unknown";

export type TeoyubePublicTrustReviewArea =
  | "spiritual_guidance_boundary"
  | "known_limitations"
  | "privacy_notice"
  | "consent_notice"
  | "feedback_expectations"
  | "support_expectations"
  | "confidence_labels"
  | "explanation_trace"
  | "scripture_anchor"
  | "fallback"
  | "service_disabled_state"
  | "content_clarity"
  | "user_confusion_risk"
  | "unknown";

export type TeoyubePublicTrustReviewDecision =
  | "public_trust_ready"
  | "public_trust_ready_with_conditions"
  | "revise_before_expansion"
  | "block_expansion"
  | "unknown";

export type TeoyubePublicTrustReviewCheck = {
  id: string;
  area: TeoyubePublicTrustReviewArea;
  label: string;
  passed: boolean;
  critical: boolean;
  details: string;
};

export type TeoyubePublicTrustReviewRecord = {
  id: string;
  status: TeoyubePublicTrustReviewStatus;
  checks: TeoyubePublicTrustReviewCheck[];
  releaseOwner: string;
  conditions: string[];
  notes: string[];
  reviewedAt: string;
};

export type TeoyubePublicTrustReviewBlocker = {
  id: string;
  area: TeoyubePublicTrustReviewArea;
  message: string;
};

export type TeoyubePublicTrustReviewWarning = {
  id: string;
  area: TeoyubePublicTrustReviewArea;
  message: string;
};

export type TeoyubePublicTrustReviewReport = {
  valid: boolean;
  decision: TeoyubePublicTrustReviewDecision;
  record: TeoyubePublicTrustReviewRecord;
  blockers: TeoyubePublicTrustReviewBlocker[];
  warnings: TeoyubePublicTrustReviewWarning[];
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
