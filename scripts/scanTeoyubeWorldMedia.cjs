const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { parseScriptureMediaFilename, normalizeWords } = require("./lib/parseScriptureMediaFilename.cjs");

const SCANNER_VERSION = "2.0.0";
const projectRoot = path.resolve(__dirname, "..");
const defaultSourceRoot = path.join(projectRoot, "media-source", "teoyubeworld", "originals");
const localMediaConfigPath = path.join(projectRoot, "config", "local-media-path.json");
const generatedRoot = path.join(projectRoot, "generated", "teoyubeworld-media");
const manifestRoot = path.join(generatedRoot, "manifests");
const reportRoot = path.join(generatedRoot, "reports");
const cachePath = path.join(reportRoot, "scan-cache.json");
const extensionKinds = {
  video: [".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"],
  audio: [".mp3", ".m4a", ".wav", ".aac", ".flac"],
  caption: [".vtt", ".srt"],
  transcript: [".txt", ".md", ".json"],
  image: [".jpg", ".jpeg", ".png", ".webp"]
};
const supportedExtensions = new Set(Object.values(extensionKinds).flat());
const mimeTypes = {
  ".mp4": "video/mp4", ".mov": "video/quicktime", ".m4v": "video/x-m4v", ".webm": "video/webm",
  ".avi": "video/x-msvideo", ".mkv": "video/x-matroska", ".mp3": "audio/mpeg", ".m4a": "audio/mp4",
  ".wav": "audio/wav", ".aac": "audio/aac", ".flac": "audio/flac", ".vtt": "text/vtt",
  ".srt": "application/x-subrip", ".txt": "text/plain", ".md": "text/markdown",
  ".json": "application/json", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp"
};

function slash(value) {
  return String(value || "").split(path.sep).join("/").replace(/^\.\//, "");
}

function configuredSourceRoot() {
  const fromEnvironment = String(process.env.TEOYUBE_MEDIA_SOURCE_ROOT || "").trim();
  if (fromEnvironment) return path.resolve(fromEnvironment);
  try {
    const localConfig = JSON.parse(fs.readFileSync(localMediaConfigPath, "utf8"));
    const configured = String(localConfig.mediaSourceRoot || "").trim();
    if (configured) return path.resolve(configured);
  } catch {
    // The ignored local config is optional; the protected in-project path remains the fallback.
  }
  return defaultSourceRoot;
}

function hash(value, length = 20) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, String(value), "utf8");
}

function within(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function kindFor(extension) {
  for (const [kind, values] of Object.entries(extensionKinds)) {
    if (values.includes(extension)) return kind;
  }
  return "unsupported";
}

function ignored(relativePath, name) {
  const lower = name.toLowerCase();
  return slash(relativePath).split("/").some((segment) => segment.startsWith(".")) ||
    ["thumbs.db", "desktop.ini", ".ds_store"].includes(lower) ||
    lower.startsWith("~$") ||
    /\.(tmp|temp|part|crdownload)$/i.test(lower);
}

function discoverFiles(sourceRoot) {
  const files = [];
  const unsupported = [];
  const warnings = [];
  function walk(directory) {
    if (!within(sourceRoot, directory)) return;
    let entries = [];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      warnings.push("Could not read " + (path.relative(sourceRoot, directory) || ".") + ": " + error.message);
      return;
    }
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      const relativePath = slash(path.relative(sourceRoot, absolutePath));
      if (ignored(relativePath, entry.name)) continue;
      if (entry.isSymbolicLink()) {
        warnings.push("Symbolic link skipped: " + relativePath);
        continue;
      }
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      try {
        const stat = fs.statSync(absolutePath);
        const extension = path.extname(entry.name).toLowerCase();
        const file = {
          absolutePath, relativePath, sourceFileName: entry.name, extension,
          kind: kindFor(extension), size: stat.size, mtimeMs: stat.mtimeMs, birthtimeMs: stat.birthtimeMs
        };
        (file.kind === "unsupported" ? unsupported : files).push(file);
      } catch (error) {
        warnings.push("Could not inspect " + relativePath + ": " + error.message);
      }
    }
  }
  walk(sourceRoot);
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  unsupported.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return { files, unsupported, warnings };
}

