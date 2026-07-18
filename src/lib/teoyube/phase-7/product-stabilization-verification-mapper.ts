import type {
  TeoyubeProductStabilizationCategory,
  TeoyubeProductStabilizationQueue,
  TeoyubeProductStabilizationQueueItem
} from "./product-stabilization-queue-contracts";
import type { TeoyubeProductStabilizationPassVerificationRequirement } from "./product-stabilization-pass-contracts";

export type TeoyubeProductStabilizationVerificationPlanItem = {
  itemId: string;
  category: TeoyubeProductStabilizationCategory;
  requirements: TeoyubeProductStabilizationPassVerificationRequirement[];
};

export type TeoyubeProductStabilizationVerificationReport = {
  valid: boolean;
  queueId: string;
  planItems: TeoyubeProductStabilizationVerificationPlanItem[];
  criticalChecks: TeoyubeProductStabilizationPassVerificationRequirement[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noPublicUrlsFetchedAutomatically: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

function requirement(id: string, label: string, details: string): TeoyubeProductStabilizationPassVerificationRequirement {
  return { id, label, required: true, details };
}

const COMMON_REQUIREMENTS = [
  requirement("scripture_anchor_visibility", "Scripture anchors visible", "Confirm available Scripture anchors remain visible and supported."),
  requirement("explanation_trace_visibility", "Explanation traces visible", "Confirm explanation traces and fallback reasons remain visible."),
  requirement("fallback_safety", "Fallback safety", "Confirm fallback states remain safe, humble, non-empty, and bounded."),
  requirement("confidence_label_visibility", "Confidence labels visible", "Confirm confidence or uncertainty labels remain visible."),
  requirement("disabled_service_boundary", "Disabled services remain disabled", "Confirm no database, analytics, monitoring provider, messaging, live AI, admin auth, CMS, URL fetching, or browser persistence was added.")
];

export function getVerificationRequirementsForStabilizationItem(item: TeoyubeProductStabilizationQueueItem): TeoyubeProductStabilizationPassVerificationRequirement[] {
  const categorySpecific: Partial<Record<TeoyubeProductStabilizationCategory, TeoyubeProductStabilizationPassVerificationRequirement[]>> = {
    scripture_anchor: [requirement("scripture_recommendation_qa", "Scripture recommendation QA", "Verify Scripture visibility and recommendation anchors.")],
    explanation_trace: [requirement("tig_explanation_trace_qa", "TIG explanation trace QA", "Verify TIG, prayer, calling, and fallback explanation paths.")],
    fallback: [requirement("fallback_safety_qa", "Fallback safety QA", "Verify fallback copy is safe and does not invent unsupported promises.")],
    confidence_label: [requirement("confidence_label_qa", "Confidence label QA", "Verify confidence labels remain visible and understandable.")],
    privacy_consent: [requirement("privacy_consent_qa", "Privacy/consent QA", "Verify privacy, consent, and sensitive-information boundaries remain visible.")],
    service_disabled_state: [requirement("disabled_service_qa", "Disabled service QA", "Verify services remain disabled or plan-only.")],
    reviewed_content_gate: [requirement("reviewed_content_gate_qa", "Reviewed content gate QA", "Verify review-only content stays out of live flows.")],
    controlled_admin: [requirement("controlled_admin_boundary_qa", "Controlled admin boundary QA", "Verify admin remains prototype-only and in-memory.")],
    feedback_review: [requirement("feedback_review_qa", "Feedback review QA", "Verify feedback review remains manual, sanitized, and in-memory.")],
    support_workflow: [requirement("support_workflow_qa", "Support workflow QA", "Verify support sends no messages and preserves support boundaries.")],
    issue_triage: [requirement("issue_triage_qa", "Issue triage QA", "Verify issue triage remains manual and owner-controlled.")],
    mobile: [requirement("mobile_qa", "Mobile QA", "Verify WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, TIGGraphExplorer, and Promise Table remain readable on mobile.")],
    accessibility: [requirement("accessibility_qa", "Accessibility QA", "Verify labels, focus basics, keyboard basics, and readable text remain intact.")],
    promise_table: [requirement("promise_table_ux_qa", "Promise Table UX QA", "Verify Promise Table rows remain readable and mobile-safe.")],
    tig_graph_explorer: [requirement("tig_graph_list_fallback_qa", "TIG graph/list fallback QA", "Verify graph has a readable list fallback.")],
    documentation: [requirement("docs_roadmap_qa", "Docs/roadmap QA", "Verify docs and roadmap reflect the current phase and constraints.")]
  };
  return [...COMMON_REQUIREMENTS, ...(categorySpecific[item.category] || [])];
}

export function createVerificationPlanForStabilizationQueue(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationVerificationPlanItem[] {
  return queue.items.map((item) => ({
    itemId: item.id,
    category: item.category,
    requirements: getVerificationRequirementsForStabilizationItem(item)
  }));
}

export function getCriticalStabilizationVerificationChecks(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationPassVerificationRequirement[] {
  const byId = new Map<string, TeoyubeProductStabilizationPassVerificationRequirement>();
  createVerificationPlanForStabilizationQueue(queue)
    .flatMap((entry) => entry.requirements)
    .filter((entry) => ["scripture_anchor_visibility", "explanation_trace_visibility", "fallback_safety", "confidence_label_visibility", "disabled_service_boundary", "privacy_consent_qa", "disabled_service_qa", "reviewed_content_gate_qa"].includes(entry.id))
    .forEach((entry) => byId.set(entry.id, entry));
  return Array.from(byId.values());
}

export function createProductStabilizationVerificationReport(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationVerificationReport {
  const planItems = createVerificationPlanForStabilizationQueue(queue);
  const missing = planItems.filter((entry) => !entry.requirements.length);
  return {
    valid: missing.length === 0,
    queueId: queue.id,
    planItems,
    criticalChecks: getCriticalStabilizationVerificationChecks(queue),
    blockers: missing.map((entry) => `${entry.itemId} has no verification requirements.`),
    warnings: queue.items.length ? [] : ["No stabilization queue items are present; verification plan is empty."],
    manualOnly: true,
    inMemoryOnly: true,
    noPublicUrlsFetchedAutomatically: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
