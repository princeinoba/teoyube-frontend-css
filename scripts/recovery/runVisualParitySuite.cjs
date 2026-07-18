"use strict";

const { spawn } = require("node:child_process");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const playwrightCli = require.resolve("@playwright/test/cli");
const nextCli = require.resolve("next/dist/bin/next");
const mode = process.argv[2] || "static";
const forbiddenUpdate = process.argv.some((argument) => argument.startsWith("--update-snapshots"));

if (forbiddenUpdate) {
  console.error("Refusing --update-snapshots: owner baselines are immutable in ordinary tooling and CI.");
  process.exit(2);
}
if (!new Set(["static", "next", "status"]).has(mode)) {
  console.error("Usage: node scripts/recovery/runVisualParitySuite.cjs <static|next|status>");
  process.exit(2);
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function waitForUrl(child, url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Server exited before ${url} was ready (exit ${child.exitCode}).`);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}.`);
}

async function stopServer(child) {
  if (!child || !child.pid || child.exitCode !== null) return;
  try {
    child.kill("SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
  await Promise.race([waitForExit(child), new Promise((resolve) => setTimeout(resolve, 2_000))]);
  if (child.exitCode === null) {
    child.kill("SIGKILL");
    child.unref();
  }
}

function startStaticServer() {
  return spawn(process.execPath, [path.join(workspaceRoot, "server.js")], {
    cwd: workspaceRoot,
    env: { ...process.env, PORT: "4173" },
    stdio: "inherit"
  });
}

function startNextServer() {
  return spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", "3100"], {
    cwd: workspaceRoot,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "inherit"
  });
}

async function main() {
  const servers = [];
  try {
    if (mode !== "status") {
      const staticServer = startStaticServer();
      servers.push(staticServer);
      await waitForUrl(staticServer, "http://127.0.0.1:4173/index.html");
    }
    if (mode === "next") {
      const nextServer = startNextServer();
      servers.push(nextServer);
      await waitForUrl(nextServer, "http://127.0.0.1:3100/api/health");
    }

    const project = mode === "static" ? "static-reproducibility" : "next-candidate-contract";
    const tests = spawn(
      process.execPath,
      [playwrightCli, "test", "--config=playwright.visual.config.ts", `--project=${project}`],
      {
        cwd: workspaceRoot,
        env: {
          ...process.env,
          TEOYUBE_STATIC_BASE_URL: "http://127.0.0.1:4173",
          TEOYUBE_NEXT_BASE_URL: "http://127.0.0.1:3100"
        },
        stdio: "inherit"
      }
    );
    const result = await waitForExit(tests);
    if (result.signal) throw new Error(`Playwright exited from signal ${result.signal}.`);
    process.exitCode = result.code ?? 1;
  } finally {
    await Promise.all(servers.map((server) => stopServer(server)));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
