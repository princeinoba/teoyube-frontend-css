import { createContentReviewFollowUpReport } from "./content-review-follow-up-plan";
import { createControlledServiceReassessmentReport } from "./controlled-service-reassessment-gate";
import { createMobileAccessibilityHardeningReport } from "./mobile-accessibility-hardening-plan";
import { createPerformanceHardeningReport } from "./performance-hardening-plan";
import { createPrivacySecurityFollowUpReport } from "./privacy-security-follow-up-plan";
import { createProductHardeningPlan, createProductHardeningPlanReport } from "./product-hardening-plan";
import type {
  TeoyubePublicReleasePreparationBlocker,
  TeoyubePublicReleasePreparationCheck,
  TeoyubePublicReleasePreparationDecision,
  TeoyubePublicReleasePreparationReport,
  TeoyubePublicReleasePreparationWarning
} from "./public-release-preparation-plan-contracts";

export type TeoyubePublicReleasePreparationPlanInput = Partial<{
  publicReleaseLaunched: boolean;
  usersContacted: boolean;
  ownerApproved: boolean;
  externalServicesRequired: boolean;
}>;

function check(id: string, area: TeoyubePublicReleasePreparationCheck["area"], label: string, passed: boolean, details: string): TeoyubePublicReleasePreparationCheck {
  return { id, area, label, passed, details };
}

export function getPublicReleasePreparationChecklist(input: TeoyubePublicReleasePreparationPlanInput = {}): TeoyubePublicReleasePreparationCheck[] {
  const hardening = createProductHardeningPlanReport(createProductHardeningPlan());
  const content = createContentReviewFollowUpReport();
  const privacy = createPrivacySecurityFollowUpReport();
  const service = createControlledServiceReassessmentReport();
  const mobile = createMobileAccessibilityHardeningReport();
  const performance = createPerformanceHardeningReport();
  return [
    check("no_public_release", "operational_readiness", "No public release is launched by code", !input.publicReleaseLaunched, "Phase 8.1 prepares future public-release planning only."),
    check("product_hardening_plan_exists", "product_hardening", "Product hardening plan exists", hardening.valid, `${hardening.plan.items.length} product hardening item(s) represented.`),
    check("content_review_follow_up_exists", "content_review", "Content review follow-up exists", content.valid, `${content.items.length} content review item(s) represented.`),
    check("privacy_security_follow_up_exists", "privacy_security", "Privacy/security follow-up exists", privacy.valid, `${privacy.checklist.length} privacy/security item(s) represented.`),
    check("service_reassessment_disabled_plan_only", "service_reassessment", "Service reassessment remains disabled/plan-only", service.valid && service.noExternalServicesRequired, "No service is connected by reassessment."),
    check("mobile_accessibility_plan_exists", "mobile_accessibility", "Mobile/accessibility hardening plan exists", mobile.valid, `${mobile.items.length} mobile/accessibility item(s) represented.`),
    check("performance_plan_exists", "performance", "Performance hardening plan exists", performance.valid, `${performance.items.length} performance item(s) represented.`),
    check("known_limitations_available", "known_limitations", "Known limitations remain available", true, "Phase 7 known limitations remain available for Phase 8 planning."),
    check("owner_approval_required", "owner_approval", "Owner approval is required", input.ownerApproved === true || input.ownerApproved === undefined, "Owner approval remains required before future release decisions."),
    check("support_workflow_manual", "support_workflow", "Support workflow remains manual", !input.usersContacted, "No automatic support contact is performed."),
    check("no_external_services_required", "service_reassessment", "No external services are required", !input.externalServicesRequired, "No external service is required for public release planning.")
  ];
}

export function createPublicReleasePreparationPlan(input: TeoyubePublicReleasePreparationPlanInput = {}): TeoyubePublicReleasePreparationCheck[] {
  return getPublicReleasePreparationChecklist(input);
}

export function getPublicReleasePreparationBlockers(input: TeoyubePublicReleasePreparationPlanInput = {}): TeoyubePublicReleasePreparationBlocker[] {
  return getPublicReleasePreparationChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: `${entry.label} is incomplete.`, requiredAction: "Resolve before future public release planning can continue." }));
}

export function getPublicReleasePreparationWarnings(input: TeoyubePublicReleasePreparationPlanInput = {}): TeoyubePublicReleasePreparationWarning[] {
  return [
    { id: "public_release_planning_only", area: "operational_readiness", message: "Phase 8.1 prepares future public release planning only.", recommendedAction: "Do not launch publicly from this step." },
    ...(input.ownerApproved ? [] : [{ id: "owner_approval_required", area: "owner_approval" as const, message: "Owner approval remains required before public release decisions.", recommendedAction: "Carry into Phase 8.2 and later release gates." }])
  ];
}

export function createPublicReleasePreparationDecision(input: TeoyubePublicReleasePreparationPlanInput = {}): TeoyubePublicReleasePreparationDecision {
  const blockers = getPublicReleasePreparationBlockers(input);
  const warnings = getPublicReleasePreparationWarnings(input);
  if (blockers.length) return "blocked";
  if (!input.ownerApproved) return "needs_owner_review";
  return warnings.length ? "public_release_planning_ready_with_warnings" : "public_release_planning_ready";
}

export function createPublicReleasePreparationReport(input: TeoyubePublicReleasePreparationPlanInput = {}): TeoyubePublicReleasePreparationReport {
  const blockers = getPublicReleasePreparationBlockers(input);
  const warnings = getPublicReleasePreparationWarnings(input);
  const decision = createPublicReleasePreparationDecision(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "planned",
    decision,
    checks: getPublicReleasePreparationChecklist(input),
    blockers,
    warnings,
    noPublicReleaseLaunched: true,
    noUsersContacted: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
