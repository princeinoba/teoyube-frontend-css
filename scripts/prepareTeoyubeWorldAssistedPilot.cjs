const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  root,
  patchPaths,
  writeJson
} = require("./lib/teoyubeWorldReviewPatches.cjs");
const {
  reviewRoot,
  assistedCandidatePath,
  assistedTechnicalReportPath,
  sourcePathFor,
  loadAssistedPilotWorkspace,
  duplicateIndex,
  technicalRecordScore,
  rankSequenceCandidates
} = require("./lib/teoyubeWorldAssistedPilot.cjs");
const { validateTeoyubeWorldOwnerGate } = require("./validateTeoyubeWorldOwnerGate.cjs");

const TARGET_SHORTS = 12;
const PROBE_POOL_SIZE = 48;
const REVIEW_SURFACES = ["Today", "Canon", "TeoyubeSearch", "Lexicon", "Teo Guide", "Book of the Saint"];

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function fileSnapshot(filePath) {
  const stat = fs.statSync(filePath);
  return { checksumSha256: hashFile(filePath), fileSizeBytes: stat.size, mtimeMs: stat.mtimeMs };
}

function sameSnapshot(left, right) {
  return left.checksumSha256 === right.checksumSha256
    && left.fileSizeBytes === right.fileSizeBytes
    && left.mtimeMs === right.mtimeMs;
}

function resolveTool(name) {
  const where = spawnSync("where.exe", [name], { encoding: "utf8", windowsHide: true });
  const fromPath = String(where.stdout || "").split(/\r?\n/).map((item) => item.trim()).find((item) => item && fs.existsSync(item));
  if (fromPath) return path.resolve(fromPath);
  const fallback = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, "Programs", "FFmpeg", "current", "bin", `${name}.exe`)
    : null;
  if (fallback && fs.existsSync(fallback)) return fallback;
  throw new Error(`${name} is unavailable. Run npm run media:tools:check after restarting the terminal.`);
}

