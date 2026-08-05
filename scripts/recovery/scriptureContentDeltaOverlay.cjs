/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const {
  revertApprovedPhase5c1Source,
  verifyPhase5c1Delta
} = require("../accessibility/phase5c1DeltaContract.cjs");

const projectRoot = path.resolve(__dirname, "../..");
const contractPath = path.join(projectRoot, "tests/visual/contracts/owner-approved-scripture-content-delta.json");
const expectedDecisionId = "TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B";
const expectedEvidenceCommit = "4da2adfaa784039c5250a894fdcbd4c4aea64e82";
const expectedInventorySha256 = "f6108e8617786464888dcbabb3f48899ed5a113d4d3851af947ced776d91d68c";
const expectedArchiveSha256 = "4253589697dc6b5e92695655f2f28792d50e7be7b9c8e212af4f4bd18e866c3b";
const allowedPaths = new Set([
  "app.js",
  "index.html",
  "scripts/seedDB.js",
  "src/app/_approved-source/approved-view-markup.generated.ts",
  "src/app/_today/ApprovedTodayView.tsx"
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePath(value) {
  return value.replaceAll("\\", "/");
}

function gitSource(relativePath) {
  return execFileSync(
    "git",
    ["-c", `safe.directory=${normalizePath(projectRoot)}`, "show", `${expectedEvidenceCommit}:${relativePath}`],
    { cwd: projectRoot, maxBuffer: 16 * 1024 * 1024 }
  );
}

function markupSignature(value) {
  return [...value.matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi)].map((match) => match[0].replace(/>[^>]*$/, ">"));
}

function generatedMarkupPayload(bytes) {
  const source = bytes.toString("utf8");
  const prefix = "export const APPROVED_VIEW_MARKUP = ";
  const start = source.indexOf(prefix);
  const end = source.lastIndexOf(" as const;");
  if (start < 0 || end < 0) throw new Error("unexpected generated module shape");
  return JSON.parse(source.slice(start + prefix.length, end));
}

function generatedStructure(value, keyPath = "root", records = []) {
  if (typeof value === "string") {
    const tags = (value.match(/<\/?[a-z][^>]*>/gi) || []).map((tag) => {
      const name = tag.match(/^<\/?([a-z][a-z0-9-]*)/i)?.[1]?.toLowerCase() || "";
      const closing = /^<\//.test(tag);
      const id = tag.match(/\bid=["']([^"']*)["']/i)?.[1] || "";
      const classes = tag.match(/\bclass=["']([^"']*)["']/i)?.[1] || "";
      return `${closing ? "/" : ""}${name}#${id}.${classes}`;
    });
    if (tags.length) records.push([keyPath, tags]);
    return records;
  }
  if (Array.isArray(value)) value.forEach((child, index) => generatedStructure(child, `${keyPath}[${index}]`, records));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, child]) => generatedStructure(child, `${keyPath}.${key}`, records));
  return records;
}

