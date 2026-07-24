"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..", "..");

function normalize(filePath) {
  return filePath.replace(/\\/g, "/");
}

function absolute(relativePath) {
  return path.resolve(ROOT, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  const target = absolute(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(relativePath, value) {
  const target = absolute(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}

function sha256Buffer(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function sha256File(relativePath) {
  return sha256Buffer(fs.readFileSync(absolute(relativePath)));
}

function walk(relativePath, options = {}) {
  const start = absolute(relativePath);
  if (!fs.existsSync(start)) return [];
  const ignored = new Set(options.ignored || []);
  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const relative = normalize(path.relative(ROOT, fullPath));
      if (ignored.has(relative) || [...ignored].some((item) => relative.startsWith(`${item}/`))) continue;
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile()) files.push(relative);
    }
  };
  if (fs.statSync(start).isFile()) return [normalize(relativePath)];
  visit(start);
  return files.sort();
}

function hashFileSet(files) {
  const hash = crypto.createHash("sha256");
  let bytes = 0;
  for (const relativePath of [...files].sort()) {
    const buffer = fs.readFileSync(absolute(relativePath));
    bytes += buffer.length;
    hash.update(relativePath);
    hash.update("\0");
    hash.update(sha256Buffer(buffer));
    hash.update("\n");
  }
  return Object.freeze({ sha256: hash.digest("hex"), files: files.length, bytes });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: options.maxBuffer || 256 * 1024 * 1024,
    env: options.env || process.env,
    shell: false
  });
  if (options.allowFailure !== true && result.status !== 0) {
    const message = (result.stderr || result.stdout || "").trim().slice(-4000);
    throw new Error(`${command} ${args.join(" ")} failed (${result.status}): ${message}`);
  }
  return result;
}

function npmRun(args, options = {}) {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath && fs.existsSync(npmExecPath)) {
    return run(process.execPath, [npmExecPath, ...args], options);
  }
  if (process.platform === "win32") {
    const adjacentCli = path.join(
      path.dirname(process.execPath),
      "node_modules",
      "npm",
      "bin",
      "npm-cli.js"
    );
    if (fs.existsSync(adjacentCli)) {
      return run(process.execPath, [adjacentCli, ...args], options);
    }
    throw new Error("Unable to resolve npm CLI safely on Windows.");
  }
  return run("npm", args, options);
}

function git(args, options = {}) {
  return run("git", args, options).stdout.trim();
}

function gitFilesAt(commit) {
  const output = git(["ls-tree", "-r", "--name-only", commit]);
  return output ? output.split(/\r?\n/).map(normalize).sort() : [];
}

function gitFileAt(commit, relativePath) {
  return git(["show", `${commit}:${normalize(relativePath)}`]);
}

function currentIdentity() {
  return Object.freeze({
    branch: git(["branch", "--show-current"]),
    commit: git(["rev-parse", "HEAD"]),
    dirty: git(["status", "--porcelain"]).length > 0,
    node: process.version,
    npm: npmRun(["--version"]).stdout.trim(),
    os: `${process.platform}-${process.arch}`
  });
}

function fileSize(relativePath) {
  return fs.statSync(absolute(relativePath)).size;
}

module.exports = {
  ROOT,
  absolute,
  currentIdentity,
  fileSize,
  git,
  gitFileAt,
  gitFilesAt,
  hashFileSet,
  normalize,
  npmRun,
  readJson,
  run,
  sha256Buffer,
  sha256File,
  walk,
  writeJson,
  writeText
};
