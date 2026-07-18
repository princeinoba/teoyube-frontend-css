const path = require("path");
const { generatedRoot, writeJson } = require("./lib/teoyubeWorldReviewPatches.cjs");
const { createPilotPlan } = require("./planTeoyubeWorldPilot.cjs");

function createDerivativePlan(plan = createPilotPlan()) {
  const commands = plan.selectedMediaIds.flatMap((mediaId) => [
    { mediaId, profile: "short-720p", command: `ffmpeg -i <protected-source:${mediaId}> -vf scale=-2:720 -movflags +faststart <generated-preview:${mediaId}-720p.mp4>` },
    { mediaId, profile: "mobile-480p", command: `ffmpeg -i <protected-source:${mediaId}> -vf scale=-2:480 -movflags +faststart <generated-preview:${mediaId}-480p.mp4>` },
    { mediaId, profile: "poster-webp", command: `ffmpeg -i <protected-source:${mediaId}> -frames:v 1 <generated-poster:${mediaId}.webp>` }
  ]);
  const blockers = [...plan.blockers];
  return {
    schemaVersion: "1.0.0",
    phase: "11.6C.2B",
    lifecycleState: plan.status === "blocked" ? "blocked" : "derivative_plan_ready",
    mode: "dry-run",
    status: blockers.length ? "blocked" : "planned",
    ffmpegAvailabilityProbed: false,
    ffprobeAvailabilityProbed: false,
    processExecutionAttempted: false,
    autoInstallAttempted: false,
    selectedRecordCount: plan.selectedMediaIds.length,
    plannedCommandCount: commands.length,
    commands,
    blockers: [...new Set(blockers)],
    commandsExecuted: 0,
    originalsModified: 0,
    publicFilesCopied: 0,
    browserFacingDerivativesCreated: 0,
    expectedDerivativeRecords: plan.selectedMediaIds.map((mediaId) => ({
      mediaId,
      expectedProfiles: ["short-720p", "mobile-480p", "poster-webp"],
      validationExpectations: ["checksum", "browser_decode", "dimensions", "duration", "no_absolute_source_path"]
    })),
    projectedFileSizes: {
      estimatedPublicBytes: plan.estimatedPublicBytes,
      estimatedProcessingStorageBytes: plan.estimatedProcessingStorageBytes
    },
    warning: "Command strings are inert previews. Planning does not probe tools, resolve source paths, execute processes, copy, transcode, or publish media."
  };
}

function run(options = {}) {
  const directExecutionRequested = process.argv.includes("--execute") || options.execute === true;
  const report = createDerivativePlan(options.plan);
  if (directExecutionRequested) {
    report.status = "blocked";
    report.lifecycleState = "blocked";
    report.blockers = [...report.blockers, "Direct derivative execution is disabled. Separate owner execution authorization is required."];
    report.directExecutionRequestRejected = true;
  }
  writeJson(path.join(generatedRoot, "reports", "teoyubeworld-pilot-derivative-plan.json"), report);
  console.log(JSON.stringify(report, null, 2));
  if (directExecutionRequested) process.exitCode = 2;
  return report;
}

if (require.main === module) run();
module.exports = { createDerivativePlan, run };
