"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const path = require("node:path");
const { readBuild } = require("./runtime-launcher-lib.cjs");
const { computeRuntimeSourceIdentity } = require("./runtime-source-identity.cjs");

const root = path.resolve(__dirname, "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const packageJson = readJson("package.json");
const manifest = readJson("config/runtime/canonical-runtime-manifest.json");
const build = readBuild(root);
const computedIdentity = computeRuntimeSourceIdentity({ root });

console.log(JSON.stringify({
  schemaVersion: 1,
  canonicalRuntime: manifest.canonicalRuntime,
  canonicalCommand: packageJson.scripts.start,
  rollbackRuntime: manifest.rollbackRuntime,
  rollbackCommand: manifest.rollbackCommand,
  ownerDecisionId: manifest.ownerDecisionId,
  cutoverCommit: manifest.cutoverCommit,
  nextBuildReady: build.ready,
  nextBuildId: build.buildId,
  expectedNextBuildId: computedIdentity.buildId,
  buildIdentityDeterministic: build.ready && build.buildId === computedIdentity.buildId,
  runtimeSourceDigest: computedIdentity.digest,
  buildIdGeneratorVersion: computedIdentity.generatorVersion,
  deployment: manifest.deployment,
  gateCPreview: manifest.gateCPreview,
  gateCProduction: manifest.gateCProduction,
  publicDeploymentPerformed: manifest.publicDeploymentPerformed,
  checkedInFeatureDefaults: manifest.featureFlagDefaults
}, null, 2));
