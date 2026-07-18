export type TeoyubePublicSupportReadinessStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePublicSupportCategory =
  | "app_not_loading"
  | "navigation_confusion"
  | "scripture_anchor_question"
  | "explanation_trace_question"
  | "fallback_confusion"
  | "confidence_label_confusion"
  | "prayer_companion_question"
  | "calling_compass_question"
  | "promise_table_question"
  | "tig_graph_question"
  | "privacy_consent_question"
  | "sensitive_information_submitted"
  | "emergency_or_crisis"
  | "professional_advice_request"
  | "technical_issue"
  | "unknown";

export type TeoyubePublicSupportSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type TeoyubePublicSupportBoundary = {
  id: string;
  category: TeoyubePublicSupportCategory;
  severity: TeoyubePublicSupportSeverity;
  label: string;
  details: string;
  required: boolean;
};

export type TeoyubePublicSupportChecklistItem = {
  id: string;
  label: string;
  category: TeoyubePublicSupportCategory;
  required: boolean;
  passed: boolean;
  details: string;
};

export type TeoyubePublicSupportReadinessBlocker = {
  id: string;
  category: TeoyubePublicSupportCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubePublicSupportReadinessWarning = {
  id: string;
  category: TeoyubePublicSupportCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicSupportReadinessDecision =
  | "public_support_ready"
  | "public_support_ready_with_warnings"
  | "public_support_blocked"
  | "unknown";

export type TeoyubePublicSupportReadinessReport = {
  valid: boolean;
  status: TeoyubePublicSupportReadinessStatus;
  decision: TeoyubePublicSupportReadinessDecision;
  checklist: TeoyubePublicSupportChecklistItem[];
  boundaries: TeoyubePublicSupportBoundary[];
  recommendedManualResponses: Record<TeoyubePublicSupportCategory, string>;
  blockers: TeoyubePublicSupportReadinessBlocker[];
  warnings: TeoyubePublicSupportReadinessWarning[];
  supportRemainsManual: true;
  noAutomaticContact: true;
  noRawSensitiveTextStorageByDefault: true;
  noProfessionalAdvice: true;
  noDivineCertainty: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
