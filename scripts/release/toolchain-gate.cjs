"use strict";

const fs = require("node:fs");
const {
  absolute,
  currentIdentity,
  git,
  readJson,
  sha256File,
  writeJson
} = require("./release-utils.cjs");

const policy = readJson("config/release-gate-policy.json");
const packageJson = readJson("package.json");
const lock = readJson("package-lock.json");
const identity = currentIdentity();
const envExample = fs.readFileSync(absolute(".env.example"), "utf8");
const checks = [];

function check(id, passed, evidence) {
  checks.push(Object.freeze({ id, passed, evidence }));
}

check("branch", identity.branch === "recovery/visual-source-of-truth", identity.branch);
check("node", identity.node === policy.toolchain.node, identity.node);
check("npm", identity.npm === policy.toolchain.npm, identity.npm);
check("package-manager", packageJson.packageManager === `npm@${policy.toolchain.npm}`, packageJson.packageManager);
check("canonical-next-start", packageJson.scripts.start === policy.runtime.canonicalStart, packageJson.scripts.start);
check(
  "protected-static-rollback",
  packageJson.scripts["static:start"] === policy.runtime.rollbackStart &&
    packageJson.scripts["prototype:start"] === policy.runtime.rollbackStart &&
    packageJson.scripts["rollback:start"] === policy.runtime.rollbackStart,
  {
    staticStart: packageJson.scripts["static:start"],
    prototypeStart: packageJson.scripts["prototype:start"],
    rollbackStart: packageJson.scripts["rollback:start"]
  }
);
check(
  "checked-in-live-ai-disabled",
  /^TEOYUBE_LIVE_AI_ENABLED=false$/m.test(envExample),
  "TEOYUBE_LIVE_AI_ENABLED=false"
);
check(
  "checked-in-vector-disabled",
  /^TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false$/m.test(envExample),
  "TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false"
);
check(
  "next-canonical-local",
  policy.runtime.nextStatus === "canonical_local" &&
    packageJson.scripts.start === packageJson.scripts["app:start"],
  { start: packageJson.scripts.start, appStart: packageJson.scripts["app:start"] }
);
check(
  "production-gate-closed",
  policy.runtime.gateCProduction === "closed" &&
    policy.runtime.publicDeploymentPerformed === false,
  {
    gateCProduction: policy.runtime.gateCProduction,
    publicDeploymentPerformed: policy.runtime.publicDeploymentPerformed
  }
);
check(
  "lockfile-version",
  lock.lockfileVersion === 3 && lock.packages?.[""]?.name === packageJson.name,
  { lockfileVersion: lock.lockfileVersion, rootName: lock.packages?.[""]?.name }
);
const rootLock = lock.packages?.[""] || {};
const dependencyMatch =
  JSON.stringify(rootLock.dependencies || {}) === JSON.stringify(packageJson.dependencies || {}) &&
  JSON.stringify(rootLock.devDependencies || {}) === JSON.stringify(packageJson.devDependencies || {});
check("lockfile-root-dependencies", dependencyMatch, { packageLockSha256: sha256File("package-lock.json") });
check(
  "starting-lineage",
  require("node:child_process").spawnSync(
    "git",
    ["merge-base", "--is-ancestor", policy.startingCommit, "HEAD"],
    { cwd: absolute("."), stdio: "ignore" }
  ).status === 0,
  { startingCommit: policy.startingCommit, currentCommit: identity.commit }
);
check(
  "protected-path-diff",
  git([
    "diff",
    "--name-only",
    `${policy.startingCommit}..HEAD`,
    "--",
    "index.html",
    "styles",
    "styles.css",
    "public",
    "Asset",
    "tests/visual/baselines",
    "tests/visual/contracts"
  ]).length === 0,
  { changed: 0 }
);

const failed = checks.filter((item) => !item.passed);
const result = Object.freeze({
  schemaVersion: 1,
  gateVersion: "teoyube-toolchain-gate-2026-07-24.1",
  generatedAt: new Date().toISOString(),
  identity,
  policyVersion: policy.policyVersion,
  packageLockSha256: sha256File("package-lock.json"),
  checks,
  result: failed.length === 0 ? "PASS" : "BLOCKED"
});
writeJson("artifacts/release-evidence/environment.json", result);
console.log(`REPOSITORY/TOOLCHAIN GATE: ${result.result} (${checks.length} checks; failed ${failed.length})`);
if (failed.length) process.exitCode = 1;
