/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn, spawnSync } = require("node:child_process");
const { rmSync, mkdirSync } = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "..");
const tempRoot = path.resolve(workspaceRoot, ".tmp", "prompt16-e2e");
const allowedRoot = path.resolve(workspaceRoot, ".tmp") + path.sep;
if (!tempRoot.startsWith(allowedRoot)) throw new Error("Temporary Prompt 16 path escaped the workspace test directory.");
rmSync(tempRoot, { recursive: true, force: true });
mkdirSync(tempRoot, { recursive: true });

const port = 3116;
const baseURL = `http://127.0.0.1:${port}`;
const nextCli = require.resolve("next/dist/bin/next");
const playwrightCli = require.resolve("@playwright/test/cli");
const databasePath = path.join(tempRoot, "memory.sqlite");
const key = Buffer.alloc(32, 19).toString("base64");
const environment = {
  ...process.env,
  TEOYUBE_ENABLE_DURABLE_MEMORY: "true",
  TEOYUBE_IDENTITY_MODE: "local_development",
  TEOYUBE_MEMORY_DATABASE_PATH: databasePath,
  TEOYUBE_MEMORY_ENCRYPTION_KEYS: JSON.stringify({ v1: key }),
  TEOYUBE_MEMORY_ACTIVE_KEY_VERSION: "v1",
  TEOYUBE_SESSION_PEPPER: "prompt-16-e2e-session-pepper-value-0001",
  TEOYUBE_LOCAL_IDENTITY_CREDENTIALS: JSON.stringify({
    "alpha-e2e": { subject: "alpha-e2e", role: "user" },
    "beta-e2e": { subject: "beta-e2e", role: "user" },
    "owner-e2e": { subject: "owner-e2e", role: "owner" }
  }),
  TEOYUBE_MEMORY_E2E_BASE_URL: baseURL
};

function exited(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function waitForServer(child) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Memory preview exited early with ${child.exitCode}.`);
    try {
      const response = await fetch(`${baseURL}/api/health`, { cache: "no-store" });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for the Prompt 16 preview server.");
}

async function stop(child) {
  if (!child.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
  await Promise.race([exited(child), new Promise((resolve) => setTimeout(resolve, 3_000))]);
  if (child.exitCode === null) child.kill("SIGKILL");
}

async function removeTemporaryRoot() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      rmSync(tempRoot, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 });
      return;
    } catch (error) {
      if (attempt === 19) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

async function main() {
  const server = spawn(process.execPath, [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: workspaceRoot, env: environment, stdio: "inherit" });
  try {
    await waitForServer(server);
    const tests = spawn(process.execPath, [playwrightCli, "test", "--config", "playwright.memory.config.ts"], { cwd: workspaceRoot, env: environment, stdio: "inherit" });
    const result = await exited(tests);
    if (result.signal) throw new Error(`Memory e2e ended from signal ${result.signal}.`);
    process.exitCode = result.code ?? 1;
  } finally {
    await stop(server);
    await removeTemporaryRoot();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Prompt 16 e2e failed.");
  process.exitCode = 1;
});
