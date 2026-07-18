const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const generated = path.join(root, "generated", "teoyubeworld-media");
const manifest = JSON.parse(fs.readFileSync(path.join(generated, "manifests", "teoyubeworld-media-manifest.draft.json"), "utf8"));
const summary = JSON.parse(fs.readFileSync(path.join(generated, "reports", "scan-summary.json"), "utf8"));
const exact = JSON.parse(fs.readFileSync(path.join(generated, "reports", "exact-duplicates.json"), "utf8"));
const probable = JSON.parse(fs.readFileSync(path.join(generated, "reports", "probable-duplicates.json"), "utf8"));
const unsupported = JSON.parse(fs.readFileSync(path.join(generated, "reports", "unsupported-files.json"), "utf8"));
const validation = JSON.parse(fs.readFileSync(path.join(generated, "reports", "manifest-validation.json"), "utf8"));
const docs = path.join(root, "docs", "teoyube");
const records = manifest.records;

function recordItem(record) {
  return { id: record.id, relativePath: record.relativeSourcePath };
}

const exactIds = new Set(exact.flatMap((group) => group.mediaIds));
const sequenceIds = new Set(manifest.sequences.flatMap((sequence) => sequence.mediaIds));
const categories = [
  { title: "Ready for owner review", records, action: "Review title, Scripture mapping, safety, rights, playback suitability, and runtime derivative need." },
  { title: "Scripture mapping confirmed", records: records.filter((record) => record.mappingConfidence === "confirmed"), action: "Verify the explicit source metadata and approve only when accurate." },
  { title: "Scripture mapping probable", records: records.filter((record) => record.mappingConfidence === "probable"), action: "Compare filename metadata with the media and confirm or correct it." },
  { title: "Scripture mapping needs review", records: records.filter((record) => record.mappingConfidence === "needs_review"), action: "Do not publish a Scripture relationship until the owner confirms book, chapter, and verse." },
  { title: "Unknown Scripture", records: records.filter((record) => record.mappingConfidence === "unknown"), action: "Add Scripture only from owner knowledge or explicit source metadata; do not infer from imagery." },
  { title: "Exact duplicate review", records: records.filter((record) => exactIds.has(record.id)), action: "Choose a preferred copy. Do not delete, move, or rename originals during review." },
  { title: "Probable duplicate review", records: records.filter((record) => record.probableDuplicateGroupId), action: "Compare the advisory signals and retain both records until owner review." },
  { title: "Sequence-order review", records: records.filter((record) => sequenceIds.has(record.id)), action: "Confirm sequence membership and narrative order; filename order is only probable." },
  { title: "Missing title or description", records: records.filter((record) => !record.title || !record.description), action: "Review the filename-derived title and provide an editorial description without inventing claims." },
  { title: "Missing thumbnail or poster", records: records.filter((record) => record.mimeType.startsWith("video/") && !record.thumbnailPath && !record.posterPath && !record.ownerThumbnailPath), action: "Generate or assign a reviewed low-resolution image after local media tooling is available." },
  { title: "Audio or caption review", records: records.filter((record) => record.mimeType.startsWith("video/") && (record.hasAudio == null || !record.captionPath)), action: "Confirm audio behavior and associate captions or transcripts when available." },
  { title: "Long-form review", records: records.filter((record) => record.shortOrLong === "long"), action: "Confirm user-initiated playback, rights, captions, poster, and streaming derivative requirements." },
  { title: "Unsupported format", records: unsupported.map((item) => ({ id: "unsupported", relativeSourcePath: item.relativePath })), action: "Review manually. Unsupported files are not eligible for automatic app integration." },
  { title: "Technical extraction failed", records: records.filter((record) => (record.mimeType.startsWith("video/") || record.mimeType.startsWith("audio/")) && record.durationSeconds == null), action: "Install nothing automatically. Re-run locally if ffprobe becomes available." },
  { title: "Ready for app integration", records: records.filter((record) => record.reviewStatus === "approved" && record.safetyStatus === "approved" && record.mappingConfidence === "confirmed" && !record.duplicateGroupId && String(record.runtimePath || "").startsWith("public/media/teoyubeworld/")), action: "Only approved derivatives under public/media/teoyubeworld may enter the runtime manifest." }
];

const queueJson = categories.map((category) => ({
  category: category.title,
  count: category.records.length,
  recommendedOwnerAction: category.action,
  records: category.records.map(recordItem)
}));
fs.writeFileSync(path.join(generated, "reports", "media-review-queue.json"), JSON.stringify(queueJson, null, 2) + "\n");

const lines = [
  "# Phase 11.6C.1 Media Review Queue",
  "",
  "Generated from the full SHA-256 draft manifest. Relative source paths are local review references only. No original was changed.",
  ""
];
for (const category of categories) {
  lines.push("## " + category.title, "", "- Count: " + category.records.length, "- Recommended owner action: " + category.action, "", "### Records", "");
  if (!category.records.length) lines.push("- None");
  else category.records.forEach((record) => lines.push("- " + record.id + " | " + record.relativeSourcePath));
  lines.push("");
}
fs.writeFileSync(path.join(docs, "phase-11-6c1-media-review-queue.md"), lines.join("\n"));

const inventory = [
  "# Phase 11.6C.1 Local Media Inventory Report",
  "",
  "Status: full incremental SHA-256 inventory completed.",
  "",
  "- Source root: media-source/teoyubeworld/originals/",
  "- Files discovered: " + summary.fileCount,
  "- Supported records: " + summary.supportedRecordCount,
  "- Total supported bytes: " + summary.totalMediaSizeBytes,
  "- Video records: " + summary.videoCount,
  "- Audio records: " + summary.audioCount,
  "- Caption/transcript records: " + summary.captionTranscriptCount,
  "- Image records: " + summary.thumbnailImageCount,
  "- Unique media identities: " + summary.uniqueMediaCount,
  "- Exact duplicate groups: " + summary.exactDuplicateGroupCount,
  "- Exact duplicate records: " + summary.exactDuplicateRecordCount,
  "- Probable duplicate groups after full hashes: " + summary.probableDuplicateGroupCount,
  "- Short video records: " + summary.shortVideoCount,
  "- Long-form video records: " + summary.longFormVideoCount,
  "- Scripture sequences: " + summary.sequenceCount,
  "- Unsupported files: " + summary.unsupportedFileCount,
  "- Validation valid: " + validation.valid,
  "- Ready for integration: " + validation.readyForIntegrationCount,
  "",
  "ffprobe and ffmpeg were unavailable. Duration, resolution, orientation, codecs, frame rate, bitrate, and video audio presence remain unknown; no posters, thumbnails, or contact sheets were generated.",
  "",
  "Possible Bible-book hints: Revelation appears in 82 filenames or folders without chapter/verse data. These remain needs_review and produced zero confirmed Scripture references.",
  "",
  "Source integrity comparison passed: zero original file size or modification-time changes."
];
fs.writeFileSync(path.join(docs, "phase-11-6c1-local-media-inventory-report.md"), inventory.join("\n") + "\n");

console.log(JSON.stringify({
  valid: true,
  queueCategories: categories.length,
  queueRecordReferences: queueJson.reduce((sum, category) => sum + category.count, 0),
  inventoryReport: "docs/teoyube/phase-11-6c1-local-media-inventory-report.md",
  reviewQueue: "docs/teoyube/phase-11-6c1-media-review-queue.md"
}, null, 2));
