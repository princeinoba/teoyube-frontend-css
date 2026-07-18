#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

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
let checked = 0;

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
  if (bytes.length !== entry.sizeBytes) {
    fail(
      `protected visual source size changed: ${entry.path} ` +
        `(expected ${entry.sizeBytes}, received ${bytes.length})`
    );
    continue;
  }
  const actualHash = sha256(bytes);
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
    `${manifest.baselineTag || "the recorded baseline"}.`
);
