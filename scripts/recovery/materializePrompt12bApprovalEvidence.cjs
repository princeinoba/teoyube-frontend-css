"use strict";

/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const workspaceRoot = path.resolve(__dirname, "../..");
const approvalId = "TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8";
const approvedCommit = "4c3aaba00b72bdad99ff376a0a23a0718e9dfc7b";
const evidenceRoot = path.join(workspaceRoot, "docs/owner-approvals/visual/evidence", approvalId);
const outputIndex = path.join(workspaceRoot, ".tmp/prompt12b-approval-artifact-hashes.json");

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function currentHead() {
  return execFileSync(
    "git",
    ["-c", `safe.directory=${workspaceRoot.replace(/\\/g, "/")}`, "rev-parse", "HEAD"],
    { cwd: workspaceRoot, encoding: "utf8" }
  ).trim();
}

function artifact(group, state, kind, source) {
  return { group, state, kind, source };
}

const artifacts = [];
for (const kind of ["side-by-side", "overlay-difference", "diff"]) {
  artifacts.push(
    artifact(
      "V-01",
      "today-tablet-landscape",
      kind,
      `.tmp/visual-parity/today-owner-review/tablet-landscape/today.${kind}.png`
    )
  );
}
for (const viewport of ["desktop-wide", "desktop-standard", "tablet-landscape", "tablet-portrait", "mobile"]) {
  for (const kind of ["side-by-side", "overlay-difference", "diff"]) {
    artifacts.push(
      artifact(
        "V-02",
        `search-${viewport}`,
        kind,
        `.tmp/visual-parity/prompt-12a-pre-remediation/search-owner-review/${viewport}/search.${kind}.png`
      )
    );
  }
}
for (const kind of ["side-by-side", "overlay-difference", "diff"]) {
  artifacts.push(
    artifact(
      "V-03",
      "canon-desktop-wide",
      kind,
      `.tmp/visual-parity/canon-owner-review/desktop-wide/canon.${kind}.png`
    )
  );
  artifacts.push(
    artifact(
      "V-04",
      "shell-tablet-portrait-open",
      kind,
      `.tmp/visual-parity/shell-owner-review/tablet-portrait/mobile-sidebar-open.${kind}.png`
    )
  );
}

if (currentHead() !== approvedCommit) {
  throw new Error(`Approval evidence may only be materialized from ${approvedCommit}.`);
}
if (fs.existsSync(evidenceRoot)) {
  throw new Error(`Refusing to replace existing owner approval evidence: ${evidenceRoot}`);
}

const records = artifacts.map((entry) => {
  const sourcePath = path.join(workspaceRoot, entry.source);
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing approved Prompt 12A artifact: ${entry.source}`);
  const relativeDestination = path.posix.join(
    "docs/owner-approvals/visual/evidence",
    approvalId,
    entry.group.toLowerCase(),
    `${entry.state}.${entry.kind}.png`
  );
  const destinationPath = path.join(workspaceRoot, relativeDestination);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
  return {
    decisionGroup: entry.group,
    state: entry.state,
    kind: entry.kind,
    path: relativeDestination,
    sha256: sha256(destinationPath),
    bytes: fs.statSync(destinationPath).size
  };
});

fs.mkdirSync(path.dirname(outputIndex), { recursive: true });
fs.writeFileSync(
  outputIndex,
  `${JSON.stringify({ approvalId, approvedCommit, artifactCount: records.length, artifacts: records }, null, 2)}\n`,
  "utf8"
);
console.log(`Materialized ${records.length} immutable owner-review artifacts for ${approvalId}.`);
console.log(path.relative(workspaceRoot, outputIndex));
