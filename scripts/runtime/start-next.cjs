"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require("node:child_process");
const path = require("node:path");
const {
  assertPortAvailable,
  parseStartArguments,
  readBuild
} = require("./runtime-launcher-lib.cjs");

const root = path.resolve(__dirname, "../..");
const nextCli = require.resolve("next/dist/bin/next");

async function main() {
  const build = readBuild(root);
  if (!build.ready) {
    console.error(build.message);
    process.exitCode = 1;
    return;
  }
  const start = parseStartArguments(process.argv.slice(2));
  await assertPortAvailable(start.port, start.hostname);
  const child = spawn(
    process.execPath,
    [nextCli, "start", ...start.nextArguments],
    {
      cwd: root,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: "inherit"
    }
  );
  let stopping = false;
  const stop = (signal) => {
    if (stopping || child.exitCode !== null) return;
    stopping = true;
    child.kill(signal);
  };
  process.once("SIGINT", () => stop("SIGINT"));
  process.once("SIGTERM", () => stop("SIGTERM"));
  child.once("error", (error) => {
    console.error(`Teoyube Next runtime failed to start: ${error.message}`);
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    if (signal) {
      process.exitCode = signal === "SIGINT" || signal === "SIGTERM" ? 0 : 1;
      return;
    }
    process.exitCode = code ?? 1;
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
