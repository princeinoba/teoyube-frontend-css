/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "../..");
const authorizationId = "TEOYUBE-AUG21-VECTOR-V2-EVIDENCE-BINDING-2026-08-09-001";
const baseCommit = "6a2b50e3f16564a2bfc6fdeda17946c12bcc2e1c";
const qualityCommit = "a68d5ae167daac01c8981e8cb83caae9d135c828";
const expectedAttestationSha256 = "50bd8d02ff745cd2478caf745bb5f8230168b022e9f22c52f31c38d13b12757f";
const attestationPath = path.join(
  projectRoot,
  "docs/owner-approvals/visual/evidence",
  authorizationId,
  "protected-object-reconciliation.json"
);
const controllerPaths = Object.freeze([
  "tests/visual/contracts/protected-visual-source-manifest.json",
  "tests/visual/contracts/static-dom-contract.json",
  "tests/visual/contracts/original-static-visual-contract.json",
  "tests/visual/contracts/owner-approved-scripture-content-delta.json",
  "tests/visual/baselines/static-runtime/manifest.json",
  "config/accessibility/approved-phase-5c1-deltas.json",
  "config/accessibility/approved-phase-5c2-deltas.json",
  "config/accessibility/approved-phase-5c3a-deltas.json",
  "docs/owner-approvals/accessibility/TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001.json",
  "docs/owner-approvals/accessibility/TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001.json"
]);

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(projectRoot, relative), "utf8"));
const aggregate = (records) => sha256(Buffer.from(records.map((entry) => `${entry.path}\0${entry.bytes}\0${entry.sha256}`).join("\n"), "utf8"));
const exactKeys = (value, expected) => value && typeof value === "object" &&
  JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());

function verifyProtectedVisualReconciliation(options = {}) {
  const failures = [];
  const overrideBytesByPath = options.overrideBytesByPath || new Map();
  if (!fs.existsSync(attestationPath)) {
    return { valid: false, failures: ["Protected-object reconciliation attestation is missing."], approvedByPath: new Map() };
  }
  const attestationBytes = fs.readFileSync(attestationPath);
  if (sha256(attestationBytes) !== expectedAttestationSha256) failures.push("Attestation bytes changed.");
  let attestation;
  try { attestation = JSON.parse(attestationBytes.toString("utf8")); }
  catch { return { valid: false, failures: ["Attestation JSON is invalid."], approvedByPath: new Map() }; }
  if (!exactKeys(attestation, ["schemaVersion", "authorizationId", "purpose", "repository", "branch", "lineage", "historicalApprovalIds", "invariants", "inventories"])) failures.push("Attestation top-level schema changed.");
  if (attestation.schemaVersion !== 1 || attestation.authorizationId !== authorizationId) failures.push("Attestation authorization identity changed.");
  if (attestation.lineage?.approvedRemoteBaseCommit !== baseCommit || attestation.lineage?.qualitySourceCommit !== qualityCommit) failures.push("Attestation lineage changed.");
  if (attestation.invariants?.protectedVisualChanges !== 0 || attestation.invariants?.immutableBaselineWrites !== 0 || attestation.invariants?.snapshotUpdates !== 0 || attestation.invariants?.globalSuppressions !== 0) failures.push("Attestation zero-mutation invariants changed.");
  for (const [ancestor, descendant, label] of [[baseCommit, qualityCommit, "base-to-quality"], [qualityCommit, "HEAD", "quality-to-current"]]) {
    try { execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], { cwd: projectRoot }); }
    catch { failures.push(`Required ${label} ancestry is missing.`); }
  }
  const protectedManifest = readJson("tests/visual/contracts/protected-visual-source-manifest.json");
  const runtimeManifest = readJson("tests/visual/baselines/static-runtime/manifest.json");
  const visualContract = readJson("tests/visual/contracts/original-static-visual-contract.json");
  const expected = {
    protectedSources: new Map(protectedManifest.files.map((entry) => [entry.path, entry])),
    immutableRuntimeBaselines: new Map(runtimeManifest.artifacts.map((entry) => [entry.path, entry])),
    ownerReferenceScreenshots: new Map(visualContract.referenceScreenshots.map((entry) => [entry.path, entry])),
    controllerInputs: new Map(controllerPaths.map((entry) => [entry, { path: entry }]))
  };
  const approvedByPath = new Map();
  for (const [inventoryName, expectedMap] of Object.entries(expected)) {
    const inventory = attestation.inventories?.[inventoryName];
    const records = Array.isArray(inventory?.objects) ? inventory.objects : [];
    if (inventory?.count !== expectedMap.size || records.length !== expectedMap.size) failures.push(`${inventoryName}: inventory count changed.`);
    if (new Set(records.map((entry) => entry.path)).size !== records.length) failures.push(`${inventoryName}: duplicate paths found.`);
    if (aggregate(records) !== inventory?.aggregateSha256) failures.push(`${inventoryName}: aggregate hash changed.`);
    for (const record of records) {
      const historical = expectedMap.get(record.path);
      if (!historical) { failures.push(`${inventoryName}: unrecognized path ${record.path}.`); continue; }
      const absolute = path.resolve(projectRoot, record.path);
      if (!absolute.startsWith(`${projectRoot}${path.sep}`) || !fs.existsSync(absolute)) { failures.push(`${record.path}: current object is missing or unsafe.`); continue; }
      const bytes = overrideBytesByPath.get(record.path) || fs.readFileSync(absolute);
      const digest = sha256(bytes);
      if (bytes.length !== record.bytes || digest !== record.sha256) failures.push(`${record.path}: current bytes differ from the attested approved counterpart.`);
      if (inventoryName === "protectedSources") {
        if (record.historicalBaseline?.bytes !== historical.sizeBytes || record.historicalBaseline?.sha256 !== historical.sha256) failures.push(`${record.path}: historical source provenance changed.`);
        approvedByPath.set(record.path, { bytes: record.bytes, sha256: record.sha256 });
      } else if (inventoryName === "immutableRuntimeBaselines") {
        if (record.bytes !== historical.bytes || record.sha256 !== historical.sha256 || record.kind !== historical.kind) failures.push(`${record.path}: immutable baseline manifest binding changed.`);
      } else if (inventoryName === "ownerReferenceScreenshots") {
        if (record.bytes !== historical.bytes || record.sha256 !== historical.sha256) failures.push(`${record.path}: owner-reference contract binding changed.`);
      }
    }
    for (const expectedPath of expectedMap.keys()) if (!records.some((entry) => entry.path === expectedPath)) failures.push(`${inventoryName}: missing ${expectedPath}.`);
  }
  return { valid: failures.length === 0, failures, approvedByPath, attestation, attestationSha256: sha256(attestationBytes) };
}

if (require.main === module) {
  const result = verifyProtectedVisualReconciliation();
  console.log(JSON.stringify({
    status: result.valid ? "PASS" : "FAIL",
    authorizationId,
    attestationSha256: result.attestationSha256 || null,
    protectedSources: result.attestation?.inventories?.protectedSources?.count || 0,
    immutableRuntimeBaselines: result.attestation?.inventories?.immutableRuntimeBaselines?.count || 0,
    ownerReferenceScreenshots: result.attestation?.inventories?.ownerReferenceScreenshots?.count || 0,
    failures: result.failures
  }, null, 2));
  if (!result.valid) process.exitCode = 1;
}

module.exports = { attestationPath, verifyProtectedVisualReconciliation };
