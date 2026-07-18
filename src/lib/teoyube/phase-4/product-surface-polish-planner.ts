import type { TeoyubeUserJourneyInput } from "../journey/user-journey-contracts";
import { createProductExperienceAuditReport } from "./product-experience-audit";
import { createProductSurfaceDepthReport } from "./product-surface-depth-audit";
import type {
  TeoyubeProductSurfacePolishCheck,
  TeoyubeProductSurfacePolishDecision,
  TeoyubeProductSurfacePolishIssue,
  TeoyubeProductSurfacePolishPatch,
  TeoyubeProductSurfacePolishReport,
  TeoyubeProductSurfacePolishSurface
} from "./product-surface-polish-contracts";
import {
  createProductSurfacePolishBlocker,
  createProductSurfacePolishWarning
} from "./product-surface-polish-contracts";

export type TeoyubeProductSurfacePolishPlan = {
  id: string;
  checks: TeoyubeProductSurfacePolishCheck[];
  issues: TeoyubeProductSurfacePolishIssue[];
  safePatches: TeoyubeProductSurfacePolishPatch[];
  deferredItems: TeoyubeProductSurfacePolishIssue[];
  blockedItems: TeoyubeProductSurfacePolishIssue[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function issue(
  id: string,
  surface: TeoyubeProductSurfacePolishSurface,
  status: TeoyubeProductSurfacePolishIssue["status"],
  summary: string,
  source: string,
  safetyReason: string,
  blockedBy: string[] = []
): TeoyubeProductSurfacePolishIssue {
  return { id, surface, status, summary, source, safetyReason, blockedBy };
}

function patch(
  id: string,
  surface: TeoyubeProductSurfacePolishSurface,
  filePath: string,
  description: string,
  regressionCheck: string
): TeoyubeProductSurfacePolishPatch {
  return {
    id,
    surface,
    filePath,
    description,
    applied: true,
    safetyReason: "Copy, wrapping, labels, or debug visibility only; no engine logic, Scripture anchors, explanation paths, fallback safety, confidence labels, consent/privacy notices, or TIG graph logic are changed.",
    regressionCheck
  };
}

function check(
  id: string,
  surface: TeoyubeProductSurfacePolishSurface,
  label: string,
  issues: TeoyubeProductSurfacePolishIssue[]
): TeoyubeProductSurfacePolishCheck {
  const blockers = issues
    .filter((entry) => entry.status === "blocked")
    .map((entry) => createProductSurfacePolishBlocker(entry.id, entry.surface, entry.summary));
  const warnings = issues
    .filter((entry) => entry.status !== "safe_local_patch" && entry.status !== "complete")
    .map((entry) => createProductSurfacePolishWarning(entry.id, entry.surface, entry.summary));

  return {
    id,
    surface,
    label,
    status: blockers.length ? "blocked" : warnings.length ? "backlog_item" : "complete",
    passed: blockers.length === 0,
    details: `${label} has ${issues.length} polish item(s), ${warnings.length} deferred warning(s), and ${blockers.length} blocker(s).`,
    issues,
    blockers,
    warnings
  };
}

function mapPhase4AreaToSurface(area: string): TeoyubeProductSurfacePolishSurface {
  if (area === "word_card") return "word_card";
  if (area === "promise_table" || area === "promise_cluster" || area === "promise_clusters") return "promise_table";
  if (area === "prayer_companion") return "prayer_companion";
  if (area === "calling_compass") return "compass_experience";
  if (area === "tig_response_panel") return "tig_response_panel";
  if (area === "tig_graph_explorer" || area === "tig_graph") return "tig_graph_explorer";
  if (area === "canon") return "canon";
  if (area === "daily_word") return "daily_word";
  if (area === "privacy") return "privacy_notice";
  return "unknown";
}

export function createProductSurfacePolishPlan(input: TeoyubeUserJourneyInput = {}): TeoyubeProductSurfacePolishPlan {
  const productAudit = createProductExperienceAuditReport(input);
  const surfaceAudit = createProductSurfaceDepthReport(input);
  const auditIssues = [...productAudit.warnings, ...surfaceAudit.warnings].map((warning) =>
    issue(
      `audit_${warning.id}`,
      mapPhase4AreaToSurface(warning.area),
      "backlog_item",
      warning.message,
      "Phase 4.1 product and surface depth audits",
      "Deferred polish only; no safety-critical behavior is changed."
    )
  );
  const blockerIssues = [...productAudit.blockers, ...surfaceAudit.blockers].map((blocker) =>
    issue(
      `blocker_${blocker.id}`,
      mapPhase4AreaToSurface(blocker.area),
      "blocked",
      blocker.message,
      "Phase 4.1 product and surface depth audits",
      "Blockers preserve Scripture anchors, explanation paths, fallback state, confidence labels, and journey payload integrity.",
      [blocker.requiredAction]
    )
  );
  const safeIssues = [
    issue("wordcard_scripture_anchor_label", "word_card", "safe_local_patch", "Clarify WordCard Scripture labels and wrapping.", "Phase 4.2 UI polish scan", "Text/spacing patch only."),
    issue("promise_table_readability", "promise_table", "safe_local_patch", "Improve Promise Table preview empty state, Scripture anchor label, and validation copy.", "Phase 4.2 UI polish scan", "Text/wrapping patch only."),
    issue("tig_graph_raw_json_disclosure", "tig_graph_explorer", "safe_local_patch", "Hide selected-node raw JSON behind a technical details disclosure.", "Phase 4.2 UI polish scan", "Debug visibility patch only; graph logic remains unchanged."),
    issue("tig_graph_fallback_list_clarity", "tig_graph_explorer", "safe_local_patch", "Clarify graph list fallback messaging for normal users.", "Phase 4.1 graph UX gap", "Copy-only patch.")
  ];
  const deferredIssues = [
    issue("manual_mobile_review", "fallback_state", "owner_review_required", "Run manual mobile review over card, table, graph fallback, trace, and fallback states.", "Phase 4.1 risk register", "Manual review cannot be automated in this local planning step."),
    issue("manual_accessibility_review", "consent_controls", "owner_review_required", "Run keyboard, focus, screen-reader, label, heading, contrast, and wrapping review.", "Phase 4.1 risk register", "Manual review should happen before future public beta expansion.")
  ];
  const issues = [...safeIssues, ...auditIssues, ...deferredIssues, ...blockerIssues];
  const safePatches = [
    patch("wordcard_scripture_anchor_label_patch", "word_card", "teoyube-app/components/WordCard.tsx", "Clarified Scripture anchor label and added break-word wrapping for long references.", "Verify WordCard still shows Scripture anchors, related Promise Clusters, explanation path, and missing-anchor fallback."),
    patch("promise_table_preview_readability_patch", "promise_table", "src/components/teoyube/PromiseTablePreview.tsx", "Clarified Promise Table Scripture anchor and validation labels, added wrapping, and improved empty state copy.", "Verify Promise Table filters by theme, word, and Scripture and still flags missing anchors."),
    patch("tig_graph_raw_json_details_patch", "tig_graph_explorer", "teoyube-app/src/components/tig/TIGGraphExplorer.tsx", "Moved raw selected-node JSON behind a technical details disclosure and clarified list fallback copy.", "Verify graph map, node selection, relationship list, Scripture references, and list fallback remain visible.")
  ];

  return {
    id: "phase_4_2_product_surface_polish_plan",
    checks: [
      check("word_card_polish", "word_card", "WordCard polish", issues.filter((entry) => entry.surface === "word_card")),
      check("promise_table_polish", "promise_table", "Promise Table polish", issues.filter((entry) => entry.surface === "promise_table")),
      check("prayer_companion_polish", "prayer_companion", "PrayerCompanion polish", issues.filter((entry) => entry.surface === "prayer_companion")),
      check("compass_experience_polish", "compass_experience", "CompassExperience polish", issues.filter((entry) => entry.surface === "compass_experience")),
      check("tig_response_panel_polish", "tig_response_panel", "TIGResponsePanel polish", issues.filter((entry) => entry.surface === "tig_response_panel")),
      check("tig_graph_explorer_polish", "tig_graph_explorer", "TIGGraphExplorer polish", issues.filter((entry) => entry.surface === "tig_graph_explorer")),
      check("canon_daily_word_polish", "canon", "Canon and Daily Word polish", issues.filter((entry) => entry.surface === "canon" || entry.surface === "daily_word")),
      check("fallback_privacy_consent_polish", "fallback_state", "Fallback, privacy, and consent polish", issues.filter((entry) => entry.surface === "fallback_state" || entry.surface === "privacy_notice" || entry.surface === "consent_controls"))
    ],
    issues,
    safePatches,
    deferredItems: issues.filter((entry) => entry.status === "owner_review_required" || entry.status === "backlog_item"),
    blockedItems: issues.filter((entry) => entry.status === "blocked"),
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

export function getProductSurfacePolishChecklist(): TeoyubeProductSurfacePolishCheck[] {
  return createProductSurfacePolishPlan().checks;
}

export function getProductSurfacePolishIssuesBySurface(
  surface: TeoyubeProductSurfacePolishSurface
): TeoyubeProductSurfacePolishIssue[] {
  return createProductSurfacePolishPlan().issues.filter((entry) => entry.surface === surface);
}

export function getSafeProductSurfacePolishPatches(
  plan: TeoyubeProductSurfacePolishPlan = createProductSurfacePolishPlan()
): TeoyubeProductSurfacePolishPatch[] {
  return plan.safePatches.filter((entry) => entry.applied);
}

export function getDeferredProductSurfacePolishItems(
  plan: TeoyubeProductSurfacePolishPlan = createProductSurfacePolishPlan()
): TeoyubeProductSurfacePolishIssue[] {
  return plan.deferredItems;
}

export function getBlockedProductSurfacePolishItems(
  plan: TeoyubeProductSurfacePolishPlan = createProductSurfacePolishPlan()
): TeoyubeProductSurfacePolishIssue[] {
  return plan.blockedItems;
}

export function createProductSurfacePolishDecision(
  plan: TeoyubeProductSurfacePolishPlan = createProductSurfacePolishPlan()
): TeoyubeProductSurfacePolishDecision {
  if (plan.blockedItems.length) return "blocked";
  if (plan.deferredItems.some((entry) => entry.status === "owner_review_required")) return "phase_4_2_complete_with_warnings";
  return plan.deferredItems.length ? "phase_4_2_complete_with_warnings" : "phase_4_2_complete";
}

export function createProductSurfacePolishPlanReport(
  plan: TeoyubeProductSurfacePolishPlan = createProductSurfacePolishPlan()
): TeoyubeProductSurfacePolishReport {
  const blockers = plan.checks.flatMap((entry) => entry.blockers);
  const warnings = plan.checks.flatMap((entry) => entry.warnings);
  return {
    valid: blockers.length === 0,
    decision: createProductSurfacePolishDecision(plan),
    checks: plan.checks,
    issues: plan.issues,
    safePatches: plan.safePatches,
    deferredItems: plan.deferredItems,
    blockedItems: plan.blockedItems,
    blockers,
    warnings,
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
