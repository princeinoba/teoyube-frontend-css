"use strict";

const fs = require("node:fs");
const {
  absolute,
  currentIdentity,
  readJson,
  writeJson
} = require("./release-utils.cjs");

const controllerPath = ".tmp/visual-parity/resumable-gate/controller.json";
if (!fs.existsSync(absolute(controllerPath))) {
  console.error("ACCESSIBILITY GATE: BLOCKED (resumable controller missing)");
  process.exit(1);
}
const controller = readJson(controllerPath);
const identity = currentIdentity();
const issuesByRoute = new Map();
let cells = 0;
let parityFailures = 0;
let positiveTabindex = 0;
let missingNames = 0;
let ariaHiddenFocusable = 0;

for (const run of controller.runs || []) {
  if (run.status !== "passed" || !fs.existsSync(run.resultPath)) continue;
  const result = JSON.parse(fs.readFileSync(run.resultPath, "utf8"));
  for (const cell of result.results || []) {
    cells += 1;
    if (!cell.accessibilityParity) parityFailures += 1;
    const issues = cell.next?.accessibility?.issues || [];
    const routeIssues = issuesByRoute.get(cell.route) || new Set();
    for (const issue of issues) {
      routeIssues.add(issue);
      if (issue.startsWith("missing-name:")) missingNames += 1;
      if (issue.startsWith("aria-hidden-focusable:")) ariaHiddenFocusable += 1;
      if (issue.startsWith("positive-tabindex:")) positiveTabindex += 1;
    }
    issuesByRoute.set(cell.route, routeIssues);
  }
}

const reducedMotion = fs.readFileSync(absolute("styles.css"), "utf8").includes("prefers-reduced-motion: reduce") &&
  fs.readFileSync(absolute("styles/responsive.css"), "utf8").includes("prefers-reduced-motion: reduce");
const passed =
  controller.status === "passed" &&
  controller.identity?.gitCommit === identity.commit &&
  cells === 216 &&
  parityFailures === 0 &&
  positiveTabindex === 0 &&
  reducedMotion;
const artifact = Object.freeze({
  schemaVersion: 1,
  gateVersion: "teoyube-accessibility-evidence-2026-07-24.1",
  generatedAt: new Date().toISOString(),
  identity,
  evidenceType: "automated_parity_not_wcag_certification",
  cells,
  parityFailures,
  checks: {
    accessibleNames: { automated: true, inheritedFindings: missingNames },
    sequentialFocus: { automated: true, positiveTabindex },
    focusTraps: { automated: true, parityOnly: true },
    ariaHiddenFocusDescendants: { automated: true, inheritedFindings: ariaHiddenFocusable },
    keyboardActions: { automated: true, parityOnly: true },
    reducedMotion: { automated: true, present: reducedMotion },
    contrast: { automated: false, status: "debt_register_manual_measurement_required" },
    responsiveTextZoom: { automated: false, status: "pilot_task_required" },
    errorAssociation: { automated: true, focusedApiAndBrowserCoverage: true }
  },
  inheritedDebt: [...issuesByRoute.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([route, issues]) => ({ route, issues: [...issues].sort() })),
  wcagConformanceClaimed: false,
  result: passed ? "PASS" : "BLOCKED"
});
writeJson("artifacts/release-evidence/accessibility/accessibility-gate.json", artifact);
console.log(`ACCESSIBILITY EVIDENCE: ${artifact.result} (${cells} cells; parity failures ${parityFailures}; inherited missing names ${missingNames}; aria-hidden focusable ${ariaHiddenFocusable})`);
if (!passed) process.exitCode = 1;
