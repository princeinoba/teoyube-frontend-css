#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "../..");
const evidenceRoot = path.join(root, ".tmp/accessibility/phase-5c3a");
const outputRoot = path.join(evidenceRoot, "visual-diffs");
const manifestPath = path.join(root, "tests/accessibility/evidence/phase-5c3a/visual-diffs/manifest.json");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "tests/accessibility/evidence/phase-5c3a/after/manifest.json"), "utf8"));
const selected = manifest.cells.filter((cell) => ["desktop-wide", "mobile"].includes(cell.viewport));
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

async function normalized(file) {
  const result = await sharp(file).resize({ width: 280, withoutEnlargement: true }).png().toBuffer({ resolveWithObject: true });
  return { bytes: result.data, width: result.info.width, height: result.info.height };
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  const artifacts = [];
  for (const cell of selected) {
    const afterPath = path.join(root, cell.screenshot.path);
    const beforePath = afterPath.replace(`${path.sep}after${path.sep}`, `${path.sep}before${path.sep}`);
    if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) throw new Error(`Missing candidate image for ${cell.runtime}/${cell.viewport}/${cell.key}.`);
    const before = await normalized(beforePath);
    const after = await normalized(afterPath);
    const width = Math.max(before.width, after.width);
    const height = Math.max(before.height, after.height);
    const canvas = { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } };
    const beforeCanvas = await sharp({ create: canvas }).composite([{ input: before.bytes, top: 0, left: 0 }]).png().toBuffer();
    const afterCanvas = await sharp({ create: canvas }).composite([{ input: after.bytes, top: 0, left: 0 }]).png().toBuffer();
    const sideBySide = await sharp({ create: { ...canvas, width: width * 2 } }).composite([
      { input: beforeCanvas, top: 0, left: 0 },
      { input: afterCanvas, top: 0, left: width }
    ]).png().toBuffer();
    const overlay = await sharp(beforeCanvas).composite([{ input: afterCanvas, top: 0, left: 0, blend: "difference" }]).png().toBuffer();
    const stem = `${cell.runtime}-${cell.viewport}-${cell.key}`;
    for (const [kind, bytes] of [["side-by-side", sideBySide], ["overlay-difference", overlay]]) {
      const relativePath = `.tmp/accessibility/phase-5c3a/visual-diffs/${stem}-${kind}.png`;
      fs.writeFileSync(path.join(root, relativePath), bytes);
      artifacts.push({ runtime: cell.runtime, viewport: cell.viewport, routeKey: cell.key, kind, path: relativePath, bytes: bytes.length, sha256: sha256(bytes) });
    }
  }
  const report = {
    schemaVersion: 1,
    phase: "5C-3A",
    issueId: "A11Y-007",
    generatedAt: new Date().toISOString(),
    selection: "desktop-wide and mobile candidate thumbnails for every affected Next route and available static rollback route",
    fullPixelComparison: "tests/accessibility/evidence/phase-5c3a/after/manifest.json",
    baselineWrites: 0,
    disposableOutputRoot: ".tmp/accessibility/phase-5c3a/visual-diffs",
    artifactCount: artifacts.length,
    artifacts
  };
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ status: "PASS", artifacts: artifacts.length, outputRoot: report.disposableOutputRoot, baselineWrites: 0 }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
