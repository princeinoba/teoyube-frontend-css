import type { LegacyDomSnapshot } from "./capture";

export type SecondaryFailureClassification =
  | "OWNER_APPROVED_ACCESSIBILITY_DELTA"
  | "REAL_ACCESSIBILITY_REGRESSION"
  | "REAL_VISUAL_REGRESSION"
  | "HARNESS_STALENESS"
  | "ENVIRONMENT_NONDETERMINISM"
  | "HISTORICAL_STATIC_RUNTIME_DIFFERENCE"
  | "OBSOLETE_FOR_CURRENT_GATE"
  | "UNRESOLVED";

type ElementSignature = Omit<
  LegacyDomSnapshot["elements"][number],
  "index" | "text"
>;

export interface LegacyDomDifference {
  kind: "bodyView" | "root" | "elementCount" | "element";
  index?: number;
  expected: unknown;
  actual: unknown;
  semanticFields: string[];
}

export interface DifferenceDisposition {
  classification: SecondaryFailureClassification;
  issueId?: string;
  approvalId?: string;
  proposalHash?: string;
  approvalPath?: string;
  introducingCommit?: string;
  reason: string;
}

export const approvalBindings = Object.freeze({
  A11Y_003: Object.freeze({
    issueId: "A11Y-003",
    approvalId: "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001",
    proposalHash:
      "512755ac81b5cf4961c9c548a8a7eea12c7677564762635d589d26de1656a1ca",
    introducingCommit: "0716dc6e9c8a97f9d187ffda5561c0cb5c4e66a9",
  }),
  A11Y_005: Object.freeze({
    issueId: "A11Y-005",
    approvalId: "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001",
    proposalHash:
      "048ab643249f468aedd9d9db15205a762d2789c40ddd2936ccbd763ede2ac5ce",
    introducingCommit: "0716dc6e9c8a97f9d187ffda5561c0cb5c4e66a9",
  }),
  A11Y_006: Object.freeze({
    issueId: "A11Y-006",
    approvalId: "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001",
    proposalHash:
      "0ba9a5fb8e12da2e3f26176e168ee3255d64d0033b9467ac6ff35fb48bde0a61",
    introducingCommit: "0716dc6e9c8a97f9d187ffda5561c0cb5c4e66a9",
  }),
});

const canonApprovedLabels = new Set([
  "Play Rooted in His Word for The Chosen Sonship Journey",
  "Play Called for More for The Chosen Leadership Journey",
  "Play The Seed of Promise for The Builder Stewardship Journey",
  "Play Promise Language and Calling for The Builder Legacy Journey",
  "Play Walk in Divine Purpose for The Builder Kingdom Maturity Journey",
  "Play Strength for Today for The Lightbearer Wisdom Journey",
  "Play Rooted in His Word for The Lightbearer Protection Journey",
  "Play Called for More for The Lightbearer Dominion Journey",
  "Play The Power of Prayer for The Healer Healing Journey",
  "Play Strength for Today for The Healer Authority Journey",
  "Play Daily Divine Assignment for The Healer Service Journey",
]);

const todayPlaybackLabels = new Set([
  "Play The Seed of Promise in TeoyubeWorld Video Highlight",
  "Play Walk in Divine Purpose in TeoyubeWorld Video Highlight",
  "Play Faith That Moves Mountains in TeoyubeWorld Video Highlight",
  "Play The Power of Prayer in TeoyubeWorld Video Highlight",
  "Play Grace for Every Season in TeoyubeWorld Video Highlight",
  "Play Kingdom Calling in TeoyubeWorld Video Highlight",
  "Play Promise Language in TeoyubeWorld Video Highlight",
  "Play Daily Divine Assignment in TeoyubeWorld Video Highlight",
]);

const tablePlaybackLabels = new Set([
  "Play The Seed of Promise in Featured Video",
  "Play The Power of Prayer in Featured Video",
  "Play Walk in Divine Purpose in Featured Video",
  "Play Rooted in His Word in Featured Video",
  "Play Called for More in Featured Video",
  "Play Strength for Today in Featured Video",
  "Play Promise Language and Calling in Featured Video",
  "Play Daily Divine Assignment in Featured Video",
]);

