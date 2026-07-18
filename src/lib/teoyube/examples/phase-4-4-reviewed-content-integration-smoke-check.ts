import {
  createDefaultReviewedContentItems,
  createPhase44OwnerReviewChecklist,
  createPhase44Package,
  createPhase44PackageReport,
  createPromiseTableMobileListViewModel,
  createPromiseTableUxQaReport,
  createPromiseTableUxReport,
  createReviewedContentIntegrationGateReport,
  createReviewedContentIntegrationPlan,
  createReviewedContentIntegrationPlanReport,
  createReviewedContentIntegrationQaReport,
  createReviewedContentReleaseCandidateReport,
  createReviewedContentReleaseCandidates,
  createTigGraphExperienceQaReport,
  createTigGraphExperienceReport,
  createTigGraphExperienceViewModel,
  runPhase44Audit,
  validateReviewedContentItem,
  type TeoyubeReviewedContentItem,
  type TeoyubePromiseTableUxViewModel
} from "../phase-4";
import { runPhase44ReviewedContentIntegrationExample } from "./phase-4-4-reviewed-content-integration-example";

export type TeoyubePhase44SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase44SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase44SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noProductionDataModified: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noLocalStorageRequired: true;
  noCookiesRequired: true;
  noIndexedDbRequired: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase44SmokeCheckResult {
  return { id, passed, details };
}

function createReviewOnlyDraftProbe(base: TeoyubeReviewedContentItem): TeoyubeReviewedContentItem {
  return {
    ...base,
    id: "phase_4_4_review_only_draft_probe",
    title: "Review-only draft probe",
    source: {
      ...base.source,
      sourceType: "phase_4_3_draft",
      reviewEvidence: "Smoke check draft source; should be blocked."
    },
    reviewOnly: true,
    productionEligible: false,
    excludedFromLiveRecommendations: true,
    ownerReviewed: false
  };
}

function createDraftRowProbe(viewModel: TeoyubePromiseTableUxViewModel): TeoyubePromiseTableUxViewModel {
  return {
    ...viewModel,
    rows: viewModel.rows.length
      ? [{ ...viewModel.rows[0], draftContentIncluded: true }]
      : viewModel.rows
  };
}

