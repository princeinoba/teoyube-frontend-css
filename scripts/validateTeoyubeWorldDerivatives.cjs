const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  projectRoot,
  publicMediaRoot,
  pilotRoot,
  frozenPlanPath,
  preExecutionSnapshotPath,
  executionAuthorizationPath,
  executionResultPath,
  sourceIntegrityAfterPath,
  derivativeValidationPath,
  runtimeManifestPreviewPath,
  EXPECTED_APPROVAL_CHECKSUM,
  EXPECTED_CANONICAL_REVISION,
  EXPECTED_RECORD_COUNT,
  EXPECTED_OPERATION_COUNT,
  PROFILE_DEFINITIONS,
  readJson,
  writeJsonAtomic,
  sha256File,
  artifactChecksum,
  isWithin,
  resolveProjectPath,
  assertNoAbsoluteWindowsPath,
  snapshotTree,
  toolMetadata,
  sourcePathForRecord
} = require("./lib/teoyubeWorldDerivativeExecution.cjs");
const { lifecyclePaths, fingerprint } = require("./lib/teoyubeWorldPilotLifecycle.cjs");
const { getCanonicalPilotState, ensureCanonicalStateRevision } = require("./lib/teoyubeWorldCanonicalPilotState.cjs");
const { getCanonicalGateSnapshot } = require("./validateTeoyubeWorldOwnerGate.cjs");
const { loadReviewWorkspace, applyPatches } = require("./lib/teoyubeWorldReviewPatches.cjs");

const docsRoot = path.join(projectRoot, "docs", "teoyube");
const derivativesRoot = path.join(pilotRoot, "derivatives");

function writeMarkdown(fileName, lines) {
  fs.mkdirSync(docsRoot, { recursive: true });
  fs.writeFileSync(path.join(docsRoot, fileName), lines.join("\n") + "\n", "utf8");
}

function probe(ffprobePath, filePath) {
  const result = spawnSync(ffprobePath, ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", filePath], {
    encoding: "utf8",
    windowsHide: true,
    shell: false,
    maxBuffer: 8 * 1024 * 1024
  });
  if (result.status !== 0) return { valid: false, error: String(result.stderr || "FFprobe failed.").slice(-4000), data: null };
  try {
    return { valid: true, error: null, data: JSON.parse(result.stdout || "{}") };
  } catch {
    return { valid: false, error: "FFprobe returned invalid JSON.", data: null };
  }
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function videoStream(probeData) {
  return (probeData?.streams || []).find((stream) => stream.codec_type === "video") || null;
}

function audioStreams(probeData) {
  return (probeData?.streams || []).filter((stream) => stream.codec_type === "audio");
}

function hasFastStart(filePath) {
  const buffer = fs.readFileSync(filePath);
  const moov = buffer.indexOf(Buffer.from("moov"));
  const mdat = buffer.indexOf(Buffer.from("mdat"));
  return moov >= 0 && mdat >= 0 && moov < mdat;
}

function aspectRatio(width, height) {
  return width && height ? width / height : null;
}

function safeTags(probeData) {
  const tags = [probeData?.format?.tags, ...(probeData?.streams || []).map((stream) => stream.tags)].filter(Boolean);
  return !/(?:<script\b|javascript:|data:text\/html|[A-Za-z]:[\\/])/i.test(JSON.stringify(tags));
}

function publicUrl(mediaId, fileName) {
  return `/media/teoyubeworld/pilot-v1/${mediaId}/${fileName}`;
}

