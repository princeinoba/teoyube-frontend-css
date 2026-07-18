export type TeoyubeBetaReadinessScoreStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_improvement"
  | "blocked"
  | "unknown";

export type TeoyubeBetaReadinessScoreArea =
  | "real_data"
  | "user_journey"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "controlled_admin"
  | "disabled_services"
  | "mobile"
  | "accessibility"
  | "privacy_consent"
  | "issue_triage"
  | "unknown";

export type TeoyubeBetaReadinessScoreBand =
  | "excellent"
  | "good"
  | "needs_improvement"
  | "blocked"
  | "unknown";

export type TeoyubeBetaReadinessScoreDecision =
  | "ready_for_owner_review"
  | "ready_with_warnings"
  | "needs_phase_5_3_fix_queue"
  | "blocked"
  | "unknown";

export type TeoyubeBetaReadinessScoreInput = {
  areaOverrides?: Partial<Record<TeoyubeBetaReadinessScoreArea, number>>;
  blockerCountByArea?: Partial<Record<TeoyubeBetaReadinessScoreArea, number>>;
  warningCountByArea?: Partial<Record<TeoyubeBetaReadinessScoreArea, number>>;
  criticalBlockerPresent?: boolean;
};

export type TeoyubeBetaReadinessScoreResult = {
  area: TeoyubeBetaReadinessScoreArea;
  score: number;
  band: TeoyubeBetaReadinessScoreBand;
  status: TeoyubeBetaReadinessScoreStatus;
  blockers: string[];
  warnings: string[];
  weight: number;
};

export type TeoyubeBetaReadinessScoreBlocker = {
  id: string;
  area: TeoyubeBetaReadinessScoreArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaReadinessScoreWarning = {
  id: string;
  area: TeoyubeBetaReadinessScoreArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaReadinessScoreReport = {
  valid: boolean;
  decision: TeoyubeBetaReadinessScoreDecision;
  score: number;
  band: TeoyubeBetaReadinessScoreBand;
  status: TeoyubeBetaReadinessScoreStatus;
  results: TeoyubeBetaReadinessScoreResult[];
  blockers: TeoyubeBetaReadinessScoreBlocker[];
  warnings: TeoyubeBetaReadinessScoreWarning[];
  inMemoryOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};