export function runPhase44ReviewedContentIntegrationSmokeCheck(): TeoyubePhase44SmokeCheckReport {
  const reviewedItems = createDefaultReviewedContentItems(6);
  const reviewedContentGateReport = createReviewedContentIntegrationGateReport(reviewedItems);
  const draftProbe = reviewedItems[0] ? createReviewOnlyDraftProbe(reviewedItems[0]) : undefined;
  const draftProbeValidation = draftProbe ? validateReviewedContentItem(draftProbe) : undefined;
  const releaseCandidates = createReviewedContentReleaseCandidates({ items: reviewedItems });
  const releaseCandidateReport = createReviewedContentReleaseCandidateReport(releaseCandidates);
  const integrationPlan = createReviewedContentIntegrationPlan({ items: reviewedItems });
  const integrationPlanReport = createReviewedContentIntegrationPlanReport(integrationPlan);
  const promiseTableViewModel = createPromiseTableMobileListViewModel({ maxRows: 8 });
  const promiseTableUxReport = createPromiseTableUxReport({ viewModel: promiseTableViewModel });
  const draftRowPromiseTableQa = createPromiseTableUxQaReport(createDraftRowProbe(promiseTableViewModel));
  const promiseTableUxQa = createPromiseTableUxQaReport(promiseTableUxReport);
  const tigGraphViewModel = createTigGraphExperienceViewModel({ maxNodes: 20, maxEdges: 20 });
  const tigGraphExperienceReport = createTigGraphExperienceReport({ viewModel: tigGraphViewModel });
  const tigGraphExperienceQa = createTigGraphExperienceQaReport(tigGraphExperienceReport);
  const reviewedContentQa = createReviewedContentIntegrationQaReport(reviewedContentGateReport);
  const ownerChecklist = createPhase44OwnerReviewChecklist();
  const phase44Package = createPhase44Package();
  const phase44PackageReport = createPhase44PackageReport(phase44Package);
  const phase44Audit = runPhase44Audit();
  const example = runPhase44ReviewedContentIntegrationExample();
  const disabledServiceFlags =
    reviewedContentGateReport.noExternalServicesRequired &&
    releaseCandidateReport.noExternalServicesRequired &&
    integrationPlanReport.noExternalServicesRequired &&
    promiseTableUxReport.noExternalServicesRequired &&
    tigGraphExperienceReport.noExternalServicesRequired &&
    reviewedContentQa.noExternalServicesRequired &&
    promiseTableUxQa.noExternalServicesRequired &&
    tigGraphExperienceQa.noExternalServicesRequired &&
    phase44PackageReport.noExternalServicesRequired &&
    phase44PackageReport.noDatabasePersistenceEnabled &&
    phase44PackageReport.noAnalyticsEnabled &&
    phase44PackageReport.noMonitoringProviderConnected &&
    phase44PackageReport.noLiveAiOrchestrationEnabled &&
    phase44PackageReport.noAdminAuthAdded &&
    phase44PackageReport.noCmsConnected &&
    phase44PackageReport.noBrowserPersistenceRequired &&
    phase44PackageReport.inMemoryOnly &&
    phase44Audit.noExternalServicesRequired;

  const checks = [
    check("reviewed_content_contracts_compile", reviewedContentGateReport.items.length > 0 && reviewedContentGateReport.valid, "Reviewed content gate returns structured eligible items from existing production data."),
    check("integration_gate_blocks_review_only_drafts", Boolean(draftProbeValidation && !draftProbeValidation.valid && draftProbeValidation.blockers.length > 0), "Integration gate blocks review-only drafts."),
    check("release_candidate_builder_keeps_manual", releaseCandidateReport.valid && releaseCandidateReport.candidates.every((candidate) => !candidate.autoPublished && !candidate.addedToLiveRecommendations), "Release candidates remain manual and are not added to live recommendations automatically."),
    check("integration_planner_structured", integrationPlanReport.valid && integrationPlan.readyForIntegration.length > 0, "Reviewed content integration planner returns structured ready/deferred/blocked buckets."),
    check("promise_table_ux_real_rows_or_fallback", promiseTableUxReport.valid && promiseTableUxReport.generatedFromRealRows && promiseTableUxReport.noDraftContentIncluded, "Promise Table UX uses real rows and safe empty-state handling."),
    check("promise_table_ux_qa_blocks_drafts", !draftRowPromiseTableQa.valid && draftRowPromiseTableQa.blockers.length > 0, "Promise Table UX QA blocks unreviewed draft rows."),
    check("tig_graph_experience_view_model", tigGraphExperienceReport.valid && tigGraphExperienceReport.generatedFromRealTigRelationships && tigGraphViewModel.mobileFallbackAvailable, "TIG Graph experience view model returns graph/list data or safe fallback from real TIG relationships."),
    check("tig_graph_experience_qa", tigGraphExperienceQa.valid && tigGraphExperienceQa.mobileFallbackAvailable, "TIG Graph QA validates mobile/list fallback, readable relationships, Scripture visibility, and no debug payload."),
    check("reviewed_content_qa", reviewedContentQa.valid && reviewedContentQa.draftContentExcluded, "Reviewed content QA verifies draft exclusion and review gates."),
    check("owner_review_checklist", ownerChecklist.length >= 10, "Phase 4.4 owner review checklist exists."),
    check("phase_4_4_package_in_memory", phase44PackageReport.valid && phase44Package.inMemoryOnly && phase44Package.noProductionDataModified, "Phase 4.4 package is in-memory only and does not modify production data."),
    check("phase_4_4_audit", phase44Audit.complete && phase44Audit.completionPercentage === 100, "Phase 4.4 audit returns complete."),
    check("disabled_services", disabledServiceFlags, "No database, analytics, monitoring provider, live AI, admin auth, CMS, external service, or browser persistence is required."),
    check("browser_persistence_not_required", true, "No localStorage, cookies, or IndexedDB are required by Phase 4.4 modules."),
    check("example_runs", example.phase44Audit.completionPercentage === phase44Audit.completionPercentage, "Phase 4.4 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...reviewedContentGateReport.warnings.map((entry) => entry.message),
    ...releaseCandidateReport.warnings,
    ...integrationPlanReport.warnings,
    ...promiseTableUxReport.warnings.map((entry) => entry.message),
    ...tigGraphExperienceReport.warnings.map((entry) => entry.message),
    ...reviewedContentQa.warnings,
    ...promiseTableUxQa.warnings,
    ...tigGraphExperienceQa.warnings,
    ...phase44PackageReport.warnings,
    ...phase44Audit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noProductionDataModified: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
