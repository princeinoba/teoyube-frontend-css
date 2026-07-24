"use strict";

const fs = require("node:fs");
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

function semanticBuildManifest() {
  const routeManifest = readJson(".next/app-path-routes-manifest.json");
  const clientFiles = walk(".next/static").filter((file) => /\.(js|css)$/.test(file));
  const serverFiles = walk(".next/server").filter((file) => /\.(js|json|html|rsc|body)$/.test(file));
  const publicSourceMaps = [
    ...walk(".next/static").filter((file) => file.endsWith(".map")),
    ...walk("public").filter((file) => file.endsWith(".map"))
  ];
  return Object.freeze({
    routes: Object.entries(routeManifest)
      .map(([route, file]) => ({ route, file }))
      .sort((left, right) => left.route.localeCompare(right.route)),
    client: hashFileSet(clientFiles),
    server: hashFileSet(serverFiles),
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
      combinedSha256: require("node:crypto")
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
    first.client.sha256 === second.client.sha256 &&
    first.server.sha256 === second.server.sha256 &&
    first.packageLockSha256 === second.packageLockSha256;
  writeJson("artifacts/release-evidence/build/reproducibility.json", {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    identity: currentIdentity(),
    runs,
    normalizedNondeterminism: [
      ".next/BUILD_ID",
      ".next/trace",
      ".next/diagnostics",
      ".next/cache",
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
