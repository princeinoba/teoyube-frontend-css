/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const command = process.argv[2] || "inventory";
const allowed = new Set(["inventory", "estimate", "index-public", "verify", "rollback", "evaluate"]);
if (!allowed.has(command)) {
  console.error(`Unknown retrieval command: ${command}`);
  process.exit(2);
}

const buildRoot = path.resolve(root, ".tmp", "retrieval-build");
const disposableRoot = `${path.resolve(root, ".tmp")}${path.sep}`;
if (!buildRoot.startsWith(disposableRoot)) {
  throw new Error("Refusing to clean a retrieval build directory outside workspace .tmp.");
}
fs.rmSync(buildRoot, { recursive: true, force: true });
fs.mkdirSync(buildRoot, { recursive: true });

const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
const compilation = spawnSync(process.execPath, [tsc, "-p", "tsconfig.retrieval.json"], {
  cwd: root,
  env: process.env,
  encoding: "utf8",
  stdio: "inherit"
});
if (compilation.status !== 0) process.exit(compilation.status || 1);

const cli = path.join(
  buildRoot,
  "scripts",
  "retrieval",
  command === "evaluate" ? "retrieval-evaluation-cli.js" : "retrieval-cli.js"
);
const result = spawnSync(process.execPath, [cli, command], {
  cwd: root,
  env: process.env,
  encoding: "utf8",
  stdio: "inherit"
});
process.exit(result.status || 0);
