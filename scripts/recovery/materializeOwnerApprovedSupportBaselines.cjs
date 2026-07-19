"use strict";

/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const sharp = require("sharp");

const workspaceRoot = path.resolve(__dirname, "../..");
const sourcePath = path.join(workspaceRoot, "tests/visual/parity/support-route-baseline-source.json");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const baselineRoot = path.join(workspaceRoot, "tests/visual/baselines/owner-approved-support-routes");
const prompt12aRoot = path.join(workspaceRoot, ".tmp/visual-parity/remaining-retained-owner-review/support-views");
const recaptureRoot = path.join(workspaceRoot, ".tmp/visual-parity/prompt-12b-support-route-capture");
const approvalMarkdownPath = "docs/owner-approvals/visual/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8.md";
const approvalJsonPath = "docs/owner-approvals/visual/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8.json";
const channelDelta = 16;
const maxDifferentPixelRatio = 0.005;

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function relative(filePath) {
  return path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
}

function currentHead() {
  return execFileSync(
    "git",
    ["-c", `safe.directory=${workspaceRoot.replace(/\\/g, "/")}`, "rev-parse", "HEAD"],
    { cwd: workspaceRoot, encoding: "utf8" }
  ).trim();
}

function artifact(filePath) {
  return { path: relative(filePath), sha256: sha256(filePath), bytes: fs.statSync(filePath).size };
}

