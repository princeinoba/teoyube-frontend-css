"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const CONTRACT_PATH = path.join(ROOT, "tests/visual/contracts/original-static-visual-contract.json");
const SOURCE_ARCHIVE_SHA256 = "6eb1b8fa0937b3957138d3f5fb1a5b6308a2b0510d1ae00299e1d70172758de9";

const VISUAL_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".avif"
]);

const ROOT_PROTECTED_FILES = [
  "index.html",
  "app.js",
  "phase116b1.js",
  "embedded-videos.js",
  "styles.css",
  "media-review.html",
  "media-review-responsive-qa.html",
  "media-review.css",
  "media-review-runtime-acceptance.css",
  "media-review.js",
  "media-review-wizard.js",
  "media-review-derivatives.js",
  "media-review-runtime-acceptance.js",
  "teoyubeworld-media.css",
  "teoyubeworld-media-experience.js",
  "teoyubeworld-media-runtime.js",
  "teoyubeworld-playback-coordinator.js",
  "teoyubeworld-sequence-player.js"
];

const DESIGN_REFERENCES = [
  ["today", "Asset/ChatGPT Image page (Today).png"],
  ["search", "Asset/ChatGPT Image page (TeoyubeSearch).png"],
  ["canon", "Asset/ChatGPT Image page (TeoyubeCanon Page).png"],
  ["promise-table", "Asset/ChatGPT Image page (TeoyubePromise table Page).png"],
  ["calling-compass", "Asset/ChatGPT Image (Calling Compass).png"],
  ["book-of-the-saint", "Asset/ChatGPT Image (Book of Saints).png"],
  ["lexicon", "Asset/ChatGPT Image (Teoyube Lexicon Page).png"],
  ["testimony", "Asset/ChatGPT Image (Testimony Page).png"],
  ["teo-guide", "Asset/ChatGPT Image (Teo Guide Page).png"],
  ["embedded-videos", "Asset/ChatGPT Image (Embed Video Page).png"],
  ["tables", "Asset/ChatGPT Image (Teoyube Tables Page).png"],
  ["roadmap-owner-reference", "Asset/ChatGPT Image page (Roadmap).png"]
];

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sha256File(absolutePath) {
  return sha256Buffer(fs.readFileSync(absolutePath));
}

function listFilesRecursively(relativeDirectory, predicate = () => true) {
  const absoluteDirectory = path.join(ROOT, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory)) return [];

  const output = [];
  const visit = (absolutePath) => {
    const entries = fs.readdirSync(absolutePath, { withFileTypes: true });
    for (const entry of entries) {
      const child = path.join(absolutePath, entry.name);
      if (entry.isDirectory()) {
        visit(child);
      } else if (entry.isFile()) {
        const relative = normalizePath(path.relative(ROOT, child));
        if (predicate(relative, child)) output.push(relative);
      }
    }
  };

  visit(absoluteDirectory);
  return output.sort();
}

function getProtectedFiles() {
  const files = new Set();

  for (const relative of ROOT_PROTECTED_FILES) {
    if (fs.existsSync(path.join(ROOT, relative))) files.add(relative);
  }

  for (const relative of listFilesRecursively("styles")) files.add(relative);
  for (const relative of listFilesRecursively("public/images")) files.add(relative);
  for (const relative of listFilesRecursively("public/assets")) files.add(relative);
  for (const relative of listFilesRecursively("Asset", (file) => VISUAL_EXTENSIONS.has(path.extname(file).toLowerCase()))) {
    files.add(relative);
  }

  return [...files].sort();
}

function fileRecord(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  const stat = fs.statSync(absolutePath);
  return {
    path: relativePath,
    bytes: stat.size,
    sha256: sha256File(absolutePath)
  };
}

function addTokens(target, rawValue) {
  for (const token of String(rawValue || "").split(/\s+/)) {
    const normalized = token.trim();
    if (!normalized || normalized.includes("${")) continue;
    if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(normalized)) target.add(normalized);
  }
}

