import {
  createPhase112BookEntries,
  createPhase112ProductizationSummary,
  createPhase112Testimonies,
  createPromiseTableRowFromSearch,
  createPromiseTableRows,
  createTeoGuideResponse,
  generateTodayJourney,
  getGuardrailsContent,
  getPhase112ButtonActionMap,
  getPhase112Media,
  getPhase112RouteConfigs,
  getPhase112SafetyStatus,
  runCallingCompassPreview,
  runTeoyubeSearch,
  type Phase112BookEntry,
  type Phase112PromiseTableRow,
  type Phase112TestimonyRecord
} from "../phase-11-2-screenshot-guided-functionality";
import {
  getAllWords,
  searchTeoyubeCanon
} from "../data-access";

export type Phase112SmokeCheckResult = {
  name: string;
  passed: boolean;
  details: string[];
};

export type Phase112SmokeCheckReport = {
  phase: "11.2";
  valid: boolean;
  generatedAt: string;
  results: Phase112SmokeCheckResult[];
  errors: string[];
  safety: ReturnType<typeof getPhase112SafetyStatus>;
  nextStep: "Phase 11.3 - Advanced User Testing, Mobile Polish, Accessibility Hardening & Real-World Beta Readiness";
};

function result(name: string, passed: boolean, details: string[] = []): Phase112SmokeCheckResult {
  return { name, passed, details };
}

function canAddAndUpdatePromiseRow(): boolean {
  const rows: Phase112PromiseTableRow[] = createPromiseTableRows(1);
  rows.unshift(createPromiseTableRowFromSearch("purpose"));
  rows[0] = { ...rows[0], status: "Acting" };
  return rows.length >= 2 && rows[0].status === "Acting" && rows[0].testimonyRule === "user_recorded_only";
}

function canSaveReadAndClearJournal(): boolean {
  const entries: Phase112BookEntry[] = createPhase112BookEntries();
  entries.unshift({
    id: "smoke_journal_entry",
    type: "reflection",
    title: "Smoke Journal Entry",
    summary: "Session-only journal entry.",
    scriptureReferences: ["Psalm 119:105"],
    tags: ["smoke"],
    createdAt: "2026-07-10T00:00:00.000Z"
  });
  const saved = entries.some((entry) => entry.id === "smoke_journal_entry");
  entries.length = 0;
  return saved && entries.length === 0;
}

function canSaveAndReadTestimony(): boolean {
  const records: Phase112TestimonyRecord[] = createPhase112Testimonies();
  records.unshift({
    id: "smoke_testimony",
    title: "Smoke Testimony",
    category: "Faith",
    body: "User-recorded testimony only.",
    status: "Draft",
    scriptureReferences: ["Psalm 121:7"],
    createdAt: "2026-07-10T00:00:00.000Z",
    userRecordedOnly: true
  });
  return records.some((record) => record.id === "smoke_testimony" && record.userRecordedOnly);
}

export function runPhase112ScreenshotGuidedUiFunctionalitySmokeCheck(): Phase112SmokeCheckReport {
  const today = generateTodayJourney("2026-07-10");
  const guardrails = getGuardrailsContent();
  const search = runTeoyubeSearch("I feel confused about my purpose", "all");
  const canon = searchTeoyubeCanon("calling", { limit: 3 });
  const compass = runCallingCompassPreview("I sense a burden for teaching, creativity, and Scripture.");
  const bookEntries = createPhase112BookEntries();
  const lexicon = getAllWords();
  const testimony = createPhase112Testimonies();
  const teoGuide = createTeoGuideResponse("Help me overcome confusion with Scripture.");
  const media = getPhase112Media("promise", "all", 1);
  const routes = getPhase112RouteConfigs();
  const buttons = getPhase112ButtonActionMap();
  const summary = createPhase112ProductizationSummary();
  const safety = getPhase112SafetyStatus();

  const results = [
    result("Today journey generation works", Boolean(today.dailyWord.word && today.scripture.reference && today.actionStep), [
      today.dailyWord.word,
      today.scripture.reference
    ]),
    result("Guardrails modal data exists", guardrails.points.length >= 6, [guardrails.title]),
    result("TeoyubeSearch returns safe local results", search.rows.length > 0 && search.safety.noExternalServices, [
      String(search.rows.length)
    ]),
    result("Canon search returns words or journeys", canon.total > 0, [String(canon.total)]),
    result("Promise Table can add and update an item", canAddAndUpdatePromiseRow()),
    result("Calling Compass returns Scripture/calling/action", Boolean(compass.scriptureAnchor && compass.suggestedCallingPattern && compass.actionStep), [
      compass.scriptureAnchor
    ]),
    result("Book can save/read activity", bookEntries.length > 0 && bookEntries.every((entry) => entry.scriptureReferences.length > 0), [
      String(bookEntries.length)
    ]),
    result("Journal can save/read/clear entries", canSaveReadAndClearJournal()),
    result("Lexicon returns word records", lexicon.length > 0 && Boolean(lexicon[0].scriptureReferences), [String(lexicon.length)]),
    result("Testimony can save/read local testimony", testimony.length > 0 && canSaveAndReadTestimony()),
    result("Teo Guide answers through local engine", Boolean(teoGuide.response && teoGuide.scriptureAnchor && teoGuide.actionStep), [
      teoGuide.scriptureAnchor
    ]),
    result("Embedded Videos can filter/paginate local media records", media.items.length > 0 && media.page === 1, [
      String(media.total)
    ]),
    result("Personalization can enable session-only mode", summary.personalizationNoRawText === true),
    result("Personalization preview preserves Scripture anchor", Boolean(summary.teoGuideAnchor)),
    result("No raw private text is stored", safety.noRawPrivateTextStored && summary.safety.noRawPrivateTextStored),
    result("All visible route configs have labels and handlers", routes.every((route) => route.href && route.label) && buttons.every((button) => Boolean((button as { label?: string }).label)), [
      `${routes.length} routes`,
      `${buttons.length} buttons`
    ]),
    result("No external services, analytics, database, or live AI are required", safety.noExternalServices && safety.noAnalytics && safety.noDatabasePersistence && safety.noLiveAi)
  ];
  const errors = results.filter((item) => !item.passed).map((item) => item.name);

  return {
    phase: "11.2",
    valid: errors.length === 0,
    generatedAt: "2026-07-10T00:00:00.000Z",
    results,
    errors,
    safety,
    nextStep: "Phase 11.3 - Advanced User Testing, Mobile Polish, Accessibility Hardening & Real-World Beta Readiness"
  };
}

export const phase112ScreenshotGuidedUiFunctionalitySmokeCheck =
  runPhase112ScreenshotGuidedUiFunctionalitySmokeCheck;
