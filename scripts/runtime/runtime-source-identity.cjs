"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const DEFAULT_MANIFEST_PATH = "config/runtime/runtime-source-manifest.json";
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".sql",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
  ".yaml",
  ".yml"
]);

function compareOrdinal(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizeRelativePath(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Runtime source paths must be non-empty strings.");
  }
  const normalized = value.replace(/\\/g, "/").replace(/^\.\//, "");
  if (
    path.posix.isAbsolute(normalized) ||
    normalized === "." ||
    normalized.split("/").some((segment) => segment === ".." || segment === "")
  ) {
    throw new Error(`Runtime source path is unsafe: ${value}`);
  }
  return normalized;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object" && !Buffer.isBuffer(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareOrdinal)
        .map((key) => [key, stableValue(value[key])])
    );
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function validateManifest(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Runtime source manifest is missing or malformed.");
  }
  if (input.schemaVersion !== 1) throw new Error("Runtime source manifest schema differs.");
  if (typeof input.identityVersion !== "string" || !input.identityVersion.startsWith("teoyube-")) {
    throw new Error("Runtime source identity version is invalid.");
  }
  if (input.algorithm !== "sha256") throw new Error("Runtime source digest algorithm must be sha256.");
  if (!/^[a-z0-9-]{1,32}$/.test(input.buildIdPrefix || "")) {
    throw new Error("Runtime build ID prefix is invalid.");
  }
  if (
    !Number.isInteger(input.digestPrefixLength) ||
    input.digestPrefixLength < 12 ||
    input.digestPrefixLength > 64
  ) {
    throw new Error("Runtime build ID digest prefix length is invalid.");
  }
  if (!Array.isArray(input.exactPaths) || !input.exactPaths.length) {
    throw new Error("Runtime source exact-path list is missing.");
  }
  if (!Array.isArray(input.prefixes) || !input.prefixes.length) {
    throw new Error("Runtime source prefix list is missing.");
  }
  const exactPaths = input.exactPaths.map(normalizeRelativePath).sort(compareOrdinal);
  const prefixes = input.prefixes
    .map((entry) => {
      const normalized = normalizeRelativePath(entry.replace(/\/$/, ""));
      return `${normalized}/`;
    })
    .sort(compareOrdinal);
  const all = [...exactPaths, ...prefixes];
  const caseFolded = all.map((entry) => entry.toLowerCase());
  if (new Set(caseFolded).size !== caseFolded.length) {
    throw new Error("Runtime source manifest contains a duplicate path or prefix.");
  }
  return Object.freeze({
    schemaVersion: 1,
    identityVersion: input.identityVersion,
    algorithm: "sha256",
    buildIdPrefix: input.buildIdPrefix,
    digestPrefixLength: input.digestPrefixLength,
    exactPaths: Object.freeze(exactPaths),
    prefixes: Object.freeze(prefixes),
    excludedClasses: Object.freeze([...(input.excludedClasses || [])].sort(compareOrdinal))
  });
}

function resolveWithinRoot(root, relativePath) {
  const absoluteRoot = path.resolve(root);
  const resolved = path.resolve(absoluteRoot, ...normalizeRelativePath(relativePath).split("/"));
  if (resolved !== absoluteRoot && !resolved.startsWith(`${absoluteRoot}${path.sep}`)) {
    throw new Error(`Runtime source path escapes the workspace: ${relativePath}`);
  }
  return resolved;
}

