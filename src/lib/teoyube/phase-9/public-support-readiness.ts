import type {
  TeoyubePublicSupportBoundary,
  TeoyubePublicSupportCategory,
  TeoyubePublicSupportChecklistItem,
  TeoyubePublicSupportReadinessBlocker,
  TeoyubePublicSupportReadinessDecision,
  TeoyubePublicSupportReadinessReport,
  TeoyubePublicSupportReadinessWarning
} from "./public-support-readiness-contracts";

export type TeoyubePublicSupportReadinessInput = Partial<{
  manualSupportWorkflowReady: boolean;
  supportBoundariesDocumented: boolean;
  crisisEscalationManualPathReady: boolean;
  professionalAdviceBoundaryReady: boolean;
  scriptureExplanationFallbackBoundaryReady: boolean;
  privacyConsentBoundaryReady: boolean;
  sensitiveTextHandlingReady: boolean;
  automaticUserContactEnabled: boolean;
  supportPersistenceEnabled: boolean;
  externalSupportServiceConnected: boolean;
  divineCertaintyLanguageAllowed: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, label: string, category: TeoyubePublicSupportCategory, passed: boolean, details: string): TeoyubePublicSupportChecklistItem {
  return { id, label, category, required: true, passed, details };
}

export function getPublicSupportCategories(): TeoyubePublicSupportCategory[] {
  return [
    "app_not_loading",
    "navigation_confusion",
    "scripture_anchor_question",
    "explanation_trace_question",
    "fallback_confusion",
    "confidence_label_confusion",
    "prayer_companion_question",
    "calling_compass_question",
    "promise_table_question",
    "tig_graph_question",
    "privacy_consent_question",
    "sensitive_information_submitted",
    "emergency_or_crisis",
    "professional_advice_request",
    "technical_issue",
    "unknown"
  ];
}

export function getPublicSupportBoundaries(): TeoyubePublicSupportBoundary[] {
  return [
    { id: "no_professional_advice", category: "professional_advice_request", severity: "critical", label: "No professional advice", details: "Do not provide medical, legal, financial, emergency, or professional counseling advice.", required: true },
    { id: "manual_crisis_escalation", category: "emergency_or_crisis", severity: "critical", label: "Manual crisis escalation", details: "Emergency or crisis concerns must be manually redirected to appropriate emergency or crisis resources.", required: true },
    { id: "no_divine_certainty", category: "unknown", severity: "critical", label: "No divine certainty", details: "Do not claim Teoyube output is a direct command from God or spiritually certain.", required: true },
    { id: "scripture_explanation_preserved", category: "scripture_anchor_question", severity: "high", label: "Scripture and explanation preserved", details: "Preserve Scripture anchoring, explanation paths, fallback context, and confidence labels.", required: true },
    { id: "privacy_consent_preserved", category: "privacy_consent_question", severity: "high", label: "Privacy and consent preserved", details: "Preserve privacy/consent boundaries and avoid collecting raw sensitive text by default.", required: true },
    { id: "manual_contact_only", category: "unknown", severity: "high", label: "Manual contact only", details: "Do not contact users automatically.", required: true }
  ];
}

export function getPublicSupportRecommendedManualResponses(): Record<TeoyubePublicSupportCategory, string> {
  return {
    app_not_loading: "Record environment details manually and move reproducible blockers to Phase 9.3 fix queue.",
    navigation_confusion: "Clarify the intended surface and log copy or flow improvements manually.",
    scripture_anchor_question: "Point to visible anchors and log missing-anchor concerns as blockers when recommendations lack anchors.",
    explanation_trace_question: "Explain that traces show why a suggestion appeared and log missing traces as blockers.",
    fallback_confusion: "Explain safe fallback behavior and log unsafe or empty fallback states immediately.",
    confidence_label_confusion: "Clarify confidence labels are bounded and not spiritually certain.",
    prayer_companion_question: "Keep responses devotional, anchored, and non-clinical.",
    calling_compass_question: "Keep calling language invitational and non-certain.",
    promise_table_question: "Point to Scripture-supported promise clusters and log unsupported claims.",
    tig_graph_question: "Use graph list fallback when dense graph output is hard to read.",
    privacy_consent_question: "Direct users to privacy/consent notices; avoid collecting sensitive data in support notes.",
    sensitive_information_submitted: "Redact or flag sensitive text manually; do not store raw sensitive text by default.",
    emergency_or_crisis: "Manually direct to emergency or crisis resources; do not provide crisis counseling.",
    professional_advice_request: "Decline professional advice and suggest qualified professionals where appropriate.",
    technical_issue: "Record reproducible steps manually and classify severity.",
    unknown: "Record only minimal non-sensitive context and escalate manually when uncertain."
  };
}

