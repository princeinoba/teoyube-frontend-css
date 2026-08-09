/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const buildRoot = path.resolve(root, ".tmp", "vector-quality-remediation-build");
const disposableRoot = `${path.resolve(root, ".tmp")}${path.sep}`;
if (!buildRoot.startsWith(disposableRoot)) {
  throw new Error("Refusing to clean a remediation build directory outside workspace .tmp.");
}
fs.rmSync(buildRoot, { recursive: true, force: true });
fs.mkdirSync(buildRoot, { recursive: true });
const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
const compilation = spawnSync(process.execPath, [tsc, "-p", "tsconfig.retrieval.json", "--outDir", buildRoot], {
  cwd: root,
  env: process.env,
  encoding: "utf8",
  stdio: "inherit"
});
if (compilation.status !== 0) process.exit(compilation.status || 1);
const cli = path.join(buildRoot, "scripts", "retrieval", "vector-quality-remediation-cli.js");
const result = spawnSync(process.execPath, [cli], {
  cwd: root,
  env: process.env,
  encoding: "utf8",
  stdio: "inherit"
});
process.exit(result.status || 0);
