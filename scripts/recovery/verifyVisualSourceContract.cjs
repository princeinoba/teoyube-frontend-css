#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { isApprovedSourceDelta, verifyScriptureContentDelta } = require("./scriptureContentDeltaOverlay.cjs");

const projectRoot = path.resolve(__dirname, "../..");
const manifestPath = path.join(
  projectRoot,
  "tests/visual/contracts/protected-visual-source-manifest.json"
);

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function fail(message) {
  console.error(`VISUAL CONTRACT FAILURE: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(manifestPath)) {
  fail(`missing manifest: ${path.relative(projectRoot, manifestPath)}`);
  process.exit();
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const scriptureDelta = verifyScriptureContentDelta();
if (!scriptureDelta.valid) {
  scriptureDelta.failures.forEach((failure) => fail(`owner-approved Scripture content delta: ${failure}`));
}
let checked = 0;
let approvedContentDeltas = 0;

for (const entry of manifest.files || []) {
  const absolutePath = path.resolve(projectRoot, entry.path);
  if (!absolutePath.startsWith(`${projectRoot}${path.sep}`)) {
    fail(`manifest path escapes project root: ${entry.path}`);
    continue;
  }
  if (!fs.existsSync(absolutePath)) {
    fail(`protected visual source is missing: ${entry.path}`);
    continue;
  }
  const bytes = fs.readFileSync(absolutePath);
  const actualHash = sha256(bytes);
  if (bytes.length !== entry.sizeBytes || actualHash !== entry.sha256) {
    if (isApprovedSourceDelta(entry.path, actualHash, bytes.length, scriptureDelta)) {
      checked += 1;
      approvedContentDeltas += 1;
      continue;
    }
  }
  if (bytes.length !== entry.sizeBytes) {
    fail(
      `protected visual source size changed: ${entry.path} ` +
        `(expected ${entry.sizeBytes}, received ${bytes.length})`
    );
    continue;
  }
  if (actualHash !== entry.sha256) {
    fail(
      `protected visual source content changed: ${entry.path} ` +
        `(expected ${entry.sha256}, received ${actualHash})`
    );
    continue;
  }
  checked += 1;
}

if (process.exitCode) {
  console.error(
    "Do not regenerate or weaken this manifest. Restore the source file, or stop and request a scoped written owner approval."
  );
  process.exit();
}

console.log(
  `Visual source contract passed: ${checked} protected files match ` +
    `${manifest.baselineTag || "the recorded baseline"}; ${approvedContentDeltas} exact owner-approved Scripture content overlay(s) replayed.`
);
