"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { readBuild } = require("./runtime-launcher-lib.cjs");
const {
  computeRuntimeSourceIdentity,
  dirtyRuntimePaths,
  evaluateRuntimeIdentityContract,
  loadRuntimeSourceManifest
} = require("./runtime-source-identity.cjs");

const root = path.resolve(__dirname, "../..");
const candidateMode = process.argv.includes("--candidate");
const errors = [];

function absolute(relativePath) {
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Runtime contract path escapes the workspace: ${relativePath}`);
  }
  return resolved;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
}

function sha256(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(absolute(relativePath))).digest("hex");
}

function check(condition, message) {
  if (!condition) errors.push(message);
}

const packageJson = readJson("package.json");
const manifest = readJson("config/runtime/canonical-runtime-manifest.json");
const routes = readJson("config/runtime/route-compatibility-manifest.json");
const assets = readJson("config/runtime/asset-media-compatibility-manifest.json");
const preCutover = readJson("docs/recovery/prompt-22-pre-cutover-manifest.json");
const envExample = fs.readFileSync(absolute(".env.example"), "utf8");
const ownerDecisionPath = `docs/owner-approvals/runtime/${manifest.ownerDecisionId}.md`;
const requiredCutoverDocuments = [
  ownerDecisionPath,
  "docs/architecture/canonical-runtime.md",
  "docs/architecture/runtime-rollback.md",
  "docs/operations/runtime-cutover.md",
  "docs/operations/runtime-rollback-runbook.md",
  "docs/testing/runtime-cutover-acceptance.md",
  "docs/architecture/adr/ADR-006-owner-controlled-local-runtime-cutover.md",
  "docs/recovery/prompt-22-migration-ledger.md",
  "docs/recovery/prompt-22-pre-cutover-manifest.json"
];
const staticCommand = "node --preserve-symlinks-main server.js";
const nextCommand = "node scripts/runtime/start-next.cjs";

check(manifest.schemaVersion === "1.0.0", "Canonical runtime manifest schema differs.");
check(manifest.canonicalRuntime === "next", "Canonical runtime must be Next.");
check(manifest.rollbackRuntime === "static-node", "Rollback runtime must be static Node.");
check(manifest.ownerDecisionId === "TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24", "Owner decision ID differs.");
for (const requiredDocument of requiredCutoverDocuments) {
  check(fs.existsSync(absolute(requiredDocument)), `Required cutover document is missing: ${requiredDocument}`);
}
check(manifest.staticBaselineCommit === "607ec213e84002b1715b1ced9f7925a90a07f26b", "Static baseline commit differs.");
check(
  manifest.cutoverCommit === "PENDING_FINAL_OWNER_CONFIRMATION" ||
    /^[a-f0-9]{40}$/.test(manifest.cutoverCommit),
  "Cutover commit is neither pending final confirmation nor a full Git commit."
);
check(
  manifest.nextBuildId === "PENDING_CANDIDATE_BUILD" ||
    /^[a-z0-9_-]{1,128}$/i.test(manifest.nextBuildId),
  "Next build ID is invalid."
);
check(
  manifest.runtimeSourceCommit === undefined || /^[a-f0-9]{40}$/.test(manifest.runtimeSourceCommit),
  "Runtime source commit is invalid."
);
check(
  manifest.runtimeSourceDigest === undefined || /^[a-f0-9]{64}$/.test(manifest.runtimeSourceDigest),
  "Runtime source digest is invalid."
);
check(manifest.rollbackCommand === "npm run rollback:start", "Rollback command differs.");
check(manifest.gateCProduction === "CLOSED", "Gate C-Production must remain closed.");
check(manifest.publicDeploymentPerformed === false, "The manifest must not claim a public deployment.");
check(
  ["PENDING_CANDIDATE_GATE", "BLOCKED_SECURITY_ADVISORY", "PASS"].includes(manifest.gateCPreview),
  "Gate C-Preview status is invalid."
);
check(
  Object.values(manifest.featureFlagDefaults).every((value) => value === false),
  "A checked-in external feature default is enabled."
);

check(packageJson.scripts["app:start"] === nextCommand, "app:start must use the safe Next launcher.");
check(packageJson.scripts["static:start"] === staticCommand, "static:start must retain the original static runtime.");
check(packageJson.scripts["prototype:start"] === staticCommand, "prototype:start must retain the original static runtime.");
check(packageJson.scripts["rollback:start"] === staticCommand, "rollback:start must retain the original static runtime.");
check(packageJson.scripts["runtime:status"] === "node scripts/runtime/runtime-status.cjs", "runtime:status differs.");
check(packageJson.scripts["runtime:verify"] === "node scripts/runtime/verify-runtime-contract.cjs", "runtime:verify differs.");
check(packageJson.scripts["runtime:dual:verify"] === "node scripts/runtime/verify-dual-runtime.cjs", "runtime:dual:verify differs.");
if (candidateMode) {
  check([staticCommand, nextCommand].includes(packageJson.scripts.start), "Candidate start command is neither the entry static runtime nor Next.");
  check([staticCommand, "next dev"].includes(packageJson.scripts.dev), "Candidate dev command is invalid.");
} else {
  check(packageJson.scripts.start === nextCommand, "npm start does not point to the Next runtime.");
  check(packageJson.scripts.dev === "next dev", "npm run dev does not point to the Next development runtime.");
}

check(
  /^TEOYUBE_LIVE_AI_ENABLED=false$/m.test(envExample) &&
    /^TEOYUBE_ENABLE_LIVE_AI=false$/m.test(envExample),
  "Checked-in live AI is not disabled."
);
check(
  /^TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false$/m.test(envExample) &&
    /^TEOYUBE_ENABLE_VECTOR_RETRIEVAL=false$/m.test(envExample) &&
    /^TEOYUBE_ENABLE_EMBEDDINGS=false$/m.test(envExample) &&
    /^TEOYUBE_ENABLE_BROAD_RAG=false$/m.test(envExample),
  "Checked-in embedding, vector, or broad-RAG defaults are not disabled."
);

check(routes.ownerDecisionId === manifest.ownerDecisionId, "Route manifest owner decision differs.");
check(
  JSON.stringify(routes.publicRoutes.map((item) => item.path)) ===
    JSON.stringify(manifest.publicRoutes.map((item) => item.path)),
  "Canonical and route manifests disagree on retained public routes."
);
for (const route of routes.publicRoutes) {
  const source = route.path === "/"
    ? "src/app/page.tsx"
    : `src/app${route.path}/page.tsx`;
  check(fs.existsSync(absolute(source)), `Retained public route source is missing: ${route.path}`);
}
for (const route of routes.protectedRoutes) {
  const source = `src/app${route.path}/page.tsx`;
  check(fs.existsSync(absolute(source)), `Protected route source is missing: ${route.path}`);
}
const compassSource = fs.readFileSync(absolute("src/app/compass/page.tsx"), "utf8");
check(/permanentRedirect\(`\/calling-compass/.test(compassSource), "The /compass canonical redirect differs.");
check(
  fs.existsSync(absolute("src/app/_runtime/LegacyHashCompatibility.tsx")),
  "Legacy hash compatibility adapter is missing."
);

