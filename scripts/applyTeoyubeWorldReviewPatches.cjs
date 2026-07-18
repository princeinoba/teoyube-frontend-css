const fs = require("fs");
const path = require("path");
const {
  reportsRoot, reviewedManifestPath, loadReviewWorkspace, applyPatches, writeJson
} = require("./lib/teoyubeWorldReviewPatches.cjs");

function markdown(report) {
  const rows = report.patchValidations.map((item) => `| ${item.name} | ${item.valid ? "Valid" : "Invalid"} | ${item.operationCount} | ${item.errors.length} |`).join("\n");
  return `# TeoyubeWorld Review Patch Application\n\n- Mode: ${report.mode}\n- Valid: ${report.valid}\n- Operations applied in preview: ${report.operationCount}\n- Reviewed records: ${report.reviewedRecordCount}\n- Runtime manifest updated: no\n- Originals modified: no\n\n| Patch | Status | Operations | Errors |\n| --- | --- | ---: | ---: |\n${rows}\n\n${report.warnings.map((item) => `- ${item}`).join("\n")}\n`;
}

function run() {
  const args = new Set(process.argv.slice(2));
  const mode = args.has("--summary") ? "summary" : args.has("--validate") ? "validate" : args.has("--write") ? "write" : "dry-run";
  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const result = applyPatches(manifest, patches, sourceChecksum);
  const report = {
    phase: "11.6C.2A",
    mode,
    valid: result.valid,
    sourceDraftManifestChecksum: sourceChecksum,
    patchValidations: result.validations,
    operationCount: result.history.length,
    patchedRecordCount: result.manifest.patchedRecordCount,
    reviewedRecordCount: result.manifest.reviewedRecordCount,
    outputWritten: false,
    runtimeManifestUpdated: false,
    originalsModified: 0,
    warnings: []
  };
  if (!result.valid) report.warnings.push("Invalid patches must be corrected before a reviewed merge can be written.");
  if (mode === "write") {
    if (!result.valid || result.history.length === 0) {
      report.valid = false;
      report.warnings.push("Write refused: at least one valid owner review operation is required.");
    } else {
      writeJson(reviewedManifestPath, result.manifest);
      report.outputWritten = true;
    }
  } else if (mode === "dry-run") {
    report.warnings.push("Dry run only. Use --write after valid owner patches exist.");
  }
  writeJson(path.join(reportsRoot, "review-patch-application.json"), report);
  fs.writeFileSync(path.join(reportsRoot, "review-patch-application.md"), markdown(report), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
  return report;
}

if (require.main === module) run();
module.exports = { run };
