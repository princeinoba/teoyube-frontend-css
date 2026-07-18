const fs = require("fs");
const path = require("path");
const {
  projectRoot,
  readJson,
  writeJsonAtomic,
  sha256File,
  artifactChecksum,
  assertNoAbsoluteWindowsPath
} = require("./lib/teoyubeWorldDerivativeExecution.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");
const {
  EXPECTED_TOTAL_PUBLICATION_FILES,
  EXPECTED_TOTAL_PUBLICATION_BYTES,
  publicationAuthorizationPath,
  publicationResultPath,
  publicationReceiptPath,
  publicationValidationPath,
  publishedRuntimeManifestPath,
  validatePublishedTree,
  verifyPublicationBaseline,
  validatePublicationAuthorization,
  fingerprint
} = require("./lib/teoyubeWorldPilotPublication.cjs");

const reportPath = path.join(projectRoot, "docs", "teoyube", "phase-11-6c2b2-publication-validation-report.md");

function recordCheck(checks, errors, id, passed, detail) {
  checks.push({ id, passed: Boolean(passed), detail });
  if (!passed) errors.push({ code: id, message: detail });
}

function writeMarkdown(validation) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, [
    "# Phase 11.6C.2B.2 Publication Validation",
    "",
    `- Status: ${validation.valid ? "passed" : "failed"}`,
    `- Lifecycle state: ${validation.lifecycleState}`,
    `- Public files validated: ${validation.publicFilesValidated}`,
    `- Public bytes validated: ${validation.publicBytesValidated}`,
    `- Runtime manifest records: ${validation.runtimeManifestRecords}`,
    `- Approved shorts: ${validation.approvedRecordCount}`,
    `- Approved Scripture sequences: ${validation.approvedSequenceCount}`,
    `- Ordered sequence segments: ${validation.approvedSequenceSegmentCount}`,
    `- Source files modified: ${validation.sourceFilesModified}`,
    `- Source masters copied: ${validation.sourceMastersCopied}`,
    `- Unapproved files published: ${validation.unapprovedFilesPublished}`,
    `- External uploads: ${validation.externalUploads}`,
    `- Validation checksum: ${validation.artifactChecksumSha256}`,
    "",
    "## Errors",
    "",
    ...(validation.errors.length ? validation.errors.map((item) => `- ${item.code}: ${item.message}`) : ["- None."]),
    "",
    "The public runtime manifest is the byte-identical approved preview named in the publication plan. Its preview-origin fields remain unchanged for checksum integrity; the separate publication receipt is the authoritative published-state record."
  ].join("\n") + "\n", "utf8");
}

