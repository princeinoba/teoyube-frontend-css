export type TeoyubeFinalPublicCopyReviewStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeFinalPublicCopyArea =
  | "home_copy"
  | "canon_copy"
  | "daily_word_copy"
  | "word_card_copy"
  | "promise_table_copy"
  | "prayer_companion_copy"
  | "calling_compass_copy"
  | "tig_response_copy"
  | "tig_graph_copy"
  | "fallback_copy"
  | "privacy_notice"
  | "consent_notice"
  | "sensitive_data_warning"
  | "known_limitations"
  | "support_feedback_copy"
  | "professional_advice_boundary"
  | "divine_certainty_boundary"
  | "unknown";

export type TeoyubeFinalPublicCopyDecision =
  | "copy_ready_for_public_release_candidate_qa"
  | "ready_with_warnings"
  | "blocked"
  | "needs_privacy_copy"
  | "needs_consent_copy"
  | "needs_sensitive_data_warning"
  | "needs_known_limitations"
  | "needs_support_feedback_copy"
  | "needs_safety_boundary_copy"
  | "unknown";

export type TeoyubeFinalPublicCopyRequirement = {
  id: string;
  area: TeoyubeFinalPublicCopyArea;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeFinalPublicCopyItem = {
  id: string;
  area: TeoyubeFinalPublicCopyArea;
  label: string;
  copy: string;
  reviewed: boolean;
  requirements: TeoyubeFinalPublicCopyRequirement[];
};

export type TeoyubeFinalPublicCopyBlocker = {
  id: string;
  area: TeoyubeFinalPublicCopyArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeFinalPublicCopyWarning = {
  id: string;
  area: TeoyubeFinalPublicCopyArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeFinalPublicCopyCheck = {
  id: string;
  area: TeoyubeFinalPublicCopyArea;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeFinalPublicCopyReport = {
  valid: boolean;
  status: TeoyubeFinalPublicCopyReviewStatus;
  decision: TeoyubeFinalPublicCopyDecision;
  items: TeoyubeFinalPublicCopyItem[];
  checks: TeoyubeFinalPublicCopyCheck[];
  blockers: TeoyubeFinalPublicCopyBlocker[];
  warnings: TeoyubeFinalPublicCopyWarning[];
  noDivineCertaintyClaims: true;
  noProfessionalAdviceClaims: true;
  noUnapprovedServiceClaims: true;
  scriptureAnchorsProtected: true;
  explanationTracesProtected: true;
  inMemoryOnly: true;
  generatedAt: string;
};
