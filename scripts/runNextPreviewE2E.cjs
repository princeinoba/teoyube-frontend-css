const { spawn } = require("node:child_process");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "..");
const port = 3100;
const healthUrl = `http://127.0.0.1:${port}/api/health`;
const nextCli = require.resolve("next/dist/bin/next");
const playwrightCli = require.resolve("@playwright/test/cli");

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function waitForHealth(child, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next preview exited before health became available (exit ${child.exitCode}).`);
    }

    try {
      const response = await fetch(healthUrl, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${healthUrl}.`);
}

async function stopServer(child) {
  if (!child.pid || child.exitCode !== null) return;

  try {
    child.kill("SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }

  await Promise.race([
    waitForExit(child),
    new Promise((resolve) => setTimeout(resolve, 2_000))
  ]);

  if (child.exitCode === null) {
    child.kill("SIGKILL");
    child.unref();
  }
}

async function main() {
  const server = spawn(
    process.execPath,
    [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: workspaceRoot,
      detached: process.platform !== "win32",
      env: { ...process.env, NODE_ENV: "production" },
      stdio: "inherit"
    }
  );

  try {
    await waitForHealth(server);
    const tests = spawn(process.execPath, [playwrightCli, "test"], {
      cwd: workspaceRoot,
      env: process.env,
      stdio: "inherit"
    });
    const result = await waitForExit(tests);

    if (result.signal) {
      throw new Error(`Playwright exited from signal ${result.signal}.`);
    }
    process.exitCode = result.code ?? 1;
  } finally {
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
