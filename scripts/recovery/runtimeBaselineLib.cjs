"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const BASELINE_ROOT = path.join(ROOT, "tests/visual/baselines/static-runtime");
const MANIFEST_PATH = path.join(BASELINE_ROOT, "manifest.json");

const VIEWPORTS = {
  "desktop-wide": { width: 1440, height: 900 },
  "desktop-standard": { width: 1280, height: 800 },
  "tablet-landscape": { width: 1024, height: 768 },
  "tablet-portrait": { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
  "mobile-small": { width: 360, height: 800 }
};

const VIEWS = [
  "today",
  "search",
  "canon",
  "table",
  "calling",
  "book",
  "lexicon",
  "testimony",
  "guide",
  "ui-elements",
  "teoyube-tables",
  "roadmap"
];

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function record(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  const stat = fs.statSync(absolutePath);
  return { path: relativePath.split(path.sep).join("/"), bytes: stat.size, sha256: sha256(absolutePath) };
}

function buildManifest() {
  const artifacts = [];
  for (const viewport of Object.keys(VIEWPORTS)) {
    for (const view of VIEWS) {
      const screenshot = `tests/visual/baselines/static-runtime/${viewport}/${view}.png`;
      if (!fs.existsSync(path.join(ROOT, screenshot))) throw new Error(`Missing screenshot baseline: ${screenshot}`);
      artifacts.push({ kind: "screenshot", viewport, view, ...record(screenshot) });

      if (viewport === "desktop-wide") {
        const dom = `tests/visual/baselines/static-runtime/${viewport}/${view}.dom.json`;
        if (!fs.existsSync(path.join(ROOT, dom))) throw new Error(`Missing DOM baseline: ${dom}`);
        artifacts.push({ kind: "dom", viewport, view, ...record(dom) });
      }
    }
  }

  return {
    schemaVersion: 1,
    sourceRuntime: "original static Phase 11.6C.3 runtime",
    sourceTag: "teoyube-original-upload-2026-07-18",
    branch: "recovery/visual-source-of-truth",
    capturePolicy: "Immutable. Updating or deleting a baseline requires explicit current-task owner approval.",
    captureEnvironment: {
      browser: "system Chromium via Playwright",
      deviceScaleFactor: 1,
      colorScheme: "light",
      locale: "en-US"
    },
    viewports: VIEWPORTS,
    views: VIEWS,
    artifacts
  };
}

module.exports = { BASELINE_ROOT, MANIFEST_PATH, ROOT, buildManifest };
