import { getCoreTeoyubeVocabulary, getPromiseClustersData, getScriptureCanonData } from "../data/teoyube-data-access";
import { createPhase3IntegrationReadinessReport } from "../qa/phase-3-integration-readiness-checklist";
import { createPromiseTableUxReport } from "./promise-table-ux-view-model";
import { createTigGraphExperienceReport } from "./tig-graph-experience-view-model";
import { createReviewedContentIntegrationGateReport } from "./reviewed-content-integration-gate";
import { createReviewedContentReleaseCandidateReport } from "./reviewed-content-release-candidate-builder";
import { createControlledAdminWorkspaceReport } from "./controlled-admin-workspace";
import { createPhase41Package, createPhase41PackageReport } from "./phase-4-1-package";
import { createPhase42Package, createPhase42PackageReport } from "./phase-4-2-package";
import { createPhase43Package, createPhase43PackageReport } from "./phase-4-3-package";
import { createPhase44Package, createPhase44PackageReport } from "./phase-4-4-package";
import { createPhase45Package, createPhase45PackageReport } from "./phase-4-5-package";
import type {
  TeoyubeBetaReadinessNextAction,
  TeoyubeBetaReadinessReviewBlocker,
  TeoyubeBetaReadinessReviewCheck,
  TeoyubeBetaReadinessReviewDecision,
  TeoyubeBetaReadinessReviewReport,
  TeoyubeBetaReadinessReviewRisk,
  TeoyubeBetaReadinessReviewStatus,
  TeoyubeBetaReadinessReviewWarning
} from "./beta-readiness-review-contracts";

function blocker(id: string, area: TeoyubeBetaReadinessReviewCheck["area"], message: string, requiredAction: string): TeoyubeBetaReadinessReviewBlocker {
  return { id, area, message, requiredAction };
}

function warning(id: string, area: TeoyubeBetaReadinessReviewCheck["area"], message: string, recommendedAction: string): TeoyubeBetaReadinessReviewWarning {
  return { id, area, message, recommendedAction };
}

function check(
  id: string,
  area: TeoyubeBetaReadinessReviewCheck["area"],
  label: string,
  passed: boolean,
  details: string,
  warnings: TeoyubeBetaReadinessReviewWarning[] = []
): TeoyubeBetaReadinessReviewCheck {
  return {
    id,
    area,
    label,
    status: passed ? (warnings.length ? "ready_with_warnings" : "ready") : "blocked",
    passed,
    details,
    blockers: passed ? [] : [blocker(`${id}_blocker`, area, `${label} is not beta-ready.`, "Resolve this blocker before controlled beta preparation.")],
    warnings
  };
}

export function createBetaReadinessReviewChecklist(): TeoyubeBetaReadinessReviewCheck[] {
  const phase41 = createPhase41PackageReport(createPhase41Package());
  const phase42 = createPhase42PackageReport(createPhase42Package());
  const phase43 = createPhase43PackageReport(createPhase43Package());
  const phase44 = createPhase44PackageReport(createPhase44Package());
  const phase45 = createPhase45PackageReport(createPhase45Package());
  const vocabulary = getCoreTeoyubeVocabulary();
  const promises = getPromiseClustersData();
  const canon = getScriptureCanonData();
  const journey = createPhase3IntegrationReadinessReport();
  const gate = createReviewedContentIntegrationGateReport();
  const candidates = createReviewedContentReleaseCandidateReport();
  const promiseTable = createPromiseTableUxReport();
  const tigGraph = createTigGraphExperienceReport();
  const adminWorkspace = createControlledAdminWorkspaceReport();

  return [
    check("phase_4_1_complete", "real_data_flow", "Phase 4.1 audit/package complete", phase41.valid, `Phase 4.1 decision: ${phase41.decision}.`),
    check("phase_4_2_complete", "controlled_admin_prototype", "Phase 4.2 polish/content/admin design complete", phase42.valid, `Phase 4.2 decision: ${phase42.decision}.`),
    check("phase_4_3_complete", "reviewed_content_gate", "Phase 4.3 review queue and draft safety complete", phase43.valid, `Phase 4.3 decision: ${phase43.decision}.`),
    check("phase_4_4_complete", "promise_table", "Phase 4.4 reviewed content gates and UX models complete", phase44.valid, `Phase 4.4 decision: ${phase44.decision}.`),
    check("phase_4_5_complete", "controlled_admin_prototype", "Phase 4.5 admin prototype and beta QA plan complete", phase45.valid, `Phase 4.5 decision: ${phase45.decision}.`),
    check("real_data_loads", "real_data_flow", "Real data still loads", vocabulary.length > 0 && promises.length > 0 && canon.length > 0, `${vocabulary.length} words, ${promises.length} promise clusters, and ${canon.length} canon entries are available.`),
    check("user_journey_stable", "user_journey", "User journey readiness remains stable", journey.valid, `${journey.checklist.length} user journey readiness check(s) available.`),
    check("reviewed_content_gate_blocks_drafts", "reviewed_content_gate", "Reviewed content gates block unreviewed drafts", gate.valid && gate.reviewOnlyDraftsBlocked, `${gate.eligibleItems.length} eligible reviewed item(s), ${gate.blockedItems.length} blocked item(s).`),
    check("release_candidates_manual_only", "reviewed_content_gate", "Release candidates are not automatically published", candidates.valid && candidates.candidates.every((candidate) => !candidate.autoPublished && !candidate.addedToLiveRecommendations), `${candidates.releaseCandidates.length} manual release candidate(s).`),
    check("promise_table_real_rows", "promise_table", "Promise Table uses real reviewed/production-safe data only", promiseTable.valid && promiseTable.generatedFromRealRows && promiseTable.noDraftContentIncluded, `${promiseTable.rows.length} Promise Table UX row(s).`),
    check("tig_graph_safe", "tig_graph_explorer", "TIG Graph handles incomplete data safely", tigGraph.valid && tigGraph.mobileFallbackAvailable && tigGraph.noRawDebugPayload, `TIG Graph status: ${tigGraph.status}.`),
    check("scripture_anchors_visible", "scripture_anchor", "Scripture anchors remain visible", promiseTable.scriptureAnchorsVisible && tigGraph.scriptureAnchorsVisible, "Promise Table and TIG Graph reports keep Scripture anchor visibility flags."),
    check("explanation_traces_visible", "explanation_trace", "Explanation traces remain visible", promiseTable.viewModel.explanationHintsVisible && tigGraph.explanationTraceVisible, "Promise Table explanation hints and TIG graph trace overlay remain available."),
    check("confidence_labels_visible", "confidence_label", "Confidence labels remain visible", tigGraph.viewModel.nodes.every((node) => Boolean(node.confidenceLabel)) && tigGraph.viewModel.edges.every((edge) => Boolean(edge.confidenceLabel)), "TIG graph nodes and edges expose confidence labels."),
    check("fallback_safe", "fallback", "Fallback states remain safe", Boolean(promiseTable.viewModel.emptyState) && Boolean(tigGraph.viewModel.emptyState), "Promise Table and TIG Graph expose safe empty/fallback states."),
    check("admin_prototype_in_memory", "controlled_admin_prototype", "Controlled admin prototype remains in-memory only", adminWorkspace.valid && adminWorkspace.inMemoryOnly && adminWorkspace.noAutomaticPublishing, `${adminWorkspace.reviewItemCount} admin review item(s) prepared.`),
    check("services_disabled", "service_disabled_state", "Service-disabled states are explicit", phase45.noDatabasePersistenceEnabled && phase45.noAnalyticsEnabled && phase45.noLiveAiOrchestrationEnabled && phase45.noAdminAuthAdded && phase45.noCmsConnected, "Phase 4.5 package keeps database, analytics, live AI, admin auth, and CMS disabled."),
    check(
      "manual_mobile_accessibility",
      "mobile",
      "Manual mobile and accessibility checks remain planned",
      true,
      "Manual beta QA execution remains required before inviting beta participants.",
      [
        warning("manual_mobile_required", "mobile", "Manual mobile QA still needs execution in Phase 5.1.", "Carry this into controlled beta preparation."),
        warning("manual_accessibility_required", "accessibility", "Manual accessibility QA still needs execution in Phase 5.1.", "Carry this into controlled beta preparation.")
      ]
    )
  ];
}

