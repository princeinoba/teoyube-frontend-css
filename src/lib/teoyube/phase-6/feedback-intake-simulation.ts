import type {
  TeoyubeFeedbackIntakeSimulation,
  TeoyubeFeedbackIntakeSimulationBlocker,
  TeoyubeFeedbackIntakeSimulationCategory,
  TeoyubeFeedbackIntakeSimulationDecision,
  TeoyubeFeedbackIntakeSimulationItem,
  TeoyubeFeedbackIntakeSimulationPrivacyFlag,
  TeoyubeFeedbackIntakeSimulationReport,
  TeoyubeFeedbackIntakeSimulationStatus,
  TeoyubeFeedbackIntakeSimulationWarning
} from "./feedback-intake-simulation-contracts";

export type TeoyubeFeedbackIntakeSimulationInput = Partial<{
  id: string;
  items: TeoyubeFeedbackIntakeSimulationItem[];
  automaticCollectionEnabled: boolean;
  databaseStorageEnabled: boolean;
  analyticsEnabled: boolean;
  hiddenPersonalizationEnabled: boolean;
  rawSensitiveTextStorageEnabled: boolean;
}>;

function now(): string {
  return new Date().toISOString();
}

export function sanitizeSimulatedFeedbackItem(item: TeoyubeFeedbackIntakeSimulationItem): TeoyubeFeedbackIntakeSimulationItem {
  return redactSimulatedFeedbackSensitiveFields(item);
}

function flagsForText(text: string): TeoyubeFeedbackIntakeSimulationPrivacyFlag[] {
  const flags: TeoyubeFeedbackIntakeSimulationPrivacyFlag[] = [];
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) || /\+?\d[\d\s().-]{7,}\d/.test(text)) flags.push("contains_contact_information");
  if (/\b(address|birthday|diagnosis|therapy|trauma|abuse|family|workplace)\b/i.test(text)) flags.push("contains_sensitive_personal_text");
  if (/\b(suicide|suicidal|self harm|emergency|crisis|danger)\b/i.test(text)) flags.push("contains_crisis_or_emergency_content");
  if (/\b(medical|legal|financial|diagnose|treatment|attorney|investment)\b/i.test(text)) flags.push("contains_professional_advice_request");
  if (/\b(prayer request|confession|spiritual|calling|sin|grief)\b/i.test(text)) flags.push("contains_spiritual_disclosure");
  return flags.length ? flags : ["safe_simulated_feedback"];
}

export function redactSimulatedFeedbackSensitiveFields(item: TeoyubeFeedbackIntakeSimulationItem): TeoyubeFeedbackIntakeSimulationItem {
  const redactedNote = item.note
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted-phone]")
    .replace(/\b(?:ssn|social security|credit card|password|diagnose|suicidal|self harm)\b/gi, "[sensitive-term]")
    .trim();
  return {
    ...item,
    redactedNote,
    privacyFlags: flagsForText(item.note),
    simulatedOnly: true,
    manuallyEnteredByOwner: true,
    storeRawText: false
  };
}

export function createSimulatedFeedbackItem(input: {
  id?: string;
  category?: TeoyubeFeedbackIntakeSimulationCategory;
  note: string;
}): TeoyubeFeedbackIntakeSimulationItem {
  return redactSimulatedFeedbackSensitiveFields({
    id: input.id || `simulated_feedback_${Date.now()}`,
    category: input.category || "unknown",
    note: input.note,
    redactedNote: input.note,
    privacyFlags: [],
    simulatedOnly: true,
    manuallyEnteredByOwner: true,
    storeRawText: false
  });
}

