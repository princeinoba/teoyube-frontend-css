"use strict";

/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const baselineRoot = path.join(workspaceRoot, "tests/visual/baselines/owner-approved-support-routes");
const manifestPath = path.join(baselineRoot, "manifest.json");
const sourcePath = path.join(workspaceRoot, "tests/visual/parity/support-route-baseline-source.json");
const approvalId = "TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8";
const approvedCommit = "4c3aaba00b72bdad99ff376a0a23a0718e9dfc7b";
const expectedManifestSha256 = "922f4229a1868448ff609a17d4ffa94e038f04f80f3ffd2906710f4b56fcf439";
const expectedSourceSha256 = "8382c6306e117f5eaff77fcfe66217c09d720859a42914afbf59a5bdf9648d51";
const expectedMarkdownSha256 = "6a063d8c84e2fd5f7f01a0ed95121668e3755f020d1348e01064736ddf1514bc";
const expectedJsonSha256 = "0c021d49436e0c25306900ee4bfae46d3e015b18f4fc312b6488a251e39f1d6f";

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

const manifest = readJson(manifestPath);
const source = readJson(sourcePath);
const approvalMarkdownPath = path.join(
  workspaceRoot,
  "docs/owner-approvals/visual/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8.md"
);
const approvalJsonPath = path.join(
  workspaceRoot,
  "docs/owner-approvals/visual/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8.json"
);
const approval = readJson(approvalJsonPath);

assert(sha256(manifestPath) === expectedManifestSha256, "Owner-approved support manifest changed without a newer approval.");
assert(sha256(sourcePath) === expectedSourceSha256, "Support-route source mapping changed without a newer approval.");
assert(sha256(approvalMarkdownPath) === expectedMarkdownSha256, "Owner-authored Markdown decision changed.");
assert(sha256(approvalJsonPath) === expectedJsonSha256, "Machine-readable owner decision changed.");
assert(manifest.approvalId === approvalId && approval.approvalId === approvalId, "Approval ID binding differs.");
assert(manifest.approvedCommit === approvedCommit && approval.currentCommit === approvedCommit, "Approved commit binding differs.");
assert(manifest.sourceRuntime === "next-preview" && manifest.canonicalRuntime === "static-node-app", "Runtime binding differs.");
assert(JSON.stringify(manifest.routes) === JSON.stringify(source.routes), "Approved support-route mapping differs.");
assert(JSON.stringify(manifest.viewports) === JSON.stringify(source.viewports), "Approved support viewport mapping differs.");
assert(manifest.routes.length === 10 && manifest.viewports.length === 6, "Expected ten routes and six viewports.");
assert(manifest.captures.length === 60, `Expected 60 support-route cells, found ${manifest.captures.length}.`);
assert(approval.ownerIdentity === "Teoyube Project Owner", "Owner identity differs.");
assert(approval.approvedArtifacts.length === 24, "Expected 24 approved raster-review artifacts.");

