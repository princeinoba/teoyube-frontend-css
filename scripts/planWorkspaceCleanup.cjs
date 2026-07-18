const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const parent = path.dirname(root);
const outputRoot = path.join(root, "generated", "workspace-rescue");
const outputJson = path.join(outputRoot, "cleanup-plan.json");
const storageAuditDoc = path.join(root, "docs", "teoyube", "emergency-storage-audit.md");
const cleanupPlanDoc = path.join(root, "docs", "teoyube", "emergency-workspace-cleanup-plan.md");
const authorizationPhrase = "AUTHORIZE TEOYUBE WORKSPACE CLEANUP";

function slash(value) {
  return String(value).split(path.sep).join("/");
}

function relativeLabel(absolutePath) {
  const relative = path.relative(root, absolutePath);
  return relative && !relative.startsWith("..") ? slash(relative) : slash(absolutePath);
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Number(bytes || 0);
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit > 1 ? 2 : 0)} ${units[unit]}`;
}

function inspectTree(startRoot) {
  const files = [];
  const folders = new Map([[startRoot, { path: startRoot, bytes: 0, files: 0 }]]);
  const warnings = [];

  function addToAncestors(filePath, size) {
    let directory = path.dirname(filePath);
    while (directory === startRoot || directory.startsWith(`${startRoot}${path.sep}`)) {
      const entry = folders.get(directory) || { path: directory, bytes: 0, files: 0 };
      entry.bytes += size;
      entry.files += 1;
      folders.set(directory, entry);
      if (directory === startRoot) break;
      directory = path.dirname(directory);
    }
  }

  function walk(directory) {
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      warnings.push(`${relativeLabel(directory)}: ${error.message}`);
      return;
    }
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!folders.has(absolutePath)) folders.set(absolutePath, { path: absolutePath, bytes: 0, files: 0 });
        walk(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      try {
        const stat = fs.statSync(absolutePath);
        const file = { path: absolutePath, bytes: stat.size, mtimeMs: stat.mtimeMs };
        files.push(file);
        addToAncestors(absolutePath, stat.size);
      } catch (error) {
        warnings.push(`${relativeLabel(absolutePath)}: ${error.message}`);
      }
    }
  }

  walk(startRoot);
  return { files, folders: [...folders.values()], warnings };
}

function getEntry(inventory, relativePath) {
  const target = path.resolve(root, relativePath);
  const folder = inventory.folders.find((entry) => entry.path === target);
  const file = inventory.files.find((entry) => entry.path === target);
  const entry = folder || file;
  return { path: relativePath, bytes: entry?.bytes || 0, files: folder?.files || (file ? 1 : 0), exists: Boolean(entry) };
}

function metadataDigest(files, protectedRoot) {
  const rows = files
    .filter((file) => file.path === protectedRoot || file.path.startsWith(`${protectedRoot}${path.sep}`))
    .map((file) => `${slash(path.relative(protectedRoot, file.path))}\0${file.bytes}\0${Math.trunc(file.mtimeMs)}`)
    .sort();
  return crypto.createHash("sha256").update(rows.join("\n")).digest("hex");
}

function listMatchingFiles(inventory, matcher) {
  return inventory.files.filter((file) => matcher(relativeLabel(file.path), file));
}

function summarizeFiles(files) {
  return { bytes: files.reduce((total, file) => total + file.bytes, 0), files: files.length };
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n");
}

function main() {
  const inventory = inspectTree(root);
  const gitInventory = fs.existsSync(path.join(parent, ".git")) ? inspectTree(path.join(parent, ".git")) : { files: [], folders: [], warnings: [] };
  const protectedRoot = path.join(root, "media-source", "teoyubeworld", "originals");
  const protectedSource = getEntry(inventory, "media-source/teoyubeworld/originals");
  protectedSource.metadataDigestSha256 = metadataDigest(inventory.files, protectedRoot);

  const majorPaths = [
    "media-source", "media-source/teoyubeworld", "media-source/teoyubeworld/originals",
    "generated", "generated/teoyubeworld-media", "public", "public/media", ".next",
    "node_modules", "src", "docs", "Asset", "screenshots", ".tmp", ".media-tmp"
  ].map((item) => getEntry(inventory, item));
  majorPaths.push({
    path: "../.git",
    bytes: gitInventory.folders.find((entry) => entry.path === path.join(parent, ".git"))?.bytes || 0,
    files: gitInventory.files.length,
    exists: gitInventory.files.length > 0
  });

  const archives = summarizeFiles(listMatchingFiles(inventory, (name) => /\.(zip|7z|rar|tar|tgz|gz)$/i.test(name)));
  const logs = summarizeFiles(listMatchingFiles(inventory, (name) => /(^|\/)(logs?|[^/]+\.log)(\/|$)/i.test(name)));
  const contactSheets = summarizeFiles(listMatchingFiles(inventory, (name) => /contact[-_ ]?sheet/i.test(name)));
  const posters = summarizeFiles(listMatchingFiles(inventory, (name) => /(^|\/)posters?(\/|$)|poster\.(png|jpe?g|webp)$/i.test(name)));
  const thumbnails = summarizeFiles(listMatchingFiles(inventory, (name) => /(^|\/)thumbnails?(\/|$)|thumbnail\.(png|jpe?g|webp)$/i.test(name)));
  const derivatives = summarizeFiles(listMatchingFiles(inventory, (name) => /card-preview\.mp4$|mobile-preview\.mp4$|poster\.webp$|thumbnail\.webp$/i.test(name)));

  const topFiles = [...inventory.files]
    .sort((left, right) => right.bytes - left.bytes)
    .slice(0, 50)
    .map((file) => ({ path: relativeLabel(file.path), bytes: file.bytes, size: formatBytes(file.bytes) }));
  const topFolders = [...inventory.folders]
    .sort((left, right) => right.bytes - left.bytes)
    .slice(0, 30)
    .map((folder) => ({ path: relativeLabel(folder.path) || ".", bytes: folder.bytes, files: folder.files, size: formatBytes(folder.bytes) }));

  const nextCache = getEntry(inventory, ".next");
  const temp = getEntry(inventory, ".tmp");
  const generatedMedia = getEntry(inventory, "generated/teoyubeworld-media");
  const publishedMedia = getEntry(inventory, "public/media");
  const conservativeRecoverable = nextCache.bytes + temp.bytes;
  const cleanupActions = [
    {
      path: "media-source/teoyubeworld/originals",
      category: "protected master media",
      currentBytes: protectedSource.bytes,
      proposedAction: "Move to an owner-selected external library on another drive; replace only with ignored local configuration.",
      estimatedProjectReductionBytes: protectedSource.bytes,
      estimatedDriveRecoveryBytes: 0,
      safety: "owner authorization required; immutable source",
      verification: "Confirm destination free space, copy without transformation, compare file count/size/SHA-256, then obtain separate deletion approval.",
      rollback: "Keep the source copy until every destination checksum and owner spot check passes."
    },
    {
      path: ".next",
      category: "build cache",
      currentBytes: nextCache.bytes,
      proposedAction: "Remove recreatable Next build/development cache.",
      estimatedProjectReductionBytes: nextCache.bytes,
      estimatedDriveRecoveryBytes: nextCache.bytes,
      safety: "safe after exact owner authorization",
      verification: "Confirm no active process uses the folder; rerun the relevant build when needed.",
      rollback: "Recreate with the project build command."
    },
    {
      path: ".tmp",
      category: "temporary project artifacts",
      currentBytes: temp.bytes,
      proposedAction: "Remove only reviewed stale handoff and temporary output.",
      estimatedProjectReductionBytes: temp.bytes,
      estimatedDriveRecoveryBytes: temp.bytes,
      safety: "review each child, then exact owner authorization",
      verification: "Confirm artifacts are generated copies and are not the only copy of owner work.",
      rollback: "Recreate from source and scripts where documented."
    },
    {
      path: "generated/teoyubeworld-media",
      category: "generated media and owner artifacts",
      currentBytes: generatedMedia.bytes,
      proposedAction: "Preserve manifests, approval artifacts, checksums, review metadata, derivative plans, and publication receipts; consider only specifically inventoried obsolete previews/contact sheets later.",
      estimatedProjectReductionBytes: 0,
      estimatedDriveRecoveryBytes: 0,
      safety: "preserve by default",
      verification: "Owner-by-owner artifact review; never bulk remove this folder.",
      rollback: "Not applicable until an exact file list is separately approved."
    },
    {
      path: "public/media/teoyubeworld/pilot-v1",
      category: "published pilot",
      currentBytes: publishedMedia.bytes,
      proposedAction: "Preserve the approved runtime manifest and 48 derivatives (49 publication files total).",
      estimatedProjectReductionBytes: 0,
      estimatedDriveRecoveryBytes: 0,
      safety: "must remain",
      verification: "Validate 49-file publication tree and immutable fingerprint.",
      rollback: "Restore only from the approved publication artifact set."
    },
    {
      path: "../.git",
      category: "Git history",
      currentBytes: majorPaths.find((entry) => entry.path === "../.git").bytes,
      proposedAction: "Preserve. No clean, reset, gc, filter-repo, or history rewrite is authorized.",
      estimatedProjectReductionBytes: 0,
      estimatedDriveRecoveryBytes: 0,
      safety: "must remain",
      verification: "No action.",
      rollback: "Not applicable."
    }
  ];

  const plan = {
    artifactType: "teoyube_workspace_cleanup_dry_run",
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    activeRoot: root,
    executionAuthorized: false,
    authorizationAssumed: false,
    requiredAuthorizationPhrase: authorizationPhrase,
    destructiveCommandsExecuted: [],
    filesDeleted: 0,
    filesMoved: 0,
    sourceMediaModified: false,
    totals: { projectBytes: inventory.folders.find((entry) => entry.path === root)?.bytes || 0, projectFiles: inventory.files.length },
    majorPaths,
    protectedSource,
    categories: { archives, logs, contactSheets, posters, thumbnails, derivatives },
    topFiles,
    topFolders,
    cleanupActions,
    estimates: {
      conservativeDriveRecoveryBytes: conservativeRecoverable,
      projectReductionWithExternalMediaMoveBytes: conservativeRecoverable + protectedSource.bytes,
      note: "Moving media frees project space but frees disk space only when the destination is on another drive and the source is later deleted after separate verification and authorization."
    },
    warnings: [...inventory.warnings, ...gitInventory.warnings]
  };

  const majorRows = majorPaths.map((entry) => [entry.path, formatBytes(entry.bytes), String(entry.files), entry.exists ? "Present" : "Absent"]);
  const actionRows = cleanupActions.map((action) => [
    action.path,
    action.category,
    formatBytes(action.currentBytes),
    action.proposedAction.replace(/\|/g, "/"),
    action.safety
  ]);
  const storageMarkdown = `# Emergency Storage Audit\n\nGenerated: ${plan.generatedAt}\n\nThis is a read-only inventory. No files were deleted or moved.\n\n## Summary\n\n- Active project root: \`${root}\`\n- Project size: **${formatBytes(plan.totals.projectBytes)}** across ${plan.totals.projectFiles.toLocaleString()} files\n- Protected original media: **${formatBytes(protectedSource.bytes)}**\n- Generated TeoyubeWorld media: **${formatBytes(generatedMedia.bytes)}**\n- Published media: **${formatBytes(publishedMedia.bytes)}**\n- Git history: **${formatBytes(majorPaths.find((entry) => entry.path === "../.git").bytes)}**\n- Next cache: **${formatBytes(nextCache.bytes)}**\n- Dependency folder: **${formatBytes(getEntry(inventory, "node_modules").bytes)}**\n- Project ZIP/archive total: **${formatBytes(archives.bytes)}**\n- Conservative recoverable disk space after authorization: **${formatBytes(conservativeRecoverable)}**\n- Potential project reduction after a verified external media move: **${formatBytes(conservativeRecoverable + protectedSource.bytes)}**\n\n## Major Paths\n\n${markdownTable(["Path", "Size", "Files", "Status"], majorRows)}\n\n## Top 50 Files\n\n${markdownTable(["#", "Path", "Size"], topFiles.map((file, index) => [String(index + 1), `\`${file.path}\``, file.size]))}\n\n## Top 30 Folders\n\n${markdownTable(["#", "Path", "Size", "Files"], topFolders.map((folder, index) => [String(index + 1), `\`${folder.path}\``, folder.size, String(folder.files)]))}\n\n## Generated Categories\n\n${markdownTable(["Category", "Size", "Files"], Object.entries(plan.categories).map(([name, value]) => [name, formatBytes(value.bytes), String(value.files)]))}\n\n## Classification\n\n- Must remain: source code, project documents, secrets/config, Git history, approved publication files, approval artifacts, runtime manifests, owner review metadata, and source checksums.\n- Move outside the project after authorization: the protected master media library, preferably to another drive.\n- Safe to consider removing after authorization: \`.next\` and individually reviewed stale \`.tmp\` output.\n- Ambiguous and therefore preserved: generated owner artifacts, contact sheets, logs, and any handoff bundle not proven reproducible.\n\n## Recovery Estimate\n\n${plan.estimates.note}\n`;
  const cleanupMarkdown = `# Emergency Workspace Cleanup Plan\n\nGenerated: ${plan.generatedAt}\n\n**Dry run only. Cleanup execution is not authorized.**\n\n${markdownTable(["Path", "Category", "Current size", "Proposed action", "Safety"], actionRows)}\n\n## Required Verification\n\n${cleanupActions.map((action) => `- **${action.path}:** ${action.verification} Rollback: ${action.rollback}`).join("\n")}\n\n## Authorization Gate\n\nNo deletion or move may occur until the owner replies with exactly:\n\n\`${authorizationPhrase}\`\n`;

  fs.mkdirSync(outputRoot, { recursive: true });
  fs.mkdirSync(path.dirname(storageAuditDoc), { recursive: true });
  fs.writeFileSync(outputJson, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  fs.writeFileSync(storageAuditDoc, storageMarkdown, "utf8");
  fs.writeFileSync(cleanupPlanDoc, cleanupMarkdown, "utf8");
  console.log(JSON.stringify({ valid: true, dryRun: true, output: relativeLabel(outputJson), projectSize: formatBytes(plan.totals.projectBytes), protectedMedia: formatBytes(protectedSource.bytes), conservativeRecoverable: formatBytes(conservativeRecoverable), filesDeleted: 0, filesMoved: 0 }, null, 2));
}

if (require.main === module) main();
module.exports = { root, inspectTree, metadataDigest, formatBytes, authorizationPhrase };