function runTool(executable, args, label) {
  const result = spawnSync(executable, args, { encoding: "utf8", windowsHide: true, shell: false, maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}.`);
  return result;
}

function parseRotation(video) {
  if (video?.tags?.rotate != null) return Number(video.tags.rotate);
  const sideData = (video?.side_data_list || []).find((item) => item.rotation != null);
  return sideData ? Number(sideData.rotation) : 0;
}

function probeRecord(record, ffprobe) {
  const sourcePath = sourcePathFor(record);
  if (!sourcePath || !fs.existsSync(sourcePath)) throw new Error(`${record.id}: protected source is missing.`);
  const before = fileSnapshot(sourcePath);
  const result = runTool(ffprobe, [
    "-v", "error",
    "-print_format", "json",
    "-show_entries", "format=format_name,duration,size,bit_rate:stream=index,codec_type,codec_name,width,height,display_aspect_ratio,sample_aspect_ratio,avg_frame_rate,r_frame_rate,pix_fmt:stream_tags=rotate:stream_side_data=rotation",
    "-show_format", "-show_streams", "--", sourcePath
  ], `FFprobe ${record.id}`);
  const metadata = JSON.parse(result.stdout || "{}");
  const after = fileSnapshot(sourcePath);
  const video = (metadata.streams || []).find((stream) => stream.codec_type === "video") || {};
  const audioStreams = (metadata.streams || []).filter((stream) => stream.codec_type === "audio");
  const rotation = parseRotation(video);
  const width = Number(video.width || 0);
  const height = Number(video.height || 0);
  const rotated = Math.abs(rotation) % 180 === 90;
  const displayWidth = rotated ? height : width;
  const displayHeight = rotated ? width : height;
  const durationSeconds = Number(metadata.format?.duration || 0);
  return {
    mediaId: record.id,
    relativeSourcePath: record.relativeSourcePath,
    durationSeconds,
    width,
    height,
    displayAspectRatio: video.display_aspect_ratio || null,
    pixelAspectRatio: video.sample_aspect_ratio || null,
    aspectRatio: displayHeight ? Number((displayWidth / displayHeight).toFixed(6)) : null,
    orientation: displayWidth === displayHeight ? "square" : displayWidth > displayHeight ? "landscape" : "portrait",
    videoCodec: video.codec_name || null,
    frameRate: video.avg_frame_rate || video.r_frame_rate || null,
    pixelFormat: video.pix_fmt || null,
    hasAudio: audioStreams.length > 0,
    audioCodec: audioStreams[0]?.codec_name || null,
    audioStreamCount: audioStreams.length,
    fileSizeBytes: Number(metadata.format?.size || before.fileSizeBytes),
    bitrate: Number(metadata.format?.bit_rate || 0) || null,
    containerFormat: metadata.format?.format_name || null,
    streamCount: (metadata.streams || []).length,
    rotation,
    checksumSha256: before.checksumSha256,
    checksumMatchesManifest: before.checksumSha256 === record.checksumSha256,
    sourceBefore: before,
    sourceAfter: after,
    sourceIntegrityVerified: sameSnapshot(before, after) && before.checksumSha256 === record.checksumSha256,
    browserPlayable: record.mimeType === "video/mp4" && video.codec_name === "h264"
  };
}

function writeWithBackup(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.copyFileSync(filePath, `${filePath}.backup-${stamp}`);
  }
  writeJson(filePath, value);
}

function operation(record, newValues, reason) {
  const changedFields = Object.keys(newValues);
  return {
    mediaId: record.id,
    changedFields,
    previousValues: Object.fromEntries(changedFields.map((field) => [field, record[field] ?? null])),
    newValues,
    reviewReason: reason,
    timestamp: new Date().toISOString()
  };
}

function makePatch(sourceChecksum, reviewedBy, operations, warnings) {
  return {
    schemaVersion: "1.0.0",
    sourceDraftManifestChecksum: sourceChecksum,
    generatedAt: new Date().toISOString(),
    reviewedBy,
    operationCount: operations.length,
    operations,
    warnings,
    localOnly: true,
    runtimeManifestUpdated: false
  };
}

function technicalValues(probe) {
  return {
    durationSeconds: probe.durationSeconds,
    width: probe.width,
    height: probe.height,
    orientation: probe.orientation,
    aspectRatio: probe.aspectRatio,
    displayAspectRatio: probe.displayAspectRatio,
    pixelAspectRatio: probe.pixelAspectRatio,
    hasAudio: probe.hasAudio,
    audioCodec: probe.audioCodec,
    videoCodec: probe.videoCodec,
    audioStreamCount: probe.audioStreamCount,
    frameRate: probe.frameRate,
    bitrate: probe.bitrate,
    rotation: probe.rotation,
    containerFormat: probe.containerFormat,
    streamCount: probe.streamCount,
    browserPlayable: probe.browserPlayable,
    browserMimeSupport: "not_browser_tested",
    metadataProbeStatus: "complete",
    metadataProbeWarnings: probe.hasAudio ? ["Audio is present and requires explicit owner rights confirmation."] : []
  };
}

function suggestedMetadata(record, sequence, position) {
  const probableBooks = {
    "No Other Gospel": "Galatians",
    "Crucified with Christ": "Galatians",
    "Altar Outside the Gate": "Hebrews",
    "The Hall of Faith": "Hebrews",
    "The Living Way": "Hebrews",
    "Kingdom That Cannot Be Shaken": "Hebrews"
  };
  return {
    mediaId: record.id,
    title: `${sequence.sequenceTitle} review clip ${String(position + 1).padStart(2, "0")}`,
    description: `Short visual candidate from the local ${sequence.sequenceTitle} source family. The owner must describe and confirm the visible content.`,
    probableBibleBook: probableBooks[sequence.sequenceTitle] || null,
    probableChapter: null,
    probableVerseStart: null,
    probableVerseEnd: null,
    probableScriptureReference: null,
    mediaKind: "short",
    sequenceTitle: sequence.sequenceTitle,
    sequenceOrder: null,
    themes: [sequence.sequenceTitle.toLowerCase()],
    TeoyubeWordIds: [],
    promiseClusterIds: [],
    recommendedSurfaces: REVIEW_SURFACES,
    confidence: "needs_review",
    evidence: ["local source-family folder", "deterministic inventory order", "read-only technical metadata"],
    warnings: ["No verse-level Scripture anchor exists in the draft manifest.", "Visual meaning, title, and description require explicit owner review."],
    needsOwnerConfirmation: true
  };
}

function reviewOutputPath(...parts) {
  const candidate = path.resolve(reviewRoot, ...parts);
  const relative = path.relative(reviewRoot, candidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Review output escaped the generated review root.");
  fs.mkdirSync(path.dirname(candidate), { recursive: true });
  return candidate;
}

function extractPoster(record, probe, ffmpeg, outputPath) {
  const sourcePath = sourcePathFor(record);
  const seek = Math.max(0, Math.min(probe.durationSeconds * 0.45, Math.max(0, probe.durationSeconds - 0.2))).toFixed(3);
  runTool(ffmpeg, ["-hide_banner", "-loglevel", "error", "-ss", seek, "-i", sourcePath, "-frames:v", "1", "-vf", "scale=480:640:force_original_aspect_ratio=decrease,pad=480:640:(ow-iw)/2:(oh-ih)/2:color=black", "-q:v", "4", "-y", outputPath], `Poster extraction ${record.id}`);
}

function extractContactSheet(record, probe, ffmpeg, outputPath) {
  const sourcePath = sourcePathFor(record);
  const fractions = [0.15, 0.5, 0.85];
  const args = ["-hide_banner", "-loglevel", "error"];
  for (const fraction of fractions) {
    const seek = Math.max(0, Math.min(probe.durationSeconds * fraction, Math.max(0, probe.durationSeconds - 0.2))).toFixed(3);
    args.push("-ss", seek, "-i", sourcePath);
  }
  args.push(
    "-filter_complex",
    "[0:v]scale=200:360:force_original_aspect_ratio=decrease,pad=200:360:(ow-iw)/2:(oh-ih)/2:black[a];[1:v]scale=200:360:force_original_aspect_ratio=decrease,pad=200:360:(ow-iw)/2:(oh-ih)/2:black[b];[2:v]scale=200:360:force_original_aspect_ratio=decrease,pad=200:360:(ow-iw)/2:(oh-ih)/2:black[c];[a][b][c]hstack=inputs=3[out]",
    "-map", "[out]", "-frames:v", "1", "-q:v", "5", "-y", outputPath
  );
  runTool(ffmpeg, args, `Contact sheet ${record.id}`);
}

function mosaic(ffmpeg, inputPaths, outputPath, columns, cellWidth, cellHeight) {
  const args = ["-hide_banner", "-loglevel", "error"];
  inputPaths.forEach((input) => args.push("-i", input));
  const filters = inputPaths.map((_, index) => `[${index}:v]scale=${cellWidth}:${cellHeight}:force_original_aspect_ratio=decrease,pad=${cellWidth}:${cellHeight}:(ow-iw)/2:(oh-ih)/2:black[v${index}]`);
  const labels = inputPaths.map((_, index) => `[v${index}]`).join("");
  const layout = inputPaths.map((_, index) => `${(index % columns) * cellWidth}_${Math.floor(index / columns) * cellHeight}`).join("|");
  filters.push(`${labels}xstack=inputs=${inputPaths.length}:layout=${layout}[out]`);
  args.push("-filter_complex", filters.join(";"), "-map", "[out]", "-frames:v", "1", "-q:v", "5", "-y", outputPath);
  runTool(ffmpeg, args, `Review mosaic ${path.basename(outputPath)}`);
}

function createReviewArtifacts(selected, probesById, topSequences, recordsById, ffmpeg) {
  const posters = new Map();
  const contactSheets = new Map();
  const touchedBefore = new Map();
  const touch = (record) => {
    if (!touchedBefore.has(record.id)) touchedBefore.set(record.id, fileSnapshot(sourcePathFor(record)));
  };
  for (const record of selected) {
    touch(record);
    const poster = reviewOutputPath("posters", `${record.id}.jpg`);
    const contact = reviewOutputPath("contact-sheets", `${record.id}.jpg`);
    extractPoster(record, probesById.get(record.id), ffmpeg, poster);
    extractContactSheet(record, probesById.get(record.id), ffmpeg, contact);
    posters.set(record.id, poster);
    contactSheets.set(record.id, contact);
  }

  const sequencePreviews = [];
  for (const sequence of topSequences) {
    const previewRecords = sequence.rankedRecords.slice(0, 4).map((item) => recordsById.get(item.id)).filter(Boolean);
    const previewPosters = [];
    for (const record of previewRecords) {
      touch(record);
      let poster = posters.get(record.id);
      if (!poster) {
        const probe = probesById.get(record.id) || probeRecord(record, resolveTool("ffprobe"));
        probesById.set(record.id, probe);
        poster = reviewOutputPath("sequence-candidates", `${sequence.sequenceId}-${record.id}.jpg`);
        extractPoster(record, probe, ffmpeg, poster);
        posters.set(record.id, poster);
      }
      previewPosters.push(poster);
    }
    const outputPath = reviewOutputPath("sequence-candidates", `${sequence.sequenceId}-preview.jpg`);
    mosaic(ffmpeg, previewPosters, outputPath, 4, 180, 240);
    sequencePreviews.push({
      sequenceId: sequence.sequenceId,
      sequenceTitle: sequence.sequenceTitle,
      sourceRecordCount: sequence.sourceRecordCount,
      completeSequenceFitsPilot: sequence.completeSequenceFitsPilot,
      previewRecordIds: previewRecords.map((record) => record.id),
      previewPath: path.relative(path.join(root, "generated", "teoyubeworld-media"), outputPath).replace(/\\/g, "/"),
      needsOwnerConfirmation: true
    });
  }

  const selectedPosterPaths = selected.map((record) => posters.get(record.id));
  const sequenceContact = reviewOutputPath("sequence-contact-sheet.jpg");
  const sequenceStrip = reviewOutputPath("sequence-motion-strip.jpg");
  mosaic(ffmpeg, selectedPosterPaths, sequenceContact, 4, 180, 240);
  mosaic(ffmpeg, selectedPosterPaths, sequenceStrip, 12, 100, 160);

  const integrity = [];
  for (const [mediaId, before] of touchedBefore) {
    const record = recordsById.get(mediaId);
    const after = fileSnapshot(sourcePathFor(record));
    integrity.push({ mediaId, before, after, sourceModified: !sameSnapshot(before, after) });
  }
  if (integrity.some((item) => item.sourceModified)) throw new Error("Protected source integrity changed during review artifact preparation.");

  return {
    posters: Object.fromEntries(selected.map((record) => [record.id, path.relative(path.join(root, "generated", "teoyubeworld-media"), posters.get(record.id)).replace(/\\/g, "/")])),
    contactSheets: Object.fromEntries(selected.map((record) => [record.id, path.relative(path.join(root, "generated", "teoyubeworld-media"), contactSheets.get(record.id)).replace(/\\/g, "/")])),
    sequenceContactSheet: path.relative(path.join(root, "generated", "teoyubeworld-media"), sequenceContact).replace(/\\/g, "/"),
    sequenceMotionStrip: path.relative(path.join(root, "generated", "teoyubeworld-media"), sequenceStrip).replace(/\\/g, "/"),
    sequencePreviews,
    integrity
  };
}

async function run() {
  const ffmpeg = resolveTool("ffmpeg");
  const ffprobe = resolveTool("ffprobe");
  const { manifest, sourceChecksum, sequences, exactDuplicates } = loadAssistedPilotWorkspace();
  const recordsById = new Map(manifest.records.map((record) => [record.id, record]));
  const duplicateMap = duplicateIndex(exactDuplicates);
  const rankedSequences = rankSequenceCandidates(manifest, sequences, exactDuplicates);
  const topSequences = rankedSequences.slice(0, 3);
  const recommendedSequence = topSequences[0];
  if (!recommendedSequence || recommendedSequence.rankedRecords.length < TARGET_SHORTS) throw new Error("No source family has enough safe technical candidates.");

  const probePool = recommendedSequence.rankedRecords.slice(0, PROBE_POOL_SIZE).map((item) => recordsById.get(item.id));
  const probes = probePool.map((record) => probeRecord(record, ffprobe));
  const probesById = new Map(probes.map((probe) => [probe.mediaId, probe]));
  const rankedPool = probePool.map((record) => {
    const base = recommendedSequence.rankedRecords.find((item) => item.id === record.id);
    const probe = probesById.get(record.id);
    const technical = technicalRecordScore(probe);
    return { record, probe, score: base.score + technical.score, reasons: [...base.reasons, ...technical.reasons] };
  }).filter((item) => item.probe.sourceIntegrityVerified && item.probe.checksumMatchesManifest && item.probe.browserPlayable)
    .sort((a, b) => b.score - a.score || a.record.relativeSourcePath.localeCompare(b.record.relativeSourcePath));
  const selectedRows = rankedPool.slice(0, TARGET_SHORTS);
  if (selectedRows.length !== TARGET_SHORTS) throw new Error(`Only ${selectedRows.length} technically safe candidates were found; 12 are required.`);
  const selected = selectedRows.map((item) => item.record);

  const artifacts = createReviewArtifacts(selected, probesById, topSequences, recordsById, ffmpeg);
  const technicalOperations = selected.map((record) => operation(record, technicalValues(probesById.get(record.id)), "Automated local FFprobe technical metadata extraction; owner review is not implied."));
  const existingTechnical = fs.existsSync(patchPaths.technical) ? JSON.parse(fs.readFileSync(patchPaths.technical, "utf8")) : null;
  const selectedIds = new Set(selected.map((record) => record.id));
  const preservedTechnical = (existingTechnical?.operations || []).filter((item) => !selectedIds.has(item.mediaId));
  writeWithBackup(patchPaths.technical, makePatch(sourceChecksum, "local_technical_probe", [...preservedTechnical, ...technicalOperations], ["Technical values only. No owner, Scripture, rights, or safety confirmation is implied."]));

  const pilotOperations = selected.map((record) => operation(record, { pilotSelected: true }, "Automated assisted-pilot candidate selection; owner review is still required."));
  writeWithBackup(patchPaths.pilot, makePatch(sourceChecksum, "assisted_candidate_builder", pilotOperations, ["Candidate selection is reversible and is not owner approval."]));

  const selectedDuplicateGroups = new Map();
  for (const record of selected) {
    const group = duplicateMap.get(record.id);
    if (group) selectedDuplicateGroups.set(group.duplicateGroupId, group);
  }
  const duplicateOperations = [];
  const excludedExactDuplicateIds = [];
  for (const group of selectedDuplicateGroups.values()) {
    const canonicalId = group.probablePreferredCopy || group.mediaIds.slice().sort()[0];
    for (const mediaId of group.mediaIds) {
      const record = recordsById.get(mediaId);
      if (!record) continue;
      if (mediaId === canonicalId) {
        duplicateOperations.push(operation(record, { duplicateDecision: "canonical", canonicalForDuplicateGroup: true }, "Deterministic canonical choice for byte-identical records; reversible owner override remains available."));
      } else {
        excludedExactDuplicateIds.push(mediaId);
        duplicateOperations.push(operation(record, { duplicateDecision: "exact_duplicate_excluded", canonicalForDuplicateGroup: false, duplicateOf: canonicalId, doNotPublish: true, pilotSelected: false }, "Byte-identical duplicate excluded from assisted pilot; source retained unchanged."));
      }
    }
  }
  writeWithBackup(patchPaths.duplicate, makePatch(sourceChecksum, "assisted_exact_duplicate_resolution", duplicateOperations, duplicateOperations.length ? ["Only exact SHA-256 duplicate groups involving selected candidates were staged."] : ["No selected candidate belongs to an exact duplicate group."]));

  const candidate = {
    schemaVersion: "1.0.0",
    phase: "11.6C.2A.2",
    generatedAt: new Date().toISOString(),
    status: "awaiting_owner_confirmation",
    sourceDraftManifestChecksum: sourceChecksum,
    selectedShortIds: selected.map((record) => record.id),
    selectedSequenceId: null,
    recommendedSequenceId: recommendedSequence.sequenceId,
    sequenceSegmentIds: [],
    sequenceOrderSuggestions: [],
    standaloneShortIds: selected.map((record) => record.id),
    selectedLongFormIds: [],
    excludedExactDuplicateIds,
    scoringReasons: Object.fromEntries(selectedRows.map((item) => [item.record.id, { score: item.score, reasons: item.reasons }])),
    technicalMetadata: Object.fromEntries(selected.map((record) => [record.id, probesById.get(record.id)])),
    metadataSuggestions: selected.map((record, index) => suggestedMetadata(record, recommendedSequence, index)),
    metadataGaps: ["No selected record has an owner-confirmed title, description, Scripture anchor, rights status, safety status, or review status."],
    ownerConfirmationRequirements: ["Choose and define one complete sequence.", "Review all 12 records.", "Confirm per-record Scripture, rights, safety, title, and description.", "Complete the rights, Scripture/sequence, and safety declarations."],
    sequenceConstraint: {
      completeDetectedSequenceFitsPilot: false,
      reason: `The recommended source family contains ${recommendedSequence.sourceRecordCount} probable records and is not a confirmed complete sequence. No subset is auto-confirmed.`,
      ownerAction: "Review the three source-family previews and explicitly define or replace one complete pilot sequence."
    },
    candidateSequences: artifacts.sequencePreviews,
    reviewArtifacts: {
      posters: artifacts.posters,
      contactSheets: artifacts.contactSheets,
      sequenceContactSheet: artifacts.sequenceContactSheet,
      sequenceMotionStrip: artifacts.sequenceMotionStrip
    },
    sourceIntegrity: selected.map((record) => ({ mediaId: record.id, ...probesById.get(record.id).sourceAfter, sourceModified: false })),
    gatePreview: null,
    accounting: {
      selectedShorts: TARGET_SHORTS,
      selectedSequences: 0,
      standaloneShorts: TARGET_SHORTS,
      selectedLongForm: 0,
      sourceFilesModified: 0,
      mediaCopied: 0,
      mediaTranscoded: 0,
      runtimeDerivativesGenerated: 0,
      publicFilesWritten: 0,
      externalUploads: 0,
      derivativeExecutionAuthorized: false,
      publicationAuthorized: false
    }
  };
  if (/[A-Za-z]:[\\/]/.test(JSON.stringify(candidate))) throw new Error("Assisted candidate contains an absolute path.");
  fs.mkdirSync(reviewRoot, { recursive: true });
  writeJson(assistedCandidatePath, candidate);

  const gateReport = await validateTeoyubeWorldOwnerGate();
  candidate.gatePreview = {
    status: gateReport.status,
    blockerCount: gateReport.blockers.length,
    counts: gateReport.counts,
    blockers: gateReport.blockers
  };
  writeJson(assistedCandidatePath, candidate);
  writeJson(assistedTechnicalReportPath, {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    probePoolCount: probes.length,
    selectedProbeCount: selected.length,
    selectedAllTechnicallyComplete: selected.every((record) => probesById.get(record.id).sourceIntegrityVerified),
    selectedWithAudio: selected.filter((record) => probesById.get(record.id).hasAudio).map((record) => record.id),
    sourceFilesModified: 0,
    reviewImagesGenerated: selected.length * 2 + artifacts.sequencePreviews.length + 2,
    mediaCopied: 0,
    mediaTranscoded: 0,
    publicFilesWritten: 0,
    externalUploads: 0
  });

  console.log(JSON.stringify({
    candidatePath: path.relative(root, assistedCandidatePath).replace(/\\/g, "/"),
    selectedShorts: selected.length,
    recommendedSequence: { id: recommendedSequence.sequenceId, title: recommendedSequence.sequenceTitle, sourceRecordCount: recommendedSequence.sourceRecordCount },
    candidateSequenceCount: topSequences.length,
    technicalMetadataComplete: selected.length,
    selectedWithAudio: selected.filter((record) => probesById.get(record.id).hasAudio).length,
    exactDuplicatesExcluded: excludedExactDuplicateIds.length,
    gateStatus: gateReport.status,
    blockerCount: gateReport.blockers.length,
    sourceFilesModified: 0,
    mediaCopied: 0,
    mediaTranscoded: 0,
    publicFilesWritten: 0
  }, null, 2));
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });

module.exports = { run, probeRecord, suggestedMetadata, technicalValues };
