export type TeoyubeControlledReleaseExpansionStatus =
  | "not_started"
  | "reviewing"
  | "approved"
  | "approved_with_conditions"
  | "remain_limited"
  | "pause_promotion"
  | "rollback_required"
  | "blocked"
  | "unknown";

export type TeoyubeControlledReleaseExpansionLevel =
  | "remain_internal"
  | "remain_limited_public"
  | "expand_to_small_public_group"
  | "expand_to_wider_public_group"
  | "pause_expansion"
  | "rollback_required"
  | "unknown";

export type TeoyubeControlledReleaseExpansionArea =
  | "app_stability"
  | "route_stability"
  | "manual_feedback"
  | "issue_patterns"
  | "known_issues"
  | "safe_fixes"
  | "content_safety"
  | "rollback_readiness"
  | "owner_approval"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "unknown";

export type TeoyubeControlledReleaseExpansionDecision =
  | "approved_for_limited_expansion"
  | "approved_with_conditions"
  | "remain_limited"
  | "pause_promotion"
  | "rollback_required"
  | "blocked"
  | "unknown";

export type TeoyubeControlledReleaseExpansionCheck = {
  id: string;
  area: TeoyubeControlledReleaseExpansionArea;
  label: string;
  passed: boolean;
  critical: boolean;
  details: string;
};

export type TeoyubeControlledReleaseExpansionRecord = {
  id: string;
  status: TeoyubeControlledReleaseExpansionStatus;
  selectedExpansionLevel: TeoyubeControlledReleaseExpansionLevel;
  conditions: string[];
  checks: TeoyubeControlledReleaseExpansionCheck[];
  releaseOwner: string;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubeControlledReleaseExpansionBlocker = {
  id: string;
  area: TeoyubeControlledReleaseExpansionArea;
  message: string;
};

export type TeoyubeControlledReleaseExpansionWarning = {
  id: string;
  area: TeoyubeControlledReleaseExpansionArea;
  message: string;
};

export type TeoyubeControlledReleaseExpansionReport = {
  valid: boolean;
  decision: TeoyubeControlledReleaseExpansionDecision;
  record: TeoyubeControlledReleaseExpansionRecord;
  blockers: TeoyubeControlledReleaseExpansionBlocker[];
  warnings: TeoyubeControlledReleaseExpansionWarning[];
  noAutomaticPublicExpansion: true;
  noAutomaticDeployment: true;
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