const artifactPaths = new Set(["manifest.json"]);
for (const capture of manifest.captures) {
  const definition = source.routes.find((entry) => entry.route === capture.route);
  const viewport = source.viewports.find((entry) => entry.name === capture.viewport);
  assert(definition && definition.slug === capture.slug, `Unknown route mapping in ${capture.route}/${capture.viewport}.`);
  assert(viewport && viewport.width === capture.width && viewport.height === capture.height, `Viewport differs for ${capture.route}/${capture.viewport}.`);
  assert(capture.status === "OWNER_APPROVED_SOURCE_BASELINE", `Invalid status for ${capture.route}/${capture.viewport}.`);
  for (const key of ["screenshot", "prompt12aContract", "contract"]) {
    const record = capture[key];
    const filePath = path.join(workspaceRoot, record.path);
    assert(filePath.startsWith(`${baselineRoot}${path.sep}`), `Artifact escaped baseline root: ${record.path}`);
    assert(fs.existsSync(filePath), `Missing support-route artifact: ${record.path}`);
    assert(sha256(filePath) === record.sha256, `Hash mismatch: ${record.path}`);
    assert(fs.statSync(filePath).size === record.bytes, `Size mismatch: ${record.path}`);
    artifactPaths.add(path.relative(baselineRoot, filePath).replace(/\\/g, "/"));
  }
  const screenshotDimensions = dimensions(path.join(workspaceRoot, capture.screenshot.path));
  assert(screenshotDimensions.width === capture.width && screenshotDimensions.height === capture.height, `PNG dimensions differ for ${capture.route}/${capture.viewport}.`);
  const contract = readJson(path.join(workspaceRoot, capture.contract.path));
  for (const key of ["orderedDom", "ids", "classLists", "majorRegions", "assets", "visibleLabels", "interactiveControls", "focusOrder", "responsiveNavigation"]) {
    assert(Array.isArray(contract[key]), `${capture.contract.path} lacks ${key}.`);
  }
  assert(contract.orderedDom.length === capture.contractSummary.orderedDom, `DOM count differs for ${capture.route}/${capture.viewport}.`);
  assert(contract.classLists.length === capture.contractSummary.classLists, `Class count differs for ${capture.route}/${capture.viewport}.`);
  assert(contract.assets.length === capture.contractSummary.assets, `Asset count differs for ${capture.route}/${capture.viewport}.`);
  assert(contract.focusOrder.length === capture.contractSummary.focusOrder, `Focus-order count differs for ${capture.route}/${capture.viewport}.`);
  assert(capture.prompt12bRecapture.strictPassed === true, `Approved recapture did not pass for ${capture.route}/${capture.viewport}.`);
}

const actualBaselineFiles = filesRecursively(baselineRoot).map((filePath) =>
  path.relative(baselineRoot, filePath).replace(/\\/g, "/")
);
assert(actualBaselineFiles.length === 181, `Expected 181 support baseline files, found ${actualBaselineFiles.length}.`);
assert(actualBaselineFiles.every((filePath) => artifactPaths.has(filePath)), "Unexpected file exists in support baseline directory.");

for (const record of approval.approvedArtifacts) {
  const filePath = path.join(workspaceRoot, record.path);
  assert(fs.existsSync(filePath), `Missing approved raster evidence: ${record.path}`);
  assert(sha256(filePath) === record.sha256, `Approved raster evidence hash differs: ${record.path}`);
  assert(fs.statSync(filePath).size === record.bytes, `Approved raster evidence size differs: ${record.path}`);
}

const supportStatuses = readJson(path.join(workspaceRoot, "tests/visual/parity/support-route-status.json"));
for (const definition of source.routes) {
  const status = supportStatuses.find((entry) => entry.route === definition.route);
  if (definition.route === "/dashboard") {
    assert(status?.visibility === "DEVELOPMENT_ONLY" && status?.gateStatus === "NOT_APPLICABLE_INTERNAL_ROUTE", "/dashboard supersession differs.");
  } else {
    assert(status?.visibility === "RETAINED_PUBLIC" && status?.gateStatus === "PASS", `${definition.route} lacks its current terminal status.`);
  }
}
assert(supportStatuses.find((entry) => entry.route === "/graph")?.gateStatus === "NOT_APPLICABLE_INTERNAL_ROUTE", "/graph is not internal-only.");
assert(supportStatuses.find((entry) => entry.route === "/compass")?.paritySource === "CANONICAL_REDIRECT", "/compass redirect source differs.");
assert(supportStatuses.find((entry) => entry.route === "/compass")?.gateStatus === "PASS", "/compass redirect status differs.");

const shellSource = fs.readFileSync(path.join(workspaceRoot, "src/app/_shell/ApprovedTeoyubeShell.tsx"), "utf8");
assert(!/href:\s*["']\/graph["']/.test(shellSource), "/graph appears in normal public navigation.");
const compassSource = fs.readFileSync(path.join(workspaceRoot, "src/app/compass/page.tsx"), "utf8");
assert(/permanentRedirect\(`\/calling-compass/.test(compassSource), "/compass is not a permanent canonical redirect.");
assert(!/CallingCompassScreenshotPage/.test(compassSource), "/compass still maintains a duplicate visual surface.");

console.log("OWNER-APPROVED SUPPORT ROUTE BASELINES: PASSED");
console.log("Approval: TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8");
console.log("Verified: 10 routes, 6 viewports, 60 screenshots, 120 DOM/asset contracts, 24 owner-review artifacts.");
