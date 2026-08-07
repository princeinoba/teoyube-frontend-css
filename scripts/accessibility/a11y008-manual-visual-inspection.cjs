#!/usr/bin/env node
"use strict";

const checklist = {
  schemaVersion: 1,
  task: "A11Y-008 manual visual inspection template",
  status: "NOT_RECORDED",
  route: { next: "/canon", static: "/#canon" },
  elements: [
    { id: "D02", selector: '[data-canon-item="canon-map-D02"] .canon-status.in-progress' },
    { id: "D05", selector: '[data-canon-item="canon-map-D05"] .canon-status.in-progress' }
  ],
  steps: [
    "Open the exact route in a clean browser at 100% zoom.",
    "Locate D02 and D05 and confirm the visible label is In Progress.",
    "Inspect default, hover, and the corresponding media-selected state.",
    "Repeat at 200% zoom and each required viewport where the browser permits it.",
    "Record only the safe result fields below; do not enter private content."
  ],
  safeResult: {
    allowedValues: ["PASS", "FAIL", "INCONCLUSIVE", "NOT_TESTED"],
    humanResult: "NOT_TESTED",
    route: null,
    element: null,
    state: null,
    viewport: null,
    browserVersion: null,
    observation: ""
  },
  warning: "Printing this template does not complete a manual or assistive-technology task. A human must perform and record the inspection separately."
};

process.stdout.write(`${JSON.stringify(checklist, null, 2)}\n`);
