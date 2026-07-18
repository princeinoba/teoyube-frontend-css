const fs = require("fs");
const path = require("path");
const { normalizeBookName } = require("./lib/parseScriptureMediaFilename.cjs");

const root = path.resolve(__dirname, "..");
const draftManifest = path.join(root, "generated", "teoyubeworld-media", "manifests", "teoyubeworld-media-manifest.draft.json");
const sampleManifest = path.join(root, "src", "data", "teoyubeworld-media-manifest.sample.json");
const reportRoot = path.join(root, "generated", "teoyubeworld-media", "reports");
const supportedExtensions = new Set(["mp4", "mov", "m4v", "webm", "avi", "mkv", "mp3", "m4a", "wav", "aac", "flac", "vtt", "srt", "txt", "md", "json", "jpg", "jpeg", "png", "webp"]);
const supportedMimes = new Set(["video/mp4", "video/quicktime", "video/x-m4v", "video/webm", "video/x-msvideo", "video/x-matroska", "audio/mpeg", "audio/mp4", "audio/wav", "audio/aac", "audio/flac", "text/vtt", "application/x-subrip", "text/plain", "text/markdown", "application/json", "image/jpeg", "image/png", "image/webp"]);
const orientations = new Set(["landscape", "portrait", "square", "unknown"]);
const lengthClasses = new Set(["short", "long", "unknown"]);
const reviewStatuses = new Set(["draft", "needs_review", "review_required", "sample_only", "approved", "rejected", "needs_edit", "duplicate"]);
const mappingStatuses = new Set(["confirmed", "probable", "needs_review", "unknown"]);
const surfaces = new Set(["Today", "Canon", "TeoyubeSearch", "Promise Table", "Calling Compass", "Book of the Saint", "Lexicon", "Testimony", "Teo Guide", "Graph Explorer", "Embedded Videos"]);

function safeRelative(value) {
  const text = String(value || "");
  return Boolean(text) && !path.isAbsolute(text) && !/^[A-Za-z]:[\\/]/.test(text) &&
    !text.startsWith("/") && !text.split(/[\\/]/).includes("..");
}

function injection(value) {
  return /<\s*script\b|javascript\s*:|onerror\s*=|onload\s*=|<\s*iframe\b|<\s*html\b/i.test(String(value || ""));
}

function secret(value) {
  return /(?:api[_-]?key|secret|token|password)\s*[:=]\s*[A-Za-z0-9_\-]{8,}/i.test(String(value || ""));
}

function scripture(reference) {
  const match = String(reference || "").trim().match(/^((?:[1-3]\s*)?[A-Za-z][A-Za-z ]+)\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?$/);
  return Boolean(match && normalizeBookName(match[1]));
}

function increment(target, key) {
  const safeKey = key || "unknown";
  target[safeKey] = (target[safeKey] || 0) + 1;
}

function durationClass(value) {
  if (value == null) return "unknown";
  if (value <= 60) return "short";
  if (value <= 1200) return "medium";
  return "long";
}

function normalized(record) {
  return {
    ...record,
    relativeSourcePath: record.relativeSourcePath || record.relativePath,
    checksumSha256: record.checksumSha256 || record.checksum || null,
    BibleBook: record.BibleBook || record.bibleBook || null,
    ScriptureReferences: record.ScriptureReferences || record.scriptureReferences || [],
    mappingConfidence: record.mappingConfidence || record.ScriptureMappingStatus || "unknown",
    ScriptureMappingStatus: record.ScriptureMappingStatus || record.mappingConfidence || "unknown"
  };
}

