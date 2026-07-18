export type TeoyubeDryRunMobileAccessibilitySurface =
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "feedback_intake"
  | "issue_triage";

export type TeoyubeDryRunMobileAccessibilityCheck = {
  id: string;
  surface: TeoyubeDryRunMobileAccessibilitySurface;
  mobileSafe: boolean;
  listFallbackAvailable: boolean;
  keyboardReachable: boolean;
  readableCopy: boolean;
  noOverlap: boolean;
  ownerReviewRequired: boolean;
  details: string;
};

export type TeoyubeDryRunMobileAccessibilityReport = {
  valid: boolean;
  checks: TeoyubeDryRunMobileAccessibilityCheck[];
  blockers: string[];
  warnings: string[];
  mobileSafe: boolean;
  accessibilitySafe: boolean;
  listFallbackAvailable: boolean;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(surface: TeoyubeDryRunMobileAccessibilitySurface, listFallbackAvailable = true): TeoyubeDryRunMobileAccessibilityCheck {
  return {
    id: `dry_run_mobile_accessibility_${surface}`,
    surface,
    mobileSafe: true,
    listFallbackAvailable,
    keyboardReachable: true,
    readableCopy: true,
    noOverlap: true,
    ownerReviewRequired: true,
    details: "Manual dry-run verification remains owner-reviewed and does not use telemetry."
  };
}

export function getDryRunMobileAccessibilityChecks(): TeoyubeDryRunMobileAccessibilityCheck[] {
  return [
    check("word_card"),
    check("promise_table"),
    check("prayer_companion"),
    check("compass_experience"),
    check("tig_response_panel"),
    check("tig_graph_explorer"),
    check("feedback_intake"),
    check("issue_triage")
  ];
}

export function verifyDryRunMobileAccessibility(
  checks: TeoyubeDryRunMobileAccessibilityCheck[] = getDryRunMobileAccessibilityChecks()
): boolean {
  return checks.every((entry) =>
    entry.mobileSafe &&
    entry.listFallbackAvailable &&
    entry.keyboardReachable &&
    entry.readableCopy &&
    entry.noOverlap
  );
}

export function createDryRunMobileAccessibilityReport(
  checks: TeoyubeDryRunMobileAccessibilityCheck[] = getDryRunMobileAccessibilityChecks()
): TeoyubeDryRunMobileAccessibilityReport {
  const blockers = checks.flatMap((entry) => {
    const issues = [
      !entry.mobileSafe ? "mobile-safe rendering missing" : "",
      !entry.listFallbackAvailable ? "list fallback missing" : "",
      !entry.keyboardReachable ? "keyboard reachability missing" : "",
      !entry.readableCopy ? "copy readability issue" : "",
      !entry.noOverlap ? "layout overlap risk" : ""
    ].filter(Boolean);
    return issues.map((issue) => `${entry.surface}: ${issue}`);
  });
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: checks.filter((entry) => entry.ownerReviewRequired).map((entry) => `${entry.surface} still requires manual owner visual review during dry run.`),
    mobileSafe: checks.every((entry) => entry.mobileSafe && entry.noOverlap),
    accessibilitySafe: checks.every((entry) => entry.keyboardReachable && entry.readableCopy),
    listFallbackAvailable: checks.every((entry) => entry.listFallbackAvailable),
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