export function runBetaReadinessReview(input: {
  checks?: TeoyubeBetaReadinessReviewCheck[];
} = {}): TeoyubeBetaReadinessReviewCheck[] {
  return input.checks || createBetaReadinessReviewChecklist();
}

export function getBetaReadinessReviewBlockers(input: {
  checks?: TeoyubeBetaReadinessReviewCheck[];
} = {}): TeoyubeBetaReadinessReviewBlocker[] {
  return runBetaReadinessReview(input).flatMap((entry) => entry.blockers);
}

export function getBetaReadinessReviewWarnings(input: {
  checks?: TeoyubeBetaReadinessReviewCheck[];
} = {}): TeoyubeBetaReadinessReviewWarning[] {
  return runBetaReadinessReview(input).flatMap((entry) => entry.warnings);
}

export function createBetaReadinessReviewDecision(input: {
  checks?: TeoyubeBetaReadinessReviewCheck[];
} = {}): TeoyubeBetaReadinessReviewDecision {
  const checks = runBetaReadinessReview(input);
  const blockers = checks.flatMap((entry) => entry.blockers);
  const warnings = checks.flatMap((entry) => entry.warnings);
  if (blockers.length) return "blocked";
  if (checks.some((entry) => entry.area === "reviewed_content_gate" && !entry.passed)) return "needs_content_review";
  if (checks.some((entry) => entry.area === "service_disabled_state" && !entry.passed)) return "needs_service_lock_review";
  if (checks.some((entry) => ["word_card", "promise_table", "tig_graph_explorer", "tig_response_panel"].includes(entry.area) && !entry.passed)) return "needs_ui_fix";
  return warnings.length ? "ready_with_warnings" : "ready_for_controlled_beta_preparation";
}

export function createBetaReadinessReviewReport(input: {
  checks?: TeoyubeBetaReadinessReviewCheck[];
  risks?: TeoyubeBetaReadinessReviewRisk[];
} = {}): TeoyubeBetaReadinessReviewReport {
  const checks = runBetaReadinessReview(input);
  const blockers = checks.flatMap((entry) => entry.blockers);
  const warnings = checks.flatMap((entry) => entry.warnings);
  const decision = createBetaReadinessReviewDecision({ checks });
  const status: TeoyubeBetaReadinessReviewStatus = blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready";
  const nextAction: TeoyubeBetaReadinessNextAction = blockers.length
    ? "Resolve blockers before Phase 5"
    : "Phase 5.1 - Controlled Beta Preparation, Manual QA Execution Plan & Service Gate Review";

  return {
    valid: blockers.length === 0,
    decision,
    status,
    checks,
    blockers,
    warnings,
    risks: input.risks || [
      {
        id: "manual_beta_qa_execution",
        area: "mobile",
        severity: "medium",
        status: "accepted",
        message: "Manual beta QA execution still needs real-device and accessibility review.",
        mitigation: "Carry this into Phase 5.1 manual QA execution planning."
      }
    ],
    nextAction,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    reviewOnlyContentNotPublished: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
