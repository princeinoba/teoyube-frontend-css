export type TeoyubeLimitedSoftLaunchIssueTriageRehearsalSeverity = "low" | "medium" | "high" | "critical";

export type TeoyubeLimitedSoftLaunchIssueTriageRehearsalItem = {
  id: string;
  label: string;
  category:
    | "scripture_anchor"
    | "explanation_path"
    | "unsafe_fallback"
    | "consent"
    | "debug_payload"
    | "mobile"
    | "accessibility"
    | "privacy"
    | "build_or_preview"
    | "unknown";
  severity: TeoyubeLimitedSoftLaunchIssueTriageRehearsalSeverity;
  launchCritical: boolean;
  blocker: boolean;
  response: string;
  sampleOnly: true;
};

export type TeoyubeLimitedSoftLaunchIssueTriageRehearsal = {
  id: string;
  label: string;
  issues: TeoyubeLimitedSoftLaunchIssueTriageRehearsalItem[];
  sampleOnly: true;
  manualOnly: true;
  messagesSent: false;
  databaseWritten: false;
  analyticsSent: false;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchIssueTriageRehearsalReport = {
  valid: boolean;
  run: TeoyubeLimitedSoftLaunchIssueTriageRehearsal;
  issueCount: number;
  launchCriticalIssueCount: number;
  launchCriticalBlockers: TeoyubeLimitedSoftLaunchIssueTriageRehearsalItem[];
  blockers: string[];
  warnings: string[];
  noMessagesSent: true;
  noDatabaseWrites: true;
  noAnalyticsSending: true;
  generatedAt: string;
};

function issue(
  id: string,
  label: string,
  category: TeoyubeLimitedSoftLaunchIssueTriageRehearsalItem["category"],
  severity: TeoyubeLimitedSoftLaunchIssueTriageRehearsalSeverity,
  launchCritical: boolean,
  response: string
): TeoyubeLimitedSoftLaunchIssueTriageRehearsalItem {
  return {
    id,
    label,
    category,
    severity,
    launchCritical,
    blocker: launchCritical || severity === "critical",
    response,
    sampleOnly: true
  };
}

export function getDefaultIssueTriageRehearsalItems(): TeoyubeLimitedSoftLaunchIssueTriageRehearsalItem[] {
  return [
    issue("missing_scripture_anchor", "Missing Scripture anchor", "scripture_anchor", "critical", true, "Pause affected response path and restore Scripture anchoring."),
    issue("missing_explanation_path", "Missing explanation path", "explanation_path", "critical", true, "Pause affected surface and restore explanation path."),
    issue("unsafe_fallback_report", "Unsafe fallback report", "unsafe_fallback", "critical", true, "Rollback fallback path and owner-review wording."),
    issue("consent_control_issue", "Consent control issue", "consent", "critical", true, "Disable affected personalization path until consent is restored."),
    issue("debug_payload_exposed", "Debug payload exposed", "debug_payload", "critical", true, "Stop sharing preview and remove debug payload."),
    issue("mobile_blocker", "Mobile blocker", "mobile", "high", true, "Pause wider sharing until mobile path is usable."),
    issue("accessibility_blocker", "Accessibility blocker", "accessibility", "high", true, "Pause affected surface until accessibility blocker is fixed."),
    issue("privacy_concern", "Privacy concern", "privacy", "critical", true, "Stop collection, redact notes, and route to owner privacy review."),
    issue("build_preview_issue", "Build or preview app issue", "build_or_preview", "critical", true, "Pause launch and manually verify provider/build state."),
    issue("minor_copy_clarity", "Minor copy clarity issue", "unknown", "low", false, "Document as known limitation or normal fix.")
  ];
}

export function createIssueTriageRehearsal(
  issues: TeoyubeLimitedSoftLaunchIssueTriageRehearsalItem[] = getDefaultIssueTriageRehearsalItems()
): TeoyubeLimitedSoftLaunchIssueTriageRehearsal {
  return {
    id: "limited_soft_launch_issue_triage_rehearsal",
    label: "Limited Soft Launch Issue Triage Rehearsal",
    issues,
    sampleOnly: true,
    manualOnly: true,
    messagesSent: false,
    databaseWritten: false,
    analyticsSent: false,
    generatedAt: new Date().toISOString()
  };
}

export function recordIssueTriageRehearsalItem(
  run: TeoyubeLimitedSoftLaunchIssueTriageRehearsal,
  issueItem: TeoyubeLimitedSoftLaunchIssueTriageRehearsalItem
): TeoyubeLimitedSoftLaunchIssueTriageRehearsal {
  return { ...run, issues: [...run.issues, { ...issueItem, sampleOnly: true }] };
}

export function summarizeIssueTriageRehearsal(run: TeoyubeLimitedSoftLaunchIssueTriageRehearsal) {
  const launchCriticalBlockers = run.issues.filter((entry) => entry.launchCritical && entry.blocker);

  return {
    issueCount: run.issues.length,
    launchCriticalIssueCount: run.issues.filter((entry) => entry.launchCritical).length,
    launchCriticalBlockerCount: launchCriticalBlockers.length,
    launchCriticalBlockers
  };
}

export function getIssueTriageRehearsalBlockers(run: TeoyubeLimitedSoftLaunchIssueTriageRehearsal): string[] {
  const summary = summarizeIssueTriageRehearsal(run);

  return [
    summary.launchCriticalIssueCount > 0 ? "" : "Issue triage rehearsal must include launch-critical sample issues.",
    summary.launchCriticalBlockerCount === summary.launchCriticalIssueCount ? "" : "Every launch-critical sample issue must be classified as a blocker.",
    run.messagesSent ? "Issue triage rehearsal must not send messages." : "",
    run.databaseWritten ? "Issue triage rehearsal must not write to a database." : "",
    run.analyticsSent ? "Issue triage rehearsal must not send analytics." : "",
    run.issues.every((entry) => entry.sampleOnly) ? "" : "Issue triage rehearsal must use sample issues only."
  ].filter(Boolean);
}

export function getIssueTriageRehearsalWarnings(run: TeoyubeLimitedSoftLaunchIssueTriageRehearsal): string[] {
  return [
    run.issues.length < 9 ? "Recommended issue triage sample coverage is incomplete." : "",
    "Launch-critical sample issues are intentionally classified as blockers during rehearsal."
  ].filter(Boolean);
}

export function createIssueTriageRehearsalReport(
  run: TeoyubeLimitedSoftLaunchIssueTriageRehearsal = createIssueTriageRehearsal()
): TeoyubeLimitedSoftLaunchIssueTriageRehearsalReport {
  const summary = summarizeIssueTriageRehearsal(run);
  const blockers = getIssueTriageRehearsalBlockers(run);

  return {
    valid: blockers.length === 0,
    run,
    issueCount: summary.issueCount,
    launchCriticalIssueCount: summary.launchCriticalIssueCount,
    launchCriticalBlockers: summary.launchCriticalBlockers,
    blockers,
    warnings: getIssueTriageRehearsalWarnings(run),
    noMessagesSent: true,
    noDatabaseWrites: true,
    noAnalyticsSending: true,
    generatedAt: new Date().toISOString()
  };
}