export function createPublicSupportReadinessChecklist(input: TeoyubePublicSupportReadinessInput = {}): TeoyubePublicSupportChecklistItem[] {
  return [
    check("manual_support_workflow_ready", "Manual support workflow ready", "technical_issue", flag(input.manualSupportWorkflowReady), "Support workflow is manual and ready for public candidate review."),
    check("support_boundaries_documented", "Support boundaries documented", "unknown", flag(input.supportBoundariesDocumented), "Support boundaries are documented for reviewers."),
    check("crisis_escalation_manual_path_ready", "Emergency/crisis manual path ready", "emergency_or_crisis", flag(input.crisisEscalationManualPathReady), "Emergency and crisis concerns have manual escalation guidance."),
    check("professional_advice_boundary_ready", "Professional advice boundary ready", "professional_advice_request", flag(input.professionalAdviceBoundaryReady), "Medical, legal, financial, emergency, and counseling advice boundaries are explicit."),
    check("scripture_explanation_fallback_boundary_ready", "Scripture/explanation/fallback boundary ready", "scripture_anchor_question", flag(input.scriptureExplanationFallbackBoundaryReady), "Scripture anchors, explanation paths, fallback safety, and confidence labels remain protected."),
    check("privacy_consent_boundary_ready", "Privacy/consent boundary ready", "privacy_consent_question", flag(input.privacyConsentBoundaryReady), "Privacy and consent boundaries are explicit."),
    check("sensitive_text_handling_ready", "Sensitive text handling ready", "sensitive_information_submitted", flag(input.sensitiveTextHandlingReady), "Sensitive support text is redacted or flagged manually."),
    check("no_automatic_user_contact", "No automatic user contact", "unknown", !input.automaticUserContactEnabled, "Support does not contact users automatically."),
    check("no_support_persistence", "No support persistence", "unknown", !input.supportPersistenceEnabled, "Support readiness does not add persistence."),
    check("no_external_support_service", "No external support service", "unknown", !input.externalSupportServiceConnected, "No external support desk or messaging service is connected."),
    check("no_divine_certainty", "No divine certainty", "unknown", !input.divineCertaintyLanguageAllowed, "Support language does not claim divine certainty.")
  ];
}

export function getPublicSupportReadinessBlockers(input: TeoyubePublicSupportReadinessInput = {}): TeoyubePublicSupportReadinessBlocker[] {
  return createPublicSupportReadinessChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, category: entry.category, message: entry.details, requiredAction: "Resolve support readiness blocker before public go/no-go." }));
}

export function getPublicSupportReadinessWarnings(): TeoyubePublicSupportReadinessWarning[] {
  return [{ id: "support_manual_only", category: "unknown", message: "Public support readiness is manual and in-memory; it sends no messages and stores no raw sensitive text by default.", recommendedAction: "Review support guidance manually before Phase 9.3." }];
}

export function createPublicSupportReadinessDecision(input: TeoyubePublicSupportReadinessInput = {}): TeoyubePublicSupportReadinessDecision {
  if (getPublicSupportReadinessBlockers(input).length) return "public_support_blocked";
  return getPublicSupportReadinessWarnings().length ? "public_support_ready_with_warnings" : "public_support_ready";
}

export function validatePublicSupportReadiness(input: TeoyubePublicSupportReadinessInput = {}): TeoyubePublicSupportReadinessReport {
  return createPublicSupportReadinessReport(input);
}

export function createPublicSupportReadinessReport(input: TeoyubePublicSupportReadinessInput = {}): TeoyubePublicSupportReadinessReport {
  const blockers = getPublicSupportReadinessBlockers(input);
  const warnings = getPublicSupportReadinessWarnings();
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decision: createPublicSupportReadinessDecision(input),
    checklist: createPublicSupportReadinessChecklist(input),
    boundaries: getPublicSupportBoundaries(),
    recommendedManualResponses: getPublicSupportRecommendedManualResponses(),
    blockers,
    warnings,
    supportRemainsManual: true,
    noAutomaticContact: true,
    noRawSensitiveTextStorageByDefault: true,
    noProfessionalAdvice: true,
    noDivineCertainty: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
