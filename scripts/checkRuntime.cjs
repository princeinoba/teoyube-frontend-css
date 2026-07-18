const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);
const url = `http://127.0.0.1:${port}/`;

function requestStatus(targetUrl) {
  return new Promise((resolve) => {
    const request = http.get(targetUrl, (response) => {
      response.resume();
      response.on("end", () => resolve(response.statusCode || 0));
    });
    request.on("error", () => resolve(0));
    request.setTimeout(1200, () => {
      request.destroy();
      resolve(0);
    });
  });
}

async function waitForServer(targetUrl, attempts = 20) {
  for (let index = 0; index < attempts; index += 1) {
    const status = await requestStatus(targetUrl);
    if (status === 200) return status;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return 0;
}

async function run() {
  const existingStatus = await requestStatus(url);
  if (existingStatus === 200) {
    console.log(JSON.stringify({ valid: true, reusedExistingServer: true, url, status: existingStatus }, null, 2));
    return;
  }

  const child = spawn(process.execPath, ["--preserve-symlinks-main", "server.js"], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const status = await waitForServer(url);
  child.kill();

  const report = {
    valid: status === 200,
    reusedExistingServer: false,
    url,
    status: status || "not running",
    stderr: stderr.trim().slice(0, 500)
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exit(1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
