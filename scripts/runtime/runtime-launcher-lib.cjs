"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

function readBuild(root) {
  const buildIdPath = path.join(root, ".next", "BUILD_ID");
  if (!fs.existsSync(buildIdPath)) {
    return Object.freeze({
      ready: false,
      buildId: null,
      message: "The Next production build is missing. Run npm run app:build before starting Teoyube."
    });
  }
  const buildId = fs.readFileSync(buildIdPath, "utf8").trim();
  if (!buildId || !/^[a-z0-9_-]{1,128}$/i.test(buildId)) {
    return Object.freeze({
      ready: false,
      buildId: null,
      message: "The Next production build ID is invalid. Run npm run app:build before starting Teoyube."
    });
  }
  return Object.freeze({ ready: true, buildId, message: "Next production build is ready." });
}

function parseStartArguments(argumentsList, environment = process.env) {
  const args = [...argumentsList];
  let port = environment.PORT || "3000";
  let hostname = "127.0.0.1";
  let hasPort = false;
  let hasHostname = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--port" || argument === "-p") {
      port = args[index + 1];
      hasPort = true;
      index += 1;
    } else if (argument.startsWith("--port=")) {
      port = argument.slice("--port=".length);
      hasPort = true;
    } else if (argument === "--hostname" || argument === "-H") {
      hostname = args[index + 1];
      hasHostname = true;
      index += 1;
    } else if (argument.startsWith("--hostname=")) {
      hostname = argument.slice("--hostname=".length);
      hasHostname = true;
    }
  }
  const numericPort = Number(port);
  if (!Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535) {
    throw new Error("Teoyube requires a valid local TCP port.");
  }
  if (!hostname || hostname.length > 253 || !/^[a-z0-9.:-]+$/i.test(hostname)) {
    throw new Error("Teoyube requires a valid local hostname.");
  }
  if (!["127.0.0.1", "localhost", "::1"].includes(hostname.toLowerCase())) {
    throw new Error("Teoyube's repository/local runtime may bind only to a loopback hostname.");
  }
  return Object.freeze({
    port: numericPort,
    hostname,
    nextArguments: Object.freeze([
      ...args,
      ...(hasHostname ? [] : ["--hostname", hostname]),
      ...(hasPort ? [] : ["--port", String(numericPort)])
    ])
  });
}

function assertPortAvailable(port, hostname) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.once("error", (error) => {
      reject(new Error(`Teoyube cannot start because ${hostname}:${port} is unavailable (${error.code || "port conflict"}).`));
    });
    probe.listen({ port, host: hostname, exclusive: true }, () => {
      probe.close((error) => error ? reject(error) : resolve());
    });
  });
}

module.exports = Object.freeze({
  assertPortAvailable,
  parseStartArguments,
  readBuild
});