export function createFeedbackIntakeSimulation(input: TeoyubeFeedbackIntakeSimulationInput = {}): TeoyubeFeedbackIntakeSimulation {
  return {
    id: input.id || "phase_6_2_feedback_intake_simulation",
    items: (input.items || []).map(redactSimulatedFeedbackSensitiveFields),
    noAutomaticCollection: true,
    noDatabaseStorage: true,
    noAnalytics: true,
    noHiddenPersonalization: true,
    noRawSensitiveTextStorageByDefault: true,
    simulatedOnly: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

export function validateFeedbackIntakeSimulationItem(item: TeoyubeFeedbackIntakeSimulationItem): TeoyubeFeedbackIntakeSimulationBlocker[] {
  const redacted = redactSimulatedFeedbackSensitiveFields(item);
  return [
    ...(!redacted.simulatedOnly || !redacted.manuallyEnteredByOwner ? [{
      id: `${item.id}_not_simulated`,
      itemId: item.id,
      message: "Feedback must be simulated and manually entered by owner.",
      requiredAction: "Do not use real automatic feedback collection."
    }] : []),
    ...(redacted.storeRawText ? [{
      id: `${item.id}_raw_storage_blocked`,
      itemId: item.id,
      message: "Raw feedback text storage is blocked.",
      requiredAction: "Store no raw sensitive text; use redacted simulation only."
    }] : [])
  ];
}

export function addSimulatedFeedbackItem(simulation: TeoyubeFeedbackIntakeSimulation, item: TeoyubeFeedbackIntakeSimulationItem): TeoyubeFeedbackIntakeSimulation {
  return {
    ...simulation,
    items: [...simulation.items, redactSimulatedFeedbackSensitiveFields(item)],
    generatedAt: now()
  };
}

export function summarizeFeedbackIntakeSimulation(simulation: TeoyubeFeedbackIntakeSimulation) {
  return {
    total: simulation.items.length,
    redacted: simulation.items.filter((entry) => entry.note !== entry.redactedNote).length,
    manualHandling: simulation.items.filter((entry) => entry.privacyFlags.some((flag) => ["contains_crisis_or_emergency_content", "contains_professional_advice_request", "contains_sensitive_personal_text", "contains_spiritual_disclosure"].includes(flag))).length,
    safe: simulation.items.filter((entry) => entry.privacyFlags.includes("safe_simulated_feedback")).length
  };
}

export function getFeedbackIntakeSimulationBlockers(simulation: TeoyubeFeedbackIntakeSimulation): TeoyubeFeedbackIntakeSimulationBlocker[] {
  return [
    ...simulation.items.flatMap(validateFeedbackIntakeSimulationItem),
    ...(!simulation.noAutomaticCollection || !simulation.noDatabaseStorage || !simulation.noAnalytics || !simulation.noHiddenPersonalization || !simulation.inMemoryOnly ? [{
      id: "feedback_simulation_boundary_blocked",
      message: "Feedback simulation boundaries must remain manual, no-storage, no-analytics, and in-memory.",
      requiredAction: "Restore feedback simulation safety flags."
    }] : [])
  ];
}

export function getFeedbackIntakeSimulationWarnings(simulation: TeoyubeFeedbackIntakeSimulation): TeoyubeFeedbackIntakeSimulationWarning[] {
  return simulation.items
    .filter((entry) => entry.privacyFlags.some((flag) => flag !== "safe_simulated_feedback"))
    .map((entry) => ({
      id: `${entry.id}_manual_handling_warning`,
      itemId: entry.id,
      message: "Simulated feedback contains sensitive or manually handled content.",
      recommendedAction: "Keep redacted and route through manual owner handling only."
    }));
}

export function createFeedbackIntakeSimulationDecision(simulation: TeoyubeFeedbackIntakeSimulation): TeoyubeFeedbackIntakeSimulationDecision {
  const blockers = getFeedbackIntakeSimulationBlockers(simulation);
  const warnings = getFeedbackIntakeSimulationWarnings(simulation);
  if (blockers.length) return "blocked";
  if (warnings.some((entry) => entry.message.includes("sensitive"))) return "manual_handling_required";
  return warnings.length ? "simulation_passed_with_warnings" : "simulation_passed";
}

function statusFromDecision(decision: TeoyubeFeedbackIntakeSimulationDecision, simulation: TeoyubeFeedbackIntakeSimulation): TeoyubeFeedbackIntakeSimulationStatus {
  if (!simulation.items.length) return "empty";
  if (decision === "simulation_passed") return "simulated";
  if (decision === "simulation_passed_with_warnings" || decision === "needs_manual_redaction") return "needs_redaction";
  if (decision === "manual_handling_required") return "manual_handling_required";
  if (decision === "blocked") return "blocked";
  return "unknown";
}

export function createFeedbackIntakeSimulationReport(simulation: TeoyubeFeedbackIntakeSimulation): TeoyubeFeedbackIntakeSimulationReport {
  const blockers = getFeedbackIntakeSimulationBlockers(simulation);
  const decision = createFeedbackIntakeSimulationDecision(simulation);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision, simulation),
    decision,
    simulation,
    summary: summarizeFeedbackIntakeSimulation(simulation),
    blockers,
    warnings: getFeedbackIntakeSimulationWarnings(simulation),
    noAutomaticCollection: true,
    noDatabaseStorage: true,
    noAnalytics: true,
    noHiddenPersonalization: true,
    noRawSensitiveTextStorageByDefault: true,
    simulatedOnly: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

