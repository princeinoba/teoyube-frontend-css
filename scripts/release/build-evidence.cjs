"use strict";

const fs = require("node:fs");
const crypto = require("node:crypto");
const {
  absolute,
  currentIdentity,
  hashFileSet,
  npmRun,
  readJson,
  sha256File,
  walk,
  writeJson
} = require("./release-utils.cjs");

function normalizedBuildHash(files, buildId) {
  const hash = crypto.createHash("sha256");
  let bytes = 0;
  for (const file of [...files].sort()) {
    const normalizedPath = buildId
      ? file.replaceAll(buildId, "<NEXT_BUILD_ID>")
      : file;
    const source = fs.readFileSync(absolute(file), "utf8");
    const normalizedSource = buildId
      ? source.replaceAll(buildId, "<NEXT_BUILD_ID>")
      : source;
    const normalized = Buffer.from(normalizedSource, "utf8");
    bytes += normalized.length;
    hash.update(normalizedPath);
    hash.update("\0");
    hash.update(crypto.createHash("sha256").update(normalized).digest("hex"));
    hash.update("\n");
  }
  return Object.freeze({
    sha256: hash.digest("hex"),
    files: files.length,
    normalizedBytes: bytes,
    normalization: buildId
      ? "exact Next BUILD_ID value and path segment"
      : "none"
  });
}

function semanticBuildManifest() {
  const routeManifest = readJson(".next/app-path-routes-manifest.json");
  const clientFiles = walk(".next/static").filter((file) => /\.(js|css)$/.test(file));
  const serverFiles = walk(".next/server").filter((file) => /\.(js|json|html|rsc|body)$/.test(file));
  const buildId = fs.readFileSync(absolute(".next/BUILD_ID"), "utf8").trim();
  const publicSourceMaps = [
    ...walk(".next/static").filter((file) => file.endsWith(".map")),
    ...walk("public").filter((file) => file.endsWith(".map"))
  ];
  return Object.freeze({
    routes: Object.entries(routeManifest)
      .map(([route, file]) => ({ route, file }))
      .sort((left, right) => left.route.localeCompare(right.route)),
    client: Object.freeze({
      ...hashFileSet(clientFiles),
      semantic: normalizedBuildHash(clientFiles, buildId)
    }),
    server: Object.freeze({
      ...hashFileSet(serverFiles),
      semantic: normalizedBuildHash(serverFiles, buildId)
    }),
    publicSourceMaps,
    packageLockSha256: sha256File("package-lock.json")
  });
}

function generate() {
  const semantic = semanticBuildManifest();
  const routeManifest = readJson(".next/app-path-routes-manifest.json");
  const clientFiles = walk(".next/static").filter((file) => /\.(js|css)$/.test(file));
  const chunks = clientFiles.map((file) => ({
    file,
    bytes: fs.statSync(absolute(file)).size,
    sha256: sha256File(file)
  })).sort((left, right) => right.bytes - left.bytes || left.file.localeCompare(right.file));
  writeJson("artifacts/release-evidence/build/artifact-manifest.json", {
    schemaVersion: 1,
    manifestVersion: "teoyube-build-artifacts-2026-07-24.1",
    generatedAt: new Date().toISOString(),
    identity: currentIdentity(),
    packageLockSha256: semantic.packageLockSha256,
    build: {
      client: semantic.client,
      server: semantic.server,
      combinedSha256: crypto
        .createHash("sha256")
        .update(semantic.client.sha256)
        .update(semantic.server.sha256)
        .digest("hex")
    },
    sourceMaps: {
      policy: "server_only_not_publicly_served",
      publicFiles: semantic.publicSourceMaps
    },
    signing: {
      signed: false,
      dependency: "owner production signing identity is not configured"
    }
  });
  writeJson("artifacts/release-evidence/build/route-manifest.json", {
    schemaVersion: 1,
    routeCount: Object.keys(routeManifest).length,
    routes: Object.entries(routeManifest)
      .map(([route, file]) => ({ route, file }))
      .sort((left, right) => left.route.localeCompare(right.route))
  });
  writeJson("artifacts/release-evidence/build/client-bundle-manifest.json", {
    schemaVersion: 1,
    files: chunks,
    summary: {
      files: chunks.length,
      bytes: chunks.reduce((sum, item) => sum + item.bytes, 0),
      maximumBytes: chunks[0]?.bytes || 0
    }
  });
  console.log(`BUILD EVIDENCE: PASSED (${Object.keys(routeManifest).length} routes; ${chunks.length} client files)`);
}

function reproducibility() {
  const runs = [];
  for (let index = 0; index < 2; index += 1) {
    const startedAt = new Date().toISOString();
    const result = npmRun(["run", "app:build"], {
      allowFailure: true,
      maxBuffer: 256 * 1024 * 1024
    });
    if (result.status !== 0) {
      writeJson("artifacts/release-evidence/build/reproducibility.json", {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        result: "BLOCKED",
        failedRun: index + 1,
        exitCode: result.status
      });
      process.exitCode = 1;
      return;
    }
    const manifest = semanticBuildManifest();
    runs.push({
      run: index + 1,
      startedAt,
      completedAt: new Date().toISOString(),
      manifest
    });
  }
  const first = runs[0].manifest;
  const second = runs[1].manifest;
  const semanticMatch =
    JSON.stringify(first.routes) === JSON.stringify(second.routes) &&
    first.client.semantic.sha256 === second.client.semantic.sha256 &&
    first.server.semantic.sha256 === second.server.semantic.sha256 &&
    first.client.files === second.client.files &&
    first.client.bytes === second.client.bytes &&
    first.server.files === second.server.files &&
    first.server.bytes === second.server.bytes &&
    first.packageLockSha256 === second.packageLockSha256;
  writeJson("artifacts/release-evidence/build/reproducibility.json", {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    identity: currentIdentity(),
    runs,
    normalizedNondeterminism: [
      "exact .next/BUILD_ID value",
      ".next/static/<BUILD_ID>/ path segment and exact references to that value",
      "excluded .next/trace",
      "excluded .next/diagnostics",
      "excluded .next/cache",
      "filesystem timestamps"
    ],
    semanticMatch,
    byteIdenticalClaimed: false,
    result: semanticMatch ? "PASS" : "BLOCKED"
  });
  generate();
  console.log(`BUILD REPRODUCIBILITY: ${semanticMatch ? "PASS" : "BLOCKED"}`);
  if (!semanticMatch) process.exitCode = 1;
}

if (process.argv[2] === "reproducibility") reproducibility();
else generate();
