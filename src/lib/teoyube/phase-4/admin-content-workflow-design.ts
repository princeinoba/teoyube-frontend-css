import type {
  TeoyubeAdminContentReviewState,
  TeoyubeAdminContentRole,
  TeoyubeAdminContentWorkflowReport,
  TeoyubeAdminContentWorkflowStep
} from "./admin-content-workflow-contracts";

function step(
  id: string,
  label: string,
  fromState: TeoyubeAdminContentWorkflowStep["fromState"],
  toState: TeoyubeAdminContentWorkflowStep["toState"],
  action: TeoyubeAdminContentWorkflowStep["action"],
  role: TeoyubeAdminContentWorkflowStep["role"],
  notes: string
): TeoyubeAdminContentWorkflowStep {
  return { id, label, fromState, toState, action, role, required: true, notes };
}

export function getAdminContentWorkflowSteps(): TeoyubeAdminContentWorkflowStep[] {
  return [
    step("create_draft", "Create draft", "draft", "scripture_review", "request_scripture_review", "content_reviewer", "Draft content is created outside production flows."),
    step("scripture_review", "Scripture review", "scripture_review", "theology_review", "request_theology_review", "scripture_reviewer", "Scripture anchors are verified before interpretation/copy review."),
    step("theology_review", "Theology review", "theology_review", "copy_review", "request_copy_review", "theology_reviewer", "Devotional boundaries, humility, and safety language are reviewed."),
    step("copy_review", "Copy review", "copy_review", "owner_review", "request_owner_review", "content_reviewer", "Surface copy, fallback copy, confidence labels, and explanation labels are reviewed."),
    step("owner_review", "Owner review", "owner_review", "approved_for_future_release", "approve_for_future_release", "owner", "Owner approves content for a future release package, not immediate external publishing."),
    step("block_content", "Block content", "owner_review", "blocked", "block", "owner", "Unsafe, unsupported, or unclear content is blocked."),
    step("archive_content", "Archive content", "blocked", "archived", "archive", "owner", "Blocked content can be archived for traceability in a future service design."),
    step("rollback_concept", "Rollback concept", "approved_for_future_release", "draft", "rollback", "developer", "Future implementation should support rollback to a prior approved content version.")
  ];
}

export function getAdminContentReviewStates(): TeoyubeAdminContentReviewState[] {
  return ["draft", "scripture_review", "theology_review", "copy_review", "owner_review", "approved_for_future_release", "blocked", "archived", "unknown"];
}

export function getAdminContentRoles(): TeoyubeAdminContentRole[] {
  return ["owner", "content_reviewer", "scripture_reviewer", "theology_reviewer", "developer", "unknown"];
}

export function getAdminContentApprovalRules(): string[] {
  return [
    "No content can move to future release without Scripture review where Scripture anchors are used.",
    "No Promise Cluster can move to future release without promise interpretation and theology review.",
    "No prayer or calling content can move to future release without devotional boundary review.",
    "Owner review is required before future release packaging.",
    "Future CMS implementation must include change log and rollback concepts before launch."
  ];
}

export function getAdminContentSafetyRules(): string[] {
  return [
    "Do not invent unsupported Scripture anchors.",
    "Do not create unsupported promise claims.",
    "Do not claim divine certainty.",
    "Do not create medical, legal, financial, or emergency advice.",
    "Do not remove fallback safety, explanation paths, Scripture anchors, confidence labels, consent notices, or privacy notices.",
    "Do not connect admin auth, CMS, database persistence, audit logging, analytics, monitoring, or live AI in Phase 4.2."
  ];
}

export function createAdminContentWorkflowDesign() {
  return {
    id: "phase_4_2_admin_content_workflow_design",
    steps: getAdminContentWorkflowSteps(),
    reviewStates: getAdminContentReviewStates(),
    roles: getAdminContentRoles(),
    approvalRules: getAdminContentApprovalRules(),
    safetyRules: getAdminContentSafetyRules(),
    changeLogConcept: "Future implementation should record who proposed, reviewed, approved, blocked, archived, or rolled back content without exposing secrets or sensitive user input.",
    rollbackConcept: "Future implementation should allow approved content to return to a prior reviewed version if a safety or content issue is found.",
    futureCmsRequirements: [
      "Owner-approved provider selection.",
      "Role-based access control.",
      "Draft/review/approval workflow.",
      "Audit log and rollback design.",
      "Privacy and security review before implementation."
    ],
    noAdminUiBuilt: true as const,
    noAdminAuthAdded: true as const,
    noDatabasePersistenceEnabled: true as const,
    noCmsConnected: true as const,
    inMemoryOnly: true as const
  };
}

export function createAdminContentWorkflowDesignReport(): TeoyubeAdminContentWorkflowReport {
  const design = createAdminContentWorkflowDesign();
  const blockers = design.steps.length === 0
    ? [{ id: "admin_workflow_steps_missing", message: "Admin workflow steps are missing.", requiredAction: "Add design-only workflow steps." }]
    : [];
  const warnings = [
    {
      id: "future_implementation_requires_reviews",
      message: "Admin workflow remains design-only; future CMS/auth/database work requires owner, privacy, and security review.",
      recommendedAction: "Carry service requirements into Phase 4.3+ planning without connecting services now."
    }
  ];

  return {
    valid: blockers.length === 0,
    status: "design_only",
    steps: design.steps,
    reviewStates: design.reviewStates,
    roles: design.roles,
    approvalRules: design.approvalRules,
    safetyRules: design.safetyRules,
    blockers,
    warnings,
    noAdminUiBuilt: true,
    noAdminAuthAdded: true,
    noDatabasePersistenceEnabled: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
