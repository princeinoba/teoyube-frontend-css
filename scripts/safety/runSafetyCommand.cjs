/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const command = process.argv[2] || "verify";
const allowed = new Set(["verify", "evaluate", "orchestration", "live-ai"]);

if (!allowed.has(command)) {
  console.error(`Unknown safety command: ${command}`);
  process.exit(2);
}

const buildRoot = path.resolve(root, ".tmp", "safety-build");
const disposableRoot = `${path.resolve(root, ".tmp")}${path.sep}`;
if (!buildRoot.startsWith(disposableRoot)) {
  throw new Error("Refusing to clean a safety build directory outside the workspace .tmp directory.");
}
fs.rmSync(buildRoot, { recursive: true, force: true });
fs.mkdirSync(buildRoot, { recursive: true });

const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
const compilation = spawnSync(process.execPath, [tsc, "-p", "tsconfig.safety.json"], {
  cwd: root,
  env: process.env,
  encoding: "utf8",
  stdio: "inherit"
});
if (compilation.status !== 0) process.exit(compilation.status || 1);

const cli = path.join(buildRoot, "scripts", "safety", "safety-evaluation-cli.js");
const evaluation = spawnSync(process.execPath, [cli, command], {
  cwd: root,
  env: process.env,
  encoding: "utf8",
  stdio: "inherit"
});
process.exit(evaluation.status || 0);