async function compareRaster(leftPath, rightPath) {
  const left = await sharp(leftPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const right = await sharp(rightPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (left.info.width !== right.info.width || left.info.height !== right.info.height) {
    throw new Error(`Screenshot dimensions differ: ${relative(leftPath)} vs ${relative(rightPath)}`);
  }
  let differentPixels = 0;
  let maxChannelDelta = 0;
  for (let offset = 0; offset < left.data.length; offset += 4) {
    const delta = Math.max(
      Math.abs(left.data[offset] - right.data[offset]),
      Math.abs(left.data[offset + 1] - right.data[offset + 1]),
      Math.abs(left.data[offset + 2] - right.data[offset + 2]),
      Math.abs(left.data[offset + 3] - right.data[offset + 3])
    );
    if (delta > channelDelta) differentPixels += 1;
    if (delta > maxChannelDelta) maxChannelDelta = delta;
  }
  const pixelCount = left.info.width * left.info.height;
  const differentPixelRatio = differentPixels / pixelCount;
  return {
    width: left.info.width,
    height: left.info.height,
    differentPixels,
    differentPixelRatio,
    maxChannelDelta,
    strictPassed: differentPixelRatio <= maxDifferentPixelRatio
  };
}

async function main() {
  const suppliedApproval = process.argv.find((argument) => argument.startsWith("--approval-id="))?.split("=")[1];
  if (suppliedApproval !== source.approvalId) {
    throw new Error(`Pass --approval-id=${source.approvalId} to materialize this owner-authorized baseline.`);
  }
  if (currentHead() !== source.approvedCommit) {
    throw new Error(`Support baselines may only be materialized from approved commit ${source.approvedCommit}.`);
  }
  if (fs.existsSync(baselineRoot)) {
    throw new Error(`Refusing to replace immutable support-route baselines: ${baselineRoot}`);
  }

  const approvalJson = JSON.parse(fs.readFileSync(path.join(workspaceRoot, approvalJsonPath), "utf8"));
  if (approvalJson.approvalId !== source.approvalId || approvalJson.currentCommit !== source.approvedCommit) {
    throw new Error("Owner approval record is not bound to the approved support-route source commit.");
  }

  const captures = [];
  for (const definition of source.routes) {
    for (const viewport of source.viewports) {
      const prompt12aScreenshot = path.join(prompt12aRoot, definition.slug, viewport.name, "candidate.png");
      const prompt12aContract = path.join(prompt12aRoot, definition.slug, viewport.name, "contract.json");
      const recaptureScreenshot = path.join(recaptureRoot, definition.slug, viewport.name, "screenshot.png");
      const richContract = path.join(recaptureRoot, definition.slug, viewport.name, "contract.json");
      for (const required of [prompt12aScreenshot, prompt12aContract, recaptureScreenshot, richContract]) {
        if (!fs.existsSync(required)) throw new Error(`Missing approved capture input: ${relative(required)}`);
      }

      const comparison = await compareRaster(prompt12aScreenshot, recaptureScreenshot);
      if (!comparison.strictPassed) {
        throw new Error(`${definition.route}/${viewport.name} no longer matches its Prompt 12A approved render.`);
      }
      if (comparison.width !== viewport.width || comparison.height !== viewport.height) {
        throw new Error(`${definition.route}/${viewport.name} has unexpected dimensions.`);
      }

      const destination = path.join(baselineRoot, definition.slug, viewport.name);
      fs.mkdirSync(destination, { recursive: true });
      const screenshotDestination = path.join(destination, "screenshot.png");
      const prompt12aContractDestination = path.join(destination, "prompt12a-contract.json");
      const richContractDestination = path.join(destination, "contract.json");
      fs.copyFileSync(prompt12aScreenshot, screenshotDestination);
      fs.copyFileSync(prompt12aContract, prompt12aContractDestination);
      fs.copyFileSync(richContract, richContractDestination);

      const parsedPrompt12aContract = JSON.parse(fs.readFileSync(prompt12aContractDestination, "utf8"));
      const parsedRichContract = JSON.parse(fs.readFileSync(richContractDestination, "utf8"));
      captures.push({
        route: definition.route,
        slug: definition.slug,
        status: definition.status,
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        state: source.state,
        screenshot: artifact(screenshotDestination),
        prompt12aContract: artifact(prompt12aContractDestination),
        contract: artifact(richContractDestination),
        contractSummary: {
          prompt12aElements: parsedPrompt12aContract.length,
          orderedDom: parsedRichContract.orderedDom.length,
          ids: parsedRichContract.ids.length,
          classLists: parsedRichContract.classLists.length,
          assets: parsedRichContract.assets.length,
          controls: parsedRichContract.interactiveControls.length,
          focusOrder: parsedRichContract.focusOrder.length
        },
        prompt12bRecapture: {
          sourcePath: relative(recaptureScreenshot),
          sha256: sha256(recaptureScreenshot),
          ...comparison
        }
      });
    }
  }

  const manifest = {
    schemaVersion: 1,
    approvalId: source.approvalId,
    approvalDate: source.approvalDate,
    approvedCommit: source.approvedCommit,
    sourceRuntime: "next-preview",
    canonicalRuntime: "static-node-app",
    state: source.state,
    captureEnvironment: source.captureEnvironment,
    screenshotTolerance: { channelDelta, maxDifferentPixelRatio },
    sourceDefinition: artifact(sourcePath),
    approvalRecords: {
      markdown: artifact(path.join(workspaceRoot, approvalMarkdownPath)),
      json: artifact(path.join(workspaceRoot, approvalJsonPath))
    },
    routes: source.routes,
    viewports: source.viewports,
    captures,
    immutableRules: [
      "Do not overwrite, regenerate, move, or update these artifacts without a newer scoped owner approval.",
      "Do not merge these artifacts into tests/visual/baselines/static-runtime/.",
      "A build result alone cannot update an owner-approved support-route status.",
      "Candidate outputs must remain under .tmp/visual-parity/."
    ]
  };
  fs.writeFileSync(path.join(baselineRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const recapturesAboveChannelDelta = captures.filter(
    (capture) => capture.prompt12bRecapture.differentPixels > 0
  );
  console.log(
    `Created ${captures.length} owner-approved support-route cells (${recapturesAboveChannelDelta.length} recaptures with pixels above the channel-delta threshold, all strict comparisons passed).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
