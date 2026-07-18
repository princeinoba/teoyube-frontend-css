import { createJourneyPageProps } from "../journey/journey-page-integration";
import { createPhase3IntegrationLockReport } from "../integration/phase-3-integration-lock";
import { createPhase36QaAccessibilityValidationReport } from "../integration/phase-3-6-qa-accessibility-validation";
import type { TeoyubeUserJourneyInput, TeoyubeUserJourneySurface } from "../journey/user-journey-contracts";
import {
  createPhase4AuditCheck,
  createPhase4Blocker,
  createPhase4Warning,
  type TeoyubePhase4Area,
  type TeoyubePhase4AuditCheck,
  type TeoyubePhase4AuditReport,
  type TeoyubePhase4Blocker,
  type TeoyubePhase4Decision,
  type TeoyubePhase4Warning
} from "./phase-4-contracts";

function surfaceCheck(
  id: string,
  surface: TeoyubeUserJourneySurface,
  area: TeoyubePhase4Area,
  label: string,
  input: TeoyubeUserJourneyInput = {}
): TeoyubePhase4AuditCheck {
  const props = createJourneyPageProps({ ...input, surface });
  const blockers = [
    props.payloads.length === 0 ? createPhase4Blocker(`${id}_payload_missing`, area, `${label} has no journey payload.`) : undefined,
    props.report.scriptureAnchorCount === 0 && !props.report.fallbackUsed ? createPhase4Blocker(`${id}_scripture_missing`, area, `${label} needs Scripture anchors or an explicit fallback state.`) : undefined,
    props.report.explanationTraceStepCount === 0 ? createPhase4Blocker(`${id}_trace_missing`, area, `${label} needs a visible explanation trace.`) : undefined,
    !props.report.confidenceLabel ? createPhase4Blocker(`${id}_confidence_missing`, area, `${label} needs a visible bounded confidence label.`) : undefined
  ].filter(Boolean) as TeoyubePhase4Blocker[];
  const warnings = [
    createPhase4Warning(`${id}_manual_polish`, area, `${label} should receive manual product copy, mobile, and accessibility polish in Phase 4.`)
  ];

  return createPhase4AuditCheck(
    id,
    area,
    label,
    blockers.length === 0,
    `${label} exposes ${props.payloads.length} payload(s), ${props.report.scriptureAnchorCount} Scripture anchor(s), and ${props.report.explanationTraceStepCount} explanation step(s).`,
    blockers,
    warnings
  );
}

export function createProductExperienceAuditChecklist(
  input: TeoyubeUserJourneyInput = {}
): TeoyubePhase4AuditCheck[] {
  const lock = createPhase3IntegrationLockReport();
  const qa = createPhase36QaAccessibilityValidationReport({ surface: "home", wordId: "Benor" });
  return [
    createPhase4AuditCheck("phase_3_lock", "product_experience", "Phase 3 integration lock", lock.locked, `Phase 3 lock protects ${lock.contracts.length} contract(s).`, lock.blockers.map((entry) => createPhase4Blocker(entry.id, "product_experience", entry.message)), lock.warnings.map((entry) => createPhase4Warning(entry.id, "product_experience", entry.message))),
    surfaceCheck("home_dashboard", "home", "product_experience", "Home/dashboard experience", input),
    surfaceCheck("canon_page", "canon", "canon", "Canon page experience", input),
    surfaceCheck("daily_word", "daily_word", "daily_word", "Daily Word experience", input),
    surfaceCheck("word_card", "word_card", "word_card", "WordCard experience", { ...input, wordId: input.wordId || "Benor" }),
    surfaceCheck("promise_table", "promise_table", "promise_table", "Promise Cluster and Promise Table experience", input),
    surfaceCheck("prayer_companion", "prayer_companion", "prayer_companion", "PrayerCompanion experience", { ...input, prayerInput: input.prayerInput || "Scripture-grounded prayer" }),
    surfaceCheck("compass_experience", "compass_experience", "calling_compass", "CompassExperience experience", { ...input, callingInput: input.callingInput || "calling purpose" }),
    surfaceCheck("tig_response_panel", "tig_response_panel", "tig_response_panel", "TIGResponsePanel experience", input),
    surfaceCheck("tig_graph_explorer", "tig_graph_explorer", "tig_graph_explorer", "TIGGraphExplorer experience", input),
    createPhase4AuditCheck("fallback_states", "product_experience", "Fallback states", qa.valid, `Phase 3.6 QA status: ${qa.status}.`, qa.blockers.map((message, index) => createPhase4Blocker(`qa_${index + 1}`, "product_experience", message)), qa.warnings.map((message, index) => createPhase4Warning(`qa_warning_${index + 1}`, "product_experience", message))),
    createPhase4AuditCheck("future_services_disabled", "product_experience", "Future services disabled", qa.noExternalServicesRequired && qa.noDatabasePersistenceEnabled && qa.noAnalyticsEnabled && qa.noLiveAiOrchestrationEnabled && qa.noBrowserPersistenceRequired && qa.inMemoryOnly, "Phase 4.1 audit remains local, in-memory, and service-free.")
  ];
}

export function runProductExperienceAudit(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditCheck[] {
  return createProductExperienceAuditChecklist(input);
}

export function getProductExperienceAuditBlockers(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4Blocker[] {
  return createProductExperienceAuditChecklist(input).flatMap((check) => [
    ...check.blockers,
    ...(!check.passed ? [createPhase4Blocker(check.id, check.area, check.details)] : [])
  ]);
}

export function getProductExperienceAuditWarnings(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4Warning[] {
  return createProductExperienceAuditChecklist(input).flatMap((check) => check.warnings);
}

export function createProductExperienceAuditDecision(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4Decision {
  const blockers = getProductExperienceAuditBlockers(input);
  const warnings = getProductExperienceAuditWarnings(input);
  if (blockers.length) return "needs_fix";
  return warnings.length ? "phase_4_1_complete_with_warnings" : "phase_4_1_complete";
}

export function createProductExperienceAuditReport(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditReport {
  const checks = createProductExperienceAuditChecklist(input);
  const blockers = getProductExperienceAuditBlockers(input);
  const warnings = getProductExperienceAuditWarnings(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
    decision: createProductExperienceAuditDecision(input),
    checks,
    blockers,
    warnings,
    nextAction: "Phase 4.2 - Product Surface Polish, Content Expansion Backlog & Admin Workflow Design",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
