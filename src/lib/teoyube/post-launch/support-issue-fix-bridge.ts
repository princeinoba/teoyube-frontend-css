import type {
  TeoyubeSupportDeskBlocker,
  TeoyubeSupportDeskStatus,
  TeoyubeSupportDeskWarning,
  TeoyubeSupportFixCandidate,
  TeoyubeSupportIssueFixBridgeReport,
  TeoyubeSupportTicket,
  TeoyubeWeeklyImprovementPriority
} from "./support-desk-contracts";
import { classifySupportTicket, getSupportTicketSeverity } from "./support-desk-workflow";

const UNSAFE_FIX_REQUEST_PATTERNS = [
  /remove scripture|hide scripture|delete scripture/i,
  /remove explanation|hide explanation|delete explanation/i,
  /weaken fallback|disable fallback|remove fallback/i,
  /hide consent|remove consent|disable consent/i,
  /hidden personalization|silent personalization/i,
  /enable external analytics|send analytics|connect analytics/i,
  /enable production persistence|connect database|write to database/i,
  /enable live ai|live ai orchestration|call openai/i,
  /expose secret|api key|token|credential/i,
  /claim divine certainty|divine certainty|guaranteed calling/i
];

function sourceText(ticket: TeoyubeSupportTicket): string {
  return `${ticket.category} ${ticket.summary} ${ticket.redactedNotes.join(" ")}`;
}

function hasUnsafeFixRequest(ticket: TeoyubeSupportTicket): boolean {
  return UNSAFE_FIX_REQUEST_PATTERNS.some((pattern) => pattern.test(sourceText(ticket)));
}

export function getSupportFixPriority(ticket: TeoyubeSupportTicket): TeoyubeWeeklyImprovementPriority {
  const severity = getSupportTicketSeverity(ticket);
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  if (ticket.category === "feedback" || ticket.category === "unknown") return "defer";
  return "low";
}

export function shouldCreateFixCandidate(ticket: TeoyubeSupportTicket): boolean {
  const category = classifySupportTicket(ticket);
  return !hasUnsafeFixRequest(ticket) && !["feedback", "unknown", "sensitive_information", "spiritual_content"].includes(category);
}

export function createFixCandidateFromSupportTicket(ticket: TeoyubeSupportTicket): TeoyubeSupportFixCandidate {
  const unsafeRequest = hasUnsafeFixRequest(ticket);
  const category = classifySupportTicket(ticket);
  const priority = getSupportFixPriority(ticket);
  return {
    id: `fix_candidate_${ticket.id}`,
    sourceTicketId: ticket.id,
    supportCategory: category,
    title: unsafeRequest ? `Blocked unsafe support fix request: ${ticket.summary}` : `Support fix candidate: ${ticket.summary}`,
    category:
      category === "scripture_anchor" ? "scripture_coverage" :
      category === "promise_cluster" ? "promise_cluster_coverage" :
      category === "prayer_companion" ? "prayer_companion_improvements" :
      category === "calling_compass" ? "calling_compass_improvements" :
      category === "mobile_layout" ? "mobile_polish" :
      category === "accessibility" ? "accessibility_polish" :
      category === "privacy_terms_consent" ? "feedback_consent_clarity" :
      category === "app_not_loading" ? "performance" :
      "content_clarity",
    priority,
    sourceIds: [ticket.id],
    rationale: unsafeRequest
      ? "Unsafe change request detected. This candidate is blocked until rewritten to preserve Teoyube guardrails."
      : "Created from a sanitized manual support ticket for weekly owner review.",
    verificationRequired: [
      "Owner review",
      "Scripture anchor regression check",
      "Explanation path regression check",
      "Fallback safety check",
      "Privacy/consent check"
    ],
    ownerReviewRequired: true,
    preservesScriptureAnchors: !unsafeRequest,
    preservesExplanationPaths: !unsafeRequest,
    preservesFallbackSafety: !unsafeRequest,
    preservesConsentControls: !unsafeRequest,
    noHiddenPersonalization: !unsafeRequest,
    noUnapprovedAnalytics: !unsafeRequest,
    noUnapprovedPersistence: !unsafeRequest,
    noLiveAiOrchestration: !unsafeRequest,
    noSecretsExposed: !unsafeRequest,
    noDivineCertaintyClaimed: !unsafeRequest,
    blockedUnsafeRequest: unsafeRequest,
    generatedAt: new Date().toISOString()
  };
}

export function createFixCandidatesFromSupportTickets(tickets: TeoyubeSupportTicket[]): TeoyubeSupportFixCandidate[] {
  return tickets.filter(shouldCreateFixCandidate).map(createFixCandidateFromSupportTicket);
}

function getBridgeBlockers(tickets: TeoyubeSupportTicket[]): TeoyubeSupportDeskBlocker[] {
  return tickets
    .filter(hasUnsafeFixRequest)
    .map((ticket): TeoyubeSupportDeskBlocker => ({
      id: `${ticket.id}_unsafe_fix_request`,
      label: ticket.summary,
      category: classifySupportTicket(ticket),
      severity: "critical",
      reason: "Support ticket asks for a change that would remove or weaken required safety, privacy, consent, Scripture, explanation, fallback, provider, secret, or divine-certainty guardrails.",
      requiredAction: "Reject or rewrite the requested fix before creating a weekly improvement candidate."
    }));
}

function getBridgeWarnings(tickets: TeoyubeSupportTicket[]): TeoyubeSupportDeskWarning[] {
  return tickets
    .filter((ticket) => !shouldCreateFixCandidate(ticket) && !hasUnsafeFixRequest(ticket))
    .map((ticket): TeoyubeSupportDeskWarning => ({
      id: `${ticket.id}_no_fix_candidate`,
      label: ticket.summary,
      category: classifySupportTicket(ticket),
      severity: "medium",
      message: "Support ticket is being kept for review without a fix candidate.",
      recommendedAction: "Review during weekly owner review and keep it sanitized."
    }));
}

export function createSupportIssueFixBridgeReport(tickets: TeoyubeSupportTicket[] = []): TeoyubeSupportIssueFixBridgeReport {
  const candidates = createFixCandidatesFromSupportTickets(tickets);
  const blockers = getBridgeBlockers(tickets);
  const warnings = getBridgeWarnings(tickets);
  const status: TeoyubeSupportDeskStatus = blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready";
  return {
    status,
    ready: blockers.length === 0,
    ticketCount: tickets.length,
    candidateCount: candidates.length,
    candidates,
    blockers,
    warnings,
    noScriptureAnchorsRemoved: true,
    noExplanationPathsRemoved: true,
    noFallbackSafetyWeakened: true,
    noConsentControlsHidden: true,
    noHiddenPersonalizationCreated: true,
    noUnapprovedAnalyticsEnabled: true,
    noUnapprovedDatabasePersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noSecretsExposed: true,
    noDivineCertaintyClaimed: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
