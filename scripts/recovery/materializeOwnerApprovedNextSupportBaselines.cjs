"use strict";

/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const workspaceRoot = path.resolve(__dirname, "../..");
const sourcePath = path.join(workspaceRoot, "tests/visual/parity/owner-approved-next-support-source.json");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const candidateRoot = path.join(workspaceRoot, ".tmp/visual-parity/prompt-12d-next-support-capture");
const baselineRoot = path.join(workspaceRoot, "tests/visual/baselines/owner-approved-next-support");
const amendmentPath = path.join(workspaceRoot, "docs/owner-approvals/visual/TEOYUBE-OWNER-ROUTE-AMENDMENT-2026-07-20-P12D.md");

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function relative(filePath) {
  return path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
}

function artifact(filePath) {
  return { path: relative(filePath), sha256: sha256(filePath), bytes: fs.statSync(filePath).size };
}

function currentHead() {
  return execFileSync("git", ["-c", `safe.directory=${workspaceRoot.replace(/\\/g, "/")}`, "rev-parse", "HEAD"], { cwd: workspaceRoot, encoding: "utf8" }).trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function dimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  assert(buffer.subarray(1, 4).toString("ascii") === "PNG", `${relative(filePath)} is not a PNG.`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function statesFor(definition, viewportName) {
  return definition.states.filter((state) => state.viewports === "all" || state.viewports.includes(viewportName));
}

function main() {
  const suppliedAmendment = process.argv.find((argument) => argument.startsWith("--approval-id="))?.split("=")[1];
  assert(suppliedAmendment === source.amendmentId, `Pass --approval-id=${source.amendmentId} to materialize this owner-authorized baseline.`);
  assert(currentHead() === source.evidenceCommit, `Baselines may only be materialized from evidence commit ${source.evidenceCommit}.`);
  assert(!fs.existsSync(baselineRoot), `Refusing to replace owner-approved support baselines: ${baselineRoot}`);
  assert(fs.existsSync(amendmentPath), "Prompt 12D owner amendment is missing.");
  assert(source.routes.length === 9 && source.viewports.length === 6, "Prompt 12D requires exactly nine support routes and six viewports.");
  assert(!source.routes.some((definition) => definition.route === "/dashboard"), "Dashboard cannot enter the public support baseline.");

  for (const definition of source.routes) {
    const routeSource = path.join(workspaceRoot, "src/app", definition.slug, "page.tsx");
    assert(fs.existsSync(routeSource), `Missing route source ${relative(routeSource)}.`);
    assert(sha256(routeSource) === definition.sourceSha256, `${definition.route} changed after the approved evidence commit.`);
  }

  const captures = [];
  for (const viewport of source.viewports) {
    for (const definition of source.routes) {
      for (const state of statesFor(definition, viewport.name)) {
        const candidate = path.join(candidateRoot, definition.slug, viewport.name, state.name);
        const required = ["screenshot.png", "contract.json", "audit.json"].map((name) => path.join(candidate, name));
        for (const filePath of required) assert(fs.existsSync(filePath), `Missing approved capture input: ${relative(filePath)}`);
        const screenshotDimensions = dimensions(required[0]);
        assert(screenshotDimensions.width === viewport.width && screenshotDimensions.height === viewport.height, `${definition.route}/${viewport.name}/${state.name} dimensions differ.`);
        const contract = JSON.parse(fs.readFileSync(required[1], "utf8"));
        const audit = JSON.parse(fs.readFileSync(required[2], "utf8"));
        assert(Array.isArray(contract.orderedDom) && Array.isArray(contract.classLists) && Array.isArray(contract.assets), `${definition.route}/${viewport.name}/${state.name} contract is incomplete.`);
        assert(Array.isArray(audit.issues) && Array.isArray(audit.focusOrder), `${definition.route}/${viewport.name}/${state.name} audit is incomplete.`);
        assert(audit.storage.local === 0 && audit.storage.session === 0, `${definition.route}/${viewport.name}/${state.name} wrote browser storage.`);

        const destination = path.join(baselineRoot, definition.slug, viewport.name, state.name);
        fs.mkdirSync(destination, { recursive: true });
        const screenshot = path.join(destination, "screenshot.png");
        const contractPath = path.join(destination, "contract.json");
        const auditPath = path.join(destination, "audit.json");
        fs.copyFileSync(required[0], screenshot);
        fs.copyFileSync(required[1], contractPath);
        fs.copyFileSync(required[2], auditPath);
        captures.push({
          amendmentId: source.amendmentId,
          evidenceCommit: source.evidenceCommit,
          route: definition.route,
          slug: definition.slug,
          viewport: viewport.name,
          width: viewport.width,
          height: viewport.height,
          state: state.name,
          screenshot: artifact(screenshot),
          contract: artifact(contractPath),
          audit: artifact(auditPath),
          contractSummary: {
            orderedDom: contract.orderedDom.length,
            ids: contract.ids.length,
            classLists: contract.classLists.length,
            majorRegions: contract.majorRegions.length,
            assets: contract.assets.length,
            labels: contract.visibleLabels.length,
            controls: contract.interactiveControls.length,
            focusOrder: contract.focusOrder.length,
            accessibilityIssues: audit.issues.length
          }
        });
      }
    }
  }

  assert(captures.length === 70, `Expected 70 default/interaction captures, found ${captures.length}.`);
  const manifest = {
    schemaVersion: 1,
    amendmentId: source.amendmentId,
    approvalDate: source.approvalDate,
    evidenceCommit: source.evidenceCommit,
    sourceRuntime: "next-preview",
    canonicalRuntime: "static-node-app",
    state: source.state,
    captureEnvironment: source.captureEnvironment,
    sourceDefinition: artifact(sourcePath),
    ownerAmendment: artifact(amendmentPath),
    routes: source.routes,
    viewports: source.viewports,
    unsupportedCurrentStates: source.unsupportedCurrentStates,
    captures,
    immutableRules: [
      "Do not overwrite, regenerate, move, or update these artifacts without a newer scoped owner approval.",
      "Do not merge these artifacts into tests/visual/baselines/static-runtime/.",
      "Do not add Dashboard or an internal route to this public support baseline.",
      "Candidate outputs remain under .tmp/visual-parity/."
    ]
  };
  fs.writeFileSync(path.join(baselineRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Created ${captures.length} Prompt 12D support-route baseline captures for ${source.routes.length} routes.`);
}

main();
