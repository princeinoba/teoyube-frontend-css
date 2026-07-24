"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const nextPort = Number(process.env.TEOYUBE_RUNTIME_NEXT_PORT || 3122);
const staticPort = Number(process.env.TEOYUBE_RUNTIME_STATIC_PORT || 4192);
const nextOrigin = `http://127.0.0.1:${nextPort}`;
const staticOrigin = `http://127.0.0.1:${staticPort}`;
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "config/runtime/canonical-runtime-manifest.json"), "utf8")
);
const results = [];

function record(id, passed, evidence) {
  results.push(Object.freeze({ id, passed, evidence }));
  if (!passed) throw new Error(`${id}: ${evidence}`);
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

function portIsListening(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(400);
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

function rawRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request(url, options, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({
        status: response.statusCode || 0,
        headers: response.headers,
        body: Buffer.concat(chunks)
      }));
    });
    request.once("error", reject);
    request.end();
  });
}

async function requireUnusedPort(port) {
  if (await portIsListening(port)) throw new Error(`Required verification port ${port} is already in use.`);
}

async function waitForUrl(child, url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Owned runtime exited before ${url} was ready (exit ${child.exitCode}).`);
    }
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return response;
    } catch {
      // The owned runtime is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${url}.`);
}

async function waitForClosedPort(port, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await portIsListening(port))) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Owned runtime did not release port ${port}.`);
}

async function stopRuntime(child, port) {
  if (!child || child.exitCode !== null) {
    await waitForClosedPort(port);
    return;
  }
  child.kill("SIGTERM");
  await Promise.race([
    waitForExit(child),
    new Promise((resolve) => setTimeout(resolve, 5_000))
  ]);
  if (child.exitCode === null) child.kill("SIGKILL");
  await waitForClosedPort(port);
}

function startNext() {
  return spawn(
    process.execPath,
    [path.join(root, "scripts/runtime/start-next.cjs"), "--port", String(nextPort)],
    {
      cwd: root,
      env: {
        ...process.env,
        NODE_ENV: "production",
        TEOYUBE_ENABLE_LIVE_AI: "false",
        TEOYUBE_LIVE_AI_ENABLED: "false",
        TEOYUBE_ENABLE_EMBEDDINGS: "false",
        TEOYUBE_ENABLE_VECTOR_RETRIEVAL: "false",
        TEOYUBE_VECTOR_RETRIEVAL_ENABLED: "false",
        TEOYUBE_ENABLE_BROAD_RAG: "false",
        TEOYUBE_OWNER_QA_TEST_MODE: "false"
      },
      stdio: "inherit"
    }
  );
}

function startStatic() {
  return spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: { ...process.env, PORT: String(staticPort) },
    stdio: "inherit"
  });
}

async function verifyNext(origin) {
  const health = await fetch(`${origin}/api/health`, { cache: "no-store" });
  const healthBody = await health.json();
  record(
    "next-health",
    health.status === 200 &&
      healthBody.runtime === "next-canonical-local" &&
      healthBody.rollbackRuntime === "static-node" &&
      healthBody.gateCProduction === "closed",
    JSON.stringify(healthBody)
  );
  for (const route of manifest.publicRoutes) {
    const response = await fetch(`${origin}${route.path}`, { redirect: "manual" });
    record(`public-route:${route.path}`, response.status === 200, response.status);
  }
  const compass = await fetch(`${origin}/compass?assessment=1&topic=wisdom&unsafe=drop`, {
    redirect: "manual"
  });
  const compassLocation = compass.headers.get("location") || "";
  record(
    "canonical-redirect:/compass",
    [307, 308].includes(compass.status) &&
      compassLocation.includes("/calling-compass") &&
      compassLocation.includes("assessment=1") &&
      compassLocation.includes("topic=wisdom") &&
      !compassLocation.includes("unsafe"),
    `${compass.status} ${compassLocation}`
  );
  const legacyEntry = await fetch(`${origin}/index.html?source=legacy`, { redirect: "manual" });
  record(
    "legacy-entry:/index.html",
    [307, 308].includes(legacyEntry.status) &&
      (legacyEntry.headers.get("location") || "").includes("source=legacy"),
    `${legacyEntry.status} ${legacyEntry.headers.get("location")}`
  );
  for (const protectedRoute of ["/roadmap", "/dashboard", "/dev/teoyube-health", "/graph", "/tig"]) {
    const response = await fetch(`${origin}${protectedRoute}`, { redirect: "manual" });
    record(`protected-route:${protectedRoute}`, response.status === 404, response.status);
  }
  const stylesheet = await fetch(`${origin}/styles/base.css`);
  record(
    "approved-stylesheet",
    stylesheet.status === 200 && (stylesheet.headers.get("content-type") || "").startsWith("text/css"),
    `${stylesheet.status} ${stylesheet.headers.get("content-type")}`
  );
  const legacyImage = await fetch(`${origin}/public/images/teoyube-carousel-5-wide.png`, { method: "HEAD" });
  record(
    "legacy-public-image",
    legacyImage.status === 200 && (legacyImage.headers.get("content-type") || "").startsWith("image/"),
    `${legacyImage.status} ${legacyImage.headers.get("content-type")}`
  );
  const manifestResponse = await fetch(`${origin}/media/teoyubeworld/pilot-v1/runtime-manifest.json`);
  record(
    "media-manifest",
    manifestResponse.status === 200 && manifestResponse.headers.get("cache-control") === "no-store",
    `${manifestResponse.status} ${manifestResponse.headers.get("cache-control")}`
  );
  const mediaPath = "/media/teoyubeworld/pilot-v1/media-1cb26db0174bf3fa9fec/card-preview.mp4";
  const mediaHead = await fetch(`${origin}${mediaPath}`, { method: "HEAD" });
  record(
    "media-head-mime-cache",
    mediaHead.status === 200 &&
      mediaHead.headers.get("content-type") === "video/mp4" &&
      mediaHead.headers.get("accept-ranges") === "bytes" &&
      mediaHead.headers.get("cache-control") === "public, max-age=31536000, immutable",
    JSON.stringify(Object.fromEntries(mediaHead.headers))
  );
  const mediaRange = await fetch(`${origin}${mediaPath}`, { headers: { Range: "bytes=0-99" } });
  record(
    "media-range",
    mediaRange.status === 206 &&
      mediaRange.headers.get("content-range")?.startsWith("bytes 0-99/") &&
      (await mediaRange.arrayBuffer()).byteLength === 100,
    `${mediaRange.status} ${mediaRange.headers.get("content-range")}`
  );
  const lastModified = mediaHead.headers.get("last-modified");
  const conditional = await rawRequest(`${origin}${mediaPath}`, {
    headers: lastModified ? { "If-Modified-Since": lastModified } : {}
  });
  record(
    "media-conditional",
    Boolean(lastModified) && conditional.status === 304,
    `${lastModified} ${conditional.status}`
  );
  record(
    "missing-asset",
    (await fetch(`${origin}/images/does-not-exist-prompt22.png`)).status === 404,
    "expected 404"
  );
  record(
    "protected-media",
    (await fetch(`${origin}/media-source/teoyubeworld/originals/not-public.mp4`)).status === 404,
    "expected 404"
  );
}

async function verifyStatic(origin) {
  const index = await fetch(`${origin}/index.html`);
  record("static-index", index.status === 200 && (await index.text()).includes("Ephesians 1:18"), index.status);
  const stylesheet = await fetch(`${origin}/styles/base.css`);
  record("static-stylesheet", stylesheet.status === 200, stylesheet.status);
  const image = await fetch(`${origin}/public/images/teoyube-carousel-5-wide.png`, { method: "HEAD" });
  record("static-image", image.status === 200, image.status);
  const media = await fetch(
    `${origin}/media/teoyubeworld/pilot-v1/media-1cb26db0174bf3fa9fec/card-preview.mp4`,
    { headers: { Range: "bytes=0-99" } }
  );
  record(
    "static-publication-blocker-unchanged",
    media.status === 404,
    `${media.status}; original static publication-integrity boundary remains closed`
  );
}

async function main() {
  await requireUnusedPort(nextPort);
  await requireUnusedPort(staticPort);
  let next = null;
  let staticRuntime = null;
  try {
    next = startNext();
    await waitForUrl(next, `${nextOrigin}/api/health`);
    await verifyNext(nextOrigin);
    await stopRuntime(next, nextPort);
    next = null;

    staticRuntime = startStatic();
    await waitForUrl(staticRuntime, `${staticOrigin}/index.html`);
    await verifyStatic(staticOrigin);
    await stopRuntime(staticRuntime, staticPort);
    staticRuntime = null;

    next = startNext();
    await waitForUrl(next, `${nextOrigin}/api/health`);
    await verifyNext(nextOrigin);
    record("next-static-next-cycle", true, "Next -> static -> Next completed.");
  } finally {
    if (next) await stopRuntime(next, nextPort);
    if (staticRuntime) await stopRuntime(staticRuntime, staticPort);
  }
  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    nextPort,
    staticPort,
    checks: results,
    result: results.every((item) => item.passed) ? "PASS" : "BLOCKED",
    listenersClosed: !(await portIsListening(nextPort)) && !(await portIsListening(staticPort))
  };
  const outputRoot = path.join(root, ".tmp", "prompt22");
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(
    path.join(outputRoot, "dual-runtime-verification.json"),
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8"
  );
  console.log(
    `DUAL RUNTIME VERIFICATION: ${output.result} ` +
    `(${results.length} checks; Next -> static -> Next; listeners closed ${output.listenersClosed})`
  );
  if (output.result !== "PASS" || !output.listenersClosed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`DUAL RUNTIME VERIFICATION: BLOCKED (${error.message})`);
  process.exitCode = 1;
});