function validateTeoyubeWorldMediaManifest(manifest) {
  const errors = [];
  const warnings = [];
  const sourceRecords = Array.isArray(manifest?.records) ? manifest.records : [];
  const records = sourceRecords.map(normalized);
  const ids = new Map();
  const checksums = new Map();
  const paths = new Map();
  const mediaByKind = {};
  const mediaByBibleBook = {};
  const mediaByScriptureReference = {};
  const mediaByDurationCategory = {};
  const missingTechnicalMetadata = [];
  const missingScriptureMetadata = [];
  const missingThumbnails = [];
  const duplicateCandidates = [];

  if (!manifest || typeof manifest !== "object") errors.push("Manifest must be an object.");
  if (!manifest?.schemaVersion) errors.push("schemaVersion is required.");
  if (!Array.isArray(manifest?.records)) errors.push("records must be an array.");
  if (manifest?.sourceRoot && !safeRelative(manifest.sourceRoot)) errors.push("sourceRoot must be a safe relative path.");

  records.forEach((record, index) => {
    const prefix = "records[" + index + "]";
    const extension = String(record.fileExtension || "").replace(/^\./, "").toLowerCase();
    if (!record.id || !/^[a-z0-9][a-z0-9-]{5,}$/i.test(record.id)) errors.push(prefix + ".id is invalid.");
    if (ids.has(record.id)) errors.push(prefix + ".id duplicates " + ids.get(record.id) + ".");
    else ids.set(record.id, prefix);

    if (!safeRelative(record.relativeSourcePath)) errors.push(prefix + ".relativeSourcePath must be a safe relative path.");
    if (paths.has(record.relativeSourcePath)) errors.push(prefix + ".relativeSourcePath duplicates " + paths.get(record.relativeSourcePath) + ".");
    else paths.set(record.relativeSourcePath, prefix);
    for (const field of ["captionPath", "transcriptPath", "externalAudioPath", "ownerThumbnailPath", "thumbnailPath", "posterPath"]) {
      if (record[field] && !safeRelative(record[field])) errors.push(prefix + "." + field + " must be a safe relative path.");
    }

    if (!supportedExtensions.has(extension)) errors.push(prefix + ".fileExtension is unsupported.");
    if (!supportedMimes.has(record.mimeType)) errors.push(prefix + ".mimeType is unsupported.");
    if (/^(exe|dll|bat|cmd|ps1|js|cjs|mjs|html?|php|sh)$/i.test(extension)) errors.push(prefix + " references executable content.");
    if (record.checksumSha256 != null && !/^[a-f0-9]{64}$/i.test(record.checksumSha256)) errors.push(prefix + ".checksumSha256 is invalid.");
    if (manifest?.scanMode === "full" && !record.checksumSha256) errors.push(prefix + ".checksumSha256 is required for a full scan.");
    if (!orientations.has(record.orientation || "unknown")) errors.push(prefix + ".orientation is invalid.");
    if (!lengthClasses.has(record.shortOrLong || "unknown")) errors.push(prefix + ".shortOrLong is invalid.");
    if (!reviewStatuses.has(record.reviewStatus)) errors.push(prefix + ".reviewStatus is invalid.");
    if (!mappingStatuses.has(record.ScriptureMappingStatus)) errors.push(prefix + ".ScriptureMappingStatus is invalid.");
    if (!mappingStatuses.has(record.mappingConfidence)) errors.push(prefix + ".mappingConfidence is invalid.");
    if ((record.recommendedSurfaces || []).some((surface) => !surfaces.has(surface))) errors.push(prefix + ".recommendedSurfaces contains an invalid surface.");

    for (const field of ["durationSeconds", "fileSizeBytes", "width", "height", "chapter", "verseStart", "verseEnd", "bitrate", "frameRate"]) {
      if (record[field] != null && (!Number.isFinite(record[field]) || record[field] < 0)) errors.push(prefix + "." + field + " must be non-negative or null.");
    }
    if (record.verseEnd != null && record.verseStart != null && record.verseEnd < record.verseStart) errors.push(prefix + ".verseEnd is before verseStart.");
    if (record.BibleBook && !normalizeBookName(record.BibleBook)) errors.push(prefix + ".BibleBook is not canonical.");
    for (const reference of record.ScriptureReferences || []) {
      if (!scripture(reference)) errors.push(prefix + " contains invalid Scripture reference " + reference + ".");
      increment(mediaByScriptureReference, reference);
    }

    const strings = [record.title, record.description, record.sourceFileName, record.normalizedFileName, record.owner, record.sourceChannel, ...(record.tags || [])];
    if (strings.some(injection)) errors.push(prefix + " contains HTML or script injection.");
    if (strings.some(secret)) errors.push(prefix + " contains a secret-like value.");
    if (strings.some((value) => /^https?:\/\//i.test(String(value || "")))) errors.push(prefix + " contains an unreviewed external URL.");
    if (record.reviewStatus === "approved" && record.safetyStatus !== "approved") errors.push(prefix + " cannot be approved before safety approval.");
    if (record.productionReady === true && record.reviewStatus !== "approved") errors.push(prefix + " marks an unreviewed record production-ready.");

    if (record.checksumSha256) {
      if (checksums.has(record.checksumSha256)) duplicateCandidates.push({ reason: "same_checksum", records: [checksums.get(record.checksumSha256), record.id] });
      else checksums.set(record.checksumSha256, record.id);
    }
    increment(mediaByKind, record.mediaKind);
    increment(mediaByBibleBook, record.BibleBook);
    increment(mediaByDurationCategory, durationClass(record.durationSeconds));
    if (!record.ScriptureReferences?.length) missingScriptureMetadata.push(record.id);
    if (["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"].includes(record.mimeType) && !record.thumbnailPath && !record.ownerThumbnailPath) missingThumbnails.push(record.id);
    if ((record.mimeType.startsWith("video/") || record.mimeType.startsWith("audio/")) &&
      [record.durationSeconds, record.hasAudio, record.containerFormat].some((value) => value == null)) {
      missingTechnicalMetadata.push(record.id);
    }
  });

  if (!records.length) warnings.push("Manifest contains zero records.");
  if (missingTechnicalMetadata.length) warnings.push(missingTechnicalMetadata.length + " record(s) lack complete technical metadata.");
  if (missingScriptureMetadata.length) warnings.push(missingScriptureMetadata.length + " record(s) lack Scripture metadata.");
  if (missingThumbnails.length) warnings.push(missingThumbnails.length + " video record(s) lack a thumbnail or owner thumbnail.");
  if (manifest?.sampleOnly) warnings.push("Sample-only manifest; never treat these records as imported media.");

  const exactDuplicateGroups = new Set(records.map((record) => record.duplicateGroupId).filter(Boolean));
  const readyForIntegration = records.filter((record) =>
    record.reviewStatus === "approved" && record.safetyStatus === "approved" &&
    record.mappingConfidence === "confirmed" && !record.duplicateGroupId &&
    String(record.runtimePath || "").startsWith("public/media/teoyubeworld/")
  );
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    mediaCount: records.length,
    uniqueCount: records.length - records.filter((record) => record.duplicateGroupId).length + exactDuplicateGroups.size,
    duplicateCount: exactDuplicateGroups.size,
    mediaByKind,
    mediaByBibleBook,
    mediaByScriptureReference,
    mediaByDurationCategory,
    mediaWithAudio: records.filter((record) => record.hasAudio === true).length,
    mediaWithoutAudio: records.filter((record) => record.hasAudio === false).length,
    missingTechnicalMetadata,
    missingScriptureMetadata,
    missingThumbnails,
    reviewRequiredCount: records.filter((record) => record.reviewStatus !== "approved").length,
    readyForIntegrationCount: readyForIntegration.length,
    duplicateCandidates
  };
}

function markdown(report, manifestPath) {
  return [
    "# TeoyubeWorld Manifest Validation",
    "",
    "- Manifest: " + path.relative(root, manifestPath).split(path.sep).join("/"),
    "- Valid: " + report.valid,
    "- Media count: " + report.mediaCount,
    "- Unique count: " + report.uniqueCount,
    "- Duplicate groups: " + report.duplicateCount,
    "- Review required: " + report.reviewRequiredCount,
    "- Ready for integration: " + report.readyForIntegrationCount,
    "",
    "## Errors",
    "",
    ...(report.errors.length ? report.errors.map((value) => "- " + value) : ["- None"]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((value) => "- " + value) : ["- None"]),
    ""
  ].join("\n");
}

function main() {
  const defaultPath = fs.existsSync(draftManifest) ? draftManifest : sampleManifest;
  const manifestPath = path.resolve(process.argv[2] || defaultPath);
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const report = validateTeoyubeWorldMediaManifest(manifest);
    fs.mkdirSync(reportRoot, { recursive: true });
    fs.writeFileSync(path.join(reportRoot, "manifest-validation.json"), JSON.stringify({ manifestPath: path.relative(root, manifestPath).split(path.sep).join("/"), ...report }, null, 2) + "\n");
    fs.writeFileSync(path.join(reportRoot, "manifest-validation.md"), markdown(report, manifestPath), "utf8");
    console.log(JSON.stringify({
      manifestPath: path.relative(root, manifestPath).split(path.sep).join("/"),
      valid: report.valid,
      errors: report.errors,
      warnings: report.warnings,
      mediaCount: report.mediaCount,
      uniqueCount: report.uniqueCount,
      duplicateCount: report.duplicateCount,
      mediaByKind: report.mediaByKind,
      mediaByBibleBook: report.mediaByBibleBook,
      mediaByScriptureReference: report.mediaByScriptureReference,
      mediaByDurationCategory: report.mediaByDurationCategory,
      mediaWithAudio: report.mediaWithAudio,
      mediaWithoutAudio: report.mediaWithoutAudio,
      missingTechnicalMetadataCount: report.missingTechnicalMetadata.length,
      missingScriptureMetadataCount: report.missingScriptureMetadata.length,
      missingThumbnailsCount: report.missingThumbnails.length,
      reviewRequiredCount: report.reviewRequiredCount,
      readyForIntegrationCount: report.readyForIntegrationCount,
      duplicateCandidateCount: report.duplicateCandidates.length
    }, null, 2));
    if (!report.valid) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ valid: false, errors: [error.message] }, null, 2));
    process.exitCode = 1;
  }
}

if (require.main === module) main();
module.exports = { validateScriptureReference: scripture, validateTeoyubeWorldMediaManifest };