function extractMarkupContract() {
  const sourceFiles = [
    "index.html",
    "app.js",
    "phase116b1.js",
    "embedded-videos.js",
    "media-review.html",
    "media-review.js",
    "teoyubeworld-media-experience.js",
    "teoyubeworld-media-runtime.js",
    "teoyubeworld-sequence-player.js"
  ].filter((relative) => fs.existsSync(path.join(ROOT, relative)));

  const classes = new Set();
  const ids = new Set();
  const dataViews = new Set();
  const ariaLabels = new Set();
  const assetReferences = new Set();
  const tagSignatures = [];

  for (const relative of sourceFiles) {
    const text = fs.readFileSync(path.join(ROOT, relative), "utf8");

    for (const match of text.matchAll(/\bclass(?:Name)?\s*=\s*["'`]([^"'`]+)["'`]/g)) addTokens(classes, match[1]);
    for (const match of text.matchAll(/\bid\s*=\s*["'`]([^"'`]+)["'`]/g)) addTokens(ids, match[1]);
    for (const match of text.matchAll(/\bdata-view(?:-shortcut)?\s*=\s*["'`]([^"'`]+)["'`]/g)) addTokens(dataViews, match[1]);
    for (const match of text.matchAll(/\baria-label\s*=\s*["'`]([^"'`]+)["'`]/g)) {
      const label = match[1].trim();
      if (label && !label.includes("${")) ariaLabels.add(label);
    }
    for (const match of text.matchAll(/(?:public\/(?:images|assets)\/|Asset\/)[^"'`\s)>]+/g)) {
      assetReferences.add(match[0].replace(/[),.;]+$/, ""));
    }

    for (const match of text.matchAll(/<([A-Za-z][A-Za-z0-9-]*)([^>]*)>/g)) {
      const tag = match[1].toLowerCase();
      const attrs = match[2];
      const idMatch = attrs.match(/\bid\s*=\s*["'`]([^"'`]+)["'`]/);
      const classMatch = attrs.match(/\bclass(?:Name)?\s*=\s*["'`]([^"'`]+)["'`]/);
      const viewMatch = attrs.match(/\bdata-view(?:-shortcut)?\s*=\s*["'`]([^"'`]+)["'`]/);
      const id = idMatch && !idMatch[1].includes("${") ? `#${idMatch[1]}` : "";
      const classTokens = [];
      if (classMatch && !classMatch[1].includes("${")) {
        classTokens.push(...classMatch[1].split(/\s+/).filter(Boolean).sort());
      }
      const view = viewMatch && !viewMatch[1].includes("${") ? `@${viewMatch[1]}` : "";
      tagSignatures.push(`${tag}${id}${classTokens.map((value) => `.${value}`).join("")}${view}`);
    }
  }

  const cssFiles = ["styles.css", "teoyubeworld-media.css", "media-review.css", ...listFilesRecursively("styles")]
    .filter((value, index, values) => values.indexOf(value) === index)
    .filter((relative) => fs.existsSync(path.join(ROOT, relative)));
  const cssClasses = new Set();
  const cssIds = new Set();
  const animationNames = new Set();
  const mediaQueries = new Set();

  for (const relative of cssFiles) {
    const css = fs.readFileSync(path.join(ROOT, relative), "utf8");
    for (const match of css.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)) cssClasses.add(match[1]);
    for (const match of css.matchAll(/#([A-Za-z_][A-Za-z0-9_-]*)/g)) cssIds.add(match[1]);
    for (const match of css.matchAll(/@keyframes\s+([A-Za-z_][A-Za-z0-9_-]*)/g)) animationNames.add(match[1]);
    for (const match of css.matchAll(/@media\s*([^\{]+)/g)) mediaQueries.add(match[1].trim().replace(/\s+/g, " "));
  }

  const sorted = (set) => [...set].sort();
  const orderedTagHash = sha256Buffer(Buffer.from(tagSignatures.join("\n"), "utf8"));

  return {
    sourceFiles,
    classes: sorted(classes),
    ids: sorted(ids),
    dataViews: sorted(dataViews),
    ariaLabels: sorted(ariaLabels),
    assetReferences: sorted(assetReferences),
    cssClasses: sorted(cssClasses),
    cssIds: sorted(cssIds),
    animationNames: sorted(animationNames),
    mediaQueries: sorted(mediaQueries),
    orderedTagSignatureCount: tagSignatures.length,
    orderedTagSignatureSha256: orderedTagHash
  };
}

function buildVisualContract() {
  const protectedFiles = getProtectedFiles().map(fileRecord);
  const referenceScreenshots = DESIGN_REFERENCES.map(([view, relativePath]) => ({
    view,
    ...fileRecord(relativePath)
  }));

  return {
    schemaVersion: 1,
    purpose: "Immutable owner-approved visual and behavioral source contract for the clean recovery branch.",
    sourceArchive: {
      filename: "Teoyube Phase 1(4).zip",
      sha256: SOURCE_ARCHIVE_SHA256
    },
    baseline: {
      branch: "recovery/visual-source-of-truth",
      tag: "teoyube-original-upload-2026-07-18",
      commit: "607ec21"
    },
    updatePolicy: {
      ownerApprovalRequired: true,
      codexMayUpdateBaselinesWithoutCurrentTaskApproval: false,
      snapshotUpdateToPassTestsProhibited: true
    },
    protectedFiles,
    referenceScreenshots,
    markupContract: extractMarkupContract()
  };
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

module.exports = {
  CONTRACT_PATH,
  ROOT,
  buildVisualContract,
  stableJson
};
