import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";
import type { TeoyubeFirstWeekStabilizationArea } from "./first-week-stabilization-contracts";

export type TeoyubeRepeatedIssueReproducibilityStatus =
  | "unknown"
  | "not_reproduced"
  | "partially_reproduced"
  | "reproduced"
  | "owner_review_required";

export type TeoyubeRepeatedIssuePatternDecision =
  | "no_pattern"
  | "watch"
  | "safe_fix_candidate"
  | "expansion_blocked"
  | "rollback_required";

export type TeoyubeRepeatedIssuePatternRecord = {
  id: string;
  affectedArea: TeoyubeFirstWeekStabilizationArea;
  issueSeverity: TeoyubeFirstDayIssueSeverity;
  manualReportCount: number;
  firstObservedDate: string;
  latestObservedDate: string;
  userConfusionSummary: string;
  reproducibilityStatus: TeoyubeRepeatedIssueReproducibilityStatus;
  safeFixCandidate: boolean;
  expansionBlocker: boolean;
  rollbackRisk: boolean;
  ownerNotes: string[];
};

export type TeoyubeRepeatedIssuePatternReport = {
  valid: boolean;
  checklist: Array<{ id: string; label: string; passed: boolean; details: string }>;
  records: TeoyubeRepeatedIssuePatternRecord[];
  blockers: string[];
  warnings: string[];
  decision: TeoyubeRepeatedIssuePatternDecision;
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

const expansionBlockingAreas: TeoyubeFirstWeekStabilizationArea[] = [
  "app_availability",
  "core_routes",
  "privacy_consent",
  "spiritual_response_sections",
  "tig_response_panel",
  "canon",
  "calling_compass",
  "mobile_layout",
  "manual_feedback"
];

function checklistItem(id: string, label: string, passed: boolean, details: string) {
  return { id, label, passed, details };
}

export function createRepeatedIssuePatternChecklist(records: TeoyubeRepeatedIssuePatternRecord[] = []) {
  return [
    checklistItem("manual_reports_grouped", "Manual reports grouped", records.length > 0, "Repeated issue patterns should be created from manual reports only."),
    checklistItem("severity_assigned", "Severity assigned", records.every((entry) => Boolean(entry.issueSeverity)), "Each repeated pattern needs a severity."),
    checklistItem("affected_area_recorded", "Affected area recorded", records.every((entry) => entry.affectedArea !== "unknown"), "Each pattern should identify an affected area."),
    checklistItem("reproducibility_reviewed", "Reproducibility reviewed", records.every((entry) => entry.reproducibilityStatus !== "unknown"), "Each pattern should record reproducibility status."),
    checklistItem("expansion_risk_reviewed", "Expansion risk reviewed", records.every((entry) => typeof entry.expansionBlocker === "boolean"), "Each pattern needs expansion risk review.")
  ];
}

export function createRepeatedIssuePatternRecord(input: Partial<TeoyubeRepeatedIssuePatternRecord> = {}): TeoyubeRepeatedIssuePatternRecord {
  const now = new Date().toISOString();
  const affectedArea = input.affectedArea || "unknown";
  const issueSeverity = input.issueSeverity || "severity_4_low";
  const expansionBlocker = input.expansionBlocker ?? expansionBlockingAreas.includes(affectedArea) || issueSeverity === "severity_1_critical" || issueSeverity === "severity_2_high";
  return {
    id: input.id || `repeated_issue_pattern_${Date.now()}`,
    affectedArea,
    issueSeverity,
    manualReportCount: input.manualReportCount ?? 1,
    firstObservedDate: input.firstObservedDate || now,
    latestObservedDate: input.latestObservedDate || now,
    userConfusionSummary: input.userConfusionSummary || "Manual repeated issue summary required.",
    reproducibilityStatus: input.reproducibilityStatus || "unknown",
    safeFixCandidate: input.safeFixCandidate ?? issueSeverity === "severity_2_high" || issueSeverity === "severity_3_medium",
    expansionBlocker,
    rollbackRisk: input.rollbackRisk ?? issueSeverity === "severity_1_critical",
    ownerNotes: input.ownerNotes || []
  };
}

export function recordRepeatedIssuePattern(records: TeoyubeRepeatedIssuePatternRecord[], pattern: TeoyubeRepeatedIssuePatternRecord): TeoyubeRepeatedIssuePatternRecord[] {
  return [...records.filter((entry) => entry.id !== pattern.id), pattern];
}

export function getRepeatedIssuePatternBlockers(input: TeoyubeRepeatedIssuePatternRecord[] = []): string[] {
  return input
    .filter((entry) => entry.rollbackRisk || entry.expansionBlocker || entry.issueSeverity === "severity_1_critical")
    .map((entry) => `${entry.id}: repeated ${entry.affectedArea} pattern blocks expansion until owner review.`);
}

export function getRepeatedIssuePatternWarnings(input: TeoyubeRepeatedIssuePatternRecord[] = []): string[] {
  const warnings = createRepeatedIssuePatternChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => entry.details);
  input
    .filter((entry) => entry.manualReportCount > 1 || entry.safeFixCandidate)
    .forEach((entry) => warnings.push(`${entry.id}: repeated pattern should stay on first-week watch.`));
  return warnings;
}

export function createRepeatedIssuePatternDecision(input: TeoyubeRepeatedIssuePatternRecord[] = []): TeoyubeRepeatedIssuePatternDecision {
  if (input.some((entry) => entry.rollbackRisk || entry.issueSeverity === "severity_1_critical")) return "rollback_required";
  if (getRepeatedIssuePatternBlockers(input).length) return "expansion_blocked";
  if (input.some((entry) => entry.safeFixCandidate)) return "safe_fix_candidate";
  return input.length ? "watch" : "no_pattern";
}

export function createRepeatedIssuePatternReport(input: TeoyubeRepeatedIssuePatternRecord[] = []): TeoyubeRepeatedIssuePatternReport {
  const blockers = getRepeatedIssuePatternBlockers(input);
  return {
    valid: blockers.length === 0,
    checklist: createRepeatedIssuePatternChecklist(input),
    records: input,
    blockers,
    warnings: getRepeatedIssuePatternWarnings(input),
    decision: createRepeatedIssuePatternDecision(input),
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
