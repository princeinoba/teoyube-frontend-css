"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {
  absolute,
  currentIdentity,
  npmRun,
  readJson,
  run,
  writeJson
} = require("./release-utils.cjs");

const npm = "npm";
const mode = process.argv[2] || "core";
const commandSets = {
  core: [
    ["clean-install", npm, ["ci"], "lockfile"],
    ["dependency-audit", npm, ["run", "release:supply-chain:audit"], "supply_chain"],
    ["toolchain", npm, ["run", "release:toolchain:verify"], "toolchain"],
    ["format", npm, ["run", "release:format:verify"], "format"],
    ["lint", npm, ["run", "lint"], "lint"],
    ["lint-release", npm, ["run", "lint:release"], "lint"],
    ["typecheck", npm, ["run", "typecheck"], "typecheck"],
    ["unit", npm, ["run", "test:unit"], "unit"],
    ["integration", npm, ["run", "test:integration"], "integration"],
    ["critical-contracts", npm, ["run", "test:critical"], "security"],
    ["coverage", npm, ["run", "test:coverage"], "coverage"],
    ["build-reproducibility", npm, ["run", "release:build:reproducibility"], "build"],
    ["architecture", npm, ["run", "architecture:verify"], "architecture"],
    ["imports", npm, ["run", "check:imports"], "architecture"],
    ["recovery", npm, ["run", "recovery:verify"], "recovery"],
    ["memory-boundary", npm, ["run", "memory:security:verify"], "privacy"],
    ["memory-browser", npm, ["run", "test:memory:e2e"], "browser"],
    ["scripture", npm, ["run", "recovery:scripture:verify"], "scripture"],
    ["tig", npm, ["run", "recovery:tig:verify"], "tig"],
    ["safety", npm, ["run", "safety:gate:orchestration"], "safety"],
    ["teo-guide", npm, ["run", "teo-guide:gate"], "ai"],
    ["live-ai-offline", npm, ["run", "live-ai:gate:preview"], "ai"],
    ["retrieval-tests", npm, ["run", "test:retrieval"], "retrieval"],
    ["retrieval-manifest", npm, ["run", "retrieval:verify"], "retrieval"],
    ["browser", npm, ["run", "test:e2e"], "browser"],
    ["visual-static", npm, ["run", "visual:parity:verify"], "visual"],
    ["visual-performance", npm, ["run", "visual:parity:gate:resumable"], "performance"]
  ],
  evidence: [
    ["supply-chain", npm, ["run", "release:supply-chain:verify"], "supply_chain"],
    ["build-evidence", npm, ["run", "release:build:evidence"], "build"],
    ["security", npm, ["run", "release:security:gate"], "security"],
    ["telemetry", npm, ["run", "release:telemetry:verify"], "privacy"],
    ["operations", npm, ["run", "release:operations:verify"], "operations"],
    ["coverage-evidence", npm, ["run", "release:coverage:verify"], "coverage"],
    ["performance", npm, ["run", "release:performance:verify"], "performance"],
    ["accessibility", npm, ["run", "release:accessibility:verify"], "accessibility"]
  ]
};
const selected = commandSets[mode];
if (!selected) {
  console.error(`Unknown release command set: ${mode}`);
  process.exit(2);
}

const existingPath = "artifacts/release-evidence/commands.json";
const identity = currentIdentity();
const existing = fs.existsSync(absolute(existingPath))
  ? readJson(existingPath)
  : {
      schemaVersion: 1,
      runnerVersion: "teoyube-release-command-runner-2026-07-24.1",
      sourceCommit: identity.commit,
      branch: identity.branch,
      environment: {
        node: identity.node,
        npm: identity.npm,
        os: identity.os
      },
      commands: []
    };
if (existing.sourceCommit !== identity.commit) {
  throw new Error("Existing command evidence belongs to a different source commit.");
}
const byId = new Map(existing.commands.map((item) => [item.id, item]));
const logRoot = absolute(".tmp/release-evidence/logs");
fs.mkdirSync(logRoot, { recursive: true });

for (const [id, executable, args, domain] of selected) {
  const startedAt = new Date().toISOString();
  console.log(`[release:${mode}] ${id}: ${executable} ${args.join(" ")}`);
  const executionOptions = {
    allowFailure: true,
    maxBuffer: 512 * 1024 * 1024
  };
  const outcome = executable === npm
    ? npmRun(args, executionOptions)
    : run(executable, args, executionOptions);
  const completedAt = new Date().toISOString();
  const combined = `${outcome.stdout || ""}\n${outcome.stderr || ""}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");
  const lines = combined.trim().split(/\r?\n/).filter(Boolean);
  const logPath = path.join(logRoot, `${id}.log`);
  const passed = outcome.status === 0;
  if (passed) {
    if (fs.existsSync(logPath)) fs.rmSync(logPath, { force: true });
  } else {
    fs.writeFileSync(logPath, combined, "utf8");
  }
  byId.set(id, {
    id,
    domain,
    command: `${executable} ${args.join(" ")}`,
    startedAt,
    completedAt,
    exitCode: outcome.status,
    outputSha256: hash,
    outputBytes: Buffer.byteLength(combined),
    outputTail: lines.slice(-12),
    fullLogRetained: !passed,
    fullLogPath: passed ? null : path.relative(absolute("."), logPath).replace(/\\/g, "/"),
    result: passed ? "PASS" : "BLOCKED"
  });
  existing.commands = [...byId.values()].sort((left, right) => left.id.localeCompare(right.id));
  existing.updatedAt = completedAt;
  existing.result = existing.commands.every((item) => item.result === "PASS") ? "PASS" : "BLOCKED";
  writeJson(existingPath, existing);
  if (!passed) {
    console.error(`[release:${mode}] ${id}: BLOCKED; retained ${logPath}`);
    process.exit(outcome.status || 1);
  }
  console.log(`[release:${mode}] ${id}: PASS (${hash.slice(0, 12)})`);
}

existing.completedAt = new Date().toISOString();
existing.result = existing.commands.every((item) => item.result === "PASS") ? "PASS" : "BLOCKED";
writeJson(existingPath, existing);
console.log(`RELEASE COMMAND SET ${mode.toUpperCase()}: ${existing.result} (${selected.length} executed; ${existing.commands.length} recorded)`);
