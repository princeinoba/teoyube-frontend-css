"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require("node:child_process");
const net = require("node:net");
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
if (!new Set(["static", "next", "status", "shell", "today", "search", "canon-promise", "prayer-calling-journey", "journal-testimony-book", "remaining-retained", "gate-audit", "support-capture", "support-baseline", "next-support-capture", "next-support-baseline"]).has(mode)) {
  console.error("Usage: node scripts/recovery/runVisualParitySuite.cjs <static|next|status|shell|today|search|canon-promise|prayer-calling-journey|journal-testimony-book|remaining-retained|gate-audit|support-capture|support-baseline|next-support-capture|next-support-baseline>");
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

async function portIsListening(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: Number(port) });
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });
}

async function waitForClosedPort(port, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await portIsListening(port))) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Port ${port} remained open after owned server shutdown.`);
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
  const ownedPorts = [];
  let tests = null;
  const staticPort = mode === "gate-audit" ? "4183" : "4173";
  const nextPort = mode === "gate-audit" ? "3183" : "3100";
  const staticOrigin = `http://127.0.0.1:${staticPort}`;
  const nextOrigin = `http://127.0.0.1:${nextPort}`;
  const requireFresh = process.env.TEOYUBE_GATE_REQUIRE_FRESH === "1";
  let interruptedSignal = null;
  const handleSignal = (signal) => {
    interruptedSignal = signal;
    if (tests?.pid && tests.exitCode === null) tests.kill("SIGTERM");
    for (const server of servers) {
      if (server?.pid && server.exitCode === null) server.kill("SIGTERM");
    }
  };
  process.once("SIGINT", handleSignal);
  process.once("SIGTERM", handleSignal);
  try {
    if (requireFresh) {
      const ports = mode === "status" ? [] : [staticPort];
      if (["next", "shell", "today", "search", "canon-promise", "prayer-calling-journey", "journal-testimony-book", "remaining-retained", "gate-audit", "support-capture", "support-baseline", "next-support-capture", "next-support-baseline"].includes(mode)) {
        ports.push(nextPort);
      }
      for (const port of [...new Set(ports)]) {
        if (await portIsListening(port)) throw new Error(`Fresh-run port ${port} is already in use; refusing to reuse an unknown listener.`);
      }
    }
    if (!new Set(["status", "support-capture", "support-baseline", "next-support-capture", "next-support-baseline"]).has(mode)) {
      const staticUrl = `${staticOrigin}/index.html`;
      if (requireFresh || !(await urlIsReady(staticUrl))) {
        const staticServer = startStaticServer(staticPort);
        servers.push(staticServer);
        ownedPorts.push(staticPort);
        await waitForUrl(staticServer, staticUrl);
      }
    }
    if (mode === "next" || mode === "shell" || mode === "today" || mode === "search" || mode === "canon-promise" || mode === "prayer-calling-journey" || mode === "journal-testimony-book" || mode === "remaining-retained" || mode === "gate-audit" || mode === "support-capture" || mode === "support-baseline" || mode === "next-support-capture" || mode === "next-support-baseline") {
      const nextServer = startNextServer(nextPort);
      servers.push(nextServer);
      ownedPorts.push(nextPort);
      await waitForUrl(nextServer, `${nextOrigin}/api/health`);
    }

    const projects = mode === "next"
      ? [
          "today-parity",
          "search-parity",
          "canon-promise-parity",
          "prayer-calling-journey-parity",
          "journal-testimony-book-parity",
          "remaining-retained-parity"
        ]
      : [mode === "static"
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
        : mode === "next-support-capture"
          ? "owner-approved-next-support-capture"
        : mode === "next-support-baseline"
          ? "owner-approved-next-support-parity"
        : "next-candidate-contract"];
    tests = spawn(
      process.execPath,
      [
        playwrightCli,
        "test",
        "--config=playwright.visual.config.ts",
        ...projects.map((project) => `--project=${project}`)
      ],
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
    if (interruptedSignal) throw new Error(`Visual parity runner was interrupted by ${interruptedSignal}.`);
    process.exitCode = result.code ?? 1;
  } finally {
    process.removeListener("SIGINT", handleSignal);
    process.removeListener("SIGTERM", handleSignal);
    if (tests?.pid && tests.exitCode === null) await stopServer(tests);
    await Promise.all(servers.map((server) => stopServer(server)));
    await Promise.all(ownedPorts.map((port) => waitForClosedPort(port)));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