function loadRuntimeSourceManifest(root, manifestPath = DEFAULT_MANIFEST_PATH) {
  const absolute = resolveWithinRoot(root, manifestPath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Runtime source manifest is missing: ${manifestPath}`);
  }
  return validateManifest(JSON.parse(fs.readFileSync(absolute, "utf8")));
}

function matchesRuntimeSourcePath(relativePath, manifest) {
  const normalized = normalizeRelativePath(relativePath);
  return (
    manifest.exactPaths.includes(normalized) ||
    manifest.prefixes.some((prefix) => normalized.startsWith(prefix))
  );
}

function assertKnownRuntimePath(relativePath, manifest) {
  if (!matchesRuntimeSourcePath(relativePath, manifest)) {
    throw new Error(`Unknown classified runtime path: ${relativePath}`);
  }
  return normalizeRelativePath(relativePath);
}

function normalizeFileContent(relativePath, input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(String(input), "utf8");
  if (!TEXT_EXTENSIONS.has(path.posix.extname(relativePath).toLowerCase()) || buffer.includes(0)) {
    return buffer;
  }
  return Buffer.from(buffer.toString("utf8").replace(/\r\n?/g, "\n"), "utf8");
}

function createSourceRecord(relativePath, content) {
  const normalizedPath = normalizeRelativePath(relativePath);
  const normalizedContent = normalizeFileContent(normalizedPath, content);
  return Object.freeze({
    path: normalizedPath,
    bytes: normalizedContent.length,
    sha256: crypto.createHash("sha256").update(normalizedContent).digest("hex")
  });
}

function digestRuntimeSourceRecords(records, identityVersion) {
  if (!Array.isArray(records) || !records.length) {
    throw new Error("Runtime source records are missing.");
  }
  const normalized = records
    .map((record) => {
      const normalizedPath = normalizeRelativePath(record.path);
      if (!Number.isInteger(record.bytes) || record.bytes < 0 || !DIGEST_PATTERN.test(record.sha256)) {
        throw new Error(`Runtime source record is malformed: ${normalizedPath}`);
      }
      return { path: normalizedPath, bytes: record.bytes, sha256: record.sha256 };
    })
    .sort((left, right) => compareOrdinal(left.path, right.path));
  const caseFolded = normalized.map((record) => record.path.toLowerCase());
  if (new Set(caseFolded).size !== caseFolded.length) {
    throw new Error("Runtime source records contain a duplicate path.");
  }
  return crypto
    .createHash("sha256")
    .update(stableStringify({ schemaVersion: 1, identityVersion, records: normalized }))
    .digest("hex");
}

function buildIdFromDigest(digest, manifest) {
  if (!DIGEST_PATTERN.test(digest || "")) throw new Error("Runtime source digest is malformed.");
  const buildId = `${manifest.buildIdPrefix}-${digest.slice(0, manifest.digestPrefixLength)}`;
  if (!/^[a-z0-9_-]{1,128}$/i.test(buildId)) throw new Error("Computed Next build ID is invalid.");
  return buildId;
}

function identityFromRecords(manifest, records) {
  const digest = digestRuntimeSourceRecords(records, manifest.identityVersion);
  return Object.freeze({
    generatorVersion: manifest.identityVersion,
    algorithm: manifest.algorithm,
    manifestPath: DEFAULT_MANIFEST_PATH,
    digest,
    buildId: buildIdFromDigest(digest, manifest),
    sourceFileCount: records.length,
    sourceBytes: records.reduce((total, record) => total + record.bytes, 0),
    records: Object.freeze([...records].sort((left, right) => compareOrdinal(left.path, right.path)))
  });
}

function computeRuntimeSourceIdentityFromFiles({ manifest: inputManifest, files }) {
  const manifest = validateManifest(inputManifest);
  const entries = files instanceof Map ? [...files.entries()] : Object.entries(files || {});
  const normalizedFiles = new Map();
  const foldedPaths = new Set();
  for (const [filePath, content] of entries) {
    const normalized = normalizeRelativePath(filePath);
    const folded = normalized.toLowerCase();
    if (foldedPaths.has(folded)) {
      throw new Error(`Runtime source fixture contains a duplicate path: ${normalized}`);
    }
    foldedPaths.add(folded);
    normalizedFiles.set(normalized, content);
  }
  for (const exactPath of manifest.exactPaths) {
    if (!normalizedFiles.has(exactPath)) {
      throw new Error(`Required runtime source is missing: ${exactPath}`);
    }
  }
  for (const prefix of manifest.prefixes) {
    if (![...normalizedFiles.keys()].some((filePath) => filePath.startsWith(prefix))) {
      throw new Error(`Required runtime source prefix is empty: ${prefix}`);
    }
  }
  const records = [...normalizedFiles.entries()]
    .filter(([filePath]) => matchesRuntimeSourcePath(filePath, manifest))
    .map(([filePath, content]) => createSourceRecord(filePath, content));
  return identityFromRecords(manifest, records);
}

function walkFiles(root, prefix) {
  const start = resolveWithinRoot(root, prefix.replace(/\/$/, ""));
  if (!fs.existsSync(start) || !fs.statSync(start).isDirectory()) {
    throw new Error(`Required runtime source prefix is missing: ${prefix}`);
  }
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Runtime source symlinks are not allowed: ${path.relative(root, absolute)}`);
      }
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) files.push(absolute);
    }
  };
  visit(start);
  return files;
}