for (const api of manifest.apiContracts) {
  check(fs.existsSync(absolute(api.source)), `API route source is missing: ${api.path}`);
}
check(
  manifest.apiContracts.length === 31,
  `Expected 31 API route contracts, found ${manifest.apiContracts.length}.`
);

check(
  sha256(assets.protectedVisualSourceManifest.path) === assets.protectedVisualSourceManifest.sha256,
  "Protected visual-source manifest hash differs."
);
check(
  preCutover.hashes.packageLockSha256 === sha256("package-lock.json"),
  "package-lock.json changed after the pre-cutover checkpoint."
);
const publicFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else publicFiles.push(filePath);
  }
}
walk(absolute(assets.publicTree.root));
check(publicFiles.length === assets.publicTree.fileCount, "Public asset file count differs.");
check(
  publicFiles.reduce((total, filePath) => total + fs.statSync(filePath).size, 0) === assets.publicTree.bytes,
  "Public asset byte count differs."
);
for (const requiredPath of [
  assets.media.runtimeManifest,
  assets.media.representativeVideo,
  assets.media.representativePoster
]) {
  check(fs.existsSync(absolute(requiredPath)), `Required asset is missing: ${requiredPath}`);
}
const nextConfig = fs.readFileSync(absolute("next.config.mjs"), "utf8");
check(nextConfig.includes("generateBuildId"), "Deterministic Next generateBuildId is missing.");
check(nextConfig.includes('source: "/public/:path*"'), "Legacy /public asset rewrite is missing.");
check(nextConfig.includes('source: "/styles/:path*"'), "Approved stylesheet rewrite is missing.");
check(nextConfig.includes('source: "/index.html"'), "Legacy /index.html redirect is missing.");

const serializedRuntimeConfig = JSON.stringify({ manifest, routes, assets });
check(!/sk-(?:proj-)?[a-z0-9_-]{16,}/i.test(serializedRuntimeConfig), "Runtime metadata contains a credential-like value.");
check(!/database(?:Url|URL)|apiKey|encryptionSecret/i.test(serializedRuntimeConfig), "Runtime metadata contains a prohibited secret field.");

const build = readBuild(root);
if (!candidateMode) check(build.ready, build.message);
if (manifest.nextBuildId !== "PENDING_CANDIDATE_BUILD" && build.ready) {
  const runtimeSourceManifest = loadRuntimeSourceManifest(root);
  const computedIdentity = computeRuntimeSourceIdentity({ root });
  const identityContract = evaluateRuntimeIdentityContract({
    recorded: manifest,
    computed: computedIdentity,
    buildId: build.buildId,
    dirtyPaths: candidateMode ? [] : dirtyRuntimePaths(root, runtimeSourceManifest),
    staticRollbackRetained: manifest.rollbackRuntime === "static-node",
    featureFlagDefaults: manifest.featureFlagDefaults
  });
  for (const failure of identityContract.failures) check(false, failure);
}

if (errors.length) {
  console.error("CANONICAL RUNTIME CONTRACT: FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("CANONICAL RUNTIME CONTRACT: PASSED");
console.log(
  `Mode: ${candidateMode ? "pre-cutover candidate" : "Next canonical"}; ` +
  `${routes.publicRoutes.length} public routes; ${routes.legacyHashMappings.length} legacy hash mappings; ` +
  `${manifest.apiContracts.length} API contracts; static rollback retained.`
);
