#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const { verifyScriptureContentDelta } = require("./scriptureContentDeltaOverlay.cjs");

const result = verifyScriptureContentDelta();
if (!result.valid) {
  console.error("OWNER-APPROVED SCRIPTURE CONTENT DELTA: FAILED");
  result.failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("OWNER-APPROVED SCRIPTURE CONTENT DELTA: PASSED");
console.log(`Decision: ${result.contract.decisionId}`);
console.log(`Records: ${result.contract.records.length}; exact source overlays: ${result.approvedByPath.size}.`);
console.log(`Contract SHA-256: ${result.contractSha256}`);
