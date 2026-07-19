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
if (!new Set(["static", "next", "status", "shell", "today", "search", "canon-promise", "prayer-calling-journey", "journal-testimony-book", "remaining-retained", "gate-audit", "support-capture", "support-baseline"]).has(mode)) {
  console.error("Usage: node scripts/recovery/runVisualParitySuite.cjs <static|next|status|shell|today|search|canon-promise|prayer-calling-journey|journal-testimony-book|remaining-retained|gate-audit|support-capture|support-baseline>");
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

async function urlIsReady(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
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

function startStaticServer(port = "4173") {
  return spawn(process.execPath, [path.join(workspaceRoot, "server.js")], {
    cwd: workspaceRoot,
    env: { ...process.env, PORT: port },
    stdio: "inherit"
  });
}

function startNextServer(port = "3100") {
  return spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", port], {
    cwd: workspaceRoot,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "inherit"
  });
}

async function main() {
  const servers = [];
  const staticPort = mode === "gate-audit" ? "4183" : "4173";
  const nextPort = mode === "gate-audit" ? "3183" : "3100";
  const staticOrigin = `http://127.0.0.1:${staticPort}`;
  const nextOrigin = `http://127.0.0.1:${nextPort}`;
  try {
    if (!new Set(["status", "support-capture", "support-baseline"]).has(mode)) {
      const staticUrl = `${staticOrigin}/index.html`;
      if (!(await urlIsReady(staticUrl))) {
        const staticServer = startStaticServer(staticPort);
        servers.push(staticServer);
        await waitForUrl(staticServer, staticUrl);
      }
    }
    if (mode === "next" || mode === "shell" || mode === "today" || mode === "search" || mode === "canon-promise" || mode === "prayer-calling-journey" || mode === "journal-testimony-book" || mode === "remaining-retained" || mode === "gate-audit" || mode === "support-capture" || mode === "support-baseline") {
      const nextServer = startNextServer(nextPort);
      servers.push(nextServer);
      await waitForUrl(nextServer, `${nextOrigin}/api/health`);
    }

    const project = mode === "static"
      ? "static-reproducibility"
      : mode === "shell"
        ? "shell-parity"
        : mode === "today"
          ? "today-parity"
        : mode === "search"
          ? "search-parity"
        : mode === "canon-promise"
          ? "canon-promise-parity"
        : mode === "prayer-calling-journey"
          ? "prayer-calling-journey-parity"
        : mode === "journal-testimony-book"
          ? "journal-testimony-book-parity"
        : mode === "remaining-retained"
          ? "remaining-retained-parity"
        : mode === "gate-audit"
          ? "full-gate-audit"
        : mode === "support-capture"
          ? "support-route-baseline-capture"
        : mode === "support-baseline"
          ? "support-route-baseline-parity"
        : "next-candidate-contract";
    const tests = spawn(
      process.execPath,
      [playwrightCli, "test", "--config=playwright.visual.config.ts", `--project=${project}`],
      {
        cwd: workspaceRoot,
        env: {
          ...process.env,
          TEOYUBE_STATIC_BASE_URL: staticOrigin,
          TEOYUBE_NEXT_BASE_URL: nextOrigin
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
