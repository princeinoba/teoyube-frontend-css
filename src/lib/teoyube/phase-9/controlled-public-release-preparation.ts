import type {
  TeoyubeControlledPublicReleaseBlocker,
  TeoyubeControlledPublicReleaseCheck,
  TeoyubeControlledPublicReleaseDecision,
  TeoyubeControlledPublicReleaseReport,
  TeoyubeControlledPublicReleaseRequirement,
  TeoyubeControlledPublicReleaseRisk,
  TeoyubeControlledPublicReleaseScope,
  TeoyubeControlledPublicReleaseSurface,
  TeoyubeControlledPublicReleaseWarning
} from "./controlled-public-release-preparation-contracts";

export type TeoyubeControlledPublicReleasePreparationInput = Partial<{
  surfaces: TeoyubeControlledPublicReleaseSurface[];
  publicLaunchPerformedByCode: boolean;
  betaLaunchPerformedByCode: boolean;
  ownerApprovalRequired: boolean;
  automaticUserContact: boolean;
  automaticFeedbackCollection: boolean;
  publicUrlFetching: boolean;
  externalServiceRequired: boolean;
  servicesRemainDisabledOrFutureApproved: boolean;
  reviewedContentGateActive: boolean;
  reviewOnlyContentExcluded: boolean;
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackStatesSafe: boolean;
  confidenceLabelsVisible: boolean;
  privacyConsentNoticesVisible: boolean;
  knownLimitationsAvailable: boolean;
  publicCopyReviewRequired: boolean;
  supportFeedbackManualPrivacyProtective: boolean;
}>;

const DEFAULT_SURFACES: TeoyubeControlledPublicReleaseSurface[] = [
  "home",
  "canon",
  "daily_word",
  "word_card",
  "promise_table",
  "prayer_companion",
  "compass_experience",
  "tig_response_panel",
  "tig_graph_explorer",
  "privacy_notice",
  "consent_notice",
  "known_limitations",
  "support_feedback",
  "fallback_states"
];

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function requirement(id: string, surface: TeoyubeControlledPublicReleaseSurface, label: string, details: string): TeoyubeControlledPublicReleaseRequirement {
  return { id, surface, label, required: true, details };
}

function check(id: string, surface: TeoyubeControlledPublicReleaseSurface, label: string, passed: boolean, details: string): TeoyubeControlledPublicReleaseCheck {
  return { id, surface, label, passed, details, requirements: [requirement(`${id}_requirement`, surface, label, details)] };
}

export function createControlledPublicReleaseScope(input: TeoyubeControlledPublicReleasePreparationInput = {}): TeoyubeControlledPublicReleaseScope {
  return {
    id: "phase_9_1_controlled_public_release_scope",
    surfaces: input.surfaces || DEFAULT_SURFACES,
    releaseRemainsControlled: true,
    ownerApprovalRequired: true,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}

export function createControlledPublicReleasePreparationChecklist(input: TeoyubeControlledPublicReleasePreparationInput = {}): TeoyubeControlledPublicReleaseCheck[] {
  return [
    check("controlled_not_launched", "home", "Public release remains controlled and not launched", !input.publicLaunchPerformedByCode, "Phase 9.1 does not launch publicly from code."),
    check("no_beta_launch", "unknown", "Beta is not launched", !input.betaLaunchPerformedByCode, "Phase 9.1 does not launch beta from code."),
    check("owner_approval_required", "unknown", "Owner approval required", flag(input.ownerApprovalRequired), "Owner approval is required before any real public release activity."),
    check("no_user_contact", "support_feedback", "No automatic user contact", !input.automaticUserContact, "No email, SMS, notification, or external message is sent."),
    check("no_auto_feedback", "support_feedback", "No automatic feedback collection", !input.automaticFeedbackCollection, "Feedback remains manual."),
    check("no_public_url_fetching", "unknown", "No public URL fetching", !input.publicUrlFetching, "No public URL is fetched automatically."),
    check("no_external_service_required", "unknown", "No external service required", !input.externalServiceRequired, "Preparation renders and reports without external services."),
    check("services_disabled", "unknown", "Services remain disabled or future-approved only", flag(input.servicesRemainDisabledOrFutureApproved), "Services remain disabled unless a future approval exists."),
    check("reviewed_content_gate", "promise_table", "Reviewed content gate remains active", flag(input.reviewedContentGateActive), "Review-only content remains gated."),
    check("review_only_excluded", "promise_table", "Review-only content remains excluded", flag(input.reviewOnlyContentExcluded), "Review-only content is not published automatically."),
    check("scripture_anchors_visible", "word_card", "Scripture anchors remain visible", flag(input.scriptureAnchorsVisible), "Scripture anchors are preserved across public surfaces."),
    check("explanation_traces_visible", "tig_response_panel", "Explanation traces remain visible", flag(input.explanationTracesVisible), "Explanation trace availability remains visible."),
    check("fallback_states_safe", "fallback_states", "Fallback states remain safe", flag(input.fallbackStatesSafe), "Fallback states remain safe and non-empty."),
    check("confidence_labels_visible", "tig_response_panel", "Confidence labels remain visible", flag(input.confidenceLabelsVisible), "Confidence labels remain humble and visible."),
    check("privacy_consent_visible", "privacy_notice", "Privacy/consent notices remain visible", flag(input.privacyConsentNoticesVisible), "Privacy and consent notices remain available."),
    check("known_limitations_available", "known_limitations", "Known limitations are available", flag(input.knownLimitationsAvailable), "Known limitations remain available."),
    check("copy_review_required", "unknown", "Public copy review is required", flag(input.publicCopyReviewRequired), "Final public copy review remains required before release candidate QA."),
    check("support_feedback_manual_privacy", "support_feedback", "Support/feedback readiness remains manual and privacy-protective", flag(input.supportFeedbackManualPrivacyProtective), "Support and feedback readiness remains manual, redaction-aware, and privacy-protective.")
  ];
}

export function getControlledPublicReleasePreparationBlockers(input: TeoyubeControlledPublicReleasePreparationInput = {}): TeoyubeControlledPublicReleaseBlocker[] {
  return createControlledPublicReleasePreparationChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      surface: entry.surface,
      message: `${entry.label} is not satisfied.`,
      requiredAction: "Resolve before public release candidate QA."
    }));
}