function verifyScriptureContentDelta() {
  const failures = [];
  const phase5c1Delta = verifyPhase5c1Delta();
  if (!phase5c1Delta.valid) {
    phase5c1Delta.failures.forEach((failure) => failures.push(`Phase 5C-1 accessibility delta: ${failure}`));
  }
  if (!fs.existsSync(contractPath)) return { valid: false, failures: ["Owner-approved Scripture content-delta contract is missing."], approvedByPath: new Map() };

  const contractBytes = fs.readFileSync(contractPath);
  const contract = JSON.parse(contractBytes.toString("utf8"));
  const inventoryPath = path.resolve(projectRoot, contract.inventoryPath || "");
  if (contract.decisionId !== expectedDecisionId) failures.push("Owner decision ID changed.");
  if (contract.evidenceCommit !== expectedEvidenceCommit) failures.push("Prompt 15A evidence commit changed.");
  if (contract.inventorySha256 !== expectedInventorySha256) failures.push("Bound inventory checksum changed in the contract.");
  if (contract.archiveSha256 !== expectedArchiveSha256) failures.push("Bound WEB archive checksum changed in the contract.");
  if (contract.historicalBaselinesRemainReadOnly !== true) failures.push("Historical baselines must remain read-only.");
  if (contract.staticRuntime !== "CANONICAL" || contract.nextRuntime !== "PREVIEW_ONLY") failures.push("Runtime authority changed.");
  if (contract.pgpSignatureVerification !== "NOT_PERFORMED" || contract.ownerResidualRiskAcceptance !== true) failures.push("The recorded PGP verification status or owner residual-risk decision changed.");

  if (!fs.existsSync(inventoryPath)) failures.push("Bound Prompt 15A inventory is missing.");
  else if (sha256(fs.readFileSync(inventoryPath)) !== expectedInventorySha256) failures.push("Bound Prompt 15A inventory bytes changed.");

  const inventory = fs.existsSync(inventoryPath) ? JSON.parse(fs.readFileSync(inventoryPath, "utf8")) : { visibleProductRecords: [] };
  const inventoryById = new Map((inventory.visibleProductRecords || []).map((record) => [record.id, record]));
  if (inventoryById.size !== 17) failures.push(`Expected 17 visible legacy quotation records; found ${inventoryById.size}.`);

  const records = contract.records || [];
  if (records.length !== 17 || new Set(records.map((record) => record.id)).size !== 17) failures.push("Content-delta contract must contain exactly 17 unique records.");
  for (const record of records) {
    const source = inventoryById.get(record.id);
    if (!source) {
      failures.push(`${record.id}: missing from bound inventory.`);
      continue;
    }
    if (record.ownerDecision !== "REPLACE_WITH_EXACT_WEB") failures.push(`${record.id}: owner decision changed.`);
    if (record.validationResult !== "PASS_EXACT_WEB_SOURCE_AND_CONTENT_DELTA") failures.push(`${record.id}: content-delta validation is incomplete.`);
    if (record.existingWording !== source.currentText || record.existingWordingSha256 !== sha256(Buffer.from(source.currentText, "utf8"))) failures.push(`${record.id}: legacy wording evidence changed.`);
    if (record.exactWebWording !== source.exactWebText || record.exactWebWordingSha256 !== sha256(Buffer.from(source.exactWebText, "utf8"))) failures.push(`${record.id}: exact WEB wording differs from the bound inventory.`);
  }

  const artifactBindings = contract.contentDeltaArtifacts || [];
  if (artifactBindings.length !== 1) failures.push("Expected one bound Scripture content-delta artifact manifest.");
  else {
    const binding = artifactBindings[0];
    const relativePath = normalizePath(binding.manifestPath || "");
    const expectedPath = "tests/visual/baselines/owner-approved-scripture-content-delta/manifest.json";
    const fullPath = path.resolve(projectRoot, relativePath);
    if (relativePath !== expectedPath || !fullPath.startsWith(`${projectRoot}${path.sep}`) || !fs.existsSync(fullPath)) failures.push("Bound Scripture content-delta artifact manifest is missing or unsafe.");
    else {
      const bytes = fs.readFileSync(fullPath);
      const manifest = JSON.parse(bytes.toString("utf8"));
      if (sha256(bytes) !== binding.manifestSha256 || manifest.decisionId !== expectedDecisionId || manifest.inventorySha256 !== expectedInventorySha256) failures.push("Bound Scripture content-delta artifact manifest changed.");
      if (binding.artifactCount !== 300 || binding.stateCount !== 60 || binding.immutableBaselineOverwrites !== 0 || manifest.artifacts?.length !== 300 || manifest.results?.length !== 60) failures.push("Bound Scripture content-delta artifact coverage changed.");
      if (manifest.results?.some((result) => result.nextSafety && result.staticNextAgreement?.passed !== true)) failures.push("Bound Scripture content-delta static/Next agreement is incomplete.");
    }
  }

  const approvedByPath = new Map();
  const seenRecordIds = new Set();
  for (const sourceFile of contract.sourceFiles || []) {
    const relativePath = normalizePath(sourceFile.path || "");
    if (!allowedPaths.has(relativePath)) {
      failures.push(`${relativePath}: path is outside the scoped owner decision.`);
      continue;
    }
    if (approvedByPath.has(relativePath)) {
      failures.push(`${relativePath}: duplicate source overlay.`);
      continue;
    }
    let originalBytes;
    try {
      originalBytes = gitSource(relativePath);
    } catch (error) {
      failures.push(`${relativePath}: cannot read Prompt 15A source (${error.message}).`);
      continue;
    }
    if (originalBytes.length !== sourceFile.originalBytes || sha256(originalBytes) !== sourceFile.originalSha256) failures.push(`${relativePath}: original byte contract does not match Prompt 15A.`);
    let transformed = originalBytes.toString("utf8");
    for (const operation of sourceFile.operations || []) {
      if (!operation.oldText || !operation.newText) {
        failures.push(`${relativePath}: empty replacement operation.`);
        continue;
      }
      if (sha256(Buffer.from(operation.oldText, "utf8")) !== operation.authorizedOldTextSha256 || sha256(Buffer.from(operation.newText, "utf8")) !== operation.authorizedNewTextSha256) failures.push(`${relativePath}: replacement text hash changed.`);
      if (/[\"'](?:class|id|src|href|style)[\"']\s*:/.test(operation.newText)) failures.push(`${relativePath}: replacement attempts a structural property change.`);
      if (JSON.stringify(markupSignature(operation.oldText)) !== JSON.stringify(markupSignature(operation.newText))) failures.push(`${relativePath}: replacement changes markup tags.`);
      for (const recordId of operation.recordIds || []) {
        if (!inventoryById.has(recordId)) failures.push(`${relativePath}: operation cites unknown record ${recordId}.`);
        seenRecordIds.add(recordId);
      }
      const occurrences = transformed.split(operation.oldText).length - 1;
      if (occurrences !== operation.expectedOccurrences) {
        failures.push(`${relativePath}: expected ${operation.expectedOccurrences} occurrence(s), found ${occurrences}.`);
        continue;
      }
      transformed = transformed.split(operation.oldText).join(operation.newText);
    }
    const transformedBytes = Buffer.from(transformed, "utf8");
    const currentPath = path.resolve(projectRoot, relativePath);
    if (!currentPath.startsWith(`${projectRoot}${path.sep}`) || !fs.existsSync(currentPath)) {
      failures.push(`${relativePath}: approved source file is missing or unsafe.`);
      continue;
    }
    const currentBytes = fs.readFileSync(currentPath);
    const comparisonBytes = revertApprovedPhase5c1Source(relativePath, currentBytes, phase5c1Delta);
    if (sourceFile.derivedFrom) {
      if (relativePath !== "src/app/_approved-source/approved-view-markup.generated.ts") failures.push(`${relativePath}: unrecognized derived overlay.`);
      try {
        const originalPayload = generatedMarkupPayload(originalBytes);
        const currentPayload = generatedMarkupPayload(currentBytes);
        const digest = crypto.createHash("sha256");
        for (const sourcePath of ["index.html", "app.js", "phase116b1.js"]) {
          digest.update(sourcePath);
          digest.update(fs.readFileSync(path.join(projectRoot, sourcePath)));
        }
        if (currentPayload.sourceDigest !== digest.digest("hex")) failures.push(`${relativePath}: generated source digest does not bind the current static sources.`);
        if (JSON.stringify(generatedStructure(originalPayload)) !== JSON.stringify(generatedStructure(currentPayload))) failures.push(`${relativePath}: derived capture changed DOM tags or attributes.`);
        const generatedVisibleText = currentBytes.toString("utf8").replace(/<[^>]+>/g, " ").replaceAll("\\n", " ").replace(/\s+/g, " ");
        for (const recordId of sourceFile.recordIds || []) {
          const record = inventoryById.get(recordId);
          if (!record || !generatedVisibleText.includes(record.exactWebText) || generatedVisibleText.includes(record.currentText)) failures.push(`${relativePath}: ${recordId} does not contain only the approved exact WEB wording.`);
          seenRecordIds.add(recordId);
        }
      } catch (error) {
        failures.push(`${relativePath}: derived snapshot verification failed (${error.message}).`);
      }
    } else if (!transformedBytes.equals(comparisonBytes)) failures.push(`${relativePath}: current bytes contain a change outside the exact owner-approved replacements.`);
    if (comparisonBytes.length !== sourceFile.approvedNewBytes || sha256(comparisonBytes) !== sourceFile.approvedNewSha256) failures.push(`${relativePath}: approved-current byte contract changed.`);
    approvedByPath.set(relativePath, { bytes: currentBytes.length, sha256: sha256(currentBytes) });
  }

  for (const recordId of inventoryById.keys()) {
    if (!seenRecordIds.has(recordId)) failures.push(`${recordId}: no source overlay operation cites this owner-reviewed record.`);
  }
  return { valid: failures.length === 0, failures, approvedByPath, contract, contractSha256: sha256(contractBytes), phase5c1Delta };
}

function isApprovedSourceDelta(relativePath, actualHash, actualBytes, verification) {
  const result = verification || verifyScriptureContentDelta();
  if (!result.valid) return false;
  const approved = result.approvedByPath.get(normalizePath(relativePath));
  return Boolean(approved && approved.sha256 === actualHash && approved.bytes === actualBytes);
}

module.exports = { contractPath, isApprovedSourceDelta, verifyScriptureContentDelta };