function snapshot(files, unsupported) {
  return [...files, ...unsupported].map((file) => ({
    relativePath: file.relativePath, fileSizeBytes: file.size, mtimeMs: file.mtimeMs
  })).sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function compareSnapshots(before, after) {
  const previous = new Map(before.map((item) => [item.relativePath, item]));
  const current = new Map(after.map((item) => [item.relativePath, item]));
  const changes = [];
  for (const [relativePath, item] of previous) {
    const next = current.get(relativePath);
    if (!next) changes.push({ relativePath, change: "missing_after_scan" });
    else if (next.fileSizeBytes !== item.fileSizeBytes || next.mtimeMs !== item.mtimeMs) {
      changes.push({ relativePath, change: "source_metadata_changed" });
    }
  }
  for (const relativePath of current.keys()) {
    if (!previous.has(relativePath)) changes.push({ relativePath, change: "added_during_scan" });
  }
  return { unchanged: changes.length === 0, changeCount: changes.length, changes };
}

function readCache() {
  try {
    const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    return cache && cache.files ? cache : { files: {} };
  } catch {
    return { files: {} };
  }
}

function saveCache(cache) {
  writeJson(cachePath, { scannerVersion: SCANNER_VERSION, updatedAt: new Date().toISOString(), files: cache.files });
}

function checksumFile(filePath) {
  return new Promise((resolve, reject) => {
    const digest = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath, { highWaterMark: 4 * 1024 * 1024 });
    stream.on("error", reject);
    stream.on("data", (chunk) => digest.update(chunk));
    stream.on("end", () => resolve(digest.digest("hex")));
  });
}

function available(command) {
  try {
    return spawnSync(command, ["-version"], { stdio: "ignore", windowsHide: true, timeout: 5000 }).status === 0;
  } catch {
    return false;
  }
}

function frameRate(value) {
  const values = String(value || "").split("/").map(Number);
  const result = values.length === 2 && values[1] ? values[0] / values[1] : Number(value);
  return Number.isFinite(result) ? Number(result.toFixed(4)) : null;
}

function probe(filePath, enabled) {
  if (!enabled) return null;
  try {
    const result = spawnSync("ffprobe", [
      "-v", "error", "-show_entries",
      "format=duration,bit_rate,format_name:stream=codec_type,codec_name,width,height,display_aspect_ratio,sample_aspect_ratio,r_frame_rate,side_data_list",
      "-of", "json", filePath
    ], { encoding: "utf8", windowsHide: true, timeout: 30000, maxBuffer: 2 * 1024 * 1024 });
    if (result.status !== 0) return null;
    const data = JSON.parse(result.stdout);
    const streams = data.streams || [];
    const video = streams.find((stream) => stream.codec_type === "video");
    const audio = streams.filter((stream) => stream.codec_type === "audio");
    const rotation = (video?.side_data_list || []).find((item) => Number.isFinite(Number(item.rotation)))?.rotation;
    return {
      durationSeconds: Number.isFinite(Number(data.format?.duration)) ? Number(data.format.duration) : null,
      width: Number(video?.width) || null, height: Number(video?.height) || null,
      displayAspectRatio: video?.display_aspect_ratio || null, pixelAspectRatio: video?.sample_aspect_ratio || null,
      frameRate: frameRate(video?.r_frame_rate), videoCodec: video?.codec_name || null,
      audioCodec: audio[0]?.codec_name || null, audioStreamCount: audio.length, hasAudio: audio.length > 0,
      bitrate: Number(data.format?.bit_rate) || null, rotation: Number(rotation) || null,
      containerFormat: data.format?.format_name || null, streamCount: streams.length
    };
  } catch {
    return null;
  }
}

function orientation(width, height, rotation) {
  if (!width || !height) return "unknown";
  const rotated = Math.abs(Number(rotation || 0)) % 180 === 90;
  const w = rotated ? height : width;
  const h = rotated ? width : height;
  return w === h ? "square" : w > h ? "landscape" : "portrait";
}

function stem(value) {
  return normalizeWords(path.basename(value, path.extname(value)))
    .replace(/\bthumbnail\b/g, "").replace(/\bcopy\b/g, "")
    .replace(/\b\d{8} \d{4}\b/g, "").replace(/\b[0-9a-z]{20,}\b/g, "")
    .replace(/\s+/g, " ").trim();
}

function mediaKind(file) {
  const top = file.relativePath.split("/")[0].toLowerCase();
  if (file.kind === "audio") return "audio_led";
  if (file.kind === "image") return "background_visual";
  if (file.kind === "video" && top === "shorts") return "short";
  if (file.kind === "video" && top === "long-form") return "long_form";
  return "unknown";
}

function lengthClass(file, technical) {
  if (!["video", "audio"].includes(file.kind)) return "unknown";
  const top = file.relativePath.split("/")[0].toLowerCase();
  if (top === "shorts") return "short";
  if (top === "long-form") return "long";
  if (technical?.durationSeconds == null) return "unknown";
  return technical.durationSeconds <= 60 ? "short" : "long";
}