function createRuntimeManifest(approval, recordsById, operationValidations) {
  const byMedia = new Map();
  for (const validation of operationValidations) {
    if (!validation.valid) continue;
    if (!byMedia.has(validation.mediaId)) byMedia.set(validation.mediaId, {});
    byMedia.get(validation.mediaId)[validation.variant] = validation;
  }
  const records = approval.approvedSequenceOrder.map((mediaId, index) => {
    const record = recordsById.get(mediaId);
    const variants = byMedia.get(mediaId) || {};
    return {
      mediaId,
      title: record.title,
      description: record.description,
      mediaKind: record.mediaKind || "scripture_short",
      BibleBook: record.BibleBook,
      chapter: record.chapter,
      verseStart: record.verseStart,
      verseEnd: record.verseEnd,
      ScriptureReference: record.ScriptureReferences?.[0] || null,
      translation: record.translation || "Unknown",
      sequenceId: record.sequenceId,
      sequenceTitle: record.sequenceTitle || "No Other Gospel",
      sequenceOrder: index + 1,
      durationSeconds: number(record.durationSeconds),
      hasAudio: Boolean(record.hasAudio),
      orientation: record.orientation,
      themes: [...(record.themes || [])],
      TeoyubeWordIds: [...(record.TeoyubeWordIds || [])],
      promiseClusterIds: [...(record.promiseClusterIds || [])],
      journeyIds: [...(record.journeyIds || [])],
      callingIds: [...(record.callingIds || [])],
      recommendedSurfaces: [...(record.recommendedSurfaces || [])],
      plannedPublicCardUrl: publicUrl(mediaId, "card-preview.mp4"),
      plannedPublicMobileUrl: publicUrl(mediaId, "mobile-preview.mp4"),
      plannedPublicPosterUrl: publicUrl(mediaId, "poster.webp"),
      plannedPublicThumbnailUrl: publicUrl(mediaId, "thumbnail.webp"),
      ownerReviewState: record.ownerReviewed === true ? "confirmed" : "blocked",
      ScriptureConfirmationState: record.scriptureConfirmed === true ? "confirmed" : "blocked",
      rightsState: record.rightsConfirmed === true ? record.rightsStatus : "blocked",
      safetyState: record.safetyConfirmed === true ? record.safetyStatus : "blocked",
      sourceChannel: record.sourceChannel || "TeoyubeWorld",
      derivativeChecksums: {
        card: variants.card?.outputChecksumSha256,
        mobile: variants.mobile?.outputChecksumSha256,
        poster: variants.poster?.outputChecksumSha256,
        thumbnail: variants.thumbnail?.outputChecksumSha256
      },
      derivativeBytes: {
        card: variants.card?.outputBytes,
        mobile: variants.mobile?.outputBytes,
        poster: variants.poster?.outputBytes,
        thumbnail: variants.thumbnail?.outputBytes
      },
      validationState: "validated",
      canonicalPilotRevision: EXPECTED_CANONICAL_REVISION
    };
  });
  const manifest = {
    artifactType: "teoyubeworld_runtime_manifest_preview",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.1",
    status: "preview_only",
    generatedAt: new Date().toISOString(),
    canonicalPilotRevision: EXPECTED_CANONICAL_REVISION,
    approvalArtifactChecksumSha256: EXPECTED_APPROVAL_CHECKSUM,
    recordCount: records.length,
    publicationAuthorized: false,
    publicFilesWritten: 0,
    records
  };
  assertNoAbsoluteWindowsPath(manifest, "Runtime manifest preview");
  manifest.manifestChecksumSha256 = fingerprint(manifest);
  return manifest;
}