function signature(
  element: LegacyDomSnapshot["elements"][number],
): ElementSignature {
  return {
    tag: element.tag || "",
    id: element.id || "",
    classes: [...(element.classes || [])],
    role: element.role || "",
    ariaLabel: element.ariaLabel || "",
    dataView: element.dataView || "",
    dataAction: element.dataAction || "",
    src: element.src || "",
    href: element.href || "",
  };
}

export function collectLegacyDomDifferences(
  baseline: LegacyDomSnapshot,
  candidate: LegacyDomSnapshot,
): LegacyDomDifference[] {
  const differences: LegacyDomDifference[] = [];
  if (baseline.bodyView !== candidate.bodyView) {
    differences.push({
      kind: "bodyView",
      expected: baseline.bodyView,
      actual: candidate.bodyView,
      semanticFields: ["bodyView"],
    });
  }
  if (JSON.stringify(baseline.root) !== JSON.stringify(candidate.root)) {
    differences.push({
      kind: "root",
      expected: baseline.root,
      actual: candidate.root,
      semanticFields: ["root"],
    });
  }
  if (baseline.elements.length !== candidate.elements.length) {
    differences.push({
      kind: "elementCount",
      expected: baseline.elements.length,
      actual: candidate.elements.length,
      semanticFields: ["elementCount"],
    });
  }
  for (
    let index = 0;
    index < Math.max(baseline.elements.length, candidate.elements.length);
    index += 1
  ) {
    const expected = baseline.elements[index];
    const actual = candidate.elements[index];
    if (!expected || !actual) continue;
    const expectedSignature = signature(expected);
    const actualSignature = signature(actual);
    if (JSON.stringify(expectedSignature) === JSON.stringify(actualSignature))
      continue;
    differences.push({
      kind: "element",
      index,
      expected: expectedSignature,
      actual: actualSignature,
      semanticFields: Object.keys(expectedSignature).filter(
        (field) =>
          JSON.stringify(expectedSignature[field as keyof ElementSignature]) !==
          JSON.stringify(actualSignature[field as keyof ElementSignature]),
      ),
    });
  }
  return differences;
}

function onlySemanticChange(
  expected: ElementSignature,
  actual: ElementSignature,
  fields: string[],
): boolean {
  const allowed = new Set(fields);
  return Object.keys(expected).every(
    (field) =>
      allowed.has(field) ||
      JSON.stringify(expected[field as keyof ElementSignature]) ===
        JSON.stringify(actual[field as keyof ElementSignature]),
  );
}

function approvedAccessibility(
  binding: (typeof approvalBindings)[keyof typeof approvalBindings],
  reason: string,
): DifferenceDisposition {
  return {
    classification: "OWNER_APPROVED_ACCESSIBILITY_DELTA",
    ...binding,
    reason,
  };
}

function historicalFunctional(
  approvalId: string,
  approvalPath: string,
  introducingCommit: string,
  reason: string,
): DifferenceDisposition {
  return {
    classification: "HISTORICAL_STATIC_RUNTIME_DIFFERENCE",
    approvalId,
    approvalPath,
    introducingCommit,
    reason,
  };
}