function surfaces(record) {
  const result = ["TeoyubeSearch", "Embedded Videos"];
  if (record.ScriptureReferences.length) result.push("Today", "Canon", "Promise Table", "Lexicon", "Graph Explorer");
  if (record.shortOrLong === "short") result.push("Calling Compass", "Testimony");
  if (record.shortOrLong === "long") result.push("Book of the Saint", "Teo Guide");
  return [...new Set(result)];
}

async function concurrent(items, limit, callback) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await callback(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function recordFor(file, options, cache, progress) {
  const previous = cache.files[file.relativePath];
  const unchanged = previous && previous.size === file.size && previous.mtimeMs === file.mtimeMs;
  let checksumSha256 = unchanged ? previous.checksumSha256 || null : null;
  let technical = unchanged ? previous.technical || null : null;
  if (options.mode === "full" && !checksumSha256) checksumSha256 = await checksumFile(file.absolutePath);
  if (!technical && options.ffprobeAvailable && ["video", "audio"].includes(file.kind)) technical = probe(file.absolutePath, true);
  const folders = slash(path.dirname(file.relativePath)).split("/").filter((part) => part !== ".");
  const parsed = parseScriptureMediaFilename(file.sourceFileName, { parentFolders: folders.slice(-2).reverse() });
  const width = technical?.width ?? null;
  const height = technical?.height ?? null;
  const record = {
    id: "media-" + hash([file.relativePath.toLowerCase(), file.size, file.kind].join("|")),
    sourceFileName: file.sourceFileName, relativeSourcePath: file.relativePath,
    normalizedFileName: file.sourceFileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-"),
    checksumSha256, duplicateGroupId: null, probableDuplicateGroupId: null,
    fileExtension: file.extension.slice(1), mimeType: mimeTypes[file.extension],
    mediaKind: mediaKind(file), title: parsed.probableTitle || path.basename(file.sourceFileName, file.extension),
    description: null, durationSeconds: technical?.durationSeconds ?? null,
    hasAudio: technical?.hasAudio ?? (file.kind === "audio" ? true : null),
    audioCodec: technical?.audioCodec ?? null, videoCodec: technical?.videoCodec ?? null,
    audioStreamCount: technical?.audioStreamCount ?? null, width, height,
    aspectRatio: width && height ? Number((width / height).toFixed(4)) : null,
    displayAspectRatio: technical?.displayAspectRatio ?? null, pixelAspectRatio: technical?.pixelAspectRatio ?? null,
    orientation: orientation(width, height, technical?.rotation), frameRate: technical?.frameRate ?? null,
    bitrate: technical?.bitrate ?? null, rotation: technical?.rotation ?? null,
    containerFormat: technical?.containerFormat ?? null, streamCount: technical?.streamCount ?? null,
    fileSizeBytes: file.size, BibleBook: parsed.normalizedBook || null, chapter: parsed.chapter,
    verseStart: parsed.verseStart, verseEnd: parsed.verseEnd,
    ScriptureReferences: parsed.chapter ? [parsed.reference] : [], translation: null,
    sequenceId: null, sequenceOrder: null, shortOrLong: lengthClass(file, technical),
    themes: folders.slice(1).map(normalizeWords).filter(Boolean), TeoyubeWordIds: [],
    promiseClusterIds: [], journeyIds: [], callingIds: [], prayerSequenceIds: [],
    tags: [...new Set([...parsed.inferredTags, ...folders.map(normalizeWords).filter(Boolean)])],
    recommendedSurfaces: [], captionPath: null, transcriptPath: null, externalAudioPath: null,
    ownerThumbnailPath: null, thumbnailPath: null, posterPath: null, shortPreviewIds: [], longFormMediaId: null,
    owner: "TeoyubeWorld", sourceChannel: "TeoyubeWorld", copyrightStatus: "needs_review",
    reviewStatus: "needs_review", safetyStatus: "needs_review",
    ScriptureMappingStatus: parsed.parserConfidence, mappingConfidence: parsed.parserConfidence,
    mappingReasons: parsed.parserReasons,
    warnings: [...parsed.warnings, ...(["video", "audio"].includes(file.kind) && !technical
      ? ["Technical metadata unavailable because ffprobe is missing or extraction failed."] : [])],
    createdAt: new Date(file.birthtimeMs || file.mtimeMs).toISOString(),
    updatedAt: new Date(file.mtimeMs).toISOString()
  };
  record.recommendedSurfaces = surfaces(record);
  cache.files[file.relativePath] = { size: file.size, mtimeMs: file.mtimeMs, checksumSha256, technical };
  progress.done += 1;
  if (progress.done % 100 === 0 || progress.done === progress.total) {
    console.log("Scanned " + progress.done + "/" + progress.total + " files (" + options.mode + ").");
    if (options.mode === "full") saveCache(cache);
  }
  return record;
}

function exactDuplicates(records) {
  const buckets = new Map();
  for (const record of records) {
    if (!record.checksumSha256) continue;
    const key = record.checksumSha256 + "|" + record.fileSizeBytes + "|" + record.mimeType.split("/")[0];
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(record);
  }
  const report = [];
  for (const group of buckets.values()) {
    if (group.length < 2) continue;
    const id = "exact-" + hash(group[0].checksumSha256 + group[0].fileSizeBytes, 16);
    group.forEach((record) => { record.duplicateGroupId = id; });
    const preferred = [...group].sort((a, b) => a.relativeSourcePath.length - b.relativeSourcePath.length)[0];
    report.push({
      duplicateGroupId: id, mediaIds: group.map((record) => record.id),
      relativePaths: group.map((record) => record.relativeSourcePath),
      byteSizes: group.map((record) => record.fileSizeBytes),
      durations: group.map((record) => record.durationSeconds),
      checksums: [group[0].checksumSha256], probablePreferredCopy: preferred.id,
      reasons: ["Identical SHA-256", "Identical byte size", "Compatible media type"],
      ownerReviewStatus: "pending"
    });
  }
  return report;
}

function probableDuplicates(records) {
  const buckets = new Map();
  for (const record of records) {
    const key = record.mimeType.split("/")[0] + "|" + stem(record.sourceFileName) + "|" + record.fileSizeBytes;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(record);
  }
  const report = [];
  for (const group of buckets.values()) {
    if (group.length < 2 || new Set(group.map((record) => record.duplicateGroupId || record.id)).size < 2) continue;
    const id = "probable-" + hash(group.map((record) => record.id).sort().join("|"), 16);
    group.forEach((record) => { record.probableDuplicateGroupId = id; });
    report.push({
      probableDuplicateGroupId: id, mediaIds: group.map((record) => record.id),
      relativePaths: group.map((record) => record.relativeSourcePath),
      byteSizes: group.map((record) => record.fileSizeBytes),
      durations: group.map((record) => record.durationSeconds),
      checksums: group.map((record) => record.checksumSha256),
      probablePreferredCopy: [...group].sort((a, b) => a.relativeSourcePath.length - b.relativeSourcePath.length)[0].id,
      reasons: ["Same normalized filename", "Identical byte size", "Checksum differs or is unavailable"],
      ownerReviewStatus: "pending"
    });
  }
  return report;
}

function associateSidecars(records) {
  const groups = new Map();
  for (const record of records) {
    const key = path.posix.dirname(record.relativeSourcePath) + "|" + stem(record.sourceFileName);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  for (const group of groups.values()) {
    const videos = group.filter((record) => record.mimeType.startsWith("video/"));
    for (const video of videos) {
      video.captionPath = group.find((item) => ["vtt", "srt"].includes(item.fileExtension))?.relativeSourcePath || null;
      video.transcriptPath = group.find((item) => ["txt", "md"].includes(item.fileExtension))?.relativeSourcePath || null;
      video.externalAudioPath = group.find((item) => item.mimeType.startsWith("audio/"))?.relativeSourcePath || null;
      video.ownerThumbnailPath = group.find((item) => item.mimeType.startsWith("image/"))?.relativeSourcePath || null;
    }
  }
  for (const image of records.filter((record) => record.relativeSourcePath.startsWith("thumbnails/"))) {
    const key = stem(image.sourceFileName);
    const target = records.find((record) => record.mimeType.startsWith("video/") &&
      (stem(record.sourceFileName) === key || normalizeWords(path.posix.dirname(record.relativeSourcePath).split("/").pop()) === key));
    if (target) target.ownerThumbnailPath = image.relativeSourcePath;
  }
}

function sequencesFor(records) {
  const buckets = new Map();
  for (const record of records) {
    const parts = record.relativeSourcePath.split("/");
    if (parts[0] !== "shorts" || parts.length < 3 || !record.mimeType.startsWith("video/")) continue;
    if (!buckets.has(parts[1])) buckets.set(parts[1], []);
    buckets.get(parts[1]).push(record);
  }
  const sequences = [];
  const longForms = records.filter((record) => record.relativeSourcePath.startsWith("long-form/") && record.mimeType.startsWith("video/"));
  for (const [title, group] of buckets) {
    group.sort((a, b) => a.sourceFileName.localeCompare(b.sourceFileName, undefined, { numeric: true }));
    const sequenceId = "sequence-" + hash(normalizeWords(title), 16);
    group.forEach((record, index) => { record.sequenceId = sequenceId; record.sequenceOrder = index + 1; });
    const longForm = longForms.find((record) => stem(record.sourceFileName) === normalizeWords(title));
    if (longForm) {
      longForm.shortPreviewIds = group.map((record) => record.id);
      group.forEach((record) => {
        record.longFormMediaId = longForm.id;
        record.warnings.push("Short/long relationship inferred from matching folder and title; owner confirmation required.");
      });
    }
    const knownDurations = group.map((record) => record.durationSeconds).filter(Number.isFinite);
    sequences.push({
      sequenceId, sequenceTitle: title,
      ScriptureReferences: [...new Set(group.flatMap((record) => record.ScriptureReferences))],
      mediaIds: group.map((record) => record.id), orderConfidence: "probable",
      totalDuration: knownDurations.length === group.length ? knownDurations.reduce((sum, value) => sum + value, 0) : null,
      audioBehavior: group.some((record) => record.hasAudio === true) ? "mixed_or_audio" : "unknown",
      probableShortLongRelationship: longForm?.id || null, reviewStatus: "needs_review",
      warnings: ["Filename ordering is advisory and requires owner review."]
    });
  }
  return sequences;
}

function csv(value) {
  if (Array.isArray(value)) value = value.join("|");
  if (value == null) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function writeCsv(filePath, headers, rows) {
  if (fs.existsSync(filePath)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.copyFileSync(filePath, filePath.replace(/\.csv$/i, ".backup-" + stamp + ".csv"));
  }
  writeText(filePath, [headers.join(","), ...rows.map((row) => headers.map((header) => csv(row[header])).join(","))].join("\n") + "\n");
}

function countBy(records, selector) {
  return records.reduce((counts, record) => {
    const key = selector(record) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function buildSummary(records, exact, probable, sequences, unsupported, options) {
  const exactRecordCount = records.filter((record) => record.duplicateGroupId).length;
  return {
    scannerVersion: SCANNER_VERSION, mode: options.mode, generatedAt: new Date().toISOString(),
    fileCount: records.length + unsupported.length, supportedRecordCount: records.length,
    totalMediaSizeBytes: records.reduce((sum, record) => sum + record.fileSizeBytes, 0),
    videoCount: records.filter((record) => record.mimeType.startsWith("video/")).length,
    audioCount: records.filter((record) => record.mimeType.startsWith("audio/")).length,
    captionTranscriptCount: records.filter((record) => ["vtt", "srt", "txt", "md", "json"].includes(record.fileExtension)).length,
    thumbnailImageCount: records.filter((record) => record.mimeType.startsWith("image/")).length,
    uniqueMediaCount: records.length - exactRecordCount + exact.length,
    exactDuplicateGroupCount: exact.length, exactDuplicateRecordCount: exactRecordCount,
    probableDuplicateGroupCount: probable.length,
    shortVideoCount: records.filter((record) => record.mimeType.startsWith("video/") && record.shortOrLong === "short").length,
    longFormVideoCount: records.filter((record) => record.mimeType.startsWith("video/") && record.shortOrLong === "long").length,
    mediaWithAudio: records.filter((record) => record.hasAudio === true).length,
    mediaWithoutAudio: records.filter((record) => record.hasAudio === false).length,
    audioUnknown: records.filter((record) => record.hasAudio == null).length,
    resolutions: countBy(records, (record) => record.width && record.height ? record.width + "x" + record.height : "unknown"),
    orientations: countBy(records, (record) => record.orientation),
    videoCodecs: countBy(records, (record) => record.videoCodec),
    audioCodecs: countBy(records, (record) => record.audioCodec),
    BibleBooks: countBy(records, (record) => record.BibleBook),
    ScriptureReferences: countBy(records, (record) => record.ScriptureReferences[0]),
    sequenceCount: sequences.length, mappingConfidence: countBy(records, (record) => record.mappingConfidence),
    unsupportedFileCount: unsupported.length, ffprobeAvailable: options.ffprobeAvailable,
    ffmpegAvailable: options.ffmpegAvailable, postersGenerated: 0, thumbnailsGenerated: 0, contactSheetsGenerated: 0
  };
}

function optimizationPlan(records) {
  return {
    generatedAt: new Date().toISOString(), status: "owner_review_required", bulkOptimizationPerformed: false,
    classes: [
      { id: "short_silent_landscape", targetDimensions: "854x480", targetCodec: "H.264 MP4; optional VP9 WebM", targetBitrateRange: "0.7-1.5 Mbps", posterSize: "960x540 WebP", thumbnailSize: "480x270 WebP", autoplayEligibility: "muted visible-only after approval", preloadBehavior: "metadata", mobileBehavior: "480p", reducedMotionBehavior: "poster only" },
      { id: "short_portrait", targetDimensions: "480x854", targetCodec: "H.264 MP4", targetBitrateRange: "0.6-1.2 Mbps", posterSize: "540x960 WebP", thumbnailSize: "270x480 WebP", autoplayEligibility: "muted mobile cards only", preloadBehavior: "metadata", mobileBehavior: "preferred", reducedMotionBehavior: "poster only" },
      { id: "long_form_with_audio", targetDimensions: "cap at 1080p", targetCodec: "H.264/AAC MP4", targetBitrateRange: "2.5-6 Mbps", posterSize: "1280x720 WebP", thumbnailSize: "480x270 WebP", autoplayEligibility: "never", preloadBehavior: "metadata or none", mobileBehavior: "user initiated", reducedMotionBehavior: "poster and controls" },
      { id: "audio_only", targetDimensions: null, targetCodec: "AAC/M4A or MP3", targetBitrateRange: "96-192 kbps", posterSize: "960x540 WebP", thumbnailSize: "480x270 WebP", autoplayEligibility: "never", preloadBehavior: "metadata", mobileBehavior: "audio player with transcript", reducedMotionBehavior: "unchanged" }
    ],
    observedCounts: {
      short: records.filter((record) => record.shortOrLong === "short").length,
      long: records.filter((record) => record.shortOrLong === "long").length,
      audio: records.filter((record) => record.mimeType.startsWith("audio/")).length
    }
  };
}

function markdownReports(exact, probable, sequences) {
  const duplicateLines = ["# TeoyubeWorld Duplicate Review", "", "Advisory only. No source file was changed.", "", "Exact groups: " + exact.length, "Probable groups: " + probable.length];
  for (const group of exact) duplicateLines.push("", "## " + group.duplicateGroupId, ...group.relativePaths.map((value) => "- " + value));
  for (const group of probable) duplicateLines.push("", "## " + group.probableDuplicateGroupId, ...group.relativePaths.map((value) => "- " + value));
  writeText(path.join(reportRoot, "duplicate-review.md"), duplicateLines.join("\n") + "\n");
  const sequenceLines = ["# TeoyubeWorld Scripture Sequence Review", "", "Ordering is probable until owner-confirmed.", "", "Sequence count: " + sequences.length];
  for (const sequence of sequences) sequenceLines.push("", "## " + sequence.sequenceTitle, "- ID: " + sequence.sequenceId, "- Records: " + sequence.mediaIds.length, "- Confidence: " + sequence.orderConfidence);
  writeText(path.join(reportRoot, "scripture-sequences-review.md"), sequenceLines.join("\n") + "\n");
}

async function scanLegacyFixture(sourceRoot) {
  const resolved = path.resolve(sourceRoot);
  const fixtureRoots = [path.join(projectRoot, ".tmp"), path.join(projectRoot, "scripts", "fixtures")];
  if (!fixtureRoots.some((fixtureRoot) => within(fixtureRoot, resolved))) {
    throw new Error("Legacy fixture scans are restricted to project test-fixture directories.");
  }
  const discovered = discoverFiles(resolved);
  const records = [];
  for (const file of discovered.files) {
    const checksum = await checksumFile(file.absolutePath);
    const parsed = parseScriptureMediaFilename(file.sourceFileName, {
      parentFolders: slash(path.dirname(file.relativePath)).split("/").slice(-2).reverse()
    });
    const reference = parsed.chapter ? [parsed.reference] : [];
    records.push({
      id: "media-" + hash([file.relativePath.toLowerCase(), file.size, file.kind].join("|")),
      sourceFileName: file.sourceFileName,
      relativePath: file.relativePath,
      relativeSourcePath: file.relativePath,
      normalizedFileName: file.sourceFileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-"),
      checksum,
      checksumSha256: checksum,
      fileExtension: file.extension.slice(1),
      mimeType: mimeTypes[file.extension],
      mediaKind: mediaKind(file),
      title: parsed.probableTitle,
      description: null,
      durationSeconds: null,
      hasAudio: file.kind === "audio" ? true : null,
      width: null,
      height: null,
      orientation: "unknown",
      fileSizeBytes: file.size,
      bibleBook: parsed.normalizedBook || null,
      BibleBook: parsed.normalizedBook || null,
      chapter: parsed.chapter,
      verseStart: parsed.verseStart,
      verseEnd: parsed.verseEnd,
      scriptureReferences: reference,
      ScriptureReferences: reference,
      themes: [],
      teoyubeWordIds: [],
      TeoyubeWordIds: [],
      promiseClusterIds: [],
      journeyIds: [],
      callingIds: [],
      prayerSequenceIds: [],
      tags: parsed.inferredTags,
      shortOrLong: "unknown",
      recommendedSurfaces: ["TeoyubeSearch", "Embedded Videos"],
      owner: "fixture",
      sourceChannel: "fixture",
      copyrightStatus: "review_required",
      reviewStatus: "needs_review",
      safetyStatus: "needs_review",
      ScriptureMappingStatus: parsed.parserConfidence,
      mappingConfidence: parsed.parserConfidence,
      createdAt: new Date(file.birthtimeMs || file.mtimeMs).toISOString(),
      updatedAt: new Date(file.mtimeMs).toISOString(),
      imported: false,
      sampleOnly: false
    });
  }
  return {
    schemaVersion: "1.0.0",
    scannerVersion: SCANNER_VERSION,
    scanMode: "full",
    imported: false,
    sampleOnly: false,
    sourceFolderIncluded: false,
    recordCount: records.length,
    records,
    warnings: discovered.warnings
  };
}

async function scanTeoyubeWorldMedia(input = {}) {
  if (typeof input === "string") return scanLegacyFixture(input);
  const options = { mode: input.mode === "quick" ? "quick" : "full", sourceRoot: path.resolve(input.sourceRoot || configuredSourceRoot()) };
  if (!fs.existsSync(options.sourceRoot) || !fs.statSync(options.sourceRoot).isDirectory()) {
    throw new Error("Configured TeoyubeWorld media source is not an accessible directory.");
  }
  fs.mkdirSync(manifestRoot, { recursive: true });
  fs.mkdirSync(reportRoot, { recursive: true });
  const first = discoverFiles(options.sourceRoot);
  const before = snapshot(first.files, first.unsupported);
  writeJson(path.join(reportRoot, "source-metadata-before.json"), before);
  options.ffprobeAvailable = available("ffprobe");
  options.ffmpegAvailable = available("ffmpeg");
  const cache = readCache();
  const progress = { done: 0, total: first.files.length };
  const records = (await concurrent(first.files, options.mode === "full" ? 2 : 8, async (file) => {
    try {
      return await recordFor(file, options, cache, progress);
    } catch (error) {
      first.warnings.push("Could not scan " + file.relativePath + ": " + error.message);
      progress.done += 1;
      return null;
    }
  })).filter(Boolean);
  saveCache(cache);
  const exact = exactDuplicates(records);
  const probable = probableDuplicates(records);
  associateSidecars(records);
  const sequences = sequencesFor(records);
  const second = discoverFiles(options.sourceRoot);
  const after = snapshot(second.files, second.unsupported);
  const integrity = compareSnapshots(before, after);
  writeJson(path.join(reportRoot, "source-metadata-after.json"), after);
  writeJson(path.join(reportRoot, "source-integrity.json"), integrity);
  const summary = buildSummary(records, exact, probable, sequences, first.unsupported, options);
  const warnings = [
    ...first.warnings,
    ...(!options.ffprobeAvailable ? ["ffprobe unavailable; stream-level technical metadata remains unknown."] : []),
    ...(!options.ffmpegAvailable ? ["ffmpeg unavailable; no posters, thumbnails, motion strips, or contact sheets were generated."] : []),
    ...(options.mode === "quick" ? ["Quick scan is not complete checksum coverage."] : []),
    ...(!integrity.unchanged ? ["Original source metadata changed during scanning."] : [])
  ];
  const manifest = {
    schemaVersion: "1.0.0", scannerVersion: SCANNER_VERSION, status: "draft_owner_review_required",
    generatedAt: new Date().toISOString(), sourceChannel: "TeoyubeWorld", localOnly: true,
    sourceRoot: within(projectRoot, options.sourceRoot) ? "media-source/teoyubeworld/originals" : "external-local-media-source", scanMode: options.mode,
    recordCount: records.length, uniqueMediaCount: summary.uniqueMediaCount,
    exactDuplicateCount: exact.length, probableDuplicateCount: probable.length,
    sequenceCount: sequences.length, reviewRequiredCount: records.length, records, sequences, warnings
  };
  writeJson(path.join(manifestRoot, "teoyubeworld-media-manifest.draft.json"), manifest);
  writeJson(path.join(reportRoot, "exact-duplicates.json"), exact);
  writeJson(path.join(reportRoot, "probable-duplicates.json"), probable);
  writeJson(path.join(reportRoot, "scripture-sequences.json"), sequences);
  writeJson(path.join(reportRoot, "scan-summary.json"), summary);
  writeJson(path.join(reportRoot, "media-optimization-plan.json"), optimizationPlan(records));
  writeJson(path.join(reportRoot, "unsupported-files.json"), first.unsupported.map((file) => ({ relativePath: file.relativePath, fileExtension: file.extension, fileSizeBytes: file.size, ownerReviewStatus: "pending" })));
  writeJson(path.join(reportRoot, "review-artifact-generation.json"), {
    ffmpegAvailable: options.ffmpegAvailable, postersGenerated: 0, thumbnailsGenerated: 0, contactSheetsGenerated: 0,
    status: options.ffmpegAvailable ? "not_run_without_explicit_artifact_command" : "unavailable_missing_ffmpeg"
  });
  markdownReports(exact, probable, sequences);

  const mediaHeaders = ["media ID", "relative source path", "title", "Bible book", "chapter", "verse start", "verse end", "Scripture reference", "duration", "has audio", "short/long", "sequence ID", "sequence order", "themes", "Teoyube words", "promise clusters", "recommended surfaces", "review status", "mapping confidence", "warnings", "owner approval"];
  writeCsv(path.join(manifestRoot, "teoyubeworld-media-review.csv"), mediaHeaders, records.map((record) => ({
    "media ID": record.id, "relative source path": record.relativeSourcePath, title: record.title,
    "Bible book": record.BibleBook, chapter: record.chapter, "verse start": record.verseStart,
    "verse end": record.verseEnd, "Scripture reference": record.ScriptureReferences, duration: record.durationSeconds,
    "has audio": record.hasAudio, "short/long": record.shortOrLong, "sequence ID": record.sequenceId,
    "sequence order": record.sequenceOrder, themes: record.themes, "Teoyube words": record.TeoyubeWordIds,
    "promise clusters": record.promiseClusterIds, "recommended surfaces": record.recommendedSurfaces,
    "review status": record.reviewStatus, "mapping confidence": record.mappingConfidence,
    warnings: record.warnings, "owner approval": ""
  })));
  const sequenceHeaders = ["sequence ID", "sequence title", "Scripture references", "media IDs", "order confidence", "total duration", "long-form media ID", "review status", "warnings", "owner approval"];
  writeCsv(path.join(manifestRoot, "teoyubeworld-sequence-review.csv"), sequenceHeaders, sequences.map((sequence) => ({
    "sequence ID": sequence.sequenceId, "sequence title": sequence.sequenceTitle,
    "Scripture references": sequence.ScriptureReferences, "media IDs": sequence.mediaIds,
    "order confidence": sequence.orderConfidence, "total duration": sequence.totalDuration,
    "long-form media ID": sequence.probableShortLongRelationship, "review status": sequence.reviewStatus,
    warnings: sequence.warnings, "owner approval": ""
  })));
  return { manifest, summary, integrity, exact, probable, sequences };
}

function argumentsFor(argv) {
  let mode = "full";
  let sourceRoot = configuredSourceRoot();
  for (const argument of argv) {
    if (argument === "--quick") mode = "quick";
    else if (argument === "--full") mode = "full";
    else if (!argument.startsWith("--")) sourceRoot = path.resolve(argument);
  }
  return { mode, sourceRoot };
}

async function main() {
  try {
    const options = argumentsFor(process.argv.slice(2));
    const result = await scanTeoyubeWorldMedia(options);
    console.log(JSON.stringify({
      validDraft: result.integrity.unchanged, sourceOriginalsUnchanged: result.integrity.unchanged,
      draftManifest: "generated/teoyubeworld-media/manifests/teoyubeworld-media-manifest.draft.json",
      reviewCsv: "generated/teoyubeworld-media/manifests/teoyubeworld-media-review.csv",
      ...result.summary
    }, null, 2));
    if (!result.integrity.unchanged) process.exitCode = 1;
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) main();
module.exports = { SCANNER_VERSION, defaultSourceRoot, configuredSourceRoot, supportedExtensions, discoverFiles, scanTeoyubeWorldMedia };