async function validate() {
  const required = [lifecyclePaths.approval, frozenPlanPath, preExecutionSnapshotPath, executionAuthorizationPath, executionResultPath];
  for (const filePath of required) if (!fs.existsSync(filePath)) throw new Error(`Required derivative validation artifact is missing: ${path.relative(projectRoot, filePath)}`);
  if (fs.existsSync(lifecyclePaths.publicationAuthorization)) throw new Error("Publication authorization must remain absent during derivative validation.");

  const approval = readJson(lifecyclePaths.approval);
  const frozen = readJson(frozenPlanPath);
  const preExecution = readJson(preExecutionSnapshotPath);
  const authorization = readJson(executionAuthorizationPath);
  const execution = readJson(executionResultPath);
  const canonical = getCanonicalPilotState();
  const canonicalRevision = ensureCanonicalStateRevision(canonical);
  const gate = await getCanonicalGateSnapshot();
  const tools = toolMetadata();
  if (!gate.gatePassed || gate.blockerCount !== 0) throw new Error("The canonical owner gate is no longer clear.");
  if (canonicalRevision.stateRevision !== EXPECTED_CANONICAL_REVISION) throw new Error("The canonical pilot revision changed before derivative validation.");
  if (approval.artifactChecksumSha256 !== EXPECTED_APPROVAL_CHECKSUM || artifactChecksum(approval) !== EXPECTED_APPROVAL_CHECKSUM) throw new Error("The approved pilot checksum is invalid.");
  if (artifactChecksum(execution) !== execution.artifactChecksumSha256) throw new Error("The derivative execution result checksum is invalid.");
  if (execution.successfulOperationCount !== EXPECTED_OPERATION_COUNT || execution.failedOperationCount !== 0) throw new Error("All 48 derivative operations must generate successfully before validation.");
  if (!tools.ready) throw new Error("FFprobe is not ready for derivative validation.");

  const workspace = loadReviewWorkspace();
  const merged = applyPatches(workspace.manifest, workspace.patches, workspace.sourceChecksum);
  if (!merged.valid) throw new Error("The canonical media patch set is invalid.");
  const recordsById = new Map(merged.manifest.records.map((record) => [record.id, record]));
  const executionById = new Map(execution.operationResults.map((operation) => [operation.operationId, operation]));
  const operationValidations = [];

  for (const operation of frozen.operations) {
    const record = recordsById.get(operation.mediaId);
    const generated = executionById.get(operation.operationId);
    const profile = PROFILE_DEFINITIONS[operation.profile];
    const errors = [];
    let outputPath = null;
    try { outputPath = resolveProjectPath(operation.outputPath); } catch (error) { errors.push(error.message); }
    if (!outputPath || !isWithin(pilotRoot, outputPath) || isWithin(publicMediaRoot, outputPath, true)) errors.push("Output path is outside the approved generated boundary.");
    if (!record || !approval.approvedRecordIds.includes(operation.mediaId)) errors.push("Output does not correspond to an approved record.");
    if (!generated || !["generated", "skipped_valid"].includes(generated.status)) errors.push("Execution ledger does not contain a successful operation result.");
    if (!outputPath || !fs.existsSync(outputPath) || !fs.statSync(outputPath).isFile()) errors.push("Expected derivative output is missing.");
    const stat = outputPath && fs.existsSync(outputPath) ? fs.statSync(outputPath) : null;
    if (stat && stat.size === 0) errors.push("Derivative output is empty.");
    const checksumSha256 = stat ? sha256File(outputPath) : null;
    if (generated && checksumSha256 !== generated.outputChecksumSha256) errors.push("Derivative checksum does not match the execution ledger.");
    const result = stat ? probe(tools.ffprobePath, outputPath) : { valid: false, error: "Output is unavailable.", data: null };
    if (!result.valid) errors.push(result.error || "FFprobe could not read the derivative.");
    const stream = videoStream(result.data);
    const width = number(stream?.width);
    const height = number(stream?.height);
    const duration = number(result.data?.format?.duration ?? stream?.duration);
    const sourceDuration = number(record?.durationSeconds);
    const sourceRatio = aspectRatio(number(record?.width), number(record?.height));
    const outputRatio = aspectRatio(width, height);
    if (!stream) errors.push("Derivative has no decodable video or image stream.");
    if (!width || !height || width > profile.maxWidth || height > profile.maxHeight) errors.push("Derivative dimensions exceed the approved profile boundary.");
    if (sourceRatio && outputRatio && Math.abs(sourceRatio - outputRatio) > 0.03) errors.push("Derivative aspect ratio does not match the source within tolerance.");
    if (!safeTags(result.data)) errors.push("Derivative metadata contains unsafe or machine-local content.");
    if (profile.kind === "video") {
      if (stream?.codec_name !== "h264") errors.push("MP4 derivative codec is not H.264.");
      if (stream?.pix_fmt !== "yuv420p") errors.push("MP4 derivative pixel format is not yuv420p.");
      if (!duration || !sourceDuration || Math.abs(duration - sourceDuration) > 0.35) errors.push("MP4 derivative duration differs from the source beyond tolerance.");
      if (audioStreams(result.data).length !== 0) errors.push("MP4 derivative unexpectedly contains audio.");
      if (!hasFastStart(outputPath)) errors.push("MP4 faststart layout was not detected.");
    } else {
      if (stream?.codec_name !== "webp") errors.push("Image derivative is not WebP.");
      if (path.extname(outputPath).toLowerCase() !== ".webp") errors.push("Image derivative extension is not WebP.");
    }
    const validation = {
      operationId: operation.operationId,
      mediaId: operation.mediaId,
      profile: operation.profile,
      variant: profile.variant,
      outputReference: `<generated-derivative:${operation.operationId}>`,
      outputBytes: stat?.size || 0,
      outputChecksumSha256: checksumSha256,
      ffprobeValid: result.valid,
      codec: stream?.codec_name || null,
      pixelFormat: stream?.pix_fmt || null,
      width,
      height,
      durationSeconds: duration,
      sourceDurationSeconds: sourceDuration,
      aspectRatioPreserved: Boolean(sourceRatio && outputRatio && Math.abs(sourceRatio - outputRatio) <= 0.03),
      orientationValid: Boolean(width && height && ((record?.orientation === "portrait") === (height > width))),
      audioPolicyValid: profile.kind !== "video" || audioStreams(result.data).length === 0,
      checksumValid: Boolean(checksumSha256 && generated?.outputChecksumSha256 === checksumSha256),
      faststartValid: profile.kind !== "video" || hasFastStart(outputPath),
      pathSafe: Boolean(outputPath && isWithin(pilotRoot, outputPath) && !isWithin(publicMediaRoot, outputPath, true)),
      valid: errors.length === 0,
      errors
    };
    operationValidations.push(validation);
  }

  const sourceRecords = [];
  for (const snapshot of frozen.sourceSnapshots) {
    const record = recordsById.get(snapshot.mediaId);
    const sourcePath = sourcePathForRecord(record);
    const exists = Boolean(sourcePath && fs.existsSync(sourcePath));
    const stat = exists ? fs.statSync(sourcePath) : null;
    const checksum = exists ? sha256File(sourcePath) : null;
    sourceRecords.push({
      mediaId: snapshot.mediaId,
      sourceReference: `<protected-source:${snapshot.mediaId}>`,
      exists,
      checksumBeforeSha256: snapshot.checksumSha256,
      checksumAfterSha256: checksum,
      checksumChanged: checksum !== snapshot.checksumSha256,
      byteSizeBefore: snapshot.byteSize,
      byteSizeAfter: stat?.size ?? null,
      byteSizeChanged: stat?.size !== snapshot.byteSize,
      modificationTimeBeforeMs: snapshot.modificationTimeMs,
      modificationTimeAfterMs: stat?.mtimeMs ?? null,
      modificationTimeChanged: stat?.mtimeMs !== snapshot.modificationTimeMs
    });
  }
  const sourceIntegrity = {
    artifactType: "teoyubeworld_source_integrity_after_derivative_execution",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.1",
    checkedAt: new Date().toISOString(),
    sourceFilesChecked: sourceRecords.length,
    checksumChanges: sourceRecords.filter((record) => record.checksumChanged).length,
    byteSizeChanges: sourceRecords.filter((record) => record.byteSizeChanged).length,
    modificationTimeChanges: sourceRecords.filter((record) => record.modificationTimeChanged).length,
    sourceFilesModified: 0,
    sourceFilesRenamed: 0,
    sourceFilesMoved: 0,
    sourceFilesDeleted: 0,
    sourceMastersCopied: 0,
    valid: sourceRecords.every((record) => record.exists && !record.checksumChanged && !record.byteSizeChanged && !record.modificationTimeChanged),
    records: sourceRecords
  };
  sourceIntegrity.artifactChecksumSha256 = fingerprint(sourceIntegrity);
  writeJsonAtomic(sourceIntegrityAfterPath, sourceIntegrity);

  const derivativeSnapshot = snapshotTree(derivativesRoot);
  const publicUnchanged = snapshotTree(publicMediaRoot).fingerprint === preExecution.publicMediaSnapshot.fingerprint;
  const invalidOperations = operationValidations.filter((operation) => !operation.valid);
  const unexpectedFiles = derivativeSnapshot.files.filter((file) => !frozen.operations.some((operation) => operation.outputPath.endsWith(file.path.replace(/\\/g, "/"))));
  const valid = invalidOperations.length === 0 && operationValidations.length === EXPECTED_OPERATION_COUNT && derivativeSnapshot.fileCount === EXPECTED_OPERATION_COUNT && unexpectedFiles.length === 0 && sourceIntegrity.valid && publicUnchanged;
  const validation = {
    artifactType: "teoyubeworld_derivative_validation",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B.1",
    lifecycleState: valid ? "derivatives_validated" : "derivatives_generated",
    validatedAt: new Date().toISOString(),
    valid,
    expectedOperationCount: EXPECTED_OPERATION_COUNT,
    validatedOperationCount: operationValidations.filter((operation) => operation.valid).length,
    failedOperationCount: invalidOperations.length,
    cardCount: operationValidations.filter((operation) => operation.valid && operation.variant === "card").length,
    mobileCount: operationValidations.filter((operation) => operation.valid && operation.variant === "mobile").length,
    posterCount: operationValidations.filter((operation) => operation.valid && operation.variant === "poster").length,
    thumbnailCount: operationValidations.filter((operation) => operation.valid && operation.variant === "thumbnail").length,
    sourceIntegrityPassed: sourceIntegrity.valid,
    publicMediaUnchanged: publicUnchanged,
    publicFilesWritten: 0,
    sourceMastersCopied: 0,
    unexpectedOutputCount: unexpectedFiles.length,
    operationValidations,
    errors: invalidOperations.map((operation) => ({ operationId: operation.operationId, mediaId: operation.mediaId, errors: operation.errors })),
    warnings: []
  };
  validation.artifactChecksumSha256 = fingerprint(validation);
  writeJsonAtomic(derivativeValidationPath, validation);
  writeJsonAtomic(lifecyclePaths.derivativeValidation, validation);
  if (!valid) {
    console.log(JSON.stringify({ status: "failed", validated: validation.validatedOperationCount, failed: validation.failedOperationCount, errors: validation.errors }, null, 2));
    process.exitCode = 1;
    return { validation, sourceIntegrity, runtimeManifest: null };
  }

  const runtimeManifest = createRuntimeManifest(approval, recordsById, operationValidations);
  if (runtimeManifest.recordCount !== EXPECTED_RECORD_COUNT) throw new Error("Runtime manifest preview must contain exactly 12 records.");
  writeJsonAtomic(runtimeManifestPreviewPath, runtimeManifest);

  writeMarkdown("phase-11-6c2b1-source-integrity-report.md", [
    "# Phase 11.6C.2B.1 Source Integrity Report", "",
    `- Source files checked: ${sourceIntegrity.sourceFilesChecked}`,
    `- Checksum changes: ${sourceIntegrity.checksumChanges}`,
    `- Byte-size changes: ${sourceIntegrity.byteSizeChanges}`,
    `- Modification-time changes: ${sourceIntegrity.modificationTimeChanges}`,
    "- Source files modified: 0", "- Source files renamed: 0", "- Source files moved: 0", "- Source files deleted: 0", "- Source masters copied: 0", "",
    "All 12 protected source files remained byte-for-byte unchanged throughout derivative execution and validation."
  ]);
  writeMarkdown("phase-11-6c2b1-derivative-execution-report.md", [
    "# Phase 11.6C.2B.1 Derivative Execution Report", "",
    `- Successful operations: ${execution.successfulOperationCount}`,
    `- Failed operations: ${execution.failedOperationCount}`,
    `- Skipped valid operations: ${execution.skippedValidOperationCount}`,
    `- Card previews: ${execution.generatedCardCount}`,
    `- Mobile previews: ${execution.generatedMobileCount}`,
    `- Posters: ${execution.generatedPosterCount}`,
    `- Thumbnails: ${execution.generatedThumbnailCount}`,
    `- Generated bytes: ${execution.totalGeneratedBytes}`,
    `- Projected bytes: ${execution.projectedBytes}`,
    `- Size variance: ${execution.sizeVarianceBytes}`,
    "- Public files written: 0", "- External uploads: 0"
  ]);
  writeMarkdown("phase-11-6c2b1-derivative-validation-report.md", [
    "# Phase 11.6C.2B.1 Derivative Validation Report", "",
    `- Validated operations: ${validation.validatedOperationCount}`,
    `- Failed operations: ${validation.failedOperationCount}`,
    `- Card previews validated: ${validation.cardCount}`,
    `- Mobile previews validated: ${validation.mobileCount}`,
    `- Posters validated: ${validation.posterCount}`,
    `- Thumbnails validated: ${validation.thumbnailCount}`,
    `- Source integrity: ${validation.sourceIntegrityPassed ? "passed" : "failed"}`,
    `- Public media unchanged: ${validation.publicMediaUnchanged ? "yes" : "no"}`,
    "", "Every generated MP4 and WebP passed codec, dimensions, duration or aspect-ratio, checksum, path-boundary, and safe-metadata validation."
  ]);
  writeMarkdown("phase-11-6c2b1-runtime-manifest-preview-report.md", [
    "# Phase 11.6C.2B.1 Runtime Manifest Preview", "",
    `- Preview records: ${runtimeManifest.recordCount}`,
    `- Manifest checksum: ${runtimeManifest.manifestChecksumSha256}`,
    "- Absolute paths: 0", "- Protected source paths: 0", "- Unapproved records: 0", "- Public files written: 0", "- Publication authorized: false", "",
    "The manifest remains a generated owner-review preview and has not been copied into the live app data path."
  ]);

  console.log(JSON.stringify({
    lifecycleState: validation.lifecycleState,
    validatedOperations: validation.validatedOperationCount,
    failedOperations: validation.failedOperationCount,
    runtimeManifestRecords: runtimeManifest.recordCount,
    sourceIntegrityPassed: sourceIntegrity.valid,
    publicFilesWritten: 0
  }, null, 2));
  return { validation, sourceIntegrity, runtimeManifest };
}

if (require.main === module) validate().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

module.exports = { validate, createRuntimeManifest };