export function classifyHistoricalDomDifference(
  view: string,
  difference: LegacyDomDifference,
): DifferenceDisposition {
  if (difference.kind !== "element") {
    return {
      classification: "UNRESOLVED",
      reason: `Unapproved historical ${difference.kind} difference.`,
    };
  }
  const expected = difference.expected as ElementSignature;
  const actual = difference.actual as ElementSignature;

  if (
    view === "canon" &&
    expected.role === "" &&
    expected.ariaLabel === "" &&
    actual.role === "button" &&
    canonApprovedLabels.has(actual.ariaLabel) &&
    ["canon-project-media", "canon-recent-media"].some((name) =>
      actual.classes.includes(name),
    ) &&
    onlySemanticChange(expected, actual, ["role", "ariaLabel"])
  ) {
    return approvedAccessibility(
      approvalBindings.A11Y_003,
      "Exact named Canon playback control authorized by A11Y-003.",
    );
  }

  const searchNames: Record<string, string> = {
    lexiconSearchInput: "Search the Teoyube Lexicon",
    uiVideoSearch: "Search embedded videos",
    teoyubeTableSearch: "Search Teoyube tables",
  };
  if (
    searchNames[actual.id] === actual.ariaLabel &&
    expected.ariaLabel === "" &&
    onlySemanticChange(expected, actual, ["ariaLabel"])
  ) {
    return approvedAccessibility(
      approvalBindings.A11Y_005,
      "Exact route-specific search name authorized by A11Y-005.",
    );
  }

  if (
    actual.classes.includes("testimony-milestones") &&
    expected.role === "" &&
    expected.ariaLabel === "" &&
    actual.role === "region" &&
    actual.ariaLabel === "Testimony milestones" &&
    onlySemanticChange(expected, actual, ["role", "ariaLabel"])
  ) {
    return approvedAccessibility(
      approvalBindings.A11Y_006,
      "Exact named testimony milestone region authorized by A11Y-006.",
    );
  }

  if (view === "today") {
    const exactStatus =
      actual.id === "promiseMovieStatus" &&
      expected.role === "" &&
      actual.role === "status" &&
      onlySemanticChange(expected, actual, ["role"]);
    const exactNav =
      actual.classes.includes("promise-video-nav") &&
      expected.role === "" &&
      actual.role === "group" &&
      onlySemanticChange(expected, actual, ["role"]);
    const exactOverlay =
      actual.classes.includes("promise-embed-play-overlay") &&
      actual.ariaLabel ===
        "Play The Seed of Promise in TeoyubeWorld Video Highlight" &&
      onlySemanticChange(expected, actual, ["ariaLabel"]);
    const exactFeedControl =
      actual.classes.includes("today-video-select") &&
      todayPlaybackLabels.has(actual.ariaLabel) &&
      onlySemanticChange(expected, actual, ["ariaLabel"]);
    if (exactStatus || exactNav || exactOverlay || exactFeedControl) {
      return historicalFunctional(
        "TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001",
        "docs/owner-approvals/functional/TODAY_TEOYUBEWORLD_VIDEO_PLAYBACK_CHANGE_REQUEST_2026-07-30.md",
        "436a84e",
        "Exact Today playback/status semantic introduced after the immutable July 18 capture.",
      );
    }
  }

  if (view === "table") {
    const exactWatchNow =
      actual.classes.includes("promise-table-watch-now") &&
      actual.ariaLabel === "Play The Seed of Promise" &&
      onlySemanticChange(expected, actual, ["ariaLabel"]);
    const exactRowControl =
      actual.classes.includes("promise-watch-video") &&
      tablePlaybackLabels.has(actual.ariaLabel) &&
      onlySemanticChange(expected, actual, ["ariaLabel"]);
    if (exactWatchNow || exactRowControl) {
      return historicalFunctional(
        "TEOYUBE-FUNCTIONAL-2026-07-30-PROMISE-TABLE-YOUTUBE-PLAYBACK-001",
        "docs/owner-approvals/functional/PROMISE_TABLE_TEOYUBEWORLD_VIDEO_PLAYBACK_CHANGE_REQUEST_2026-07-30.md",
        "d7c55a5",
        "Exact Promise Table playback name introduced after the immutable July 18 capture.",
      );
    }
  }

  return {
    classification: "UNRESOLVED",
    reason:
      "No exact proposal-hash or functional-approval rule matched this semantic difference.",
  };
}

export function classifyHistoricalVisualDifference(input: {
  passed: boolean;
  baselineSourceTag: string;
  protectedVisualContractPassed: boolean;
}): SecondaryFailureClassification | null {
  if (input.passed) return null;
  if (
    input.baselineSourceTag === "teoyube-original-upload-2026-07-18" &&
    input.protectedVisualContractPassed
  ) {
    return "HISTORICAL_STATIC_RUNTIME_DIFFERENCE";
  }
  return "REAL_VISUAL_REGRESSION";
}

export function classifyCurrentVisualDifference(input: {
  passed: boolean;
  environmentIdentityChanged: boolean;
}): SecondaryFailureClassification | null {
  if (input.passed) return null;
  return input.environmentIdentityChanged
    ? "ENVIRONMENT_NONDETERMINISM"
    : "REAL_VISUAL_REGRESSION";
}

export function classifyCurrentFunctionalDifference(
  passed: boolean,
): SecondaryFailureClassification | null {
  return passed ? null : "UNRESOLVED";
}

export function assertImmutableBaselineHashes(
  before: Record<string, string>,
  after: Record<string, string>,
): void {
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new Error("Immutable baseline writes detected.");
  }
}
