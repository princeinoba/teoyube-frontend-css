const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredPaths = [
  "media-source/teoyubeworld/originals/shorts",
  "media-source/teoyubeworld/originals/long-form",
  "media-source/teoyubeworld/originals/audio",
  "media-source/teoyubeworld/originals/captions",
  "media-source/teoyubeworld/originals/thumbnails",
  "media-source/teoyubeworld/AGENTS.md",
  "media-source/teoyubeworld/README.md",
  "generated/teoyubeworld-media/manifests",
  "generated/teoyubeworld-media/reports",
  "generated/teoyubeworld-media/contact-sheets",
  "generated/teoyubeworld-media/posters",
  "generated/teoyubeworld-media/thumbnails",
  "generated/teoyubeworld-media/optimized-previews",
  "public/media/teoyubeworld",
  "src/data/teoyubeworld-media-manifest.json"
];

const checks = [];

function addCheck(id, valid, message) {
  checks.push({ id, status: valid ? "pass" : "fail", message });
}

for (const relativePath of requiredPaths) {
  const exists = fs.existsSync(path.join(root, relativePath));
  addCheck(`path:${relativePath}`, exists, exists ? "Path exists." : "Required path is missing.");
}

let manifest = null;
try {
  manifest = JSON.parse(
    fs.readFileSync(path.join(root, "src/data/teoyubeworld-media-manifest.json"), "utf8")
  );
  addCheck("manifest:json", true, "Runtime manifest parses as JSON.");
} catch (error) {
  addCheck("manifest:json", false, `Runtime manifest could not be parsed: ${error.message}`);
}

addCheck(
  "manifest:records",
  Array.isArray(manifest?.records) && manifest.records.length === 0,
  "Runtime manifest records must be an empty array."
);
addCheck(
  "manifest:recordCount",
  manifest?.recordCount === 0,
  "Runtime manifest recordCount must be 0."
);

const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8").replace(/\\/g, "/");
addCheck(
  "gitignore:originals",
  gitignore.includes("/media-source/teoyubeworld/originals/"),
  "Immutable original media is ignored."
);
addCheck(
  "gitignore:generated",
  gitignore.includes("/generated/teoyubeworld-media/"),
  "Generated media analysis output is ignored."
);
addCheck(
  "gitignore:temporary",
  gitignore.includes("/.media-tmp/"),
  "Temporary media processing output is ignored."
);

const serverSource = fs.readFileSync(path.join(root, "server.js"), "utf8");
const protectedPrefixes = ["/media-source", "/generated", "/.git", "/.media-tmp"];
const serverProtectionPresent =
  serverSource.includes("isProtectedRequestPath(pathname)") &&
  protectedPrefixes.every((prefix) => serverSource.includes(`\"${prefix}\"`));
addCheck(
  "server:protected-paths",
  serverProtectionPresent,
  "Static server denies protected source, generated, Git, and temporary paths."
);

const failedChecks = checks.filter((check) => check.status === "fail");
const report = {
  phase: "11.6C-media-workspace-preparation",
  valid: failedChecks.length === 0,
  requiredPathCount: requiredPaths.length,
  mediaTouched: false,
  runtimeManifestRecordCount: manifest?.recordCount ?? null,
  checks
};

console.log(JSON.stringify(report, null, 2));
if (failedChecks.length) process.exitCode = 1;
