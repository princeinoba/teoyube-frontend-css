"use strict";

/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const baselineRoot = path.join(workspaceRoot, "tests/visual/baselines/owner-approved-next-support");
const manifestPath = path.join(baselineRoot, "manifest.json");
const sourcePath = path.join(workspaceRoot, "tests/visual/parity/owner-approved-next-support-source.json");
const amendmentPath = path.join(workspaceRoot, "docs/owner-approvals/visual/TEOYUBE-OWNER-ROUTE-AMENDMENT-2026-07-20-P12D.md");
const amendmentId = "TEOYUBE-OWNER-ROUTE-AMENDMENT-2026-07-20-P12D";
const evidenceCommit = "750862ded54898d64f36b8e074f77e88f8ce3920";
const expectedManifestSha256 = "9b8492f83366400a2a846e9713f64e2c2bb8e0a8a46c1263449fb01a82937283";
const expectedSourceSha256 = "c8a9aed390d6fa8f5c789e3fc3af61e345dd3563e72000fae95f8f840333da48";
const expectedAmendmentSha256 = "fdd9c3946ab0ac3dbd5a6c38f6ecc451468f7c5fd4982d9f86fa1916898d1d17";

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function filesRecursively(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesRecursively(target) : [target];
  });
}

function dimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  assert(buffer.subarray(1, 4).toString("ascii") === "PNG", `${filePath} is not a PNG.`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

assert(fs.existsSync(manifestPath), "Prompt 12D support baseline manifest is missing.");
const manifest = readJson(manifestPath);
const source = readJson(sourcePath);
assert(sha256(manifestPath) === expectedManifestSha256, "Prompt 12D support manifest changed without a newer approval.");
assert(sha256(sourcePath) === expectedSourceSha256, "Prompt 12D source definition changed.");
assert(sha256(amendmentPath) === expectedAmendmentSha256, "Prompt 12D owner amendment changed.");
assert(manifest.amendmentId === amendmentId && source.amendmentId === amendmentId, "Prompt 12D amendment binding differs.");
assert(manifest.evidenceCommit === evidenceCommit && source.evidenceCommit === evidenceCommit, "Prompt 12D evidence commit differs.");
assert(manifest.sourceRuntime === "next-preview" && manifest.canonicalRuntime === "static-node-app", "Runtime binding differs.");
assert(manifest.routes.length === 9 && manifest.viewports.length === 6, "Expected nine support routes and six viewports.");
assert(manifest.captures.length === 70, `Expected 70 support captures, found ${manifest.captures.length}.`);
assert(!manifest.routes.some((entry) => entry.route === "/dashboard"), "Dashboard entered the public support baseline.");
assert(JSON.stringify(manifest.routes) === JSON.stringify(source.routes), "Support route definitions differ.");
assert(JSON.stringify(manifest.viewports) === JSON.stringify(source.viewports), "Support viewport definitions differ.");

const artifactPaths = new Set(["manifest.json"]);
for (const capture of manifest.captures) {
  assert(capture.amendmentId === amendmentId && capture.evidenceCommit === evidenceCommit, `Capture binding differs for ${capture.route}/${capture.viewport}/${capture.state}.`);
  const definition = source.routes.find((entry) => entry.route === capture.route);
  const viewport = source.viewports.find((entry) => entry.name === capture.viewport);
  assert(definition && definition.slug === capture.slug, `Unknown route ${capture.route}.`);
  assert(viewport && viewport.width === capture.width && viewport.height === capture.height, `Viewport differs for ${capture.route}/${capture.viewport}.`);
  for (const key of ["screenshot", "contract", "audit"]) {
    const record = capture[key];
    const filePath = path.join(workspaceRoot, record.path);
    assert(filePath.startsWith(`${baselineRoot}${path.sep}`), `Artifact escaped baseline root: ${record.path}`);
    assert(fs.existsSync(filePath), `Missing Prompt 12D artifact: ${record.path}`);
    assert(sha256(filePath) === record.sha256, `Hash mismatch: ${record.path}`);
    assert(fs.statSync(filePath).size === record.bytes, `Size mismatch: ${record.path}`);
    artifactPaths.add(path.relative(baselineRoot, filePath).replace(/\\/g, "/"));
  }
  const png = dimensions(path.join(workspaceRoot, capture.screenshot.path));
  assert(png.width === capture.width && png.height === capture.height, `PNG dimensions differ for ${capture.route}/${capture.viewport}/${capture.state}.`);
  const contract = readJson(path.join(workspaceRoot, capture.contract.path));
  for (const key of ["orderedDom", "ids", "classLists", "majorRegions", "assets", "visibleLabels", "interactiveControls", "focusOrder", "responsiveNavigation"]) assert(Array.isArray(contract[key]), `${capture.contract.path} lacks ${key}.`);
  const audit = readJson(path.join(workspaceRoot, capture.audit.path));
  assert(Array.isArray(audit.issues) && Array.isArray(audit.focusOrder), `${capture.audit.path} lacks accessibility evidence.`);
  assert(audit.storage.local === 0 && audit.storage.session === 0, `${capture.audit.path} contains a browser write.`);
}

const files = filesRecursively(baselineRoot).map((filePath) => path.relative(baselineRoot, filePath).replace(/\\/g, "/"));
assert(files.length === 211, `Expected 211 files in the Prompt 12D baseline, found ${files.length}.`);
assert(files.every((filePath) => artifactPaths.has(filePath)), "Unexpected file exists in the Prompt 12D support baseline.");

for (const definition of source.routes) {
  const routeSource = path.join(workspaceRoot, "src/app", definition.slug, "page.tsx");
  assert(sha256(routeSource) === definition.sourceSha256, `${definition.route} no longer matches the approved source.`);
}

const statuses = readJson(path.join(workspaceRoot, "tests/visual/parity/support-route-status.json"));
assert(statuses.length === 26, `Expected 26 non-static route records, found ${statuses.length}.`);
for (const definition of source.routes) {
  const status = statuses.find((entry) => entry.route === definition.route);
  assert(status?.visibility === "RETAINED_PUBLIC" && status?.paritySource === "OWNER_APPROVED_NEXT_SUPPORT" && status?.gateStatus === "PASS", `${definition.route} lacks its Prompt 12D PASS taxonomy.`);
}
for (const route of ["/prayer", "/journey", "/journal"]) {
  const status = statuses.find((entry) => entry.route === route);
  assert(status?.visibility === "RETAINED_PUBLIC" && status?.paritySource === "FROZEN_PRE_MIGRATION" && status?.gateStatus === "PASS", `${route} lacks its frozen-contract PASS taxonomy.`);
}
assert(statuses.find((entry) => entry.route === "/compass")?.paritySource === "CANONICAL_REDIRECT", "Compass redirect taxonomy differs.");
assert(statuses.find((entry) => entry.route === "/compass")?.gateStatus === "PASS", "Compass redirect is not PASS.");
assert(statuses.find((entry) => entry.route === "/dashboard")?.visibility === "DEVELOPMENT_ONLY", "Dashboard is not development-only.");
assert(statuses.find((entry) => entry.route === "/dashboard")?.gateStatus === "NOT_APPLICABLE_INTERNAL_ROUTE", "Dashboard has a public PASS.");
assert(statuses.every((entry) => entry.gateStatus !== "NOT_VERIFIED"), "A route remains NOT_VERIFIED.");

const shell = fs.readFileSync(path.join(workspaceRoot, "src/app/_shell/ApprovedTeoyubeShell.tsx"), "utf8");
for (const route of ["/dashboard", "/graph", "/roadmap", "/tig", "/dev/teoyube-health"]) assert(!shell.includes(`href: "${route}"`), `${route} appears in normal public navigation.`);
const compass = fs.readFileSync(path.join(workspaceRoot, "src/app/compass/page.tsx"), "utf8");
assert(/permanentRedirect\(`\/calling-compass/.test(compass), "Compass is not a permanent canonical redirect.");
assert(/assessment/.test(compass) && /topic/.test(compass), "Compass does not preserve its safe relevant query contract.");

console.log("PROMPT 12D OWNER-APPROVED NEXT SUPPORT BASELINES: PASSED");
console.log(`Amendment: ${amendmentId}`);
console.log("Verified: 9 retained support routes, 6 viewports, 54 default captures, 16 interaction captures, and 3 frozen pre-migration route classifications.");
