export type TeoyubeBetaQaRunbookSection = {
  id: string;
  title: string;
  items: string[];
};

export type TeoyubeBetaQaRunbookReport = {
  valid: boolean;
  sections: TeoyubeBetaQaRunbookSection[];
  blockers: string[];
  warnings: string[];
  noScheduleCreated: true;
  noUsersContacted: true;
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

function section(id: string, title: string, items: string[]): TeoyubeBetaQaRunbookSection {
  return { id, title, items };
}

export function getBetaQaPreRunChecklist(): string[] {
  return [
    "Confirm reviewed content gates and release candidates are in-memory only.",
    "Confirm no review-only draft content appears in live flows.",
    "Confirm service readiness review keeps database, analytics, monitoring, admin auth, CMS, live AI, and email disabled.",
    "Confirm privacy and consent copy is visible before collecting sensitive feedback manually."
  ];
}

export function getBetaQaExecutionChecklist(): string[] {
  return [
    "Run core journey QA across Home, WordCard, Promise Table, PrayerCompanion, CompassExperience, TIGResponsePanel, and TIGGraphExplorer.",
    "Check Scripture anchors, explanation traces, confidence labels, and fallback reasons.",
    "Run mobile and accessibility basics manually.",
    "Record issues manually without contacting users from code."
  ];
}

export function getBetaQaIssueTriageChecklist(): string[] {
  return [
    "Classify Scripture, explanation, fallback, privacy, mobile, accessibility, debug payload, and disabled-service issues.",
    "Pause beta if a blocker affects Scripture anchoring, explanation trace, privacy/consent, unsafe fallback, or disabled service boundaries.",
    "Map fixes back to regression checks before future release."
  ];
}

export function getBetaQaExitCriteria(): string[] {
  return [
    "No blocking Scripture anchor or explanation trace gaps remain.",
    "No review-only content appears in live flows.",
    "Fallbacks are safe, non-empty, and do not invent promises.",
    "Disabled services remain disconnected.",
    "Owner accepts Phase 4.6 service decision lock and completion review."
  ];
}

export function getBetaQaRunbookSections(): TeoyubeBetaQaRunbookSection[] {
  return [
    section("pre_run", "Pre-beta review checklist", getBetaQaPreRunChecklist()),
    section("execution", "Manual QA scenario checklist", getBetaQaExecutionChecklist()),
    section("issue_triage", "Issue triage categories", getBetaQaIssueTriageChecklist()),
    section("exit_criteria", "Beta exit criteria", getBetaQaExitCriteria())
  ];
}

export function createBetaQaRunbook(): TeoyubeBetaQaRunbookSection[] {
  return getBetaQaRunbookSections();
}

export function createBetaQaRunbookReport(): TeoyubeBetaQaRunbookReport {
  const sections = createBetaQaRunbook();
  const blockers = sections.length ? [] : ["Beta QA runbook sections are missing."];
  const warnings = ["Manual beta QA execution, issue triage, pause/rollback decisions, and owner review remain human-owned."];
  return {
    valid: blockers.length === 0,
    sections,
    blockers,
    warnings,
    noScheduleCreated: true,
    noUsersContacted: true,
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
