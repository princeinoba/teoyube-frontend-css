export type TeoyubeSupportDeskStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_manual_review"
  | "blocked"
  | "empty"
  | "unknown";

export type TeoyubeSupportTicketCategory =
  | "app_not_loading"
  | "mobile_layout"
  | "accessibility"
  | "privacy_terms_consent"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "confidence_label"
  | "ai_companion"
  | "prayer_companion"
  | "calling_compass"
  | "promise_cluster"
  | "personalization"
  | "feedback"
  | "sensitive_information"
  | "spiritual_content"
  | "unknown";

export type TeoyubeSupportTicketSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeSupportTicketSource =
  | "manual_support"
  | "manual_feedback"
  | "owner_review"
  | "public_feedback"
  | "qa_review"
  | "support_note"
  | "unknown";

export type TeoyubeSupportTicketDecision =
  | "document_for_weekly_review"
  | "create_fix_candidate"
  | "escalate_to_owner_review"
  | "pause_and_review"
  | "defer"
  | "blocked"
  | "unknown";

export type TeoyubeSupportDeskBlocker = {
  id: string;
  label: string;
  category: TeoyubeSupportTicketCategory;
  severity: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeSupportDeskWarning = {
  id: string;
  label: string;
  category: TeoyubeSupportTicketCategory;
  severity: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubeSupportTicket = {
  id: string;
  source: TeoyubeSupportTicketSource;
  category: TeoyubeSupportTicketCategory;
  summary: string;
  redactedNotes: string[];
  severity: TeoyubeSupportTicketSeverity;
  decision: TeoyubeSupportTicketDecision;
  manuallyEntered: true;
  manualOnly: true;
  sanitized: boolean;
  emergencyConcern: boolean;
  medicalConcern: boolean;
  legalConcern: boolean;
  financialConcern: boolean;
  crisisConcern: boolean;
  professionalAdviceRequested: boolean;
  scriptureAnchoringRequired: true;
  explanationPathsRequired: true;
  fallbackSafetyRequired: true;
  consentControlsRequired: true;
  privacyTermsConsentNoticesRequired: true;
  noDivineCertaintyClaimed: true;
  rawSensitiveTextStored: boolean;
  usersContacted: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlFetched: boolean;
  databaseWritten: boolean;
  analyticsSent: boolean;
  externalServicesCalled: boolean;
  liveAiOrchestrationEnabled: boolean;
  hiddenPersonalizationCreated: boolean;
  generatedAt: string;
};

export type TeoyubeSupportDeskReport = {
  status: TeoyubeSupportDeskStatus;
  ready: boolean;
  decision: TeoyubeSupportTicketDecision;
  ticketCount: number;
  blockerCount: number;
  warningCount: number;
  tickets: TeoyubeSupportTicket[];
  blockers: TeoyubeSupportDeskBlocker[];
  warnings: TeoyubeSupportDeskWarning[];
  manualOnly: true;
  sanitizedOnly: boolean;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noAnalyticsSent: true;
  noDatabaseWrites: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  noProfessionalAdviceProvided: true;
  noDivineCertaintyClaimed: true;
  generatedAt: string;
};

export type TeoyubeWeeklyFeedbackTheme =
  | "scripture_clarity"
  | "promise_relevance"
  | "prayer_usefulness"
  | "calling_compass_clarity"
  | "ai_companion_clarity"
  | "mobile_usability"
  | "accessibility"
  | "consent_privacy_clarity"
  | "fallback_quality"
  | "content_clarity"
  | "feature_requests"
  | "unknown";

export type TeoyubeWeeklyFeedbackItem = {
  id: string;
  theme: TeoyubeWeeklyFeedbackTheme;
  summary: string;
  redactedNotes: string[];
  severity: TeoyubeSupportTicketSeverity;
  source: TeoyubeSupportTicketSource;
  manuallyEntered: true;
  manualOnly: true;
  sanitized: boolean;
  automaticCollectionEnabled: boolean;
  rawSensitiveTextStored: boolean;
  usersContacted: boolean;
  publicUrlFetched: boolean;
  databaseWritten: boolean;
  analyticsSent: boolean;
  externalServicesCalled: boolean;
  liveAiOrchestrationEnabled: boolean;
  hiddenPersonalizationCreated: boolean;
  generatedAt: string;
};

export type TeoyubeWeeklyFeedbackSummary = {
  itemCount: number;
  themeCounts: Record<TeoyubeWeeklyFeedbackTheme, number>;
  highOrCriticalCount: number;
  manuallyEnteredCount: number;
};

export type TeoyubeWeeklyFeedbackReviewReport = {
  status: TeoyubeSupportDeskStatus;
  ready: boolean;
  summary: TeoyubeWeeklyFeedbackSummary;
  themes: TeoyubeWeeklyFeedbackTheme[];
  feedback: TeoyubeWeeklyFeedbackItem[];
  blockers: TeoyubeSupportDeskBlocker[];
  warnings: TeoyubeSupportDeskWarning[];
  manualOnly: true;
  sanitizedOnly: boolean;
  noAutomaticFeedbackCollection: true;
  noUsersContacted: true;
  noPublicUrlFetched: true;
  noAnalyticsSent: true;
  noDatabaseWrites: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubeWeeklyImprovementCategory =
  | "scripture_coverage"
  | "promise_cluster_coverage"
  | "prayer_companion_improvements"
  | "calling_compass_improvements"
  | "tig_response_panel_improvements"
  | "tig_graph_explorer_improvements"
  | "wordcard_clarity"
  | "mobile_polish"
  | "accessibility_polish"
  | "public_copy_clarity"
  | "feedback_consent_clarity"
  | "performance"
  | "unknown";

export type TeoyubeWeeklyImprovementPriority =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "defer";

export type TeoyubeWeeklyImprovementDecision =
  | "ready_for_owner_review"
  | "ready_with_warnings"
  | "blocked"
  | "defer"
  | "unknown";

export type TeoyubeWeeklyImprovementItem = {
  id: string;
  title: string;
  category: TeoyubeWeeklyImprovementCategory;
  priority: TeoyubeWeeklyImprovementPriority;
  sourceIds: string[];
  rationale: string;
  verificationRequired: string[];
  ownerReviewRequired: boolean;
  preservesScriptureAnchors: boolean;
  preservesExplanationPaths: boolean;
  preservesFallbackSafety: boolean;
  preservesConsentControls: boolean;
  noHiddenPersonalization: boolean;
  noUnapprovedAnalytics: boolean;
  noUnapprovedPersistence: boolean;
  noLiveAiOrchestration: boolean;
  noSecretsExposed: boolean;
  noDivineCertaintyClaimed: boolean;
  generatedAt: string;
};

export type TeoyubeSupportFixCandidate = TeoyubeWeeklyImprovementItem & {
  sourceTicketId: string;
  supportCategory: TeoyubeSupportTicketCategory;
  blockedUnsafeRequest: boolean;
};

export type TeoyubeSupportIssueFixBridgeReport = {
  status: TeoyubeSupportDeskStatus;
  ready: boolean;
  ticketCount: number;
  candidateCount: number;
  candidates: TeoyubeSupportFixCandidate[];
  blockers: TeoyubeSupportDeskBlocker[];
  warnings: TeoyubeSupportDeskWarning[];
  noScriptureAnchorsRemoved: true;
  noExplanationPathsRemoved: true;
  noFallbackSafetyWeakened: true;
  noConsentControlsHidden: true;
  noHiddenPersonalizationCreated: true;
  noUnapprovedAnalyticsEnabled: true;
  noUnapprovedDatabasePersistenceEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noSecretsExposed: true;
  noDivineCertaintyClaimed: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubeWeeklyImprovementReport = {
  status: TeoyubeSupportDeskStatus;
  ready: boolean;
  decision: TeoyubeWeeklyImprovementDecision;
  itemCount: number;
  prioritizedItems: TeoyubeWeeklyImprovementItem[];
  blockers: TeoyubeSupportDeskBlocker[];
  warnings: TeoyubeSupportDeskWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  noExternalWrite: true;
  noAutomaticUserContact: true;
  noAutomaticFeedbackCollection: true;
  noAnalyticsSent: true;
  noDatabaseWrites: true;
  noLiveAiOrchestrationEnabled: true;
  generatedAt: string;
};

export type TeoyubeWeeklyOwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
};

export type TeoyubeWeeklyOwnerReviewRecord = {
  id: string;
  supportTicketsReviewed: boolean;
  feedbackThemesReviewed: boolean;
  scriptureExplanationIssuesReviewed: boolean;
  fallbackIssuesReviewed: boolean;
  privacyConsentIssuesReviewed: boolean;
  mobileAccessibilityIssuesReviewed: boolean;
  weeklyFixCandidatesReviewed: boolean;
  deferredImprovementsAccepted: boolean;
  nextWeekPrioritiesAccepted: boolean;
  notes: string[];
  manualOnly: true;
  usersContacted: boolean;
  analyticsSent: boolean;
  databaseWritten: boolean;
  liveAiOrchestrationEnabled: boolean;
  generatedAt: string;
};

export type TeoyubeWeeklyOwnerReviewDecision =
  | "accepted"
  | "accepted_with_warnings"
  | "needs_owner_review"
  | "blocked"
  | "unknown";

export type TeoyubeWeeklyOwnerReviewReport = {
  status: TeoyubeSupportDeskStatus;
  ready: boolean;
  decision: TeoyubeWeeklyOwnerReviewDecision;
  checklist: TeoyubeWeeklyOwnerReviewChecklistItem[];
  record: TeoyubeWeeklyOwnerReviewRecord;
  blockers: TeoyubeSupportDeskBlocker[];
  warnings: TeoyubeSupportDeskWarning[];
  noUsersContacted: true;
  noAnalyticsSent: true;
  noDatabaseWrites: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubeWeeklyImprovementPackage = {
  id: string;
  label: string;
  supportDeskReport: TeoyubeSupportDeskReport;
  weeklyFeedbackReview: TeoyubeWeeklyFeedbackReviewReport;
  weeklyImprovementPlan: TeoyubeWeeklyImprovementReport;
  supportIssueFixBridgeReport: TeoyubeSupportIssueFixBridgeReport;
  ownerReview: TeoyubeWeeklyOwnerReviewReport;
  nextActionRecommendation: string;
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  publicUrlFetched: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  liveAiOrchestrationEnabled: false;
  hiddenPersonalizationCreated: false;
  generatedAt: string;
};
