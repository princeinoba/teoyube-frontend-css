import type { TeoyubeReleaseCandidateFixQueueItem } from "./release-candidate-fix-queue-contracts";

export type TeoyubeReleaseCandidateRemediationStatus =
  | "safe_to_remediate"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "remediated"
  | "verified"
  | "unknown";

export type TeoyubeReleaseCandidateRemediationAction = {
  id: string;
  label: string;
  details: string;
  safeLocalAction: boolean;
  filePath?: string;
};

export type TeoyubeReleaseCandidateRemediationRisk = Partial<{
  removesScriptureAnchors: boolean;
  removesExplanationTraces: boolean;
  weakensFallbackSafety: boolean;
  removesConfidenceLabels: boolean;
  hidesPrivacyConsentNotices: boolean;
  removesSensitiveDataWarnings: boolean;
  removesKnownLimitations: boolean;
  enablesUnapprovedServices: boolean;
  publishesReviewOnlyContent: boolean;
  writesUnreviewedProductionJson: boolean;
  storesRawSensitiveText: boolean;
  addsSensitiveBrowserPersistence: boolean;
  createsHiddenPersonalization: boolean;
  claimsDivineCertainty: boolean;
  addsProfessionalAdviceLanguage: boolean;
  exposesDebugPayloads: boolean;
}>;

export type TeoyubeReleaseCandidateRemediationItem = {
  id: string;
  fixItem: TeoyubeReleaseCandidateFixQueueItem;
  status: TeoyubeReleaseCandidateRemediationStatus;
  actions: TeoyubeReleaseCandidateRemediationAction[];
  risk: TeoyubeReleaseCandidateRemediationRisk;
  safeLocalRemediation: boolean;
  ownerReviewRequired: boolean;
  blocked: boolean;
  deferred: boolean;
  notes: string[];
};

export type TeoyubeReleaseCandidateRemediationPlan = {
  id: string;
  items: TeoyubeReleaseCandidateRemediationItem[];
  safePatchSummary: Array<{ filePath: string; issueAddressed: string; whySafe: string; regressionChecksRequired: string[] }>;
  manualOnly: true;
  noExternalWrite: true;
  noDatabasePersistence: true;
  noAnalytics: true;
  noExternalServices: true;
  noUserContact: true;
  noPublishing: true;
  noProductionJsonWrite: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeReleaseCandidateRemediationResult = {
  id: string;
  itemId: string;
  status: TeoyubeReleaseCandidateRemediationStatus;
  verified: boolean;
  notes: string[];
};

export type TeoyubeReleaseCandidateRemediationDecision =
  | "remediation_ready"
  | "remediation_ready_with_warnings"
  | "owner_review_required"
  | "remediation_blocked"
  | "unknown";

export type TeoyubeReleaseCandidateRemediationBlocker = {
  id: string;
  itemId?: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeReleaseCandidateRemediationWarning = {
  id: string;
  itemId?: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeReleaseCandidateRemediationReport = {
  valid: boolean;
  decision: TeoyubeReleaseCandidateRemediationDecision;
  plan: TeoyubeReleaseCandidateRemediationPlan;
  blockers: TeoyubeReleaseCandidateRemediationBlocker[];
  warnings: TeoyubeReleaseCandidateRemediationWarning[];
  summary: {
    totalItems: number;
    safeLocalItems: number;
    ownerReviewItems: number;
    blockedItems: number;
    deferredItems: number;
    remediatedItems: number;
    verifiedItems: number;
  };
  manualOnly: true;
  noExternalWrite: true;
  noExternalServices: true;
  inMemoryOnly: true;
  generatedAt: string;
};
