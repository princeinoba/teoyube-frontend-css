import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";

export type TeoyubeBetaUserJourneyQaArea =
  | "home"
  | "daily_word"
  | "word_card"
  | "prayer"
  | "calling_compass"
  | "tig"
  | "privacy";

export type TeoyubeBetaUserJourneyQaStatus = "passed" | "warning" | "blocked" | "manual_review_required";

export type TeoyubeBetaUserJourneyQaCheck = {
  id: string;
  area: TeoyubeBetaUserJourneyQaArea;
  label: string;
  required: boolean;
  passed: boolean;
  details: string;
};

export type TeoyubeBetaUserJourneyQaResult = {
  id: string;
  area: TeoyubeBetaUserJourneyQaArea;
  status: TeoyubeBetaUserJourneyQaStatus;
  notes: string;
  capturedManually: true;
  containsSensitiveText: false;
  recordedAt: string;
};

export type TeoyubeBetaUserJourneyQaInput = {
  results?: TeoyubeBetaUserJourneyQaResult[];
  entryJourneySafe?: boolean;
  rawSensitiveUserInputExposed?: boolean;
  browserPersistenceRequired?: boolean;
  fallbackStatesSafe?: boolean;
};

export type TeoyubeBetaUserJourneyQaReport = {
  valid: boolean;
  checks: TeoyubeBetaUserJourneyQaCheck[];
  results: TeoyubeBetaUserJourneyQaResult[];
  blockers: string[];
  warnings: string[];
  noRawSensitiveUserInputExposed: boolean;
  noBrowserPersistenceRequired: boolean;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, area: TeoyubeBetaUserJourneyQaArea, label: string, passed: boolean, details: string, required = true): TeoyubeBetaUserJourneyQaCheck {
  return { id, area, label, required, passed, details };
}

export function recordBetaUserJourneyQaResult(input: Omit<TeoyubeBetaUserJourneyQaResult, "capturedManually" | "containsSensitiveText" | "recordedAt"> & { recordedAt?: string }): TeoyubeBetaUserJourneyQaResult {
  return {
    ...input,
    capturedManually: true,
    containsSensitiveText: false,
    recordedAt: input.recordedAt || new Date().toISOString()
  };
}

export function validateBetaHomeJourney(input: TeoyubeBetaUserJourneyQaInput = {}): TeoyubeBetaUserJourneyQaCheck {
  return check("beta_home_entry_journey", "home", "Entry/home journey initializes safely", input.entryJourneySafe !== false && !input.browserPersistenceRequired, "Journey state remains local and browser persistence is not required.");
}

export function validateBetaDailyWordJourney(): TeoyubeBetaUserJourneyQaCheck {
  const word = createWordCardAdapterProps("Benor");
  return check("beta_daily_word_context", "daily_word", "Daily Word can render stable WordCard payload", Boolean(word.word.word && word.context.explanationPath.length), `Daily Word context exposes ${word.word.word}.`);
}

export function validateBetaWordCardJourney(): TeoyubeBetaUserJourneyQaCheck {
  const word = createWordCardAdapterProps("Benor");
  const missing = createWordCardAdapterProps("__missing_beta_word__");
  return check("beta_word_card_payload", "word_card", "WordCard payload is stable and fallback-safe", Boolean(word.context.scriptureAnchors.length && missing.word.word), `WordCard anchors: ${word.context.scriptureAnchors.length}; fallback word: ${missing.word.word}.`);
}

export function validateBetaPrayerJourney(): TeoyubeBetaUserJourneyQaCheck {
  const prayer = createPrayerCompanionAdapterContext({ message: "calling purpose prayer" });
  return check("beta_prayer_payload", "prayer", "PrayerCompanion payload is stable", Boolean(prayer.safeDisplayData.prayer && prayer.safeDisplayData.scriptureAnchor && prayer.safeDisplayData.explanationPath.length), `Prayer cluster: ${prayer.safeDisplayData.cluster}.`);
}

export function validateBetaCallingCompassJourney(): TeoyubeBetaUserJourneyQaCheck {
  const compass = createCompassExperienceAdapterContext({ query: "calling purpose builder" });
  return check("beta_calling_compass_payload", "calling_compass", "CompassExperience payload is stable", Boolean(compass.callingPath.archetype.name && compass.callingPath.scriptureAnchors.length && compass.explanationPath.length), `Compass path: ${compass.callingPath.archetype.name}.`);
}

export function validateBetaTigJourney(): TeoyubeBetaUserJourneyQaCheck {
  const response = createTigResponsePanelAdapterContext({ query: "calling", wordId: "Benor", mode: "promise" });
  const graph = createTigGraphExplorerAdapterContext();
  return check("beta_tig_payload", "tig", "TIG response and graph payloads are stable", Boolean(response.panelData.explanationPath.length && response.panelData.scriptureAnchors.length && graph.graphSummary.nodeCount && graph.promiseTablePreviewRows.length), `TIG graph nodes: ${graph.graphSummary.nodeCount}; response anchors: ${response.panelData.scriptureAnchors.length}.`);
}

export function createBetaUserJourneyQaChecklist(input: TeoyubeBetaUserJourneyQaInput = {}): TeoyubeBetaUserJourneyQaCheck[] {
  return [
    validateBetaHomeJourney(input),
    validateBetaDailyWordJourney(),
    validateBetaWordCardJourney(),
    validateBetaPrayerJourney(),
    validateBetaCallingCompassJourney(),
    validateBetaTigJourney(),
    check("beta_fallback_states", "privacy", "Fallback states are safe", input.fallbackStatesSafe !== false, "Fallbacks must not invent unsupported promises, prayers, or callings."),
    check("beta_sensitive_input_not_exposed", "privacy", "No raw sensitive user input is exposed", !input.rawSensitiveUserInputExposed, "Manual QA should avoid recording sensitive prayer or calling text."),
    check("beta_no_browser_persistence", "privacy", "No browser persistence is required", !input.browserPersistenceRequired, "Sensitive personalization must not require localStorage, cookies, or IndexedDB.")
  ];
}

export function getBetaUserJourneyQaBlockers(input: TeoyubeBetaUserJourneyQaInput = {}): string[] {
  return createBetaUserJourneyQaChecklist(input)
    .filter((entry) => entry.required && !entry.passed)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getBetaUserJourneyQaWarnings(input: TeoyubeBetaUserJourneyQaInput = {}): string[] {
  return [
    ...((input.results || []).filter((entry) => entry.status === "warning").map((entry) => entry.notes)),
    "Manual reviewer should confirm mobile and keyboard behavior for the complete entry-to-recommendation path."
  ];
}

export function createBetaUserJourneyQaReport(input: TeoyubeBetaUserJourneyQaInput = {}): TeoyubeBetaUserJourneyQaReport {
  const blockers = getBetaUserJourneyQaBlockers(input);
  return {
    valid: blockers.length === 0,
    checks: createBetaUserJourneyQaChecklist(input),
    results: input.results || [],
    blockers,
    warnings: getBetaUserJourneyQaWarnings(input),
    noRawSensitiveUserInputExposed: !input.rawSensitiveUserInputExposed,
    noBrowserPersistenceRequired: !input.browserPersistenceRequired,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