export function getControlledPublicReleasePreparationWarnings(input: TeoyubeControlledPublicReleasePreparationInput = {}): TeoyubeControlledPublicReleaseWarning[] {
  return [
    {
      id: "phase_9_1_preparation_only",
      surface: "unknown",
      message: "Controlled public release preparation is manual and in-memory; it does not launch, contact users, collect feedback, fetch URLs, publish content, persist data, or connect services.",
      recommendedAction: "Use the Phase 9.1 package for owner review before Phase 9.2 QA."
    },
    ...(!input.publicCopyReviewRequired ? [{
      id: "copy_review_should_remain_required",
      surface: "unknown" as const,
      message: "Final public copy review should remain required.",
      recommendedAction: "Complete final public copy review before public release candidate QA."
    }] : [])
  ];
}

function risks(): TeoyubeControlledPublicReleaseRisk[] {
  return [
    { id: "public_scope_privacy_risk", surface: "privacy_notice", severity: "high", message: "Public release scope can expose privacy, consent, and sensitive-data gaps.", mitigation: "Keep privacy/consent notices and sensitive-data warnings visible." },
    { id: "service_activation_confusion_risk", surface: "unknown", severity: "high", message: "Future service review can be confused with service activation.", mitigation: "Keep service locks disabled or future-review-only." },
    { id: "guidance_copy_risk", surface: "tig_response_panel", severity: "medium", message: "Public copy can overstate certainty if Scripture, explanations, fallback, or confidence labels are hidden.", mitigation: "Preserve safety surfaces through final copy review." }
  ];
}

export function createControlledPublicReleasePreparationDecision(input: TeoyubeControlledPublicReleasePreparationInput = {}): TeoyubeControlledPublicReleaseDecision {
  const blockers = getControlledPublicReleasePreparationBlockers(input);
  if (blockers.some((entry) => entry.surface === "privacy_notice" || entry.surface === "consent_notice")) return "needs_privacy_security_review";
  if (blockers.some((entry) => entry.surface === "unknown" && entry.id.includes("services"))) return "needs_service_lock_review";
  if (blockers.some((entry) => entry.id.includes("copy"))) return "needs_copy_review";
  if (blockers.some((entry) => entry.id.includes("owner"))) return "needs_owner_approval";
  if (blockers.length) return "blocked";
  return getControlledPublicReleasePreparationWarnings(input).length ? "ready_with_warnings" : "ready_for_public_release_candidate_qa";
}

export function validateControlledPublicReleasePreparation(input: TeoyubeControlledPublicReleasePreparationInput = {}): boolean {
  return getControlledPublicReleasePreparationBlockers(input).length === 0;
}

export function createControlledPublicReleasePreparationReport(input: TeoyubeControlledPublicReleasePreparationInput = {}): TeoyubeControlledPublicReleaseReport {
  const blockers = getControlledPublicReleasePreparationBlockers(input);
  const warnings = getControlledPublicReleasePreparationWarnings(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decision: createControlledPublicReleasePreparationDecision(input),
    scope: createControlledPublicReleaseScope(input),
    checks: createControlledPublicReleasePreparationChecklist(input),
    blockers,
    warnings,
    risks: risks(),
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
