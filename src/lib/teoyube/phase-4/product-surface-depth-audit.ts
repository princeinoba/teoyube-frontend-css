import { createJourneyPageProps } from "../journey/journey-page-integration";
import type { TeoyubeUserJourneyInput, TeoyubeUserJourneySurface } from "../journey/user-journey-contracts";
import {
  createPhase4AuditCheck,
  createPhase4Blocker,
  createPhase4Warning,
  type TeoyubePhase4Area,
  type TeoyubePhase4AuditCheck,
  type TeoyubePhase4AuditReport,
  type TeoyubePhase4Blocker,
  type TeoyubePhase4Warning
} from "./phase-4-contracts";

function auditSurface(
  id: string,
  area: TeoyubePhase4Area,
  surface: TeoyubeUserJourneySurface,
  label: string,
  input: TeoyubeUserJourneyInput = {}
): TeoyubePhase4AuditCheck {
  const props = createJourneyPageProps({ ...input, surface });
  const blockers = [
    props.payloads.length === 0 ? createPhase4Blocker(`${id}_payload_missing`, area, `${label} does not expose a Phase 3 journey payload.`) : undefined,
    props.report.scriptureAnchorCount === 0 && !props.report.fallbackUsed ? createPhase4Blocker(`${id}_scripture_missing`, area, `${label} lacks visible Scripture anchors or fallback.`) : undefined,
    props.report.explanationTraceStepCount === 0 ? createPhase4Blocker(`${id}_trace_missing`, area, `${label} lacks visible explanation trace.`) : undefined,
    !props.report.confidenceLabel ? createPhase4Blocker(`${id}_confidence_missing`, area, `${label} lacks a confidence label.`) : undefined,
    props.report.blockers.length > 0 ? createPhase4Blocker(`${id}_journey_blockers`, area, props.report.blockers.map((entry) => entry.message).join("; ")) : undefined
  ].filter(Boolean) as TeoyubePhase4Blocker[];
  const warnings = [
    createPhase4Warning(`${id}_content_depth_review`, area, `${label} should receive product-copy and content-depth review in Phase 4.2.`),
    createPhase4Warning(`${id}_manual_accessibility_mobile_review`, area, `${label} should receive manual accessibility and mobile review.`)
  ];

  return createPhase4AuditCheck(
    id,
    area,
    label,
    blockers.length === 0,
    `${label}: ${props.payloads.length} payload(s), ${props.report.scriptureAnchorCount} anchor(s), ${props.report.explanationTraceStepCount} trace step(s), fallback used: ${props.report.fallbackUsed}.`,
    blockers,
    warnings
  );
}

export function auditWordCardDepth(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditCheck {
  return auditSurface("word_card_depth", "word_card", "word_card", "WordCard depth", { ...input, wordId: input.wordId || "Benor" });
}

export function auditPrayerCompanionDepth(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditCheck {
  return auditSurface("prayer_companion_depth", "prayer_companion", "prayer_companion", "PrayerCompanion depth", { ...input, prayerInput: input.prayerInput || "Scripture-grounded prayer" });
}

export function auditCompassExperienceDepth(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditCheck {
  return auditSurface("compass_experience_depth", "calling_compass", "compass_experience", "CompassExperience depth", { ...input, callingInput: input.callingInput || "calling purpose" });
}

export function auditTigResponsePanelDepth(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditCheck {
  return auditSurface("tig_response_panel_depth", "tig_response_panel", "tig_response_panel", "TIGResponsePanel depth", input);
}

export function auditTigGraphExplorerDepth(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditCheck {
  return auditSurface("tig_graph_explorer_depth", "tig_graph_explorer", "tig_graph_explorer", "TIGGraphExplorer depth", input);
}

export function auditPromiseTableDepth(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditCheck {
  return auditSurface("promise_table_depth", "promise_table", "promise_table", "Promise Table depth", input);
}

export function auditCanonDepth(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditCheck {
  return auditSurface("canon_depth", "canon", "canon", "Canon and Daily Word depth", input);
}

export function runProductSurfaceDepthAudit(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditCheck[] {
  return [
    auditWordCardDepth(input),
    auditPrayerCompanionDepth(input),
    auditCompassExperienceDepth(input),
    auditTigResponsePanelDepth(input),
    auditTigGraphExplorerDepth(input),
    auditPromiseTableDepth(input),
    auditCanonDepth(input)
  ];
}

export function createProductSurfaceDepthReport(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4AuditReport {
  const checks = runProductSurfaceDepthAudit(input);
  const blockers = checks.flatMap((check) => check.blockers);
  const warnings = checks.flatMap((check) => check.warnings);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
    decision: blockers.length ? "needs_fix" : warnings.length ? "phase_4_1_complete_with_warnings" : "phase_4_1_complete",
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