async function validatePublication() {
  const baseline = await verifyPublicationBaseline({ allowedStates: ["published"] });
  const checks = [];
  const errors = [...(baseline.report.blockers || [])];
  if (!baseline.context) {
    const blocked = { valid: false, lifecycleState: baseline.report.lifecycleState || "blocked", checks: baseline.report.checks || [], errors };
    console.log(JSON.stringify(blocked, null, 2));
    process.exitCode = 1;
    return blocked;
  }

  const authorization = fs.existsSync(publicationAuthorizationPath) ? readJson(publicationAuthorizationPath) : null;
  const result = fs.existsSync(publicationResultPath) ? readJson(publicationResultPath) : null;
  const receipt = fs.existsSync(publicationReceiptPath) ? readJson(publicationReceiptPath) : null;
  const lifecycleReceipt = fs.existsSync(lifecyclePaths.publicationReceipt) ? readJson(lifecyclePaths.publicationReceipt) : null;
  const publicValidation = validatePublishedTree(baseline.context.plan);
  const runtimeManifest = fs.existsSync(publishedRuntimeManifestPath) ? readJson(publishedRuntimeManifestPath) : null;
  const lifecycleState = determineLifecycleState(baseline.context.gate, artifactSnapshot());

  recordCheck(checks, errors, "baseline", baseline.report.valid, "All publication baseline bindings and protected sources remain valid.");
  recordCheck(checks, errors, "authorization", validatePublicationAuthorization(authorization, baseline.context), "Publication authorization is exact, explicit, checksum-valid, and plan-bound.");
  recordCheck(checks, errors, "result", Boolean(result && result.status === "published" && result.lifecycleState === "published" && result.artifactChecksumSha256 === artifactChecksum(result)), "Publication result is checksum-valid and records the published state.");
  recordCheck(checks, errors, "receipt", Boolean(receipt && receipt.lifecycleState === "published" && receipt.artifactChecksumSha256 === artifactChecksum(receipt) && lifecycleReceipt?.artifactChecksumSha256 === receipt.artifactChecksumSha256 && artifactChecksum(lifecycleReceipt) === receipt.artifactChecksumSha256), "Pilot and lifecycle publication receipts match and are checksum-valid.");
  recordCheck(checks, errors, "lifecycle", lifecycleState === "published", "The non-skippable lifecycle reaches published only after authorization and receipt.");
  recordCheck(checks, errors, "public_tree", publicValidation.valid && publicValidation.tree.fileCount === EXPECTED_TOTAL_PUBLICATION_FILES && publicValidation.tree.totalBytes === EXPECTED_TOTAL_PUBLICATION_BYTES, "The public pilot tree contains exactly the 49 planned files and approved byte total.");
  recordCheck(checks, errors, "no_unexpected_files", publicValidation.unexpectedFiles.length === 0 && publicValidation.missingFiles.length === 0, "No planned file is missing and no unapproved file is present.");
  recordCheck(checks, errors, "runtime_manifest_file", Boolean(runtimeManifest && sha256File(publishedRuntimeManifestPath) === authorization?.runtimeManifestFileChecksumSha256), "The published runtime manifest is byte-identical to the approved manifest item.");
  recordCheck(checks, errors, "runtime_manifest_records", Boolean(runtimeManifest && runtimeManifest.recordCount === 12 && runtimeManifest.records?.length === 12 && new Set(runtimeManifest.records.map((item) => item.mediaId)).size === 12), "The public runtime manifest contains exactly 12 unique approved short records.");
  recordCheck(checks, errors, "runtime_manifest_sequence", Boolean(runtimeManifest && runtimeManifest.records.every((record, index) => record.sequenceId === authorization.approvedSequenceIds[0] && record.sequenceOrder === index + 1)), "The public runtime manifest preserves the exact owner-confirmed 12-segment Scripture sequence order.");
  recordCheck(checks, errors, "runtime_manifest_urls", Boolean(runtimeManifest && runtimeManifest.records.every((record) => [record.plannedPublicCardUrl, record.plannedPublicMobileUrl, record.plannedPublicPosterUrl, record.plannedPublicThumbnailUrl].every((url) => typeof url === "string" && url.startsWith(`/media/teoyubeworld/pilot-v1/${record.mediaId}/`)))), "Every public record points only to its approved pilot derivative URLs.");
  recordCheck(checks, errors, "runtime_manifest_safe", Boolean(runtimeManifest && !/[A-Za-z]:[\\/]/.test(JSON.stringify(runtimeManifest)) && !/media-source|protected-source|temporary-output|ownerPrivate|ffmpegArguments/i.test(JSON.stringify(runtimeManifest))), "Public manifest metadata contains no source path, temporary path, command, owner-private, or absolute-path data.");
  recordCheck(checks, errors, "source_integrity", baseline.report.sourceIntegrityPassed === true, "All 12 protected source checksums, byte sizes, and modification times remain unchanged.");
  recordCheck(checks, errors, "publication_accounting", Boolean(result && receipt && result.sourceMastersCopied === 0 && result.sourceFilesModified === 0 && result.ffmpegCommandsExecuted === 0 && result.derivativesRegenerated === 0 && result.unapprovedFilesPublished === 0 && result.externalUploads === 0 && receipt.sourceFilesModified === 0 && receipt.sourceMastersCopied === 0 && receipt.unapprovedFilesPublished === 0 && receipt.externalUploads === 0), "Publication copied no source masters, modified no source, ran no FFmpeg, regenerated no derivative, and uploaded nothing externally.");

  const validation = {
    artifactType: "teoyubeworld_pilot_publication_validation",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.2",
    validatedAt: new Date().toISOString(),
    valid: errors.length === 0 && checks.every((item) => item.passed),
    lifecycleState,
    canonicalRevision: baseline.report.canonicalRevision,
    approvalArtifactChecksumSha256: authorization?.approvalArtifactChecksumSha256 || null,
    publicationAuthorizationChecksumSha256: authorization?.artifactChecksumSha256 || null,
    publicationPlanChecksumSha256: baseline.context.plan.planChecksumSha256,
    publicationReceiptChecksumSha256: receipt?.artifactChecksumSha256 || null,
    publicTreeFingerprint: publicValidation.tree.fingerprint,
    publicFilesValidated: publicValidation.tree.fileCount,
    publicBytesValidated: publicValidation.tree.totalBytes,
    runtimeManifestRecords: runtimeManifest?.recordCount || 0,
    approvedRecordCount: authorization?.approvedRecordIds?.length || 0,
    approvedSequenceCount: authorization?.approvedSequenceIds?.length || 0,
    approvedSequenceSegmentCount: authorization?.approvedSequenceOrder?.length || 0,
    sourceFilesModified: 0,
    sourceMastersCopied: 0,
    unapprovedFilesPublished: publicValidation.unexpectedFiles.length,
    externalUploads: 0,
    errors,
    warnings: [],
    checks
  };
  assertNoAbsoluteWindowsPath(validation, "Publication validation");
  validation.artifactChecksumSha256 = fingerprint(validation);
  writeJsonAtomic(publicationValidationPath, validation);
  writeMarkdown(validation);
  console.log(JSON.stringify(validation, null, 2));
  if (!validation.valid) process.exitCode = 1;
  return validation;
}

if (require.main === module) validatePublication().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

module.exports = { validatePublication, reportPath };
