"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const workspaceRoot = path.resolve(__dirname, "../..");
const checkpointSchemaVersion = "teoyube-performance-gate-checkpoint-1";
const controllerSchemaVersion = "teoyube-performance-gate-controller-1";
const thresholdMs = 5_000;
const artifactBudgetBytes = 500 * 1024 * 1024;

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sha256File(filePath) {
  return sha256Buffer(fs.readFileSync(filePath));
}

function listFiles(inputPath) {
  const absolute = path.resolve(workspaceRoot, inputPath);
  if (!fs.existsSync(absolute)) throw new Error(`Identity input is missing: ${absolute}`);
  const stat = fs.lstatSync(absolute);
  if (stat.isFile()) return [absolute];
  if (stat.isSymbolicLink()) return [absolute];
  const files = [];
  const stack = [absolute];
  while (stack.length > 0) {
    const directory = stack.pop();
    const entries = fs.readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) stack.push(child);
      else files.push(child);
    }
  }
  return files.sort((left, right) => left.localeCompare(right));
}

function hashPaths(inputPaths) {
  const hash = crypto.createHash("sha256");
  let bytes = 0;
  let files = 0;
  for (const inputPath of inputPaths) {
    for (const filePath of listFiles(inputPath)) {
      const relativePath = path.relative(workspaceRoot, filePath).replaceAll("\\", "/");
      const stat = fs.lstatSync(filePath);
      hash.update(relativePath);
      hash.update("\0");
      if (stat.isSymbolicLink()) {
        hash.update(`symlink:${fs.readlinkSync(filePath)}`);
      } else {
        const content = fs.readFileSync(filePath);
        bytes += content.length;
        hash.update(content);
      }
      hash.update("\0");
      files += 1;
    }
  }
  return { sha256: hash.digest("hex"), files, bytes };
}

function commandOutput(executable, arguments_) {
  return execFileSync(executable, arguments_, {
    cwd: workspaceRoot,
    encoding: "utf8",
    windowsHide: true,
  }).trim();
}

function resolveNpmVersion() {
  if (process.env.TEOYUBE_NPM_VERSION) return process.env.TEOYUBE_NPM_VERSION;
  if (process.env.npm_execpath && fs.existsSync(process.env.npm_execpath)) {
    return commandOutput(process.execPath, [process.env.npm_execpath, "--version"]);
  }
  const userAgentMatch = process.env.npm_config_user_agent?.match(/(?:^|\s)npm\/([^\s]+)/);
  if (userAgentMatch) return userAgentMatch[1];
  return commandOutput(process.platform === "win32" ? "npm.cmd" : "npm", ["--version"]);
}

function computeGateIdentity() {
  const nextBuildInputs = [
    ".next/BUILD_ID",
    ".next/app-path-routes-manifest.json",
    ".next/build-manifest.json",
    ".next/server",
    ".next/static",
  ];
  const identity = {
    gitCommit: commandOutput("git", ["rev-parse", "HEAD"]),
    trackedWorktreeStatus: commandOutput("git", ["status", "--porcelain", "--untracked-files=no"]),
    nodeVersion: process.version,
    npmVersion: resolveNpmVersion(),
    auditVersion: hashPaths([
      "tests/visual/parity/full-gate-audit.spec.ts",
      "tests/visual/parity/capture.ts",
      "tests/visual/parity/config.ts",
      "playwright.visual.config.ts",
      "scripts/recovery/runVisualParitySuite.cjs",
      "scripts/recovery/runResumableVisualGate.cjs",
      "scripts/recovery/resumableVisualGateState.cjs",
    ]).sha256,
    baselineHashes: {
      visualBaselines: hashPaths(["tests/visual/baselines"]),
      visualContracts: hashPaths(["tests/visual/contracts"]),
    },
    buildHashes: {
      static: hashPaths(["server.js", "index.html", "app.js", "styles", "public"]),
      next: hashPaths(nextBuildInputs),
    },
    thresholdMs,
  };
  return identity;
}

function atomicWriteJson(filePath, value) {
  const absolute = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const temporary = `${absolute}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  const handle = fs.openSync(temporary, "r+");
  try {
    fs.fsyncSync(handle);
  } finally {
    fs.closeSync(handle);
  }
  fs.renameSync(temporary, absolute);
}

function stableIdentityValue(identity) {
  return JSON.stringify({
    gitCommit: identity.gitCommit,
    trackedWorktreeStatus: identity.trackedWorktreeStatus,
    nodeVersion: identity.nodeVersion,
    npmVersion: identity.npmVersion,
    auditVersion: identity.auditVersion,
    thresholdMs: identity.thresholdMs,
    baselineHashes: identity.baselineHashes,
    buildHashes: identity.buildHashes,
  });
}

function identitiesMatch(left, right) {
  return Boolean(left && right && stableIdentityValue(left) === stableIdentityValue(right));
}

function checkpointMatches(checkpoint, identity, runId, runOrdinal) {
  return Boolean(
    checkpoint
      && checkpoint.schemaVersion === checkpointSchemaVersion
      && checkpoint.runId === runId
      && checkpoint.runOrdinal === runOrdinal
      && checkpoint.thresholdMs === thresholdMs
      && identitiesMatch(checkpoint, identity),
  );
}

function readJsonIfPresent(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function reconcileCurrentRun(controller) {
  if (!controller?.currentRun) return null;
  const runIndex = controller.runs.findIndex((run) => run.runId === controller.currentRun.runId);
  if (runIndex === -1) {
    controller.runs.push(controller.currentRun);
  } else {
    controller.runs[runIndex] = controller.currentRun;
  }
  return controller.currentRun;
}

function directoryStats(directoryPath) {
  if (!fs.existsSync(directoryPath)) return { bytes: 0, files: 0 };
  let bytes = 0;
  let files = 0;
  for (const filePath of listFiles(directoryPath)) {
    const stat = fs.lstatSync(filePath);
    if (!stat.isSymbolicLink()) bytes += stat.size;
    files += 1;
  }
  return { bytes, files };
}

function processTelemetry() {
  const memory = process.memoryUsage();
  return {
    capturedAt: new Date().toISOString(),
    processId: process.pid,
    processRssBytes: memory.rss,
    processHeapUsedBytes: memory.heapUsed,
    systemFreeMemoryBytes: os.freemem(),
    systemTotalMemoryBytes: os.totalmem(),
    loadAverage: os.loadavg(),
  };
}

module.exports = {
  artifactBudgetBytes,
  atomicWriteJson,
  checkpointMatches,
  checkpointSchemaVersion,
  computeGateIdentity,
  controllerSchemaVersion,
  directoryStats,
  hashPaths,
  identitiesMatch,
  processTelemetry,
  readJsonIfPresent,
  reconcileCurrentRun,
  sha256File,
  stableIdentityValue,
  thresholdMs,
  workspaceRoot,
};