function computeRuntimeSourceIdentity({ root = process.cwd(), manifestPath = DEFAULT_MANIFEST_PATH } = {}) {
  const absoluteRoot = path.resolve(root);
  const manifest = loadRuntimeSourceManifest(absoluteRoot, manifestPath);
  const absoluteFiles = new Set();
  for (const exactPath of manifest.exactPaths) {
    const absolute = resolveWithinRoot(absoluteRoot, exactPath);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
      throw new Error(`Required runtime source is missing: ${exactPath}`);
    }
    absoluteFiles.add(absolute);
  }
  for (const prefix of manifest.prefixes) {
    for (const absolute of walkFiles(absoluteRoot, prefix)) absoluteFiles.add(absolute);
  }
  const records = [...absoluteFiles]
    .map((absolute) => {
      const relative = normalizeRelativePath(path.relative(absoluteRoot, absolute));
      return createSourceRecord(relative, fs.readFileSync(absolute));
    })
    .sort((left, right) => compareOrdinal(left.path, right.path));
  return identityFromRecords(manifest, records);
}

function resolveBuildId(identity, environment = process.env) {
  if (environment.TEOYUBE_NEXT_BUILD_ID_OVERRIDE !== undefined) {
    throw new Error("Arbitrary Next build ID overrides are not supported.");
  }
  return identity.buildId;
}

function validateRuntimeSourceDigest(digest) {
  if (!DIGEST_PATTERN.test(digest || "")) throw new Error("Recorded runtime source digest is malformed.");
  return digest;
}

function assertRecordedIdentity(recorded, computed) {
  validateRuntimeSourceDigest(recorded.runtimeSourceDigest);
  if (recorded.buildIdGeneratorVersion !== computed.generatorVersion) {
    throw new Error("Runtime build ID generator version is stale.");
  }
  if (recorded.runtimeSourceDigest !== computed.digest) {
    throw new Error("Recorded runtime source digest is stale.");
  }
  if (recorded.nextBuildId !== computed.buildId) {
    throw new Error("Recorded deterministic Next build ID differs.");
  }
  return true;
}

function dirtyRuntimePaths(root, manifest) {
  const run = (args) =>
    execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
      .split(/\r?\n/)
      .filter(Boolean)
      .map(normalizeRelativePath);
  const paths = new Set([
    ...run(["diff", "--name-only"]),
    ...run(["diff", "--cached", "--name-only"]),
    ...run(["ls-files", "--others", "--exclude-standard"])
  ]);
  return [...paths].filter((filePath) => matchesRuntimeSourcePath(filePath, manifest)).sort(compareOrdinal);
}

function evaluateRuntimeIdentityContract({
  recorded,
  computed,
  buildId,
  dirtyPaths = [],
  staticRollbackRetained,
  featureFlagDefaults
}) {
  const failures = [];
  try {
    assertRecordedIdentity(recorded, computed);
  } catch (error) {
    failures.push(error.message);
  }
  if (buildId !== computed.buildId) failures.push("Current Next build is stale or has an arbitrary ID.");
  if (dirtyPaths.length) failures.push(`Runtime inputs are dirty: ${dirtyPaths.join(", ")}`);
  if (!staticRollbackRetained) failures.push("Static rollback is not retained.");
  if (Object.values(featureFlagDefaults || {}).some(Boolean)) {
    failures.push("A checked-in live/vector feature default is enabled.");
  }
  return Object.freeze({ result: failures.length ? "BLOCKED" : "PASS", failures });
}

module.exports = {
  DEFAULT_MANIFEST_PATH,
  assertKnownRuntimePath,
  assertRecordedIdentity,
  buildIdFromDigest,
  computeRuntimeSourceIdentity,
  computeRuntimeSourceIdentityFromFiles,
  createSourceRecord,
  digestRuntimeSourceRecords,
  dirtyRuntimePaths,
  evaluateRuntimeIdentityContract,
  loadRuntimeSourceManifest,
  matchesRuntimeSourcePath,
  normalizeRelativePath,
  resolveBuildId,
  stableStringify,
  validateManifest,
  validateRuntimeSourceDigest
};
