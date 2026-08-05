#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { computeRuntimeSourceIdentity } = require("../runtime/runtime-source-identity.cjs");

const root = path.resolve(__dirname, "../..");
const approvedPath = path.join(root, "src/app/_approved-source/approved-view-markup.generated.ts");
const runtimePath = path.join(root, "config/runtime/canonical-runtime-manifest.json");

function approvedSourceDigest() {
  const hash = crypto.createHash("sha256");
  for (const relativePath of ["index.html", "app.js", "phase116b1.js"]) {
    hash.update(relativePath);
    hash.update(fs.readFileSync(path.join(root, relativePath)));
  }
  return hash.digest("hex");
}

function sync() {
  const approvedDigest = approvedSourceDigest();
  const approved = fs.readFileSync(approvedPath, "utf8");
  const matches = [...approved.matchAll(/"sourceDigest":"([a-f0-9]{64})"/g)];
  if (matches.length !== 1) throw new Error(`Expected one approved source digest, found ${matches.length}.`);
  fs.writeFileSync(approvedPath, approved.replace(matches[0][0], `"sourceDigest":"${approvedDigest}"`), "utf8");

  const identity = computeRuntimeSourceIdentity({ root });
  const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
  runtime.runtimeSourceDigest = identity.digest;
  runtime.nextBuildId = identity.buildId;
  runtime.verifiedAt = new Date().toISOString();
  fs.writeFileSync(runtimePath, `${JSON.stringify(runtime, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ status: "SYNCED", approvedSourceDigest: approvedDigest, runtimeSourceDigest: identity.digest, nextBuildId: identity.buildId, sourceFileCount: identity.sourceFileCount }, null, 2));
}

function verify() {
  const errors = [];
  const approved = fs.readFileSync(approvedPath, "utf8");
  const approvedRecorded = approved.match(/"sourceDigest":"([a-f0-9]{64})"/)?.[1];
  if (approvedRecorded !== approvedSourceDigest()) errors.push("Approved markup source digest is stale.");
  const identity = computeRuntimeSourceIdentity({ root });
  const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
  if (runtime.runtimeSourceDigest !== identity.digest || runtime.nextBuildId !== identity.buildId) errors.push("Canonical runtime identity is stale.");
  console.log(JSON.stringify({ status: errors.length ? "FAIL" : "PASS", approvedSourceDigest: approvedRecorded, runtimeSourceDigest: identity.digest, nextBuildId: identity.buildId, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

if ((process.argv[2] || "verify") === "sync") sync();
else verify();
