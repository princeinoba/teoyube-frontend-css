"use strict";

/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const sourcePath = path.join(workspaceRoot, "tests/visual/parity/owner-approved-next-support-source.json");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const approvalDate = String(source.approvalDate || "");

if (!/^\d{4}-\d{2}-\d{2}$/.test(approvalDate)) {
  throw new Error("The owner-approved Next support source must declare an ISO approvalDate.");
}

const preloadPath = path.join(__dirname, "fixedTimePreload.cjs").replace(/\\/g, "/");
const fixedTime = `${approvalDate}T12:00:00.000Z`;
const existingNodeOptions = process.env.NODE_OPTIONS?.trim();
const nodeOptions = [existingNodeOptions, `--require=${preloadPath}`].filter(Boolean).join(" ");
const npmCli = [
  process.env.npm_execpath,
  path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")
].find((candidate) => candidate && fs.existsSync(candidate));

if (!npmCli) {
  throw new Error("The repository-pinned npm CLI could not be resolved for the disposable support build.");
}

console.log(`Building the disposable Next support candidate at owner approval date ${fixedTime}.`);

const child = spawn(process.execPath, [npmCli, "run", "app:build"], {
  cwd: workspaceRoot,
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
    TEOYUBE_TEST_FIXED_TIME: fixedTime
  },
  stdio: "inherit"
});

child.once("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.once("exit", (code, signal) => {
  if (signal) {
    console.error(`Visual candidate build exited from signal ${signal}.`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
